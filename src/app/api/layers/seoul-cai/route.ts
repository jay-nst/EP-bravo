import { NextResponse } from 'next/server';
import { SEOUL_DISTRICTS } from '@/lib/seoul-climate-data';

// 서울시 자치구별 실시간 통합대기환경지수 (CAI).
// 서울 열린데이터광장 RealtimeCityAir — 25개 자치구, 1시간 주기.
//
// 에어코리아 측정소 레이어와 다른 데이터다. 이쪽은 서울시가 직접 산출해
// 시민에게 공개하는 통합지수(CAI)이고, 자치구 단위로 떨어진다.

const ENDPOINT = 'http://openapi.seoul.go.kr:8088';

const DISTRICT_COORD = new Map(
  SEOUL_DISTRICTS.map((d) => [d.name, { lat: d.lat, lng: d.lng }]),
);

// CAI 등급 (좋음 / 보통 / 나쁨 / 매우나쁨)
const GRADE_ORDER = ['좋음', '보통', '나쁨', '매우나쁨'] as const;
type CaiGrade = (typeof GRADE_ORDER)[number];

function normalizeGrade(v: string): CaiGrade {
  const g = v.replace(/\s/g, '');
  return (GRADE_ORDER as readonly string[]).includes(g) ? (g as CaiGrade) : '보통';
}

function num(v: string | undefined): number | null {
  if (!v) return null;
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

// 202608051200 → 2026-08-05 12:00
function formatStamp(v: string | undefined): string {
  if (!v || v.length < 12) return '';
  return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)} ${v.slice(8, 10)}:${v.slice(10, 12)}`;
}

export async function GET() {
  const key = process.env.SEOUL_OPEN_DATA_KEY;
  if (!key) {
    return NextResponse.json(
      { type: 'FeatureCollection', features: [] } satisfies GeoJSON.FeatureCollection,
      { headers: { 'X-Data-Source': 'mock', 'X-Station-Count': '0' } },
    );
  }

  try {
    const res = await fetch(`${ENDPOINT}/${key}/xml/RealtimeCityAir/1/25/`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`seoul open data ${res.status}`);

    const xml = await res.text();
    if (!xml.includes('INFO-000')) throw new Error('non-success result code');

    const features: GeoJSON.Feature[] = [];

    for (const row of parseRows(xml)) {
      const name = row.MSRSTN_NM;
      const coord = name ? DISTRICT_COORD.get(name) : undefined;
      const cai = num(row.CAI_IDX);
      if (!coord || cai === null) continue;

      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [coord.lng, coord.lat] },
        properties: {
          name,
          region: row.SAREA_NM ?? '',
          cai,
          grade: normalizeGrade(row.CAI_GRD ?? ''),
          pm10: num(row.PM),
          pm25: num(row.FPM),
          o3: num(row.OZON),
          no2: num(row.NTDX),
          // 지수를 좌우한 주 오염물질
          dominant: row.CRST_SBSTN ?? '',
          dataTime: formatStamp(row.MSRMT_DT),
        },
      });
    }

    if (features.length === 0) throw new Error('no rows matched districts');

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
    return NextResponse.json(
      { type: 'FeatureCollection', features: [] } satisfies GeoJSON.FeatureCollection,
      { headers: { 'X-Data-Source': 'mock-fallback', 'X-Station-Count': '0' } },
    );
  }
}
