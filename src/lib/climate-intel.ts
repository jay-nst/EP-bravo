// Warden · Climate Intelligence 랜딩 콘텐츠
//
// 출처 (2026-10-08 확인):
// - 경기샛-2A 발사·교신: 나라스페이스 보도자료 2026-10-02 「국내 최초 메탄 관측 위성 '경기샛-2A' 양방향 교신 성공」
// - 경기샛 제원·임무: 경기기후위성 리플렛 A4 국문 최종 (2026-09-16)
// - Transporter-18 / CEOS 등재 / 카자흐스탄 KGS 공급: 웹 보도 (gktoday, venturesquare 1040076·1114931)
// - 메탄 모니터링: NarSha leaflet_en (2026-08) — 제원·강점·업종별 활용 / NarSha 홍보영상 스토리보드 (2026-06)
//   메탄 통계·규제: WEF 매거진 기고문 (2025-06, 출처 링크 포함) / 1665.6 nm first light: 오형직 이사 발표 (2026-09)
// - "세계 네 번째 메탄 관측 초소형위성"은 회사 발표 기준 — 페이지에 단서 표기
// - EP Post: src/lib/mock-dashboard.ts 의 실제 ep.naraspace.com 링크만 사용 (link_url null 항목 제외)
//
// 첫 영상·궤도 고도·폼팩터는 아직 공개 자료가 없어 기재하지 않는다.
// NarSha 군집 위성 수는 쓰지 않는다 (사용자 결정).

export const GG2A_LAUNCH_KST = new Date('2026-10-02T03:32:00+09:00');

export const GG2A_SPECS = [
  { value: '25', unit: 'm', label: '공간해상도' },
  { value: '10×10', unit: 'km', label: '한 번에 찍는 면적' },
  { value: '100', unit: 'kg/h', label: '이상 배출원 탐지' },
] as const;

export const LAUNCH_SEQUENCE = [
  { key: '10월 2일 03:32', title: '발사', detail: '반덴버그 우주군기지에서 SpaceX Falcon 9(Transporter-18)에 실려 올라갔습니다.' },
  { key: '55분 뒤', title: '궤도 분리', detail: '태양동기궤도에서 정상적으로 떨어져 나왔습니다.' },
  { key: '같은 날', title: '첫 교신', detail: '나라스페이스 본사 관제센터와 양방향 교신에 성공했습니다.' },
  { key: '지금', title: '점검과 검보정', detail: '본체와 탑재체를 점검하고 있습니다. 끝나면 본격적으로 메탄을 관측합니다.' },
] as const;

export const GG2A_NOTES = [
  '경기기후위성 사업 두 번째 위성 — 경기도·서울대 기후연구실 공동 추진',
  '캐나다·스페인·프랑스에 이어 세계 네 번째 메탄 관측 초소형위성 (나라스페이스 발표 기준)',
  '같은 플랫폼으로 자체 메탄 관측 군집 NarSha 구축 중',
  'NarSha: 2026.02 국내 민간 메탄 위성 최초 CEOS 공식 포털 등재, 카자흐스탄 국영우주공사(KGS) 메탄 MRV 데이터 공급 계약',
] as const;

// ── 메탄 모니터링 (NarSha) ─────────────────────────────

export const METHANE_FACTS = [
  { value: '82', unit: '배', label: 'CO₂ 대비 온난화 효과 (20년 기준)', source: 'IPCC AR6' },
  { value: '30', unit: '%', label: '지구 온난화의 약 30%가 메탄 때문', source: 'IEA' },
  { value: '71', unit: '%', label: '국내 에너지 부문 메탄 중 의도치 않은 누출', source: '한국 메탄 전략 2023' },
  { value: '9', unit: '년', label: '대기 중 수명 · 줄이면 효과가 빨리 나타남', source: 'NOAA' },
] as const;

export const METHANE_HOW = [
  {
    num: '01',
    title: '빛을 150갈래로 쪼갭니다',
    desc: '단파적외선(SWIR) 1625–1670 nm 구간을 150개 채널, 0.6 nm 간격으로 나눠 봅니다.',
  },
  {
    num: '02',
    title: '메탄이 삼킨 파장을 읽습니다',
    desc: '메탄은 정해진 파장의 빛만 흡수합니다. 그 흡수 깊이로 농도를 계산합니다. 정밀도 50 ppb.',
  },
  {
    num: '03',
    title: '어느 시설인지 짚습니다',
    desc: '함께 찍은 12.5 m 가시광 영상에 메탄 플룸을 겹쳐 배출 시설을 특정하고, 시간당 배출량을 추정합니다.',
  },
] as const;

