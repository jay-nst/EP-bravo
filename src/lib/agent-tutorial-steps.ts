// Agent 튜토리얼 제안 데모 — 스텝 스펙 (실구현 핸드오프 원형)
// 정본 설계: docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md
//
// 이 파일이 곧 실구현 driver.js 설정의 원형이다. 승인 시 개발팀이 이 스펙을
// 실서비스 DOM 셀렉터로 치환해 그대로 구현한다.
//
// hotspot 좌표계: 캡쳐 원본(1600×1000) 대비 % 단위 — 캡쳐는 aspect-ratio 고정
// 컨테이너에 렌더링하고 핫스팟 div 는 % 절대배치로 스케일을 추종한다.
//
// 캡쳐: 2026-09-28 agent.ep.naraspace.com/ko 실화면 (1600×1000 viewport).
// 산타로사섬 산불 분석(2026-05) 완료 대화 기준. 개인정보(대화 목록·계정 아바타)는
// DOM 블러 처리 후 캡쳐했다. step1 은 비로그인 상태 원본.
// step2 와 step3 은 같은 캡쳐(결과 카드 + 지도)를 쓰고 하이라이트만 다르다.

export type TutorialAction = 'click' | 'next';

/** driver.js 팝오버 위치 지정 (미지정 시 driver 자동 배치) */
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface TutorialHotspot {
  /** 좌상단 x (%) */
  x: number;
  /** 좌상단 y (%) */
  y: number;
  /** 너비 (%) */
  w: number;
  /** 높이 (%) */
  h: number;
}

/** 로딩 연출 프레임 — 실제 대화의 해당 시점 화면을 그대로 캡쳐한 것 */
export interface TutorialLoadingFrame {
  capture: string;
  /** 이 프레임을 표시할 시간 (ms) */
  ms: number;
}

/**
 * 스텝 진행 직후 재생되는 로딩 연출.
 * 별도 UI 를 만들지 않고, 실제 대화가 차오르는 화면 캡쳐를 순서대로 전환한다
 * (실서비스의 수 분짜리 분석 대기를 수 초로 압축).
 */
export interface TutorialLoading {
  frames: TutorialLoadingFrame[];
}

/**
 * 분석 시작 채팅 시뮬레이션 — 실서비스의 응답 생성 연출을 재현:
 * 유저 버블 → 마스코트(좌우 흔들림) + 말풍선에 글자가 타이핑 스트리밍 →
 * "분석 중" 대기 표시. 채팅 컬럼 영역만 DOM 으로 덮고 나머지는 background 캡쳐.
 */
export interface TutorialChatSim {
  /** 시뮬레이션 배경 캡쳐 (사이드바·지도·입력창은 이 캡쳐가 보인다) */
  background: string;
  /** 우측 정렬 유저 버블 문구 (실제 대화의 사용자 메시지) */
  userMessage: string;
  /** 타이핑 스트리밍으로 표시되는 에이전트 메시지들 (실제 대화 문구) */
  agentMessages: string[];
  /** 마지막 대기 상태 말풍선 문구 */
  pendingLabel: string;
}

/** 마스코트 이미지 — step1 캡쳐에서 크롭 (배경색 CHAT_BG 포함) */
export const MASCOT_SRC = `/proposals/agent-tutorial/mascot.png`;

/** 실캡쳐에서 픽셀 실측한 채팅 색상 (loading-1.png) */
export const CHAT_COLORS = {
  bg: '#101f2f',
  userBubble: '#dbe4c8',
  userText: '#17222f',
  agentText: '#e7ebef',
} as const;

