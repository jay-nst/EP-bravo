'use client';

import { Spinner, StatusChip, Switch } from '@naraspace-technology/nds/components';
import type { StatusChipProps } from '@naraspace-technology/nds/components';

// 경기 공원 접근성 지도의 레이어 토글 목록.
// SeoulLayerPanel 과 같은 구조 — 레이어 id·그룹만 경기 것으로 바뀐다.

export type GyeonggiLayerId = 'access-contour' | 'park-wms' | 'emd-score' | 'satellite';

export type DataSourceKind = 'live' | 'stat' | 'demo' | 'analysis' | 'imagery' | 'loading';

export interface GyeonggiLayer {
  id: GyeonggiLayerId;
  label: string;
  sublabel: string;
  color: string;
  enabled: boolean;
  featureCount: number;
  source: DataSourceKind;
  group: '접근성 분석' | '평가 데이터' | '위성·배경';
}

const GROUP_ORDER: GyeonggiLayer['group'][] = ['접근성 분석', '평가 데이터', '위성·배경'];

// 데이터 성격 배지 — NDS StatusChip. status 는 의미대로 (docs/NDS_FULL_ADOPTION_RULES.md §4):
// LIVE→success, DEMO→neutral, 분석·통계→information. 영상은 규칙에 없어 brand 로 구분한다.
// loading 은 칩 대신 Spinner 로 표시한다.
const SOURCE_BADGE: Record<
  Exclude<DataSourceKind, 'loading'>,
  { label: string; status: StatusChipProps['status'] }
> = {
  live: { label: 'LIVE', status: 'success' },
  stat: { label: '통계', status: 'information' },
  demo: { label: 'DEMO', status: 'neutral' },
  analysis: { label: '분석', status: 'information' },
  imagery: { label: '영상', status: 'brand' },
};

interface GyeonggiLayerPanelProps {
  layers: GyeonggiLayer[];
  onToggle: (layerId: GyeonggiLayerId) => void;
}

export default function GyeonggiLayerPanel({ layers, onToggle }: GyeonggiLayerPanelProps) {
  return (
    <div className="space-y-16">
      {GROUP_ORDER.map((group) => {
        const groupLayers = layers.filter((l) => l.group === group);
        if (groupLayers.length === 0) return null;

        return (
          <div key={group} className="space-y-4">
            {/* 패널 내부 그룹 라벨 (§7-1) — 제목이 아니라 묶음 이름 */}
            <h3 className="mb-8 text-body-sm-medium text-text-secondary">{group}</h3>

            {groupLayers.map((layer) => (
              // 행 전체가 label 이라 어디를 눌러도 Switch 가 토글된다.
              <label
                key={layer.id}
                className={`flex w-full cursor-pointer items-center gap-10 rounded-sm px-10 py-8 transition-colors ${
                  layer.enabled ? 'bg-bg-secondary' : ''
                }`}
              >
                <span
                  className={`size-10 shrink-0 rounded-xs transition-colors duration-200 ${
                    layer.enabled ? '' : 'bg-border-tertiary'
                  }`}
                  // 레이어 고유색 (지도 데이터 색)
                  style={layer.enabled ? { background: layer.color } : undefined}
                />

                <span className="min-w-0 flex-1">
                  <span
                    className={`block truncate text-body-sm-regular ${
                      layer.enabled ? 'text-text-primary' : 'text-text-tertiary'
                    }`}
                  >
                    {layer.label}
                  </span>
                  <span className="block truncate text-body-xs-regular text-text-tertiary">
                    {layer.sublabel}
                  </span>
                </span>

                <span className="flex shrink-0 flex-col items-end gap-4">
                  {layer.source === 'loading' ? (
                    <Spinner size="sm" aria-label="불러오는 중" />
                  ) : (
                    <StatusChip status={SOURCE_BADGE[layer.source].status} showIcon={false}>
                      {SOURCE_BADGE[layer.source].label}
                    </StatusChip>
                  )}
                  <span className="text-body-xs-regular text-text-tertiary tabular-nums">
                    {layer.featureCount > 0 ? layer.featureCount.toLocaleString() : '—'}
                  </span>
                </span>

                <Switch
                  size="sm"
                  checked={layer.enabled}
                  onCheckedChange={() => onToggle(layer.id)}
                  aria-label={layer.label}
                />
              </label>
            ))}
          </div>
        );
      })}
    </div>
  );
}
