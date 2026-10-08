// 위성영상 구매 튜토리얼 제안 데모 — 스텝 스펙 (실구현 핸드오프 원형)
// 정본 설계: docs/ORDER_TUTORIAL_PROPOSAL_DESIGN.md
// 구조는 Agent 튜토리얼(src/lib/agent-tutorial-steps.ts)과 같다. 다른 점은
// 첫 스텝에서 Archive / Tasking 으로 갈라지는 분기다.
//
// 좌표계: 캡쳐 원본(1600×1000) 대비 %. 핫스팟 px 값은 라이브 DOM
// getBoundingClientRect 실측 (2026-10-08, map.ep.naraspace.com/ko/order-imagery,
// 1600×1000 viewport, 비로그인).
//
// 캡쳐 시나리오
//  - Archive: 후쿠오카 도심 AOI 27.82 km² (GeoJSON 업로드로 지정) · 기간 2025.01.01–2026.10.08 ·
//    SpaceEye-T 2026.05.31 장면 (구름 0%, $15/km² → 프로모션 $10/km², 결제 금액 $278.20).
//    선택 후 지도에 깔린 영상은 실서비스가 보여 준 SpaceEye-T 미리보기 그대로다.
//  - Tasking: 후쿠오카 하카타항 지점. 궤도 조회 API 가 캡쳐 시점에
//    {"assignedOrbitInfoList":[]} 를 돌려줘 궤도 선택 이후 화면은 실서비스 번들
//    기준으로 DOM 재현한다 (widget 'tasking-*', 예시 일정 표시).

export type OrderTrack = 'archive' | 'tasking';
export type OrderStepAction = 'click' | 'next';
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left';
export type PopoverAlign = 'start' | 'center' | 'end';

export interface StageRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 실캡쳐 프레임 연속 전환 — 실서비스에서 사용자가 보게 되는 중간 화면 */
export interface CaptureFrame {
  capture: string;
  ms: number;
}

/**
 * 진행 직후 재생하는 DOM 연출.
 *  - draw-aoi: 사각형 영역이 그려지는 모습 (rect = 실캡쳐 속 AOI 위치).
 *    현재 캡쳐 위에서 재생한 뒤 다음 캡쳐로 넘어간다 (at 'before')
 *  - drop-pin: 지점 선택 핑 (rect 중심 = 다음 캡쳐 속 마커 위치).
 *    다음 캡쳐로 넘어간 뒤 그 위에서 재생한다 (at 'after')
 */
export interface StepEffect {
  /** sim-loading: Tasking 재현 레이어의 시뮬레이션 대기(스켈레톤 카드) — rect 미사용 */
  kind: 'draw-aoi' | 'drop-pin' | 'sim-loading';
  at: 'before' | 'after';
  rect: StageRect;
  ms: number;
}

/**
 * 실서비스가 지금 응답을 못 주는 Tasking 화면을 DOM 으로 재현하는 레이어의 모드.
 *  - orbits: 시뮬레이션 결과 궤도 목록
 *  - selected: 궤도 선택 + 하단 구매 바
 *  - sheet: 구매 시트 (안내 미동의, 결제하기 비활성)
 *  - agreed: 안내 동의 후 (결제하기 활성)
 * 레이어 안의 실제 컨트롤(궤도 카드·구매하기·체크박스·결제하기)이 진행을 맡는다.
 */
export type TaskingWidget = 'orbits' | 'selected' | 'sheet' | 'agreed';

export interface OrderHighlightStep {
  id: string;
  type: 'highlight';
  capture: string;
  hotspot: StageRect;
  title: string;
  body: string;
  action: OrderStepAction;
  /** 진행 클릭 대상이 하이라이트 영역 안의 특정 버튼일 때 (캡쳐 속 실제 위치) */
  advanceHotspot?: StageRect;
  /** 진행 클릭 대상의 실제 라벨 — 팝오버 안내문에 쓴다 */
  advanceLabel?: string;
  /** 진행 직후 DOM 연출 (프레임 전환보다 먼저 재생) */
  effect?: StepEffect;
  /** 진행 직후 재생할 실캡쳐 프레임 */
  framesAfter?: CaptureFrame[];
  /**
   * 하이라이트 밖이지만 함께 보여야 하는 캡쳐 영역 — 오버레이 위에 밝게 띄운다
   * (클릭은 받지 않는다). 예: 구매 바를 가리키면서 지도에 깔린 실제 영상도 보이게
   */
  spotlight?: StageRect;
  /** Tasking 재현 레이어 모드 — 지정하면 레이어 안의 컨트롤이 진행을 맡는다 */
  widget?: TaskingWidget;
  popoverSide?: PopoverSide;
  popoverAlign?: PopoverAlign;
}

