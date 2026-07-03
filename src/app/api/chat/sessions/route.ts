import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DEMO_USER } from '@/lib/demo-user';

// GET: List user's chat sessions
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER.id;

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: '세션 목록 조회 실패' },
      { status: 500 },
    );
  }

  return NextResponse.json({ sessions });
}

// POST: Create a new chat session
export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? DEMO_USER.id;

  const admin = createAdminClient();
  const { data: session, error } = await admin
    .from('chat_sessions')
    .insert({
      user_id: userId,
      title: '새 대화',
    })
    .select()
    .single();

  if (error || !session) {
    return NextResponse.json(
      { error: '세션 생성 실패' },
      { status: 500 },
    );
  }

  return NextResponse.json({ session });
}
