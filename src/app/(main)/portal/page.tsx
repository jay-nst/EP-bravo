'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Spinner, StatusChip, type StatusChipProps } from '@naraspace-technology/nds/components';
import { IconGlobe } from '@naraspace-technology/nds/icons';
import { fmtNum } from '@/lib/format';

interface OrderWithRelations {
  id: string;
  catalog_item_id: string;
  aoi_area_km2: number;
  status: string;
  total_price: number;
  clip_result_url: string | null;
  error_message: string | null;
  created_at: string;
  payments: { status: string; amount: number }[];
  downloads: {
    id: string;
    file_url: string;
    expires_at: string;
    downloaded: boolean;
  }[];
}

// 주문 상태 → NDS StatusChip status (기존 색 의미: warning·accent·success·error·muted)
// cls: 색 기준 78e9433 — 배경 없이 상태 색 글자 (warning·accent·success·error·muted)
const STATUS_LABELS: Record<string, { text: string; status: StatusChipProps['status']; cls: string }> = {
  pending: { text: '대기중', status: 'warning', cls: 'bg-transparent text-status-warning [&>svg]:text-status-warning' },
  payment_held: { text: '결제 확인', status: 'brand', cls: 'bg-transparent text-text-interactive-primary [&>svg]:text-text-interactive-primary' },
  processing: { text: '처리중', status: 'brand', cls: 'bg-transparent text-text-interactive-primary [&>svg]:text-text-interactive-primary' },
  completed: { text: '완료', status: 'success', cls: 'bg-transparent text-status-success [&>svg]:text-status-success' },
  failed: { text: '실패', status: 'error', cls: 'bg-transparent text-status-danger [&>svg]:text-status-danger' },
  refunded: { text: '환불됨', status: 'neutral', cls: 'bg-transparent text-text-tertiary [&>svg]:text-text-tertiary' },
};

/** 민트 CTA (accent 배경 + 어두운 글자) */
const MINT_CTA =
  'bg-bg-interactive-primary text-[#0E0E10] [&_svg]:text-[#0E0E10] not-data-disabled:data-active:not-hover:text-[#0E0E10] not-data-disabled:data-active:not-hover:[&_svg]:text-[#0E0E10]';

export default function PortalPage() {
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('주문 목록을 불러올 수 없습니다');
      const data = await res.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류 발생');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (orderId: string) => {
    try {
      const res = await fetch(`/api/download/${orderId}`);
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || '다운로드 실패');
        return;
      }
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch {
      alert('다운로드 중 오류가 발생했습니다');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-8">
        <Spinner size="sm" aria-label="주문 내역 로딩 중" className="text-text-interactive-primary" />
        <p className="text-body-md-regular text-text-tertiary">주문 내역 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-body-md-regular text-status-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-16 py-32">
      <h1 className="mb-24 text-heading-3xl text-text-primary md:text-display-md">
        내 주문
      </h1>

      {orders.length === 0 ? (
        <div className="space-y-12 py-64 text-center">
          <div className="mx-auto flex size-56 items-center justify-center rounded-full bg-bg-secondary">
            <IconGlobe className="size-24 text-icon-tertiary" />
          </div>
          <p className="text-body-md-regular text-text-tertiary">아직 주문 내역이 없습니다</p>
          <Button render={<a href="/map" />} nativeButton={false} className={MINT_CTA}>
            지도에서 영상 구매하기
          </Button>
        </div>
      ) : (
        <div className="space-y-16">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] ?? {
              text: order.status,
              status: 'neutral',
              cls: 'bg-transparent text-text-tertiary [&>svg]:text-text-tertiary',
            };
            const hasDownload =
              order.status === 'completed' && order.downloads.length > 0;
            const download = order.downloads[0];
            const isExpired =
              download && new Date(download.expires_at) < new Date();

            return (
              <Card.Root key={order.id}>
                <Card.Body className="gap-12">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <p className="text-body-sm-regular text-text-tertiary">
                        주문번호:{' '}
                        <span className="text-body-sm-medium tabular-nums text-text-primary">
                          {order.id.slice(0, 8)}
                        </span>
                      </p>
                      <p className="text-body-sm-regular tabular-nums text-text-primary">
                        면적: {fmtNum(order.aoi_area_km2, 2)} km² / 금액: $
                        {fmtNum(Number(order.total_price), 2)}
                      </p>
                      <p className="text-body-xs-regular tabular-nums text-text-tertiary">
                        {new Date(order.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                    <StatusChip status={status.status} className={status.cls}>
                      {status.text}
                    </StatusChip>
                  </div>

                  {order.error_message && (
                    <p className="rounded-md bg-[rgba(196,92,74,0.1)] px-12 py-8 text-body-sm-regular text-status-danger">
                      {order.error_message}
                    </p>
                  )}

                  {hasDownload && !isExpired && (
                    <Button className={`self-start ${MINT_CTA}`} onClick={() => handleDownload(order.id)}>
                      다운로드
                    </Button>
                  )}

                  {hasDownload && isExpired && (
                    <p className="text-body-xs-regular text-text-tertiary">
                      다운로드 기간 만료
                    </p>
                  )}

                  {order.status === 'processing' && (
                    <p className="animate-pulse text-body-xs-regular text-text-interactive-primary">
                      영상 클리핑 처리 중...
                    </p>
                  )}
                </Card.Body>
              </Card.Root>
            );
          })}
        </div>
      )}
    </div>
  );
}
