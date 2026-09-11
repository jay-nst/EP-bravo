import { describe, it, expect } from 'vitest';
import { buildHeatCrowdFC, heatCellAt } from './seoul-heat-crowd';
import type { HeatCrowdOptions } from './seoul-heat-crowd';
import { SEOUL_HEAT_GRID } from './seoul-climate-data';
import { SEOUL_CITYDATA_AREAS } from './seoul-citydata-areas';

// 페이지가 넘기는 값과 같다 (gen-seoul-climate-data.js 의 STEP_LNG/STEP_LAT).
const OPTS: HeatCrowdOptions = {
  cellLng: 0.0075,
  cellLat: 0.006,
  anomalyMin: 2.5,
  rankMin: 2,
};

// 실제 격자에서 조건에 맞는/안 맞는 셀을 뽑아 픽스처로 쓴다.
// 상상한 좌표를 쓰면 격자 밖으로 나가 테스트가 무의미해진다.
const hotCell = SEOUL_HEAT_GRID.find((c) => c.anomaly >= 2.5);
const coolCell = SEOUL_HEAT_GRID.find((c) => c.anomaly < 2.5);

function feature(
  lng: number,
  lat: number,
  rank: number,
  extra: Record<string, unknown> = {},
): GeoJSON.Feature {
  return {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: { rank, name: 'test', ...extra },
  };
}

function fc(features: GeoJSON.Feature[]): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features };
}

describe('heatCellAt', () => {
  it('격자 셀 중심 좌표로 그 셀을 찾는다', () => {
    expect(hotCell).toBeDefined();
    const found = heatCellAt(hotCell!.lng, hotCell!.lat, OPTS.cellLng, OPTS.cellLat);
    expect(found?.lst).toBe(hotCell!.lst);
    expect(found?.anomaly).toBe(hotCell!.anomaly);
  });

  it('셀 안쪽으로 살짝 벗어난 좌표도 같은 셀에 붙는다', () => {
    // 장소 중심 좌표는 셀 중심에 정확히 떨어지지 않는다. 셀 폭의 1/4 만큼
    // 밀어도 같은 셀이어야 한다 — 안 그러면 장소 대부분이 미매칭된다.
    const found = heatCellAt(
      hotCell!.lng + OPTS.cellLng * 0.25,
      hotCell!.lat - OPTS.cellLat * 0.25,
      OPTS.cellLng,
      OPTS.cellLat,
    );
    expect(found?.anomaly).toBe(hotCell!.anomaly);
  });

  it('서울 격자 밖은 undefined 다', () => {
    expect(heatCellAt(120, 30, OPTS.cellLng, OPTS.cellLat)).toBeUndefined();
  });

  it('실제 장소 119곳이 모두 격자 셀에 매칭된다', () => {
    const missed = SEOUL_CITYDATA_AREAS.filter(
      (a) => !heatCellAt(a.lng, a.lat, OPTS.cellLng, OPTS.cellLat),
    );
    expect(missed.map((a) => a.name)).toEqual([]);
  });
});

describe('buildHeatCrowdFC', () => {
  it('폭염 격자 + 혼잡 조건을 모두 만족하면 남긴다', () => {
    const out = buildHeatCrowdFC(fc([feature(hotCell!.lng, hotCell!.lat, 2)]), OPTS);
    expect(out.features).toHaveLength(1);
  });

  it('혼잡도가 기준 미만이면 제외한다', () => {
    const out = buildHeatCrowdFC(
      fc([feature(hotCell!.lng, hotCell!.lat, 0), feature(hotCell!.lng, hotCell!.lat, 1)]),
      OPTS,
    );
    expect(out.features).toHaveLength(0);
  });

  it('폭염 격자가 아니면 혼잡해도 제외한다', () => {
    expect(coolCell).toBeDefined();
    const out = buildHeatCrowdFC(fc([feature(coolCell!.lng, coolCell!.lat, 3)]), OPTS);
    expect(out.features).toHaveLength(0);
  });

  it('격자 밖 좌표는 제외한다', () => {
    const out = buildHeatCrowdFC(fc([feature(120, 30, 3)]), OPTS);
    expect(out.features).toHaveLength(0);
  });

  it('rank 가 없거나 숫자가 아니면 제외한다', () => {
    const noRank: GeoJSON.Feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [hotCell!.lng, hotCell!.lat] },
      properties: { name: 'no rank' },
    };
    const badRank = feature(hotCell!.lng, hotCell!.lat, Number.NaN);
    const out = buildHeatCrowdFC(fc([noRank, badRank]), OPTS);
    expect(out.features).toHaveLength(0);
  });

  it('Point 가 아닌 지오메트리는 건너뛴다', () => {
    const poly: GeoJSON.Feature = {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] },
      properties: { rank: 3 },
    };
    const out = buildHeatCrowdFC(fc([poly]), OPTS);
    expect(out.features).toHaveLength(0);
  });

  it('원본 속성을 유지하고 lst·anomaly 를 더한다', () => {
    const out = buildHeatCrowdFC(
      fc([feature(hotCell!.lng, hotCell!.lat, 3, { name: '광화문·덕수궁', ppl: 44000 })]),
      OPTS,
    );
    expect(out.features[0].properties).toMatchObject({
      name: '광화문·덕수궁',
      ppl: 44000,
      rank: 3,
      lst: hotCell!.lst,
      anomaly: hotCell!.anomaly,
    });
  });

  it('빈 입력은 빈 결과를 낸다', () => {
    expect(buildHeatCrowdFC(fc([]), OPTS).features).toHaveLength(0);
  });

  it('기준을 올리면 결과가 줄어든다 (단조성)', () => {
    const areas = SEOUL_CITYDATA_AREAS.map((a) => feature(a.lng, a.lat, 3));
    const loose = buildHeatCrowdFC(fc(areas), { ...OPTS, anomalyMin: 0 }).features.length;
    const tight = buildHeatCrowdFC(fc(areas), { ...OPTS, anomalyMin: 4 }).features.length;
    expect(tight).toBeLessThanOrEqual(loose);
  });
});
