// 폭염 × 인구밀집 교차 분석.
//
// 입력이 둘이다:
// - 실시간 혼잡도 (실측, /api/layers/citydata-ppltn)
// - 지표온도 격자 SEOUL_HEAT_GRID (추정 모델 — 실측 위성 LST 가 아니다)
//
// 따라서 결과도 '분석'이며 실측으로 표시하지 않는다. 화면 배지도 분석으로 둔다.
//
// 격자 셀 크기는 인자로 받는다. 페이지가 이미 스크립트와 맞춰둔 CELL_LNG/CELL_LAT 를
// 그대로 넘기게 해서, 같은 상수를 여기에 또 복제하지 않는다.
import { SEOUL_HEAT_GRID } from './seoul-climate-data';
import type { SeoulHeatCell } from './seoul-climate-data';

export interface HeatCrowdOptions {
  /** 격자 셀 경도 폭. gen-seoul-climate-data.js 의 STEP_LNG 과 같아야 한다. */
  cellLng: number;
  /** 격자 셀 위도 폭. STEP_LAT 과 같아야 한다. */
  cellLat: number;
  /** 폭염 판정 기준: 서울 평균 지표온도 대비 이상치(°C) 하한 */
  anomalyMin: number;
  /** 혼잡 판정 기준: AREA_CONGEST_LVL 순위(0 여유 ~ 3 붐빔) 하한 */
  rankMin: number;
}

// 격자 원점을 상수로 박지 않고 격자에서 최솟값을 뽑는다. 생성 스크립트가 원점을
// 옮겨도 따라가고, 셀 크기만 맞으면 키가 어긋나지 않는다.
const ORIGIN_LNG = Math.min(...SEOUL_HEAT_GRID.map((c) => c.lng));
const ORIGIN_LAT = Math.min(...SEOUL_HEAT_GRID.map((c) => c.lat));

function cellKey(lng: number, lat: number, cellLng: number, cellLat: number): string {
  const i = Math.round((lng - ORIGIN_LNG) / cellLng);
  const j = Math.round((lat - ORIGIN_LAT) / cellLat);
  return `${i}:${j}`;
}

// 셀 크기별 조회 테이블. 1374셀을 매 갱신마다 다시 색인하지 않게 캐시한다.
const lookupCache = new Map<string, Map<string, SeoulHeatCell>>();

function heatLookup(cellLng: number, cellLat: number): Map<string, SeoulHeatCell> {
  const cacheKey = `${cellLng}:${cellLat}`;
  const cached = lookupCache.get(cacheKey);
  if (cached) return cached;

  const table = new Map<string, SeoulHeatCell>(
    SEOUL_HEAT_GRID.map((c) => [cellKey(c.lng, c.lat, cellLng, cellLat), c]),
  );
  lookupCache.set(cacheKey, table);
  return table;
}

/** 장소 좌표가 속한 지표온도 격자 셀. 격자 밖이면 undefined. */
export function heatCellAt(
  lng: number,
  lat: number,
  cellLng: number,
  cellLat: number,
): SeoulHeatCell | undefined {
  return heatLookup(cellLng, cellLat).get(cellKey(lng, lat, cellLng, cellLat));
}

/**
 * 혼잡도 레이어에서 '폭염 격자에 속하면서 혼잡한' 장소만 남긴다.
 * 원본 속성에 해당 셀의 lst·anomaly 를 더해서 팝업이 두 근거를 함께 보여줄 수 있게 한다.
 */
export function buildHeatCrowdFC(
  congestion: GeoJSON.FeatureCollection,
  opts: HeatCrowdOptions,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  for (const f of congestion.features) {
    if (f.geometry.type !== 'Point') continue;

    const rank = Number(f.properties?.rank);
    if (!Number.isFinite(rank) || rank < opts.rankMin) continue;

    const [lng, lat] = f.geometry.coordinates;
    const cell = heatCellAt(lng, lat, opts.cellLng, opts.cellLat);
    if (!cell || cell.anomaly < opts.anomalyMin) continue;

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        ...f.properties,
        lst: cell.lst,
        anomaly: cell.anomaly,
      },
    });
  }

  return { type: 'FeatureCollection', features };
}
