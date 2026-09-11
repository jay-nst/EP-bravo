import { describe, it, expect } from 'vitest';
import {
  MIN_PARK_AREA_M2,
  baseRadiusM,
  scoreWeight,
  serviceRadiusM,
  intensity,
  influenceAt,
} from './park-accessibility';

describe('baseRadiusM', () => {
  it('법정 유치거리가 있는 유형은 고정 반경을 쓴다', () => {
    expect(baseRadiusM({ sclsfNm: '어린이공원', areaM2: 1500 })).toBe(250);
    expect(baseRadiusM({ sclsfNm: '소공원', areaM2: 800 })).toBe(200);
    expect(baseRadiusM({ sclsfNm: '휴게시설', areaM2: 300 })).toBe(150);
    expect(baseRadiusM({ sclsfNm: '식물원 및 수목원', areaM2: 50_000 })).toBe(1000);
  });

  it('근린 및 주제공원은 면적으로 생활권/도보권/광역을 가른다', () => {
    const p = (areaM2: number) => baseRadiusM({ sclsfNm: '근린 및 주제공원', areaM2 });
    expect(p(10_000)).toBe(500); // 1ha — 근린생활권
    expect(p(50_000)).toBe(1000); // 5ha — 도보권
    expect(p(500_000)).toBe(1500); // 50ha
    expect(p(2_000_000)).toBe(2500); // 200ha — 광역
  });

  it('고정 유형이라도 면적이 반경을 바꾸지 않는다', () => {
    expect(baseRadiusM({ sclsfNm: '어린이공원', areaM2: 100_000 })).toBe(250);
  });
});

describe('scoreWeight', () => {
  it('점수 0 → 0.6배, 50 → 1.0배, 100 → 1.4배', () => {
    expect(scoreWeight(0)).toBeCloseTo(0.6);
    expect(scoreWeight(50)).toBeCloseTo(1.0);
    expect(scoreWeight(100)).toBeCloseTo(1.4);
  });

  it('범위 밖 점수는 0~100으로 잘라낸다', () => {
    expect(scoreWeight(-10)).toBeCloseTo(0.6);
    expect(scoreWeight(250)).toBeCloseTo(1.4);
  });

  it('점수가 높을수록 반경이 넓어진다 (사용자 컨셉의 핵심)', () => {
    const park = { sclsfNm: '어린이공원', areaM2: 1500 };
    expect(serviceRadiusM(park, 80)).toBeGreaterThan(serviceRadiusM(park, 20));
  });
});

describe('intensity', () => {
  it('1ha 공원이 기준 강도 1.0', () => {
    expect(intensity(10_000)).toBeCloseTo(1.0);
  });

  it('상한 3.0, 하한 0.2 로 자른다', () => {
    expect(intensity(100_000_000)).toBe(3);
    expect(intensity(MIN_PARK_AREA_M2)).toBe(0.2);
  });

  it('면적에 단조 증가하되 제곱근으로 눌린다', () => {
    expect(intensity(40_000)).toBeCloseTo(2.0); // 4ha → 2배 (면적 4배가 강도 2배)
  });
});

describe('influenceAt', () => {
  it('중심에서 강도 그대로, 반경 밖에서 0', () => {
    expect(influenceAt(0, 500, 1.5)).toBeCloseTo(1.5);
    expect(influenceAt(500, 500, 1.5)).toBe(0);
    expect(influenceAt(900, 500, 1.5)).toBe(0);
  });

  it('거리에 단조 감소한다', () => {
    const a = influenceAt(100, 500, 1);
    const b = influenceAt(300, 500, 1);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeGreaterThan(0);
  });

  it('반경이 0 이하이면 항상 0 (방어)', () => {
    expect(influenceAt(0, 0, 1)).toBe(0);
  });
});
