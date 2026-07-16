'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const SERVICES = [
  { key: 'citadel', label: 'Citadel', desc: '재난 · 도시 관제', color: '#C45C4A', href: '/citadel' },
  { key: 'predict', label: 'Predict', desc: '자산 검증 · 금융', color: '#4A9EC4', href: '/predict' },
  { key: 'warden', label: 'Warden', desc: '기후 · 컴플라이언스', color: '#6B8A5E', href: '/warden' },
  { key: 'northpaper', label: 'Northpaper', desc: '국방 · 안보', color: '#3D5A80', href: '/northpaper' },
  { key: 'nexus', label: 'Nexus', desc: '데이터 마켓', color: '#C8923A', href: '/nexus' },
  { key: 'core', label: 'Core', desc: '위성 지도', color: '#8A8680', href: '/core' },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleEnter = () => {
    clearTimeout(timerRef.current);
    setDropdownOpen(true);
  };

  const handleLeave = () => {
    timerRef.current = setTimeout(() => setDropdownOpen(false), 200);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <header
      className="border-b sticky top-0 z-50"
      style={{
        borderColor: 'var(--border)',
        height: 'var(--header-height)',
        background: 'var(--glass-bg, rgba(14,14,16,0.88))',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight flex items-center gap-2"
            style={{ color: 'var(--text)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="var(--accent)" strokeWidth="1" transform="rotate(-30 12 12)" opacity="0.6" />
              <circle cx="18.5" cy="7" r="1.5" fill="var(--accent)" opacity="0.8" />
            </svg>
            EARTHPAPER
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/daily"
              className="px-3 py-2.5 text-sm rounded-md transition-colors"
              style={{
                color: pathname.startsWith('/daily') ? 'var(--accent)' : 'var(--text-muted)',
                background: pathname.startsWith('/daily') ? 'var(--surface-elevated)' : 'transparent',
              }}
            >
              오늘의 지구
            </Link>

            <div
              ref={menuRef}
              className="relative"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              <button
                className="px-3 py-2.5 text-sm rounded-md transition-colors flex items-center gap-1"
                style={{ color: 'var(--text-muted)' }}
              >
                서비스
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-1 py-2 rounded-lg"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    minWidth: 220,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                  }}
                >
                  {SERVICES.map((s) => (
                    <Link
                      key={s.key}
                      href={s.href}
                      className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--surface-elevated)]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: s.color }}
                      />
                      <div>
                        <p className="text-sm font-medium" style={{ color: s.color }}>{s.label}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden md:inline-flex text-sm px-3 py-2.5 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            로그인
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 -mr-2 rounded-md"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'absolute',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            maxHeight: 'calc(100dvh - var(--header-height))',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '8px 0' }}>
            <Link
              href="/daily"
              className="flex items-center px-6 py-3 text-sm transition-colors"
              style={{
                color: pathname.startsWith('/daily') ? 'var(--accent)' : 'var(--text)',
              }}
            >
              오늘의 지구
            </Link>

            <div style={{ padding: '8px 24px 4px', marginTop: 4, borderTop: '1px solid var(--border)' }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}>
                서비스
              </span>
            </div>
            {SERVICES.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                className="flex items-center gap-3 px-6 py-3 transition-colors"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-sm font-medium" style={{ color: s.color }}>{s.label}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</span>
              </Link>
            ))}

            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
              <Link
                href="/login"
                className="flex items-center px-6 py-3 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
