'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Spinner } from '@naraspace-technology/nds/components';
import { IconAlertCircle, IconCheck, IconX } from '@naraspace-technology/nds/icons';

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
      <div className="flex-1 flex flex-col items-center justify-center gap-16">
        <Spinner aria-label="결제 확인 중" />
        <p className="text-body-md-regular text-text-tertiary">결제 확인 및 영상 클리핑 처리 중...</p>
        <p className="text-body-xs-regular text-text-tertiary">잠시만 기다려주세요</p>
      </div>
    );
  }

  if (result.status === 'completed') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-16">
        <div className="flex size-48 items-center justify-center rounded-full bg-status-success/10 text-status-success">
          <IconCheck className="size-24" />
        </div>
        <h2 className="text-heading-xl text-text-primary">
          결제 및 클리핑 완료
        </h2>
        <p className="text-body-sm-regular text-text-tertiary">
          영상이 준비되었습니다
        </p>
        <div className="mt-16 flex gap-12">
          <Button render={<Link href="/portal" />} nativeButton={false}>
            내 주문에서 다운로드
          </Button>
          <Button variant="outline" render={<Link href="/map" />} nativeButton={false}>
            지도로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  if (result.status === 'refunded') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-16">
        <div className="flex size-48 items-center justify-center rounded-full bg-status-warning/10 text-status-warning">
          <IconAlertCircle className="size-24" />
        </div>
        <h2 className="text-heading-xl text-text-primary">
          클리핑 실패 - 자동 환불
        </h2>
        <p className="text-body-sm-regular text-text-tertiary">{result.message}</p>
        <Button className="mt-16" render={<Link href="/map" />} nativeButton={false}>
          다시 시도하기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-16">
      <div className="flex size-48 items-center justify-center rounded-full bg-status-danger/10 text-status-danger">
        <IconX className="size-24" />
      </div>
      <h2 className="text-heading-xl text-text-primary">
        결제 처리 실패
      </h2>
      <p className="text-body-sm-regular text-text-tertiary">{result.message}</p>
      <Button className="mt-16" variant="outline" render={<Link href="/map" />} nativeButton={false}>
        지도로 돌아가기
      </Button>
    </div>
  );
}
