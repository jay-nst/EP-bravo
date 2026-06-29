import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { confirmPayment, cancelPayment, TossError } from '@/lib/toss/client';
import { invokeLambdaClip } from '@/lib/aws/lambda';
import { generatePresignedUrl } from '@/lib/aws/s3';

const confirmSchema = z.object({
  paymentKey: z.string(),
  orderId: z.string().uuid(),
  amount: z.number().positive(),
});

/**
 * F1: 2-step payment flow
 * 1. Toss confirm (auth) → payment_held
 * 2. Lambda clipping → processing
 * 3. Success → completed (capture already done by Toss confirm)
 *    Failure → failed → refund_queued → refunded
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = confirmSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: '잘못된 요청', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { paymentKey, orderId, amount } = parsed.data;
  const admin = createAdminClient();

  // Verify order belongs to user and is in pending status
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: '주문을 찾을 수 없거나 이미 처리된 주문입니다' },
      { status: 404 },
    );
  }

  // Verify amount matches
  if (Number(order.total_price) !== amount) {
    return NextResponse.json(
      { error: '결제 금액이 일치하지 않습니다' },
      { status: 400 },
    );
  }

  // Step 1: Confirm payment with Toss
  try {
    const tossResponse = await confirmPayment({ paymentKey, orderId, amount });

    // Create payment record (held state)
    await admin.from('payments').insert({
      order_id: orderId,
      user_id: user.id,
      pg_payment_key: paymentKey,
      amount,
      status: 'held',
      held_at: new Date().toISOString(),
      pg_response: tossResponse,
    });

    // Update order to payment_held
    await admin
      .from('orders')
      .update({ status: 'payment_held', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    // Step 2: Trigger Lambda clipping
    await admin
      .from('orders')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', orderId);

    // Fetch catalog item for COG URL
    const { data: catalogItem } = await admin
      .from('imagery_catalog')
      .select('cog_url')
      .eq('id', order.catalog_item_id)
      .single();

    if (!catalogItem) {
      throw new Error('카탈로그 항목을 찾을 수 없습니다');
    }

    const outputBucket =
      process.env.CLIP_OUTPUT_BUCKET || 'earthpaper-clips';
    const outputKey = `clips/${user.id}/${orderId}.tif`;

    const clipResult = await invokeLambdaClip({
      cogUrl: catalogItem.cog_url,
      aoi: order.aoi,
      outputBucket,
      outputKey,
    });

    if (!clipResult.success) {
      throw new Error(clipResult.error || '클리핑 처리 실패');
    }

    const clipResultUrl = `s3://${outputBucket}/${outputKey}`;

    await admin
      .from('orders')
      .update({
        status: 'completed',
        clip_result_url: clipResultUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Confirm payment
    await admin
      .from('payments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    // Create download record with 7-day window
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await admin.from('downloads').insert({
      order_id: orderId,
      user_id: user.id,
      file_url: clipResultUrl,
      file_size: clipResult.fileSize,
      expires_at: expiresAt.toISOString(),
    });

    return NextResponse.json({
      status: 'completed',
      orderId,
      message: '결제 및 클리핑 완료',
    });
  } catch (error) {
    if (error instanceof TossError) {
      return NextResponse.json(
        { error: `결제 실패: ${error.message}`, code: error.code },
        { status: 400 },
      );
    }

    // Clipping failed — queue refund
    try {
      await admin
        .from('orders')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      await admin
        .from('payments')
        .update({ status: 'refund_queued' })
        .eq('order_id', orderId);

      // Attempt immediate refund
      await cancelPayment({
        paymentKey,
        cancelReason: '영상 클리핑 처리 실패로 인한 자동 환불',
      });

      await admin
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      await admin
        .from('orders')
        .update({ status: 'refunded', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      return NextResponse.json(
        {
          status: 'refunded',
          orderId,
          message: '클리핑 실패로 자동 환불되었습니다',
        },
        { status: 200 },
      );
    } catch (refundError) {
      // Refund failed — needs manual intervention
      return NextResponse.json(
        {
          status: 'refund_failed',
          orderId,
          message: '환불 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요.',
        },
        { status: 500 },
      );
    }
  }
}
