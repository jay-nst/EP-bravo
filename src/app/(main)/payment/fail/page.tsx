'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@naraspace-technology/nds/components';
import { IconX } from '@naraspace-technology/nds/icons';

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-16">
      <div className="flex size-48 items-center justify-center rounded-full bg-status-danger-subtle text-status-danger-bold">
        <IconX className="size-24" />
      </div>
      <h2 className="text-heading-3xl text-text-primary">
        결제 실패
      </h2>
      <p className="text-body-md-regular text-text-secondary">
        {message || '결제가 취소되었거나 오류가 발생했습니다'}
      </p>
      {code && (
        <p className="text-body-xs-regular tabular-nums text-text-tertiary">
          오류 코드: {code}
        </p>
      )}
      <Button className="mt-16" render={<Link href="/map" />} nativeButton={false}>
        다시 시도하기
      </Button>
    </div>
  );
}
