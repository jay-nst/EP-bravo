import { describe, it, expect } from 'vitest';
import { toResolvedTheme, baseMapStyleFor, mapStyleForTheme, isLightBasemap, mapLabelPaint, mapMaskColor } from './theme';

describe('toResolvedTheme', () => {
  it('light 만 light 로, 나머지는 dark 로 본다', () => {
    expect(toResolvedTheme('light')).toBe('light');
    expect(toResolvedTheme('dark')).toBe('dark');
    expect(toResolvedTheme(undefined)).toBe('dark');
    expect(toResolvedTheme('system')).toBe('dark');
  });
});

describe('baseMapStyleFor', () => {
  it('테마와 같은 베이스맵을 고른다', () => {
    expect(baseMapStyleFor('dark')).toBe('dark');
    expect(baseMapStyleFor('light')).toBe('light');
  });
});

describe('mapStyleForTheme', () => {
  it('다크/라이트 베이스맵은 테마를 따라 전환한다', () => {
    expect(mapStyleForTheme('dark', 'light')).toBe('light');
    expect(mapStyleForTheme('light', 'dark')).toBe('dark');
    expect(mapStyleForTheme('dark', 'dark')).toBe('dark');
  });

  it('위성·야간 스타일은 사용자 선택을 유지한다', () => {
    expect(mapStyleForTheme('satellite', 'light')).toBe('satellite');
    expect(mapStyleForTheme('night-nav', 'light')).toBe('night-nav');
  });
});

describe('basemap paint', () => {
  it('라이트 베이스맵에서만 어두운 글자·흰 마스크', () => {
    expect(isLightBasemap('light')).toBe(true);
    expect(isLightBasemap('satellite')).toBe(false);
    expect(mapLabelPaint('light').text).toBe('#17181a');
    expect(mapLabelPaint('satellite').text).toBe('#E8E4DF');
    expect(mapLabelPaint('dark').halo).toBe('rgba(14,14,16,0.8)');
    expect(mapMaskColor('light')).toBe('#ffffff');
    expect(mapMaskColor('night-nav')).toBe('#0e0e10');
  });
});
