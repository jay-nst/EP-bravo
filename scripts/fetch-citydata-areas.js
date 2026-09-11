// 서울시 실시간 도시데이터 장소 목록(POI)과 각 장소의 중심 좌표를 번들 TS로 굽는다.
// 실행: node --env-file=.env.local scripts/fetch-citydata-areas.js src/lib/seoul-citydata-areas.ts
// API 키는 환경변수에서만 읽고 출력하지 않는다.
//
// 왜 스크립트로 한 번만 받는가:
//   실시간 인구 API(citydata_ppltn)는 장소당 2KB로 가볍지만 좌표를 주지 않는다.
//   좌표가 들어있는 전체 API(citydata)는 장소당 155KB라 런타임에 121개를 매번
//   받으면 19MB가 된다. 장소 좌표는 사실상 고정 메타데이터이므로 여기서 굽는다.
//
// 좌표를 어떻게 얻는가 (좌표를 지어내지 않는다):
//   citydata 응답 안에는 그 장소에 속한 버스정류소·지하철역·따릉이대여소·충전소의
//   WGS84 좌표가 실제로 들어있다. 이 지점들의 **중앙값**을 장소 중심으로 쓴다.
//   평균이 아니라 중앙값인 이유는 장소 경계 밖으로 튀는 지점 하나에 중심이
//   끌려가지 않게 하기 위해서다. 어느 소스에서 몇 개를 썼는지 파일에 남긴다.
const fs = require('fs');

const key = process.env.SEOUL_OPEN_DATA_KEY;
if (!key) { console.error('no SEOUL_OPEN_DATA_KEY in env'); process.exit(1); }

const ENDPOINT = 'http://openapi.seoul.go.kr:8088';

// POI 코드는 001~131 사이에 결번이 섞여 있다. 끝을 넉넉히 잡고 실패는 버린다.
const POI_MAX = 140;
const CONCURRENCY = 6;

// 서울 bbox. 유도한 좌표가 여기를 벗어나면 채택하지 않는다.
const BBOX = { west: 126.73, south: 37.40, east: 127.22, north: 37.72 };

// 좌표를 꺼낼 섹션. [섹션명, 경도필드, 위도필드]
// 버스정류소가 가장 촘촘하고 장소 전역에 고르게 퍼져 있어 1순위다.
const ANCHOR_SECTIONS = [
  ['BUS_STN_STTS', 'BUS_STN_X', 'BUS_STN_Y'],
  ['SUB_STTS', 'SUB_STN_X', 'SUB_STN_Y'],
  ['SBIKE_STTS', 'SBIKE_X', 'SBIKE_Y'],
  ['CHARGER_STTS', 'STAT_X', 'STAT_Y'],
  ['PRK_STTS', 'LNG', 'LAT'],
];

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function inSeoul(lng, lat) {
  return lng >= BBOX.west && lng <= BBOX.east && lat >= BBOX.south && lat <= BBOX.north;
}

// 한 섹션에서 서울 안에 있는 (lng, lat) 쌍만 뽑는다.
function collectPoints(cityData, [section, xKey, yKey]) {
  const pts = [];
  for (const row of asArray(cityData[section])) {
    const lng = parseFloat(row[xKey]);
    const lat = parseFloat(row[yKey]);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    if (!inSeoul(lng, lat)) continue;
    pts.push([lng, lat]);
  }
  return pts;
}

// 버스정류소가 3개 이상이면 그것만 쓴다. 부족하면 다음 소스를 순서대로 합친다.
// 소스를 섞으면 중심이 한쪽으로 쏠릴 수 있어, 채운 소스를 기록해 검증 가능하게 한다.
function deriveCentroid(cityData) {
  const used = [];
  let pts = [];

  for (const spec of ANCHOR_SECTIONS) {
    const found = collectPoints(cityData, spec);
    if (found.length === 0) continue;
    pts = pts.concat(found);
    used.push(`${spec[0]}:${found.length}`);
    if (pts.length >= 3) break;
  }

  if (pts.length === 0) return null;

  const lng = +median(pts.map((p) => p[0])).toFixed(6);
  const lat = +median(pts.map((p) => p[1])).toFixed(6);
  if (!inSeoul(lng, lat)) return null;

  return { lng, lat, anchor: used.join('+'), anchorCount: pts.length };
}