export const METHANE_ADVANTAGES = [
  {
    title: '시설 단위로 찾습니다',
    desc: '시간당 100 kg 수준의 국지적 배출까지 탐지합니다. 넓은 메탄 구름이 아니라 의심 시설 하나로 좁혀 줍니다.',
  },
  {
    title: '간헐적 누출도 놓치지 않습니다',
    desc: '군집으로 같은 곳을 자주 봅니다. 목표는 하루 최대 5회 관측. 잠깐 샜다 멈추는 누출까지 따라갑니다.',
  },
  {
    title: '도시부터 해상 플랫폼까지',
    desc: '복잡한 산업단지와, 기존 위성이 보기 어려운 해상 플랫폼까지 관측 모드를 바꿔 가며 봅니다.',
  },
  {
    title: '받자마자 쓸 수 있는 데이터',
    desc: '위성에서 바로 구름을 걸러내고 압축해 내려보냅니다. 원시 영상이 아니라 분석 결과와 리포트로 받습니다.',
  },
] as const;

export const METHANE_INDUSTRIES = [
  {
    id: 'energy',
    title: '석유 · 가스 · 에너지',
    problem: '넓게 퍼진 파이프라인과 설비의 누출은 제품 손실과 규제 위험으로 이어집니다.',
    solution: '파이프라인, 벤팅, 플레어링 누출을 일찍 찾고 반복 관측으로 규제 기한 안에 고칠 수 있게 돕습니다.',
  },
  {
    id: 'gov',
    title: '지자체 · 스마트시티',
    problem: '탄소중립을 선언해도 복잡한 도시와 산업단지의 실제 배출량은 기존 데이터로 잡기 어렵습니다.',
    solution: '경기샛-2A·2B로 도시 규모 배출을 직접 관측하고, 독립적인 MRV 데이터를 만듭니다.',
  },
  {
    id: 'finance',
    title: '금융 · ESG 투자',
    problem: '기업이 스스로 공시한 숫자만으로는 실제 환경 위험을 가늠하기 어렵습니다.',
    solution: '제3자 위성 데이터로 실제 배출을 검증하고, 전 세계 가스 시설의 가동 변화를 먼저 읽습니다.',
  },
  {
    id: 'waste',
    title: '폐기물 · 매립지',
    problem: '매립지 메탄은 민원과 규제 위험을 만들고, 기온과 날씨에 따라 계속 바뀝니다.',
    solution: '매립지 안에서 메탄이 몰리는 구역을 찾아 포집 효율을 높이고, 연중 변화를 추적합니다.',
  },
] as const;

export const METHANE_REGULATIONS = [
  { value: '$1,500', label: '미국 메탄 배출 부과금 (2026년, 톤당)', detail: '2024년 $900 → 2025년 $1,200 → 2026년 $1,500' },
  { value: 'MRV', label: 'EU 메탄 규제', detail: '석유·가스·석탄의 측정·보고·검증 의무, 수입분 포함' },
  { value: '30%', label: '글로벌 메탄 서약', detail: '150개국 이상, 2030년까지 2020년 대비 30% 감축' },
] as const;

export const NARSHA_SPECS = [
  { group: '플랫폼', rows: [
    ['버스', '16U · 15 kg'],
    ['탑재체', '10 kg 이하'],
    ['궤도', '500–600 km (태양동기 · 중경사)'],
    ['설계 수명', '3년 이상'],
  ] },
  { group: '탑재체', rows: [
    ['SWIR', '150채널 · 1625–1670 nm · 분해능 0.6 nm'],
    ['VNIR', '4밴드 (480 · 545 · 660 · 840 nm) · 12.5 m'],
    ['신호 대 잡음비', '150 이상 (SWIR)'],
    ['한 장면', '10 × 10 km 이상'],
  ] },
  { group: '성능 · 데이터', rows: [
    ['탐지 하한', '100 kg/h (정밀도 50 ppb)'],
    ['자세 지향', '±0.02° (3σ) · 경사 촬영 ±30°'],
    ['다운링크', 'X밴드 최대 150 Mbps · 저장 240 GB'],
    ['산출물', 'L1 · L2 · L4 · 온보드 구름 탐지'],
  ] },
] as const;

/** 페이지 섹션 순서 = 로컬 내비 순서 = 솔루션 카드 순서 (링크가 항상 아래로 향하도록) */
export const WARDEN_SECTIONS = [
  { id: 'agent', label: '재난 대응' },
  { id: 'gyeonggisat', label: '메탄 모니터링' },
  { id: 'compliance', label: 'EUDR' },
  { id: 'posts', label: '분석 사례' },
  { id: 'dashboards', label: '기후 지도' },
] as const;

