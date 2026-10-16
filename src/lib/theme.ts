import type { MapStyleId } from '@/components/map/EarthMap';

export type ResolvedTheme = 'dark' | 'light';

/** next-themes resolvedTheme(마운트 전 undefined) → 화면 테마. 모르면 다크(기존 기본값). */
export function toResolvedTheme(theme: string | undefined): ResolvedTheme {
  return theme === 'light' ? 'light' : 'dark';
}

/** 테마에 맞는 기본 지도 스타일 */
export function baseMapStyleFor(theme: ResolvedTheme): MapStyleId {
  return theme === 'light' ? 'light' : 'dark';
}

/**
 * 테마가 바뀔 때 지도 스타일을 따라 바꾼다.
 * 다크/라이트 베이스맵만 서로 전환하고, 사용자가 고른 위성·야간 스타일은 유지한다.
 */
export function mapStyleForTheme(current: MapStyleId, theme: ResolvedTheme): MapStyleId {
  if (current === 'dark' || current === 'light') return baseMapStyleFor(theme);
  return current;
}

/** 베이스맵 밝기. 라벨·마스크 색은 사이트 테마가 아니라 베이스맵 기준(위성 위에선 라이트 모드여도 흰 글자). */
export function isLightBasemap(styleId: MapStyleId): boolean {
  return styleId === 'light';
}

/** 지도 심볼 라벨·원 테두리 색 */
export function mapLabelPaint(styleId: MapStyleId) {
  return isLightBasemap(styleId)
    ? { text: '#17181a', halo: 'rgba(255,255,255,0.85)', stroke: 'rgba(255,255,255,0.9)' }
    : { text: '#E8E4DF', halo: 'rgba(14,14,16,0.8)', stroke: 'rgba(14,14,16,0.7)' };
}

/** 관심 지역 밖을 가리는 마스크 fill 색 (불투명도는 호출부에서 fill-opacity 로) */
export function mapMaskColor(styleId: MapStyleId): string {
  return isLightBasemap(styleId) ? '#ffffff' : '#0e0e10';
}
