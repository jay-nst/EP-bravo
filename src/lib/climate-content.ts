// 기후 인텔리전스 페이지 (/climate) 콘텐츠
// 2026-10-08 Warden(/warden) 개편본에서 분기 — 이후 독립 개발. Warden은 src/lib/climate-intel.ts
//
// 출처 (2026-10-08 확인):
// - 경기샛-2A 발사·교신: 나라스페이스 보도자료 2026-10-02 「국내 최초 메탄 관측 위성 '경기샛-2A' 양방향 교신 성공」
// - 경기샛 제원·임무: 경기기후위성 리플렛 A4 국문 최종 (2026-09-16)
// - 경기샛-1 첫 영상·활용 분야, Observer-1A 포천 산사태: 보도자료 2026-03-16 「'경기샛-1' 위성영상 첫 공개」
// - 위성 사진(observer-bus·cleanroom·mission-control): naraspace.com 메인 공개 이미지
// - Santa Rosa 사례: EP Agent 실화면 캡처(proposals/agent-tutorial) 크롭 + EP Agent 분석 아티클(2026.09) 수치
// - 심층 글: 오형직 이사 발표(2026-09, 해외 관측 현황·빌려 쓰는 데이터의 한계·first light), WEF 기고문(아시아 산업단지 해상도),
//   NarSha 스토리보드(Offshore Glint Mode), 보도자료 2026-10-02(정수종 교수 인용 원문), Scanway 협력(2024.03 공식 SNS)
//   dNBR·흡수선 원리는 일반 원격탐사 지식
// - 로드맵: 보도자료 2026-10-02(검보정 후 정상 운용), 경기기후위성 리플렛(2B 2027, 경기기후플랫폼 연계)
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
  { value: '10×10', unit: 'km', label: '1회 촬영 범위' },
  { value: '100', unit: 'kg/h', label: '이상 배출원 탐지' },
] as const;

export const LAUNCH_SEQUENCE = [
  { key: '10월 2일 03:32', title: '발사', detail: '반덴버그 우주군기지에서 SpaceX Falcon 9(Transporter-18)로 발사됐습니다.' },
  { key: '55분 뒤', title: '궤도 분리', detail: '태양동기궤도에서 정상적으로 분리됐습니다.' },
  { key: '같은 날', title: '첫 교신', detail: '나라스페이스 본사 관제센터와 양방향 교신에 성공했습니다.' },
  { key: '지금', title: '점검과 검보정', detail: '현재 본체와 탑재체를 점검 중이며 점검을 마치면 본격적으로 메탄을 관측합니다.' },
] as const;

export const GG2A_NOTES = [
  '경기기후위성 사업 두 번째 위성 — 경기도·서울대 기후연구실 공동 추진',
  '캐나다·스페인·프랑스에 이어 세계 네 번째 메탄 관측 초소형위성 (나라스페이스 발표 기준)',
  '같은 플랫폼으로 자체 메탄 관측 군집 NarSha 구축 중',
  'NarSha: 2026.02 국내 민간 메탄 위성 최초 CEOS 공식 포털 등재, 카자흐스탄 국영우주공사(KGS) 메탄 MRV 데이터 공급 계약',
] as const;

// ── 위성 ─────────────────────────────

