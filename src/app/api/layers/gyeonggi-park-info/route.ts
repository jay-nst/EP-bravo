import { NextResponse, type NextRequest } from 'next/server';

// 경기기후플랫폼 WFS 소범위 조회 — 지도에서 공원을 클릭했을 때의 식별용.
//
// 공원 폴리곤(spggcee:park)은 35,000+개라 번들·GeoJSON 소스로 내리지 않고
// WMS 래스터로 그린다. 클릭 좌표 주변 ~60m 상자를 WFS bbox 로 조회해
// 해당 지점의 공원 속성만 돌려준다.
//
// bbox 형식 주의: 문서 표기와 달리 실측으로는
// `xmin,ymin,xmax,ymax,EPSG:4326` (x,y 순서 + CRS 접미사 필수) 만 동작한다
// (2026-09-11 확인 — 접미사 없이는 0건).

const WFS = 'https://climate.gg.go.kr/ols/api/geoserver/wfs';
const LAYER = 'spggcee:park';

// 클릭 허용 반경 (도 단위, 약 55m)
const CLICK_BOX_DEG = 0.0005;

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

function empty(source: string): NextResponse {
  return NextResponse.json(EMPTY, { headers: { 'X-Data-Source': source } });
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const lng = Number(sp.get('lng'));
  const lat = Number(sp.get('lat'));
  if (!Number.isFinite(lng) || !Number.isFinite(lat) || Math.abs(lng) > 180 || Math.abs(lat) > 90) {
    return empty('invalid-coords');
  }

  const key = process.env.GYEONGGI_CLIMATE_API_KEY;
  if (!key) return empty('mock');

  const params = new URLSearchParams({
    apiKey: key,
    service: 'WFS',
    version: '1.1.0',
    request: 'GetFeature',
    typeName: LAYER,
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    maxfeatures: '5',
    bbox: [
      lng - CLICK_BOX_DEG,
      lat - CLICK_BOX_DEG,
      lng + CLICK_BOX_DEG,
      lat + CLICK_BOX_DEG,
      'EPSG:4326',
    ].join(','),
  });

  try {
    const res = await fetch(`${WFS}?${params}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(15000),
    });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !type.includes('json')) throw new Error(`gyeonggi wfs ${res.status}`);

    const raw = (await res.json()) as GeoJSON.FeatureCollection;

    // 폴리곤 지오메트리는 버리고 클릭 지점 + 필요한 속성만 내린다.
    const features: GeoJSON.Feature[] = raw.features.map((f) => {
      const p = (f.properties ?? {}) as Record<string, unknown>;
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {
          uid: p.uid ?? '',
          sggNm: String(p.sgg_nm ?? '').trim(),
          mclsfNm: String(p.mclsf_nm ?? '').trim(),
          sclsfNm: String(p.sclsf_nm ?? '').trim(),
          // biotop_area 단위는 m² (실측 지오메트리 면적과 대조 확인)
          areaM2: Number(p.biotop_area) || 0,
        },
      };
    });

    return NextResponse.json(
      { type: 'FeatureCollection', features } satisfies GeoJSON.FeatureCollection,
      {
        headers: {
          'X-Data-Source': 'gyeonggi-climate',
          'X-Station-Count': String(features.length),
        },
      },
    );
  } catch {
    return empty('mock-fallback');
  }
}
