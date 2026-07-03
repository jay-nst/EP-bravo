import { NextResponse } from 'next/server';
import { MOCK_AIR_QUALITY, airQualityToGeoJSON } from '@/lib/mock-public-data';
import type { AirQualityReading } from '@/types/public-data';

interface StationCoord {
  lat: number;
  lng: number;
}

let stationCache: Map<string, StationCoord> | null = null;
let stationCacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000;

async function getStationCoords(serviceKey: string): Promise<Map<string, StationCoord>> {
  if (stationCache && Date.now() - stationCacheTime < CACHE_TTL) {
    return stationCache;
  }

  const map = new Map<string, StationCoord>();
  const url = new URL('https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getMsrstnList');
  url.searchParams.set('serviceKey', serviceKey);
  url.searchParams.set('returnType', 'json');
  url.searchParams.set('numOfRows', '700');
  url.searchParams.set('pageNo', '1');

  const res = await fetch(url.toString());
  if (!res.ok) return map;

  const data = await res.json();
  const items = data?.response?.body?.items ?? [];

  for (const item of items) {
    if (item.stationName && item.dmX && item.dmY) {
      map.set(item.stationName, {
        lat: parseFloat(item.dmX),
        lng: parseFloat(item.dmY),
      });
    }
  }

  stationCache = map;
  stationCacheTime = Date.now();
  return map;
}

function gradeFromKhaiGrade(grade: string): AirQualityReading['grade'] {
  switch (grade) {
    case '1': return 'good';
    case '2': return 'moderate';
    case '3': return 'unhealthy';
    case '4': return 'very_unhealthy';
    default: return 'moderate';
  }
}

export async function GET() {
  const serviceKey = process.env.DATA_GO_KR_AIR_QUALITY_KEY;

  if (!serviceKey) {
    const geojson = airQualityToGeoJSON(MOCK_AIR_QUALITY);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'mock' },
    });
  }

  try {
    const [coords, realtimeRes] = await Promise.all([
      getStationCoords(serviceKey),
      fetch(
        (() => {
          const url = new URL('https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty');
          url.searchParams.set('serviceKey', serviceKey);
          url.searchParams.set('returnType', 'json');
          url.searchParams.set('numOfRows', '500');
          url.searchParams.set('pageNo', '1');
          url.searchParams.set('sidoName', '전국');
          url.searchParams.set('ver', '1.0');
          return url.toString();
        })(),
        { next: { revalidate: 600 } },
      ),
    ]);

    if (!realtimeRes.ok) throw new Error(`AirKorea API error: ${realtimeRes.status}`);

    const data = await realtimeRes.json();
    const items = data?.response?.body?.items ?? [];

    const readings: AirQualityReading[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const name = item.stationName;
      const coord = coords.get(name);
      if (!coord) continue;

      readings.push({
        id: `aq-${i}`,
        name: `${item.sidoName} ${name}`,
        lat: coord.lat,
        lng: coord.lng,
        pm25: item.pm25Value && item.pm25Value !== '-' ? parseFloat(item.pm25Value) : null,
        pm10: item.pm10Value && item.pm10Value !== '-' ? parseFloat(item.pm10Value) : null,
        o3: item.o3Value && item.o3Value !== '-' ? parseFloat(item.o3Value) : null,
        no2: item.no2Value && item.no2Value !== '-' ? parseFloat(item.no2Value) : null,
        co: item.coValue && item.coValue !== '-' ? parseFloat(item.coValue) : null,
        so2: item.so2Value && item.so2Value !== '-' ? parseFloat(item.so2Value) : null,
        grade: gradeFromKhaiGrade(item.khaiGrade),
        dataTime: item.dataTime,
      });
    }

    const geojson = airQualityToGeoJSON(readings);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'airkorea', 'X-Station-Count': String(readings.length) },
    });
  } catch {
    const geojson = airQualityToGeoJSON(MOCK_AIR_QUALITY);
    return NextResponse.json(geojson, {
      status: 200,
      headers: { 'X-Data-Source': 'mock-fallback' },
    });
  }
}
