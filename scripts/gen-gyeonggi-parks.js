// 경기도 공원 접근성 데이터 생성.
//
// 실행: node scripts/gen-gyeonggi-parks.js
// 입력: scripts/.cache/gyeonggi/*.json  (수집: node --env-file=.env.local scripts/fetch-gyeonggi-parks.js)
// 출력:
//   src/lib/gyeonggi-boundary.ts          시군 경계 + 외곽 마스크 (SEOUL_MASK 방식)
//   src/lib/gyeonggi-park-data.ts         시군 평가 순위표 + 접근성 등급 정의 + 메타
//   public/data/gyeonggi/access-contours.json   접근성 등고선 밴드 (d3-contour)
//   public/data/gyeonggi/emd-park-score.json    읍면동 평가 choropleth (단순화 폴리곤)
//
// 접근성 모델 수식·상수는 src/lib/park-accessibility.ts 가 정본이다.
// 여기 복제본(BASE_RADIUS/scoreWeight/intensity/influence)을 바꾸려면 반드시
// 정본과 그 테스트를 같이 바꿀 것.
const fs = require('node:fs');
const path = require('node:path');

const CACHE = path.join(__dirname, '.cache', 'gyeonggi');
const LIB = path.join(__dirname, '..', 'src', 'lib');
const PUB = path.join(__dirname, '..', 'public', 'data', 'gyeonggi');

// ---- 격자 정의 ------------------------------------------------------------
// 페이지 쪽에서 셀 크기를 쓸 일은 없고(등고선을 폴리곤으로 내보냄) 여기만 쓴다.
// 0.005° ≈ 경도 440m(위도37.5) / 0.0045° ≈ 위도 500m.
const STEP_LNG = 0.005;
const STEP_LAT = 0.0045;

// ---- 접근성 등급 (d3-contour thresholds) -----------------------------------
// 관측된 경기도 내부 셀 값 분포(로그로 출력)를 보고 잡은 고정 구간.
// 0 초과 ~ L1 미만은 '공원 영향권 밖'으로 간주해 밴드를 만들지 않는다.
const LEVELS = [0.5, 1.5, 3.5, 7, 12];
const LEVEL_LABELS = ['낮음', '보통', '양호', '높음', '매우 높음'];

// ---- 모델 복제 (정본: src/lib/park-accessibility.ts) -----------------------
const MIN_PARK_AREA_M2 = 100;

function baseRadiusM(sclsfNm, areaM2) {
  if (sclsfNm === '어린이공원') return 250;
  if (sclsfNm === '소공원') return 200;
  if (sclsfNm === '휴게시설') return 150;
  if (sclsfNm === '식물원 및 수목원') return 1000;
  // 근린 및 주제공원 (및 미분류)
  if (areaM2 < 30_000) return 500;
  if (areaM2 < 100_000) return 1000;
  if (areaM2 < 1_000_000) return 1500;
  return 2500;
}

function scoreWeight(score) {
  const s = Math.min(100, Math.max(0, score));
  return 0.6 + 0.8 * (s / 100);
}

function intensity(areaM2) {
  return Math.min(3, Math.max(0.2, Math.sqrt(areaM2 / 10_000)));
}

// ---- 지오메트리 유틸 --------------------------------------------------------
/** MultiPolygon/Polygon → polygon 좌표 배열 목록 */
function polysOf(geom) {
  if (!geom) return [];
  if (geom.type === 'Polygon') return [geom.coordinates];
  if (geom.type === 'MultiPolygon') return geom.coordinates;
  return [];
}

/** even-odd point-in-polygon (구멍 포함) */
function pointInPolygon(lng, lat, polygon) {
  let inside = false;
  for (const ring of polygon) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
  }
  return inside;
}

function bboxOfPolys(polys) {
  let w = Infinity, s = Infinity, e = -Infinity, n = -Infinity;
  for (const poly of polys) {
    for (const [x, y] of poly[0]) {
      if (x < w) w = x;
      if (x > e) e = x;
      if (y < s) s = y;
      if (y > n) n = y;
    }
  }
  return [w, s, e, n];
}

