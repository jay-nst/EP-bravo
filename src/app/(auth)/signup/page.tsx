'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm text-center space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
            이메일을 확인해주세요
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text)' }}>{email}</span>으로 인증 링크를
            보냈습니다. 이메일을 확인하여 가입을 완료해주세요.
          </p>
          <Link href="/login" className="inline-block text-sm" style={{ color: 'var(--accent)' }}>
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const inputStyle = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
    '--tw-ring-color': 'var(--accent)',
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{ background: 'var(--bg)' }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(27,191,168,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="text-2xl font-semibold tracking-tight inline-flex items-center gap-2.5 justify-center" style={{ color: 'var(--text)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="var(--accent)" strokeWidth="1" transform="rotate(-30 12 12)" opacity="0.6" />
              <circle cx="18.5" cy="7" r="1.5" fill="var(--accent)" opacity="0.8" />
            </svg>
            EARTHPAPER
          </Link>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            새 계정 만들기
          </p>
          <div
            className="mt-3 mx-auto"
            style={{
              width: '32px',
              height: '2px',
              background: 'var(--accent)',
              borderRadius: '1px',
              opacity: 0.6,
            }}
          />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              이름
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors"
              style={inputStyle}
              placeholder="홍길동"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              이메일
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors"
              style={inputStyle}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 transition-colors"
              style={inputStyle}
              placeholder="6자 이상"
            />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--accent)', color: '#0E0E10' }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          이미 계정이 있으신가요?{' '}
          <Link href="/login" style={{ color: 'var(--accent)' }}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
