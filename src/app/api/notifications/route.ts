import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: List user's notifications
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: '알림 조회 실패' },
      { status: 500 },
    );
  }

  return NextResponse.json({ notifications });
}
