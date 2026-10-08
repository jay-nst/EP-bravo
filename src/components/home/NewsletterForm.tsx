'use client';

import { useState } from 'react';
import { Form } from '@base-ui/react/form';
import { Button, Field, Input } from '@naraspace-technology/nds/components';
import { trackEvent } from '@/lib/analytics';

// NDS 폼 패턴 — LeadCaptureModal 참조 구현과 같은 Base UI Form + Field.Root validate + Field.Error
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validateEmail = (value: unknown) => {
  const v = String(value ?? '').trim();
  if (!v) return '이메일을 입력해주세요.';
  return EMAIL_RE.test(v) ? null : '이메일 형식을 확인해주세요.';
};

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  // Form 이 validate 를 통과시켰을 때만 호출된다 (preventDefault 는 Form 이 처리)
  const handleSubmit = async () => {
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
      <p className="text-body-sm-regular text-status-success py-8">
        구독 완료! 매주 위성 뉴스를 보내드릴게요.
      </p>
    );
  }

  return (
    <Form className="flex items-start gap-8 w-full sm:w-auto" onFormSubmit={handleSubmit}>
      <Field.Root name="email" validate={validateEmail} className="flex-1 sm:w-224">
        {/* 원래 화면에 라벨이 없어 시각적으로만 숨긴다 — 입력 이름은 스크린리더에 전달 */}
        <Field.Label className="sr-only">이메일 주소</Field.Label>
        <Input
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Field.Error />
      </Field.Root>
      <Button type="submit" loading={status === 'submitting'}>
        {status === 'error' ? '재시도' : '구독'}
      </Button>
    </Form>
  );
}
