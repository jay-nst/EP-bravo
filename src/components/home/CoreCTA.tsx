import { Card, StatusChip } from '@naraspace-technology/nds/components';
import { IconArrowRight } from '@naraspace-technology/nds/icons';
import TrackedLink from '@/components/ui/TrackedLink';

// 위성 지도 느낌의 격자 — 일러스트. 액센트 임의 rgba 대신 NDS 토큰을 섞어 쓴다 (§7-2)
const GRID_LINE = 'color-mix(in srgb, var(--bg-interactive-primary) 4%, transparent)';

export default function CoreCTA() {
  return (
    <Card.Root
      interactive
      render={
        <TrackedLink
          href="/core"
          eventName="core_cta"
          eventProperties={{ source: 'homepage_sidebar' }}
        />
      }
    >
      {/* 일러스트 배경 (그라데이션·격자) — 인라인 유지 */}
      <div
        aria-hidden
        className="relative h-144 rounded-md overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #0a1a15 0%, #0d2216 30%, #0a1612 60%, #0E0E10 100%)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>
      <Card.Body className="gap-8">
        {/* kicker → NDS StatusChip neutral (§7-1) */}
        <StatusChip status="neutral" showIcon={false} className="self-start">
          Core Map
        </StatusChip>
        <Card.Title className="flex items-center gap-4">
          위성 지도에서 탐색
          <IconArrowRight className="size-16 text-icon-secondary" />
        </Card.Title>
        <Card.Content>
          데이터 오버레이 시각화, 분석 도구, 영상 구매를 하나의 지도에서.
        </Card.Content>
        <div className="flex gap-8">
          <StatusChip status="neutral" showIcon={false}>
            데이터 오버레이
          </StatusChip>
          <StatusChip status="neutral" showIcon={false}>
            영상 구매
          </StatusChip>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
