'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        style={{ background: 'rgba(196, 92, 74, 0.1)', color: 'var(--error)' }}
      >
        ✕
      </div>
      <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
        결제 실패
      </h2>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {message || '결제가 취소되었거나 오류가 발생했습니다'}
      </p>
      {code && (
        <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          오류 코드: {code}
        </p>
      )}
      <Link
        href="/map"
        className="mt-4 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ background: 'var(--accent)', color: '#0E0E10' }}
      >
        다시 시도하기
      </Link>
    </div>
  );
}
