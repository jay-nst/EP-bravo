// Sample data for Sprint B content pages
// Replace with real API/DB data when backend is ready

export interface DailyEarthItem {
  id: string;
  date: string;
  title: string;
  location: string;
  coordinates: string;
  description: string;
  imageUrl: string;
  satellite: string;
  resolution: string;
  category: string;
}

export interface PostItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  author: string;
  newsSource?: string; // 관련 뉴스 원본 링크 (자체 에디토리얼 기반)
  newsHeadline?: string; // 연관된 뉴스 헤드라인
}

export interface QuizItem {
  id: string;
  date: string;
  imageHint: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  location: string;
  coordinates: string;
}

export interface BeforeAfterItem {
  id: string;
  title: string;
  location: string;
  beforeDate: string;
  afterDate: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  description: string;
  changeType: string;
}

export const DAILY_EARTH: DailyEarthItem[] = [
  {
    id: 'de-20260626',
    date: '2026-06-26',
    title: '한강 잠실 일대의 여름',
    location: '서울특별시 송파구',
    coordinates: '37.5145° N, 127.1005° E',
    description:
      '장마 직전 한강 잠실대교 일대의 모습입니다. 올림픽공원과 석촌호수의 녹지가 선명하게 보이며, 잠실종합운동장의 지붕 구조가 25cm 해상도에서 또렷이 확인됩니다.',
    imageUrl: '/samples/daily-seoul.jpg',
    satellite: 'SpaceEye-T',
    resolution: '25cm',
    category: '도시',
  },
  {
    id: 'de-20260625',
    date: '2026-06-25',
    title: '제주 성산일출봉의 분화구',
    location: '제주특별자치도 서귀포시',
    coordinates: '33.4610° N, 126.9407° E',
    description:
      '유네스코 세계자연유산 성산일출봉의 분화구를 위에서 내려다본 모습입니다. 분화구 내부의 풀밭과 해안 절벽의 지질 구조가 잘 보입니다.',
    imageUrl: '/samples/daily-jeju.jpg',
    satellite: 'SpaceEye-T',
    resolution: '25cm',
    category: '자연',
  },
  {
    id: 'de-20260624',
    date: '2026-06-24',
    title: '인천항 컨테이너 터미널',
    location: '인천광역시 중구',
    coordinates: '37.4500° N, 126.6000° E',
    description:
      '인천항 신항의 컨테이너 야적장입니다. 수천 개의 컨테이너 배치 패턴과 크레인의 그림자가 오후 2시의 태양 고도를 알려줍니다.',
    imageUrl: '/samples/daily-incheon.jpg',
    satellite: 'Observer',
    resolution: '1.5m',
    category: '인프라',
  },
  {
    id: 'de-20260623',
    date: '2026-06-23',
    title: '새만금 간척지의 태양광 단지',
    location: '전라북도 군산시',
    coordinates: '35.7900° N, 126.6100° E',
    description:
      '새만금 방조제 안쪽에 조성된 대규모 태양광 발전 단지입니다. 패널 배열의 기하학적 패턴이 인상적입니다.',
    imageUrl: '/samples/daily-saemangeum.jpg',
    satellite: 'Observer',
    resolution: '1.5m',
    category: '에너지',
  },
  {
    id: 'de-20260622',
    date: '2026-06-22',
    title: '울릉도 나리분지',
    location: '경상북도 울릉군',
    coordinates: '37.5200° N, 130.8700° E',
    description:
      '화산 칼데라 안에 형성된 울릉도 나리분지의 농경지. 주변의 급경사 산림과 대조되는 평지가 독특한 지형을 보여줍니다.',
    imageUrl: '/samples/daily-ulleung.jpg',
    satellite: 'Observer',
    resolution: '1.5m',
    category: '자연',
  },
];

