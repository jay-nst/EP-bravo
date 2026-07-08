'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FeedItem, DashboardSummary } from '@/types/dashboard';
import { trackEvent } from '@/lib/analytics';

const PLATFORMS = [
  { key: 'citadel', label: 'Citadel', desc: '재난 · 도시 관제', color: '#C45C4A', href: '/citadel' },
  { key: 'predict', label: 'Predict', desc: '자산 검증 · 금융', color: '#4A9EC4', href: '/predict' },
  { key: 'warden', label: 'Warden', desc: '기후 · 컴플라이언스', color: '#6B8A5E', href: '/warden' },
  { key: 'northpaper', label: 'Northpaper', desc: '국방 · 안보', color: '#3D5A80', href: '/northpaper' },
  { key: 'nexus', label: 'Nexus', desc: '데이터 마켓', color: '#C8923A', href: '/nexus' },
] as const;

const CURATED_ITEMS = [
  { platform: 'warden', color: '#6B8A5E', badge: 'METHANE · EU 규제', title: '국내 정유시설 메탄 배출 위성 검증', sub: '울산/여수 · 1일 전' },
  { platform: 'citadel', color: '#C45C4A', badge: 'CRITICAL · WILDFIRE', title: 'Santa Rosa Island 산불 확산 및 피해 범위 위성 추적', sub: 'California, USA · 3일 전' },
  { platform: 'predict', color: '#4A9EC4', badge: 'ASSET · SOLAR', title: '태양광 발전소 패널 이상 탐지 — 위성 자산 검증', sub: '전남 해남 · 2일 전' },
  { platform: 'northpaper', color: '#3D5A80', badge: 'DEFENSE · SHIPYARD', title: '위성이 포착한 북한 5대 조선소 구조 변화', sub: 'North Korea · 3일 전' },
  { platform: 'warden', color: '#6B8A5E', badge: 'EUDR · 공급망', title: 'EUDR 공급망 검증 — 코코아 원산지 산림 전용 모니터링', sub: "Côte d'Ivoire · 3일 전" },
  { platform: 'predict', color: '#4A9EC4', badge: 'COMMODITY · OIL', title: '호르무즈 해협 봉쇄 후 원유 이동 경로 위성 분석', sub: 'Fujairah/Yanbu · 4일 전' },
  { platform: 'citadel', color: '#C45C4A', badge: 'CRITICAL · FLOOD', title: '자메이카 홍수 피해 위성영상 분석', sub: 'Jamaica · 5일 전' },
  { platform: 'warden', color: '#6B8A5E', badge: 'PALM OIL · FOREST', title: '동남아 팜 플랜테이션 확장 감시 — 보르네오 위성 분석', sub: 'Borneo · 9일 전' },
  { platform: 'predict', color: '#4A9EC4', badge: 'AI FORECAST · 97%', title: '미국 옥수수 수확량 예측 — AI 모델 97% 정확도', sub: 'US Corn Belt · 8일 전' },
  { platform: 'northpaper', color: '#3D5A80', badge: 'DEFENSE · NUCLEAR', title: '이란 핵시설 공습 피해 위성영상 분석', sub: 'Iran · 10일 전' },
];

const TRENDING_SUBJECTS = [
  { rank: 1, title: 'EU 메탄 규제 위성 검증', clicks: '14.2k', badge: 'warden' },
  { rank: 2, title: 'Santa Rosa Island 산불', clicks: '11.5k', badge: 'citadel' },
  { rank: 3, title: '태양광 자산 검증', clicks: '9.1k', badge: 'predict' },
  { rank: 4, title: '북한 조선소 변화', clicks: '8.3k', badge: 'northpaper' },
  { rank: 5, title: 'EUDR 코코아 공급망', clicks: '6.7k', badge: 'warden' },
];

