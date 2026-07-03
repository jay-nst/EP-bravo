import { NextResponse } from 'next/server';
import { MOCK_TRAFFIC_LINKS, trafficToGeoJSON } from '@/lib/mock-public-data';

export async function GET() {
  const geojson = trafficToGeoJSON(MOCK_TRAFFIC_LINKS);
  return NextResponse.json(geojson, {
    headers: { 'X-Data-Source': 'mock' },
  });
}
