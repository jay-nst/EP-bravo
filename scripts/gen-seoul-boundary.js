// Bundles Seoul's 25 자치구 boundary polygons + an inverted mask polygon.
//
// Source: https://github.com/southkorea/seoul-maps
//         kostat/2013/json/seoul_municipalities_geo_simple.json (통계청 2013 경계, 단순화본)
//
// Run: node scripts/gen-seoul-boundary.js <input.json> <out.ts>
const fs = require('fs');

const src = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const out = process.argv[3];

// 자치구 폴리곤 (이름은 한글)
const districts = src.features.map((f) => ({
  type: 'Feature',
  geometry: f.geometry,
  properties: {
    code: f.properties.code,
    name: f.properties.name,
  },
}));

// 마스크: 세계 전체를 덮는 외곽 링 + 자치구 링을 구멍으로.
// 자치구들이 서울을 빈틈없이 덮으므로 별도의 union 계산 없이 서울만 뚫린다.
// 인접 자치구가 맞닿는 변에 얇은 이음선이 남을 수 있는데, 그건 서울 안쪽이라
// 자치구 경계처럼 보여서 문제되지 않는다.
const WORLD = [
  [-180, -85],
  [180, -85],
  [180, 85],
  [-180, 85],
  [-180, -85],
];

const holes = [];
for (const f of src.features) {
  const g = f.geometry;
  if (g.type === 'Polygon') {
    holes.push(g.coordinates[0]);
  } else if (g.type === 'MultiPolygon') {
    for (const poly of g.coordinates) holes.push(poly[0]);
  }
}

const round = (ring) => ring.map(([x, y]) => [+x.toFixed(5), +y.toFixed(5)]);

const mask = {
  type: 'Feature',
  geometry: {
    type: 'Polygon',
    coordinates: [WORLD, ...holes.map(round)],
  },
  properties: {},
};

const ts = `// 서울시 자치구 경계 + 서울 외곽 마스크
//
// 출처: https://github.com/southkorea/seoul-maps
//       kostat/2013/json/seoul_municipalities_geo_simple.json (통계청 2013 경계 단순화본)
// 재생성: node scripts/gen-seoul-boundary.js <input.json> src/lib/seoul-boundary.ts
//
// SEOUL_MASK 는 세계 전체를 덮는 외곽 링에 자치구 25개를 구멍으로 뚫은 폴리곤이다.
// 이걸 어둡게 칠하면 서울만 남고 주변이 가려진다.

export const SEOUL_DISTRICT_BOUNDARIES: GeoJSON.FeatureCollection = ${JSON.stringify(
  { type: 'FeatureCollection', features: districts },
)};

export const SEOUL_MASK: GeoJSON.FeatureCollection = ${JSON.stringify({
  type: 'FeatureCollection',
  features: [mask],
})};
`;

fs.writeFileSync(out, ts, 'utf8');
console.log(`districts=${districts.length} holes=${holes.length} bytes=${ts.length}`);
