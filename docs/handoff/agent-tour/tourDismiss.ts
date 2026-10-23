// '다시 보지 않기' 저장 — 체크한 채 닫으면 다음 방문부터 자동 표시를 건너뛴다.
// 재진입 버튼('EP Agent 둘러보기')은 저장 여부와 상관없이 항상 투어를 연다.
// localStorage 가 막힌 환경(시크릿 모드 등)에서는 throw 하지 않고 미저장으로 취급한다.

export const TOUR_DISMISS_KEY = 'ep-agent-tutorial-dismissed';

export function isTourDismissed(): boolean {
  try {
    return window.localStorage.getItem(TOUR_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveTourDismissed(): void {
  try {
    window.localStorage.setItem(TOUR_DISMISS_KEY, '1');
  } catch {
    // 저장 불가 — 다음 방문 때 다시 자동 표시된다
  }
}
