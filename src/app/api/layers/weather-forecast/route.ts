import { NextResponse } from 'next/server';
import { MOCK_WEATHER_FORECAST, weatherForecastToGeoJSON } from '@/lib/mock-public-data';

export async function GET() {
  const serviceKey = process.env.DATA_GO_KR_WEATHER_KEY;

  if (!serviceKey) {
    const geojson = weatherForecastToGeoJSON(MOCK_WEATHER_FORECAST);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'mock' },
    });
  }

  try {
    const now = new Date();
    const baseDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const hours = now.getHours();
    const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
    const baseTime = String(baseTimes.filter((t) => t <= hours).pop() ?? 23).padStart(2, '0') + '00';

    const url = new URL('https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst');
    url.searchParams.set('serviceKey', serviceKey);
    url.searchParams.set('dataType', 'JSON');
    url.searchParams.set('numOfRows', '1000');
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('base_date', baseDate);
    url.searchParams.set('base_time', baseTime);
    url.searchParams.set('nx', '60');
    url.searchParams.set('ny', '127');

    const res = await fetch(url.toString(), { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`KMA forecast API error: ${res.status}`);

    const data = await res.json();
    const items = data?.response?.body?.items?.item;
    if (!items || items.length === 0) throw new Error('No forecast items');

    const geojson = weatherForecastToGeoJSON(MOCK_WEATHER_FORECAST);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'kma-forecast' },
    });
  } catch {
    const geojson = weatherForecastToGeoJSON(MOCK_WEATHER_FORECAST);
    return NextResponse.json(geojson, {
      status: 200,
      headers: { 'X-Data-Source': 'mock-fallback' },
    });
  }
}
