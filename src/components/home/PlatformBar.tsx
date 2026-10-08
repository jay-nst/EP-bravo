'use client';

import { Button } from '@naraspace-technology/nds/components';
import { trackEvent } from '@/lib/analytics';

const PLATFORMS = [
  { id: 'all', label: 'All', color: 'var(--text)' },
  { id: 'citadel', label: 'Citadel', color: 'var(--color-citadel)' },
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
    <div className="sticky top-(--header-height) z-30 border-b border-border-tertiary bg-bg-tertiary overflow-x-auto">
      <div className="max-w-6xl mx-auto px-16 flex gap-4 py-6">
        {/* NDS Button text — 운영 색 (§8): 기본 muted, hover 시 surface 배경 + 플랫폼 색 글자 (--c) */}
        {PLATFORMS.map((p) => (
          <Button
            key={p.id}
            variant="text"
            size="sm"
            className="whitespace-nowrap text-text-tertiary hover:bg-bg-secondary not-data-disabled:not-aria-invalid:hover:text-(--c)"
            style={{ '--c': p.color } as React.CSSProperties}
            leftIcon={
              p.id !== 'all' ? (
                <span
                  className="inline-block w-8 h-8 rounded-full shrink-0"
                  style={{ background: p.color }}
                />
              ) : undefined
            }
            onClick={() => {
              trackEvent('cta_click', 'platform_bar_chip', { platform: p.id });
              scrollToLane(p.id);
            }}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