export interface ChoiceOption {
  track: OrderTrack;
  label: string;
  /** 캡쳐 속 탭 위치 — 오버레이 위에 밝게 띄워 클릭을 받는다 */
  rect: StageRect;
}

export interface OrderChoiceStep {
  id: string;
  type: 'choice';
  capture: string;
  hotspot: StageRect;
  title: string;
  body: string;
  options: ChoiceOption[];
}

export interface OrderModalStep {
  id: string;
  type: 'modal';
  title: string;
  body: string;
}

export const CAPTURE_WIDTH = 1600;
export const CAPTURE_HEIGHT = 1000;
export const CAPTURE_BASE = '/proposals/order-tutorial';

/** px(1600×1000) → % 변환. 스펙 가독성을 위해 실측 px 를 그대로 적는다 */
export function px(x: number, y: number, w: number, h: number): StageRect {
  const r = (v: number) => Math.round(v * 1000) / 1000;
  return {
    x: r((x / CAPTURE_WIDTH) * 100),
    y: r((y / CAPTURE_HEIGHT) * 100),
    w: r((w / CAPTURE_WIDTH) * 100),
    h: r((h / CAPTURE_HEIGHT) * 100),
  };
}

const C = (name: string) => `${CAPTURE_BASE}/${name}.webp`;

export const CHOICE_STEP: OrderChoiceStep = {
  id: 'choose-track',
  type: 'choice',
  capture: C('archive-start'),
  // Archive / Tasking 탭 실측 (16,72,170,24)·(186,72,170,24) + 여백
  hotspot: px(8, 62, 356, 44),
  title: '이미 찍힌 영상인가요, 새로 찍을 영상인가요?',
  body:
    'Archive는 위성이 이미 찍어 둔 영상을 고르는 곳이고, Tasking은 원하는 곳을 새로 찍도록 요청하는 곳입니다. 둘 중 하나를 눌러 시작하세요.',
  options: [
    { track: 'archive', label: 'Archive', rect: px(16, 64, 170, 36) },
    { track: 'tasking', label: 'Tasking', rect: px(186, 64, 170, 36) },
  ],
};

