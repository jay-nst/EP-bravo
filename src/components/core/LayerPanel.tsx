'use client';

import { StatusChip, Switch } from '@naraspace-technology/nds/components';
import type { CitadelSeverity } from '@/types/citadel';

export interface OverlayLayer {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
  featureCount: number;
  comingSoon?: boolean;
}

// Citadel severity 데이터 색 — 지도 레이어·범례 swatch 전용 (글자 색으로 쓰지 않는다)
const SEVERITY_COLORS: Record<CitadelSeverity, string> = {
  critical: '#C45C4A',
  high: '#E07B5F',
  moderate: '#C8923A',
  low: '#8A8680',
};

interface LayerPanelProps {
  layers: OverlayLayer[];
  onToggle: (layerId: string) => void;
}

export default function LayerPanel({ layers, onToggle }: LayerPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="mb-8 text-body-sm-medium text-text-secondary">Data Overlay</h3>
      {layers.map((layer) => (
        <label
          key={layer.id}
          className={`flex w-full items-center gap-10 rounded-sm px-10 py-8 transition-colors ${
            layer.enabled ? 'bg-bg-secondary' : 'bg-transparent'
          } ${layer.comingSoon ? 'cursor-default opacity-50' : 'cursor-pointer'}`}
        >
          {/* 레이어 색 — 데이터 기반 색이라 인라인 유지 */}
          <span
            className={`size-10 shrink-0 rounded-xs transition-colors duration-200 ${
              layer.enabled ? '' : 'bg-border-tertiary'
            }`}
            style={layer.enabled ? { background: layer.color } : undefined}
          />
          <span
            className={`flex-1 text-body-sm-regular ${
              layer.enabled ? 'text-text-primary' : 'text-text-tertiary'
            }`}
          >
            {layer.label}
          </span>
          {layer.comingSoon ? (
            <StatusChip status="neutral" showIcon={false}>
              Soon
            </StatusChip>
          ) : (
            <span className="text-body-xs-regular text-text-tertiary tabular-nums">
              {layer.featureCount}
            </span>
          )}
          <Switch
            size="sm"
            checked={layer.enabled}
            disabled={layer.comingSoon}
            aria-label={layer.label}
            onCheckedChange={() => {
              if (!layer.comingSoon) onToggle(layer.id);
            }}
          />
        </label>
      ))}
    </div>
  );
}

export { SEVERITY_COLORS };
