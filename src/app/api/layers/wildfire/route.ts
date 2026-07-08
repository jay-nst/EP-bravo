import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { MOCK_WILDFIRE_REPORTS, wildfireToGeoJSON } from '@/lib/mock-public-data';
import type { WildfireReport } from '@/types/public-data';

const KOREA_BBOX = '124.5,33.0,131.0,39.0';

interface GK2ADetection {
  id: string;
  lat: number;
  lng: number;
  confidence: string;
  confidence_code: number;
  observedAt: string;
}

interface GK2AResult {
  source: string;
  observationTime: string;
  totalDetections: number;
  detections: GK2ADetection[];
  error?: string;
}

function gk2aToWildfire(d: GK2ADetection): WildfireReport {
  const confLabel =
    d.confidence === 'high'
      ? '고신뢰'
      : d.confidence === 'mid'
        ? '중신뢰'
        : d.confidence === 'industrial'
          ? '산업열원'
          : '저신뢰';

  return {
    id: d.id,
    name: `천리안 2A 열점 (${confLabel})`,
    lat: d.lat,
    lng: d.lng,
    status: d.confidence === 'high' || d.confidence === 'mid' ? 'active' : 'contained',
    affectedArea: 4,
    startedAt: d.observedAt,
    description: `GK-2A AMI 산불탐지 | ${confLabel} | 2km 해상도 | 10분 주기 관측`,
  };
}

function runGK2AParser(authKey: string): Promise<GK2AResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'parse-gk2a-ff.py');
    execFile('python', [scriptPath, authKey], { timeout: 25000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(new Error(`Invalid JSON: ${stdout.slice(0, 200)}`));
      }
    });
  });
}

interface FirmsRecord {
  latitude: string;
  longitude: string;
  bright_ti4: string;
  acq_date: string;
  acq_time: string;
  satellite: string;
  confidence: string;
  frp: string;
  daynight: string;
}

function parseFirmsCsv(csv: string): FirmsRecord[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const record: Record<string, string> = {};
    header.forEach((key, i) => {
      record[key] = values[i]?.trim() ?? '';
    });
    return record as unknown as FirmsRecord;
  });
}

function firmsToWildfire(r: FirmsRecord, i: number): WildfireReport | null {
  const lat = parseFloat(r.latitude);
  const lng = parseFloat(r.longitude);
  if (isNaN(lat) || isNaN(lng)) return null;

  const frp = parseFloat(r.frp) || 0;
  const conf = r.confidence?.toLowerCase() ?? '';
  const time = r.acq_time?.padStart(4, '0') ?? '0000';
  const dn = r.daynight === 'D' ? '주간' : '야간';

  return {
    id: `firms-${i}`,
    name: `FIRMS 열점 (${r.satellite || 'VIIRS'})`,
    lat,
    lng,
    status: conf === 'low' ? 'contained' : 'active',
    affectedArea: Math.round(frp * 10) / 10,
    startedAt: `${r.acq_date}T${time.slice(0, 2)}:${time.slice(2, 4)}:00`,
    description: `${dn} 감지 | 복사열 ${frp} MW | 신뢰도 ${conf} | 밝기온도 ${r.bright_ti4}K`,
  };
}

async function fetchFirms(apiKey: string): Promise<WildfireReport[]> {
  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${apiKey}/VIIRS_SNPP_NRT/${KOREA_BBOX}/3`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`FIRMS error: ${res.status}`);
  const csv = await res.text();
  return parseFirmsCsv(csv)
    .map((r, i) => firmsToWildfire(r, i))
    .filter((r): r is WildfireReport => r !== null);
}

export async function GET() {
  const kmaKey = process.env.KMA_APIHUB_AUTH_KEY;
  const firmsKey = process.env.NASA_FIRMS_API_KEY;

  // 1) GK-2A FF (천리안 산불탐지, 10분 주기)
  if (kmaKey) {
    try {
      const result = await runGK2AParser(kmaKey);
      if (!result.error && result.detections) {
        const reports = result.detections.map(gk2aToWildfire);
        const geojson = wildfireToGeoJSON(reports);
        return NextResponse.json(geojson, {
          headers: {
            'X-Data-Source': 'gk2a-ami-ff',
            'X-Event-Count': String(reports.length),
            'X-Observation-Time': result.observationTime,
          },
        });
      }
    } catch {
      // fall through to FIRMS
    }
  }

  // 2) NASA FIRMS fallback
  if (firmsKey) {
    try {
      const reports = await fetchFirms(firmsKey);
      const geojson = wildfireToGeoJSON(reports);
      return NextResponse.json(geojson, {
        headers: {
          'X-Data-Source': 'nasa-firms',
          'X-Event-Count': String(reports.length),
        },
      });
    } catch {
      // fall through to mock
    }
  }

  // 3) Mock fallback
  const geojson = wildfireToGeoJSON(MOCK_WILDFIRE_REPORTS);
  return NextResponse.json(geojson, {
    headers: { 'X-Data-Source': 'mock' },
  });
}