// Archive — 영역 → 필터 → 영상 → 구매하기 → 안내 동의 → 결제하기
export const ARCHIVE_STEPS: OrderHighlightStep[] = [
  {
    id: 'archive-draw',
    type: 'highlight',
    capture: C('archive-start'),
    // 지도 우측 도구 첫 번째 '사각형 영역 선택' (1540,120,40,40) + 4px
    hotspot: px(1536, 116, 48, 48),
    title: '먼저 영역을 그립니다',
    body:
      '사각형 도구로 필요한 영역을 그리면 그 영역을 찍은 영상만 목록에 남습니다. 최소 주문 면적은 25 km²입니다.',
    action: 'click',
    advanceLabel: '사각형 영역 선택',
    popoverSide: 'left',
    popoverAlign: 'start',
    // 실캡쳐 속 AOI 위치 (628,156)–(1344,800)
    effect: { kind: 'draw-aoi', at: 'before', rect: px(628, 156, 716, 644), ms: 900 },
  },
  {
    id: 'archive-filter',
    type: 'highlight',
    capture: C('archive-aoi'),
    // '필터' (279,116,77,40) + 4px
    hotspot: px(275, 112, 85, 48),
    title: '고해상도만 보려면 필터',
    body:
      '지금 목록에는 무료 Sentinel-2(10 m)도 섞여 있습니다. 필터에서 초고해상도를 고르면 SpaceEye-T(0.25 m)만 남습니다.',
    action: 'click',
    advanceLabel: '필터',
    popoverSide: 'right',
    popoverAlign: 'start',
    // 실서비스 필터 팝오버 → 초고해상도 체크 → 적용 결과
    framesAfter: [
      { capture: C('archive-filter-open'), ms: 900 },
      { capture: C('archive-filter-checked'), ms: 900 },
    ],
  },
  {
    id: 'archive-pick',
    type: 'highlight',
    capture: C('archive-results'),
    // 첫 카드 (16,188,340,256)
    hotspot: px(16, 188, 340, 256),
    title: '날짜와 구름양을 보고 고릅니다',
    body:
      '2026년 5월 31일 장면은 구름 0%입니다. 가격은 km²당 $15인데 지금은 프로모션으로 $10, 이 영역은 $278.20입니다. 왼쪽 동그라미를 눌러 선택하세요.',
    action: 'click',
    // 카드 체크박스 (32,206,24,24) + 6px
    advanceHotspot: px(26, 200, 36, 36),
    advanceLabel: '선택',
    popoverSide: 'right',
    popoverAlign: 'start',
  },
  {
    id: 'archive-buy',
    type: 'highlight',
    capture: C('archive-selected'),
    // 하단 구매 바 (0,888,372,112)
    hotspot: px(0, 888, 372, 112),
    title: '지도에 실제 영상이 깔립니다',
    body:
      '선택한 장면의 미리보기가 영역 위에 바로 올라옵니다. 하단 바에서 면적과 금액을 확인하고 구매하기를 누르세요.',
    action: 'click',
    // '구매하기' (292,904,64,32) + 4px
    advanceHotspot: px(288, 900, 72, 40),
    advanceLabel: '구매하기',
    // 영역(AOI) 안에 깔린 SpaceEye-T 미리보기 (628,156,716,644)
    spotlight: px(628, 156, 716, 644),
    popoverSide: 'right',
    popoverAlign: 'end',
  },
  {
    id: 'archive-agree',
    type: 'highlight',
    capture: C('archive-sheet'),
    // 구매 시트 (0,632,372,368)
    hotspot: px(0, 632, 372, 368),
    title: '보정 수준과 안내 확인',
    body:
      '기하 보정 수준은 SEN·PRJ·ORT 중에서 고르며 기본값은 ORT(정사보정)입니다. 구매 전 안내를 확인했다고 체크해야 결제 버튼이 켜집니다.',
    action: 'click',
    // 안내 확인 체크박스 줄 (24,900,…) — '보기' 링크(324) 앞까지
    advanceHotspot: px(16, 892, 300, 40),
    advanceLabel: '구매 전 안내 사항을 확인하였습니다.',
    popoverSide: 'right',
    popoverAlign: 'end',
  },
  {
    id: 'archive-pay',
    type: 'highlight',
    capture: C('archive-agreed'),
    // '결제하기' (16,944,340,40) + 2px
    hotspot: px(14, 942, 344, 44),
    title: '결제하면 데이터 보관함으로',
    body:
      '결제가 끝나면 영상은 Data Library에 들어갑니다. 실서비스에서는 여기서 결제 창이 열립니다.',
    action: 'click',
    advanceLabel: '결제하기',
    popoverSide: 'right',
    popoverAlign: 'end',
  },
];

