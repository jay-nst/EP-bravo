'use client';

import { Button, Card, StatusChip } from '@naraspace-technology/nds/components';
import { trackEvent } from '@/lib/analytics';

const PLATFORM_META = {
  predict: {
    name: 'Predict',
    color: 'var(--color-predict)',
    description: '시장 인텔리전스 — 위성 데이터 기반 농업·시장 예측 분석',
  },
  warden: {
    name: 'Warden',
    color: 'var(--color-warden)',
    description: '방위 인텔리전스 — 위성 변화 탐지 및 모니터링',
  },
  nexus: {
    name: 'Nexus',
    color: 'var(--color-nexus)',
    description: '도시 인텔리전스 — 열섬·확장·인프라 분석',
  },
} as const;

type PlatformKey = keyof typeof PLATFORM_META;

export default function ComingSoonLane({ platform }: { platform: PlatformKey }) {
  const meta = PLATFORM_META[platform];

  return (
    <section id={`lane-${platform}`} className="scroll-mt-96">
      <div className="flex items-center gap-8 mb-16">
        {/* 플랫폼 마크(점)·제목 — 플랫폼 색 (운영 색, §8) */}
        <span
          className="inline-block w-8 h-8 rounded-full"
          style={{ background: meta.color }}
        />
        <h2 className="text-heading-2xl" style={{ color: meta.color }}>
          {meta.name}
        </h2>
        <StatusChip status="neutral" showIcon={false} className="bg-bg-primary text-text-tertiary">
          Coming Soon
        </StatusChip>
      </div>
      {/* 플랫폼 틴트 박스 (운영 색, §8) */}
      <Card.Root
        className="inset-ring-border-tertiary"
        style={{ background: `color-mix(in srgb, ${meta.color} 5%, var(--surface))` }}
      >
        <Card.Body className="gap-8 items-center text-center">
          <Card.Title style={{ color: meta.color }}>{meta.name}</Card.Title>
          <Card.Content className="text-text-tertiary">{meta.description}</Card.Content>
          <Button
            variant="outline"
            size="sm"
            className="mt-8 text-text-interactive-primary inset-ring-border-interactive-primary! hover:bg-transparent!"
            onClick={() => trackEvent('cta_click', 'coming_soon_notify', { platform })}
          >
            출시 알림 받기
          </Button>
        </Card.Body>
      </Card.Root>
    </section>
  );
}
