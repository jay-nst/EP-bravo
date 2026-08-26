import { describe, it, expect, afterEach, vi } from 'vitest';
import { resolveNameField } from './map-style-overrides';

/** Replace navigator.languages for one assertion. */
function setLanguages(languages: string[]) {
  vi.stubGlobal('navigator', {
    languages,
    language: languages[0],
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolveNameField', () => {
  it('honors forceLang over the browser preference', () => {
    setLanguages(['en-US']);
    expect(resolveNameField('ko')).toBe('name_ko');
  });

  it('maps Korean to name_ko', () => {
    setLanguages(['ko-KR', 'ko', 'en']);
    expect(resolveNameField()).toBe('name_ko');
  });

  it('maps English to name_en', () => {
    setLanguages(['en-GB', 'en']);
    expect(resolveNameField()).toBe('name_en');
  });

  it('maps Japanese to name_ja', () => {
    setLanguages(['ja-JP']);
    expect(resolveNameField()).toBe('name_ja');
  });

  it('maps mainland Chinese to Simplified', () => {
    setLanguages(['zh-CN']);
    expect(resolveNameField()).toBe('name_zh-Hans');
  });

  it('maps Taiwan and Hong Kong to Traditional', () => {
    setLanguages(['zh-TW']);
    expect(resolveNameField()).toBe('name_zh-Hant');
    setLanguages(['zh-HK']);
    expect(resolveNameField()).toBe('name_zh-Hant');
  });

  it('maps a bare zh tag to Simplified', () => {
    setLanguages(['zh']);
    expect(resolveNameField()).toBe('name_zh-Hans');
  });

  it('falls back to English for a language Mapbox has no field for', () => {
    setLanguages(['th-TH']);
    expect(resolveNameField()).toBe('name_en');
  });

  it('skips unsupported languages and uses the next supported preference', () => {
    setLanguages(['th-TH', 'sw', 'ko-KR']);
    expect(resolveNameField()).toBe('name_ko');
  });

  it('is case insensitive on the tag', () => {
    setLanguages(['KO-kr']);
    expect(resolveNameField()).toBe('name_ko');
  });

  it('falls back to navigator.language when languages is empty', () => {
    vi.stubGlobal('navigator', { languages: [], language: 'ja-JP' });
    expect(resolveNameField()).toBe('name_ja');
  });

  it('returns English when navigator is unavailable (SSR)', () => {
    vi.stubGlobal('navigator', undefined);
    expect(resolveNameField()).toBe('name_en');
  });
});
