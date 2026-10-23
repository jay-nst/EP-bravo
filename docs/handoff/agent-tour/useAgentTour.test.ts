// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAgentTour } from './useAgentTour';
import { TOUR_DISMISS_KEY } from './tourDismiss';

// 실제 서비스 화면을 흉내 낸 최소 DOM — data-tour 속성만 맞으면 투어가 동작한다
function el(tour: string, parent: Element = document.body, tag = 'div') {
  const node = document.createElement(tag);
  node.setAttribute('data-tour', tour);
  node.textContent = tour;
  parent.appendChild(node);
  return node;
}

const popoverTitle = () => document.querySelector('.driver-popover-title')?.textContent;
const clickNext = () =>
  (document.querySelector('.driver-popover-next-btn') as HTMLElement | null)?.click();

describe('useAgentTour', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.localStorage.clear();
    // jsdom 에 없는 레이아웃 API — driver.js 가 호출한다
    Element.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('실제 요소 클릭 → 다음 대상이 나타나면 이어지고, 마지막 클릭에서 onComplete', async () => {
    const onComplete = vi.fn();
    const onEvent = vi.fn();
    const chip = el('example-chip', document.body, 'button');
    // 앱 동작 흉내: 칩을 누르면 (분석 후) 결과 카드가 생긴다
    chip.addEventListener('click', () => {
      setTimeout(() => {
        const card = el('analysis-result');
        const show = el('show-on-map', card, 'button');
        show.addEventListener('click', () => el('map'));
      }, 20);
    });

    const { result } = renderHook(() =>
      useAgentTour({ locale: 'ko', onComplete, onEvent, waitTimeoutMs: 2000 }),
    );
    act(() => result.current.start());
    expect(onEvent).toHaveBeenCalledWith('started');
    await waitFor(() => expect(popoverTitle()).toBe('무엇을 물어볼지 막막하다면'));

    // 1단계: 사용자가 실제 칩을 클릭 → 투어가 내려갔다가 결과 카드가 나오면 2단계
    act(() => chip.click());
    await waitFor(() => expect(popoverTitle()).toBe('질문 하나로 위성 분석까지'));

    // 2단계: '다음' 버튼 = 카드 안 'show-on-map' 을 대신 클릭 → 지도 → 3단계
    act(() => clickNext());
    await waitFor(() => expect(popoverTitle()).toBe('지도에서 화재 전·후 비교'));

    // 3단계 → 4단계: 아티클 작성 버튼. 누르면 잠시 뒤 '보기' 버튼이 생기고(자동 클릭) 모달이 열린다
    const write = el('write-article', document.body, 'button');
    write.addEventListener('click', () => {
      setTimeout(() => {
        const view = el('view-article', document.body, 'button');
        view.addEventListener('click', () => {
          const modal = el('article-modal');
          el('save-pdf', modal, 'button');
        });
      }, 20);
    });
    act(() => clickNext());
    await waitFor(() => expect(popoverTitle()).toBe('분석 결과를 보고서로'));
    act(() => write.click());
    await waitFor(() => expect(popoverTitle()).toBe('보고서는 분석 아티클로'));

    // 5단계: PDF 저장 클릭 → 완료
    act(() => (document.querySelector('[data-tour="save-pdf"]') as HTMLElement).click());
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onEvent).toHaveBeenCalledWith('completed');
    expect(document.querySelector('.driver-popover')).toBeNull();
    expect(document.querySelector('.agent-tour-controls')).toBeNull();
  });

  it("상단 [닫기]는 어느 단계에서든 종료하고, '다시 보지 않기' 체크 시 저장한다", async () => {
    el('example-chip', document.body, 'button');
    const onClose = vi.fn();
    const { result } = renderHook(() => useAgentTour({ locale: 'en', onClose }));
    act(() => result.current.start());
    await waitFor(() => expect(popoverTitle()).toBe('Not sure what to ask?'));

    const controls = document.querySelector('.agent-tour-controls') as HTMLElement;
    const checkbox = controls.querySelector('input') as HTMLInputElement;
    act(() => {
      checkbox.click();
      (controls.querySelector('button') as HTMLButtonElement).click();
    });

    expect(onClose).toHaveBeenCalledWith({ dontShowAgain: true });
    expect(window.localStorage.getItem(TOUR_DISMISS_KEY)).toBe('1');
    expect(document.querySelector('.driver-popover')).toBeNull();
  });

  it('다음 대상이 끝내 나타나지 않으면 조용히 종료한다', async () => {
    el('example-chip', document.body, 'button');
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useAgentTour({ locale: 'ko', onComplete, waitTimeoutMs: 50 }),
    );
    act(() => result.current.start());
    await waitFor(() => expect(popoverTitle()).toBeTruthy());
    act(() => clickNext());
    await waitFor(() => expect(document.querySelector('.agent-tour-controls')).toBeNull());
    expect(onComplete).not.toHaveBeenCalled();
  });
});
