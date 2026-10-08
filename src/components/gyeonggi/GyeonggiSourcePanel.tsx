'use client';

import { Collapsible, StatusChip } from '@naraspace-technology/nds/components';
import type { StatusChipProps } from '@naraspace-technology/nds/components';
import { SOURCE_KIND_BADGE, type SeoulSourceKind } from '@/lib/seoul-data-sources';
import { GYEONGGI_DATA_SOURCES, type GyeonggiDataSource } from '@/lib/gyeonggi-data-sources';

// SOURCE_KIND_BADGE 의 라벨은 그대로 쓰고, 표시는 NDS StatusChip status 로 한다
// (LIVE→success, DEMO→neutral, 분석·통계→information, 영상→brand, 배경·경계→neutral).
const KIND_STATUS: Record<SeoulSourceKind, StatusChipProps['status']> = {
  live: 'success',
  stat: 'information',
  demo: 'neutral',
  analysis: 'information',
  imagery: 'brand',
  basemap: 'neutral',
  boundary: 'neutral',
};

// 사이드바 하단의 '데이터 출처' 섹션. 접힌 상태가 기본.
// SeoulSourcePanel 과 같은 구조로, 읽는 레지스트리만 경기 것이다.

interface GyeonggiSourcePanelProps {
  defaultOpen?: boolean;
}

export default function GyeonggiSourcePanel({ defaultOpen = false }: GyeonggiSourcePanelProps) {
  return (
    // 접기/펼치기 — NDS Collapsible (Root → Trigger → Panel). 기본은 접힘.
    <Collapsible.Root variant="outline" defaultOpen={defaultOpen}>
      <Collapsible.Trigger>데이터 출처 ({GYEONGGI_DATA_SOURCES.length})</Collapsible.Trigger>
      <Collapsible.Panel>
        <ul className="space-y-10">
          {GYEONGGI_DATA_SOURCES.map((s) => (
            <SourceRow key={s.id} source={s} />
          ))}
        </ul>

        <p className="mt-12 text-body-xs-regular text-text-tertiary">
          접근성 등고선은 공식 평가가 아니라 EarthPaper 자체 분석이다. 정책 판단 근거로 쓰지 않는다.
        </p>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

function SourceRow({ source }: { source: GyeonggiDataSource }) {
  const badge = SOURCE_KIND_BADGE[source.kind];

  return (
    <li className="text-body-xs-regular text-text-tertiary">
      <div className="flex items-center gap-6">
        <StatusChip status={KIND_STATUS[source.kind]} showIcon={false} className="shrink-0">
          {badge.label}
        </StatusChip>
        <span className="text-text-primary">{source.layer}</span>
      </div>

      <div className="mt-2">
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-tertiary underline decoration-border-tertiary"
          >
            {source.provider}
          </a>
        ) : (
          source.provider
        )}
      </div>

      <div className="break-words opacity-85">{source.dataset}</div>

      <p className="mt-2 opacity-75">{source.note}</p>
    </li>
  );
}