export const FLEET = [
  {
    id: 'o1a',
    name: 'Observer-1A',
    type: '광학 · 16U',
    launch: '2023.11',
    status: 'live' as const,
    statusLabel: '운용 중',
    desc: '국내 최초 상업용 초소형 관측 위성. 포천 산사태 지역을 촬영해 피해 범위와 복구 현황 파악에 활용했습니다.',
  },
  {
    id: 'gg1',
    name: '경기샛-1',
    type: '광학 · 1.5 m',
    launch: '2025.11',
    status: 'live' as const,
    statusLabel: '운용 중',
    desc: '지자체 최초 기후 위성. 고도 약 500 km에서 한 번에 14 × 40 km 범위를 촬영합니다. 첫 영상은 2026년 3월에 공개했습니다.',
  },
  {
    id: 'gg2a',
    name: '경기샛-2A',
    type: '초분광 · 메탄',
    launch: '2026.10',
    status: 'new' as const,
    statusLabel: '초기 운영 중',
    desc: '국내 최초 메탄 관측 위성. 산업단지·발전소·매립지의 메탄 배출원을 탐지합니다.',
  },
  {
    id: 'gg2b',
    name: '경기샛-2B',
    type: '초분광 · 메탄',
    launch: '2027',
    status: 'planned' as const,
    statusLabel: '발사 예정',
    desc: '2A와 함께 궤도를 돌며 같은 지역의 관측 빈도를 높입니다.',
  },
  {
    id: 'narsha',
    name: 'NarSha',
    type: '메탄 관측 군집',
    launch: '구축 중',
    status: 'planned' as const,
    statusLabel: '군집 구축 중',
    desc: '경기샛-2A·2B와 같은 플랫폼 기반의 자체 메탄 군집. 2026.02 CEOS 공식 포털에 등재됐습니다.',
  },
] as const;

export const BUILD_PHOTOS = [
  {
    src: '/climate/observer-bus.jpg',
    alt: '나라스페이스 16U 초소형 관측 위성 실물',
    title: '제작',
    desc: '16U 초소형 위성 버스를 직접 설계하고 조립합니다.',
  },
  {
    src: '/climate/cleanroom.jpg',
    alt: '클린룸에서 위성을 조립하는 연구원',
    title: '테스트',
    desc: '클린룸에서 조립한 뒤 발사 전 환경시험을 거칩니다.',
  },
  {
    src: '/climate/mission-control.jpg',
    alt: '나라스페이스 본사 위성관제센터',
    title: '운용',
    desc: '본사 관제센터에서 위성과 교신하고 촬영 계획을 수립합니다.',
  },
] as const;

// ── 사례: Santa Rosa Island 산불 (Muon Space FireSat 발표 페이지식 긴 캡션) ─────────────────────────────

export const CASE_FRAMES = [
  {
    src: '/climate/santa-rosa-before.jpg',
    alt: '화재 전 2026년 4월 20일 산타로사섬 위성영상',
    date: '2026.04.20',
    tag: '화재 전',
    caption: '캘리포니아 채널 제도 국립공원의 산타로사섬. 섬 전체가 초지와 관목으로 덮여 있고 구름 일부가 섬 가운데에 걸려 있습니다.',
  },
  {
    src: '/climate/santa-rosa-after.jpg',
    alt: '화재 후 2026년 6월 9일 산타로사섬 위성영상',
    date: '2026.06.09',
    tag: '화재 후',
    caption: '5월 15일 섬 남동부에서 시작된 산불은 강풍을 타고 번졌고 6월 4일에야 진화됐습니다. 섬 동쪽 절반이 짙은 갈색으로 그을린 모습이 그대로 보입니다.',
  },
  {
    src: '/climate/santa-rosa-severity.jpg',
    alt: '화재 전후 영상으로 계산한 dNBR 피해 등급 오버레이',
    date: '04.20 → 06.09',
    tag: '피해 등급 (dNBR)',
    caption: '화재 전후 영상의 근적외선·단파적외선 반사 차이로 연소 강도를 계산했습니다. 색이 진할수록 고강도 피해입니다. 섬 면적의 약 3분의 1인 7,428.8 ha가 탔고, 그중 2,480.1 ha가 고강도 피해입니다.',
  },
] as const;

// ── 로드맵 ─────────────────────────────

export const ROADMAP = [
  { when: '2026 4분기', title: '경기샛-2A 정상 운용 전환', desc: '본체·탑재체 점검과 검보정을 마친 뒤 메탄 관측을 시작합니다.' },
  { when: '2027', title: '경기샛-2B 발사', desc: '2A와 함께 같은 지역을 더 자주 관측합니다.' },
  { when: '2027~', title: '경기기후플랫폼 연계', desc: '경기샛 관측·분석 데이터를 경기기후플랫폼에 축적해 도민과 행정에 제공합니다.' },
  { when: '구축 중', title: 'NarSha 메탄 군집', desc: '같은 플랫폼으로 위성을 늘려 국내외 배출원을 더 자주 관측합니다.' },
] as const;

