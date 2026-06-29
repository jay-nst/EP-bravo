import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, company, plan, chat_tokens_used, chat_tokens_limit')
    .eq('id', user!.id)
    .single();

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, status, aoi_area_km2, total_price, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, type, title, message, created_at, read')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const unreadCount =
    notifications?.filter((n) => !n.read).length ?? 0;

  const completedOrders =
    recentOrders?.filter((o) => o.status === 'completed') ?? [];
  const totalAreaOwned = completedOrders.reduce(
    (sum, o) => sum + Number(o.aoi_area_km2),
    0,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="보유 영상" value={`${totalAreaOwned.toLocaleString()} km²`} />
        <StatCard label="총 주문" value={`${recentOrders?.length ?? 0}건`} />
        <StatCard label="채팅 크레딧" value={`${(profile?.chat_tokens_limit ?? 1000) - (profile?.chat_tokens_used ?? 0)}`} />
        <StatCard label="미읽은 알림" value={`${unreadCount}건`} accent={unreadCount > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            최근 활동
          </h2>
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-0">
                {recentOrders.map((order) => (
                  <ActivityRow
                    key={order.id}
                    date={formatDate(order.created_at)}
                    message={getOrderMessage(order)}
                  />
                ))}
                {notifications &&
                  notifications
                    .filter((n) => n.read === false)
                    .slice(0, 3)
                    .map((n) => (
                      <ActivityRow
                        key={n.id}
                        date={formatDate(n.created_at)}
                        message={n.message}
                      />
                    ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-xl"
                  style={{ background: 'rgba(27,191,168,0.08)' }}
                >
                  &#127758;
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  아직 활동 내역이 없습니다
                </p>
                <Link href="/map" className="text-sm inline-block px-4 py-2 rounded-lg transition-colors" style={{ background: 'var(--accent)', color: '#0E0E10' }}>
                  지도에서 영상 검색하기
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/portal"
            className="text-sm flex items-center gap-1"
            style={{ color: 'var(--text-muted)' }}
          >
            내 주문 더보기 →
          </Link>
        </section>

        {/* Profile + Quick Actions */}
        <aside className="space-y-4">
          {/* User Profile Card */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ background: 'var(--surface-elevated)', color: 'var(--accent)' }}
              >
                {(profile?.name?.[0] ?? user!.email![0])?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                  {profile?.name ?? user!.email!.split('@')[0]}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {profile?.company
                    ? `기업회원(${profile.company})`
                    : profile?.plan === 'free'
                      ? '개인회원(무료)'
                      : `${profile?.plan} 회원`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <QuickAction href="/map" label="지도에서 영상 검색" />
            <QuickAction href="/chat" label="AI 어시스턴트 대화" />
            <QuickAction href="/tasking" label="촬영 요청하기" />
          </div>

          {/* SpaceEye-T Banner */}
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-medium tracking-wider" style={{ color: 'var(--accent)' }}>
              SPACEEYE-T
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              25cm 초고해상도 영상
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              건물, 차량까지 식별 가능한 최고 해상도
            </p>
            <Link
              href="/map"
              className="inline-block text-xs px-3 py-1.5 rounded-md transition-colors mt-1"
              style={{ background: 'var(--accent)', color: '#0E0E10' }}
            >
              살펴보기
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p
        className="text-lg font-semibold font-mono mt-1"
        style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}
      >
        {value}
      </p>
    </div>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-3 rounded-lg text-sm transition-colors"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
    >
      {label}
    </Link>
  );
}

function ActivityRow({ date, message }: { date: string; message: string }) {
  return (
    <div
      className="flex items-start gap-4 py-2.5 text-sm"
      style={{ borderBottom: '1px solid rgba(42, 42, 47, 0.3)' }}
    >
      <span className="font-mono flex-shrink-0 w-20 tabular-nums" style={{ color: 'var(--text-muted)' }}>
        {date}
      </span>
      <span style={{ color: 'var(--text)' }}>{message}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
}

function getOrderMessage(order: {
  status: string;
  aoi_area_km2: number;
  total_price: number;
}): string {
  const area = Number(order.aoi_area_km2);
  switch (order.status) {
    case 'completed':
      return `${area}km² 영상 주문이 완료되었습니다.`;
    case 'processing':
      return `${area}km² 영상을 클리핑 처리 중입니다.`;
    case 'pending':
      return `${area}km² 영상 주문이 접수되었습니다.`;
    case 'failed':
      return `${area}km² 영상 주문 처리가 실패했습니다.`;
    case 'refunded':
      return `${area}km² 영상 주문이 환불되었습니다.`;
    default:
      return `${area}km² 영상 주문 상태: ${order.status}`;
  }
}
