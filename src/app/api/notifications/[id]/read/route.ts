import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// PATCH: Mark notification as read
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: '알림 업데이트 실패' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