// ── 심층 글 (Muon Space 발표 페이지처럼 원리·맥락을 풀어 쓴 긴 글) ─────────────────────────────

export type ArticleBlock =
  | { type: 'h'; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string; cite: string }
  | { type: 'formula'; lines: string[]; caption: string }
  | { type: 'note'; text: string };

export interface DeepDive {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  blocks: ArticleBlock[];
}

export const METHANE_DEEP_DIVE: DeepDive = {
  id: 'methane-story',
  eyebrow: '자세히 보기',
  title: '남의 눈으로 보던 메탄을, 이제 우리 위성으로',
  intro:
    '경기샛-2A가 왜 필요했는지, 어떤 원리로 메탄을 찾는지, 지금은 어느 단계에 와 있는지 정리했습니다.',
  blocks: [
    { type: 'h', text: '원하는 날, 원하는 곳을 볼 수 없었습니다' },
    {
      type: 'p',
      text: '해외에서는 10년 전부터 위성으로 메탄을 관측해 왔습니다. 캐나다 GHGSat은 2016년부터 위성 군집을 늘려 가며 시설 단위 누출을 찾고 있고, 2024년에는 미국 Carbon Mapper 연합의 Tanager-1이 궤도에 올랐습니다. 국내는 이제 막 자체 관측 수단을 갖추기 시작한 단계입니다.',
    },
    {
      type: 'p',
      text: '해외 위성 데이터를 사서 쓸 수도 있습니다. 하지만 언제 어디를 찍을지 정할 수 없고, 같은 곳을 얼마나 자주 볼지도 조절할 수 없습니다. 급한 상황에 데이터를 제때 받는다는 보장도 없습니다. 경기샛-2A는 이 공백을 메우려고 만든 위성입니다.',
    },
    { type: 'h', text: '1665.6 nm, 메탄이 흔적을 남기는 파장' },
    {
      type: 'p',
      text: '햇빛은 지표에 반사돼 위성으로 돌아오기까지 대기를 두 번 지납니다. 그 사이 메탄은 단파적외선 가운데 몇몇 파장만 골라 흡수합니다. 눈으로는 아무 차이가 없지만, 빛을 아주 잘게 나눠 보면 그 파장에서만 신호가 움푹 꺼져 있습니다.',
    },
    {
      type: 'p',
      text: '경기샛-2A의 초분광 센서는 1625–1670 nm 구간을 150개 채널, 0.6 nm 간격으로 나눠 봅니다. 신호가 꺼진 깊이를 재면 공기 중 메탄이 얼마나 많은지 계산할 수 있고, 정밀도는 50 ppb 수준입니다. 발사 전 항공시험에서 이 센서는 1665.6 nm 메탄 흡수선을 처음으로 잡아냈습니다.',
    },
    { type: 'h', text: '농도 지도에서 배출 시설로' },
    {
      type: 'p',
      text: '메탄 농도 지도만으로는 누가 내보냈는지 알 수 없습니다. 그래서 경기샛-2A는 단파적외선과 함께 12.5 m 가시광 영상도 찍습니다. 메탄 플룸을 가시광 영상 위에 겹치면 플룸이 시작되는 지점이 어느 공장, 어느 매립지인지 확인할 수 있습니다.',
    },
    {
      type: 'p',
      text: '아시아의 산업단지는 시설이 촘촘하게 붙어 있습니다. 해상도가 낮으면 이웃한 시설 여러 곳의 배출이 하나로 뭉쳐 보입니다. 시설 단위로 나눠 볼 수 있는 해상도가 중요한 이유입니다.',
    },
    { type: 'h', text: '바다 위 시설은 수면 반사를 이용합니다' },
    {
      type: 'p',
      text: '물은 단파적외선을 대부분 흡수해서 위성에서 보면 거의 검게 나옵니다. 돌아오는 빛이 적으니 메탄 신호도 읽기 어렵습니다. 해상 플랫폼을 관측할 때는 위성 자세를 틀어 햇빛이 수면에 거울처럼 반사되는 방향을 겨냥합니다. NarSha의 Offshore Glint Mode가 이 방식입니다.',
    },
    { type: 'h', text: '지금은 검보정 중입니다' },
    {
      type: 'p',
      text: '10월 2일 발사된 경기샛-2A는 본체와 탑재체를 점검하고 센서를 보정하는 초기 운영 단계에 있습니다. 보정을 마치면 정상 운용으로 전환해 경기도 산업단지와 발전소, 매립지의 메탄을 관측합니다. 데이터는 분광 데이터부터 배출량 추정치까지 단계별 산출물(L1·L2·L4)로 만들어집니다.',
    },
    {
      type: 'quote',
      text: '“온실가스 모니터링은 기후변화 대응을 위한 과학적 근거를 제공하는 것을 넘어 국가와 기업, 지자체의 에너지 현황을 파악하는 에너지 안보의 핵심 인프라로 역할이 바뀌어 가고 있다”',
      cite: '정수종 · 서울대학교 기후연구실 교수',
    },
    {
      type: 'note',
      text: '경기기후위성 사업은 경기도, 나라스페이스, 서울대학교 기후연구실이 함께 추진합니다. 메탄 관측 탑재체는 폴란드 Scanway와 협력해 개발했습니다.',
    },
  ],
};

