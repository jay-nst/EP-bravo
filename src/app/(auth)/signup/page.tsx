'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form } from '@base-ui/react/form';
import { Button, Field, Input } from '@naraspace-technology/nds/components';
import { createClient } from '@/lib/supabase/client';

// 색 기준 78e9433: 민트 CTA(accent 배경 + 어두운 글자), disabled 는 accent 50%
const MINT_CTA =
  'bg-bg-interactive-primary text-[#0E0E10] [&_svg]:text-[#0E0E10] not-data-disabled:data-active:not-hover:text-[#0E0E10] not-data-disabled:data-active:not-hover:[&_svg]:text-[#0E0E10] data-disabled:bg-bg-interactive-primary data-disabled:text-[#0E0E10] data-disabled:opacity-50';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form 이 필드 검증(required·type=email·minLength)을 통과시켰을 때만 호출된다
  const handleSignup = async () => {
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-tertiary px-16">
        <div className="w-full max-w-sm space-y-16 text-center">
          <h2 className="text-heading-3xl text-text-primary">
            이메일을 확인해주세요
          </h2>
          <p className="text-body-md-regular text-text-tertiary">
            <span className="text-text-primary">{email}</span>으로 인증 링크를
            보냈습니다. 이메일을 확인하여 가입을 완료해주세요.
          </p>
          <Link href="/login" className="inline-block text-body-md-regular text-text-interactive-primary">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg-tertiary px-16">
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(27,191,168,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10 w-full max-w-sm space-y-32">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-10 text-heading-3xl text-text-primary">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="var(--accent)" strokeWidth="1" transform="rotate(-30 12 12)" opacity="0.6" />
              <circle cx="18.5" cy="7" r="1.5" fill="var(--accent)" opacity="0.8" />
            </svg>
            EARTHPAPER
          </Link>
          <p className="mt-8 text-body-md-regular text-text-tertiary">
            새 계정 만들기
          </p>
          <div className="mx-auto mt-12 h-2 w-32 rounded-[1px] bg-bg-interactive-primary opacity-60" />
        </div>

        <Form onFormSubmit={handleSignup} className="flex flex-col gap-16">
          <Field.Root name="name">
            <Field.Label>이름</Field.Label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="bg-bg-secondary"
            />
            <Field.Error />
          </Field.Root>

          <Field.Root name="email">
            <Field.Label>이메일</Field.Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-bg-secondary"
            />
            <Field.Error />
          </Field.Root>

          <Field.Root name="password">
            <Field.Label>비밀번호</Field.Label>
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
              className="bg-bg-secondary"
            />
            <Field.Error />
          </Field.Root>

          {error && <p role="alert" className="text-body-sm-regular text-status-danger">{error}</p>}

          <Button type="submit" display="block" loading={loading} className={MINT_CTA}>
            {loading ? '가입 중...' : '회원가입'}
          </Button>
        </Form>

        <p className="text-center text-body-sm-regular text-text-tertiary">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-text-interactive-primary">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
