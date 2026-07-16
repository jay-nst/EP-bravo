import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { confirmPayment, cancelPayment, TossError } from '@/lib/toss/client';
import { invokeLambdaClip } from '@/lib/aws/lambda';
import { requireAuth } from '@/lib/auth';
import { badRequest, unsupportedMediaType, notFound, serverError, apiError } from '@/lib/api-error';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const confirmSchema = z.object({
  paymentKey: z.string(),
  orderId: z.string().uuid(),
  amount: z.number().positive(),
});

/**
 * F1: 2-step payment flow (transaction-wrapped)
 * 1. claim_order_for_payment RPC (atomic: verify + lock + payment record)
 * 2. Toss confirm (external)
 * 3. Lambda clipping (external)
 * 4. complete_order_after_clip RPC (atomic: order + payment + download)
 *    or fail_order_and_refund RPC on failure
 */
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { userId } = auth.user;

  const rl = checkRateLimit(`payment:${userId}`, RATE_LIMITS.payment);
  if (!rl.allowed) {
    return apiError('결제 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return unsupportedMediaType();
  }

  const body = await request.json();
  const parsed = confirmSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest('잘못된 요청', parsed.error.flatten());
  }

  const { paymentKey, orderId, amount } = parsed.data;
  const admin = createAdminClient();

  // Step 1: Atomically claim order (SELECT FOR UPDATE + status transition + payment record)
  const { data: claimResult, error: claimError } = await admin.rpc(
    'claim_order_for_payment',
    {
      p_order_id: orderId,
      p_user_id: userId,
      p_payment_key: paymentKey,
      p_amount: amount,
    },
  );

  if (claimError || !claimResult?.success) {
    if (claimResult?.error === 'amount_mismatch') {
      return badRequest('결제 금액이 일치하지 않습니다');
    }
    return notFound('주문을 찾을 수 없거나 이미 처리된 주문입니다');
  }

  // Step 2: Confirm payment with Toss (external call)
  try {
    await confirmPayment({ paymentKey, orderId, amount });
  } catch (error) {
    // Toss confirmation failed — revert order
    await admin.rpc('fail_order_and_refund', {
      p_order_id: orderId,
      p_error_message: error instanceof TossError ? error.message : 'Toss 결제 확인 실패',
      p_refund_status: 'failed',
    });

    if (error instanceof TossError) {
      return apiError(`결제 실패: ${error.message}`, 400, { code: error.code });
    }
    return serverError('결제 처리 실패');
  }

  // Step 3: Update status to processing and trigger Lambda clipping
  await admin
    .from('orders')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', orderId);

  // Fetch catalog item for COG URL
  const { data: catalogItem } = await admin
    .from('imagery_catalog')
    .select('cog_url')
    .eq('id', claimResult.catalog_item_id)
    .single();

  if (!catalogItem) {
    await handleClipFailure(admin, orderId, paymentKey, '카탈로그 항목을 찾을 수 없습니다');
    return NextResponse.json(
      { status: 'refunded', orderId, message: '카탈로그 오류로 자동 환불되었습니다' },
      { status: 200 },
    );
  }

  const outputBucket = process.env.CLIP_OUTPUT_BUCKET || 'earthpaper-clips';
  const outputKey = `clips/${userId}/${orderId}.tif`;

  const clipResult = await invokeLambdaClip({
    cogUrl: catalogItem.cog_url,
    aoi: claimResult.aoi,
    outputBucket,
    outputKey,
  });

  if (!clipResult.success) {
    await handleClipFailure(admin, orderId, paymentKey, clipResult.error || '클리핑 처리 실패');
    return NextResponse.json(
      { status: 'refunded', orderId, message: '클리핑 실패로 자동 환불되었습니다' },
      { status: 200 },
    );
  }

  // Step 4: Atomically complete order + confirm payment + create download
  const clipResultUrl = `s3://${outputBucket}/${outputKey}`;
  const { data: completeResult, error: completeError } = await admin.rpc(
    'complete_order_after_clip',
    {
      p_order_id: orderId,
      p_user_id: userId,
      p_clip_result_url: clipResultUrl,
      p_file_size: clipResult.fileSize ?? 0,
    },
  );

  if (completeError || !completeResult?.success) {
    return serverError('주문 완료 처리 실패');
  }

  return NextResponse.json({
    status: 'completed',
    orderId,
    message: '결제 및 클리핑 완료',
  });
}

async function handleClipFailure(
  admin: ReturnType<typeof createAdminClient>,
  orderId: string,
  paymentKey: string,
  errorMessage: string,
) {
  // Atomically mark order as failed
  await admin.rpc('fail_order_and_refund', {
    p_order_id: orderId,
    p_error_message: errorMessage,
    p_refund_status: 'refund_queued',
  });

  // Attempt immediate refund via Toss (external)
  try {
    await cancelPayment({
      paymentKey,
      cancelReason: '영상 클리핑 처리 실패로 인한 자동 환불',
    });

    await admin.rpc('fail_order_and_refund', {
      p_order_id: orderId,
      p_error_message: errorMessage,
      p_refund_status: 'refunded',
    });
  } catch {
    // Refund failed — stays in refund_queued for manual processing
  }
}
