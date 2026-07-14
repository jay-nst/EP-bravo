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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleEnter = () => {
    clearTimeout(timerRef.current);
    setMenuOpen(true);
  };

  const handleLeave = () => {
    timerRef.current = setTimeout(() => setMenuOpen(false), 200);
  };

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
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Logo */}
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

          <nav className="flex items-center gap-1">
            {/* 오늘의 지구 */}
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

            {/* 서비스 드롭다운 */}
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

              {menuOpen && (
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
                      onClick={() => setMenuOpen(false)}
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: s.color }}
                      />
                      <div>
                        <p className="text-sm font-medium" style={{ color: s.color }}>{s.label}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm px-3 py-2.5 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}
