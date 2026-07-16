'use client';

import { useEffect, useState } from 'react';
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

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: '대기중', color: 'var(--warning)' },
  payment_held: { text: '결제 확인', color: 'var(--accent)' },
  processing: { text: '처리중', color: 'var(--accent)' },
  completed: { text: '완료', color: 'var(--success)' },
  failed: { text: '실패', color: 'var(--error)' },
  refunded: { text: '환불됨', color: 'var(--text-muted)' },
};

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
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>주문 내역 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p style={{ color: 'var(--error)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 w-full">
      <h1 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text)' }}>
        내 주문
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div
            className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl"
            style={{ background: 'var(--surface)' }}
          >
            &#127758;
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>아직 주문 내역이 없습니다</p>
          <a
            href="/map"
            className="inline-block text-sm px-5 py-2.5 rounded-lg font-medium transition-colors"
            style={{ background: 'var(--accent)', color: '#0E0E10' }}
          >
            지도에서 영상 구매하기
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.status] ?? {
              text: order.status,
              color: 'var(--text-muted)',
            };
            const hasDownload =
              order.status === 'completed' && order.downloads.length > 0;
            const download = order.downloads[0];
            const isExpired =
              download && new Date(download.expires_at) < new Date();

            return (
              <div
                key={order.id}
                className="rounded-xl p-5 space-y-3"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      주문번호:{' '}
                      <span className="font-mono text-xs" style={{ color: 'var(--text)' }}>
                        {order.id.slice(0, 8)}
                      </span>
                    </p>
                    <p className="text-sm font-mono" style={{ color: 'var(--text)' }}>
                      면적: {fmtNum(order.aoi_area_km2, 2)} km² / 금액: $
                      {fmtNum(Number(order.total_price), 2)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(order.created_at).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <span className="text-sm font-medium" style={{ color: status.color }}>
                    {status.text}
                  </span>
                </div>

                {order.error_message && (
                  <p
                    className="text-xs px-3 py-2 rounded"
                    style={{
                      background: 'rgba(196, 92, 74, 0.1)',
                      color: 'var(--error)',
                    }}
                  >
                    {order.error_message}
                  </p>
                )}

                {hasDownload && !isExpired && (
                  <button
                    onClick={() => handleDownload(order.id)}
                    className="text-sm px-4 py-2 rounded-lg transition-colors"
                    style={{ background: 'var(--accent)', color: '#0E0E10' }}
                  >
                    다운로드
                  </button>
                )}

                {hasDownload && isExpired && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    다운로드 기간 만료
                  </p>
                )}

                {order.status === 'processing' && (
                  <p className="text-xs animate-pulse" style={{ color: 'var(--accent)' }}>
                    영상 클리핑 처리 중...
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
