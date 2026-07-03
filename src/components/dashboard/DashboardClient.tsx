'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { FeedItem, FeedType, DashboardSummary } from '@/types/dashboard';
import { FEED_BADGE_COLORS, FEED_LABELS } from '@/types/dashboard';
import { trackEvent } from '@/lib/analytics';

const FEED_FILTERS: Array<{ key: FeedType | 'all'; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'tempest', label: '재난' },
  { key: 'analysis', label: '분석' },
  { key: 'news', label: '뉴스' },
  { key: 'community', label: '포스트' },
  { key: 'shorts', label: '숏츠' },
  { key: 'trending', label: '트렌딩' },
];

const SEVERITY_STYLE: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(196,92,74,0.15)', text: '#C45C4A' },
  high: { bg: 'rgba(196,92,74,0.10)', text: '#C45C4A' },
  moderate: { bg: 'var(--surface-elevated)', text: 'var(--text-muted)' },
  low: { bg: 'var(--surface-elevated)', text: 'var(--text-muted)' },
};

export default function DashboardClient() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedFilter, setFeedFilter] = useState<FeedType | 'all'>('all');
  const [feedCursor, setFeedCursor] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => {});
  }, []);

  const loadFeed = useCallback(
    async (filter: FeedType | 'all', cursor?: string | null) => {
      setFeedLoading(true);
      try {
        const params = new URLSearchParams({ type: filter, limit: '10' });
        if (cursor) params.set('cursor', cursor);
        const res = await fetch(`/api/dashboard/feed?${params}`);
        const data = await res.json();
        setFeedItems((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setFeedCursor(data.nextCursor);
      } catch {
        /* ignore */
      } finally {
        setFeedLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setFeedItems([]);
    setFeedCursor(null);
    loadFeed(feedFilter);
  }, [feedFilter, loadFeed]);

  const handleLoadMore = () => {
    if (feedCursor && !feedLoading) loadFeed(feedFilter, feedCursor);
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

  const editorPick = summary?.dailyScene;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Hero: Editor's Pick */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #080a12 0%, #0E0E10 40%, #0a1210 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(27,191,168,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--accent)', animation: 'ep-count-pulse 2s ease-in-out infinite' }}
            />
            <span className="text-xs font-mono tracking-[0.15em] uppercase" style={{ color: 'var(--accent)' }}>
              Editor&apos;s Pick
            </span>
          </div>
          {editorPick ? (
            <Link href="/core" className="block group">
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight mb-3" style={{ color: 'var(--text)' }}>
                {editorPick.location}
              </h1>
              <p className="text-sm leading-relaxed max-w-xl mb-4" style={{ color: 'var(--text-muted)' }}>
                {editorPick.satellite} {editorPick.resolution} 해상도로 촬영된 최신 위성 영상.
                지도에서 직접 확인하고 분석해보세요.
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{editorPick.satellite}</span>
                <span style={{ color: 'var(--border)' }}>&middot;</span>
                <span>{editorPick.resolution}</span>
                <span style={{ color: 'var(--border)' }}>&middot;</span>
                <span>{new Date(editorPick.acquired_at).toLocaleDateString('ko-KR')}</span>
              </div>
            </Link>
          ) : (
            <div className="animate-pulse space-y-3">
              <div className="h-8 w-64 rounded" style={{ background: 'var(--surface)' }} />
              <div className="h-4 w-96 rounded" style={{ background: 'var(--surface)' }} />
              <div className="h-3 w-48 rounded" style={{ background: 'var(--surface)' }} />
            </div>
          )}
        </div>
      </section>

      {/* Main Content: Feed + Sidebar */}
      <section className="px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed (2/3) */}
          <div className="lg:col-span-2">
            {/* Filter Tabs */}
            <div className="flex gap-1.5 flex-wrap mb-5">
              {FEED_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFeedFilter(f.key)}
                  className="px-3 py-2 text-xs rounded-md transition-colors"
                  style={{
                    background: feedFilter === f.key ? 'var(--surface-elevated)' : 'transparent',
                    color: feedFilter === f.key ? 'var(--text)' : 'var(--text-muted)',
                    border: feedFilter === f.key ? '1px solid var(--border)' : '1px solid transparent',
                    minHeight: '36px',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Feed Items */}
            <div className="space-y-3">
              {feedItems.map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
              {feedLoading && (
                <div className="py-8 text-center">
                  <div
                    className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                    style={{ borderColor: 'var(--border)', borderTopColor: 'transparent' }}
                  />
                </div>
              )}
              {feedCursor && !feedLoading && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-3 text-sm rounded-lg transition-colors"
                  style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                >
                  더 보기
                </button>
              )}
              {!feedLoading && feedItems.length === 0 && (
                <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>
                  표시할 콘텐츠가 없습니다
                </p>
              )}
              <div ref={feedEndRef} />
            </div>
          </div>

          {/* Sidebar (1/3) */}
          <aside className="space-y-5 lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:self-start">
            {/* Quick Actions */}
            <div className="rounded-xl p-4 space-y-2" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                QUICK ACTIONS
              </p>
              <Link
                href="/core"
                className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
                style={{ background: 'var(--surface)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(27,191,168,0.1)' }}>
                  🗺️
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>위성 지도</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>공공데이터 레이어 탐색</p>
                </div>
              </Link>
              <button
                onClick={randomExplore}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left"
                style={{ background: 'var(--surface)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(245,158,11,0.1)' }}>
                  🎲
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>랜덤 탐험</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>지구 어딘가를 탐험</p>
                </div>
              </button>
              <Link
                href="/chat"
                className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
                style={{ background: 'var(--surface)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(139,92,246,0.1)' }}>
                  💬
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>AI 어시스턴트</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>위성 영상 질문</p>
                </div>
              </Link>
              <Link
                href="/tasking"
                className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
                style={{ background: 'var(--surface)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: 'rgba(200,146,58,0.1)' }}>
                  📡
                </span>
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>촬영 요청</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>신규 촬영 신청</p>
                  </div>
                  {summary && summary.pendingTaskings > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(200,146,58,0.2)', color: '#C8923A' }}>
                      {summary.pendingTaskings}
                    </span>
                  )}
                </div>
              </Link>
            </div>

            {/* Trending Locations */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                TRENDING
              </p>
              <div className="space-y-2">
                {feedItems
                  .filter((item) => item.type === 'trending')
                  .slice(0, 3)
                  .map((item) => (
                    <Link
                      key={item.id}
                      href={item.link_url ?? '/core'}
                      className="flex items-center justify-between p-2 rounded-lg transition-colors"
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold" style={{ color: '#f59e0b' }}>
                          #{String(item.metadata.rank)}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text)' }}>{item.title}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {String(item.metadata.resolution)}
                      </span>
                    </Link>
                  ))}
              </div>
            </div>

            {/* Watchlist */}
            {summary && summary.watchlist.length > 0 && (
              <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    WATCHLIST
                  </p>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {summary.watchlist.length}개
                  </span>
                </div>
                <div className="space-y-1.5">
                  {summary.watchlist.map((area) => (
                    <Link
                      key={area.id}
                      href={`/core?lat=${area.geometry.coordinates[0][0][1]}&lng=${area.geometry.coordinates[0][0][0]}&zoom=13`}
                      className="flex items-center justify-between p-2 rounded-lg transition-colors"
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="text-sm" style={{ color: 'var(--text)' }}>{area.name}</span>
                      {area.new_images_count > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full font-mono" style={{ background: 'rgba(27,191,168,0.15)', color: 'var(--accent)' }}>
                          +{area.new_images_count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Newsletter */}
            <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-medium tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                NEWSLETTER
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                매주 위성이 포착한 지구의 변화를 받아보세요.
              </p>
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  trackEvent('form_submit', 'newsletter_subscribe', {});
                }}
              >
                <input
                  type="email"
                  placeholder="이메일 주소"
                  className="flex-1 px-3 py-2 rounded-md text-sm"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{ background: 'var(--accent)', color: '#0E0E10' }}
                >
                  구독
                </button>
              </form>
            </div>
          </aside>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
            <div>
              <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>EARTHPAPER</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>위성 영상 분석 플랫폼</p>
            </div>
            <div className="flex gap-10">
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>플랫폼</p>
                <nav className="flex flex-col gap-0.5">
                  <Link href="/core" className="text-xs py-2.5 hover:underline" style={{ color: 'var(--text-muted)' }}>Core</Link>
                  <Link href="/daily" className="text-xs py-2.5 hover:underline" style={{ color: 'var(--text-muted)' }}>오늘의 지구</Link>
                  <Link href="/posts" className="text-xs py-2.5 hover:underline" style={{ color: 'var(--text-muted)' }}>위성뷰</Link>
                </nav>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>서비스</p>
                <nav className="flex flex-col gap-0.5">
                  <Link href="/map" className="text-xs py-2.5 hover:underline" style={{ color: 'var(--text-muted)' }}>위성 지도</Link>
                  <Link href="/chat" className="text-xs py-2.5 hover:underline" style={{ color: 'var(--text-muted)' }}>AI 채팅</Link>
                  <Link href="/tasking" className="text-xs py-2.5 hover:underline" style={{ color: 'var(--text-muted)' }}>촬영 요청</Link>
                </nav>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>계정</p>
                <nav className="flex flex-col gap-0.5">
                  <Link href="/portal" className="text-xs py-2.5 hover:underline" style={{ color: 'var(--text-muted)' }}>내 주문</Link>
                  <Link href="/quiz" className="text-xs py-2.5 hover:underline" style={{ color: 'var(--text-muted)' }}>퀴즈</Link>
                </nav>
              </div>
            </div>
          </div>
          <div className="pt-4 text-center text-xs" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} SI Analytics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  const badgeColor = FEED_BADGE_COLORS[item.type];
  const label = FEED_LABELS[item.type];
  const severity = SEVERITY_STYLE[String(item.metadata.severity)] ?? SEVERITY_STYLE.moderate;

  const isTempest = item.type === 'tempest';

  const inner = (
    <div
      className="p-4 rounded-xl transition-colors"
      style={{
        border: isTempest ? '1px solid rgba(196,92,74,0.3)' : '1px solid var(--border)',
        background: isTempest ? 'rgba(196,92,74,0.04)' : 'transparent',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs font-medium px-2 py-0.5 rounded"
          style={{ background: `${badgeColor}20`, color: badgeColor }}
        >
          {label}
        </span>
        {isTempest && (
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: severity.bg, color: severity.text }}>
            {String(item.metadata.severity)}
          </span>
        )}
        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {formatRelative(item.published_at)}
        </span>
      </div>
      <p className="text-sm font-medium leading-snug mb-1" style={{ color: 'var(--text)' }}>
        {item.title}
      </p>
      {item.description && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
          {item.description}
        </p>
      )}
      {isTempest && (
        <div className="flex gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{String(item.metadata.event_type)}</span>
          {String(item.metadata.location) && <span>{String(item.metadata.location)}</span>}
          {Boolean(item.metadata.has_satellite_imagery) && (
            <span style={{ color: 'var(--accent)' }}>영상 보유</span>
          )}
        </div>
      )}
      {item.type === 'community' && item.metadata.reactions != null && (
        <CommunityReactions reactions={item.metadata.reactions as { likes: number; comments: number }} />
      )}
      {item.type === 'shorts' && (
        <div className="flex gap-2 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>▶ {(Number(item.metadata.views) / 1000).toFixed(1)}k views</span>
          <span>· {String(item.metadata.duration_sec)}s</span>
        </div>
      )}
      {item.type === 'trending' && (
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-mono font-bold" style={{ color: badgeColor }}>#{String(item.metadata.rank)}</span>
          {String(item.metadata.resolution) && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{String(item.metadata.resolution)}</span>
          )}
        </div>
      )}
    </div>
  );

  if (item.link_url && item.link_action === 'navigate') {
    return <Link href={item.link_url}>{inner}</Link>;
  }
  if (item.link_url && item.link_action === 'external') {
    return <a href={item.link_url} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }
  return inner;
}

function CommunityReactions({ reactions }: { reactions: { likes: number; comments: number } }) {
  return (
    <div className="flex gap-3 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
      <span>❤️ {reactions.likes}</span>
      <span>💬 {reactions.comments}</span>
    </div>
  );
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return '방금';
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}
