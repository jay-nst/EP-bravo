'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form } from '@base-ui/react/form';
import { Button, Field, Input } from '@naraspace-technology/nds/components';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form 이 필드 검증(required·type=email)을 통과시켰을 때만 호출된다
  const handleLogin = async () => {
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push('/map');
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-tertiary px-16">
      <div className="w-full max-w-sm space-y-32">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-10 text-heading-3xl text-text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="var(--accent)" strokeWidth="1" transform="rotate(-30 12 12)" opacity="0.6" />
              <circle cx="18.5" cy="7" r="1.5" fill="var(--accent)" opacity="0.8" />
            </svg>
            EARTHPAPER
          </Link>
          <p className="mt-8 text-body-md-regular text-text-secondary">
            위성 영상 셀프서비스 포털
          </p>
        </div>

        <Form onFormSubmit={handleLogin} className="flex flex-col gap-16">
          <Field.Root name="email">
            <Field.Label>이메일</Field.Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Field.Error />
          </Field.Root>

          <Field.Root name="password">
            <Field.Label>비밀번호</Field.Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Field.Error />
          </Field.Root>

          {error && (
            <p role="alert" className="text-body-sm-regular text-status-danger">{error}</p>
          )}

          <Button type="submit" display="block" loading={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </Form>

        <p className="text-center text-body-sm-regular text-text-secondary">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-text-interactive-primary">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
