import Link from 'next/link';
import TrackedLink from '@/components/ui/TrackedLink';
import { POSTS } from '@/lib/sample-data';
import { TEMPEST_LANE_CARDS } from '@/lib/mock-tempest';
import type { TempestLaneCard } from '@/types/tempest';
import PlatformBar from '@/components/home/PlatformBar';
import ComingSoonLane from '@/components/home/ComingSoonLane';
import CoreCTA from '@/components/home/CoreCTA';
import EPOriginal from '@/components/home/EPOriginal';
import NewsletterForm from '@/components/home/NewsletterForm';

const SEVERITY_BADGE: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'rgba(196,92,74,0.15)', text: 'var(--color-tempest)' },
  high: { bg: 'rgba(196,92,74,0.10)', text: 'var(--color-tempest)' },
  moderate: { bg: 'var(--surface-elevated)', text: 'var(--text-muted)' },
  low: { bg: 'var(--surface-elevated)', text: 'var(--text-muted)' },
};

export default function HomePage() {
  const editorPick = POSTS[0];
  const tempestCards = TEMPEST_LANE_CARDS;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Platform Bar */}
      <PlatformBar />

      {/* Hero: Editor's Pick + satellite background */}
      <section
        className="relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #080a12 0%, #0E0E10 40%, #0a1210 100%)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(rgba(27,191,168,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{
                background: 'var(--accent)',
                animation: 'ep-count-pulse 2s ease-in-out infinite',
              }}
            />
            <span
              className="text-xs font-mono tracking-[0.15em] uppercase"
              style={{ color: 'var(--accent)' }}
            >
              Editor&apos;s Pick
            </span>
          </div>
          {editorPick && (
            <Link href={`/posts/${editorPick.id}`} className="block group">
              <h1
                className="text-2xl md:text-3xl font-semibold leading-tight mb-3"
                style={{ color: 'var(--text)' }}
              >
                {editorPick.title}
              </h1>
              <p
                className="text-sm leading-relaxed max-w-xl mb-4"
                style={{ color: 'var(--text-muted)' }}
              >
                {editorPick.summary}
              </p>
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>{editorPick.author}</span>
                <span style={{ color: 'var(--border)' }}>&middot;</span>
                <span>{editorPick.date}</span>
                <span style={{ color: 'var(--border)' }}>&middot;</span>
                <span>{editorPick.readTime}</span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* Magazine Grid */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main: Platform Lanes (2/3) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tempest Lane (active) */}
            <section id="lane-tempest" className="scroll-mt-24">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: 'var(--color-tempest)' }}
                  />
                  <h2
                    className="text-base font-semibold"
                    style={{ color: 'var(--color-tempest)' }}
                  >
                    Tempest
                  </h2>
                </div>
                <Link
                  href="/tempest"
                  className="text-xs py-2 px-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  재난 대시보드 &rarr;
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tempestCards.map((card) => (
                  <TempestCard key={card.id} card={card} />
                ))}
              </div>
            </section>

            {/* Coming Soon Lanes */}
            <ComingSoonLane platform="predict" />
            <ComingSoonLane platform="warden" />
            <ComingSoonLane platform="nexus" />
          </div>

          {/* Sidebar (1/3, sticky) */}
          <aside className="space-y-6 lg:sticky lg:top-[calc(var(--header-height)+44px+2rem)] lg:self-start">
            {/* Core CTA (top — high intent) */}
            <div id="lane-core">
              <CoreCTA />
            </div>

            {/* EP Original (bottom — retention) */}
            <EPOriginal />
          </aside>
        </div>
      </section>

      {/* Newsletter Strip */}
      <section
        className="px-4 py-8"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              EarthPaper Newsletter
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              매주 위성이 포착한 지구의 변화를 받아보세요.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4"
        style={{
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
            <div>
              <p
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--text)' }}
              >
                EARTHPAPER
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'var(--text-muted)' }}
              >
                위성 영상 분석 플랫폼 패밀리
              </p>
            </div>
            <div className="flex gap-10">
              <div className="space-y-2">
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  플랫폼
                </p>
                <nav className="flex flex-col gap-0.5">
                  <Link
                    href="/tempest"
                    className="text-xs py-2.5 hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Tempest
                  </Link>
                  <Link
                    href="/core"
                    className="text-xs py-2.5 hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Core
                  </Link>
                  <Link
                    href="/daily"
                    className="text-xs py-2.5 hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    오늘의 지구
                  </Link>
                </nav>
              </div>
              <div className="space-y-2">
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  서비스
                </p>
                <nav className="flex flex-col gap-0.5">
                  <Link
                    href="/map"
                    className="text-xs py-2.5 hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    위성 지도
                  </Link>
                  <Link
                    href="/chat"
                    className="text-xs py-2.5 hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    AI 채팅
                  </Link>
                  <Link
                    href="/tasking"
                    className="text-xs py-2.5 hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    촬영 요청
                  </Link>
                </nav>
              </div>
              <div className="space-y-2">
                <p
                  className="text-xs font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  계정
                </p>
                <nav className="flex flex-col gap-0.5">
                  <Link
                    href="/login"
                    className="text-xs py-2.5 hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="text-xs py-2.5 hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    회원가입
                  </Link>
                  <Link
                    href="/portal"
                    className="text-xs py-2.5 hover:underline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    내 주문
                  </Link>
                </nav>
              </div>
            </div>
          </div>
          <div
            className="pt-4 text-center text-xs"
            style={{
              borderTop: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            &copy; {new Date().getFullYear()} SI Analytics. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function TempestCard({ card }: { card: TempestLaneCard }) {
  const badge = SEVERITY_BADGE[card.severity] ?? SEVERITY_BADGE.moderate;

  return (
    <TrackedLink
      href={`/tempest/${card.id}`}
      eventName="tempest_card"
      eventProperties={{ card_id: card.id, severity: card.severity, event_type: card.event_type }}
      className="block rounded-lg overflow-hidden transition-colors"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="h-28 relative flex items-end p-3"
        style={{
          background:
            'linear-gradient(135deg, #1a1210 0%, #1a1510 50%, #0E0E10 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(196,92,74,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(196,92,74,0.04) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative z-10 flex items-center gap-2">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: badge.bg, color: badge.text }}
          >
            {card.severity}
          </span>
          <span
            className="text-xs font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            {card.event_type}
          </span>
        </div>
      </div>
      <div className="p-3 space-y-1">
        <p
          className="text-sm font-medium line-clamp-1"
          style={{ color: 'var(--text)' }}
        >
          {card.title}
        </p>
        <p
          className="text-xs line-clamp-2 leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          {card.summary}
        </p>
        <div
          className="flex items-center gap-2 text-xs pt-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>{card.location_name}</span>
          <span style={{ color: 'var(--border)' }}>&middot;</span>
          <span className="font-mono">
            {new Date(card.timestamp).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {card.has_satellite_imagery && (
            <>
              <span style={{ color: 'var(--border)' }}>&middot;</span>
              <span style={{ color: 'var(--accent)' }}>영상 보유</span>
            </>
          )}
        </div>
      </div>
    </TrackedLink>
  );
}