export const POSTS: PostItem[] = [
  {
    id: 'post-1',
    title: '장마 전선 북상: 위성이 포착한 구름 벽의 이동',
    summary:
      '올해 장마가 예년보다 2주 빠르게 북상 중입니다. Observer-1A가 촬영한 구름 패턴으로 전선의 실시간 이동 경로를 추적합니다.',
    category: '기상',
    date: '2026-06-25',
    readTime: '5분',
    imageUrl: '/samples/post-monsoon.jpg',
    author: 'EarthPaper 편집팀',
    newsHeadline: '기상청 "올해 장마 예년 대비 2주 조기 시작"',
  },
  {
    id: 'post-2',
    title: '폭염 시작: 서울 도심 열섬을 위성 열적외선으로 보다',
    summary:
      '서울에 첫 폭염특보가 발효됐습니다. 위성 열적외선 센서로 측정한 지표 온도 — 아스팔트 도로와 남산공원의 온도 차이가 15도에 달합니다.',
    category: '도시',
    date: '2026-06-23',
    readTime: '7분',
    imageUrl: '/samples/post-heatisland.jpg',
    author: 'Dr. 김정현',
    newsHeadline: '서울시 첫 폭염특보 발효, 체감 35도 이상',
  },
  {
    id: 'post-3',
    title: 'DMZ 두루미 서식지 확대: 위성으로 본 70년의 자연 회복',
    summary:
      'DMZ 생태 조사 결과 두루미 서식지가 10년 전 대비 23% 확대된 것으로 나타났습니다. 위성 영상으로 식생 변화를 확인합니다.',
    category: '환경',
    date: '2026-06-21',
    readTime: '8분',
    imageUrl: '/samples/post-dmz.jpg',
    author: 'EarthPaper 편집팀',
    newsHeadline: '환경부 "DMZ 두루미 서식지 10년간 23% 확대"',
  },
  {
    id: 'post-4',
    title: '가뭄 피해 확산: NDVI로 진단하는 전남 농경지 상태',
    summary:
      '전남 지역 가뭄이 심화되면서 벼 생육에 영향이 우려됩니다. 위성 NDVI 지수로 실제 작물 스트레스 정도를 측정합니다.',
    category: '농업',
    date: '2026-06-19',
    readTime: '10분',
    imageUrl: '/samples/post-agriculture.jpg',
    author: '박상우 연구원',
    newsHeadline: '전남 9개 시군 가뭄 주의보, 농작물 피해 우려',
  },
  {
    id: 'post-5',
    title: 'NarSha 위성군 발사 D-100: Observer에서 NarSha까지',
    summary:
      '100일 후 발사 예정인 NarSha 위성군의 기술 스펙과, Observer 위성 대비 어떤 변화를 가져올지 분석합니다.',
    category: '기술',
    date: '2026-06-17',
    readTime: '6분',
    imageUrl: '/samples/post-resolution.jpg',
    author: 'EarthPaper 편집팀',
  },
  {
    id: 'post-6',
    title: '3기 신도시 진척률: 왕숙·교산·창릉 위성 비교',
    summary:
      '국토교통부 상반기 보고에 맞춰, 3기 신도시 건설 현장을 월별 위성 영상으로 비교합니다. 가장 빠른 곳은?',
    category: '도시',
    date: '2026-06-15',
    readTime: '5분',
    imageUrl: '/samples/post-newtown.jpg',
    author: 'EarthPaper 편집팀',
    newsHeadline: '국토부 "3기 신도시 상반기 공정률 평균 34%"',
  },
];

export const BEFORE_AFTER: BeforeAfterItem[] = [
  {
    id: 'ba-1',
    title: '세종시 행정수도 건설 5년',
    location: '세종특별자치시',
    beforeDate: '2021-03',
    afterDate: '2026-03',
    beforeImageUrl: '/samples/ba-sejong-before.jpg',
    afterImageUrl: '/samples/ba-sejong-after.jpg',
    description: '농경지에서 행정수도로. 5년간의 도시 성장을 위성으로 기록합니다.',
    changeType: '도시화',
  },
  {
    id: 'ba-2',
    title: '강원도 산불 피해지 복구',
    location: '강원도 강릉시',
    beforeDate: '2024-04',
    afterDate: '2026-06',
    beforeImageUrl: '/samples/ba-fire-before.jpg',
    afterImageUrl: '/samples/ba-fire-after.jpg',
    description: '산불 직후의 황폐한 산림과 2년 후 복구된 식생의 대비.',
    changeType: '재해복구',
  },
  {
    id: 'ba-3',
    title: '새만금 방조제 태양광 단지 조성',
    location: '전라북도 군산시',
    beforeDate: '2022-01',
    afterDate: '2026-01',
    beforeImageUrl: '/samples/ba-solar-before.jpg',
    afterImageUrl: '/samples/ba-solar-after.jpg',
    description: '빈 간척지가 대규모 신재생에너지 단지로 변모한 과정.',
    changeType: '에너지',
  },
];