export interface HighlightStep {
  id: string;
  type: 'highlight';
  capture: string;
  hotspot: TutorialHotspot;
  title: string;
  body: string;
  /** 'click' = 실제 UI 요소를 클릭해야 진행, 'next' = 말풍선의 다음 버튼 */
  action: TutorialAction;
  /** 이 스텝에서 다음으로 넘어갈 때 재생할 로딩 연출 (정적 캡쳐 프레임 전환) */
  loadingAfter?: TutorialLoading;
  /** 이 스텝에서 다음으로 넘어갈 때 재생할 채팅 시뮬레이션 (타이핑 스트리밍) */
  loadingChat?: TutorialChatSim;
  /**
   * 진행 클릭 대상이 하이라이트 영역과 다를 때 — 실제 UX 의 버튼 위치.
   * 지정하면 이 영역이 오버레이 위에 밝게 떠서 클릭을 받는다 (hotspot 클릭은 무시).
   */
  advanceHotspot?: TutorialHotspot;
  /** 진행 클릭 대상의 실제 버튼 라벨 (말풍선 안내문에 쓰인다) */
  advanceLabel?: string;
  /** 핫스팟 안에 렌더링할 인터랙티브 위젯 */
  widget?: 'compare' | 'article';
  /**
   * 팝오버(말풍선)를 다음 액션 대상 가까이에 붙이기 위한 위치 지정
   * (2026-09-28 피그마 디자인 리뷰: 툴팁이 다음 액션과 떨어져 있으면 놓친다)
   */
  popoverSide?: PopoverSide;
  popoverAlign?: PopoverAlign;
}

export interface ModalStep {
  id: string;
  type: 'modal';
  title: string;
  body: string;
}

export type TutorialStep = HighlightStep | ModalStep;

export const CAPTURE_WIDTH = 1600;
export const CAPTURE_HEIGHT = 1000;
export const CAPTURE_BASE = '/proposals/agent-tutorial';

