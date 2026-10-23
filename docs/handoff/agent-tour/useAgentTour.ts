'use client';

// EP Agent 튜토리얼 훅 — driver.js 1.x 로 실제 화면 위에 투어를 띄운다.
//
// 흐름:
//   start() → 1단계(예시 칩) 하이라이트
//   → 사용자가 칩 클릭(또는 '다음') → 투어를 잠시 내리고 실제 분석이 진행되는 걸 보여준다
//   → 결과 카드(data-tour="analysis-result")가 화면에 나타나면 2단계로 자동 재개
//   → … → 마지막 스텝의 버튼 클릭 → onComplete (가입 모달은 서비스가 띄운다)
//   닫기(상단 [닫기] · 말풍선 X · ESC)는 어느 단계에서든 투어 종료. 오버레이 빈 곳 클릭은 무시.
//
// 'click' 스텝은 실제 요소를 사용자가 누르면 앱이 원래 동작(메시지 전송, 지도 표시 등)을
// 그대로 하고, 투어는 다음 스텝 대상이 DOM 에 나타날 때까지 기다렸다가 이어진다.
// '다음' 버튼은 같은 요소를 대신 클릭한다 — 두 경로가 항상 같은 결과가 되도록.

import { useCallback, useEffect, useRef } from 'react';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import './agentTour.css';
import { TOUR_STEPS, TOUR_UI, tourSelector, type TourLocale } from './agentTour';
import { saveTourDismissed } from './tourDismiss';

export type TourEvent = 'started' | 'closed' | 'completed';

export interface UseAgentTourOptions {
  locale: TourLocale;
  /** 마지막 스텝까지 끝냈을 때 — 가입 유도 모달을 연다 (SIGNUP_COPY) */
  onComplete?: () => void;
  /** 닫기·ESC 로 중간에 끝냈을 때 */
  onClose?: (info: { dontShowAgain: boolean }) => void;
  /** 분석 이벤트 연동용 (Clarity/GA 등) */
  onEvent?: (event: TourEvent, data?: Record<string, unknown>) => void;
  /**
   * 다음 스텝 대상이 나타나길 기다리는 최대 시간(ms). 1→2단계는 실제 분석 시간이라
   * 길게 잡는다 (넓은 영역은 10분 이상). 초과하면 투어를 조용히 종료한다.
   */
  waitTimeoutMs?: number;
}

const DEFAULT_WAIT_MS = 15 * 60 * 1000;

/** selector 요소가 DOM 에 나타나면 resolve. cancel() 하면 null 로 끝난다 */
function waitForElement(selector: string, timeoutMs: number) {
  let observer: MutationObserver | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let settle: (el: Element | null) => void = () => {};

  const promise = new Promise<Element | null>((resolve) => {
    settle = (el) => {
      observer?.disconnect();
      if (timer) clearTimeout(timer);
      resolve(el);
    };
    const found = document.querySelector(selector);
    if (found) {
      settle(found);
      return;
    }
    observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) settle(el);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    timer = setTimeout(() => settle(null), timeoutMs);
  });

  return { promise, cancel: () => settle(null) };
}

