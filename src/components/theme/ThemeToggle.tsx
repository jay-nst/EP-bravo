'use client';

import { useTheme } from 'next-themes';
import { toResolvedTheme } from '@/lib/theme';
import { useMounted } from './useMounted';

/** 헤더 테마 전환 버튼. 누르면 지금 보이는 테마의 반대로 고정한다. */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isLight = mounted && toResolvedTheme(resolvedTheme) === 'light';
  const label = isLight ? '다크 모드로 전환' : '라이트 모드로 전환';

  return (
    <button
      type="button"
      className={`p-8 rounded-[6px] transition-colors hover:bg-[var(--surface-elevated)] ${className}`}
      style={{ color: 'var(--text-muted)' }}
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      aria-label={label}
      title={label}
    >
      {isLight ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
