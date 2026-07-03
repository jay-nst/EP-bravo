'use client';

import { trackEvent } from '@/lib/analytics';

const PLATFORM_META = {
  predict: {
    name: 'Predict',
    color: 'var(--color-predict)',
    hex: '#4A9EC4',
    description: '시장 인텔리전스 — 위성 데이터 기반 농업·시장 예측 분석',
  },
  warden: {
    name: 'Warden',
    color: 'var(--color-warden)',
    hex: '#6B8A5E',
    description: '방위 인텔리전스 — 위성 변화 탐지 및 모니터링',
  },
  nexus: {
    name: 'Nexus',
    color: 'var(--color-nexus)',
    hex: '#C8923A',
    description: '도시 인텔리전스 — 열섬·확장·인프라 분석',
  },
} as const;

type PlatformKey = keyof typeof PLATFORM_META;

export default function ComingSoonLane({ platform }: { platform: PlatformKey }) {
  const meta = PLATFORM_META[platform];

  return (
    <section id={`lane-${platform}`} className="scroll-mt-24">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ background: meta.color }}
        />
        <h2
          className="text-base font-semibold"
          style={{ color: meta.color }}
        >
          {meta.name}
        </h2>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: 'var(--surface-elevated)',
            color: 'var(--text-muted)',
          }}
        >
          Coming Soon
        </span>
      </div>
      <div
        className="rounded-lg p-6 text-center"
        style={{
          background: `color-mix(in srgb, ${meta.hex} 5%, var(--surface))`,
          border: '1px solid var(--border)',
        }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: meta.color }}>
          {meta.name}
        </p>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {meta.description}
        </p>
        <button
          onClick={() => trackEvent('cta_click', 'coming_soon_notify', { platform })}
          className="text-xs px-4 py-2 rounded-md transition-colors"
          style={{
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
          }}
        >
          출시 알림 받기
        </button>
      </div>
    </section>
  );
}
