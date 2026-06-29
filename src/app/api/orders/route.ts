import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      payments (status, amount, pg_payment_key),
      downloads (id, file_url, expires_at, downloaded)
    `,
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: '주문 목록 조회 실패' },
      { status: 500 },
    );
  }

  return NextResponse.json({ orders });
}
