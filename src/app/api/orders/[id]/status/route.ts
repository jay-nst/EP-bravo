import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEMO_USER } from '@/lib/demo-user';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER.id;

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
