'use client';

import { useEffect, useState } from 'react';
import { PORTAL_SECTIONS } from '@/lib/climate-content';
import s from './climate.module.css';

/** 메탄 정보 포털 상단바 — LocalNav 와 같은 구조(고정·현재 섹션 강조), 정보원 톤으로 */
export default function PortalNav() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = PORTAL_SECTIONS.map((sec) => document.getElementById(sec.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    let frame = 0;
    // 화면 상단 35% 선을 지나고 있는 섹션 = 현재 섹션
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
    <nav className={s.localNav} aria-label="메탄 정보 포털 섹션">
      <div className={`${s.localNavInner} ${s.pNavInner}`}>
        <a href="#top" className={s.localNavTitle}>
          메탄 정보 포털
          <span className={s.pNavSub}>Korea Methane Watch</span>
        </a>
        <div className={`${s.localNavLinks} ${s.pNavLinks}`}>
          {PORTAL_SECTIONS.map((sec) => (
            <a
              key={sec.id}
              href={`#${sec.id}`}
              className={`${s.localNavLink} ${s.pNavLink} ${active === sec.id ? s.localNavLinkOn : ''}`}
              aria-current={active === sec.id ? 'true' : undefined}
            >
              {sec.label}
            </a>
          ))}
        </div>
        <span className={s.pLang}>
          <span className={s.pLangOn} lang="ko">KR</span>
          <span aria-hidden="true"> · </span>
          {/* 영문판은 운영 단계 (TODOS.md). 눌러도 반응 없는 링크를 두지 않는다 */}
          <span className={s.pLangOff} lang="en" aria-disabled="true" title="EN 준비 중">EN</span>
        </span>
        <a href="#request" className={s.localNavCta}>데이터 요청</a>
      </div>
    </nav>
  );
}
