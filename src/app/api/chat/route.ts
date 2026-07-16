import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateUserInput, getSystemPrompt } from '@/lib/llm/security';
import { streamChat } from '@/lib/llm/provider';
import { CHAT_LIMITS } from '@/constants/satellite';
import { requireAuth } from '@/lib/auth';
import { badRequest, notFound, serverError, apiError } from '@/lib/api-error';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

const chatSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string(),
});

export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { userId, supabase } = auth.user;

  const rl = checkRateLimit(`chat:${userId}`, RATE_LIMITS.chat);
  if (!rl.allowed) {
    return apiError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.', 429);
  }

  const body = await request.json();
  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest('잘못된 요청', parsed.error.flatten());
  }

  const { sessionId, message } = parsed.data;

  // F8 Defense 1+2: Input validation + prompt injection check
  const security = validateUserInput(message);
  if (!security.safe) {
    return badRequest(security.error ?? '유효하지 않은 입력입니다');
  }

  const admin = createAdminClient();

  // Check token limits
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, chat_tokens_used, chat_tokens_limit')
    .eq('id', userId)
    .single();

  if (!profile) {
    return notFound('프로필을 찾을 수 없습니다');
  }

  const tokenLimit = CHAT_LIMITS[profile.plan] || CHAT_LIMITS.free;
  if (profile.chat_tokens_used >= tokenLimit) {
    return apiError(`채팅 토큰 한도에 도달했습니다 (${tokenLimit} 토큰)`, 429);
  }

  // Verify session belongs to user
  const { data: session, error: sessionError } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .single();

  if (sessionError || !session) {
    return notFound('채팅 세션을 찾을 수 없습니다');
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

    let totalBytes = 0;
    const countingStream = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        totalBytes += chunk.byteLength;
        controller.enqueue(chunk);
      },
      flush() {
        const estimatedTokens = Math.ceil(totalBytes / 4);
        if (estimatedTokens > 0) {
          admin.rpc('increment_chat_tokens', {
            user_id: userId,
            token_count: estimatedTokens,
          }).then(() => {}, () => {});
        }
      },
    });

    const trackedStream = stream.pipeThrough(countingStream);

    return new Response(trackedStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    return serverError(
      '응답 생성 중 오류가 발생했습니다',
      err instanceof Error ? err.message : undefined,
    );
  }
}