export const SOLUTIONS = [
  {
    id: 'disaster',
    title: '기후재난 대응',
    desc: '산불, 홍수, 산사태가 나면 그 지역을 바로 찍고 피해 범위와 심각도를 AI가 계산합니다.',
    link: { label: 'EP Agent 보기', href: '#agent' },
  },
  {
    id: 'methane',
    title: '메탄 · 온실가스 MRV',
    desc: '산업단지, 발전소, 매립지에서 나오는 메탄을 시설 단위로 찾아 배출량을 잽니다. 통계 추정 대신 위성 관측값으로 검증합니다.',
    link: { label: '경기샛-2A 보기', href: '#gyeonggisat' },
  },
  {
    id: 'eudr',
    title: 'EUDR 실사',
    desc: '공급 농지를 등록하면 2020년 이후 산림을 훼손했는지 판정하고 TRACES에 낼 실사보고서(DDS)를 만듭니다.',
    link: { label: 'EUDR 보기', href: '#compliance' },
  },
  {
    id: 'forest',
    title: '산림 · 토지 변화',
    desc: '산림 같은 탄소흡수원과 벼 재배지, 휴경지의 변화를 따라가고 개발제한구역 불법 훼손을 찾아냅니다.',
    link: { label: '분석 사례 보기', href: '#posts' },
  },
  {
    id: 'platform',
    title: '지자체 기후 플랫폼',
    desc: '관측과 분석 결과를 지자체 기후 플랫폼에 쌓습니다. 도민은 우리 동네 기후 정보를 보고, 행정은 정책 근거로 씁니다.',
    link: { label: '기후 지도 보기', href: '#dashboards' },
  },
] as const;

export const AGENT_STEPS = [
  {
    num: '01',
    title: '물어보면 분석합니다.',
    desc: '화재 전후 영상을 찾아 dNBR로 피해 면적과 심각도를 계산하고, 지도 위에 겹쳐 보여줍니다.',
    image: '/proposals/agent-tutorial/step2-result.png',
    alt: 'EP Agent 채팅에서 산불 피해 분석 결과와 전후 비교 지도가 표시된 화면',
  },
  {
    num: '02',
    title: '보고서로 정리합니다.',
    desc: '사건 배경, 피해 현황, 심각도 분포를 담은 분석 아티클을 쓰고 PDF로 내려받을 수 있습니다.',
    image: '/proposals/agent-tutorial/step4-article.png',
    alt: 'EP Agent가 작성한 산타로사섬 산불 분석 아티클 화면',
  },
] as const;

export const AGENT_FACTS = [
  { value: '7,428.8', unit: 'ha', label: '총 피해 면적' },
  { value: '2,480.1', unit: 'ha', label: '고강도 피해' },
  { value: '50', unit: '일', label: '화재 전후 비교 간격' },
] as const;

export type PostCategory = 'wildfire' | 'flood' | 'forest' | 'agri';

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  wildfire: '산불',
  flood: '홍수',
  forest: '산림',
  agri: '농업 · 식량',
};

export interface CuratedPost {
  id: string;
  category: PostCategory;
  title: string;
  desc: string;
  location: string;
  thumbnail: string;
  href: string;
}

const S3 = 'https://earthpaper.s3.ap-northeast-2.amazonaws.com/post/v2/editor';
const EP = 'https://ep.naraspace.com/ko/post/contents';

