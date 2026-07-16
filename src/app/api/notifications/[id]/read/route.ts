import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';
import { serverError } from '@/lib/api-error';

// PATCH: Mark notification as read
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { userId } = auth.user;

  const { id } = await params;
  const admin = createAdminClient();

  const { error } = await admin
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    return serverError('알림 업데이트 실패');
  }

  return NextResponse.json({ success: true });
}
