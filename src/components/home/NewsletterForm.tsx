'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/analytics';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'submitting') return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), vertical: 'newsletter' }),
      });
      if (!res.ok) throw new Error();
      trackEvent('form_submit', 'newsletter_subscribe', {});
      setStatus('done');
      setEmail('');
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (status === 'done') {
    return (
      <p className="text-sm py-2" style={{ color: 'var(--accent)' }}>
        구독 완료! 매주 위성 뉴스를 보내드릴게요.
      </p>
    );
  }

  return (
    <form className="flex gap-2 w-full sm:w-auto" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        placeholder="이메일 주소"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 sm:w-56 px-3 py-2 rounded-md text-sm"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="px-4 py-2 rounded-md text-sm font-medium"
        style={{
          background: status === 'submitting' ? 'var(--surface)' : 'var(--accent)',
          color: status === 'submitting' ? 'var(--text-muted)' : '#0E0E10',
        }}
      >
        {status === 'submitting' ? '...' : status === 'error' ? '재시도' : '구독'}
      </button>
    </form>
  );
}
