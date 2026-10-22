import { describe, it, expect } from 'vitest';
import { TUTORIAL_STEPS, HIGHLIGHT_STEPS, MODAL_STEP } from './agent-tutorial-steps';
import {
  STEP_COPY_EN,
  TUTORIAL_STEPS_BY_LOCALE,
  HIGHLIGHT_STEPS_BY_LOCALE,
  MODAL_STEP_BY_LOCALE,
  TUTORIAL_UI_COPY,
  parseTutorialLocale,
} from './agent-tutorial-i18n';

const HANGUL = /[가-힣]/;

// 함수 카피는 샘플 인자로 펼쳐서 문자열만 모은다
function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value === 'function') return collectStrings((value as (a: string) => unknown)('X'));
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
  return [];
}

describe('agent-tutorial-i18n', () => {
  it('한국어는 기존 스펙 객체를 그대로 쓴다 (카피 정본 유지)', () => {
    expect(TUTORIAL_STEPS_BY_LOCALE.ko).toBe(TUTORIAL_STEPS);
    expect(HIGHLIGHT_STEPS_BY_LOCALE.ko).toEqual(HIGHLIGHT_STEPS);
    expect(MODAL_STEP_BY_LOCALE.ko).toBe(MODAL_STEP);
  });

  it('모든 스텝에 영어 카피가 있고, 남는 번역 키가 없다', () => {
    const ids = TUTORIAL_STEPS.map((s) => s.id).sort();
    expect(Object.keys(STEP_COPY_EN).sort()).toEqual(ids);
  });

  it('영어 스텝은 문구만 다르고 좌표·캡쳐·액션은 한국어 스펙과 같다', () => {
    const en = HIGHLIGHT_STEPS_BY_LOCALE.en;
    expect(en).toHaveLength(HIGHLIGHT_STEPS.length);
    en.forEach((s, i) => {
      const ko = HIGHLIGHT_STEPS[i];
      expect(s.id).toBe(ko.id);
      expect(s.capture).toBe(ko.capture);
      expect(s.hotspot).toEqual(ko.hotspot);
      expect(s.advanceHotspot).toEqual(ko.advanceHotspot);
      expect(s.action).toBe(ko.action);
      expect(s.widget).toBe(ko.widget);
      expect(s.loadingAfter).toEqual(ko.loadingAfter);
      expect(s.loadingChat?.background).toBe(ko.loadingChat?.background);
      expect(s.loadingChat?.resultCards).toEqual(ko.loadingChat?.resultCards);
      // 진행 버튼 라벨은 버튼이 있는 스텝에만 붙는다
      expect(s.advanceLabel === undefined).toBe(ko.advanceLabel === undefined);
    });
  });

  it('영어 카피에 한글이 남아 있지 않다', () => {
    const en = TUTORIAL_STEPS_BY_LOCALE.en.flatMap((s) =>
      s.type === 'modal'
        ? [s.title, s.body]
        : [
            s.title,
            s.body,
            s.advanceLabel ?? '',
            ...collectStrings({ ...s.loadingChat, background: '', resultCards: undefined }),
          ],
    );
    for (const text of [...en, ...collectStrings(TUTORIAL_UI_COPY.en)]) {
      expect(text).not.toMatch(HANGUL);
    }
  });

  it('UI 카피는 두 로케일이 같은 키를 가진다', () => {
    expect(Object.keys(TUTORIAL_UI_COPY.en).sort()).toEqual(
      Object.keys(TUTORIAL_UI_COPY.ko).sort(),
    );
    expect(Object.keys(TUTORIAL_UI_COPY.en.map).sort()).toEqual(
      Object.keys(TUTORIAL_UI_COPY.ko.map).sort(),
    );
  });

  it('?lang 값은 en 만 영어로, 나머지는 한국어로 해석한다', () => {
    expect(parseTutorialLocale('en')).toBe('en');
    expect(parseTutorialLocale('ko')).toBe('ko');
    expect(parseTutorialLocale(null)).toBe('ko');
    expect(parseTutorialLocale('fr')).toBe('ko');
  });
});