// 스텝 3-5 기능 선정: 화재 전·후 비교, 심각도 분류, 불투명도(→ 스텝 3 지도 묶음),
// 분석 아티클(→ 스텝 4-5). 사용자 결정 2026-09-28 — 4개 기능을 화면 위치 기준으로 묶는다.
// 2026-09-28 피그마 디자인 리뷰 반영: 스텝 3(지도 비교)에서 '분석 아티클 보기'가
// 강조되면 비교 기능을 쓰지 않고 지나친다 → 지도 체험(next 진행)과 아티클 열기
// (버튼 하이라이트 클릭)를 별도 스텝으로 분리. 소프트 상한(설계문서 §플로우, 초과
// 가능)에 따라 총 6스텝.
export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'cold-start-input',
    type: 'highlight',
    capture: `${CAPTURE_BASE}/step1-home.png`,
    // 산타로사섬 예시 칩만 하이라이트 — 라이브 DOM 실측 (284,768,351,32) + 패딩
    hotspot: { x: 17.5, y: 76.4, w: 22.4, h: 4 },
    title: '무엇을 물어볼지 막막하다면',
    body: "분석할 산불 지역과 시기만 입력하면 됩니다. '산타로사섬 산불 피해 보고서' 예시를 클릭해 보세요.",
    action: 'click',
    // 실서비스 응답 생성 연출 재현: 유저 버블 → 마스코트 흔들림 + 타이핑 스트리밍
    // → "분석 중" 대기 → (스텝 2) 분석 완료. 문구는 실제 대화 그대로.
    loadingChat: {
      background: `${CAPTURE_BASE}/loading-1.png`,
      userMessage: '산타로사섬 올해 산불 분석해줘',
      agentMessages: [
        '먼저 산타로사섬의 위치와 올해 발생한 산불 정보를 함께 확인하겠습니다.',
        '분석용 화재 전·후 영상을 찾았습니다. 분석을 시작합니다. 영역이 넓어 보통 몇 분에서 최대 10분 가까이 걸릴 수 있습니다. 잠시만 기다려 주세요.',
      ],
      pendingLabel: '분석 중',
    },
  },
  {
    id: 'analysis-result',
    type: 'highlight',
    // 지도 레이어를 켜기 전 상태 — '지도에서 보기' 클릭이 실제 UX 그대로 스텝 3으로 이어진다
    capture: `${CAPTURE_BASE}/step2-premap.png`,
    hotspot: { x: 20.5, y: 10.5, w: 19.5, h: 36 },
    title: '질문 하나로 위성 분석까지',
    body: 'Agent가 화재 전·후 위성영상을 찾아 피해 면적을 자동 산출합니다. 총 피해 면적 7,428.8ha와 심각도 분포가 카드로 정리됐습니다.',
    action: 'click',
    // 실측 (556,118,64,16) + 클릭 패딩
    advanceHotspot: { x: 34.1, y: 10.6, w: 5.5, h: 3.4 },
    advanceLabel: '지도에서 보기',
  },
  {
    id: 'map-compare',
    type: 'highlight',
    capture: `${CAPTURE_BASE}/step2-result.png`,
    // 지도 영역 실측 (660,56,940,944 / 1600×1000) — 비교 위젯이 이 영역을 정확히 덮는다
    hotspot: { x: 41.25, y: 5.6, w: 58.75, h: 94.4 },
    title: '지도에서 화재 전·후 비교',
    body: '슬라이더를 직접 움직여 화재 전·후를 비교해 보세요. 좌측 하단 패널에서 심각도(상·중·하) 오버레이의 불투명도도 직접 조절할 수 있습니다.',
    // 리뷰 반영: 아티클 버튼을 같이 강조하면 비교 기능을 안 쓰고 지나친다 —
    // 이 스텝은 지도 체험에 집중하고 '다음' 버튼으로만 진행한다
    action: 'next',
  },
  {
    id: 'open-article',
    type: 'highlight',
    capture: `${CAPTURE_BASE}/step2-result.png`,
    // '분석 아티클 보기' 버튼 실측 (332,791,134,32) + 클릭 패딩 — 버튼 자체를 하이라이트
    hotspot: { x: 20.4, y: 78.5, w: 9.2, h: 4.4 },
    title: '분석 결과를 보고서로',
    body: '방금 본 분석은 완성된 보고서로도 정리됩니다. 채팅 하단의 버튼을 눌러 열어 보세요.',
    action: 'click',
    advanceLabel: '분석 아티클 보기',
    // 리뷰 반영: 툴팁은 버튼 바로 위에 붙인다 (다음 액션 근처 배치 원칙)
    popoverSide: 'top',
    popoverAlign: 'start',
    // 실제 아티클 로딩 화면 ("분석 아티클을 불러오는 중...") — 짧게 재생
    loadingAfter: {
      frames: [{ capture: `${CAPTURE_BASE}/article-loading.png`, ms: 1000 }],
    },
  },
  {
    id: 'analysis-article',
    type: 'highlight',
    capture: `${CAPTURE_BASE}/step4-article.png`,
    // 아티클 iframe 영역 실측 (250,97,1100,879) — 이 영역이 실제로 스크롤된다
    hotspot: { x: 15.625, y: 9.7, w: 68.75, h: 87.9 },
    title: '보고서는 분석 아티클로',
    body: '분석 결과가 완성된 보고서로 정리됩니다. 스크롤로 살펴보고, 다 봤으면 PDF로 저장해 보세요.',
    action: 'click',
    widget: 'article',
    // 실측 (1174,44,96,32) + 클릭 패딩
    advanceHotspot: { x: 72.9, y: 3.8, w: 6.8, h: 4.4 },
    advanceLabel: 'PDF 저장',
    // 리뷰 반영: 툴팁을 하이라이트된 'PDF 저장' 버튼 근처 오른쪽에 배치
    popoverSide: 'right',
    popoverAlign: 'start',
  },
  {
    id: 'signup',
    type: 'modal',
    title: '진짜 데이터로 써볼 준비가 되셨나요?',
    body: '지금 본 산불 피해 분석을 실제 위성 데이터로 그대로 실행할 수 있습니다. 회원가입하면 바로 시작됩니다.',
  },
];

// 전·후 비교 위젯 자산 — 지도 영역(940×944)만 슬라이더 양 극단에서 클립 캡쳐한 것.
// 화재 후는 심각도 오버레이 0%/100% 두 장을 겹쳐 불투명도 조절을 실동작으로 재현한다:
// base + (sev100 × CSS opacity o) = 실서비스 raster-opacity o 와 동일한 합성.
export const COMPARE_ASSETS = {
  before: `${CAPTURE_BASE}/map-before.png`,
  afterBase: `${CAPTURE_BASE}/map-after-clean.png`,
  severity: `${CAPTURE_BASE}/map-after-sev100.png`,
  beforeLabel: '화재 전 2026-04-20',
  afterLabel: '화재 후 2026-06-09',
} as const;

