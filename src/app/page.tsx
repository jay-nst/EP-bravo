import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { DAILY_EARTH, POSTS, BEFORE_AFTER, DAILY_QUIZZES } from '@/lib/sample-data';
import EarthPulse from '@/components/home/EarthPulse';
import SatelliteCountdown from '@/components/home/SatelliteCountdown';

async function getUserSummary() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [profileRes, ordersRes, notifRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('name, plan, chat_tokens_used, chat_tokens_limit')
        .eq('id', user.id)
        .single(),
      supabase
        .from('orders')
        .select('status, aoi_area_km2')
        .eq('user_id', user.id),
      supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('read', false),
    ]);

    const profile = profileRes.data;
    const orders = ordersRes.data ?? [];
    const completed = orders.filter((o) => o.status === 'completed');
    const totalArea = completed.reduce((s, o) => s + Number(o.aoi_area_km2), 0);

    return {
      name: profile?.name ?? user.email?.split('@')[0] ?? 'User',
      email: user.email ?? '',
      plan: profile?.plan ?? 'free',
      totalOrders: orders.length,
      totalArea,
      unreadNotifs: notifRes.data?.length ?? 0,
      chatCredits: (profile?.chat_tokens_limit ?? 1000) - (profile?.chat_tokens_used ?? 0),
    };
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const today = DAILY_EARTH[0];
  const recentPosts = POSTS.slice(0, 4);
  const featuredBA = BEFORE_AFTER[0];
  const user = await getUserSummary();

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Hero: Earth Pulse */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #080a12 0%, #0E0E10 40%, #0a1210 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Globe */}
            <div className="flex-shrink-0">
              <EarthPulse />
            </div>

            {/* Hero content */}
            <div className="flex-1 text-center md:text-left space-y-5">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#1bbfa8',
                    animation: 'ep-count-pulse 2s ease-in-out infinite',
                  }}
                />
                <span
                  className="text-xs font-mono tracking-[0.2em] uppercase"
                  style={{ color: 'var(--accent)' }}
                >
                  Live Observation
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-semibold leading-tight"
                style={{ color: 'var(--text)' }}
              >
                지금 이 순간에도
                <br />
                지구는 기록되고 있습니다
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                전 세계 위성이 촬영한 영상을 탐색하고, 변화를 추적하고,
                <br className="hidden md:block" />
                당신만의 관측 기록을 만들어보세요.
              </p>

              {/* Satellite Countdown */}
              <div className="max-w-sm mx-auto md:mx-0">
                <SatelliteCountdown />
              </div>

              <div className="flex gap-3 justify-center md:justify-start pt-1">
                <Link
                  href="/map"
                  className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{ background: 'var(--accent)', color: '#0E0E10' }}
                >
                  지도에서 탐색
                </Link>
                <Link
                  href="/daily"
                  className="px-5 py-2.5 rounded-lg text-sm transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  오늘의 지구
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle background grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(rgba(27,191,168,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </section>

      {/* Top: Daily Earth + User/Service panel */}
      <section className="px-4 pt-8 pb-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Earth — 2/3 width */}
          <Link
            href="/daily"
            className="lg:col-span-2 rounded-xl overflow-hidden transition-colors"
            style={{ border: '1px solid var(--border)' }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              <div
                className="aspect-[4/3] md:aspect-auto flex flex-col items-center justify-center p-6"
                style={{ background: 'var(--surface)', minHeight: '220px' }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-3"
                  style={{ background: 'rgba(27, 191, 168, 0.1)' }}
                >
                  <span style={{ color: 'var(--accent)' }}>&#127758;</span>
                </div>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {today.satellite} · {today.resolution}
                </p>
              </div>
              <div className="p-5 flex flex-col justify-center space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-medium tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(27, 191, 168, 0.12)', color: 'var(--accent)' }}
                  >
                    TODAY&apos;S EARTH
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {today.date}
                  </span>
                </div>
                <h2
                  className="text-xl font-semibold leading-snug"
                  style={{ color: 'var(--text)' }}
                >
                  {today.title}
                </h2>
                <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-muted)' }}>
                  {today.description}
                </p>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {today.coordinates}
                </p>
              </div>
            </div>
          </Link>

          {/* Right panel — 1/3: User summary (logged in) or Service grid (logged out) */}
          <div className="space-y-3">
            {user ? (
              <>
                {/* User Summary Widget */}
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={{ background: 'var(--surface-elevated)', color: 'var(--accent)' }}
                      >
                        {user.name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {user.name}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {user.plan === 'free' ? '무료' : user.plan} 회원
                        </p>
                      </div>
                    </div>
                    <Link href="/dashboard" className="text-xs py-2 px-1" style={{ color: 'var(--accent)' }}>
                      대시보드 →
                    </Link>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat label="보유 영상" value={`${user.totalArea.toLocaleString()} km²`} />
                    <MiniStat
                      label="새 알림"
                      value={`${user.unreadNotifs}건`}
                      accent={user.unreadNotifs > 0}
                    />
                    <MiniStat label="총 주문" value={`${user.totalOrders}건`} />
                    <MiniStat label="채팅 크레딧" value={`${user.chatCredits}`} />
                  </div>

                  {/* Earth Score inline */}
                  <div
                    className="flex items-center gap-3 px-3 py-2 rounded-lg"
                    style={{ background: 'var(--surface)' }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-semibold"
                      style={{ border: '1.5px solid var(--accent)', color: 'var(--accent)' }}
                    >
                      72
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                        Earth Score
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        상위 15%
                      </p>
                    </div>
                    <Link href="/explore" className="text-xs py-2 px-1" style={{ color: 'var(--accent)' }}>
                      자세히
                    </Link>
                  </div>
                </div>

                {/* Service shortcuts (compact, logged in) */}
                <div className="grid grid-cols-3 gap-2">
                  <ServiceBtn href="/map" label="위성 지도" accent />
                  <ServiceBtn href="/posts" label="뉴스" />
                  <ServiceBtn href="/explore" label="탐색" />
                  <ServiceBtn href="/chat" label="AI 채팅" />
                  <ServiceBtn href="/tasking" label="촬영 요청" />
                  <ServiceBtn href="/portal" label="내 주문" />
                </div>
              </>
            ) : (
              <>
                {/* Logged out: Service grid + CTA */}
                <div className="grid grid-cols-2 gap-3">
                  <ServiceCard href="/map" label="위성 지도" desc="영상 검색·구매" accent />
                  <ServiceCard href="/daily" label="오늘의 지구" desc="매일 한 장" />
                  <ServiceCard href="/posts" label="뉴스" desc="위성으로 본 세상" />
                  <ServiceCard href="/explore" label="탐색" desc="Before/After" />
                </div>
                <Link
                  href="/login"
                  className="block rounded-xl p-4 text-center text-sm font-medium transition-colors"
                  style={{ background: 'var(--accent)', color: '#0E0E10' }}
                >
                  로그인하고 시작하기
                </Link>
                <Link
                  href="/chat"
                  className="block rounded-xl p-3 text-center text-sm transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  AI 어시스턴트와 대화
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Middle: Two-column layout — News + Sidebar */}
      <section className="px-4 py-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* News Feed — 2/3 */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                최근 소식
              </h2>
              <Link href="/posts" className="text-xs py-2 px-1" style={{ color: 'var(--accent)' }}>
                전체 보기 →
              </Link>
            </div>
            <div className="space-y-3">
              {recentPosts.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="flex gap-4 rounded-lg p-3 transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    background: i === 0 ? 'var(--surface)' : 'transparent',
                  }}
                >
                  <div
                    className="w-20 h-20 flex-shrink-0 rounded-lg flex items-center justify-center"
                    style={{ background: i === 0 ? 'var(--surface-elevated)' : 'var(--surface)' }}
                  >
                    <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {post.category}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-base font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {post.title}
                    </h3>
                    <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {post.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span>{post.author}</span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span>{post.date}</span>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar — 1/3 */}
          <aside className="space-y-5">
            {/* Before/After Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                  변화 기록
                </h3>
                <Link href="/explore" className="text-xs py-2 px-1" style={{ color: 'var(--accent)' }}>
                  더 보기 →
                </Link>
              </div>
              <Link
                href="/explore"
                className="block rounded-xl overflow-hidden transition-colors"
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="grid grid-cols-2">
                  <div
                    className="aspect-[4/3] flex flex-col items-center justify-center p-3"
                    style={{ background: 'var(--surface)' }}
                  >
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>BEFORE</span>
                    <span className="text-sm font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                      {featuredBA.beforeDate}
                    </span>
                  </div>
                  <div
                    className="aspect-[4/3] flex flex-col items-center justify-center p-3"
                    style={{ background: 'var(--surface-elevated)' }}
                  >
                    <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>AFTER</span>
                    <span className="text-sm font-mono mt-1" style={{ color: 'var(--text)' }}>
                      {featuredBA.afterDate}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--surface-elevated)', color: 'var(--accent)' }}
                  >
                    {featuredBA.changeType}
                  </span>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {featuredBA.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {featuredBA.location}
                  </p>
                </div>
              </Link>
            </div>

            {/* Daily Quiz Widget */}
            <QuizWidget />

            {/* Quick links */}
            <div className="space-y-3">
              <Link
                href="/tasking"
                className="block rounded-xl p-4 transition-colors"
                style={{ border: '1px solid var(--border)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  촬영 요청
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  원하는 지역의 신규 위성 촬영을 신청하세요
                </p>
                <span className="text-xs mt-2 inline-block" style={{ color: 'var(--accent)' }}>
                  $12/km² →
                </span>
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Daily Earth Archive Strip */}
      <section className="px-4 py-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              지난 지구 기록
            </h2>
            <Link href="/daily" className="text-xs py-2 px-1" style={{ color: 'var(--accent)' }}>
              전체 아카이브 →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {DAILY_EARTH.slice(1, 5).map((item) => (
              <Link
                key={item.id}
                href="/daily"
                className="rounded-lg overflow-hidden transition-colors"
                style={{ border: '1px solid var(--border)' }}
              >
                <div
                  className="aspect-[3/2] flex items-center justify-center"
                  style={{ background: 'var(--surface)' }}
                >
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.category}</span>
                </div>
                <div className="p-2.5 space-y-0.5">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                    {item.title}
                  </p>
                  <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {item.date}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing compact */}
      <section className="px-4 py-10" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
              영상 가격
            </h2>
            <Link href="/map" className="text-xs py-2 px-1" style={{ color: 'var(--accent)' }}>
              지도에서 구매 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className="rounded-xl p-5 flex items-center gap-5"
              style={{ border: '1px solid var(--border)' }}
            >
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>Observer</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>해상도 1.5m · 최소 1km²</p>
              </div>
              <p className="ml-auto font-mono text-xl font-semibold" style={{ color: 'var(--text)' }}>
                $7<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/km²</span>
              </p>
            </div>
            <div
              className="rounded-xl p-5 flex items-center gap-5"
              style={{
                border: '1px solid rgba(27, 191, 168, 0.3)',
                background: 'rgba(27, 191, 168, 0.04)',
              }}
            >
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text)' }}>SpaceEye-T</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>해상도 25cm · 최소 25km²</p>
              </div>
              <p className="ml-auto font-mono text-xl font-semibold" style={{ color: 'var(--text)' }}>
                $15<span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>/km²</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-6 px-4 text-center text-xs"
        style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        EarthPaper by SI Analytics
      </footer>
    </div>
  );
}

function MiniStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-lg px-3 py-2"
      style={{ background: 'var(--surface)' }}
    >
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p
        className="text-sm font-mono font-semibold mt-0.5"
        style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}
      >
        {value}
      </p>
    </div>
  );
}

function ServiceBtn({ href, label, accent = false }: { href: string; label: string; accent?: boolean }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-2 py-2.5 text-center text-xs font-medium transition-colors"
      style={{
        border: accent ? '1px solid rgba(27, 191, 168, 0.3)' : '1px solid var(--border)',
        color: accent ? 'var(--accent)' : 'var(--text-muted)',
        background: accent ? 'rgba(27, 191, 168, 0.04)' : 'transparent',
      }}
    >
      {label}
    </Link>
  );
}

function ServiceCard({
  href,
  label,
  desc,
  accent = false,
}: {
  href: string;
  label: string;
  desc: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl p-4 flex flex-col gap-1 transition-colors"
      style={{
        border: accent ? '1px solid rgba(27, 191, 168, 0.3)' : '1px solid var(--border)',
        background: accent ? 'rgba(27, 191, 168, 0.04)' : 'transparent',
      }}
    >
      <p className="text-sm font-medium" style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}>
        {label}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </Link>
  );
}

function QuizWidget() {
  const today = new Date();
  const dayIndex = today.getDate() % DAILY_QUIZZES.length;
  const quiz = DAILY_QUIZZES[dayIndex];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
          오늘의 퀴즈
        </h3>
        <Link href="/quiz" className="text-xs py-2 px-1" style={{ color: 'var(--accent)' }}>
          풀어보기 →
        </Link>
      </div>
      <Link
        href="/quiz"
        className="block rounded-xl overflow-hidden transition-colors"
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--surface)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'rgba(27,191,168,0.08)' }}
          >
            <span style={{ color: 'var(--accent)' }}>&#128752;</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
              {quiz.question}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              위성 영상을 보고 장소를 맞혀보세요
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
