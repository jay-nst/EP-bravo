import { Card } from '@naraspace-technology/nds/components';
import { IconArrowRight } from '@naraspace-technology/nds/icons';
import TrackedLink from '@/components/ui/TrackedLink';

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
      {/* 위성 지도 느낌의 그라데이션·격자는 일러스트 — 인라인 유지 */}
      <div
        className="relative h-144 flex items-end p-16 rounded-md overflow-hidden"
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
          <p className="text-body-xs-regular text-text-interactive-primary opacity-70 mb-4">
            Core Map
          </p>
          <p className="text-body-sm-medium text-text-primary flex items-center gap-4">
            위성 지도에서 탐색
            <IconArrowRight className="size-16" />
          </p>
        </div>
      </div>
      <Card.Body className="gap-8">
        <p className="text-body-xs-regular text-text-tertiary">
          데이터 오버레이 시각화, 분석 도구, 영상 구매를 하나의 지도에서.
        </p>
        <div className="flex gap-8">
          <span className="text-body-xs-regular px-6 py-2 rounded-full bg-bg-interactive-primary/8 text-text-interactive-primary">
            데이터 오버레이
          </span>
          <span className="text-body-xs-regular px-6 py-2 rounded-full bg-bg-primary text-text-tertiary">
            영상 구매
          </span>
        </div>
      </Card.Body>
    </Card.Root>
  );
}
