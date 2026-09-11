// 경기 공원 접근성 지도에 표시되는 모든 데이터의 출처.
//
// 사이드바 '데이터 출처' 섹션과 지도 하단 크레딧이 이 파일만 읽는다.
// 레이어를 추가하면 여기에도 항목을 넣는다 — 출처 없이 화면에 뜨는 데이터가 없어야 한다.
// (구조는 seoul-data-sources.ts 와 동일. 배지 정의는 거기서 그대로 가져다 쓴다.)

import type { SeoulSourceKind } from './seoul-data-sources';
import {
  SIGUN_PARK_SCORES,
  EMD_COUNT,
  PARK_FEATURE_COUNT,
  PARK_SCORE_CRTR_YMD,
} from './gyeonggi-park-data';

export interface GyeonggiDataSource {
  id: string;
  layer: string;
  kind: SeoulSourceKind;
  provider: string;
  providerShort: string;
  dataset: string;
  note: string;
  url?: string;
}

const CRTR = `${PARK_SCORE_CRTR_YMD.slice(0, 4)}-${PARK_SCORE_CRTR_YMD.slice(4, 6)}-${PARK_SCORE_CRTR_YMD.slice(6, 8)}`;

export const GYEONGGI_DATA_SOURCES: GyeonggiDataSource[] = [
  {
    id: 'access-contour',
    layer: '공원 접근성 등고선',
    kind: 'analysis',
    provider: 'EarthPaper 분석 · 경기기후플랫폼 데이터 기반',
    providerShort: 'EarthPaper 산출',
    dataset: `공원 ${PARK_FEATURE_COUNT.toLocaleString()}개 폴리곤 × 읍면동 평가점수 → 격자 합산 → 등고선`,
    note: `공원마다 유형·면적 기반 서비스 반경(도시공원법 유치거리 준용)에 소속 읍면동의 공원 서비스 종합평가 점수 가중(×0.6~1.4)을 곱하고, 거리감쇠 영향을 약 500m 격자에 합산해 등고선으로 만들었다. 평가가 좋은 지역의 공원일수록 넓은 범위에 영향을 준다. EarthPaper 자체 모델이며 공식 평가 결과가 아니다.`,
  },
  {
    id: 'emd-score',
    layer: '읍면동 공원 서비스 평가',
    kind: 'stat',
    provider: '경기도 · 경기기후플랫폼',
    providerShort: '경기기후플랫폼',
    dataset: `도시공원 평가 spggcee:emd_park_scr · 읍면동 ${EMD_COUNT}개`,
    note: `공원 서비스 종합평가 점수(0~100)·순위·1인당 공원녹지면적·수혜인구율. 기준일 ${CRTR} 고정 통계라 실시간 갱신은 없다. 경계 폴리곤은 표시용으로 단순화했다.`,
    url: 'https://climate.gg.go.kr/ols/api',
  },
  {
    id: 'sigun-score',
    layer: '시군 평가 순위',
    kind: 'stat',
    provider: '경기도 · 경기기후플랫폼',
    providerShort: '경기기후플랫폼',
    dataset: `도시공원 평가 spggcee:sigun_park_scr · 시군 ${SIGUN_PARK_SCORES.length}개`,
    note: `시군 단위 공원 서비스 종합평가. 기준일 ${CRTR}. 사이드바 순위표와 시군 경계 스타일에 쓴다.`,
    url: 'https://climate.gg.go.kr/ols/api',
  },
  {
    id: 'park-wms',
    layer: '공원 현황 (폴리곤)',
    kind: 'live',
    provider: '경기도 · 경기기후플랫폼',
    providerShort: '경기기후플랫폼',
    dataset: '그린인프라 공원 현황도 spggcee:park · WMS 래스터',
    note: '공원 비오톱 폴리곤 35,000+개. 개수가 많아 GeoJSON 이 아니라 WMS 타일로 그리고, 클릭하면 해당 지점만 WFS 로 조회한다. 개별 공원에는 평가 등급이 없다 — 평가는 읍면동/시군 단위다.',
    url: 'https://climate.gg.go.kr/ols/api',
  },
  {
    id: 'boundary',
    layer: '경기도 시군 경계 · 외곽 마스크',
    kind: 'boundary',
    provider: '경기도 · 경기기후플랫폼 (시군 평가 레이어 지오메트리)',
    providerShort: '경기기후플랫폼',
    dataset: 'spggcee:sigun_park_scr 경계를 Douglas-Peucker 단순화',
    note: '토글 없이 항상 표시된다. 도 외곽을 어둡게 덮는 마스크와 접근성 격자 클리핑도 이 경계로 만들었다. 단순화본이라 실제 행정 경계와 미세한 차이가 있다.',
  },
  {
    id: 'basemap',
    layer: '배경 지도',
    kind: 'basemap',
    provider: 'Mapbox · OpenStreetMap contributors',
    providerShort: 'OpenStreetMap',
    dataset: 'Mapbox Streets 기반 스타일 (위성 / 다크 / 야간)',
    note: '© Mapbox © OpenStreetMap contributors.',
    url: 'https://www.mapbox.com/about/maps/',
  },
];

/** 지도 하단 한 줄 크레딧용 기관 목록. 등장 순서를 지키면서 중복만 뺀다. */
export const GYEONGGI_SOURCE_PROVIDERS: string[] = [
  ...new Set(GYEONGGI_DATA_SOURCES.map((s) => s.providerShort)),
];
