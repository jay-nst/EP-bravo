'use client';

import { useEffect, type CSSProperties, type RefObject } from 'react';

/**
 * 스크롤 애니메이션 (climate.module.css 와 짝).
 *
 * 1) 등장 — `data-reveal` 요소가 화면에 들어오면 `data-in`을 붙여 CSS 트랜지션 시작, 끝나면 두 속성을 지움.
 *    요소 종류별 움직임은 CSS가 결정 (헤드라인 마스크, 이미지 와이프, 타임라인 선 긋기 등).
 *    지연은 `--d` CSS 변수 (revealDelay).
 * 2) 카운트업 — 등장한 요소 안의 `data-count` 숫자를 0부터 올림 ("7,428.8", "14×40" 같은 형식 유지).
 * 3) 스크롤 연동 — `data-progress` 요소에 진행률 `--p`(0~1)를 매 프레임 기록.
 *    enter: 화면 아래에서 들어와 위쪽 30%까지 / through: 요소 전체가 지나가는 동안 / exit: 화면 위로 빠져나가는 동안.
 */
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finish = (el: HTMLElement) => {
      el.removeAttribute('data-reveal');
      el.removeAttribute('data-in');
      el.style.removeProperty('--d');
    };

    // ── 스크롤 연동 진행률
    const setProgress = () => {
      const vh = window.innerHeight;
      root.querySelectorAll<HTMLElement>('[data-progress]').forEach((el) => {
        if (reduced) {
          el.style.setProperty('--p', el.dataset.progress === 'exit' ? '0' : '1');
          return;
        }
        const r = el.getBoundingClientRect();
        let p: number;
        if (el.dataset.progress === 'exit') p = -r.top / Math.max(r.height, 1);
        else if (el.dataset.progress === 'through') p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        else p = (vh - r.top) / (vh * 0.7);
        el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
      });
    };
    let frame = 0;
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; setProgress(); });
    };
    setProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    if (reduced || !('IntersectionObserver' in window)) {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach(finish);
      return () => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      };
    }

    // ── 카운트업
    const countUp = (scope: HTMLElement) => {
      const targets = scope.matches('[data-count]')
        ? [scope]
        : Array.from(scope.querySelectorAll<HTMLElement>('[data-count]'));
      targets.forEach((el) => {
        const text = el.dataset.count ?? '';
        const parts = text.split(/([\d,.]+)/); // 숫자 조각만 애니메이션, 나머지(×, D-, $)는 그대로
        const nums = parts.map((t) => (/^[\d,.]+$/.test(t) && /\d/.test(t) ? t : null));
        if (!nums.some(Boolean)) return;
        const start = performance.now();
        const dur = 1200;
        const tick = (now: number) => {
          const k = Math.min(1, (now - start) / dur);
          const e = 1 - Math.pow(1 - k, 3);
          el.textContent = parts
            .map((t, i) => {
              const n = nums[i];
              if (!n) return t;
              const decimals = (n.split('.')[1] ?? '').length;
              const value = parseFloat(n.replace(/,/g, '')) * e;
              const fixed = value.toFixed(decimals);
              return n.includes(',')
                ? Number(fixed).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
                : fixed;
            })
            .join('');
          if (k < 1) requestAnimationFrame(tick);
          else el.textContent = text;
        };
        requestAnimationFrame(tick);
      });
    };

    // ── 등장
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          el.setAttribute('data-in', '');
          countUp(el);
          // 가장 긴 트랜지션이 끝난 뒤 정리 (자식 요소 트랜지션 포함)
          const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d')) || 0;
          window.setTimeout(() => finish(el), delay + 1700);
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
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [rootRef]);
}

/** `data-reveal` 요소의 등장 지연. 순서대로 나오는 카드·숫자에 쓴다. */
export function revealDelay(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties;
}
