'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type ResultState =
  | { status: 'loading' }
  | { status: 'completed'; orderId: string }
  | { status: 'refunded'; orderId: string; message: string }
  | { status: 'error'; message: string };

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<ResultState>({ status: 'loading' });

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    if (!paymentKey || !orderId || !amount) {
      setResult({ status: 'error', message: '결제 정보가 올바르지 않습니다' });
      return;
    }

    confirmPayment(paymentKey, orderId, Number(amount));
  }, [searchParams]);

  const confirmPayment = async (
    paymentKey: string,
    orderId: string,
    amount: number,
  ) => {
    try {
      const res = await fetch('/api/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentKey, orderId, amount }),
      });

      const data = await res.json();

      if (data.status === 'completed') {
        setResult({ status: 'completed', orderId: data.orderId });
      } else if (data.status === 'refunded') {
        setResult({
          status: 'refunded',
          orderId: data.orderId,
          message: data.message,
        });
      } else {
        setResult({
          status: 'error',
          message: data.error || data.message || '결제 처리 실패',
        });
      }
    } catch {
      setResult({ status: 'error', message: '결제 확인 중 오류가 발생했습니다' });
    }
  };

  if (result.status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
        <p style={{ color: 'var(--text-muted)' }}>결제 확인 및 영상 클리핑 처리 중...</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>잠시만 기다려주세요</p>
      </div>
    );
  }

  if (result.status === 'completed') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'rgba(74, 158, 107, 0.1)', color: 'var(--success)' }}
        >
          ✓
        </div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          결제 및 클리핑 완료
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          영상이 준비되었습니다
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            href="/portal"
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--accent)', color: '#0E0E10' }}
          >
            내 주문에서 다운로드
          </Link>
          <Link
            href="/map"
            className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            지도로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (result.status === 'refunded') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ background: 'rgba(200, 146, 58, 0.1)', color: 'var(--warning)' }}
        >
          !
        </div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
          클리핑 실패 - 자동 환불
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{result.message}</p>
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
        style={{ background: 'rgba(196, 92, 74, 0.1)', color: 'var(--error)' }}
      >
        ✕
      </div>
      <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>
        결제 처리 실패
      </h2>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{result.message}</p>
      <Link
        href="/map"
        className="mt-4 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        지도로 돌아가기
      </Link>
    </div>
  );
}
