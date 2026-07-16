import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { serverError } from '@/lib/api-error';

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { supabase } = auth.user;

  const { searchParams } = req.nextUrl;
  const page = Math.max(Number(searchParams.get('page') ?? 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? 20), 1), 100);
  const offset = (page - 1) * limit;

  const { data: orders, error, count } = await supabase
    .from('orders')
    .select('id, catalog_item_id, aoi_area_km2, status, total_price, clip_result_url, error_message, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return serverError('주문 조회 실패');
  }

  return NextResponse.json({
    orders: orders ?? [],
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  });
}
