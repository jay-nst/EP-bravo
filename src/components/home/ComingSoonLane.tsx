'use client';

import { Button, StatusChip } from '@naraspace-technology/nds/components';
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
    <section id={`lane-${platform}`} className="scroll-mt-96">
      <div className="flex items-center gap-8 mb-12">
        <span
          className="inline-block w-8 h-8 rounded-full"
          style={{ background: meta.color }}
        />
        <h2 className="text-body-md-medium" style={{ color: meta.color }}>
          {meta.name}
        </h2>
        <StatusChip status="neutral" showIcon={false}>
          Coming Soon
        </StatusChip>
      </div>
      {/* 표면 — 플랫폼 색 틴트 배경은 데이터 색이라 인라인 유지 */}
      <div
        className="rounded-lg p-24 text-center inset-ring-1 inset-ring-border-tertiary"
        style={{ background: `color-mix(in srgb, ${meta.hex} 5%, var(--surface))` }}
      >
        <p className="text-body-sm-medium mb-4" style={{ color: meta.color }}>
          {meta.name}
        </p>
        <p className="text-body-xs-regular text-text-tertiary mb-16">
          {meta.description}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => trackEvent('cta_click', 'coming_soon_notify', { platform })}
        >
          출시 알림 받기
        </Button>
      </div>
    </section>
  );
}
