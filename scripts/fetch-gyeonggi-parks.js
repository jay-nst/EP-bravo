// 경기기후플랫폼 (climate.gg.go.kr) WFS 수집 — 경기 공원 접근성 지도 원본 데이터.
//
// 실행: node --env-file=.env.local scripts/fetch-gyeonggi-parks.js
// 출력: scripts/.cache/gyeonggi/{parks-compact,emd-park-scr,sigun-park-scr}.json
//
// spggcee:park 는 35,000+ 폴리곤이라 원본을 그대로 저장하지 않는다.
// 페이지(1000건)마다 centroid·유형·면적만 뽑아 축약 저장한다.
// 평가 레이어 둘은 600/32건이라 지오메트리 포함 원본을 저장한다 (단순화는 gen 스크립트 몫).
const fs = require('node:fs');
const path = require('node:path');

const KEY = process.env.GYEONGGI_CLIMATE_API_KEY;
if (!KEY) {
  console.error('GYEONGGI_CLIMATE_API_KEY 가 없다. node --env-file=.env.local 로 실행할 것.');
  process.exit(1);
}

const WFS = 'https://climate.gg.go.kr/ols/api/geoserver/wfs';
const OUT_DIR = path.join(__dirname, '.cache', 'gyeonggi');
const PAGE = 1000;

function wfsUrl(extra) {
  const params = new URLSearchParams({
    apiKey: KEY,
    service: 'WFS',
    request: 'GetFeature',
    outputFormat: 'application/json',
    srsName: 'EPSG:4326',
    ...extra,
  });
  return `${WFS}?${params}`;
}

async function getJson(extra, label) {
  const res = await fetch(wfsUrl(extra), { signal: AbortSignal.timeout(120000) });
  const type = res.headers.get('content-type') || '';
  const body = await res.text();
  if (!res.ok || !type.includes('json')) {
    // 오류 본문에 apiKey 가 에코될 수 있으니 가려서 출력한다.
    throw new Error(`${label}: HTTP ${res.status} ${body.slice(0, 200).replace(/apiKey=[^&"']*/g, 'apiKey=***')}`);
  }
  return JSON.parse(body);
}

// 폴리곤 외곽 링의 면적가중 centroid (shoelace). 공원 폴리곤은 작아서 평면 근사로 충분하다.
function ringCentroid(ring) {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const cross = x0 * y1 - x1 * y0;
    a += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  if (Math.abs(a) < 1e-12) return ring[0];
  return [cx / (3 * a), cy / (3 * a)];
}

function centroidOf(geom) {
  if (!geom) return null;
  if (geom.type === 'Polygon') return ringCentroid(geom.coordinates[0]);
  if (geom.type === 'MultiPolygon') {
    // 가장 큰 파트의 centroid 를 대표점으로 쓴다.
    let best = null;
    let bestLen = -1;
    for (const poly of geom.coordinates) {
      if (poly[0].length > bestLen) {
        bestLen = poly[0].length;
        best = poly[0];
      }
    }
    return best ? ringCentroid(best) : null;
  }
  return null;
}

async function fetchParksCompact() {
  const parks = [];
  let start = 0;
  let total = null;
  for (;;) {
    // WFS 2.0.0 count/startIndex 페이징. 안정 정렬을 위해 sortBy=uid.
    const fc = await getJson(
      { version: '2.0.0', typeNames: 'spggcee:park', count: String(PAGE), startIndex: String(start), sortBy: 'uid' },
      `park page @${start}`,
    );
    if (total === null) total = fc.totalFeatures ?? fc.numberMatched ?? null;
    const feats = fc.features || [];
    for (const f of feats) {
      const c = centroidOf(f.geometry);
      if (!c) continue;
      const p = f.properties || {};
      parks.push({
        uid: p.uid,
        sggCd: (p.sgg_cd || '').trim(),
        sggNm: (p.sgg_nm || '').trim(),
        mclsfNm: (p.mclsf_nm || '').trim(),
        sclsfCd: (p.sclsf_cd || '').trim(),
        sclsfNm: (p.sclsf_nm || '').trim(),
        // biotop_area 단위는 m² — 지오메트리 면적과 대조해 확인 (소공원 1809.5 ↔ 계산 1813m²).
        // 0.02m² 수준의 퇴화 슬리버가 섞여 있으니 소비 측에서 하한 필터가 필요하다.
        areaM2: Number(p.biotop_area) || 0,
        lng: Math.round(c[0] * 1e6) / 1e6,
        lat: Math.round(c[1] * 1e6) / 1e6,
      });
    }
    console.log(`park: +${feats.length} (누적 ${parks.length}${total ? ` / ${total}` : ''})`);
    if (feats.length < PAGE) break;
    start += PAGE;
  }
  return { total, parks };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('1/3 읍면동 공원 평가 (emd_park_scr)…');
  const emd = await getJson(
    { version: '1.1.0', typeName: 'spggcee:emd_park_scr', maxfeatures: '1000' },
    'emd_park_scr',
  );
  fs.writeFileSync(path.join(OUT_DIR, 'emd-park-scr.json'), JSON.stringify(emd));
  console.log(`  ${emd.features.length}개 읍면동`);

  console.log('2/3 시군 공원 평가 (sigun_park_scr)…');
  const sigun = await getJson(
    { version: '1.1.0', typeName: 'spggcee:sigun_park_scr', maxfeatures: '1000' },
    'sigun_park_scr',
  );
  fs.writeFileSync(path.join(OUT_DIR, 'sigun-park-scr.json'), JSON.stringify(sigun));
  console.log(`  ${sigun.features.length}개 시군`);

  console.log('3/3 공원 현황 (park) — 페이징 수집…');
  const { total, parks } = await fetchParksCompact();
  fs.writeFileSync(
    path.join(OUT_DIR, 'parks-compact.json'),
    JSON.stringify({ fetchedAt: new Date().toISOString(), totalFeatures: total, parks }),
  );
  console.log(`완료: 공원 ${parks.length}개 → ${path.join(OUT_DIR, 'parks-compact.json')}`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
