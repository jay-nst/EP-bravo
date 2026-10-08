'use client';

import { useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FeedItem, FeedType, DashboardSummary } from '@/types/dashboard';
import { FEED_BADGE_COLORS, FEED_LABELS } from '@/types/dashboard';
import { trackEvent } from '@/lib/analytics';
import { fmtNum } from '@/lib/format';
import dynamic from 'next/dynamic';
import NewsletterForm from '@/components/home/NewsletterForm';
import { Button, Card, Field, Input, Skeleton, Spinner, StatusChip, Tabs } from '@naraspace-technology/nds/components';
import {
  IconArrowRight,
  IconHelpCircle,
  IconMap,
  IconMessageSquare,
  IconPlay,
  IconSatelliteSignal,
  IconShoppingBag,
  IconShuffle,
} from '@naraspace-technology/nds/icons';

const MiniMap = dynamic(() => import('./MiniMap'), { ssr: false });

// color = 플랫폼 색 — 마크(점)·hover 테두리 (운영 색, §8)
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
    <div className="flex flex-col min-h-screen bg-bg-tertiary">
      {/* ===== BREAKING STRIP ===== */}
      <BreakingStrip items={feedItems} />

      {/* ===== FEATURED HERO (Bloomberg-style) ===== */}
      <section className="relative overflow-hidden cursor-pointer min-h-280 md:min-h-400 bg-bg-secondary border-b border-border-tertiary">
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
        {/* Left-side gradient overlay for text readability (운영 색, §8) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, rgba(14,14,16,0.97) 0%, rgba(14,14,16,0.82) 45%, rgba(14,14,16,0.4) 75%, rgba(14,14,16,0.25) 100%)',
          }}
        />
        {/* Subtle scanline texture (운영 색, §8) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(27,191,168,0.015) 3px, rgba(27,191,168,0.015) 4px)',
          }}
        />
        {editorPick ? (
          <Link href="/interactive/north-korean-shipyards" className="block relative z-10">
            <div className="max-w-6xl mx-auto px-16 md:px-24 py-40 md:py-64">
              {/* kicker → NDS StatusChip neutral (§7-1). 운영 색: 배경 없음, accent 마크 + Northpaper 색 글자 (§8) */}
              <StatusChip
                status="neutral"
                icon={<PlatformDot color="var(--accent)" />}
                className="mb-16 md:mb-20 bg-transparent text-[#3D5A80]"
              >
                Northpaper Original · 방위 분석
              </StatusChip>
              <h1 className="text-heading-3xl md:text-display-md text-text-primary mb-12 md:mb-16 max-w-2xl">
                {editorPick.title}
              </h1>
              <p className="text-body-md-regular text-text-tertiary max-w-xl mb-20 md:mb-24">
                {editorPick.description}
              </p>
              <div className="flex items-center gap-12 md:gap-16 flex-wrap">
                <StatusChip
                  status="brand"
                  variant="outline"
                  showIcon={false}
                  className="text-text-interactive-primary inset-ring-border-interactive-primary"
                >
                  인터랙티브
                </StatusChip>
                <span className="text-body-xs-regular text-text-tertiary tabular-nums">6분 읽기</span>
                <span className="text-body-xs-regular text-text-tertiary hidden sm:inline">{editorPick.source}</span>
                <span className="text-body-xs-regular text-text-tertiary tabular-nums">
                  {new Date(editorPick.published_at).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="max-w-6xl mx-auto px-16 md:px-24 py-40 md:py-64 relative z-10">
            <Skeleton.Group orientation="vertical">
              <Skeleton.Item variant="content" className="w-160" />
              <Skeleton.Item variant="title" className="w-full max-w-384" />
              <Skeleton.Item variant="subtitle" className="w-full max-w-320" />
            </Skeleton.Group>
          </div>
        )}
      </section>

      {/* ===== CURATED FEED STRIP (auto-scroll, multi-platform) ===== */}
      <section className="py-16 border-b border-border-tertiary">
        {/* eyebrow 라벨 → h2 섹션 제목 (다른 섹션 제목과 같은 클래스, §7-1) */}
        <div className="flex items-center gap-8 px-16 md:px-24 mb-16">
          <span className="w-8 h-8 rounded-full bg-bg-interactive-primary" style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
          <h2 className="text-heading-2xl text-text-tertiary">
            Live Feed
          </h2>
        </div>
        <div
          ref={curatedRef}
          className="flex gap-12 md:gap-16 px-16 md:px-24 overflow-x-auto [scrollbar-width:none]"
        >
          {curatedItems.map((item) => {
            const isExternal = item.linkAction === 'external' && item.href.startsWith('http');
            return (
              <Card.Root
                key={item.id}
                interactive
                render={
                  isExternal
                    ? <a href={item.href} target="_blank" rel="noopener noreferrer" />
                    : <Link href={item.href} />
                }
                // 운영 색: 플랫폼 틴트 박스(color+08) + 테두리(color+30), hover 시 surface-elevated (§8)
                className="shrink-0 w-240 md:w-280 bg-(--tint) inset-ring-(--edge) hover:bg-bg-primary hover:inset-ring-(--edge)"
                style={{ '--tint': `${item.color}08`, '--edge': `${item.color}30` } as React.CSSProperties}
              >
                <Card.Body className="gap-8">
                  {/* 플랫폼 배지 — NDS StatusChip, 운영 색 (color+20 틴트 + 플랫폼 색 글자, §8) */}
                  <StatusChip
                    status="neutral"
                    icon={<PlatformDot color={item.color} />}
                    className="self-start"
                    style={{ background: `${item.color}20`, color: item.color }}
                  >
                    {item.badge}
                  </StatusChip>
                  <Card.Title>{item.title}</Card.Title>
                  <p className="text-body-xs-regular text-text-tertiary tabular-nums">
                    {item.sub}
                  </p>
                </Card.Body>
              </Card.Root>
            );
          })}
        </div>
      </section>

      {/* ===== MAGAZINE GRID (2/3 + 1/3) ===== */}
      <section className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] border-b border-border-tertiary">
          {/* === MAIN COLUMN === */}
          <div className="px-16 md:px-24 py-32 flex flex-col gap-48 min-w-0 border-border-tertiary lg:border-r">
            {/* Shorts Carousel */}
            {shortsItems.length > 0 && (
              <div>
                <SectionHeader
                  title="Shorts"
                  icon={<IconPlay className="size-16 text-icon-interactive-primary" />}
                  linkText="전체 보기"
                  linkHref="https://www.youtube.com/@naraspace/shorts"
                  external
                />
                <div className="flex gap-16 overflow-x-auto pb-4 [scrollbar-width:none]">
                  {shortsItems.map((item) => (
                    <ShortsCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Platform Navigation */}
            <div>
              <SectionHeader title="플랫폼" />
              {/* 플랫폼 링크 카드 — landing/OtherSolutions 와 같은 anatomy·클래스 */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12">
                {PLATFORMS.map((p) => (
                  <Card.Root
                    key={p.key}
                    interactive
                    // 운영 색: surface 박스 + border 테두리, hover 시 테두리만 플랫폼 색 (§8)
                    className="bg-bg-secondary hover:bg-bg-secondary hover:inset-ring-(--c)"
                    style={{ '--c': p.color } as React.CSSProperties}
                    render={<Link href={p.href} />}
                  >
                    <Card.Body className="gap-4">
                      <Card.Title className="flex items-center gap-8">
                        <PlatformDot color={p.color} />
                        {p.label}
                      </Card.Title>
                      <p className="text-body-xs-regular text-text-tertiary">{p.desc}</p>
                    </Card.Body>
                  </Card.Root>
                ))}
              </div>
            </div>

            {/* Platform Feed Grid */}
            {platformItems.length > 0 && (
              <div>
                <SectionHeader title="플랫폼 리포트" linkText="더 보기" linkHref="https://ep.naraspace.com/ko/post" external />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  {platformItems.slice(0, 6).map((item) => (
                    <AnalysisCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* News List */}
            {newsItems.length > 0 && (
              <div>
                <SectionHeader title="뉴스" />
                <div className="space-y-px">
                  {newsItems.map((item) => (
                    <NewsRow key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {feedLoading && (
              <div className="py-32 flex justify-center">
                <Spinner className="text-(--border)" />
              </div>
            )}
          </div>

          {/* === SIDEBAR === */}
          <aside className="px-16 md:px-24 py-32 flex flex-col gap-24 border-t lg:border-t-0 border-border-tertiary">
            {/* AI Assistant (moved from full-width) */}
            <div className={PANEL_CLASS}>
              <h3 className={PANEL_TITLE_CLASS}>
                EP AGENT
              </h3>
              <form onSubmit={handleChatSubmit}>
                <Field.Root name="chat" className="mb-8">
                  <Field.Label className="sr-only">EP Agent 질문</Field.Label>
                  <Input
                    type="text"
                    leftIcon={<IconMessageSquare className="text-text-tertiary" />}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="위성 영상에 대해 물어보세요..."
                    className="bg-bg-secondary has-not-aria-invalid:not-data-disabled:hover:inset-ring-border-tertiary"
                  />
                </Field.Root>
                <div className="flex flex-wrap gap-6">
                  {CHAT_SUGGESTIONS.map((q) => (
                    <Button
                      key={q}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={SUGGESTION_COLOR_CLASS}
                      onClick={() => {
                        setChatInput(q);
                        trackEvent('chat_from_home', 'suggestion_click', { query: q });
                        router.push('/chat');
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </form>
              {/* Personalized services (logged-in state) */}
              {summary && (
                <div className="mt-12 pt-12 border-t border-border-tertiary">
                  <div className="grid grid-cols-2 gap-8">
                    <Link href="/portal" className={SERVICE_TILE_CLASS}>
                      <IconShoppingBag className="size-16 text-icon-secondary shrink-0" />
                      <div>
                        <p className={TILE_LABEL_CLASS}>내 주문</p>
                        <p className={`${TILE_VALUE_CLASS} text-text-interactive-primary`}>{fmtNum(summary.recentOrders.length)}건</p>
                      </div>
                    </Link>
                    <Link href="/tasking" className={SERVICE_TILE_CLASS}>
                      <IconSatelliteSignal className="size-16 text-icon-secondary shrink-0" />
                      <div>
                        <p className={TILE_LABEL_CLASS}>촬영 요청</p>
                        <p className={`${TILE_VALUE_CLASS} ${summary.pendingTaskings > 0 ? 'text-[#C8923A]' : 'text-text-tertiary'}`}>
                          {summary.pendingTaskings > 0 ? `${fmtNum(summary.pendingTaskings)}건 대기` : '없음'}
                        </p>
                      </div>
                    </Link>
                    <Link href="/core" className={SERVICE_TILE_CLASS}>
                      <IconMap className="size-16 text-icon-secondary shrink-0" />
                      <div>
                        <p className={TILE_LABEL_CLASS}>위성 영상</p>
                        <p className={`${TILE_VALUE_CLASS} text-text-tertiary`}>{fmtNum(summary.stats.totalImages)}장</p>
                      </div>
                    </Link>
                    <Link href="/quiz" className={SERVICE_TILE_CLASS}>
                      <IconHelpCircle className="size-16 text-icon-secondary shrink-0" />
                      <div>
                        <p className={TILE_LABEL_CLASS}>퀴즈</p>
                        <p className={`${TILE_VALUE_CLASS} text-text-tertiary`}>도전하기</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 오늘의 지구 (Compact) */}
            <div className={PANEL_CLASS}>
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-heading-lg text-text-tertiary">오늘의 지구</h3>
                <Button
                  variant="text"
                  size="sm"
                  className="text-text-interactive-primary! [&_svg]:text-text-interactive-primary!"
                  rightIcon={<IconArrowRight />}
                  render={<Link href="/core" />}
                  nativeButton={false}
                >
                  Core
                </Button>
              </div>
              <div className="mb-12">
                <MiniMap />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <MetricItem label="활성 재난" value="2" suffix="건" tone="danger" color="#C45C4A" />
                <MetricItem label="대기질" value="보통" suffix="" color="var(--accent)" />
                <MetricItem label="신규 영상" value="+47" suffix="장" color="var(--accent)" />
                <MetricItem label="위성수" value="5" suffix="기" color="var(--text-muted)" />
              </div>
            </div>

            {/* Quick Actions (1x3, no AI chat) */}
            <div className={PANEL_CLASS}>
              <h3 className={PANEL_TITLE_CLASS}>QUICK ACTIONS</h3>
              <div className="grid grid-cols-3 gap-8">
                <QuickActionBtn href="/core" icon={<IconMap className="size-20 text-icon-secondary" />} label="위성지도" />
                <QuickActionBtn icon={<IconShuffle className="size-20 text-icon-secondary" />} label="랜덤 탐험" onClick={randomExplore} />
                <QuickActionBtn href="/tasking" icon={<IconSatelliteSignal className="size-20 text-icon-secondary" />} label="촬영 요청" />
              </div>
            </div>

            {/* Trending Subjects (with tabs) */}
            <div className={PANEL_CLASS}>
              <Tabs.Root
                value={trendingTab}
                onValueChange={(v) => {
                  if (v === 'subjects' || v === 'posts') setTrendingTab(v);
                }}
              >
                <Tabs.List variant="solid" size="sm" className={`mb-12 ${TABS_LIST_COLOR_CLASS}`}>
                  <Tabs.Tab value="subjects" className={TAB_COLOR_CLASS}>Trending</Tabs.Tab>
                  <Tabs.Tab value="posts" className={TAB_COLOR_CLASS}>인기 글</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="subjects">
                  <div className="space-y-6">
                    {trendingSubjects.map((t) => {
                      const badgeColor: string | undefined = FEED_BADGE_COLORS[t.badge];
                      return (
                        <div key={t.rank} className={RANK_ROW_CLASS}>
                          <span className="text-body-md-medium text-text-tertiary tabular-nums w-20 text-center">{t.rank}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-body-sm-medium text-text-primary truncate">{t.title}</p>
                            {/* 분류 — 운영 색: 배지 색 글자 (없으면 muted, §8) */}
                            <span
                              className="inline-flex items-center gap-4 text-body-xs-regular uppercase"
                              style={{ color: badgeColor ?? 'var(--text-muted)' }}
                            >
                              {badgeColor && <PlatformDot color={badgeColor} />}
                              {t.badge}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {trendingSubjects.length === 0 && (
                      <p className="text-body-xs-regular text-text-tertiary py-16 text-center">{feedLoading ? '트렌딩 데이터 로딩 중...' : '트렌딩 데이터 없음'}</p>
                    )}
                  </div>
                </Tabs.Panel>

                <Tabs.Panel value="posts">
                  <div className="space-y-6">
                    {popularPosts.map((p) => (
                      <div key={p.rank} className={RANK_ROW_CLASS}>
                        <span className="text-body-md-medium text-text-tertiary tabular-nums w-20 text-center">{p.rank}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-body-sm-medium text-text-primary truncate">{p.title}</p>
                          <span className="text-body-xs-regular text-text-tertiary">{p.author}</span>
                        </div>
                      </div>
                    ))}
                    {popularPosts.length === 0 && (
                      <p className="text-body-xs-regular text-text-tertiary py-16 text-center">{feedLoading ? '데이터 로딩 중...' : '데이터 없음'}</p>
                    )}
                  </div>
                </Tabs.Panel>
              </Tabs.Root>
            </div>

            {/* Newsletter */}
            <div className={PANEL_CLASS}>
              <h3 className="text-heading-lg text-text-tertiary mb-4">뉴스레터</h3>
              <p className="text-body-sm-regular text-text-tertiary mb-12">매주 위성이 포착한 지구의 변화를 받아보세요.</p>
              <NewsletterForm />
            </div>
          </aside>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-32 px-16 md:px-24 border-t border-border-tertiary text-text-tertiary">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <p className="text-body-xs-regular">&copy; {new Date().getFullYear()} EarthPaper by Nara Space</p>
          <div className="flex gap-24 text-body-xs-regular">
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

// 사이드바 패널 — NDS Card 와 같은 표면 (안에 상호작용 요소가 섞여 있어 Card 대신 클래스)
const PANEL_CLASS = 'rounded-lg p-16 bg-bg-tertiary inset-ring-1 inset-ring-border-tertiary';
// 표면 안의 작은 타일
const SERVICE_TILE_CLASS = 'flex items-center gap-8 p-8 rounded-md bg-bg-secondary transition-colors hover:bg-bg-primary';
const RANK_ROW_CLASS = 'flex items-center gap-12 p-8 rounded-sm transition-colors hover:bg-bg-secondary cursor-pointer';
// 사이드바 패널 제목 = 카드·블록 제목 역할 (§7-1)
const PANEL_TITLE_CLASS = 'text-heading-lg text-text-tertiary mb-12';
// 타일 라벨 = 메타, 값 = 강조 수치 (MetricItem 과 같은 위계). 색은 운영 그대로 (§8)
const TILE_LABEL_CLASS = 'text-body-xs-regular text-text-primary';
// 운영 색 (§8) — 추천 질문: surface 배경 + muted 글자 + border 테두리, hover 변화 없음
const SUGGESTION_COLOR_CLASS =
  'bg-bg-secondary text-text-tertiary inset-ring-border-tertiary not-data-disabled:not-aria-invalid:hover:bg-bg-secondary not-data-disabled:not-aria-invalid:hover:inset-ring-border-tertiary';
// 운영 색 (§8) — 탭: 목록 배경 없음, 활성 = surface-elevated + text + border, 비활성 = muted + 투명 테두리
const TABS_LIST_COLOR_CLASS = 'bg-transparent [&>[data-slot=tabs-indicator]]:bg-bg-primary!';
const TAB_COLOR_CLASS =
  'data-active:text-text-primary! not-data-active:text-text-tertiary not-data-active:hover:text-text-tertiary not-data-active:border-transparent!';
const TILE_VALUE_CLASS = 'text-body-sm-medium tabular-nums';

// 플랫폼 마크(점)
function PlatformDot({ color }: { color: string }) {
  return <span className="size-8 rounded-full shrink-0" style={{ background: color }} />;
}

function SectionHeader({ title, icon, linkText, linkHref, external }: {
  title: string; icon?: ReactNode; linkText?: string; linkHref?: string; external?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-16">
      <h2 className="text-heading-2xl text-text-primary flex items-center gap-8">
        {icon}
        {title}
      </h2>
      {linkText && linkHref && (
        <Button
          variant="text"
          size="sm"
          className="text-text-tertiary! [&_svg]:text-text-tertiary!"
          rightIcon={<IconArrowRight />}
          render={
            external
              ? <a href={linkHref} target="_blank" rel="noopener noreferrer" />
              : <Link href={linkHref} />
          }
          nativeButton={false}
        >
          {linkText}
        </Button>
      )}
    </div>
  );
}

function ShortsCard({ item }: { item: FeedItem }) {
  const [playing, setPlaying] = useState(false);
  const views = Number(item.metadata.views ?? 0);
  const youtubeId = String(item.metadata.youtube_id ?? '');

  // 영상이 카드 전체를 채워 inset-ring 이 가려지므로 테두리는 border 로 둔다
  return (
    <div className="shrink-0 w-130 md:w-160 aspect-9/16 rounded-md overflow-hidden group border border-border-tertiary">
      <div className="relative w-full h-full bg-bg-secondary">
        {playing && youtubeId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&loop=1&playlist=${youtubeId}&controls=1&modestbranding=1&rel=0`}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        ) : (
          <>
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover brightness-70"
            />
            {/* 썸네일 전체를 덮는 재생 히트 영역 — NDS Button 은 오버레이 형태가 없어 네이티브 유지 */}
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              aria-label="재생"
            >
              <div className="size-48 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-xs transition-transform group-hover:scale-110">
                <IconPlay className="size-24 text-white" />
              </div>
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-12 pointer-events-none bg-linear-to-b from-transparent to-black/85">
              <p className="text-body-sm-medium text-white mb-4 line-clamp-2">{item.title}</p>
              <p className="text-body-xs-regular text-white/70 tabular-nums">
                {views >= 1000 ? `${fmtNum(views / 1000, 1)}k` : fmtNum(views)} 조회
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// color = 플랫폼 라벨 글자·마크(점) 색 (운영 색, §8)
const PLATFORM_LABEL: Record<string, { label: string; color: string }> = {
  predict: { label: 'PREDICT', color: '#4A9EC4' },
  warden: { label: 'WARDEN', color: '#6B8A5E' },
  northpaper: { label: 'NORTHPAPER', color: '#3D5A80' },
  analysis: { label: 'ANALYSIS', color: '#22d3ee' },
};

// 운영 색 (§8): surface 박스 + border 테두리, hover 시 제목만 accent
const ANALYSIS_CARD_COLOR_CLASS = 'group bg-bg-secondary hover:bg-bg-secondary hover:inset-ring-border-tertiary';

function AnalysisCard({ item }: { item: FeedItem }) {
  const pl = PLATFORM_LABEL[item.type] ?? { label: item.type.toUpperCase(), color: 'var(--text-muted)' };
  const location = String(item.metadata.location ?? '');

  const content = (
    <>
      {item.thumbnail_url ? (
        <div className="relative">
          <Card.Image src={item.thumbnail_url} alt={item.title} loading="lazy" className="h-160 w-full" />
          {/* 썸네일 하단 surface 그라데이션 (운영 색, §8) */}
          <div className="absolute inset-0 rounded-md pointer-events-none bg-linear-to-t from-bg-secondary to-transparent to-60%" />
        </div>
      ) : (
        <div className="relative h-160 rounded-md overflow-hidden bg-linear-135 from-bg-primary to-bg-secondary">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="size-80 rounded-full bg-bg-interactive-primary blur-[20px]" />
          </div>
        </div>
      )}
      <Card.Body className="gap-8">
        {/* 플랫폼 라벨 — NDS StatusChip, 운영 색 (배경 없음 + 플랫폼 색 글자, §8) */}
        <StatusChip
          status="neutral"
          icon={<PlatformDot color={pl.color} />}
          className="self-start bg-transparent"
          style={{ color: pl.color }}
        >
          {pl.label}
        </StatusChip>
        <Card.Title className="transition-colors group-hover:text-text-interactive-primary">{item.title}</Card.Title>
        {item.description && (
          <Card.Content className="line-clamp-2 text-text-tertiary">{item.description}</Card.Content>
        )}
        <div className="flex items-center justify-between text-body-xs-regular text-text-tertiary tabular-nums">
          <span>{location}</span>
          <span>{new Date(item.published_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
        </div>
      </Card.Body>
    </>
  );

  if (item.link_url && item.link_action === 'external') {
    return (
      <Card.Root interactive className={ANALYSIS_CARD_COLOR_CLASS} render={<a href={item.link_url} target="_blank" rel="noopener noreferrer" />}>
        {content}
      </Card.Root>
    );
  }
  if (item.link_url) {
    return <Card.Root interactive className={ANALYSIS_CARD_COLOR_CLASS} render={<Link href={item.link_url} />}>{content}</Card.Root>;
  }
  return <Card.Root className={ANALYSIS_CARD_COLOR_CLASS}>{content}</Card.Root>;
}

function NewsRow({ item }: { item: FeedItem }) {
  const inner = (
    <div className="flex items-start gap-16 p-16 transition-colors hover:bg-bg-secondary border-b border-border-tertiary">
      <div className="flex-1 min-w-0">
        <p className="text-body-xs-regular text-text-tertiary mb-4">NEWS</p>
        <p className="text-body-md-medium text-text-primary">{item.title}</p>
        {item.description && <p className="text-body-sm-regular text-text-tertiary mt-4 line-clamp-1">{item.description}</p>}
      </div>
      <span className="text-body-xs-regular text-text-tertiary tabular-nums shrink-0">
        {new Date(item.published_at).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
      </span>
    </div>
  );

  if (item.link_url && item.link_action === 'navigate') return <Link href={item.link_url}>{inner}</Link>;
  if (item.link_url && item.link_action === 'external') return <a href={item.link_url} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return inner;
}

// 강조 수치 — 기본 primary, 의미가 있는 값(위험)만 status 토큰. color 가 있으면 운영 색 우선 (§8)
function MetricItem({ label, value, suffix, tone = 'default', color }: { label: string; value: string; suffix: string; tone?: 'default' | 'danger'; color?: string }) {
  return (
    <div className="p-8 rounded-md bg-bg-secondary">
      <p className="text-body-xs-regular text-text-tertiary mb-2">{label}</p>
      <p
        className={`text-body-sm-medium tabular-nums ${tone === 'danger' ? 'text-status-danger' : 'text-text-primary'}`}
        style={color ? { color } : undefined}
      >
        {value} <span className="text-body-xs-regular text-text-tertiary">{suffix}</span>
      </p>
    </div>
  );
}

// 빠른 실행 타일 — 링크와 버튼이 같은 모양이어야 해서 NDS Card interactive 로 통일
// (render 없으면 Card 가 button semantics·키보드 활성화를 준다)
function QuickActionBtn({ href, icon, label, onClick }: { href?: string; icon: ReactNode; label: string; onClick?: () => void }) {
  const body = (
    <>
      {icon}
      <span className="text-body-sm-regular text-text-tertiary">{label}</span>
    </>
  );
  // 운영 색 (§8): surface 타일, 테두리 없음, hover 시 surface-elevated
  const cls = 'items-center justify-center gap-6 p-12 bg-bg-secondary inset-ring-transparent hover:bg-bg-primary hover:inset-ring-transparent';
  if (href) {
    return <Card.Root interactive render={<Link href={href} />} className={cls}>{body}</Card.Root>;
  }
  return <Card.Root interactive onClick={onClick} className={cls}>{body}</Card.Root>;
}

// 심각도 = 상태 의미 → NDS StatusChip status. color = 운영 배지 색 (글자 + color+18 틴트, §8)
type SeverityStatus = 'error' | 'warning' | 'alert';
const SEVERITY_LABEL: Record<string, { text: string; status: SeverityStatus; color: string }> = {
  critical: { text: 'CRITICAL', status: 'error', color: '#C45C4A' },
  high: { text: 'HIGH', status: 'warning', color: '#E07B5F' },
  medium: { text: 'MEDIUM', status: 'alert', color: '#C8923A' },
};

// 속보 띠 — Citadel 틴트 (운영 색, §8)
const BREAKING_WRAP_CLASS = 'block bg-[rgba(196,92,74,0.06)] border-b border-[rgba(196,92,74,0.15)]';

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

  const sev = SEVERITY_LABEL[String(current.metadata.severity)] ?? { text: 'ALERT', status: 'alert', color: '#C8923A' };
  const location = String(current.metadata.location ?? '');
  const isExternal = current.link_url?.startsWith('http');

  const flipTransform =
    flipState === 'flip-out' ? 'rotateX(90deg)' :
    flipState === 'flip-in' ? 'rotateX(-90deg)' : 'rotateX(0deg)';
  const flipOpacity = flipState === 'idle' ? 1 : 0;

  const inner = (
    <div className="max-w-6xl mx-auto px-24 py-8 flex items-center gap-12 perspective-[600px]">
      <span className="inline-flex items-center gap-6 shrink-0 text-body-xs-regular text-citadel">
        {/* Citadel 플랫폼 마크(점) */}
        <span className="size-6 rounded-full bg-citadel" style={{ animation: 'pulse-dot 1.5s ease-in-out infinite' }} />
        CITADEL
      </span>

      <div className="flex-1 overflow-hidden relative">
        <div
          className="flex items-center gap-8"
          style={{
            transform: flipTransform,
            opacity: flipOpacity,
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease',
            transformOrigin: flipState === 'flip-out' ? 'bottom center' : 'top center',
          }}
        >
          <StatusChip
            status={sev.status}
            showIcon={false}
            className="shrink-0"
            style={{ background: `${sev.color}18`, color: sev.color }}
          >
            {sev.text}
          </StatusChip>
          <span className="truncate text-body-sm-medium text-text-primary">
            {current.title}
          </span>
          {location && (
            <span className="shrink-0 hidden sm:inline text-body-xs-regular text-text-tertiary">
              {location}
            </span>
          )}
        </div>
      </div>

      {citadelItems.length > 1 && (
        <span className="shrink-0 text-body-xs-regular text-text-tertiary tabular-nums">
          {(currentIdx % citadelItems.length) + 1}/{citadelItems.length}
        </span>
      )}
    </div>
  );

  if (isExternal && current.link_url) {
    return <a href={current.link_url} target="_blank" rel="noopener noreferrer" className={BREAKING_WRAP_CLASS}>{inner}</a>;
  }
  if (current.link_url) {
    return <Link href={current.link_url} className={BREAKING_WRAP_CLASS}>{inner}</Link>;
  }
  return <div className={BREAKING_WRAP_CLASS}>{inner}</div>;
}
