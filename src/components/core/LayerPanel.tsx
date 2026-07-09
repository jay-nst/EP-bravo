'use client';

import type { CitadelSeverity } from '@/types/citadel';

export interface OverlayLayer {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
  featureCount: number;
  comingSoon?: boolean;
}

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
    <div className="space-y-1">
      <h3
        className="text-xs font-mono tracking-wider uppercase mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        Data Overlay
      </h3>
      {layers.map((layer) => (
        <button
          key={layer.id}
          onClick={() => !layer.comingSoon && onToggle(layer.id)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors"
          style={{
            background: layer.enabled ? 'var(--surface)' : 'transparent',
            cursor: layer.comingSoon ? 'default' : 'pointer',
            opacity: layer.comingSoon ? 0.5 : 1,
          }}
        >
          <span
            className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
            style={{
              background: layer.enabled ? layer.color : 'var(--border)',
              transition: 'background 200ms',
            }}
          />
          <span
            className="text-sm flex-1"
            style={{ color: layer.enabled ? 'var(--text)' : 'var(--text-muted)' }}
          >
            {layer.label}
          </span>
          {layer.comingSoon ? (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
            >
              Soon
            </span>
          ) : (
            <span
              className="text-xs font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              {layer.featureCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export { SEVERITY_COLORS };
