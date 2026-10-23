// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TOUR_DISMISS_KEY, isTourDismissed, saveTourDismissed } from './tourDismiss';

describe('tourDismiss', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('저장된 선택이 없으면 자동 표시한다', () => {
    expect(isTourDismissed()).toBe(false);
  });

  it("'다시 보지 않기'를 저장하면 이후 자동 표시하지 않는다", () => {
    saveTourDismissed();
    expect(window.localStorage.getItem(TOUR_DISMISS_KEY)).toBe('1');
    expect(isTourDismissed()).toBe(true);
  });

  it('localStorage 접근이 throw 해도 깨지지 않는다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => saveTourDismissed()).not.toThrow();
    expect(isTourDismissed()).toBe(false);
  });
});
