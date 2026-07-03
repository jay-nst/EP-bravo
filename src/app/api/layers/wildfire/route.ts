import { NextResponse } from 'next/server';
import { MOCK_WILDFIRE_REPORTS, wildfireToGeoJSON } from '@/lib/mock-public-data';

export async function GET() {
  const geojson = wildfireToGeoJSON(MOCK_WILDFIRE_REPORTS);
  return NextResponse.json(geojson, {
    headers: { 'X-Data-Source': 'mock' },
  });
}