const POPULAR_POSTS = [
  { rank: 1, title: '국내 정유시설 메탄 배출 위성 검증 — EU 규제 대응', author: 'Warden팀', views: '3.1k' },
  { rank: 2, title: '태양광 발전소 패널 이상 탐지 — 위성 자산 검증', author: 'Predict팀', views: '2.4k' },
  { rank: 3, title: 'Santa Rosa Island 산불 확산 위성 추적', author: 'Citadel팀', views: '1.8k' },
  { rank: 4, title: 'EUDR 코코아 원산지 산림 전용 모니터링', author: 'Warden팀', views: '1.5k' },
  { rank: 5, title: '호르무즈 봉쇄 후 원유 이동 경로 분석', author: 'Predict팀', views: '1.2k' },
];

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
      const params = new URLSearchParams({ type: 'all', limit: '30' });
      const res = await fetch(`/api/dashboard/feed?${params}`);
      const data = await res.json();
      setFeedItems(data.items);
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

  const CHAT_SUGGESTIONS = [
    '서울 강남 최신 영상 보여줘',
    '제주도 NDVI 변화 분석',
    '이번 주 재난 요약',
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ===== FEATURED HERO (Bloomberg-style) ===== */}
      <section
        className="relative overflow-hidden cursor-pointer"
        style={{
          minHeight: 400,
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(14,14,16,0.97) 0%, rgba(14,14,16,0.7) 55%, transparent 100%)',
          }}
        />
        <div
          className="absolute top-0 right-0 w-[55%] h-full pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(61,90,128,0.03) 3px, rgba(61,90,128,0.03) 4px), radial-gradient(ellipse at 60% 50%, rgba(61,90,128,0.12), transparent 70%)',
          }}
        />
        {editorPick ? (
          <Link href="/interactive/north-korean-shipyards" className="block relative z-10">
            <div className="max-w-6xl mx-auto px-6 py-16">
              <div className="flex items-center gap-2 mb-5">
                <span className="inline-block w-6 h-px" style={{ background: 'var(--accent)' }} />
                <span className="text-xs font-mono tracking-[0.15em] uppercase font-semibold" style={{ color: '#3D5A80' }}>
                  Northpaper Original · 방위 분석
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 max-w-2xl" style={{ color: 'var(--text)' }}>
                {editorPick.title}
              </h1>
              <p className="text-sm md:text-base leading-relaxed max-w-xl mb-6" style={{ color: 'var(--text-muted)' }}>
                {editorPick.description}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium px-3 py-1.5 rounded" style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                  인터랙티브
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>6분 읽기</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{editorPick.source}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {new Date(editorPick.published_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="max-w-6xl mx-auto px-6 py-16 relative z-10 animate-pulse space-y-4">
            <div className="h-4 w-40 rounded" style={{ background: 'var(--surface-elevated)' }} />
            <div className="h-10 w-96 rounded" style={{ background: 'var(--surface-elevated)' }} />
            <div className="h-5 w-80 rounded" style={{ background: 'var(--surface-elevated)' }} />
          </div>
        )}
      </section>

      {/* ===== CURATED FEED STRIP (auto-scroll, multi-platform) ===== */}
      <section className="py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 px-6 mb-3">
          <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)', animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Live Feed
          </span>
        </div>
        <div
          ref={curatedRef}
          className="flex gap-4 px-6 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {CURATED_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] p-4 rounded-lg cursor-pointer transition-colors hover:bg-[var(--surface-elevated)]"
              style={{ border: `1px solid ${item.color}30`, background: `${item.color}08` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded uppercase"
                  style={{ background: `${item.color}20`, color: item.color }}
                >
                  {item.badge}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug mb-2" style={{ color: 'var(--text)' }}>
                {item.title}
              </p>
              <p className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                {item.sub}
              </p>
            </div>
          ))}
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
            className="px-6 py-8 flex flex-col gap-12"
            style={{ minWidth: 0, borderRight: '1px solid var(--border)' }}
          >
            {/* Shorts Carousel */}
            {shortsItems.length > 0 && (
              <div>
                <SectionHeader title="Shorts" icon="▶" linkText="전체 보기" linkHref="/shorts" />
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
              <div className="grid grid-cols-5 gap-3">
                {PLATFORMS.map((p) => (
                  <Link
                    key={p.key}
                    href={p.href}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg transition-all hover:scale-[1.02]"
                    style={{ border: `1px solid ${p.color}30`, background: `${p.color}08` }}
                  >
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${p.color}25`, color: p.color }}>
                      {p.label[0]}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: p.color }}>{p.label}</span>
                    <span className="text-[10px] text-center" style={{ color: 'var(--text-muted)' }}>{p.desc}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Platform Feed Grid */}
            {platformItems.length > 0 && (
              <div>
                <SectionHeader title="플랫폼 리포트" icon="●" linkText="더 보기" linkHref="/analysis" />
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
            className="px-6 py-8 flex flex-col gap-6"
          >
            {/* AI Assistant (moved from full-width) */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                AI ASSISTANT
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
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg focus:outline-none transition-colors"
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
                      className="px-2 py-1 text-[10px] rounded transition-colors"
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
                        <p className="text-[10px] font-medium" style={{ color: 'var(--text)' }}>내 주문</p>
                        <p className="text-[10px]" style={{ color: 'var(--accent)' }}>{summary.recentOrders.length}건</p>
                      </div>
                    </Link>
                    <Link href="/tasking" className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-[var(--surface-elevated)]" style={{ background: 'var(--surface)' }}>
                      <span className="text-sm">📡</span>
                      <div>
                        <p className="text-[10px] font-medium" style={{ color: 'var(--text)' }}>촬영 요청</p>
                        <p className="text-[10px]" style={{ color: summary.pendingTaskings > 0 ? '#C8923A' : 'var(--text-muted)' }}>
                          {summary.pendingTaskings > 0 ? `${summary.pendingTaskings}건 대기` : '없음'}
                        </p>
                      </div>
                    </Link>
                    <Link href="/core" className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-[var(--surface-elevated)]" style={{ background: 'var(--surface)' }}>
                      <span className="text-sm">🗺️</span>
                      <div>
                        <p className="text-[10px] font-medium" style={{ color: 'var(--text)' }}>위성 영상</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{summary.stats.totalImages}장</p>
                      </div>
                    </Link>
                    <Link href="/quiz" className="flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-[var(--surface-elevated)]" style={{ background: 'var(--surface)' }}>
                      <span className="text-sm">🧠</span>
                      <div>
                        <p className="text-[10px] font-medium" style={{ color: 'var(--text)' }}>퀴즈</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>도전하기</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 오늘의 지구 (Compact) */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium tracking-wider" style={{ color: 'var(--text-muted)' }}>오늘의 지구</p>
                <Link href="/core" className="text-xs font-mono" style={{ color: 'var(--accent)' }}>Core →</Link>
              </div>
              <div className="rounded-lg mb-3 overflow-hidden relative" style={{ height: 100, background: 'var(--surface)' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div style={{ width: 60, height: 70, background: 'rgba(27,191,168,0.15)', borderRadius: '30% 40% 35% 45%', position: 'relative' }}>
                    <span className="absolute top-2 left-3 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
                    <span className="absolute top-5 right-2 w-1.5 h-1.5 rounded-full" style={{ background: '#C45C4A', animation: 'pulse-dot 2s ease-in-out 0.5s infinite' }} />
                    <span className="absolute bottom-4 left-5 w-1 h-1 rounded-full" style={{ background: 'var(--accent)', animation: 'pulse-dot 2s ease-in-out 1s infinite' }} />
                  </div>
                </div>
                <div className="absolute top-2 left-2 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>36.5°N 127.5°E</div>
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
              <p className="text-xs font-medium tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>QUICK ACTIONS</p>
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
                  className="px-2.5 py-1 text-xs rounded transition-colors"
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
                  className="px-2.5 py-1 text-xs rounded transition-colors"
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
                  {TRENDING_SUBJECTS.map((t) => {
                    const platform = PLATFORMS.find((p) => p.key === t.badge);
                    return (
                      <div key={t.rank} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--surface)] cursor-pointer">
                        <span className="text-sm font-bold font-mono w-5 text-center" style={{ color: 'var(--text-muted)' }}>{t.rank}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{t.title}</p>
                          <span className="text-[10px] font-mono uppercase" style={{ color: platform?.color ?? 'var(--text-muted)' }}>
                            {t.badge}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{t.clicks}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {POPULAR_POSTS.map((p) => (
                    <div key={p.rank} className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-[var(--surface)] cursor-pointer">
                      <span className="text-sm font-bold font-mono w-5 text-center" style={{ color: 'var(--text-muted)' }}>{p.rank}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>{p.title}</p>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.author}</span>
                      </div>
                      <span className="text-[10px] font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{p.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Newsletter */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>NEWSLETTER</p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>매주 위성이 포착한 지구의 변화를 받아보세요.</p>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); trackEvent('form_submit', 'newsletter_subscribe', {}); }}>
                <input type="email" placeholder="이메일 주소" className="flex-1 px-3 py-2 rounded-md text-sm"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium" style={{ background: 'var(--accent)', color: '#0E0E10' }}>
                  구독
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-6" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">&copy; {new Date().getFullYear()} EarthPaper by Nara Space</p>
          <div className="flex gap-6 text-xs">
            <Link href="/terms" className="hover:underline">이용약관</Link>
            <Link href="/privacy" className="hover:underline">개인정보처리방침</Link>
            <Link href="/support" className="hover:underline">고객센터</Link>
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

function SectionHeader({ title, icon, linkText, linkHref }: {
  title: string; icon?: string; linkText?: string; linkHref?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
        {icon && <span className="text-xs" style={{ color: 'var(--accent)' }}>{icon}</span>}
        {title}
      </h2>
      {linkText && linkHref && (
        <Link href={linkHref} className="text-xs" style={{ color: 'var(--text-muted)' }}>{linkText} →</Link>
      )}
    </div>
  );
}

function ShortsCard({ item }: { item: FeedItem }) {
  const [playing, setPlaying] = useState(false);
  const views = Number(item.metadata.views ?? 0);
  const youtubeId = String(item.metadata.youtube_id ?? '');

  return (
    <div className="flex-shrink-0 w-[160px] rounded-lg overflow-hidden group" style={{ border: '1px solid var(--border)', aspectRatio: '9/16' }}>
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
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
              >
                <span className="text-white text-lg ml-0.5">▶</span>
              </div>
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }}>
              <p className="text-xs font-medium leading-snug mb-1 line-clamp-2" style={{ color: '#fff' }}>{item.title}</p>
              <p className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views} views
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
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--surface-elevated), var(--surface))' }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div style={{ width: 80, height: 80, background: 'var(--accent)', borderRadius: '40%', filter: 'blur(20px)' }} />
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-mono tracking-wider mb-1" style={{ color: pl.color }}>{pl.label}</p>
        <p className="text-sm font-semibold leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text)' }}>
          {item.title}
        </p>
        {item.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
        )}
        <div className="flex items-center justify-between text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
          <span>{location}</span>
          <span>{new Date(item.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );

  if (item.link_url) return <Link href={item.link_url}>{inner}</Link>;
  return inner;
}

function NewsRow({ item }: { item: FeedItem }) {
  const inner = (
    <div className="flex items-start gap-4 p-4 transition-colors hover:bg-[var(--surface)]" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>NEWS</p>
        <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text)' }}>{item.title}</p>
        {item.description && <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{item.description}</p>}
      </div>
      <span className="text-xs font-mono flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
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
      <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-sm font-bold" style={{ color }}>
        {value} <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>{suffix}</span>
      </p>
    </div>
  );
}

function QuickActionBtn({ href, icon, label, onClick }: { href?: string; icon: string; label: string; onClick?: () => void }) {
  const cls = "flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg transition-colors hover:bg-[var(--surface-elevated)]";
  const style = { background: 'var(--surface)' };
  if (href) {
    return <Link href={href} className={cls} style={style}><span className="text-lg">{icon}</span><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span></Link>;
  }
  return <button onClick={onClick} className={cls} style={style}><span className="text-lg">{icon}</span><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span></button>;
}