/** Douglas-Peucker 링 단순화 (tol: 도 단위 수직거리) */
function simplifyRing(ring, tol) {
  if (ring.length <= 5) return ring;
  const keep = new Uint8Array(ring.length);
  keep[0] = keep[ring.length - 1] = 1;
  const stack = [[0, ring.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 2) continue;
    const [ax, ay] = ring[a];
    const [bx, by] = ring[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    let maxD = -1;
    let maxI = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = ring[i];
      let d;
      if (len2 === 0) {
        d = Math.hypot(px - ax, py - ay);
      } else {
        const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
        d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      }
      if (d > maxD) {
        maxD = d;
        maxI = i;
      }
    }
    if (maxD > tol) {
      keep[maxI] = 1;
      stack.push([a, maxI], [maxI, b]);
    }
  }
  const out = [];
  for (let i = 0; i < ring.length; i++) if (keep[i]) out.push(ring[i]);
  return out.length >= 4 ? out : null;
}

function simplifyGeom(geom, tol) {
  const round = (v) => Math.round(v * 1e5) / 1e5;
  const simplifyPoly = (poly) => {
    const rings = [];
    for (const ring of poly) {
      const s = simplifyRing(ring, tol);
      if (s) rings.push(s.map(([x, y]) => [round(x), round(y)]));
    }
    return rings.length > 0 && rings[0] ? rings : null;
  };
  if (geom.type === 'Polygon') {
    const p = simplifyPoly(geom.coordinates);
    return p ? { type: 'Polygon', coordinates: p } : null;
  }
  if (geom.type === 'MultiPolygon') {
    const ps = geom.coordinates.map(simplifyPoly).filter(Boolean);
    return ps.length ? { type: 'MultiPolygon', coordinates: ps } : null;
  }
  return null;
}

function countVertices(geom) {
  let n = 0;
  for (const poly of polysOf(geom)) for (const ring of poly) n += ring.length;
  return n;
}

const r1 = (v) => Math.round(v * 10) / 10;

