'use client';

export type SeoulLayerId =
  | 'air-quality'
  | 'cai'
  | 'sdot'
  | 'heat'
  | 'satellite'
  | 'vulnerable'
  | 'ghg'
  | 'solar';

export type DataSourceKind = 'live' | 'demo' | 'analysis' | 'imagery' | 'loading';

export interface SeoulLayer {
  id: SeoulLayerId;
  label: string;
  sublabel: string;
  color: string;
  enabled: boolean;
  featureCount: number;
  source: DataSourceKind;
  group: '대기·기상' | '기후위기' | '위성·분석' | '탄소·에너지';
}

const GROUP_ORDER: SeoulLayer['group'][] = ['대기·기상', '기후위기', '위성·분석', '탄소·에너지'];

const SOURCE_BADGE: Record<DataSourceKind, { label: string; color: string }> = {
  live: { label: 'LIVE', color: '#1bbfa8' },
  demo: { label: 'DEMO', color: '#C8923A' },
  analysis: { label: '분석', color: '#C45C4A' },
  imagery: { label: '영상', color: '#4A9EC4' },
  loading: { label: '···', color: '#8A8680' },
};

interface SeoulLayerPanelProps {
  layers: SeoulLayer[];
  onToggle: (layerId: SeoulLayerId) => void;
}

export default function SeoulLayerPanel({ layers, onToggle }: SeoulLayerPanelProps) {
  return (
    <div className="space-y-4">
      {GROUP_ORDER.map((group) => {
        const groupLayers = layers.filter((l) => l.group === group);
        if (groupLayers.length === 0) return null;

        return (
          <div key={group} className="space-y-1">
            <h3
              className="text-xs font-mono tracking-wider uppercase mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {group}
            </h3>

            {groupLayers.map((layer) => {
              const badge = SOURCE_BADGE[layer.source];

              return (
                <button
                  key={layer.id}
                  onClick={() => onToggle(layer.id)}
                  aria-pressed={layer.enabled}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors"
                  style={{ background: layer.enabled ? 'var(--surface)' : 'transparent' }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{
                      background: layer.enabled ? layer.color : 'var(--border)',
                      transition: 'background 200ms',
                    }}
                  />

                  <span className="flex-1 min-w-0">
                    <span
                      className="block text-sm truncate"
                      style={{ color: layer.enabled ? 'var(--text)' : 'var(--text-muted)' }}
                    >
                      {layer.label}
                    </span>
                    <span
                      className="block text-xs truncate"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {layer.sublabel}
                    </span>
                  </span>

                  <span className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{
                        background: 'var(--surface-elevated)',
                        color: badge.color,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {layer.featureCount > 0 ? layer.featureCount : '—'}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