export const FIRE_DEEP_DIVE: DeepDive = {
  id: 'dnbr-story',
  eyebrow: '자세히 보기',
  title: '불탄 땅은 빛을 다르게 반사합니다',
  intro: '위 사례의 피해 등급이 어떻게 계산됐는지 풀어 봤습니다.',
  blocks: [
    {
      type: 'p',
      text: '건강한 식물은 근적외선을 강하게 반사하고 단파적외선은 덜 반사합니다. 불이 지나가면 반대가 됩니다. 잎이 사라져 근적외선 반사가 떨어지고, 드러난 흙과 재 때문에 단파적외선 반사는 올라갑니다.',
    },
    {
      type: 'formula',
      lines: ['NBR = (NIR − SWIR) ÷ (NIR + SWIR)', 'dNBR = NBR(화재 전) − NBR(화재 후)'],
      caption: 'NIR: 근적외선 반사율 · SWIR: 단파적외선 반사율',
    },
    {
      type: 'p',
      text: '이 차이를 숫자 하나로 나타낸 것이 NBR(정규화 연소 지수)입니다. 화재 전 NBR에서 화재 후 NBR을 빼면 dNBR이 되고, 값이 클수록 피해가 심합니다. EP Agent는 dNBR 값을 구간으로 나눠 고강도·중강도·저강도로 색을 입힙니다.',
    },
    {
      type: 'p',
      text: '구름은 계산을 흔드는 가장 큰 변수입니다. 산타로사섬의 6월 9일 영상도 섬 북쪽에 구름이 걸려 있었습니다. 구름이 낀 픽셀은 반사값이 왜곡되기 때문에 따로 걸러 내야 합니다.',
    },
    {
      type: 'p',
      text: '같은 원리를 다른 재난에도 씁니다. 홍수는 물에 민감한 지수로 침수 범위를 찾고, 산림의 건조 정도는 NDMI로 봅니다. EP Post의 전남 광양 산불 분석은 NDMI와 dNBR을 함께 썼습니다.',
    },
  ],
};

// ── 토지 변화 (경기샛-1 · Observer-1A) ─────────────────────────────

export const LAND_USES = [
  { title: '벼 재배지 모니터링', desc: '벼 재배지의 위치와 면적을 계절마다 확인합니다.' },
  { title: '개발제한구역 변화', desc: '개발제한구역의 불법 훼손과 휴경지를 찾아냅니다.' },
  { title: '토지 이용 현황', desc: '도시 밀집 지역과 녹지, 항만과 해안선 구조를 구분합니다.' },
  { title: '홍수 · 산사태 피해', desc: '같은 지역을 반복 촬영해 피해 범위와 복구 진행 상황을 추적합니다.' },
] as const;

