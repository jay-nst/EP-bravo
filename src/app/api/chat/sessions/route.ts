import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET: List user's chat sessions
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', user.id)
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: session, error } = await admin
    .from('chat_sessions')
    .insert({
      user_id: user.id,
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
