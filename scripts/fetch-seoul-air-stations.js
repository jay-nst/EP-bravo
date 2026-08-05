// Fetches AirKorea station list once and bakes Seoul stations into a TS file.
// Run with: node --env-file=.env.local scripts/fetch-seoul-air-stations.js <outfile>
// The API key is read from the environment and never printed.
const fs = require('fs');

const key = process.env.DATA_GO_KR_AIR_QUALITY_KEY;
if (!key) { console.error('no key in env'); process.exit(1); }

(async () => {
  const url = new URL('https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getMsrstnList');
  url.searchParams.set('serviceKey', key);
  url.searchParams.set('returnType', 'json');
  url.searchParams.set('numOfRows', '800');
  url.searchParams.set('pageNo', '1');

  let items = [];
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      const res = await fetch(url.toString());
      const text = await res.text();
      const j = JSON.parse(text);
      items = j?.response?.body?.items ?? [];
      if (items.length) { console.error(`attempt ${attempt}: ${items.length} stations`); break; }
      console.error(`attempt ${attempt}: empty (${text.slice(0, 120)})`);
    } catch (e) {
      console.error(`attempt ${attempt}: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, 2500));
  }
  if (!items.length) { console.error('FAILED: no stations'); process.exit(1); }

  const seoul = items
    .filter(i => typeof i.addr === 'string' && i.addr.startsWith('서울'))
    .filter(i => i.dmX && i.dmY && i.stationName)
    .map(i => ({
      name: i.stationName,
      // dmX = 위도, dmY = 경도 (API 명세상 뒤집혀 있음)
      lat: +parseFloat(i.dmX).toFixed(6),
      lng: +parseFloat(i.dmY).toFixed(6),
      district: (i.addr.split(/\s+/)[1] || '').trim(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'));

  const ts = `// 서울시 도시대기측정소 좌표 (에어코리아 MsrstnInfoInqireSvc)
//
// 측정소 위치는 사실상 고정 메타데이터라 번들로 내장한다.
// 측정소 목록 API가 간헐적으로 빈 응답을 주기 때문에, 이 표를 폴백으로 두면
// 실시간 측정값만 살아 있어도 레이어가 정상 렌더링된다.
// 갱신: node --env-file=.env.local scripts/fetch-seoul-air-stations.js src/lib/seoul-air-stations.ts
// 수집 시각: ${new Date().toISOString()}

export interface SeoulAirStation {
  name: string;
  lat: number;
  lng: number;
  district: string;
}

export const SEOUL_AIR_STATIONS: SeoulAirStation[] = ${JSON.stringify(seoul, null, 2)};
`;
  fs.writeFileSync(process.argv[2], ts, 'utf8');
  console.error(`wrote ${seoul.length} Seoul stations`);
})();
