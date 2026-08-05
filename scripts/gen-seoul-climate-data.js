// Deterministic generator for src/lib/seoul-climate-data.ts
const fs = require('fs');

// 자치구청/도시대기측정소 좌표는 저장소의 src/lib/mock-public-data.ts 와 동일 값 사용
// population: 2024년 주민등록인구 기준 근사, areaKm2: 국토교통부 지적통계 기준
const D = [
  ['11110','종로구',37.572,126.979,140000,23.91,'core',6],
  ['11140','중구',37.5641,126.9979,120000,9.96,'core',10],
  ['11170','용산구',37.532,126.990,215000,21.87,'core',7],
  ['11200','성동구',37.5634,127.0371,280000,16.85,'mixed',8],
  ['11215','광진구',37.5385,127.0823,340000,17.06,'resi',9],
  ['11230','동대문구',37.5744,127.0396,340000,14.22,'mixed',11],
  ['11260','중랑구',37.6063,127.0927,385000,18.50,'resi',10],
  ['11290','성북구',37.5894,127.0167,430000,24.57,'resi',9],
  ['11305','강북구',37.6396,127.0257,290000,23.60,'resi',7],
  ['11320','도봉구',37.6688,127.0471,305000,20.70,'resi',8],
  ['11350','노원구',37.654,127.056,500000,35.44,'resi',12],
  ['11380','은평구',37.6027,126.9291,460000,29.71,'resi',11],
  ['11410','서대문구',37.5791,126.9368,305000,17.61,'mixed',8],
  ['11440','마포구',37.566,126.901,365000,23.85,'mixed',10],
  ['11470','양천구',37.5170,126.8664,430000,17.41,'resi',9],
  ['11500','강서구',37.5509,126.8495,570000,41.44,'mixed',15],
  ['11530','구로구',37.495,126.858,400000,20.12,'indu',12],
  ['11545','금천구',37.4569,126.8956,230000,13.02,'indu',9],
  ['11560','영등포구',37.526,126.896,375000,24.55,'comm',11],
  ['11590','동작구',37.5124,126.9393,380000,16.35,'resi',8],
  ['11620','관악구',37.4784,126.9516,490000,29.57,'resi',10],
  ['11650','서초구',37.484,127.032,405000,46.98,'comm',13],
  ['11680','강남구',37.518,127.047,555000,39.50,'comm',16],
  ['11710','송파구',37.515,127.106,650000,33.87,'comm',15],
  ['11740','강동구',37.5301,127.1238,465000,24.59,'resi',11],
];

// 유형별 계수: 상업/업무 밀집일수록 1인당 에너지·배출 계수가 높다
const K = { core:{ghg:6.4,en:2.30,grn:31}, comm:{ghg:5.8,en:2.10,grn:22},
            indu:{ghg:5.2,en:1.95,grn:16}, mixed:{ghg:4.3,en:1.60,grn:20},
            resi:{ghg:3.6,en:1.35,grn:27} };
// 녹지율 보정 (산지 보유 자치구)
const GRN = {'종로구':52,'관악구':56,'서초구':49,'강북구':54,'도봉구':56,'은평구':47,
             '노원구':48,'중랑구':32,'성북구':38,'광진구':28,'강동구':30,'송파구':27,
             '마포구':24,'강서구':26,'용산구':33,'중구':20,'영등포구':17,'동대문구':15,
             '금천구':18,'구로구':21,'양천구':19,'동작구':29,'성동구':22,'서대문구':41,'강남구':24};

const districts = D.map(([code,name,lat,lng,pop,area,type,solarIdx])=>{
  const k = K[type];
  const ghgPerCapita = Math.round(k.ghg*10)/10;
  const ghgTotal = Math.round(pop*ghgPerCapita/1000);          // 천tCO2eq
  const energyUse = Math.round(pop*k.en);                       // TOE
  const solarCapacity = Math.round(solarIdx*1000 + area*140);   // kW
  return {code,name,lat,lng,ghgTotal,ghgPerCapita,energyUse,solarCapacity,
          greenRatio:GRN[name]??k.grn,population:pop,areaKm2:area};
});

// ---------- 열섬 격자 ----------
// 도심 열원 / 냉원(산지·하천) 중첩 모델
const HOT = [[126.990,37.568,3.6,0.055],[126.978,37.556,3.0,0.045],
             [126.902,37.520,3.3,0.050],[126.885,37.485,3.1,0.045],
             [127.048,37.503,3.0,0.050],[127.104,37.514,2.4,0.045],
             [126.852,37.552,2.2,0.045],[127.038,37.563,2.0,0.040]];
const COOL= [[126.981,37.658,4.4,0.055],[126.952,37.452,4.2,0.050],
             [126.994,37.551,2.4,0.020],[127.070,37.640,2.6,0.035],
             [126.930,37.610,2.0,0.035],[127.020,37.470,1.8,0.030]];