// ---- 메인 -------------------------------------------------------------------
async function main() {
  const { contours } = await import('d3-contour');

  const emdFC = JSON.parse(fs.readFileSync(path.join(CACHE, 'emd-park-scr.json'), 'utf8'));
  const sigunFC = JSON.parse(fs.readFileSync(path.join(CACHE, 'sigun-park-scr.json'), 'utf8'));
  const parksRaw = JSON.parse(fs.readFileSync(path.join(CACHE, 'parks-compact.json'), 'utf8'));

  const crtrYmd = emdFC.features[0]?.properties?.crtr_ymd ?? '';

  // ---- 1. 공원 → 읍면동 평가점수 조인 (centroid PIP) -----------------------
  const emdIndex = emdFC.features.map((f) => ({
    polys: polysOf(f.geometry),
    bbox: bboxOfPolys(polysOf(f.geometry)),
    score: Number(f.properties.park_snths_scr),
    name: `${f.properties.sigun_nm}${f.properties.sgg_nm ? ' ' + f.properties.sgg_nm : ''} ${f.properties.emd_nm}`,
  }));

  const sigunScoreByName = new Map(
    sigunFC.features.map((f) => [f.properties.sigun_nm, Number(f.properties.park_snths_scr)]),
  );
  const allEmdScores = emdIndex.map((e) => e.score).filter(Number.isFinite).sort((a, b) => a - b);
  const medianScore = allEmdScores[Math.floor(allEmdScores.length / 2)];

  function emdScoreAt(lng, lat) {
    for (const e of emdIndex) {
      const [w, s, en, n] = e.bbox;
      if (lng < w || lng > en || lat < s || lat > n) continue;
      for (const poly of e.polys) {
        if (pointInPolygon(lng, lat, poly)) return e.score;
      }
    }
    return null;
  }

  let joinEmd = 0;
  let joinSigun = 0;
  let joinMedian = 0;
  let dropped = 0;

  const parks = [];
  for (const p of parksRaw.parks) {
    if (p.areaM2 < MIN_PARK_AREA_M2) {
      dropped++;
      continue;
    }
    let score = emdScoreAt(p.lng, p.lat);
    if (score !== null && Number.isFinite(score)) {
      joinEmd++;
    } else {
      // 읍면동 폴리곤 밖(해안·경계 오차)이면 시군 평가로, 그것도 없으면 중앙값.
      const bySigun = [...sigunScoreByName.entries()].find(([nm]) => p.sggNm.startsWith(nm));
      if (bySigun && Number.isFinite(bySigun[1])) {
        score = bySigun[1];
        joinSigun++;
      } else {
        score = medianScore;
        joinMedian++;
      }
    }
    const radiusM = baseRadiusM(p.sclsfNm, p.areaM2) * scoreWeight(score);
    parks.push({ lng: p.lng, lat: p.lat, radiusM, intensity: intensity(p.areaM2) });
  }
  console.log(
    `공원 조인: 읍면동 ${joinEmd} · 시군 폴백 ${joinSigun} · 중앙값 폴백 ${joinMedian} · 슬리버 제외 ${dropped}`,
  );

  // ---- 2. 격자 접근성 합산 --------------------------------------------------
  // 격자 범위는 시군 폴리곤 bbox 에서 잡는다 (공원 이상치 좌표에 끌려가지 않게).
  const sigunPolysAll = sigunFC.features.flatMap((f) => polysOf(f.geometry));
  const [W0, S0, E0, N0] = bboxOfPolys(sigunPolysAll);
  const WEST = Math.floor((W0 - 0.01) / STEP_LNG) * STEP_LNG;
  const SOUTH = Math.floor((S0 - 0.01) / STEP_LAT) * STEP_LAT;
  const NX = Math.ceil((E0 + 0.01 - WEST) / STEP_LNG);
  const NY = Math.ceil((N0 + 0.01 - SOUTH) / STEP_LAT);
  console.log(`격자: ${NX} × ${NY} = ${NX * NY}셀, bbox [${WEST.toFixed(3)}, ${SOUTH.toFixed(3)}] ~`);

  const M_PER_DEG_LAT = 111_320;
  const values = new Float64Array(NX * NY);

  for (const p of parks) {
    const mPerDegLng = M_PER_DEG_LAT * Math.cos((p.lat * Math.PI) / 180);
    const dLng = p.radiusM / mPerDegLng;
    const dLat = p.radiusM / M_PER_DEG_LAT;
    const i0 = Math.max(0, Math.floor((p.lng - dLng - WEST) / STEP_LNG));
    const i1 = Math.min(NX - 1, Math.ceil((p.lng + dLng - WEST) / STEP_LNG));
    const j0 = Math.max(0, Math.floor((p.lat - dLat - SOUTH) / STEP_LAT));
    const j1 = Math.min(NY - 1, Math.ceil((p.lat + dLat - SOUTH) / STEP_LAT));
    const r2 = p.radiusM * p.radiusM;
    for (let j = j0; j <= j1; j++) {
      const cy = SOUTH + (j + 0.5) * STEP_LAT;
      const dyM = (cy - p.lat) * M_PER_DEG_LAT;
      for (let i = i0; i <= i1; i++) {
        const cx = WEST + (i + 0.5) * STEP_LNG;
        const dxM = (cx - p.lng) * mPerDegLng;
        const d2 = dxM * dxM + dyM * dyM;
        if (d2 >= r2) continue;
        // Epanechnikov: intensity * (1 - (d/r)^2)
        values[j * NX + i] += p.intensity * (1 - d2 / r2);
      }
    }
  }

  // ---- 3. 경기도 밖 마스킹 --------------------------------------------------
  // 단순화한 시군 폴리곤으로 셀 중심 PIP. 등고선이 도 경계에서 잘리게 한다.
  const sigunSimplified = sigunFC.features.map((f) => ({
    geom: simplifyGeom(f.geometry, 0.0006),
    props: f.properties,
  }));
  const clipIndex = sigunSimplified
    .filter((s) => s.geom)
    .map((s) => ({ polys: polysOf(s.geom), bbox: bboxOfPolys(polysOf(s.geom)) }));

  function inGyeonggi(lng, lat) {
    for (const c of clipIndex) {
      const [w, s, e, n] = c.bbox;
      if (lng < w || lng > e || lat < s || lat > n) continue;
      for (const poly of c.polys) if (pointInPolygon(lng, lat, poly)) return true;
    }
    return false;
  }

  let insideCells = 0;
  const insideVals = [];
  for (let j = 0; j < NY; j++) {
    const cy = SOUTH + (j + 0.5) * STEP_LAT;
    for (let i = 0; i < NX; i++) {
      const cx = WEST + (i + 0.5) * STEP_LNG;
      if (inGyeonggi(cx, cy)) {
        insideCells++;
        if (values[j * NX + i] > 0) insideVals.push(values[j * NX + i]);
      } else {
        values[j * NX + i] = 0;
      }
    }
  }
  insideVals.sort((a, b) => a - b);
  const pct = (q) => insideVals[Math.min(insideVals.length - 1, Math.floor(q * insideVals.length))];
  console.log(
    `경기도 내부 ${insideCells}셀, 영향>0 ${insideVals.length}셀 · 값 분포 p25=${pct(0.25).toFixed(2)} p50=${pct(0.5).toFixed(2)} p75=${pct(0.75).toFixed(2)} p90=${pct(0.9).toFixed(2)} p99=${pct(0.99).toFixed(2)} max=${insideVals.at(-1).toFixed(2)}`,
  );

  // ---- 4. d3-contour 등고선 밴드 -------------------------------------------
  const gen = contours().size([NX, NY]).thresholds(LEVELS);
  const bands = gen(values);
  const round5 = (v) => Math.round(v * 1e5) / 1e5;
  const contourFeatures = bands
    .filter((b) => b.coordinates.length > 0)
    .map((b, idx) => ({
      type: 'Feature',
      geometry: {
        type: 'MultiPolygon',
        // d3 격자 좌표 (i, j) → 경위도. 셀 [i, i+1]×[j, j+1] 이 값 하나에 대응한다.
        coordinates: b.coordinates.map((poly) =>
          poly.map((ring) => ring.map(([x, y]) => [round5(WEST + x * STEP_LNG), round5(SOUTH + y * STEP_LAT)])),
        ),
      },
      properties: {
        level: idx,
        min: b.value,
        max: idx + 1 < LEVELS.length ? LEVELS[idx + 1] : null,
        label: LEVEL_LABELS[idx] ?? String(b.value),
      },
    }));
  const contourFC = { type: 'FeatureCollection', features: contourFeatures };

  fs.mkdirSync(PUB, { recursive: true });
  fs.writeFileSync(path.join(PUB, 'access-contours.json'), JSON.stringify(contourFC));
  console.log(
    `등고선 밴드 ${contourFeatures.length}개 → access-contours.json (${(fs.statSync(path.join(PUB, 'access-contours.json')).size / 1024).toFixed(0)}KB)`,
  );

  // ---- 5. 읍면동 choropleth (단순화) ----------------------------------------
  const emdOut = {
    type: 'FeatureCollection',
    features: emdFC.features
      .map((f) => {
        const geom = simplifyGeom(f.geometry, 0.0004);
        if (!geom) return null;
        const p = f.properties;
        return {
          type: 'Feature',
          geometry: geom,
          properties: {
            emdCd: (p.emd_cd || '').trim(),
            emdNm: p.emd_nm,
            sigunNm: p.sigun_nm,
            sggNm: (p.sgg_nm || '').trim() || null,
            score: r1(p.park_snths_scr),
            rank: p.park_snths_rnk,
            // 1인당 공원녹지 면적 m²
            perCapita: r1(p.ppltn1_park_grbt_area),
            // 공원녹지율 % (원본은 0~1 비율)
            greenRate: r1(p.grbt_area_rt * 100),
            // 공원 서비스 수혜 인구 비율 %
            benefitRate: r1(p.park_srvc_bnt_ppltn_rt),
          },
        };
      })
      .filter(Boolean),
  };
  fs.writeFileSync(path.join(PUB, 'emd-park-score.json'), JSON.stringify(emdOut));
  const emdVerts = emdOut.features.reduce((s, f) => s + countVertices(f.geometry), 0);
  console.log(
    `읍면동 ${emdOut.features.length}개 (정점 ${emdVerts}) → emd-park-score.json (${(fs.statSync(path.join(PUB, 'emd-park-score.json')).size / 1024).toFixed(0)}KB)`,
  );

  // ---- 6. 시군 경계 + 마스크 TS 번들 ----------------------------------------
  const sigunFeatures = sigunSimplified
    .filter((s) => s.geom)
    .map((s) => ({
      type: 'Feature',
      geometry: s.geom,
      properties: {
        name: s.props.sigun_nm,
        code: (s.props.sigun_cd || '').trim(),
        score: r1(s.props.park_snths_scr),
        rank: s.props.park_snths_rnk ?? null,
      },
    }));
  const boundaryFC = { type: 'FeatureCollection', features: sigunFeatures };

  // 세계 외곽 링에 시군 외곽 링들을 구멍으로 뚫는다. 시군이 도 전역을 빈틈없이
  // 덮으므로 union 없이 경기도만 뚫린다 (SEOUL_MASK 와 같은 방식).
  const holes = sigunFeatures.flatMap((f) => polysOf(f.geometry).map((poly) => poly[0]));
  const mask = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]],
        ...holes,
      ],
    },
  };

  const boundaryTs = `// 자동 생성 파일 — 직접 수정하지 말 것.
// 재생성: node scripts/gen-gyeonggi-parks.js
// 원본: 경기기후플랫폼 spggcee:sigun_park_scr (기준일 ${crtrYmd}) 를
// Douglas-Peucker(0.0006°)로 단순화한 시군 경계다. 실제 행정 경계와 미세한 차이가 있다.
export const GYEONGGI_SIGUN_BOUNDARIES = ${JSON.stringify(boundaryFC)} as unknown as GeoJSON.FeatureCollection;

// 세계 외곽 링에 시군 폴리곤을 구멍으로 뚫은 마스크 (SEOUL_MASK 방식).
export const GYEONGGI_MASK = ${JSON.stringify(mask)} as unknown as GeoJSON.Feature;
`;
  fs.writeFileSync(path.join(LIB, 'gyeonggi-boundary.ts'), boundaryTs);
  console.log(`시군 경계 ${sigunFeatures.length}개 → gyeonggi-boundary.ts (${(boundaryTs.length / 1024).toFixed(0)}KB)`);

  // ---- 7. 시군 순위표 + 등급 정의 TS 번들 -----------------------------------
  const sigunRows = sigunFC.features
    .map((f) => {
      const p = f.properties;
      const polys = polysOf(f.geometry);
      // 라벨 좌표: 가장 큰 폴리곤 외곽 링 bbox 중심 (도형 밖으로 나가면 라벨용으로만 쓰므로 허용)
      let best = polys[0];
      for (const poly of polys) if (poly[0].length > best[0].length) best = poly;
      const [w, s, e, n] = bboxOfPolys([best]);
      return {
        name: p.sigun_nm,
        code: (p.sigun_cd || '').trim(),
        score: r1(p.park_snths_scr),
        rank: p.park_snths_rnk ?? null,
        perCapita: r1(p.ppltn1_park_grbt_area),
        benefitRate: r1(p.park_srvc_bnt_ppltn_rt),
        lng: Math.round(((w + e) / 2) * 1e5) / 1e5,
        lat: Math.round(((s + n) / 2) * 1e5) / 1e5,
      };
    })
    .sort((a, b) => b.score - a.score);

  const totalParkAreaKm2 = r1(
    parksRaw.parks.reduce((s, p) => (p.areaM2 >= MIN_PARK_AREA_M2 ? s + p.areaM2 : s), 0) / 1e6,
  );

  const dataTs = `// 자동 생성 파일 — 직접 수정하지 말 것.
// 재생성: node scripts/gen-gyeonggi-parks.js
// (수집: node --env-file=.env.local scripts/fetch-gyeonggi-parks.js)
//
// 원본: 경기기후플랫폼 도시공원 평가 (기준일 ${crtrYmd})
// - spggcee:sigun_park_scr  시군 공원 서비스 종합평가 ${sigunRows.length}개
// - spggcee:emd_park_scr    읍면동 종합평가 ${emdOut.features.length}개 (choropleth 는 public/data/gyeonggi/emd-park-score.json)
// - spggcee:park            공원 비오톱 폴리곤 ${parksRaw.parks.length}개 중 ${parks.length}개 사용 (${MIN_PARK_AREA_M2}m² 미만 슬리버 제외)
//
// score(park_snths_scr)·순위는 플랫폼이 산출한 실측 통계이고,
// 접근성 등고선(access-contours.json)은 이를 입력으로 한 EarthPaper 자체 분석이다.

export interface SigunParkScore {
  name: string;
  code: string;
  /** 공원 서비스 종합평가 점수 (0~100) */
  score: number;
  /** 도내 순위 */
  rank: number | null;
  /** 1인당 공원녹지 면적 m² */
  perCapita: number;
  /** 공원 서비스 수혜 인구 비율 % */
  benefitRate: number;
  /** 라벨 표시용 대표 좌표 */
  lng: number;
  lat: number;
}

export const SIGUN_PARK_SCORES: SigunParkScore[] = ${JSON.stringify(sigunRows, null, 2)};

/** 접근성 등고선 밴드 정의. gen-gyeonggi-parks.js 의 LEVELS 와 동일해야 한다. */
export const ACCESS_LEVELS = ${JSON.stringify(LEVELS.map((v, i) => ({ min: v, label: LEVEL_LABELS[i] })), null, 2)} as const;

/** 평가 기준일 (YYYYMMDD) */
export const PARK_SCORE_CRTR_YMD = '${crtrYmd}';
/** 접근성 모델에 들어간 공원 폴리곤 수 (슬리버 제외) */
export const PARK_FEATURE_COUNT = ${parks.length};
/** 모델에 들어간 공원 총면적 km² */
export const PARK_TOTAL_AREA_KM2 = ${totalParkAreaKm2};
/** 읍면동 평가 구역 수 */
export const EMD_COUNT = ${emdOut.features.length};
`;
  fs.writeFileSync(path.join(LIB, 'gyeonggi-park-data.ts'), dataTs);
  console.log(`시군 순위 ${sigunRows.length}개 → gyeonggi-park-data.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
