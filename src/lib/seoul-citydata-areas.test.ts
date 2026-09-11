import { describe, it, expect } from 'vitest';
import {
  SEOUL_CITYDATA_AREAS,
  SEOUL_CITYDATA_AREA_COORD,
} from './seoul-citydata-areas';

// 이 표는 스크립트가 생성한다. 재생성했을 때 좌표가 깨지거나 장소가 사라지는 걸
// 잡기 위한 데이터 무결성 테스트다.
// 갱신: node --env-file=.env.local scripts/fetch-citydata-areas.js src/lib/seoul-citydata-areas.ts

// 페이지의 SEOUL_BBOX 와 같다.
const BBOX = { west: 126.73, south: 37.40, east: 127.22, north: 37.72 };

describe('SEOUL_CITYDATA_AREAS', () => {
  it('장소가 100곳 이상 있다', () => {
    // 원본은 121곳이고 교통 앵커가 없는 2곳(서울대공원·홍제폭포)이 빠진다.
    // 재생성 후 대량 유실을 잡기 위한 하한선이다.
    expect(SEOUL_CITYDATA_AREAS.length).toBeGreaterThanOrEqual(100);
  });

  it('장소 코드가 POI### 형식이고 중복이 없다', () => {
    for (const a of SEOUL_CITYDATA_AREAS) {
      expect(a.code).toMatch(/^POI\d{3}$/);
    }
    const codes = new Set(SEOUL_CITYDATA_AREAS.map((a) => a.code));
    expect(codes.size).toBe(SEOUL_CITYDATA_AREAS.length);
  });

  it('모든 장소명이 비어있지 않다', () => {
    const empty = SEOUL_CITYDATA_AREAS.filter((a) => !a.name.trim());
    expect(empty.map((a) => a.code)).toEqual([]);
  });

  it('모든 좌표가 서울 bbox 안에 있다', () => {
    const outside = SEOUL_CITYDATA_AREAS.filter(
      (a) =>
        a.lng < BBOX.west || a.lng > BBOX.east || a.lat < BBOX.south || a.lat > BBOX.north,
    );
    expect(outside.map((a) => `${a.name} ${a.lng},${a.lat}`)).toEqual([]);
  });

  it('좌표가 유한한 수다 (lng/lat 뒤바뀜 방지)', () => {
    for (const a of SEOUL_CITYDATA_AREAS) {
      expect(Number.isFinite(a.lng)).toBe(true);
      expect(Number.isFinite(a.lat)).toBe(true);
      // 서울은 경도가 위도보다 크다. 뒤바뀌면 여기서 걸린다.
      expect(a.lng).toBeGreaterThan(a.lat);
    }
  });

  it('모든 장소에 좌표 유도 근거가 남아있다', () => {
    for (const a of SEOUL_CITYDATA_AREAS) {
      expect(a.anchor).toMatch(/^[A-Z_]+:\d+(\+[A-Z_]+:\d+)*$/);
      expect(a.anchorCount).toBeGreaterThan(0);
    }
  });

  it('좌표 조회 Map 이 배열과 일치한다', () => {
    expect(SEOUL_CITYDATA_AREA_COORD.size).toBe(SEOUL_CITYDATA_AREAS.length);
    for (const a of SEOUL_CITYDATA_AREAS) {
      expect(SEOUL_CITYDATA_AREA_COORD.get(a.code)).toEqual({
        lng: a.lng,
        lat: a.lat,
        name: a.name,
      });
    }
  });

  it('대표 장소의 좌표가 실제 위치와 맞다', () => {
    // 유도 좌표가 엉뚱한 곳으로 가지 않았는지 고정 지점으로 확인한다.
    // 장소가 넓어 오차를 두되, 자치구를 넘어갈 만큼 틀리면 실패한다.
    const expected: [string, number, number][] = [
      ['광화문·덕수궁', 126.977, 37.567],
      ['여의도', 126.927, 37.524],
      ['홍대 관광특구', 126.923, 37.556],
      ['잠실 관광특구', 127.101, 37.513],
    ];

    for (const [name, lng, lat] of expected) {
      const area = SEOUL_CITYDATA_AREAS.find((a) => a.name === name);
      expect(area, `${name} 누락`).toBeDefined();
      expect(Math.abs(area!.lng - lng), `${name} 경도 ${area!.lng}`).toBeLessThan(0.015);
      expect(Math.abs(area!.lat - lat), `${name} 위도 ${area!.lat}`).toBeLessThan(0.015);
    }
  });
});