// 한강 (냉각 축)
const HAN = [[126.80,37.578],[126.86,37.565],[126.90,37.545],[126.94,37.525],
             [126.99,37.517],[127.04,37.520],[127.09,37.528],[127.14,37.545],[127.18,37.565]];

function gauss(d2,amp,sig){ return amp*Math.exp(-d2/(2*sig*sig)); }
function distHan(lng,lat){
  let m=9e9;
  for(let i=0;i<HAN.length-1;i++){
    const [x1,y1]=HAN[i],[x2,y2]=HAN[i+1];
    const dx=x2-x1,dy=y2-y1; const L=dx*dx+dy*dy;
    let t=L?((lng-x1)*dx+(lat-y1)*dy)/L:0; t=Math.max(0,Math.min(1,t));
    const px=x1+t*dx,py=y1+t*dy;
    m=Math.min(m,(lng-px)**2+(lat-py)**2);
  }
  return Math.sqrt(m);
}
// 서울 경계: 실제 자치구 폴리곤으로 판정한다 (ray casting).
// 근사 원을 쓰면 격자가 경계 밖으로 삐져나온다.
const BOUNDARY_SRC = require('path').join(__dirname, 'seoul-municipalities-src.json');
const RINGS = [];
for (const f of JSON.parse(fs.readFileSync(BOUNDARY_SRC, 'utf8')).features) {
  const g = f.geometry;
  if (g.type === 'Polygon') RINGS.push(g.coordinates[0]);
  else if (g.type === 'MultiPolygon') for (const p of g.coordinates) RINGS.push(p[0]);
}

