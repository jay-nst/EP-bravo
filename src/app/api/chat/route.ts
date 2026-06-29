import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateUserInput, getSystemPrompt } from '@/lib/llm/security';
import { streamChat } from '@/lib/llm/provider';
import { CHAT_LIMITS } from '@/constants/satellite';

const chatSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string(),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: '잘못된 요청', details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { sessionId, message } = parsed.data;

  // F8 Defense 1+2: Input validation + prompt injection check
  const security = validateUserInput(message);
  if (!security.safe) {
    return NextResponse.json({ error: security.error }, { status: 400 });
  }

  const admin = createAdminClient();

  // Check token limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, chat_tokens_used, chat_tokens_limit')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: '프로필을 찾을 수 없습니다' }, { status: 404 });
  }

  const limit = CHAT_LIMITS[profile.plan] || CHAT_LIMITS.free;
  if (profile.chat_tokens_used >= limit) {
    return NextResponse.json(
      { error: `채팅 토큰 한도에 도달했습니다 (${limit} 토큰)` },
      { status: 429 },
    );
  }

  // Verify session belongs to user
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: '채팅 세션을 찾을 수 없습니다' },
      { status: 404 },
    );
  }

  // Save user message
  await admin.from('chat_messages').insert({
    session_id: sessionId,
    role: 'user',
    content: message,
    tokens: 0,
  });

  // Load conversation history (last 20 messages for context window)
  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(20);

  const messages = (history || []).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // F8 Defense 3: System prompt isolation (hardcoded, never from user)
  const systemPrompt = getSystemPrompt();

  try {
    const stream = await streamChat({
      system: systemPrompt,
      messages,
      maxTokens: 1024,
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: '응답 생성 중 오류가 발생했습니다',
        details: err instanceof Error ? err.message : 'Unknown',
      },
      { status: 500 },
    );
  }
}
