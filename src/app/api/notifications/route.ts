import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DEMO_USER } from '@/lib/demo-user';

// GET: List user's notifications
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER.id;

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
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
