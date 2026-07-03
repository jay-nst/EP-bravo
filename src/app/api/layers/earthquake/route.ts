import { NextResponse } from 'next/server';
import { MOCK_EARTHQUAKE_EVENTS, earthquakeToGeoJSON } from '@/lib/mock-public-data';

export async function GET() {
  const serviceKey = process.env.DATA_GO_KR_EARTHQUAKE_KEY;

  if (!serviceKey) {
    const geojson = earthquakeToGeoJSON(MOCK_EARTHQUAKE_EVENTS);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'mock' },
    });
  }

  try {
    const now = new Date();
    const fromDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate() - 7).padStart(2, '0')}`;
    const toDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    const url = new URL('https://apis.data.go.kr/1360000/EqkInfoService/getEqkMsg');
    url.searchParams.set('serviceKey', serviceKey);
    url.searchParams.set('dataType', 'JSON');
    url.searchParams.set('numOfRows', '50');
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('fromTmFc', fromDate);
    url.searchParams.set('toTmFc', toDate);

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`KMA earthquake API error: ${res.status}`);

    const data = await res.json();
    const items = data?.response?.body?.items?.item;
    if (!items || items.length === 0) throw new Error('No earthquake items');

    const geojson = earthquakeToGeoJSON(MOCK_EARTHQUAKE_EVENTS);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'kma-earthquake' },
    });
  } catch {
    const geojson = earthquakeToGeoJSON(MOCK_EARTHQUAKE_EVENTS);
    return NextResponse.json(geojson, {
      status: 200,
      headers: { 'X-Data-Source': 'mock-fallback' },
    });
  }
}
