import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// GET: List user's notifications
export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { userId, supabase } = auth.user;

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