// Tasking — 위치 선택 → 시뮬레이션 → 궤도 선택 → 구매하기 → 안내 동의 → 결제하기
// 3번째 스텝부터는 TaskingSim 재현 레이어 (실서비스 번들의 마크업·클래스 그대로).
// 재현 레이어 레이아웃: 사이드바 372px, 헤더(고급 옵션 + 상품 카드)는 캡쳐에 있고
// y 420 부터 결과 목록, 하단 바·구매 시트는 사이드바 바닥에 붙는다.
export const TASKING_STEPS: OrderHighlightStep[] = [
  {
    id: 'tasking-point',
    type: 'highlight',
    capture: C('tasking-start'),
    // 지도 우측 도구 첫 번째 '위치 선택' (1540,120,40,40) + 4px
    hotspot: px(1536, 116, 48, 48),
    title: '촬영할 지점을 찍습니다',
    body:
      'Tasking은 영역 대신 점 하나로 요청합니다. 위치 선택 도구를 누르면 하카타항에 점을 찍어 드립니다. 한 장면은 최소 144 km²를 보장합니다.',
    action: 'click',
    advanceLabel: '위치 선택',
    popoverSide: 'left',
    popoverAlign: 'start',
    // tasking-location 캡쳐 속 지점 마커 중심 (985,478)
    effect: { kind: 'drop-pin', at: 'after', rect: px(973, 466, 24, 24), ms: 900 },
  },
  {
    id: 'tasking-simulate',
    type: 'highlight',
    capture: C('tasking-location'),
    // '시뮬레이션 확인하기' (32,352,308,32) + 4px
    hotspot: px(28, 348, 316, 40),
    title: '언제 찍을 수 있는지 확인',
    body:
      '시뮬레이션은 이 지점을 지나가는 SpaceEye-T 궤도를 찾아 촬영 가능한 일정을 보여 줍니다. 결과는 5분 동안만 유효합니다.',
    action: 'click',
    advanceLabel: '시뮬레이션 확인하기',
    popoverSide: 'right',
    popoverAlign: 'start',
    effect: { kind: 'sim-loading', at: 'before', rect: px(0, 420, 372, 580), ms: 1400 },
  },
  {
    id: 'tasking-orbit',
    type: 'highlight',
    capture: C('tasking-location'),
    // 재현 결과 목록 (0,420,372,580)
    hotspot: px(0, 420, 372, 580),
    title: '일정을 고릅니다',
    body:
      '카드마다 촬영 날짜와 시각(UTC), 흐릴 확률이 나옵니다. 카드를 누르면 지도에 촬영 범위가 표시됩니다. 마음에 드는 일정의 동그라미를 체크하세요.',
    action: 'click',
    advanceLabel: '궤도 선택',
    widget: 'orbits',
    popoverSide: 'right',
    popoverAlign: 'start',
  },
  {
    id: 'tasking-buy',
    type: 'highlight',
    capture: C('tasking-location'),
    // 재현 하단 구매 바 (0,888,372,112)
    hotspot: px(0, 888, 372, 112),
    title: '한 장면에 $1,800',
    body:
      'Tasking은 면적이 아니라 장면 단위로 값을 매깁니다. 지금 고른 일정은 1 Scene, $1,800입니다. 구매하기를 누르세요.',
    action: 'click',
    advanceLabel: '구매하기',
    widget: 'selected',
    popoverSide: 'right',
    popoverAlign: 'end',
  },
  {
    id: 'tasking-agree',
    type: 'highlight',
    capture: C('tasking-location'),
    // 재현 구매 시트 (0,632,372,368) — Archive 와 같은 시트 컴포넌트
    hotspot: px(0, 632, 372, 368),
    title: '촬영 안내 확인',
    body:
      '시뮬레이션 일정은 예상 값이라 날씨나 위성 운용에 따라 바뀔 수 있고, 구름양은 보장되지 않습니다. 안내를 확인했다고 체크해야 결제 버튼이 켜집니다.',
    action: 'click',
    advanceLabel: '구매 전 안내 사항을 확인하였습니다.',
    widget: 'sheet',
    popoverSide: 'right',
    popoverAlign: 'end',
  },
  {
    id: 'tasking-pay',
    type: 'highlight',
    capture: C('tasking-location'),
    // 재현 '결제하기' (16,944,340,40) + 2px
    hotspot: px(14, 942, 344, 44),
    title: '결제하면 촬영 요청 완료',
    body:
      '촬영이 시작되기 전에는 Data Library에서 주문을 취소할 수 있고, 촬영이 실패하면 자동으로 환불됩니다.',
    action: 'click',
    advanceLabel: '결제하기',
    widget: 'agreed',
    popoverSide: 'right',
    popoverAlign: 'end',
  },
];

export const TRACK_STEPS: Record<OrderTrack, OrderHighlightStep[]> = {
  archive: ARCHIVE_STEPS,
  tasking: TASKING_STEPS,
};

// Tasking 예시 궤도 — 캡쳐 시점 실서비스 궤도 조회가 빈 결과라 화면 재현용으로 만든
// 예시다. 필드 이름·표시 형식은 실서비스 응답 스펙(assignedOrbitInfoList[].stripList[])
// 을 따르되, 값은 실제 궤도가 아니다. 화면에도 '예시 일정'으로 표시한다.
export interface ExampleStrip {
  icpId: string;
  startTime: string;
  cloudProbability: number;
  rollTiltAngle: number;
  pitchTiltAngle: number;
  sunElevation: number;
}

export const EXAMPLE_STRIPS: ExampleStrip[] = [
  {
    icpId: 'example-1',
    startTime: '2026-10-10T02:14:00Z',
    cloudProbability: 18,
    rollTiltAngle: -12.4,
    pitchTiltAngle: 3.2,
    sunElevation: 41.6,
  },
  {
    icpId: 'example-2',
    startTime: '2026-10-12T01:52:00Z',
    cloudProbability: 42,
    rollTiltAngle: 21.07,
    pitchTiltAngle: -5.11,
    sunElevation: 40.12,
  },
  {
    icpId: 'example-3',
    startTime: '2026-10-15T02:31:00Z',
    cloudProbability: 9,
    rollTiltAngle: -30.5,
    pitchTiltAngle: 1.04,
    sunElevation: 38.9,
  },
];

/** Tasking 단가 — 실서비스 TASKING_SOURCE_META.spaceEyeT.pricePerScene */
export const TASKING_PRICE_PER_SCENE = 1800;

export const MODAL_STEP: OrderModalStep = {
  id: 'signup',
  type: 'modal',
  title: '로그인하면 바로 주문할 수 있습니다',
  body:
    '방금 따라 한 순서 그대로 실제 주문이 진행됩니다. 결제는 로그인한 계정에서만 할 수 있습니다.',
};