export const LAND_FACTS = [
  { value: '1.5', unit: 'm', label: '공간해상도' },
  { value: '14×40', unit: 'km', label: '1회 촬영 범위' },
  { value: '500', unit: 'km', label: '촬영 고도' },
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
    title: '150개 채널 분광',
    desc: '단파적외선(SWIR) 1625–1670 nm 구간을 150개 채널, 0.6 nm 간격으로 분해해 관측합니다.',
  },
  {
    num: '02',
    title: '메탄 흡수 파장 분석',
    desc: '메탄은 특정 파장의 빛만 흡수합니다. 이 흡수 깊이로 농도를 계산하며 정밀도는 50 ppb입니다.',
  },
  {
    num: '03',
    title: '배출 시설 특정',
    desc: '메탄 플룸을 함께 촬영한 12.5 m 가시광 영상에 겹쳐 배출 시설을 특정하고 시간당 배출량을 추정합니다.',
  },
] as const;

export const METHANE_ADVANTAGES = [
  {
    title: '시설 단위 탐지',
    desc: '시간당 100 kg 수준의 국지적 배출까지 탐지합니다. 넓게 퍼진 메탄 구름 속에서 의심 시설 한 곳을 가려냅니다.',
  },
  {
    title: '간헐적 누출 포착',
    desc: '군집 운용으로 같은 지역을 하루 최대 5회까지 관측하는 것이 목표입니다. 일시적으로 새다가 멈추는 누출까지 잡아냅니다.',
  },
  {
    title: '도시부터 해상 플랫폼까지',
    desc: '복잡한 산업단지와 기존 위성으로는 관측이 어려운 해상 플랫폼까지 관측 모드를 바꿔 가며 모니터링합니다.',
  },
  {
    title: '바로 쓰는 분석 데이터',
    desc: '위성에서 바로 구름을 걸러내고 압축해 지상으로 보냅니다. 원본 영상 대신 분석 결과와 리포트 형태로 받아 보실 수 있습니다.',
  },
] as const;

