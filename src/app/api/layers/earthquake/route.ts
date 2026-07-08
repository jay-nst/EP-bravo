import { NextResponse } from 'next/server';
import { MOCK_EARTHQUAKE_EVENTS, earthquakeToGeoJSON } from '@/lib/mock-public-data';
import type { EarthquakeEvent } from '@/types/public-data';

interface KmaEqkItem {
  tmSeq: string;
  tmEqk: string;
  lat: string;
  lon: string;
  dep: string;
  mt: string;
  loc: string;
  inT: string;
  img: string;
  rem: string;
}

function getDateRange(): { fromDate: string; toDate: string } {
  const now = new Date();
  const to = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  const fmt = (d: Date) => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  };

  return { fromDate: fmt(from), toDate: fmt(to) };
}

function parseEqkTime(tmEqk: string): string {
  if (tmEqk.length >= 14) {
    return `${tmEqk.slice(0, 4)}-${tmEqk.slice(4, 6)}-${tmEqk.slice(6, 8)}T${tmEqk.slice(8, 10)}:${tmEqk.slice(10, 12)}:${tmEqk.slice(12, 14)}`;
  }
  return tmEqk;
}

function parseIntensity(inT: string): number {
  const num = parseFloat(inT);
  return isNaN(num) ? 0 : num;
}

function kmaItemToEarthquake(item: KmaEqkItem, index: number): EarthquakeEvent | null {
  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon);
  const magnitude = parseFloat(item.mt);
  const depth = parseFloat(item.dep);

  if (isNaN(lat) || isNaN(lng) || isNaN(magnitude)) return null;

  return {
    id: `eq-${item.tmSeq || index}`,
    lat,
    lng,
    magnitude,
    depth: isNaN(depth) ? 0 : depth,
    location: item.loc || '',
    occurredAt: parseEqkTime(item.tmEqk),
    maxIntensity: parseIntensity(item.inT),
  };
}

export async function GET() {
  const serviceKey = process.env.DATA_GO_KR_EARTHQUAKE_KEY;

  if (!serviceKey) {
    const geojson = earthquakeToGeoJSON(MOCK_EARTHQUAKE_EVENTS);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'mock' },
    });
  }

  try {
    const { fromDate, toDate } = getDateRange();

    const qs = [
      `serviceKey=${serviceKey}`,
      `dataType=JSON`,
      `numOfRows=50`,
      `pageNo=1`,
      `fromTmFc=${fromDate}`,
      `toTmFc=${toDate}`,
    ].join('&');
    const url = `https://apis.data.go.kr/1360000/EqkInfoService/getEqkMsg?${qs}`;

    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`KMA earthquake API error: ${res.status}`);

    const data = await res.json();
    const items: KmaEqkItem[] = data?.response?.body?.items?.item;

    if (!items || items.length === 0) {
      const geojson = earthquakeToGeoJSON([]);
      return NextResponse.json(geojson, {
        headers: {
          'X-Data-Source': 'kma-earthquake',
          'X-Event-Count': '0',
          'X-Note': 'no-recent-events',
        },
      });
    }

    const events = items
      .map((item, i) => kmaItemToEarthquake(item, i))
      .filter((e): e is EarthquakeEvent => e !== null);

    const geojson = earthquakeToGeoJSON(events);
    return NextResponse.json(geojson, {
      headers: {
        'X-Data-Source': 'kma-earthquake',
        'X-Event-Count': String(events.length),
      },
    });
  } catch {
    const geojson = earthquakeToGeoJSON(MOCK_EARTHQUAKE_EVENTS);
    return NextResponse.json(geojson, {
      status: 200,
      headers: { 'X-Data-Source': 'mock-fallback' },
    });
  }
}
