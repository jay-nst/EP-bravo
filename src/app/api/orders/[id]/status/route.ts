import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { userId, supabase } = auth.user;

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, clip_result_url, error_message, updated_at')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: '주문을 찾을 수 없습니다' },
      { status: 404 },
    );
  }

  return NextResponse.json({ order });
}
