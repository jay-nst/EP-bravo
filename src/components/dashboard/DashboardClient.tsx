'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FeedItem, FeedType, DashboardSummary } from '@/types/dashboard';
import { FEED_BADGE_COLORS, FEED_LABELS } from '@/types/dashboard';
import { trackEvent } from '@/lib/analytics';
import { fmtNum } from '@/lib/format';
import dynamic from 'next/dynamic';
import NewsletterForm from '@/components/home/NewsletterForm';

const MiniMap = dynamic(() => import('./MiniMap'), { ssr: false });

const PLATFORMS = [
  { key: 'citadel', label: 'Citadel', desc: '재난 · 도시 관제', color: '#C45C4A', href: '/citadel' },
  { key: 'predict', label: 'Predict', desc: '자산 검증 · 금융', color: '#4A9EC4', href: '/predict' },
  { key: 'warden', label: 'Warden', desc: '기후 · 컴플라이언스', color: '#6B8A5E', href: '/warden' },
  { key: 'northpaper', label: 'Northpaper', desc: '국방 · 안보', color: '#3D5A80', href: '/northpaper' },
  { key: 'nexus', label: 'Nexus', desc: '데이터 마켓', color: '#C8923A', href: '/nexus' },
] as const;

const PLATFORM_TYPES = new Set<FeedType>(['citadel', 'predict', 'warden', 'northpaper']);

const PLATFORM_HREF: Record<string, string> = {
  citadel: '/citadel',
  predict: '/predict',
  warden: '/warden',
  northpaper: '/northpaper',
};

function buildBadge(item: FeedItem): string {
  const m = item.metadata;
  if (item.type === 'citadel') {
    const parts = [String(m.event_type ?? ''), String(m.severity ?? '')].filter(Boolean);
    return parts.join(' · ').toUpperCase();
  }
  if (item.type === 'warden' && m.compliance) return String(m.compliance);
  if (m.analysis_type) return String(m.analysis_type).replace(/_/g, ' ').toUpperCase();
  return FEED_LABELS[item.type]?.toUpperCase() ?? item.type.toUpperCase();
}

function relativeDate(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diff === 0) return '오늘';
  if (diff === 1) return '1일 전';
  return `${diff}일 전`;
}

