import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEMO_USER } from '@/lib/demo-user';

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER.id;

  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      payments (status, amount, pg_payment_key),
      downloads (id, file_url, expires_at, downloaded)
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: '주문 목록 조회 실패' },
      { status: 500 },
    );
  }

  return NextResponse.json({ orders });
}
