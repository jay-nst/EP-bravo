import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { TUTORIAL_STEPS, HIGHLIGHT_STEPS, MODAL_STEP } from './agent-tutorial-steps';
import {
  STEP_COPY_EN,
  TUTORIAL_STEPS_BY_LOCALE,
  HIGHLIGHT_STEPS_BY_LOCALE,
  MODAL_STEP_BY_LOCALE,
  TUTORIAL_UI_COPY,
  TUTORIAL_SCREEN_ASSETS,
  CAPTURE_BASE_EN,
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

  it('영어 스텝은 흐름(id·액션·위젯)이 한국어 스펙과 같다', () => {
    const en = HIGHLIGHT_STEPS_BY_LOCALE.en;
    expect(en).toHaveLength(HIGHLIGHT_STEPS.length);
    en.forEach((s, i) => {
      const ko = HIGHLIGHT_STEPS[i];
      expect(s.id).toBe(ko.id);
      expect(s.action).toBe(ko.action);
      expect(s.widget).toBe(ko.widget);
      expect(s.loadingChat === undefined).toBe(ko.loadingChat === undefined);
      expect(s.loadingAfter === undefined).toBe(ko.loadingAfter === undefined);
      // 진행 버튼 라벨·위치는 버튼이 있는 스텝에만 붙는다
      expect(s.advanceLabel === undefined).toBe(ko.advanceLabel === undefined);
      expect(s.advanceHotspot === undefined).toBe(ko.advanceHotspot === undefined);
    });
  });

  // 2026-10-23 영문 실화면 재캡쳐: 영어 모드는 한글 캡쳐를 하나도 쓰지 않아야 한다
  // (지도 비교 위젯 자산 map-* 은 글자 없는 지도 크롭이라 예외 — STEP 캡쳐가 아니다)
  it('영어 스텝의 캡쳐는 모두 영문 캡쳐 폴더에 있고 실제 파일이 존재한다', () => {
    const urls = HIGHLIGHT_STEPS_BY_LOCALE.en.flatMap((s) => [
      s.capture,
      ...(s.loadingAfter?.frames.map((f) => f.capture) ?? []),
      ...(s.loadingChat ? [s.loadingChat.background, s.loadingChat.resultCards?.capture ?? ''] : []),
    ]);
    for (const url of [...urls.filter(Boolean), ...TUTORIAL_SCREEN_ASSETS.en.articleSegments]) {
      expect(url.startsWith(`${CAPTURE_BASE_EN}/`)).toBe(true);
      expect(existsSync(join(process.cwd(), 'public', url))).toBe(true);
    }
  });

  it('영어 핫스팟도 캡쳐 % 좌표계 안에 있다', () => {
    const rects = HIGHLIGHT_STEPS_BY_LOCALE.en.flatMap((s) => [
      s.hotspot,
      ...(s.advanceHotspot ? [s.advanceHotspot] : []),
      ...(s.loadingChat?.resultCards ? [s.loadingChat.resultCards.rect] : []),
    ]);
    for (const { x, y, w, h } of [...rects, TUTORIAL_SCREEN_ASSETS.en.tourEntryRect]) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + w).toBeLessThanOrEqual(100);
      expect(y + h).toBeLessThanOrEqual(100);
    }
  });

  it('결과 카드 크롭 위치는 다음 스텝의 카드 하이라이트와 같다 (제자리 안착)', () => {
    const [first, second] = HIGHLIGHT_STEPS_BY_LOCALE.en;
    expect(first.loadingChat?.resultCards?.capture).toBe(second.capture);
    expect(first.loadingChat?.resultCards?.rect).toEqual(second.hotspot);
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
