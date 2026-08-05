import { NextResponse } from 'next/server';
import { SEOUL_DISTRICTS, SDOT_STATIONS } from '@/lib/seoul-climate-data';

// S-DoT (서울시 도시데이터 센서) 환경정보.
// 서울 열린데이터광장 IotVdata017 — 최신순 정렬이라 인덱스 1부터가 최근 데이터다.
//
// 원본에는 좌표가 없고 자치구(CGG)·행정동(DONG)만 있다. 없는 좌표를 지어내지 않고
// 자치구 단위로 실측 평균을 내어 자치구 중심에 얹는다. 센서 지점 수는 속성으로 남긴다.
//
// 응답이 비면 번들 데모 데이터로 폴백한다 (X-Data-Source: mock-fallback).

const ENDPOINT = 'http://openapi.seoul.go.kr:8088';
const FETCH_ROWS = 1000;

// CGG 값이 로마자로 온다.
const ROMAN_TO_KO: Record<string, string> = {
  'Jongno-gu': '종로구', 'Jung-gu': '중구', 'Yongsan-gu': '용산구',
  'Seongdong-gu': '성동구', 'Gwangjin-gu': '광진구', 'Dongdaemun-gu': '동대문구',
  'Jungnang-gu': '중랑구', 'Seongbuk-gu': '성북구', 'Gangbuk-gu': '강북구',
  'Dobong-gu': '도봉구', 'Nowon-gu': '노원구', 'Eunpyeong-gu': '은평구',
  'Seodaemun-gu': '서대문구', 'Mapo-gu': '마포구', 'Yangcheon-gu': '양천구',
  'Gangseo-gu': '강서구', 'Guro-gu': '구로구', 'Geumcheon-gu': '금천구',
  'Yeongdeungpo-gu': '영등포구', 'Dongjak-gu': '동작구', 'Gwanak-gu': '관악구',
  'Seocho-gu': '서초구', 'Gangnam-gu': '강남구', 'Songpa-gu': '송파구',
  'Gangdong-gu': '강동구',
};

const DISTRICT_COORD = new Map(
  SEOUL_DISTRICTS.map((d) => [d.name, { lat: d.lat, lng: d.lng }]),
);

// 고장 센서가 -40°C / 습도 100 같은 값을 그대로 올린다.
function validTemp(v: number): boolean {
  return v > -20 && v < 55;
}
function validHum(v: number): boolean {
  return v > 0 && v < 100;
}

function parseNum(v: string | undefined): number | null {
  if (!v) return null;
  // 원본에 "77." 처럼 잘린 값이 섞여 있다.
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function parseRows(xml: string): Record<string, string>[] {
  return [...xml.matchAll(/<row>([\s\S]*?)<\/row>/g)].map((m) => {
    const row: Record<string, string> = {};
    for (const f of m[1].matchAll(/<([A-Za-z0-9_]+)>([\s\S]*?)<\/\1>/g)) {
      row[f[1]] = f[2].trim();
    }
    return row;
  });
}

interface Agg {
  temps: number[];
  hums: number[];
  dongs: Set<string>;
  latest: string;
}

function demoFallback(): NextResponse {
  const features: GeoJSON.Feature[] = SDOT_STATIONS.map((s) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
    properties: {
      name: s.name,
      district: s.district,
      temp: s.temp,
      humidity: s.humidity,
      pm25: s.pm25,
      noise: s.noise,
      sensorCount: 1,
      dataTime: '',
    },
  }));

  return NextResponse.json(
    { type: 'FeatureCollection', features } satisfies GeoJSON.FeatureCollection,
    { headers: { 'X-Data-Source': 'mock-fallback', 'X-Station-Count': String(features.length) } },
  );
}

export async function GET() {
  const key = process.env.SEOUL_OPEN_DATA_KEY;
  if (!key) return demoFallback();

  try {
    const res = await fetch(`${ENDPOINT}/${key}/xml/IotVdata017/1/${FETCH_ROWS}/`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`seoul open data ${res.status}`);

    const xml = await res.text();
    if (!xml.includes('INFO-000')) throw new Error('non-success result code');

    const byDistrict = new Map<string, Agg>();

    for (const row of parseRows(xml)) {
      const ko = ROMAN_TO_KO[row.CGG ?? ''];
      if (!ko) continue; // Seoul_Grand_Park 등 자치구가 아닌 지점은 제외

      const t = parseNum(row.AVG_TP);
      const h = parseNum(row.AVG_HUM);
      if (t === null || !validTemp(t)) continue;

      let agg = byDistrict.get(ko);
      if (!agg) {
        agg = { temps: [], hums: [], dongs: new Set(), latest: '' };
        byDistrict.set(ko, agg);
      }
      agg.temps.push(t);
      if (h !== null && validHum(h)) agg.hums.push(h);
      if (row.DONG) agg.dongs.add(row.DONG);
      const stamp = row.MSRMT_HR ?? '';
      if (stamp > agg.latest) agg.latest = stamp;
    }

    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

    const features: GeoJSON.Feature[] = [];
    for (const [name, agg] of byDistrict) {
      const coord = DISTRICT_COORD.get(name);
      if (!coord || agg.temps.length === 0) continue;

      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [coord.lng, coord.lat] },
        properties: {
          name,
          district: name,
          temp: Math.round(mean(agg.temps) * 10) / 10,
          humidity: agg.hums.length ? Math.round(mean(agg.hums)) : null,
          sensorCount: agg.temps.length,
          dongCount: agg.dongs.size,
          // 2026-08-04_23:07:00 → 2026-08-04 23:07
          dataTime: agg.latest.replace('_', ' ').slice(0, 16),
        },
      });
    }

    if (features.length === 0) throw new Error('no districts aggregated');

    return NextResponse.json(
      { type: 'FeatureCollection', features } satisfies GeoJSON.FeatureCollection,
      {
        headers: {
          'X-Data-Source': 'seoul-opendata',
          'X-Station-Count': String(features.length),
        },
      },
    );
  } catch {
    return demoFallback();
  }
}