export const DAILY_QUIZZES: QuizItem[] = [
  {
    id: 'quiz-0',
    date: '2026-06-26',
    imageHint: '거대한 원형 분화구 안에 녹색 초원이 펼쳐져 있고, 주변은 급경사 산림으로 둘러싸여 있습니다. 분화구 직경은 약 500m.',
    question: '이 위성 영상은 어디일까요?',
    choices: ['한라산 백록담', '울릉도 나리분지', '백두산 천지', '제주 성산일출봉'],
    answer: 1,
    explanation: '울릉도 나리분지입니다. 화산 칼데라 안에 형성된 평지로, 주변의 급경사 산림과 대조되는 독특한 지형이 위성에서 선명하게 보입니다.',
    location: '경상북도 울릉군',
    coordinates: '37.52°N, 130.87°E',
  },
  {
    id: 'quiz-1',
    date: '2026-06-27',
    imageHint: '바다 위에 길이 33km의 직선 구조물이 놓여 있습니다. 구조물 안쪽으로 넓은 간척지와 태양광 패널 배열이 보입니다.',
    question: '이 거대한 해상 구조물은 무엇일까요?',
    choices: ['인천대교', '영종대교', '새만금 방조제', '시화호 조력발전소'],
    answer: 2,
    explanation: '새만금 방조제입니다. 세계 최장 33.9km의 방조제로, 위성에서 보면 서해안의 해안선을 완전히 바꾼 거대 구조물이 한눈에 들어옵니다.',
    location: '전라북도 군산시',
    coordinates: '35.79°N, 126.61°E',
  },
  {
    id: 'quiz-2',
    date: '2026-06-28',
    imageHint: '도심 한가운데 거대한 타원형 경기장이 보이고, 바로 옆에 석촌호수 두 개가 나란히 위치합니다. 한강이 북쪽으로 흐릅니다.',
    question: '이 도심 위성 영상의 중심은 어디일까요?',
    choices: ['여의도공원', '잠실종합운동장', '월드컵경기장', '수원 월드컵경기장'],
    answer: 1,
    explanation: '잠실종합운동장 일대입니다. 올림픽 주경기장의 독특한 타원형과 바로 남쪽의 석촌호수가 위성 영상에서 쉽게 식별되는 랜드마크입니다.',
    location: '서울특별시 송파구',
    coordinates: '37.51°N, 127.07°E',
  },
  {
    id: 'quiz-3',
    date: '2026-06-29',
    imageHint: '해안가 절벽 위에 솟아오른 거대한 원뿔형 봉우리. 정상에 그릇 모양의 분화구가 있고, 세 면이 바다로 둘러싸여 있습니다.',
    question: '바다 옆 이 화산 지형은 어디일까요?',
    choices: ['한라산', '울산바위', '성산일출봉', '독도'],
    answer: 2,
    explanation: '성산일출봉입니다. 제주 동쪽 끝에서 바다로 돌출된 수성화산으로, 위에서 보면 그릇 형태의 분화구가 매우 특징적입니다.',
    location: '제주특별자치도 서귀포시',
    coordinates: '33.46°N, 126.94°E',
  },
  {
    id: 'quiz-4',
    date: '2026-06-30',
    imageHint: '수백 개의 컨테이너가 색상별로 정렬된 거대한 야적장. 초대형 선박 3척이 접안해 있고, 갠트리 크레인의 그림자가 길게 드리워져 있습니다.',
    question: '이 항만 시설은 어디일까요?',
    choices: ['부산 신항', '인천항', '평택당진항', '광양항'],
    answer: 0,
    explanation: '부산 신항입니다. 한국 최대 컨테이너 항으로, 위성에서 보면 컨테이너의 색상 패턴과 대형 선박의 규모가 인상적입니다.',
    location: '경상남도 창원시',
    coordinates: '35.08°N, 128.93°E',
  },
  {
    id: 'quiz-5',
    date: '2026-07-01',
    imageHint: '한반도 남쪽 바다에 떠 있는 작은 섬 두 개. 서도는 뾰족한 봉우리, 동도는 평평한 분화구 형태. 주변에 작은 바위섬들이 흩어져 있습니다.',
    question: '이 두 섬은 어디일까요?',
    choices: ['마라도', '독도', '이어도', '백령도'],
    answer: 1,
    explanation: '독도입니다. 동도와 서도 두 개의 주요 섬으로 이루어져 있으며, 위성에서 보면 서도의 뾰족한 지형과 동도의 평탄한 정상부가 대조적입니다.',
    location: '경상북도 울릉군',
    coordinates: '37.24°N, 131.87°E',
  },
  {
    id: 'quiz-6',
    date: '2026-07-02',
    imageHint: '강 하구에 형성된 넓은 갯벌 위에 S자 형태의 수로가 나 있습니다. 밀물 때 물이 차오르며 갯벌의 패턴이 변합니다.',
    question: '이 갯벌 지형은 어디에 위치할까요?',
    choices: ['순천만', '강화도 갯벌', '서천 갯벌', '무안 갯벌'],
    answer: 0,
    explanation: '순천만 갯벌입니다. S자 형태의 수로와 갈대밭이 만드는 독특한 패턴은 세계적으로도 유명한 습지 경관으로, 위성에서 특히 아름답습니다.',
    location: '전라남도 순천시',
    coordinates: '34.88°N, 127.51°E',
  },
];

export const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: '도시', label: '도시' },
  { id: '환경', label: '환경' },
  { id: '기상', label: '기상' },
  { id: '농업', label: '농업' },
  { id: '기술', label: '기술' },
  { id: '인프라', label: '인프라' },
  { id: '에너지', label: '에너지' },
];