export default function DashboardClient() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const router = useRouter();
  const [chatInput, setChatInput] = useState('');
  const [trendingTab, setTrendingTab] = useState<'subjects' | 'posts'>('subjects');
  const curatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {});
  }, []);

  const loadFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const params = new URLSearchParams({ type: 'all', limit: '50' });
      const res = await fetch(`/api/dashboard/feed?${params}`);
      const data = await res.json();
      setFeedItems(data.items ?? []);
    } catch {
      /* ignore */
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Auto-scroll for curated strip
  useEffect(() => {
    const el = curatedRef.current;
    if (!el) return;
    let animId: number;
    let paused = false;

    const step = () => {
      if (!paused && el.scrollWidth > el.clientWidth) {
        el.scrollLeft += 0.5;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);

    const pause = () => { paused = true; };
    const resume = () => { paused = false; };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    el.addEventListener('touchstart', pause, { passive: true });
    el.addEventListener('touchend', resume);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
      el.removeEventListener('touchstart', pause);
      el.removeEventListener('touchend', resume);
    };
  }, []);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    trackEvent('chat_from_home', 'submit', { query: chatInput.trim() });
    router.push('/chat');
  };

  const randomExplore = () => {
    const locations = [
      { lat: 37.5665, lng: 126.978 },
      { lat: 35.1796, lng: 129.0756 },
      { lat: 33.4996, lng: 126.5312 },
      { lat: 35.8714, lng: 128.6014 },
      { lat: 37.4563, lng: 126.7052 },
    ];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    window.location.href = `/core?lat=${loc.lat}&lng=${loc.lng}&zoom=14`;
  };

  const editorPick = summary?.editorPick;
  const shortsItems = feedItems.filter((i) => i.type === 'shorts');
  const platformItems = feedItems.filter((i) => ['predict', 'warden', 'northpaper', 'analysis'].includes(i.type));
  const newsItems = feedItems.filter((i) => i.type === 'news');

  const curatedItems = useMemo(() =>
    feedItems
      .filter((i) => PLATFORM_TYPES.has(i.type))
      .slice(0, 10)
      .map((item) => ({
        id: item.id,
        color: FEED_BADGE_COLORS[item.type],
        badge: buildBadge(item),
        title: item.title,
        sub: `${String(item.metadata.location ?? '')}${item.metadata.location ? ' · ' : ''}${relativeDate(item.published_at)}`,
        href: item.link_url ?? PLATFORM_HREF[item.type] ?? '/',
        linkAction: item.link_action,
      })),
    [feedItems],
  );

  const trendingSubjects = useMemo(() =>
    feedItems
      .filter((i) => i.type === 'trending')
      .sort((a, b) => Number(a.metadata.rank ?? 99) - Number(b.metadata.rank ?? 99))
      .slice(0, 5)
      .map((item, idx) => ({
        rank: Number(item.metadata.rank ?? idx + 1),
        title: item.title,
        badge: String(item.metadata.resolution ?? '').toLowerCase() as FeedType,
      })),
    [feedItems],
  );

  const popularPosts = useMemo(() =>
    feedItems
      .filter((i) => PLATFORM_TYPES.has(i.type))
      .slice(0, 5)
      .map((item, idx) => ({
        rank: idx + 1,
        title: item.title,
        author: `${FEED_LABELS[item.type]}팀`,
      })),
    [feedItems],
  );

  const CHAT_SUGGESTIONS = [
    '서울 강남 최신 영상 보여줘',
    '제주도 NDVI 변화 분석',
    '이번 주 재난 요약',
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ===== BREAKING STRIP ===== */}
      <BreakingStrip items={feedItems} />

      {/* ===== FEATURED HERO (Bloomberg-style) ===== */}
      <section
        className="relative overflow-hidden cursor-pointer min-h-[280px] md:min-h-[400px]"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Satellite background image */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'url(https://earthpaper.s3.ap-northeast-2.amazonaws.com/post/v2/editor/48/en-20260430-north-korea-nampo-port-and-nampo-shipyard.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center 40%',
            opacity: 0.45,
          }}
        />
        {/* Left-side gradient overlay for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(14,14,16,0.97) 0%, rgba(14,14,16,0.82) 45%, rgba(14,14,16,0.4) 75%, rgba(14,14,16,0.25) 100%)',
          }}
        />
        {/* Subtle scanline texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(27,191,168,0.015) 3px, rgba(27,191,168,0.015) 4px)',
          }}
        />
        {editorPick ? (
          <Link href="/interactive/north-korean-shipyards" className="block relative z-10">
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
              <div className="flex items-center gap-2 mb-4 md:mb-5">
                <span className="inline-block w-6 h-px" style={{ background: 'var(--accent)' }} />
                <span className="text-xs font-mono tracking-[0.15em] uppercase font-semibold" style={{ color: '#3D5A80' }}>
                  Northpaper Original · 방위 분석
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-3 md:mb-4 max-w-2xl" style={{ color: 'var(--text)' }}>
                {editorPick.title}
              </h1>
              <p className="text-sm md:text-base leading-relaxed max-w-xl mb-5 md:mb-6" style={{ color: 'var(--text-muted)' }}>
                {editorPick.description}
              </p>
              <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                <span className="text-xs font-medium px-3 py-1.5 rounded" style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                  인터랙티브
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>6분 읽기</span>
                <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-muted)' }}>{editorPick.source}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {new Date(editorPick.published_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16 relative z-10 animate-pulse space-y-4">
            <div className="h-4 w-40 rounded" style={{ background: 'var(--surface-elevated)' }} />
            <div className="h-10 w-full max-w-96 rounded" style={{ background: 'var(--surface-elevated)' }} />
            <div className="h-5 w-full max-w-80 rounded" style={{ background: 'var(--surface-elevated)' }} />
          </div>
        )}
      </section>

      {/* ===== CURATED FEED STRIP (auto-scroll, multi-platform) ===== */}
      <section className="py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 px-4 md:px-6 mb-3">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
          <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Live Feed
          </span>
        </div>
        <div
          ref={curatedRef}
          className="flex gap-3 md:gap-4 px-4 md:px-6 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {curatedItems.map((item) => {
            const isExternal = item.linkAction === 'external' && item.href.startsWith('http');
            const CardTag = isExternal ? 'a' : Link;
            const linkProps = isExternal
              ? { href: item.href, target: '_blank' as const, rel: 'noopener noreferrer' }
              : { href: item.href };
            return (
              <CardTag
                key={item.id}
                {...linkProps}
                className="flex-shrink-0 w-[240px] md:w-[280px] p-3 md:p-4 rounded-lg cursor-pointer transition-colors hover:bg-[var(--surface-elevated)] no-underline"
                style={{ border: `1px solid ${item.color}30`, background: `${item.color}08`, textDecoration: 'none' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded uppercase"
                    style={{ background: `${item.color}20`, color: item.color }}
                  >
                    {item.badge}
                  </span>
                </div>
                <p className="text-sm font-medium leading-snug mb-2" style={{ color: 'var(--text)' }}>
                  {item.title}
                </p>
                <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {item.sub}
                </p>
              </CardTag>
            );
          })}
        </div>
      </section>

      {/* ===== MAGAZINE GRID (2/3 + 1/3) ===== */}
      <section className="flex-1">
        <div
          className="grid grid-cols-1 lg:grid-cols-[2fr_1fr]"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          {/* === MAIN COLUMN === */}
          <div
            className="px-4 md:px-6 py-8 flex flex-col gap-12 lg:border-r"
            style={{ minWidth: 0, borderColor: 'var(--border)' }}
          >
            {/* Shorts Carousel */}
            {shortsItems.length > 0 && (
              <div>
                <SectionHeader title="Shorts" icon="▶" linkText="전체 보기" linkHref="https://www.youtube.com/@naraspace/shorts" external />
                <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                  {shortsItems.map((item) => (
                    <ShortsCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Platform Navigation */}
            <div>
              <SectionHeader title="플랫폼" icon="●" />
              <div className="flex gap-2 flex-wrap">
                {PLATFORMS.map((p) => (
                  <Link
                    key={p.key}
                    href={p.href}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-md transition-colors"
                    style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = p.color; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{p.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.desc}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform Feed Grid */}
            {platformItems.length > 0 && (
              <div>
                <SectionHeader title="플랫폼 리포트" icon="●" linkText="더 보기" linkHref="https://ep.naraspace.com/ko/post" external />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platformItems.slice(0, 6).map((item) => (
                    <AnalysisCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* News List */}
            {newsItems.length > 0 && (
              <div>
                <SectionHeader title="뉴스" icon="●" />
                <div className="space-y-px">
                  {newsItems.map((item) => (
                    <NewsRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {feedLoading && (
              <div className="py-8 text-center">
                <div
                  className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                  style={{ borderColor: 'var(--border)', borderTopColor: 'transparent' }}
                />
              </div>
            )}
          </div>

          {/* === SIDEBAR === */}
          <aside
            className="px-4 md:px-6 py-8 flex flex-col gap-6 border-t lg:border-t-0"
            style={{ borderColor: 'var(--border)' }}
          >
            {/* AI Assistant (moved from full-width) */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-sm font-medium tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                EP AGENT
              </p>
              <form onSubmit={handleChatSubmit}>
                <div className="relative mb-2">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="위성 영상에 대해 물어보세요..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg focus:outline-none transition-colors"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {CHAT_SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setChatInput(q);
                        trackEvent('chat_from_home', 'suggestion_click', { query: q });
                        router.push('/chat');
                      }}
                      className="px-2.5 py-1.5 text-sm rounded transition-colors"
                      style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </form>
              {/* Personalized services (logged-in state) */}
              {summary && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/portal" className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-[var(--surface-elevated)]" style={{ background: 'var(--surface)' }}>
                      <span className="text-sm">📦</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>내 주문</p>
                        <p className="text-xs" style={{ color: 'var(--accent)' }}>{fmtNum(summary.recentOrders.length)}건</p>
                      </div>
                    </Link>
                    <Link href="/tasking" className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-[var(--surface-elevated)]" style={{ background: 'var(--surface)' }}>
                      <span className="text-sm">📡</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>촬영 요청</p>
                        <p className="text-xs" style={{ color: summary.pendingTaskings > 0 ? '#C8923A' : 'var(--text-muted)' }}>
                          {summary.pendingTaskings > 0 ? `${fmtNum(summary.pendingTaskings)}건 대기` : '없음'}
                        </p>
                      </div>
                    </Link>
                    <Link href="/core" className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-[var(--surface-elevated)]" style={{ background: 'var(--surface)' }}>
                      <span className="text-sm">🗺️</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>위성 영상</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmtNum(summary.stats.totalImages)}장</p>
                      </div>
                    </Link>
                    <Link href="/quiz" className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-[var(--surface-elevated)]" style={{ background: 'var(--surface)' }}>
                      <span className="text-sm">🧠</span>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>퀴즈</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>도전하기</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 오늘의 지구 (Compact) */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium tracking-wider" style={{ color: 'var(--text-muted)' }}>오늘의 지구</p>
                <Link href="/core" className="text-sm font-mono" style={{ color: 'var(--accent)' }}>Core →</Link>
              </div>
              <div className="mb-3">
                <MiniMap />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MetricItem label="활성 재난" value="2" suffix="건" color="#C45C4A" />
                <MetricItem label="대기질" value="보통" suffix="" color="var(--accent)" />
                <MetricItem label="신규 영상" value="+47" suffix="장" color="var(--accent)" />
                <MetricItem label="위성수" value="5" suffix="기" color="var(--text-muted)" />
              </div>
            </div>

            {/* Quick Actions (1x3, no AI chat) */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-sm font-medium tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>QUICK ACTIONS</p>
              <div className="grid grid-cols-3 gap-2">
                <QuickActionBtn href="/core" icon="🗺️" label="위성지도" />
                <QuickActionBtn icon="🎲" label="랜덤 탐험" onClick={randomExplore} />
                <QuickActionBtn href="/tasking" icon="📡" label="촬영 요청" />
              </div>
            </div>

            {/* Trending Subjects (with tabs) */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-1 mb-3">
                <button
                  onClick={() => setTrendingTab('subjects')}
                  className="px-3 py-1.5 text-sm rounded transition-colors"
                  style={{
                    background: trendingTab === 'subjects' ? 'var(--surface-elevated)' : 'transparent',
                    color: trendingTab === 'subjects' ? 'var(--text)' : 'var(--text-muted)',
                    border: trendingTab === 'subjects' ? '1px solid var(--border)' : '1px solid transparent',
                  }}
                >
                  Trending
                </button>
                <button
                  onClick={() => setTrendingTab('posts')}
                  className="px-3 py-1.5 text-sm rounded transition-colors"
                  style={{
                    background: trendingTab === 'posts' ? 'var(--surface-elevated)' : 'transparent',
                    color: trendingTab === 'posts' ? 'var(--text)' : 'var(--text-muted)',
                    border: trendingTab === 'posts' ? '1px solid var(--border)' : '1px solid transparent',
                  }}
                >
                  인기 글
                </button>
              </div>

              {trendingTab === 'subjects' ? (
                <div className="space-y-1.5">
                  {trendingSubjects.map((t) => {
                    const badgeColor = FEED_BADGE_COLORS[t.badge] ?? 'var(--text-muted)';
                    return (
                      <div key={t.rank} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--surface)] cursor-pointer">
                        <span className="text-base font-bold font-mono w-5 text-center" style={{ color: 'var(--text-muted)' }}>{t.rank}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{t.title}</p>
                          <span className="text-xs font-mono uppercase" style={{ color: badgeColor }}>
                            {t.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {trendingSubjects.length === 0 && (
                    <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>{feedLoading ? '트렌딩 데이터 로딩 중...' : '트렌딩 데이터 없음'}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {popularPosts.map((p) => (
                    <div key={p.rank} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--surface)] cursor-pointer">
                      <span className="text-base font-bold font-mono w-5 text-center" style={{ color: 'var(--text-muted)' }}>{p.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{p.title}</p>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.author}</span>
                      </div>
                    </div>
                  ))}
                  {popularPosts.length === 0 && (
                    <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>{feedLoading ? '데이터 로딩 중...' : '데이터 없음'}</p>
                  )}
                </div>
              )}
            </div>

            {/* Newsletter */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-sm font-medium tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>뉴스레터</p>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>매주 위성이 포착한 지구의 변화를 받아보세요.</p>
              <NewsletterForm />
            </div>
          </aside>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-4 md:px-6" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} EarthPaper by Nara Space</p>
          <div className="flex gap-6 text-sm">
            <a href="https://ep.naraspace.com/ko/policy/service" target="_blank" rel="noopener noreferrer" className="hover:underline">이용약관</a>
            <a href="https://ep.naraspace.com/ko/policy/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">개인정보처리방침</a>
            <a href="https://ep.naraspace.com/ko/helpcenter" target="_blank" rel="noopener noreferrer" className="hover:underline">고객센터</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}

/* ===== SUB-COMPONENTS ===== */

function SectionHeader({ title, icon, linkText, linkHref, external }: {
  title: string; icon?: string; linkText?: string; linkHref?: string; external?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
        {icon && <span className="text-sm" style={{ color: 'var(--accent)' }}>{icon}</span>}
        {title}
      </h2>
      {linkText && linkHref && (
        external ? (
          <a href={linkHref} target="_blank" rel="noopener noreferrer" className="text-sm py-1 px-2" style={{ color: 'var(--text-muted)' }}>{linkText} →</a>
        ) : (
          <Link href={linkHref} className="text-sm py-1 px-2" style={{ color: 'var(--text-muted)' }}>{linkText} →</Link>
        )
      )}
    </div>
  );
}

function ShortsCard({ item }: { item: FeedItem }) {
  const [playing, setPlaying] = useState(false);
  const views = Number(item.metadata.views ?? 0);
  const youtubeId = String(item.metadata.youtube_id ?? '');

  return (
    <div className="flex-shrink-0 w-[130px] md:w-[160px] rounded-lg overflow-hidden group" style={{ border: '1px solid var(--border)', aspectRatio: '9/16' }}>
      <div className="relative w-full h-full" style={{ background: 'var(--surface)' }}>
        {playing && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&controls=1&modestbranding=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{ border: 'none' }}
          />
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ filter: 'brightness(0.7)' }}
            />
            <button
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              aria-label="재생"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              >
                <span className="text-white text-lg ml-0.5">▶</span>
              </div>
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
              <p className="text-sm font-medium leading-snug mb-1 line-clamp-2" style={{ color: '#fff' }}>{item.title}</p>
              <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {views >= 1000 ? `${fmtNum(views / 1000, 1)}k` : fmtNum(views)} 조회
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const PLATFORM_LABEL: Record<string, { label: string; color: string }> = {
  predict: { label: 'PREDICT', color: '#4A9EC4' },
  warden: { label: 'WARDEN', color: '#6B8A5E' },
  northpaper: { label: 'NORTHPAPER', color: '#3D5A80' },
  analysis: { label: 'ANALYSIS', color: '#22d3ee' },
};

function AnalysisCard({ item }: { item: FeedItem }) {
  const pl = PLATFORM_LABEL[item.type] ?? { label: item.type.toUpperCase(), color: 'var(--text-muted)' };
  const location = String(item.metadata.location ?? '');

  const inner = (
    <div className="rounded-lg overflow-hidden group" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
      <div className="relative" style={{ height: 160 }}>
        {item.thumbnail_url ? (
          <>
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--surface) 0%, transparent 60%)' }} />
          </>
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--surface-elevated), var(--surface))' }} />
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div style={{ width: 80, height: 80, background: 'var(--accent)', borderRadius: '40%', filter: 'blur(20px)' }} />
            </div>
          </>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-mono tracking-wider mb-1.5" style={{ color: pl.color }}>{pl.label}</p>
        <p className="text-base font-semibold leading-snug mb-1.5 group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text)' }}>
          {item.title}
        </p>
        {item.description && (
          <p className="text-sm leading-relaxed line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
        )}
        <div className="flex items-center justify-between text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          <span>{location}</span>
          <span>{new Date(item.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );

  if (item.link_url && item.link_action === 'external') return <a href={item.link_url} target="_blank" rel="noopener noreferrer">{inner}</a>;
  if (item.link_url) return <Link href={item.link_url}>{inner}</Link>;
  return inner;
}

function NewsRow({ item }: { item: FeedItem }) {
  const inner = (
    <div className="flex items-start gap-4 p-4 transition-colors hover:bg-[var(--surface)]" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-mono tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>NEWS</p>
        <p className="text-base font-medium leading-snug" style={{ color: 'var(--text)' }}>{item.title}</p>
        {item.description && <p className="text-sm mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{item.description}</p>}
      </div>
      <span className="text-sm font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        {new Date(item.published_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
      </span>
    </div>
  );

  if (item.link_url && item.link_action === 'navigate') return <Link href={item.link_url}>{inner}</Link>;
  if (item.link_url && item.link_action === 'external') return <a href={item.link_url} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return inner;
}

function MetricItem({ label, value, suffix, color }: { label: string; value: string; suffix: string; color: string }) {
  return (
    <div className="p-2 rounded-md" style={{ background: 'var(--surface)' }}>
      <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-bold" style={{ color }}>
        {value} <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{suffix}</span>
      </p>
    </div>
  );
}

function QuickActionBtn({ href, icon, label, onClick }: { href?: string; icon: string; label: string; onClick?: () => void }) {
  const cls = "flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg transition-colors hover:bg-[var(--surface-elevated)]";
  const style = { background: 'var(--surface)' };
  if (href) {
    return <Link href={href} className={cls} style={style}><span className="text-lg">{icon}</span><span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span></Link>;
  }
  return <button onClick={onClick} className={cls} style={style}><span className="text-lg">{icon}</span><span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span></button>;
}

const SEVERITY_LABEL: Record<string, { text: string; color: string }> = {
  critical: { text: 'CRITICAL', color: '#C45C4A' },
  high: { text: 'HIGH', color: '#E07B5F' },
  medium: { text: 'MEDIUM', color: '#C8923A' },
};

function BreakingStrip({ items }: { items: FeedItem[] }) {
  const citadelItems = items
    .filter((i) => i.type === 'citadel')
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipState, setFlipState] = useState<'idle' | 'flip-out' | 'flip-in'>('idle');
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (citadelItems.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setFlipState('flip-out');
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % citadelItems.length);
        setFlipState('flip-in');
        setTimeout(() => setFlipState('idle'), 400);
      }, 400);
    }, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [citadelItems.length]);

  if (citadelItems.length === 0) return null;
  const current = citadelItems[currentIdx % citadelItems.length];
  if (!current) return null;

  const sev = SEVERITY_LABEL[String(current.metadata.severity)] ?? { text: 'ALERT', color: '#C8923A' };
  const location = String(current.metadata.location ?? '');
  const isExternal = current.link_url?.startsWith('http');

  const flipTransform =
    flipState === 'flip-out' ? 'rotateX(90deg)' :
    flipState === 'flip-in' ? 'rotateX(-90deg)' : 'rotateX(0deg)';
  const flipOpacity = flipState === 'idle' ? 1 : 0;

  const inner = (
    <div className="max-w-6xl mx-auto px-6 py-2 flex items-center gap-3" style={{ perspective: 600 }}>
      <span className="inline-flex items-center gap-1.5 flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#C45C4A' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C45C4A', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
        CITADEL
      </span>

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            transform: flipTransform,
            opacity: flipOpacity,
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease',
            transformOrigin: flipState === 'flip-out' ? 'bottom center' : 'top center',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            className="flex-shrink-0"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: sev.color,
              padding: '2px 6px',
              borderRadius: 2,
              background: `${sev.color}18`,
            }}
          >
            {sev.text}
          </span>
          <span className="truncate" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
            {current.title}
          </span>
          {location && (
            <span className="flex-shrink-0 hidden sm:inline" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
              {location}
            </span>
          )}
        </div>
      </div>

      {citadelItems.length > 1 && (
        <span className="flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'var(--text-muted)' }}>
          {(currentIdx % citadelItems.length) + 1}/{citadelItems.length}
        </span>
      )}
    </div>
  );

  const wrapStyle = {
    background: 'rgba(196, 92, 74, 0.06)',
    borderBottom: '1px solid rgba(196, 92, 74, 0.15)',
    textDecoration: 'none' as const,
    display: 'block' as const,
  };

  if (isExternal && current.link_url) {
    return <a href={current.link_url} target="_blank" rel="noopener noreferrer" style={wrapStyle}>{inner}</a>;
  }
  if (current.link_url) {
    return <Link href={current.link_url} style={wrapStyle}>{inner}</Link>;
  }
  return <div style={wrapStyle}>{inner}</div>;
}
