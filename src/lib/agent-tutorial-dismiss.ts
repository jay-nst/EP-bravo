// Agent 튜토리얼 '다시 보지 않기' 저장소 (2026-10-19 피그마 댓글 — Miyoung Lee)
//
// 동작 정의 (실구현 핸드오프 원형):
//  - 체크하지 않고 [닫기] → 현재 튜토리얼만 종료, 다음 진입 시 자동 표시
//  - 체크하고 [닫기]      → 선택을 저장하고 종료, 이후 자동 표시하지 않음
//  - 사용자가 'EP Agent 둘러보기' 실행 → 저장된 선택과 관계없이 표시
//  - 다른 브라우저 또는 사이트 데이터 삭제 → 다시 자동 표시
// 브라우저 단위 기억이라 localStorage 를 쓴다. 비공개 창·차단 환경에서는
// 접근자가 throw 할 수 있으므로 모든 읽기/쓰기를 감싼다 (실패 = 미저장 취급).

export const TUTORIAL_DISMISS_KEY = 'ep-agent-tutorial-dismissed';

/** 저장된 '다시 보지 않기' 선택이 있으면 true — 자동 표시를 건너뛴다 */
export function isTutorialDismissed(): boolean {
  try {
    return window.localStorage.getItem(TUTORIAL_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

/** '다시 보지 않기'를 체크한 채 닫았을 때 호출 */
export function saveTutorialDismissed(): void {
  try {
    window.localStorage.setItem(TUTORIAL_DISMISS_KEY, '1');
  } catch {
    // 저장 불가 환경 — 다음 진입 때 다시 자동 표시된다 (스펙상 허용되는 결과)
  }
}
