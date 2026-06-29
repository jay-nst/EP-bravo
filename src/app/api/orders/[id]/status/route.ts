import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select('id, status, clip_result_url, error_message, updated_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !order) {
    return NextResponse.json(
      { error: '주문을 찾을 수 없습니다' },
      { status: 404 },
    );
  }

  return NextResponse.json({ order });
}
