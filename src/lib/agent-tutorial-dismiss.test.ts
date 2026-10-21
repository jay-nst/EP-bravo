// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  TUTORIAL_DISMISS_KEY,
  isTutorialDismissed,
  saveTutorialDismissed,
} from './agent-tutorial-dismiss';

describe('agent-tutorial-dismiss', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('저장된 선택이 없으면 자동 표시한다 (첫 방문·사이트 데이터 삭제)', () => {
    expect(isTutorialDismissed()).toBe(false);
  });

  it("'다시 보지 않기'를 저장하면 이후 자동 표시하지 않는다", () => {
    saveTutorialDismissed();
    expect(window.localStorage.getItem(TUTORIAL_DISMISS_KEY)).toBe('1');
    expect(isTutorialDismissed()).toBe(true);
  });

  it('localStorage 접근이 throw 해도 깨지지 않고 미저장으로 취급한다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => saveTutorialDismissed()).not.toThrow();
    expect(isTutorialDismissed()).toBe(false);
  });
});
