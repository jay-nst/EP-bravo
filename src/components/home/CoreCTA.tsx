import TrackedLink from '@/components/ui/TrackedLink';

export default function CoreCTA() {
  return (
    <TrackedLink
      href="/core"
      eventName="core_cta"
      eventProperties={{ source: 'homepage_sidebar' }}
      className="block rounded-lg overflow-hidden transition-colors group"
      style={{ border: '1px solid var(--border)' }}
    >
      <div
        className="relative h-36 flex items-end p-4"
        style={{
          background:
            'linear-gradient(135deg, #0a1a15 0%, #0d2216 30%, #0a1612 60%, #0E0E10 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(27,191,168,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.04) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="relative z-10">
          <p
            className="text-xs font-mono tracking-wider uppercase mb-1"
            style={{ color: 'var(--accent)', opacity: 0.7 }}
          >
            Core Map
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            위성 지도에서 탐색 &rarr;
          </p>
        </div>
      </div>
      <div className="p-3 space-y-2" style={{ background: 'var(--surface)' }}>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          데이터 오버레이 시각화, 분석 도구, 영상 구매를 하나의 지도에서.
        </p>
        <div className="flex gap-2">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(27,191,168,0.08)',
              color: 'var(--accent)',
            }}
          >
            데이터 오버레이
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--surface-elevated)',
              color: 'var(--text-muted)',
            }}
          >
            영상 구매
          </span>
        </div>
      </div>
    </TrackedLink>
  );
}