export const CURATED_POSTS: CuratedPost[] = [
  {
    id: 'santa-rosa',
    category: 'wildfire',
    title: 'Santa Rosa Island 산불 확산 및 피해 범위 위성 추적',
    desc: '시계열로 비교해 불탄 범위와 번진 경로를 계산했습니다.',
    location: 'California, USA',
    thumbnail: `${S3}/54/Thumbnail-santa-rosa-island-wildfire-satellite-analysis.png`,
    href: `${EP}/santa-rosa-island-wildfire-satellite-analysis`,
  },
  {
    id: 'patagonia',
    category: 'wildfire',
    title: '2026 파타고니아 산불 피해 분석 (64,468ha)',
    desc: 'dNBR로 피해 등급을 나누고 번지는 속도를 쟀습니다.',
    location: 'Patagonia, Chile',
    thumbnail: `${S3}/39/Thumbnail-2026-patagonia-wildfire-damage-analysis-64468ha-satellite-severity-spread-rate.png`,
    href: `${EP}/2026-patagonia-wildfire-damage-analysis-64468ha-satellite-severity-spread-rate`,
  },
  {
    id: 'gwangyang',
    category: 'wildfire',
    title: '2026 전남 광양 산불 분석 (NDMI, dNBR)',
    desc: '피해 범위와 산림이 얼마나 말랐는지 지수로 봤습니다.',
    location: '전남 광양시',
    thumbnail: `${S3}/33/Thumbnail-2026-gwangyang-wildfire-ndmi-dnbr-analysis.png`,
    href: `${EP}/2026-gwangyang-wildfire-ndmi-dnbr-analysis`,
  },
  {
    id: 'jamaica',
    category: 'flood',
    title: '자메이카 홍수 피해 위성영상 분석',
    desc: '통신과 도로가 끊긴 곳의 피해 면적과 복구 순서를 짚었습니다.',
    location: 'Jamaica',
    thumbnail: `${S3}/46/Thumbnail-disaster-impact-jamaica-flood-damage-satellite-imagery.png`,
    href: `${EP}/disaster-impact-jamaica-flood-damage-satellite-imagery`,
  },
  {
    id: 'akosombo',
    category: 'flood',
    title: '가나 Akosombo 댐 방류 및 Volta강 홍수 확산 분석',
    desc: '긴급 방류 뒤 강 유역이 얼마나 잠겼는지 따라갔습니다.',
    location: 'Ghana',
    thumbnail: `${S3}/41/Thumbnail-satellite-analysis-akosombo-dam-release-volta-river-flood-ghana.png`,
    href: `${EP}/satellite-analysis-akosombo-dam-release-volta-river-flood-ghana`,
  },
  {
    id: 'raja-ampat',
    category: 'forest',
    title: 'Raja Ampat 니켈 채굴 허가 취소 후 산림 변화',
    desc: '허가가 취소된 뒤 산림 손실이 정말 멈췄는지 확인했습니다.',
    location: 'Raja Ampat, Indonesia',
    thumbnail: `${S3}/51/Thumbnail-indonesia-raja-ampat-nickel-mining-permits-forest-loss.png`,
    href: `${EP}/indonesia-raja-ampat-nickel-mining-permits-forest-loss`,
  },
  {
    id: 'corn',
    category: 'agri',
    title: '미국 옥수수 수확량 예측 (97% 정확도 모델)',
    desc: 'Corn Belt 수확량을 위성으로 예측했습니다.',
    location: 'US Corn Belt',
    thumbnail: `${S3}/28/Thumbnail-corn-belt-yield-model-97pct-accuracy-satellite-forecast.png`,
    href: `${EP}/2025-us-corn-yield-prediction`,
  },
  {
    id: 'cocoa',
    category: 'agri',
    title: '글로벌 초콜릿 가격 급등 — 코코아 작황 위성 분석',
    desc: '서아프리카 코코아 산지의 작황을 지켜봤습니다.',
    location: 'West Africa',
    thumbnail: `${S3}/14/Thumbnail-global-chocolate-prices-soar-amid-plummeting-cocoa-stocks.png`,
    href: `${EP}/global-chocolate-prices-soar-amid-plummeting-cocoa-stocks`,
  },
];

export const CLIMATE_DASHBOARDS = [
  {
    href: '/gyeonggi',
    label: '경기 공원 접근성 지도',
    desc: '경기기후플랫폼 데이터로 읍면동 600곳의 공원 접근성을 봅니다.',
  },
  {
    href: '/seoul',
    label: '서울 도시 기후 대시보드',
    desc: '초미세먼지, 대기환경지수, S-DoT 기온을 실시간으로 봅니다.',
  },
] as const;

export const SOURCES = [
  { label: '나라스페이스 보도자료 (2026.10.02)', href: 'https://www.finance-scope.com/article/view/scp202610020006' },
  { label: 'Transporter-18 발사', href: 'https://www.gktoday.in/spacex-launches-transporter-18-smallsat-rideshare-mission/' },
  { label: 'NarSha CEOS 등재', href: 'https://www.venturesquare.net/1040076/' },
  { label: '카자흐스탄 KGS 메탄 데이터 공급', href: 'https://www.venturesquare.net/1114931/' },
  { label: 'IPCC AR6', href: 'https://www.ipcc.ch/assessment-report/ar6/' },
  { label: 'IEA Global Methane Tracker', href: 'https://www.iea.org/reports/global-methane-tracker-2022/methane-and-climate-change' },
  { label: '한국 메탄 전략 2023', href: 'https://content.forourclimate.org/files/research/6AjmFUe.pdf' },
  { label: 'NOAA 메탄 순환', href: 'https://gml.noaa.gov/outreach/info_activities/pdfs/CTA_the_methane_cycle.pdf' },
  { label: 'US EPA 메탄 부과금', href: 'https://www.epa.gov/newsreleases/epa-finalizes-rule-reduce-wasteful-methane-emissions-and-drive-innovation-oil-and-gas' },
  { label: 'EU 메탄 규제', href: 'https://energy.ec.europa.eu/news/new-eu-methane-regulation-reduce-harmful-emissions-fossil-fuels-europe-and-abroad-2024-05-27_en' },
  { label: 'Global Methane Pledge', href: 'https://www.globalmethanepledge.org/' },
] as const;
