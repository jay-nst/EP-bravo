import { NextResponse } from 'next/server';
import { MOCK_WEATHER_FORECAST, weatherForecastToGeoJSON } from '@/lib/mock-public-data';
import type { WeatherForecast } from '@/types/public-data';

interface KmaGridPoint {
  name: string;
  lat: number;
  lng: number;
  nx: number;
  ny: number;
}

const CITIES: KmaGridPoint[] = [
  { name: '서울', lat: 37.5665, lng: 126.9780, nx: 60, ny: 127 },
  { name: '인천', lat: 37.4563, lng: 126.7052, nx: 55, ny: 124 },
  { name: '수원', lat: 37.2636, lng: 127.0286, nx: 60, ny: 121 },
  { name: '춘천', lat: 37.8813, lng: 127.7300, nx: 73, ny: 134 },
  { name: '강릉', lat: 37.7519, lng: 128.8761, nx: 92, ny: 131 },
  { name: '대전', lat: 36.3504, lng: 127.3845, nx: 67, ny: 100 },
  { name: '청주', lat: 36.6424, lng: 127.4890, nx: 69, ny: 107 },
  { name: '대구', lat: 35.8714, lng: 128.6014, nx: 89, ny: 90 },
  { name: '부산', lat: 35.1796, lng: 129.0756, nx: 98, ny: 76 },
  { name: '울산', lat: 35.5384, lng: 129.3114, nx: 102, ny: 84 },
  { name: '광주', lat: 35.1595, lng: 126.8526, nx: 58, ny: 74 },
  { name: '전주', lat: 35.8242, lng: 127.1480, nx: 63, ny: 89 },
  { name: '제주', lat: 33.4996, lng: 126.5312, nx: 52, ny: 38 },
  { name: '서귀포', lat: 33.2541, lng: 126.5600, nx: 52, ny: 33 },
  { name: '속초', lat: 38.2070, lng: 128.5918, nx: 87, ny: 141 },
  { name: '원주', lat: 37.3422, lng: 127.9201, nx: 76, ny: 122 },
  { name: '포항', lat: 36.0190, lng: 129.3435, nx: 102, ny: 94 },
  { name: '목포', lat: 34.8118, lng: 126.3922, nx: 50, ny: 67 },
  { name: '여수', lat: 34.7604, lng: 127.6622, nx: 73, ny: 66 },
  { name: '안동', lat: 36.5684, lng: 128.7294, nx: 91, ny: 106 },
  { name: '진주', lat: 35.1800, lng: 128.1076, nx: 81, ny: 75 },
  { name: '천안', lat: 36.8151, lng: 127.1139, nx: 63, ny: 110 },
  { name: '군산', lat: 35.9676, lng: 126.7369, nx: 56, ny: 92 },
  { name: '홍성', lat: 36.6011, lng: 126.6603, nx: 55, ny: 106 },
  { name: '태백', lat: 37.1648, lng: 128.9855, nx: 95, ny: 119 },
  { name: '고양', lat: 37.6584, lng: 126.8320, nx: 57, ny: 128 },
  { name: '성남', lat: 37.4200, lng: 127.1267, nx: 63, ny: 124 },
  { name: '용인', lat: 37.2411, lng: 127.1776, nx: 64, ny: 119 },
  { name: '창원', lat: 35.2280, lng: 128.6811, nx: 90, ny: 77 },
  { name: '경주', lat: 35.8562, lng: 129.2247, nx: 100, ny: 91 },
];

interface KmaItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

