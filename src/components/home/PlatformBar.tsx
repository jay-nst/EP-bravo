'use client';

import { trackEvent } from '@/lib/analytics';

const PLATFORMS = [
  { id: 'all', label: 'All', color: 'var(--text)' },
  { id: 'tempest', label: 'Tempest', color: 'var(--color-tempest)' },
  { id: 'predict', label: 'Predict', color: 'var(--color-predict)' },
  { id: 'warden', label: 'Warden', color: 'var(--color-warden)' },
  { id: 'nexus', label: 'Nexus', color: 'var(--color-nexus)' },
  { id: 'core', label: 'Core', color: 'var(--color-core)' },
] as const;

export default function PlatformBar() {
  function scrollToLane(id: string) {
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(`lane-${id}`);
    if (el) {
      const offset = 52 + 44; // header + platform bar
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  return (
    <div
      className="sticky z-30 border-b overflow-x-auto"
      style={{
        top: 'var(--header-height)',
        background: 'var(--bg)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 flex gap-1 py-1.5">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              trackEvent('cta_click', 'platform_bar_chip', { platform: p.id });
              scrollToLane(p.id);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors"
            style={{ color: 'var(--text-muted)', minHeight: '36px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.color = p.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            {p.id !== 'all' && (
              <span
                className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: p.color }}
              />
            )}
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