async function fetchArea(code) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${ENDPOINT}/${key}/json/citydata/1/5/${code}`, {
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`http ${res.status}`);
      const j = await res.json();
      const cd = j.CITYDATA;
      // 결번 코드는 CITYDATA 없이 RESULT 에러만 온다 — 재시도 대상이 아니다.
      if (!cd) return null;
      if (!cd.AREA_NM) return null;

      const centroid = deriveCentroid(cd);
      if (!centroid) {
        console.error(`  ${code} ${cd.AREA_NM}: 좌표 앵커 없음 — 제외`);
        return null;
      }
      return { code, name: cd.AREA_NM, ...centroid };
    } catch (e) {
      if (attempt === 3) {
        console.error(`  ${code}: ${e.message} — 제외`);
        return null;
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return null;
}

(async () => {
  const codes = [];
  for (let i = 1; i <= POI_MAX; i++) codes.push('POI' + String(i).padStart(3, '0'));

  const areas = [];
  for (let i = 0; i < codes.length; i += CONCURRENCY) {
    const batch = codes.slice(i, i + CONCURRENCY);
    const rows = await Promise.all(batch.map(fetchArea));
    areas.push(...rows.filter(Boolean));
    console.error(`${Math.min(i + CONCURRENCY, codes.length)}/${codes.length} 조회 · 누적 ${areas.length}곳`);
  }

  if (areas.length === 0) { console.error('FAILED: 장소 0곳'); process.exit(1); }

  areas.sort((a, b) => a.code.localeCompare(b.code));

  const ts = `// 서울시 실시간 도시데이터 장소 목록 ${areas.length}곳 — 코드·이름·중심 좌표.
//
// 출처: 서울특별시 실시간 도시데이터 (서울 열린데이터광장, citydata).
// 좌표는 원본에 없다. 각 장소 응답에 실제로 들어있는 버스정류소·지하철역·
// 따릉이대여소·충전소의 WGS84 좌표를 모아 **중앙값**을 낸 유도값이다.
// 측정 지점이 아니라 장소를 대표하는 위치이며, anchor 필드에 어떤 소스에서
// 몇 개를 썼는지 남겨 검증 가능하게 했다.
//
// 장소 좌표는 사실상 고정 메타데이터라 번들에 내장한다. 실시간 인구 API
// (citydata_ppltn)는 장소당 2KB로 가볍지만 좌표를 주지 않고, 좌표가 있는
// 전체 API(citydata)는 장소당 155KB라 런타임에 매번 받을 수 없다.
//
// 갱신: node --env-file=.env.local scripts/fetch-citydata-areas.js src/lib/seoul-citydata-areas.ts
// 수집 시각: ${new Date().toISOString()}

export interface SeoulCitydataArea {
  /** 실시간 도시데이터 장소 코드 (POI001 …). API 조회 키로 쓴다. */
  code: string;
  /** 장소명 (예: 광화문·덕수궁) */
  name: string;
  lng: number;
  lat: number;
  /** 중심 좌표를 유도한 소스와 지점 수 (예: BUS_STN_STTS:32) */
  anchor: string;
  anchorCount: number;
}

export const SEOUL_CITYDATA_AREAS: SeoulCitydataArea[] = ${JSON.stringify(areas, null, 2)};

export const SEOUL_CITYDATA_AREA_COORD: Map<string, { lng: number; lat: number; name: string }> =
  new Map(SEOUL_CITYDATA_AREAS.map((a) => [a.code, { lng: a.lng, lat: a.lat, name: a.name }]));
`;

  fs.writeFileSync(process.argv[2], ts, 'utf8');

  const byAnchor = {};
  areas.forEach((a) => {
    const head = a.anchor.split(':')[0];
    byAnchor[head] = (byAnchor[head] || 0) + 1;
  });
  console.error(`\nwrote ${areas.length} areas → ${process.argv[2]}`);
  console.error('1순위 앵커 분포:', JSON.stringify(byAnchor));
})();