// '산불 피해 보기' 패널 — 실캡쳐 픽셀 실측 (map-after.png, 지도 크롭 940×944 기준 %).
// 불투명도 슬라이더를 직접 조작할 수 있도록 DOM 으로 재현한다.
export const DAMAGE_PANEL = {
  /** 지도 영역(스텝3 핫스팟) 기준 % 위치 */
  rect: { x: 4.26, y: 78.6, w: 25.85, h: 18.75 },
  colors: {
    bg: '#101f2f',
    thumb: '#35d9c0',
    high: '#550000',
    mid: '#ff6000',
    low: '#fdc160',
  },
  /** 실서비스 기본 불투명도 (%) */
  defaultOpacity: 80,
} as const;

// 분석 아티클 위젯 자산 — 아티클 문서(1100×3598)를 원본 해상도 세그먼트로 나눈 것.
// 스텝 4 핫스팟(아티클 영역) 안에서 세로로 이어 붙여 실제처럼 스크롤한다.
export const ARTICLE_ASSETS = {
  segments: [
    `${CAPTURE_BASE}/article-seg-0.png`,
    `${CAPTURE_BASE}/article-seg-1.png`,
    `${CAPTURE_BASE}/article-seg-2.png`,
    `${CAPTURE_BASE}/article-seg-3.png`,
  ],
} as const;

export const HIGHLIGHT_STEPS = TUTORIAL_STEPS.filter(
  (s): s is HighlightStep => s.type === 'highlight',
);

export const MODAL_STEP = TUTORIAL_STEPS.find(
  (s): s is ModalStep => s.type === 'modal',
);

// ---------------------------------------------------------------------------
// Clarity 수치 (최근 30일 기준 — 아직 미확보, 입력 대기)
// value 가 null 이면 페이지에서 "수치 입력 대기" placeholder 로 렌더링한다.
// 지어낸 수치를 절대 넣지 않는다 — 실측값 확보 후 이 파일만 갱신하면 된다.
// exposed: 도입부 노출 여부. 나머지는 실구현 효과 측정 베이스라인용.
// ---------------------------------------------------------------------------

export interface ClarityMetric {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  exposed: boolean;
}

export const CLARITY_METRICS: ClarityMetric[] = [
  { id: 'first-screen-exit', label: '첫 화면 이탈률', value: null, unit: '%', exposed: true },
  { id: 'avg-dwell', label: '평균 체류 시간', value: null, unit: '초', exposed: true },
  { id: 'visit-signup', label: '방문 → 가입 전환율', value: null, unit: '%', exposed: false },
];

// ---------------------------------------------------------------------------
// 아웃트로 — 승인 후 실구현의 성공 지표 (Success Criteria 2차)
// ---------------------------------------------------------------------------

export interface SuccessMetric {
  label: string;
  target: string;
  note: string;
}

export const SUCCESS_METRICS: SuccessMetric[] = [
  {
    label: '첫 화면 이탈률',
    target: '감소',
    note: 'Clarity 최근 30일 수치를 베이스라인으로 측정',
  },
  {
    label: '튜토리얼 완주율',
    target: '≥ 38%',
    note: '3-5스텝 인터랙티브 투어 벤치마크 완주율',
  },
  {
    label: '비로그인 → 가입 전환율',
    target: '신규 측정',
    note: '튜토리얼 가입 모달 경유 전환 퍼널',
  },
];

// 투어 완주율 벤치마크 (2026) — 스텝 수가 완주율을 지배한다는 근거.
export const BENCHMARK_COMPLETION: { steps: string; rate: number }[] = [
  { steps: '1-2스텝', rate: 73 },
  { steps: '3-5스텝', rate: 38 },
  { steps: '6-8스텝', rate: 25 },
  { steps: '9스텝+', rate: 8 },
];