export const METHANE_INDUSTRIES = [
  {
    id: 'energy',
    title: '석유 · 가스 · 에너지',
    problem: '넓게 퍼진 파이프라인과 설비에서 누출이 생기면 제품이 손실되고 규제 위험도 커집니다.',
    solution: '파이프라인, 벤팅, 플레어링 누출을 조기에 발견하고 반복 관측으로 규제 기한 안에 보수할 수 있도록 지원합니다.',
  },
  {
    id: 'gov',
    title: '지자체 · 스마트시티',
    problem: '탄소중립을 선언해도 복잡한 도시와 산업단지의 실제 배출량은 기존 데이터만으로 정확히 파악할 수 없습니다.',
    solution: '경기샛-2A·2B로 도시 규모 배출을 직접 관측해 독립적인 MRV 데이터를 생산합니다.',
  },
  {
    id: 'finance',
    title: '금융 · ESG 투자',
    problem: '기업이 스스로 공시한 숫자만으로는 실제 환경 위험을 가늠하는 데 한계가 있습니다.',
    solution: '제3자 위성 데이터로 실제 배출을 검증하고 전 세계 가스 시설의 가동 변화를 앞서 파악합니다.',
  },
  {
    id: 'waste',
    title: '폐기물 · 매립지',
    problem: '매립지 메탄은 민원과 규제 위험의 원인이 되며 기온과 날씨에 따라 계속 달라집니다.',
    solution: '매립지 안에서 메탄이 집중되는 구역을 찾아 포집 효율을 높이고 연중 변화를 추적합니다.',
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
export const CLIMATE_SECTIONS = [
  { id: 'satellites', label: '위성' },
  { id: 'methane', label: '메탄 모니터링' },
  { id: 'agent', label: '재난 대응' },
  { id: 'land', label: '토지 변화' },
  { id: 'posts', label: '분석 사례' },
  { id: 'dashboards', label: '기후 지도' },
  { id: 'next', label: '로드맵' },
] as const;

export const SOLUTIONS = [
  {
    id: 'methane',
    title: '메탄 · 온실가스 MRV',
    desc: '산업단지, 발전소, 매립지에서 나오는 메탄을 시설 단위로 찾아내 배출량을 측정합니다. 통계 추정 대신 위성 관측값으로 검증합니다.',
    link: { label: '경기샛-2A 보기', href: '#methane' },
  },
  {
    id: 'disaster',
    title: '기후재난 대응',
    desc: '산불, 홍수, 산사태가 발생하면 해당 지역을 즉시 촬영하고 AI가 피해 범위와 심각도를 산출합니다.',
    link: { label: 'EP Agent 보기', href: '#agent' },
  },
  {
    id: 'forest',
    title: '산림 · 토지 변화',
    desc: '산림 같은 탄소흡수원과 벼 재배지, 휴경지의 변화를 모니터링하고 개발제한구역 불법 훼손을 찾아냅니다.',
    link: { label: '토지 변화 보기', href: '#land' },
  },
  {
    id: 'platform',
    title: '지자체 기후 플랫폼',
    desc: '관측과 분석 결과를 지자체 기후 플랫폼에 축적합니다. 도민은 우리 동네 기후 정보를 확인하고 행정은 이를 정책 근거로 활용합니다.',
    link: { label: '기후 지도 보기', href: '#dashboards' },
  },
] as const;

export const AGENT_STEPS = [
  {
    num: '01',
    title: '질문 즉시 분석',
    desc: '화재 전후 영상을 찾아 dNBR로 피해 면적과 심각도를 계산하고 결과를 지도 위에 겹쳐 표시합니다.',
    image: '/proposals/agent-tutorial/step2-result.png',
    alt: 'EP Agent 채팅에서 산불 피해 분석 결과와 전후 비교 지도가 표시된 화면',
  },
  {
    num: '02',
    title: '보고서 자동 작성',
    desc: '사건 배경, 피해 현황, 심각도 분포를 담은 분석 아티클을 작성하고 PDF 다운로드를 지원합니다.',
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
    desc: '시계열 비교로 불탄 범위와 확산 경로를 산출했습니다.',
    location: 'California, USA',
    thumbnail: `${S3}/54/Thumbnail-santa-rosa-island-wildfire-satellite-analysis.png`,
    href: `${EP}/santa-rosa-island-wildfire-satellite-analysis`,
  },
  {
    id: 'patagonia',
    category: 'wildfire',
    title: '2026 파타고니아 산불 피해 분석 (64,468ha)',
    desc: 'dNBR로 피해 등급을 구분하고 확산 속도를 측정했습니다.',
    location: 'Patagonia, Chile',
    thumbnail: `${S3}/39/Thumbnail-2026-patagonia-wildfire-damage-analysis-64468ha-satellite-severity-spread-rate.png`,
    href: `${EP}/2026-patagonia-wildfire-damage-analysis-64468ha-satellite-severity-spread-rate`,
  },
  {
    id: 'gwangyang',
    category: 'wildfire',
    title: '2026 전남 광양 산불 분석 (NDMI, dNBR)',
    desc: '피해 범위와 산림 건조 정도를 지수로 분석했습니다.',
    location: '전남 광양시',
    thumbnail: `${S3}/33/Thumbnail-2026-gwangyang-wildfire-ndmi-dnbr-analysis.png`,
    href: `${EP}/2026-gwangyang-wildfire-ndmi-dnbr-analysis`,
  },
  {
    id: 'jamaica',
    category: 'flood',
    title: '자메이카 홍수 피해 위성영상 분석',
    desc: '통신과 도로가 끊긴 지역의 피해 면적을 분석하고 복구 순서를 제시했습니다.',
    location: 'Jamaica',
    thumbnail: `${S3}/46/Thumbnail-disaster-impact-jamaica-flood-damage-satellite-imagery.png`,
    href: `${EP}/disaster-impact-jamaica-flood-damage-satellite-imagery`,
  },
  {
    id: 'akosombo',
    category: 'flood',
    title: '가나 Akosombo 댐 방류 및 Volta강 홍수 확산 분석',
    desc: '긴급 방류 이후 강 유역의 침수 범위를 추적했습니다.',
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
    desc: '경기기후플랫폼 데이터로 읍면동 600곳의 공원 접근성을 분석합니다.',
  },
  {
    href: '/seoul',
    label: '서울 도시 기후 대시보드',
    desc: '초미세먼지, 대기환경지수, S-DoT 기온을 실시간으로 확인합니다.',
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
