import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MOCK_TRAFFIC_LINKS, trafficToGeoJSON } from '@/lib/mock-public-data';
import type { TrafficLink } from '@/types/public-data';

interface ITSItem {
  roadName: string;
  speed: string;
  travelTime: string;
  linkId: string;
}

type LinkGeometry = Record<string, [number, number][]>;

let linkGeometryCache: LinkGeometry | null = null;

function loadLinkGeometry(): LinkGeometry | null {
  if (linkGeometryCache) return linkGeometryCache;
  try {
    const filePath = join(process.cwd(), 'src/data/seoul-links.json');
    const data = readFileSync(filePath, 'utf8');
    linkGeometryCache = JSON.parse(data) as LinkGeometry;
    return linkGeometryCache;
  } catch {
    return null;
  }
}

function congestionFromSpeed(speed: number): TrafficLink['congestion'] {
  if (speed >= 40) return 'smooth';
  if (speed >= 20) return 'slow';
  return 'congested';
}

export async function GET() {
  const apiKey = process.env.ITS_TRAFFIC_API_KEY;

  if (!apiKey) {
    const geojson = trafficToGeoJSON(MOCK_TRAFFIC_LINKS);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'mock' },
    });
  }

  const linkGeometry = loadLinkGeometry();

  try {
    const url = new URL('https://openapi.its.go.kr:9443/trafficInfo');
    url.searchParams.set('apiKey', apiKey);
    url.searchParams.set('type', 'all');
    url.searchParams.set('getType', 'json');
    url.searchParams.set('minX', '126.85');
    url.searchParams.set('maxX', '127.15');
    url.searchParams.set('minY', '37.42');
    url.searchParams.set('maxY', '37.65');

    const res = await fetch(url.toString(), { next: { revalidate: 180 } });
    if (!res.ok) throw new Error(`ITS API error: ${res.status}`);

    const data = await res.json();
    if (data.header?.resultCode !== 0) throw new Error(data.header?.resultMsg ?? 'ITS API error');

    const items: ITSItem[] = data.body?.items;
    if (!items || items.length === 0) throw new Error('No traffic items');

    if (!linkGeometry) throw new Error('No link geometry data');

    const features: GeoJSON.Feature[] = [];

    for (const item of items) {
      const coords = linkGeometry[item.linkId];
      if (!coords) continue;

      const speed = Number(item.speed) || 0;
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: coords },
        properties: {
          linkId: item.linkId,
          speed,
          congestion: congestionFromSpeed(speed),
          roadName: item.roadName || '',
          travelTime: Number(item.travelTime) || 0,
        },
      });
    }

    const geojson: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features };

    return NextResponse.json(geojson, {
      headers: {
        'X-Data-Source': 'its-realtime',
        'X-Traffic-Count': String(features.length),
        'X-ITS-Total': String(items.length),
      },
    });
  } catch {
    const geojson = trafficToGeoJSON(MOCK_TRAFFIC_LINKS);
    return NextResponse.json(geojson, {
      status: 200,
      headers: { 'X-Data-Source': 'mock-fallback' },
    });
  }
}
