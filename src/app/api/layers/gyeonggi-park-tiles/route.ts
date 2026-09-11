import type { NextRequest } from 'next/server';

// 경기기후플랫폼 WMS GetMap 프록시 — 공원 현황 폴리곤 래스터 타일.
//
// Mapbox raster 소스의 타일 템플릿(`?bbox={bbox-epsg-3857}`)이 이 라우트를
// 부른다. apiKey 를 서버에만 두려고 프록시한다 (브라우저에 키가 내려가지 않는다).
//
// bbox 축 순서 주의: 플랫폼 문서는 EPSG:3857 을 y,x 예외로 표기하지만
// 공식 GetMap 예제와 실측 모두 x,y (xmin,ymin,xmax,ymax) 로 동작한다.
// 예제를 따른다 (2026-09-11 실측 확인).

const WMS = 'https://climate.gg.go.kr/ols/api/geoserver/wms';
const LAYER = 'spggcee:park';

// 3857 웹메르카토르 좌표 한계. 이 밖이면 잘못된 요청이다.
const MERCATOR_MAX = 20_037_508.35;

// 키가 없거나 상류가 죽었을 때 내려줄 1×1 투명 PNG.
const BLANK_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

function blank(source: string): Response {
  return new Response(new Uint8Array(BLANK_PNG), {
    headers: {
      'Content-Type': 'image/png',
      'X-Data-Source': source,
      'Cache-Control': 'public, max-age=60',
    },
  });
}

export async function GET(request: NextRequest) {
  const bboxRaw = request.nextUrl.searchParams.get('bbox') ?? '';
  const bbox = bboxRaw.split(',').map(Number);
  if (bbox.length !== 4 || bbox.some((v) => !Number.isFinite(v) || Math.abs(v) > MERCATOR_MAX)) {
    return blank('invalid-bbox');
  }

  const key = process.env.GYEONGGI_CLIMATE_API_KEY;
  if (!key) return blank('mock');

  const params = new URLSearchParams({
    apiKey: key,
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetMap',
    FORMAT: 'image/png',
    TRANSPARENT: 'TRUE',
    STYLES: '',
    LAYERS: LAYER,
    CRS: 'EPSG:3857',
    WIDTH: '512',
    HEIGHT: '512',
    BBOX: bbox.join(','),
  });

  try {
    const res = await fetch(`${WMS}?${params}`, {
      // 공원 현황은 기준일 고정 데이터라 하루 캐시로 충분하다.
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(15000),
    });
    const type = res.headers.get('content-type') ?? '';
    // 오류 시 GeoServer 는 200 + text/xml 을 줄 수 있다. 상태만 믿지 않는다.
    if (!res.ok || !type.includes('image')) return blank('mock-fallback');

    const buf = await res.arrayBuffer();
    return new Response(buf, {
      headers: {
        'Content-Type': 'image/png',
        'X-Data-Source': 'gyeonggi-climate',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return blank('mock-fallback');
  }
}
