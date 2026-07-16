import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/auth';

const saveSchema = z.object({
  sessionId: z.string().uuid(),
  content: z.string().min(1),
  tokens: z.number().int().min(0),
});

// POST: Save assistant response after streaming completes
export async function POST(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const { userId } = auth.user;

  const body = await request.json();
  const parsed = saveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: '잘못된 요청' },
      { status: 400 },
    );
  }

  const { sessionId, content, tokens } = parsed.data;
  const admin = createAdminClient();

  // Save assistant message
  await admin.from('chat_messages').insert({
    session_id: sessionId,
    role: 'assistant',
    content,
    tokens,
  });

  // Update session tokens and timestamp
  await admin
    .from('chat_sessions')
    .update({
      tokens_used: tokens,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);

  // Update user token usage
  await admin.rpc('increment_chat_tokens', {
    user_id: userId,
    token_count: tokens,
  });

  return NextResponse.json({ saved: true });
}
