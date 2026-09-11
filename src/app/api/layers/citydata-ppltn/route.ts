import { NextResponse } from 'next/server';
import { SEOUL_CITYDATA_AREAS } from '@/lib/seoul-citydata-areas';

// 서울시 주요 장소 실시간 인구 현황 / 혼잡도.
// 서울 열린데이터광장 실시간 도시데이터 citydata_ppltn — 장소 119곳, 5분 주기.
//
// 자치구 단위(RealtimeCityAir·IotVdata017)와 달리 이쪽은 **장소 단위**다.
// 광화문·여의도·홍대처럼 실제 생활권 지점에 값이 떨어져서 자치구 중심 근사가 필요 없다.
//
// 좌표는 이 API가 주지 않는다. scripts/fetch-citydata-areas.js 가 전체 citydata
// 응답에서 유도해 번들에 구워둔 SEOUL_CITYDATA_AREAS 를 조인해서 쓴다.
// 좌표가 들어있는 전체 API 는 장소당 155KB 라 런타임에 119곳을 매번 받을 수 없다.
// 이 경량 API 는 장소당 2KB 라 119곳 전체가 약 230KB · 1.5초에 들어온다.

const ENDPOINT = 'http://openapi.seoul.go.kr:8088';

// 동시 요청 수. 열린데이터광장이 순간 과다요청에 429 를 주는 걸 피한다.
const CONCURRENCY = 8;

// 원본이 5분 주기로 갱신된다. 그보다 짧게 잡으면 같은 값을 받으면서
// 일일 트래픽만 태운다.
const REVALIDATE_SEC = 300;

// 혼잡도 4단계. 원본이 한글 문자열로 주고 순서 정보가 없어서 순위를 매긴다.
const CONGEST_RANK: Record<string, number> = {
  여유: 0,
  보통: 1,
  '약간 붐빔': 2,
  붐빔: 3,
};

function num(v: string | undefined): number | null {
  if (!v) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

interface PpltnRow {
  AREA_NM?: string;
  AREA_CD?: string;
  AREA_CONGEST_LVL?: string;
  AREA_CONGEST_MSG?: string;
  AREA_PPLTN_MIN?: string;
  AREA_PPLTN_MAX?: string;
  NON_RESNT_PPLTN_RATE?: string;
  RESNT_PPLTN_RATE?: string;
  PPLTN_TIME?: string;
  REPLACE_YN?: string;
}

type FetchOutcome =
  | { ok: true; row: PpltnRow }
  | { ok: false; quota: boolean };

async function fetchArea(key: string, code: string): Promise<FetchOutcome> {
  try {
    const res = await fetch(`${ENDPOINT}/${key}/json/citydata_ppltn/1/5/${code}`, {
      next: { revalidate: REVALIDATE_SEC },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return { ok: false, quota: false };

    const text = await res.text();

    // 일일 트래픽 초과는 ERROR-337 로 온다. 네트워크 실패와 구분해서
    // 배지를 '한도 초과'로 정확히 표시하기 위해 따로 잡는다.
    if (text.includes('ERROR-337')) return { ok: false, quota: true };

    const parsed = JSON.parse(text) as Record<string, unknown>;
    const rows = parsed['SeoulRtd.citydata_ppltn'];
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, quota: false };

    return { ok: true, row: rows[0] as PpltnRow };
  } catch {
    return { ok: false, quota: false };
  }
}

function emptyResponse(source: string): NextResponse {
  return NextResponse.json(
    { type: 'FeatureCollection', features: [] } satisfies GeoJSON.FeatureCollection,
    { headers: { 'X-Data-Source': source, 'X-Station-Count': '0' } },
  );
}

export async function GET() {
  const key = process.env.SEOUL_OPEN_DATA_KEY;
  if (!key) return emptyResponse('mock');

  const features: GeoJSON.Feature[] = [];
  let quotaHit = false;

  for (let i = 0; i < SEOUL_CITYDATA_AREAS.length; i += CONCURRENCY) {
    const batch = SEOUL_CITYDATA_AREAS.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map((a) => fetchArea(key, a.code)));

    results.forEach((result, idx) => {
      if (!result.ok) {
        if (result.quota) quotaHit = true;
        return;
      }

      const area = batch[idx];
      const row = result.row;
      const level = (row.AREA_CONGEST_LVL ?? '').trim();
      const rank = CONGEST_RANK[level];
      // 4단계 밖의 값이 오면 색·크기 매핑이 없으므로 버린다.
      if (rank === undefined) return;

      const min = num(row.AREA_PPLTN_MIN);
      const max = num(row.AREA_PPLTN_MAX);
      if (min === null || max === null) return;

      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [area.lng, area.lat] },
        properties: {
          code: area.code,
          // 원본 장소명을 그대로 쓴다. 번들 이름과 다르면 원본이 정답이다.
          name: row.AREA_NM ?? area.name,
          level,
          rank,
          pplMin: min,
          pplMax: max,
          // 구간의 중앙값. 원본이 범위로만 주기 때문에 크기 매핑용 대표값이 필요하다.
          ppl: Math.round((min + max) / 2),
          message: row.AREA_CONGEST_MSG ?? '',
          nonResidentRate: num(row.NON_RESNT_PPLTN_RATE),
          residentRate: num(row.RESNT_PPLTN_RATE),
          dataTime: row.PPLTN_TIME ?? '',
          // 원본이 실측을 대체값으로 채운 경우 'Y'. 화면에 그대로 알린다.
          replaced: (row.REPLACE_YN ?? 'N').trim() === 'Y',
        },
      });
    });
  }

  if (features.length === 0) return emptyResponse(quotaHit ? 'mock-quota' : 'mock-fallback');

  return NextResponse.json(
    { type: 'FeatureCollection', features } satisfies GeoJSON.FeatureCollection,
    {
      headers: {
        'X-Data-Source': 'seoul-opendata',
        'X-Station-Count': String(features.length),
        // 일부만 실패한 경우를 화면에서 알 수 있게 남긴다.
        'X-Area-Total': String(SEOUL_CITYDATA_AREAS.length),
      },
    },
  );
}
