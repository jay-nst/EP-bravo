import { NextResponse } from 'next/server';
import { MOCK_AWS_STATIONS, awsToGeoJSON } from '@/lib/mock-public-data';

export async function GET() {
  const serviceKey = process.env.DATA_GO_KR_AWS_KEY;

  if (!serviceKey) {
    const geojson = awsToGeoJSON(MOCK_AWS_STATIONS);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'mock' },
    });
  }

  try {
    const now = new Date();
    const tm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}00`;

    const url = new URL('https://apis.data.go.kr/1360000/AsosHourlyInfoService/getWthrDataList');
    url.searchParams.set('serviceKey', serviceKey);
    url.searchParams.set('dataType', 'JSON');
    url.searchParams.set('numOfRows', '100');
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('dataCd', 'ASOS');
    url.searchParams.set('dateCd', 'HR');
    url.searchParams.set('startDt', tm.slice(0, 8));
    url.searchParams.set('startHh', tm.slice(8, 10));
    url.searchParams.set('endDt', tm.slice(0, 8));
    url.searchParams.set('endHh', tm.slice(8, 10));

    const res = await fetch(url.toString(), { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`KMA AWS API error: ${res.status}`);

    const data = await res.json();
    const items = data?.response?.body?.items?.item ?? [];

    const stations = items
      .filter((item: Record<string, string>) => item.stnNm && item.ta)
      .map((item: Record<string, string>) => ({
        id: `aws-${item.stnId}`,
        name: item.stnNm,
        lat: parseFloat(item.lat || '0'),
        lng: parseFloat(item.lon || '0'),
        temp: item.ta ? parseFloat(item.ta) : null,
        humidity: item.hm ? parseFloat(item.hm) : null,
        windSpeed: item.ws ? parseFloat(item.ws) : null,
        windDirection: item.wd ? parseFloat(item.wd) : null,
        rainfall1h: item.rn ? parseFloat(item.rn) : null,
        pressure: item.pa ? parseFloat(item.pa) : null,
        observedAt: `${item.tm || tm}`,
      }));

    const geojson = awsToGeoJSON(stations);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'kma' },
    });
  } catch {
    const geojson = awsToGeoJSON(MOCK_AWS_STATIONS);
    return NextResponse.json(geojson, {
      status: 200,
      headers: { 'X-Data-Source': 'mock-fallback' },
    });
  }
}