export function useAgentTour(options: UseAgentTourOptions) {
  // 콜백은 매 렌더 바뀔 수 있어 ref 로 최신 값을 읽는다 (start 를 다시 만들지 않게)
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const driverRef = useRef<Driver | null>(null);
  const controlsRef = useRef<HTMLElement | null>(null);
  const cancelWaitRef = useRef<(() => void) | null>(null);
  const clickListenerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const dontShowAgainRef = useRef(false);
  // 스텝 진행 중 중복 처리 방지 (실제 클릭과 '다음'이 겹칠 때)
  const advancingRef = useRef(false);

  const teardown = useCallback(() => {
    cancelWaitRef.current?.();
    cancelWaitRef.current = null;
    if (clickListenerRef.current) {
      document.removeEventListener('click', clickListenerRef.current, true);
      clickListenerRef.current = null;
    }
    driverRef.current?.destroy(); // public destroy 는 onDestroyStarted 를 타지 않는다
    driverRef.current = null;
    controlsRef.current?.remove();
    controlsRef.current = null;
    advancingRef.current = false;
  }, []);

  const close = useCallback(() => {
    const dontShowAgain = dontShowAgainRef.current;
    if (dontShowAgain) saveTourDismissed();
    teardown();
    optionsRef.current.onClose?.({ dontShowAgain });
    optionsRef.current.onEvent?.('closed', { dont_show_again: dontShowAgain });
  }, [teardown]);

  const complete = useCallback(() => {
    teardown();
    optionsRef.current.onComplete?.();
    optionsRef.current.onEvent?.('completed');
  }, [teardown]);

  // 상단 우측 [다시 보지 않기] [닫기] — 투어가 대기 중(분석 진행)일 때도 계속 보인다
  const mountControls = useCallback(
    (locale: TourLocale) => {
      const ui = TOUR_UI[locale];
      const root = document.createElement('div');
      root.className = 'agent-tour-controls';
      root.setAttribute('role', 'group');

      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.addEventListener('change', () => {
        dontShowAgainRef.current = checkbox.checked;
      });
      label.append(checkbox, document.createTextNode(ui.dontShowAgain));

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.textContent = ui.close;
      closeBtn.addEventListener('click', close);

      root.append(label, closeBtn);
      document.body.appendChild(root);
      controlsRef.current = root;
    },
    [close],
  );

  const start = useCallback(() => {
    teardown();
    dontShowAgainRef.current = false;
    const { locale } = optionsRef.current;
    const ui = TOUR_UI[locale];

    // index 스텝을 끝내고 다음으로 — byUserClick 이면 앱이 이미 클릭을 처리했다
    const advance = (index: number, byUserClick: boolean) => {
      const d = driverRef.current;
      if (!d || advancingRef.current || d.getActiveIndex() !== index) return;
      const step = TOUR_STEPS[index];
      const isLast = index === TOUR_STEPS.length - 1;

      if (step.advance === 'next') {
        if (isLast) complete();
        else d.moveNext();
        return;
      }

      advancingRef.current = true;
      if (!byUserClick) {
        const el = document.querySelector<HTMLElement>(
          tourSelector(step.clickTarget ?? step.target),
        );
        el?.click();
      }
      if (isLast) {
        complete();
        return;
      }

      // 다음 대상이 나타날 때까지 투어를 내린다 (분석 진행·모달 열림을 가리지 않게)
      d.destroy();
      const timeoutMs = optionsRef.current.waitTimeoutMs ?? DEFAULT_WAIT_MS;
      const waitFor = async (id: string) => {
        const wait = waitForElement(tourSelector(id), timeoutMs);
        cancelWaitRef.current = wait.cancel;
        const el = await wait.promise;
        cancelWaitRef.current = null;
        return driverRef.current === d ? el : null; // 그 사이 닫혔으면 중단
      };
      void (async () => {
        if (step.openWhenReady) {
          const mid = await waitFor(step.openWhenReady);
          if (!mid) return void (driverRef.current === d && teardown());
          (mid as HTMLElement).click();
        }
        const el = await waitFor(TOUR_STEPS[index + 1].target);
        advancingRef.current = false;
        if (driverRef.current !== d) return;
        if (el) d.drive(index + 1);
        else teardown(); // 시간 초과 — 조용히 종료
      })();
    };

    const d = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      // 닫기가 '투어 종료'라서, 오버레이 빈 곳을 잘못 눌러 끝나지 않게 막는다
      overlayClickBehavior: () => {},
      overlayOpacity: 0.72,
      stagePadding: 6,
      popoverClass: 'agent-tour-popover',
      nextBtnText: ui.next,
      prevBtnText: ui.prev,
      doneBtnText: ui.done,
      steps: TOUR_STEPS.map((s, i) => {
        const c = s.copy[locale];
        const hint =
          s.advance === 'click'
            ? c.clickLabel
              ? ui.clickHintWithLabel(c.clickLabel)
              : ui.clickHint
            : ui.nextHint;
        return {
          element: tourSelector(s.target),
          popover: {
            title: c.title,
            description: `${c.body}<div class="agent-tour-hint"><span class="agent-tour-hint-arrow" aria-hidden="true"></span><span>${hint}</span></div>`,
            side: s.side,
            align: s.align,
            showButtons: ['next', 'previous', 'close'],
            progressText: `${i + 1} / ${TOUR_STEPS.length + 1}`, // +1 = 가입 모달
            onNextClick: () => advance(i, false),
          },
          onHighlighted: (el?: Element) => {
            // 클릭 대상에 시선 유도 펄스
            const clickEl = s.clickTarget
              ? el?.querySelector(tourSelector(s.clickTarget))
              : s.advance === 'click'
                ? el
                : null;
            document
              .querySelectorAll('.agent-tour-pulse')
              .forEach((n) => n.classList.remove('agent-tour-pulse'));
            clickEl?.classList.add('agent-tour-pulse');
          },
        };
      }),
      // 말풍선 X · ESC 가 여기로 온다 (마지막 스텝 완료는 advance 에서 직접 처리)
      onDestroyStarted: () => close(),
      onDestroyed: () => {
        document
          .querySelectorAll('.agent-tour-pulse')
          .forEach((n) => n.classList.remove('agent-tour-pulse'));
      },
    });
    driverRef.current = d;

    // 실제 요소 클릭 감지 — 캡처 단계에서 보기만 하고 막지 않는다 (앱 핸들러가 그대로 실행)
    const onClick = (e: MouseEvent) => {
      const active = driverRef.current?.getActiveIndex();
      if (active === undefined) return;
      const step = TOUR_STEPS[active];
      if (step.advance !== 'click') return;
      const target = e.target instanceof Element ? e.target : null;
      if (!target?.closest(tourSelector(step.clickTarget ?? step.target))) return;
      // 앱의 클릭 처리가 먼저 끝나도록 한 틱 뒤에 진행
      setTimeout(() => advance(active, true), 0);
    };
    document.addEventListener('click', onClick, true);
    clickListenerRef.current = onClick;

    mountControls(locale);
    d.drive();
    optionsRef.current.onEvent?.('started');
  }, [teardown, close, complete, mountControls]);

  // 언마운트 시 오버레이·리스너 잔재 제거
  useEffect(() => teardown, [teardown]);

  return { start, close };
}
