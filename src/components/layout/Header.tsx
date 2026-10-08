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
  { key: 'seoul', label: '서울 기후', desc: '도시 기후 대시보드', color: '#1bbfa8', href: '/seoul' },
  { key: 'gyeonggi', label: '경기 공원', desc: '공원 접근성 지도', color: '#4A9E6B', href: '/gyeonggi' },
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
      <div className="h-full px-16 md:px-24 flex items-center justify-between">
        <div className="flex items-center gap-24">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight flex items-center gap-8"
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
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/daily"
              className="px-12 py-10 text-sm rounded-[6px] transition-colors"
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
                className="px-12 py-10 text-sm rounded-[6px] transition-colors flex items-center gap-4"
                style={{ color: 'var(--text-muted)' }}
              >
                서비스
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute top-full left-0 mt-4 py-8 rounded-sm"
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
                      className="flex items-center gap-12 px-16 py-10 transition-colors hover:bg-[var(--surface-elevated)]"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span
                        className="w-8 h-8 rounded-full flex-shrink-0"
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

            <Link
              href="/proposals/agent-tutorial"
              className="px-12 py-10 text-sm rounded-[6px] transition-colors"
              style={{
                color: pathname.startsWith('/proposals/agent-tutorial')
                  ? 'var(--accent)'
                  : 'var(--text-muted)',
                background: pathname.startsWith('/proposals/agent-tutorial')
                  ? 'var(--surface-elevated)'
                  : 'transparent',
              }}
            >
              EP Agent
            </Link>

            <Link
              href="/proposals/order-tutorial"
              className="px-12 py-10 text-sm rounded-[6px] transition-colors"
              style={{
                color: pathname.startsWith('/proposals/order-tutorial')
                  ? 'var(--accent)'
                  : 'var(--text-muted)',
                background: pathname.startsWith('/proposals/order-tutorial')
                  ? 'var(--surface-elevated)'
                  : 'transparent',
              }}
            >
              EP Map Tutorial
            </Link>

            <Link
              href="/climate"
              className="px-12 py-10 text-sm rounded-[6px] transition-colors"
              style={{
                color: pathname.startsWith('/climate')
                  ? 'var(--accent)'
                  : 'var(--text-muted)',
                background: pathname.startsWith('/climate')
                  ? 'var(--surface-elevated)'
                  : 'transparent',
              }}
            >
              기후 인텔리전스
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-12">
          <Link
            href="/login"
            className="hidden md:inline-flex text-sm px-12 py-10 rounded-[6px] transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            로그인
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-8 -mr-8 rounded-[6px]"
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
              className="flex items-center px-24 py-12 text-sm transition-colors"
              style={{
                color: pathname.startsWith('/daily') ? 'var(--accent)' : 'var(--text)',
              }}
            >
              오늘의 지구
            </Link>

            <Link
              href="/proposals/agent-tutorial"
              className="flex items-center px-24 py-12 text-sm transition-colors"
              style={{
                color: pathname.startsWith('/proposals/agent-tutorial')
                  ? 'var(--accent)'
                  : 'var(--text)',
              }}
            >
              EP Agent
            </Link>

            <Link
              href="/proposals/order-tutorial"
              className="flex items-center px-24 py-12 text-sm transition-colors"
              style={{
                color: pathname.startsWith('/proposals/order-tutorial')
                  ? 'var(--accent)'
                  : 'var(--text)',
              }}
            >
              EP Map Tutorial
            </Link>

            <Link
              href="/climate"
              className="flex items-center px-24 py-12 text-sm transition-colors"
              style={{
                color: pathname.startsWith('/climate')
                  ? 'var(--accent)'
                  : 'var(--text)',
              }}
            >
              기후 인텔리전스
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
                className="flex items-center gap-12 px-24 py-12 transition-colors"
              >
                <span
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-sm font-medium" style={{ color: s.color }}>{s.label}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</span>
              </Link>
            ))}

            <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
              <Link
                href="/login"
                className="flex items-center px-24 py-12 text-sm"
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
