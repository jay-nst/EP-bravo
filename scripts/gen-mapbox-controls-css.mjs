#!/usr/bin/env node
// Mapbox 지도 컨트롤(NavigationControl + MapboxDraw)을 NDS 모양으로 바꾸는 CSS 생성.
// 컨트롤은 Mapbox 가 만드는 DOM 이라 NDS React 아이콘을 넣을 수 없으므로,
// NDS 아이콘 SVG 경로를 패키지에서 읽어 CSS mask 로 입힌다 (색은 currentColor 대신 토큰 배경).
//   재생성: node scripts/gen-mapbox-controls-css.mjs   (NDS 업데이트 후 아이콘이 바뀌면)
//   출력:   src/styles/nds/mapbox-controls.css
import { readFileSync, writeFileSync } from 'node:fs';

const ICON_DIR = 'node_modules/@naraspace-technology/nds/dist/icons';
const ICONS = {
  plus: 'IconPlus',
  minus: 'IconMinus',
  compass: 'IconCompass',
  polygon: 'IconAoiSquare',
  trash: 'IconTrashEmpty',
};

function svgDataUri(name) {
  const js = readFileSync(`${ICON_DIR}/${name}.js`, 'utf8');
  const paths = [...js.matchAll(/d: "([^"]+)"/g)].map((m) => m[1]);
  if (paths.length === 0) throw new Error(`no path in ${name}`);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">` +
    paths.map((d) => `<path fill="black" fill-rule="evenodd" clip-rule="evenodd" d="${d}"/>`).join('') +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const uri = Object.fromEntries(Object.entries(ICONS).map(([k, n]) => [k, svgDataUri(n)]));

const css = `/* 자동 생성 — scripts/gen-mapbox-controls-css.mjs. 직접 수정하지 말 것.
   Mapbox NavigationControl(확대/축소/나침반) + MapboxDraw(폴리곤/삭제)를 NDS 모양으로:
   - 그룹 = NDS 표면 (bg-tertiary, inset-ring border-tertiary, radius-md, elevation-6)
   - 버튼 = NDS Button text sm iconOnly 크기(32px), hover/선택 토큰
   - 아이콘 = NDS 아이콘(${Object.values(ICONS).join(', ')}) SVG 를 mask 로 */

.mapboxgl-ctrl-group {
  background: var(--bg-tertiary) !important;
  border: 0 !important;
  border-radius: var(--radius-md) !important;
  box-shadow: inset 0 0 0 1px var(--border-tertiary), var(--elevation-6) !important;
  overflow: hidden;
}

.mapboxgl-ctrl-group button {
  width: 32px !important;
  height: 32px !important;
  background: transparent !important;
  border: 0 !important;
  filter: none !important;
  position: relative;
}

.mapboxgl-ctrl-group button + button {
  border-top: 1px solid var(--border-tertiary) !important;
}

.mapboxgl-ctrl-group button:not(:disabled):hover {
  background: var(--bg-interactive-secondary-hover) !important;
}

.mapboxgl-ctrl-group button:focus-visible {
  outline: 2px solid var(--border-focus-ring);
  outline-offset: -2px;
  box-shadow: none !important;
}

/* 아이콘: 내비게이션은 내부 span(.mapboxgl-ctrl-icon), 그리기 버튼은 ::before */
.mapboxgl-ctrl-group .mapboxgl-ctrl-icon,
.mapbox-gl-draw_ctrl-draw-btn::before {
  background-image: none !important;
  background-color: var(--icon-primary) !important;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: 20px 20px;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: 20px 20px;
}

.mapbox-gl-draw_ctrl-draw-btn {
  background-image: none !important;
}

.mapbox-gl-draw_ctrl-draw-btn::before {
  content: '';
  position: absolute;
  inset: 0;
}

.mapboxgl-ctrl-group button:not(:disabled):hover .mapboxgl-ctrl-icon,
.mapbox-gl-draw_ctrl-draw-btn:not(:disabled):hover::before {
  background-color: var(--icon-interactive-primary-hover) !important;
}

/* 그리기 모드 활성 = NDS 선택 상태 */
.mapbox-gl-draw_ctrl-draw-btn.active {
  background: var(--bg-interactive-selected) !important;
}
.mapbox-gl-draw_ctrl-draw-btn.active::before {
  background-color: var(--icon-interactive-selected) !important;
}

.mapboxgl-ctrl-group button:disabled .mapboxgl-ctrl-icon {
  background-color: var(--icon-disabled) !important;
}

.mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon { mask-image: ${uri.plus}; -webkit-mask-image: ${uri.plus}; }
.mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon { mask-image: ${uri.minus}; -webkit-mask-image: ${uri.minus}; }
.mapboxgl-ctrl-compass .mapboxgl-ctrl-icon { mask-image: ${uri.compass}; -webkit-mask-image: ${uri.compass}; }
.mapbox-gl-draw_polygon::before { mask-image: ${uri.polygon}; -webkit-mask-image: ${uri.polygon}; }
.mapbox-gl-draw_trash::before { mask-image: ${uri.trash}; -webkit-mask-image: ${uri.trash}; }
`;

writeFileSync('src/styles/nds/mapbox-controls.css', css);
console.log('wrote src/styles/nds/mapbox-controls.css', css.length, 'bytes');
