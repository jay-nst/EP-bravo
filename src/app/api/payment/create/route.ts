import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculatePrice, validateAoi, calculateAreaKm2 } from '@/lib/geo';
import type { SatelliteType } from '@/types/database';
import { requireAuth } from '@/lib/auth';
import { badRequest, notFound, unsupportedMediaType, serverError, apiError } from '@/lib/api-error';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const createOrderSchema = z.object({
  catalogItemId: z.string().uuid(),
  aoi: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { userId, supabase } = auth.user;

  const rl = checkRateLimit(`payment:${userId}`, RATE_LIMITS.payment);
  if (!rl.allowed) {
    return apiError('결제 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return unsupportedMediaType();
  }

  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest('잘못된 요청', parsed.error.flatten());
  }

  const { catalogItemId, aoi } = parsed.data;
  const polygon = aoi as GeoJSON.Polygon;

  // Fetch catalog item to get satellite type and pricing
  const { data: catalogItem, error: catalogError } = await supabase
    .from('imagery_catalog')
    .select('*')
    .eq('id', catalogItemId)
    .single();

  if (catalogError || !catalogItem) {
    return notFound('영상을 찾을 수 없습니다');
  }

  const satellite = catalogItem.satellite as SatelliteType;
  const areaKm2 = calculateAreaKm2(polygon);

  // AOI validation gate (pre-payment, prevents F4 scenario)
  const validationError = validateAoi(areaKm2, satellite);
  if (validationError) {
    return badRequest(validationError);
  }

  const totalPrice = calculatePrice(areaKm2, satellite);

  // Create order with admin client (bypasses RLS for insert)
  const admin = createAdminClient();
  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: userId,
      catalog_item_id: catalogItemId,
      aoi: polygon,
      aoi_area_km2: areaKm2,
      status: 'pending',
      total_price: totalPrice,
    })
    .select()
    .single();

  if (orderError || !order) {
    return serverError('주문 생성 실패', orderError?.message);
  }

  return NextResponse.json({
    orderId: order.id,
    amount: totalPrice,
    orderName: `${catalogItem.satellite} 위성영상 (${areaKm2}km²)`,
  });
}
