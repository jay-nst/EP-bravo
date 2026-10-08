'use client';

import { useEffect, type CSSProperties, type RefObject } from 'react';

/**
 * 스크롤 등장 애니메이션. root 아래 `data-reveal` 요소가 화면에 들어오면 `data-in`을 붙여
 * CSS 트랜지션(warden.module.css)을 시작하고, 끝나면 두 속성을 지워 hover 트랜지션과 섞이지 않게 한다.
 * 필터 전환 등으로 나중에 생긴 요소도 MutationObserver로 잡는다.
 * 지연은 요소의 `--d` CSS 변수(예: style={{ '--d': '120ms' }})로 준다.
 */
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const finish = (el: HTMLElement) => {
      el.removeAttribute('data-reveal');
      el.removeAttribute('data-in');
      el.style.removeProperty('--d');
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach(finish);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          el.setAttribute('data-in', '');
          const done = (e: TransitionEvent) => {
            if (e.target !== el || e.propertyName !== 'opacity') return;
            el.removeEventListener('transitionend', done);
            finish(el);
          };
          el.addEventListener('transitionend', done);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    const observeAll = (scope: ParentNode) => {
      scope.querySelectorAll<HTMLElement>('[data-reveal]:not([data-in])').forEach((el) => io.observe(el));
    };
    observeAll(root);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach((n) => {
          if (!(n instanceof HTMLElement)) return;
          if (n.hasAttribute('data-reveal')) io.observe(n);
          observeAll(n);
        });
      }
    });
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [rootRef]);
}

/** `data-reveal` 요소의 등장 지연. 순서대로 나오는 카드·숫자에 쓴다. */
export function revealDelay(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties;
}
