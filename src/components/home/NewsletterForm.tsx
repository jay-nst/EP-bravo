'use client';

import { trackEvent } from '@/lib/analytics';

export default function NewsletterForm() {
  return (
    <form
      className="flex gap-2 w-full sm:w-auto"
      onSubmit={(e) => {
        e.preventDefault();
        trackEvent('form_submit', 'newsletter_subscribe', {});
      }}
    >
      <input
        type="email"
        placeholder="이메일 주소"
        className="flex-1 sm:w-56 px-3 py-2 rounded-md text-sm"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      />
      <button
        type="submit"
        className="px-4 py-2 rounded-md text-sm font-medium"
        style={{ background: 'var(--accent)', color: '#0E0E10' }}
      >
        구독
      </button>
    </form>
  );
}
