'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@naraspace-technology/nds/components';
import { IconChevronDown, IconMenu, IconX } from '@naraspace-technology/nds/icons';

// color = 플랫폼 마크(점) 전용 데이터 색 — 글자 색으로 쓰지 않는다 (§7-2)
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

// 내비 항목은 링크로 둔다 (NDS 에 내비게이션 컴포넌트 없음, Button 은 색 커스텀 불가 —
// 비활성 muted / 활성 accent 색을 유지해야 함). NDS 타이포·토큰·radius 만 적용
const desktopNavClass = (active: boolean) =>
  `px-12 py-10 text-body-sm-regular rounded-sm transition-colors ${
    active ? 'text-text-interactive-primary bg-bg-primary' : 'text-text-tertiary'
  }`;

const mobileNavClass = (active: boolean) =>
  `flex items-center px-24 py-12 text-body-sm-regular transition-colors ${
    active ? 'text-text-interactive-primary' : 'text-text-primary'
  }`;

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
    <header className="sticky top-0 z-50 h-(--header-height) border-b border-border-tertiary bg-bg-tertiary/88 backdrop-blur-md">
      <div className="h-full px-16 md:px-24 flex items-center justify-between">
        <div className="flex items-center gap-24">
          <Link href="/" className="text-body-md-medium text-text-primary flex items-center gap-8">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
              <ellipse cx="12" cy="12" rx="10" ry="4" stroke="var(--accent)" strokeWidth="1" transform="rotate(-30 12 12)" opacity="0.6" />
              <circle cx="18.5" cy="7" r="1.5" fill="var(--accent)" opacity="0.8" />
            </svg>
            EARTHPAPER
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/daily" className={desktopNavClass(pathname.startsWith('/daily'))}>
              오늘의 지구
            </Link>

            <div
              ref={menuRef}
              className="relative"
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              {/* 호버 드롭다운 트리거 — 형제 내비 링크와 같은 모양 (NDS 에 Menu/Popover 없음) */}
              <button
                type="button"
                className="px-12 py-10 text-body-sm-regular text-text-tertiary rounded-sm transition-colors flex items-center gap-4"
              >
                서비스
                <IconChevronDown className="size-16" />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-4 py-8 min-w-220 rounded-md bg-bg-secondary inset-ring-1 inset-ring-border-tertiary shadow-6">
                  {SERVICES.map((s) => (
                    <Link
                      key={s.key}
                      href={s.href}
                      className="flex items-center gap-12 px-16 py-10 transition-colors hover:bg-bg-primary"
                      onClick={() => setDropdownOpen(false)}
                    >
                      {/* 플랫폼 식별은 작은 점(마크)으로만 — 글자는 NDS 텍스트 토큰 (§7-2) */}
                      <span
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        style={{ background: s.color }}
                      />
                      <div>
                        <p className="text-body-sm-medium text-text-primary">{s.label}</p>
                        <p className="text-body-xs-regular text-text-tertiary">{s.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/proposals/agent-tutorial"
              className={desktopNavClass(pathname.startsWith('/proposals/agent-tutorial'))}
            >
              EP Agent
            </Link>

            <Link href="/climate" className={desktopNavClass(pathname.startsWith('/climate'))}>
              기후 인텔리전스
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-12">
          <Link
            href="/login"
            className="hidden md:inline-flex text-body-sm-regular text-text-tertiary px-12 py-10 rounded-sm transition-colors"
          >
            로그인
          </Link>

          {/* Mobile hamburger */}
          <Button
            variant="text"
            iconOnly
            className="md:hidden -mr-8"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {mobileOpen ? <IconX /> : <IconMenu />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-(--header-height) inset-x-0 max-h-[calc(100dvh-var(--header-height))] overflow-y-auto bg-bg-secondary border-b border-border-tertiary shadow-6">
          <div className="py-8">
            <Link href="/daily" className={mobileNavClass(pathname.startsWith('/daily'))}>
              오늘의 지구
            </Link>

            <Link
              href="/proposals/agent-tutorial"
              className={mobileNavClass(pathname.startsWith('/proposals/agent-tutorial'))}
            >
              EP Agent
            </Link>

            <Link href="/climate" className={mobileNavClass(pathname.startsWith('/climate'))}>
              기후 인텔리전스
            </Link>

            <div className="px-24 pt-8 pb-4 mt-4 border-t border-border-tertiary">
              <span className="text-body-sm-medium text-text-secondary">서비스</span>
            </div>
            {SERVICES.map((s) => (
              <Link
                key={s.key}
                href={s.href}
                className="flex items-center gap-12 px-24 py-12 transition-colors"
              >
                {/* 플랫폼 마크(점) — 데이터 색 */}
                <span
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-body-sm-medium text-text-primary">{s.label}</span>
                <span className="text-body-xs-regular text-text-tertiary">{s.desc}</span>
              </Link>
            ))}

            <div className="border-t border-border-tertiary mt-8 pt-8">
              <Link href="/login" className="flex items-center px-24 py-12 text-body-sm-regular text-text-tertiary">
                로그인
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
