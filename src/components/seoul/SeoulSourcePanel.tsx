'use client';

import { Collapsible, StatusChip } from '@naraspace-technology/nds/components';
import type { StatusChipProps } from '@naraspace-technology/nds/components';
import {
  SEOUL_DATA_SOURCES,
  SOURCE_KIND_BADGE,
  type SeoulDataSource,
  type SeoulSourceKind,
} from '@/lib/seoul-data-sources';

// SOURCE_KIND_BADGE 의 라벨은 그대로 쓰고, 표시는 NDS StatusChip 으로 한다.
// 색은 운영 배지 색 그대로 (§8): surface-elevated 배경 + SOURCE_KIND_BADGE.color 와 같은 글자색.
const KIND_STATUS: Record<SeoulSourceKind, StatusChipProps['status']> = {
  live: 'success',
  stat: 'information',
  demo: 'neutral',
  analysis: 'information',
  imagery: 'brand',
  basemap: 'neutral',
  boundary: 'neutral',
};

const KIND_COLOR: Record<SeoulSourceKind, string> = {
  live: 'bg-bg-primary text-[#1bbfa8]',
  stat: 'bg-bg-primary text-[#4A9E6B]',
  demo: 'bg-bg-primary text-[#C8923A]',
  analysis: 'bg-bg-primary text-[#C45C4A]',
  imagery: 'bg-bg-primary text-[#4A9EC4]',
  basemap: 'bg-bg-primary text-[#8A8680]',
  boundary: 'bg-bg-primary text-[#8A8680]',
};

// 사이드바 하단의 '데이터 출처' 섹션. 접힌 상태가 기본이고, 펼치면 레이어별
// 기관·데이터셋·산출 방식이 전부 나온다. 최소 글자 크기는 12px (DESIGN.md).

interface SeoulSourcePanelProps {
  /** 기본으로 펼쳐둘지. 데모 시연 때 열어두고 싶을 수 있어 열어둔다. */
  defaultOpen?: boolean;
}

export default function SeoulSourcePanel({ defaultOpen = false }: SeoulSourcePanelProps) {
  return (
    // 접기/펼치기 — NDS Collapsible (Root → Trigger → Panel). 기본은 접힘.
    <Collapsible.Root
      variant="outline"
      defaultOpen={defaultOpen}
      className="inset-ring-border-tertiary"
    >
      <Collapsible.Trigger className="text-text-tertiary">데이터 출처 ({SEOUL_DATA_SOURCES.length})</Collapsible.Trigger>
      <Collapsible.Panel>
        <ul className="space-y-10">
          {SEOUL_DATA_SOURCES.map((s) => (
            <SourceRow key={s.id} source={s} />
          ))}
        </ul>

        <p className="mt-12 text-body-xs-regular text-text-tertiary">
          DEMO·분석 표기 항목은 실제 관측·통계가 아닌 추정치다. 정책 판단 근거로 쓰지 않는다.
        </p>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

function SourceRow({ source }: { source: SeoulDataSource }) {
  const badge = SOURCE_KIND_BADGE[source.kind];

  return (
    // 역할별 위계 (§7-1): 레이어명 = 항목 제목, 기관 = 링크, 데이터셋 = 본문, 산출 방식 = 메타.
    // opacity 로 만든 회색 단계 대신 NDS 텍스트 토큰을 쓴다.
    <li className="text-body-xs-regular">
      <div className="flex items-center gap-6">
        <StatusChip
          status={KIND_STATUS[source.kind]}
          showIcon={false}
          className={`shrink-0 ${KIND_COLOR[source.kind]}`}
        >
          {badge.label}
        </StatusChip>
        <span className="text-body-sm-medium text-text-primary">{source.layer}</span>
      </div>

      <div className="mt-4">
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
          <span className="text-text-tertiary">{source.provider}</span>
        )}
      </div>

      <div className="break-words text-text-tertiary/85">{source.dataset}</div>

      <p className="mt-2 text-text-tertiary/75">{source.note}</p>
    </li>
  );
}