function inRing(lng, lat, ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

function inSeoul(lng, lat) {
  for (const ring of RINGS) if (inRing(lng, lat, ring)) return true;
  return false;
}

const grid=[];
// 실제 경계로 자르므로 격자를 더 촘촘히 가져가도 가장자리가 지저분하지 않다.
const STEP_LAT = 0.006;
const STEP_LNG = 0.0075;
for(let lat=37.42; lat<=37.706; lat+=STEP_LAT){
  for(let lng=126.76; lng<=127.19; lng+=STEP_LNG){
    if(!inSeoul(lng,lat)) continue;
    let t=30.4;                                   // 여름 오후 기준 기저 지표온도
    for(const [x,y,a,s] of HOT) t+=gauss((lng-x)**2+(lat-y)**2,a,s);
    for(const [x,y,a,s] of COOL) t-=gauss((lng-x)**2+(lat-y)**2,a,s);
    t-=gauss(distHan(lng,lat)**2,3.2,0.017);      // 하천 냉각
    t=Math.max(25.5,Math.min(41.0,t));
    grid.push({lng:+lng.toFixed(4),lat:+lat.toFixed(4),lst:+t.toFixed(1)});
  }
}
const mean=grid.reduce((s,c)=>s+c.lst,0)/grid.length;
grid.forEach(c=>c.anomaly=+(c.lst-mean).toFixed(1));

// ---------- S-DoT ----------
const SPOTS={
'종로구':['세종대로 사거리','광화문광장','종로3가역','혜화동로터리','독립문역'],
'중구':['을지로입구역','서울시청 앞','동대문역사문화공원','충무로역','남대문시장'],
'용산구':['이태원로','용산역 광장','한강대로','삼각지역','효창공원앞역'],
'성동구':['왕십리역','성수동 카페거리','뚝섬역','응봉교','한양대앞'],
'광진구':['건대입구역','구의역','아차산역','뚝섬유원지','자양사거리'],
'동대문구':['청량리역','회기역','장안동사거리','답십리역','경동시장'],
'중랑구':['상봉역','면목역','묵동사거리','중화역','망우역'],
'성북구':['성신여대입구역','길음역','돈암사거리','정릉동','안암오거리'],
'강북구':['수유역','미아사거리역','번동사거리','4·19민주묘지','우이동'],
'도봉구':['창동역','쌍문역','방학사거리','도봉산역','노해로'],
'노원구':['노원역','상계역','중계동 학원가','공릉역','태릉입구역'],
'은평구':['연신내역','불광역','응암오거리','구파발역','수색로'],
'서대문구':['신촌로터리','홍제역','독립문공원','가좌역','아현동'],
'마포구':['홍대입구역','합정역','상암DMC','공덕오거리','망원시장'],
'양천구':['목동운동장','오목교역','신정네거리역','신월동','등촌로'],
'강서구':['김포공항','발산역','까치산역','마곡나루역','화곡로'],
'구로구':['구로디지털단지역','신도림역','고척스카이돔','오류동역','개봉역'],
'금천구':['가산디지털단지역','독산역','시흥대로','금천구청역','석수역'],
'영등포구':['여의도공원','영등포역','당산역','문래동 철공소거리','국회의사당'],
'동작구':['사당역','노량진수산시장','상도역','흑석동','장승배기역'],
'관악구':['서울대입구역','신림역','낙성대역','봉천사거리','서울대 정문'],
'서초구':['강남역 12번출구','고속터미널역','양재시민의숲','서초구청','방배동 카페골목'],
'강남구':['테헤란로','삼성역 코엑스','압구정로데오','대치동 학원가','청담사거리'],
'송파구':['잠실역','석촌호수','올림픽공원','문정동 법조타운','가락시장'],
'강동구':['천호역','길동사거리','암사역','고덕역','둔촌동'],
};
function lstAt(lng,lat){
  let best=null,bd=9e9;
  for(const c of grid){ const d=(c.lng-lng)**2+(c.lat-lat)**2; if(d<bd){bd=d;best=c;} }
  return best?best.lst:30;
}
const OFF=[[0,0],[0.013,0.008],[-0.012,0.007],[0.009,-0.010],[-0.010,-0.009],[0.018,-0.003]];
const stations=[]; let n=0;
for(const d of districts){
  const names=SPOTS[d.name]||[];
  names.forEach((nm,i)=>{
    n++;
    const [dx,dy]=OFF[i%OFF.length];
    const lng=+(d.lng+dx).toFixed(4), lat=+(d.lat+dy).toFixed(4);
    const t=lstAt(lng,lat);
    const air=+(t*0.42+16.2).toFixed(1);                       // 지표온도 → 기온 근사
    const busy=['core','comm','indu'].includes(
      D.find(r=>r[1]===d.name)[6]) ? 1 : 0;
    stations.push({
      id:'SDOT-'+String(n).padStart(4,'0'),
      name:`${d.name} ${nm}`, district:d.name, lat, lng,
      temp:air,
      humidity:Math.max(38,Math.min(78,Math.round(74-(air-27)*2.6+(busy?-3:2)))),
      pm25:Math.max(6,Math.round(11+busy*9+(air-28)*1.5+(i%3)*2)),
      noise:Math.round(56+busy*8+(i%4)*2),
    });
  });
}

// ---------- emit ----------
const hdr=`// 서울 기후 데이터
//
// 출처 및 산출 방식
// - name / lat / lng : 자치구 도시대기측정소 좌표 (src/lib/mock-public-data.ts 와 동일)
// - population       : 2024년 주민등록인구 근사치 (측정값)
// - areaKm2          : 지적통계 기준 자치구 면적 (측정값)
// - ghgPerCapita     : 자치구 토지이용 유형(도심/상업/공업/주거)별 1인당 배출계수 (파생)
// - ghgTotal         : population x ghgPerCapita / 1000 (파생)
// - energyUse        : population x 유형별 1인당 최종에너지 원단위 (파생)
// - solarCapacity    : 자치구 보급 지수와 면적 기반 추정 (파생)
// - greenRatio       : 산지·공원 보유 현황 기반 공원녹지율 근사 (파생)
// - SEOUL_HEAT_GRID  : 여름 오후 지표온도(LST) 공간분포 모델. 도심 열원(중구·종로,
//                      영등포·구로, 강남)과 냉원(북한산·관악산·남산·한강)을 중첩하여 산출 (파생)
// - SDOT_STATIONS    : S-DoT 관측망을 모사한 데모 지점. 위치명은 실제 지명이나
//                      관측값은 위 LST 모델에서 파생 (파생)
//
// 측정값 외 항목은 실제 관측/통계가 아닌 데모용 추정치다.
// 재생성: node scripts/gen-seoul-climate-data.js src/lib/seoul-climate-data.ts
// 실데이터로 교체할 때는 이 파일만 바꾸면 된다.

`;
const ts=hdr+
`export interface SeoulDistrictClimate {
  code: string;
  name: string;
  lat: number;
  lng: number;
  ghgTotal: number;
  ghgPerCapita: number;
  energyUse: number;
  solarCapacity: number;
  greenRatio: number;
  population: number;
  areaKm2: number;
}

export interface SeoulHeatCell {
  lng: number;
  lat: number;
  lst: number;
  anomaly: number;
}

export interface SDotStation {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  pm25: number;
  noise: number;
}

export const SEOUL_DISTRICTS: SeoulDistrictClimate[] = ${JSON.stringify(districts,null,2)};

export const SEOUL_HEAT_GRID: SeoulHeatCell[] = ${JSON.stringify(grid)};

export const SDOT_STATIONS: SDotStation[] = ${JSON.stringify(stations,null,2)};
`;
fs.writeFileSync(process.argv[2],ts,'utf8');
console.log('districts',districts.length,'grid',grid.length,'stations',stations.length);
console.log('lst range',Math.min(...grid.map(c=>c.lst)),Math.max(...grid.map(c=>c.lst)),'mean',mean.toFixed(2));
console.log('ghg total 천tCO2eq',districts.reduce((s,d)=>s+d.ghgTotal,0));
console.log('solar total kW',districts.reduce((s,d)=>s+d.solarCapacity,0));
