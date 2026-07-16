import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AuthResult {
  userId: string;
  email: string;
  supabase: SupabaseClient;
}

type AuthResponse =
  | { ok: true; user: AuthResult }
  | { ok: false; response: NextResponse };

export async function requireAuth(): Promise<AuthResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: '인증이 필요합니다' },
        { status: 401 },
      ),
    };
  }

  return {
    ok: true,
    user: { userId: user.id, email: user.email ?? '', supabase },
  };
}
