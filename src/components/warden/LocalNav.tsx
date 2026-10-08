'use client';

import { useEffect, useState } from 'react';
import { WARDEN_SECTIONS } from '@/lib/climate-intel';
import s from './warden.module.css';

/** Apple 제품 페이지식 로컬 내비 — 헤더 아래 고정, 현재 섹션 강조 */
export default function LocalNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = WARDEN_SECTIONS.map((sec) => document.getElementById(sec.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    let frame = 0;
    // 화면 상단 35% 선을 지난 마지막 섹션 = 현재 섹션. 첫 섹션 위(히어로·개요)면 강조 없음
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const el of targets) {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) current = el.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <nav className={s.localNav} aria-label="Warden 섹션">
      <div className={s.localNavInner}>
        <a href="#top" className={s.localNavTitle}>Warden</a>
        <div className={s.localNavLinks}>
          {WARDEN_SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className={`${s.localNavLink} ${active === sec.id ? s.localNavLinkOn : ''}`}
              aria-current={active === sec.id ? 'true' : undefined}
            >
              {sec.label}
            </a>
          ))}
        </div>
        <a href="#contact" className={s.localNavCta}>도입 문의</a>
      </div>
    </nav>
  );
}
