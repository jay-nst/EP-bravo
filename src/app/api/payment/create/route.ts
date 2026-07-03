import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculatePrice, validateAoi, calculateAreaKm2 } from '@/lib/geo';
import type { SatelliteType } from '@/types/database';
import { DEMO_USER } from '@/lib/demo-user';

const createOrderSchema = z.object({
  catalogItemId: z.string().uuid(),
  aoi: z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
  }),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER.id;

  // Parse and validate request body
  const body = await request.json();
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: '잘못된 요청', details: parsed.error.flatten() },
      { status: 400 },
    );
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
    return NextResponse.json(
      { error: '영상을 찾을 수 없습니다' },
      { status: 404 },
    );
  }

  const satellite = catalogItem.satellite as SatelliteType;
  const areaKm2 = calculateAreaKm2(polygon);

  // AOI validation gate (pre-payment, prevents F4 scenario)
  const validationError = validateAoi(areaKm2, satellite);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
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
    return NextResponse.json(
      { error: '주문 생성 실패', details: orderError?.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    orderId: order.id,
    amount: totalPrice,
    orderName: `${catalogItem.satellite} 위성영상 (${areaKm2}km²)`,
  });
}