function getBaseDateTime(): { baseDate: string; baseTime: string } {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const hours = kst.getUTCHours();
  const baseTimes = [2, 5, 8, 11, 14, 17, 20, 23];
  let baseHour = baseTimes.filter((t) => t <= hours).pop();

  let baseDate = kst;
  if (baseHour === undefined) {
    baseHour = 23;
    baseDate = new Date(kst.getTime() - 24 * 60 * 60 * 1000);
  }

  const y = baseDate.getUTCFullYear();
  const m = String(baseDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(baseDate.getUTCDate()).padStart(2, '0');
  return {
    baseDate: `${y}${m}${d}`,
    baseTime: String(baseHour).padStart(2, '0') + '00',
  };
}

function parseSky(value: string): WeatherForecast['sky'] {
  switch (value) {
    case '1': return 'clear';
    case '3': return 'partly_cloudy';
    case '4': return 'overcast';
    default: return 'cloudy';
  }
}

function parsePrecipType(value: string): WeatherForecast['precipitation'] {
  switch (value) {
    case '0': return 'none';
    case '1': return 'rain';
    case '2': return 'rain_snow';
    case '3': return 'snow';
    case '4': return 'shower';
    default: return 'none';
  }
}

function parsePrecipAmount(value: string): number | null {
  if (!value || value === '강수없음' || value === '-') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

async function fetchCityForecast(
  serviceKey: string,
  city: KmaGridPoint,
  baseDate: string,
  baseTime: string,
): Promise<WeatherForecast | null> {
  try {
    // data.go.kr keys are already URL-encoded; URLSearchParams double-encodes them
    const qs = [
      `serviceKey=${serviceKey}`,
      `dataType=JSON`,
      `numOfRows=300`,
      `pageNo=1`,
      `base_date=${baseDate}`,
      `base_time=${baseTime}`,
      `nx=${city.nx}`,
      `ny=${city.ny}`,
    ].join('&');
    const url = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?${qs}`;

    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;

    const data = await res.json();
    const items: KmaItem[] = data?.response?.body?.items?.item;
    if (!items || items.length === 0) return null;

    const nearestTime = items[0].fcstDate + items[0].fcstTime;
    const nearest = items.filter((i) => i.fcstDate + i.fcstTime === nearestTime);

    const get = (cat: string) => nearest.find((i) => i.category === cat)?.fcstValue ?? null;

    const tmpVal = get('TMP');
    const skyVal = get('SKY');
    const ptyVal = get('PTY');
    const pcpVal = get('PCP');
    const rehVal = get('REH');
    const wsdVal = get('WSD');

    return {
      id: `wf-${city.nx}-${city.ny}`,
      name: city.name,
      lat: city.lat,
      lng: city.lng,
      temperature: tmpVal ? Number(tmpVal) : null,
      sky: skyVal ? parseSky(skyVal) : 'cloudy',
      precipitation: ptyVal ? parsePrecipType(ptyVal) : 'none',
      precipAmount: pcpVal ? parsePrecipAmount(pcpVal) : null,
      humidity: rehVal ? Number(rehVal) : null,
      windSpeed: wsdVal ? Number(wsdVal) : null,
      forecastTime: `${items[0].fcstDate.slice(0, 4)}-${items[0].fcstDate.slice(4, 6)}-${items[0].fcstDate.slice(6, 8)}T${items[0].fcstTime.slice(0, 2)}:${items[0].fcstTime.slice(2, 4)}:00`,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const serviceKey = process.env.DATA_GO_KR_WEATHER_KEY;

  if (!serviceKey) {
    const geojson = weatherForecastToGeoJSON(MOCK_WEATHER_FORECAST);
    return NextResponse.json(geojson, {
      headers: { 'X-Data-Source': 'mock' },
    });
  }

  try {
    const { baseDate, baseTime } = getBaseDateTime();

    const results = await Promise.allSettled(
      CITIES.map((city) => fetchCityForecast(serviceKey, city, baseDate, baseTime)),
    );

    const forecasts = results
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter((f): f is WeatherForecast => f !== null);

    if (forecasts.length === 0) throw new Error('No forecast data from any city');

    const geojson = weatherForecastToGeoJSON(forecasts);
    return NextResponse.json(geojson, {
      headers: {
        'X-Data-Source': 'kma-forecast',
        'X-Forecast-Count': String(forecasts.length),
        'X-Base-Time': `${baseDate} ${baseTime}`,
      },
    });
  } catch {
    const geojson = weatherForecastToGeoJSON(MOCK_WEATHER_FORECAST);
    return NextResponse.json(geojson, {
      status: 200,
      headers: { 'X-Data-Source': 'mock-fallback' },
    });
  }
}
