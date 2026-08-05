import { NextResponse } from 'next/server';
import { SEOUL_AIR_STATIONS } from '@/lib/seoul-air-stations';

// 서울 도시대기측정망 실시간 대기질.
//
// 공용 /api/layers/air-quality 와 달리 측정소 좌표를 번들에서 읽는다.
// 에어코리아 측정소 목록 API(MsrstnInfoInqireSvc)가 간헐적으로 빈 응답을 주는데,
// 좌표가 없으면 측정값이 멀쩡해도 레이어 전체가 빈 화면이 된다.
// 좌표는 고정 메타데이터이므로 내장하고, 실시간 값만 API에서 받는다.

type Grade = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

function gradeFromPm25(pm25: number): Grade {
  if (pm25 <= 15) return 'good';
  if (pm25 <= 35) return 'moderate';
  if (pm25 <= 75) return 'unhealthy';
  if (pm25 <= 150) return 'very_unhealthy';
  return 'hazardous';
}

function num(v: unknown): number | null {
  if (typeof v !== 'string' || v === '-' || v === '') return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

interface Reading {
  pm25: number;
  pm10: number | null;
  o3: number | null;
  no2: number | null;
  dataTime: string;
}

function toGeoJSON(
  readings: Map<string, Reading>,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = [];

  for (const st of SEOUL_AIR_STATIONS) {
    const r = readings.get(st.name);
    if (!r) continue;

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [st.lng, st.lat] },
      properties: {
        name: st.name,
        district: st.district,
        pm25: r.pm25,
        pm10: r.pm10,
        o3: r.o3,
        no2: r.no2,
        grade: gradeFromPm25(r.pm25),
        dataTime: r.dataTime,
      },
    });
  }

  return { type: 'FeatureCollection', features };
}

export async function GET() {
  const serviceKey = process.env.DATA_GO_KR_AIR_QUALITY_KEY;

  if (serviceKey) {
    try {
      const url = new URL(
        'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty',
      );
      url.searchParams.set('serviceKey', serviceKey);
      url.searchParams.set('returnType', 'json');
      url.searchParams.set('numOfRows', '100');
      url.searchParams.set('pageNo', '1');
      url.searchParams.set('sidoName', '서울');
      url.searchParams.set('ver', '1.0');

      const res = await fetch(url.toString(), { next: { revalidate: 300 } });
      if (!res.ok) throw new Error(`AirKorea ${res.status}`);

      const data = await res.json();
      const items: unknown[] = data?.response?.body?.items ?? [];

      const readings = new Map<string, Reading>();
      for (const raw of items) {
        const item = raw as Record<string, unknown>;
        const name = typeof item.stationName === 'string' ? item.stationName : null;
        const pm25 = num(item.pm25Value);
        if (!name || pm25 === null) continue;

        readings.set(name, {
          pm25,
          pm10: num(item.pm10Value),
          o3: num(item.o3Value),
          no2: num(item.no2Value),
          dataTime: typeof item.dataTime === 'string' ? item.dataTime : '',
        });
      }

      const geojson = toGeoJSON(readings);
      if (geojson.features.length > 0) {
        return NextResponse.json(geojson, {
          headers: {
            'X-Data-Source': 'airkorea',
            'X-Station-Count': String(geojson.features.length),
          },
        });
      }
    } catch {
      // 아래 폴백으로 진행
    }
  }

  // 폴백: 실제 측정소 위치에 대표값을 얹어 형태만 유지한다.
  const fallback = new Map<string, Reading>();
  SEOUL_AIR_STATIONS.forEach((st, i) => {
    const pm25 = 12 + ((i * 7) % 23);
    fallback.set(st.name, {
      pm25,
      pm10: pm25 * 2 + 4,
      o3: 0.03,
      no2: 0.025,
      dataTime: '',
    });
  });

  const geojson = toGeoJSON(fallback);
  return NextResponse.json(geojson, {
    headers: {
      'X-Data-Source': 'mock-fallback',
      'X-Station-Count': String(geojson.features.length),
    },
  });
}
