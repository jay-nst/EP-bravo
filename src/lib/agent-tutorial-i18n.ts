// Agent 튜토리얼 제안 데모 — 한/영 카피·캡쳐 (2026-10-22 영문 번역 + 한/영 토글,
// 2026-10-23 영문 실화면 재캡쳐)
//
// 한국어 스펙의 정본은 agent-tutorial-steps.ts 그대로다. 영어는 한국어 스펙을 복제한 뒤
// 문구(STEP_COPY_EN)와 화면(STEP_SCREEN_EN: 캡쳐·좌표)만 덮어쓴다.
//
// 영문 캡쳐: 2026-10-23 agent.ep.naraspace.com 영문 UI(Accept-Language: en) 실화면,
// 1600×1000 viewport. 영어로 새로 돌린 산타로사섬 분석 대화 기준이라 수치가 한국어판과
// 다르다(총 피해 면적 6,670.3ha). 대화 목록·계정 아바타는 DOM 블러 처리 후 캡쳐.
// 지도 비교 위젯 자산(map-*)은 글자가 없는 지도 크롭이라 한국어판을 그대로 쓴다.
// article-loading 은 실서비스가 캐시로 즉시 열려 로딩 화면을 DOM 으로 재현해 찍었다.
//
// 스텝 배열·카피 객체는 모듈 레벨 상수다. AnalysisChatSim 이 sim 참조를 effect
// 의존성으로 쓰므로, 렌더마다 새로 만들면 시뮬레이션이 처음부터 다시 돈다.

import {
  TUTORIAL_STEPS,
  SIGNUP_CTA_LABEL,
  TOUR_ENTRY,
  COMPARE_ASSETS,
  MAP_TOP_BARS,
  ARTICLE_ASSETS,
  CAPTURE_BASE,
  type TutorialStep,
  type HighlightStep,
  type ModalStep,
  type TutorialChatSim,
  type TutorialHotspot,
  type TutorialLoading,
} from './agent-tutorial-steps';

export type TutorialLocale = 'ko' | 'en';

export const TUTORIAL_LOCALES: readonly TutorialLocale[] = ['ko', 'en'];

/** URL `?lang=` 값 → 로케일. 모르는 값은 한국어 */
export function parseTutorialLocale(value: string | null | undefined): TutorialLocale {
  return value === 'en' ? 'en' : 'ko';
}

export const CAPTURE_BASE_EN = `${CAPTURE_BASE}/en`;

interface StepCopy {
  title: string;
  body: string;
  advanceLabel?: string;
  loadingChat?: Pick<
    TutorialChatSim,
    'userMessage' | 'agentMessages' | 'pendingLabel' | 'doneMessage' | 'skipNotice'
  >;
}

/**
 * 스텝 id → 영어 카피. 테스트가 모든 스텝의 번역 존재를 강제한다.
 * 채팅 문구·버튼 라벨은 영문 실대화(2026-10-23) 그대로다.
 */
export const STEP_COPY_EN: Record<string, StepCopy> = {
  'cold-start-input': {
    title: 'Not sure what to ask?',
    body: 'Click the Santa Rosa Island wildfire example to start an analysis.',
    loadingChat: {
      // 예시 칩을 누르면 칩 문구가 그대로 사용자 메시지가 된다
      userMessage: 'Santa Rosa Island wildfire report (May 2026)',
      agentMessages: [
        'Santa Rosa Island Fire — ignited May 15, 2026, fully contained June 4, 2026. According to the National Park Service, the fire burned 18,379 acres (approx. 7,436 ha) — roughly one-third of the island.',
        'Pre- and post-fire satellite imagery has been identified for the analysis. Starting the wildfire damage analysis — this usually takes a few minutes, and 10+ minutes for large areas.',
      ],
      pendingLabel: 'Analyzing',
      doneMessage: 'Analysis complete: total burned area 6,670.3 ha within the analyzed extent.',
      skipNotice: "You're watching an example analysis.",
    },
  },
  'analysis-result': {
    title: 'From one question to satellite analysis',
    body: 'The Agent finds pre- and post-fire satellite imagery and calculates the burned area automatically. The total burned area of 6,670.3 ha and the severity distribution are summarized in cards.',
    advanceLabel: 'Show on map',
  },
  'map-compare': {
    title: 'Compare before and after the fire on the map',
    body: 'Drag the slider to compare the area before and after the fire. In the panel at the bottom left, you can also adjust the opacity of the severity overlay (high, moderate, low).',
  },
  'open-article': {
    title: 'Turn the analysis into a report',
    body: 'The analysis you just saw is also compiled into a finished report. Click the button in the chat to open it.',
    advanceLabel: 'View analysis article',
  },
  'analysis-article': {
    title: 'Your report, as an analysis article',
    body: "The results are compiled into a finished report. Scroll through it, and when you're done, try saving it as a PDF.",
    advanceLabel: 'Save as PDF',
  },
  signup: {
    title: 'Now, analyze an area you care about!',
    body: 'Tell the Agent which area and time period to analyze, and it will find satellite imagery, run the analysis, and compile a report. You can start right after signing up.',
  },
};

interface StepScreen {
  capture?: string;
  hotspot?: TutorialHotspot;
  advanceHotspot?: TutorialHotspot;
  loadingAfter?: TutorialLoading;
  loadingChat?: Pick<TutorialChatSim, 'background' | 'resultCards'>;
}

/**
 * 스텝 id → 영문 캡쳐와 그 캡쳐 기준 좌표. 영문 UI 는 버튼 폭·대화 길이가 달라
 * 하이라이트 위치를 다시 실측했다 (괄호 = 라이브 DOM 실측 px, 패딩은 한국어판과 같은 값).
 * 지도 영역(map-compare)·아티클 영역(analysis-article 핫스팟)은 레이아웃이 같아 그대로 둔다.
 */
export const STEP_SCREEN_EN: Record<string, StepScreen> = {
  'cold-start-input': {
    capture: `${CAPTURE_BASE_EN}/step1-home.png`,
    // Santa Rosa 예시 칩 (284,752,351,32) — 영문은 세 번째 칩이라 한 줄 위다
    hotspot: { x: 17.5, y: 74.8, w: 22.4, h: 4 },
    loadingChat: {
      background: `${CAPTURE_BASE_EN}/loading-1.png`,
      resultCards: {
        capture: `${CAPTURE_BASE_EN}/step2-premap.png`,
        rect: { x: 20.5, y: 10.2, w: 19.1, h: 33 },
      },
    },
  },
  'analysis-result': {
    capture: `${CAPTURE_BASE_EN}/step2-premap.png`,
    // 결과 카드 (332,104,297,325)
    hotspot: { x: 20.5, y: 10.2, w: 19.1, h: 33 },
    // 'Show on map' (543,119,71,16)
    advanceHotspot: { x: 33.3, y: 10.7, w: 5.94, h: 3.4 },
  },
  'map-compare': {
    capture: `${CAPTURE_BASE_EN}/step2-result.png`,
  },
  'open-article': {
    capture: `${CAPTURE_BASE_EN}/step2-result.png`,
    // 'View analysis article' (332,692,170,32)
    hotspot: { x: 20.4, y: 68.6, w: 11.44, h: 4.4 },
    loadingAfter: {
      frames: [{ capture: `${CAPTURE_BASE_EN}/article-loading.png`, ms: 1000 }],
    },
  },
  'analysis-article': {
    capture: `${CAPTURE_BASE_EN}/step4-article.png`,
    // 'Save as PDF' (1150,44,121,32)
    advanceHotspot: { x: 71.4, y: 3.8, w: 8.36, h: 4.4 },
  },
};

function localizeStep(
  step: TutorialStep,
  copy: StepCopy | undefined,
  screen: StepScreen | undefined,
): TutorialStep {
  if (!copy) return step;
  if (step.type === 'modal') return { ...step, title: copy.title, body: copy.body };
  return {
    ...step,
    title: copy.title,
    body: copy.body,
    ...(copy.advanceLabel !== undefined ? { advanceLabel: copy.advanceLabel } : {}),
    ...(screen?.capture ? { capture: screen.capture } : {}),
    ...(screen?.hotspot ? { hotspot: screen.hotspot } : {}),
    ...(screen?.advanceHotspot ? { advanceHotspot: screen.advanceHotspot } : {}),
    ...(screen?.loadingAfter ? { loadingAfter: screen.loadingAfter } : {}),
    ...(step.loadingChat && (copy.loadingChat || screen?.loadingChat)
      ? { loadingChat: { ...step.loadingChat, ...copy.loadingChat, ...screen?.loadingChat } }
      : {}),
  };
}

const TUTORIAL_STEPS_EN: TutorialStep[] = TUTORIAL_STEPS.map((s) =>
  localizeStep(s, STEP_COPY_EN[s.id], STEP_SCREEN_EN[s.id]),
);

export const TUTORIAL_STEPS_BY_LOCALE: Record<TutorialLocale, TutorialStep[]> = {
  ko: TUTORIAL_STEPS,
  en: TUTORIAL_STEPS_EN,
};

export const HIGHLIGHT_STEPS_BY_LOCALE: Record<TutorialLocale, HighlightStep[]> = {
  ko: TUTORIAL_STEPS_BY_LOCALE.ko.filter((s): s is HighlightStep => s.type === 'highlight'),
  en: TUTORIAL_STEPS_BY_LOCALE.en.filter((s): s is HighlightStep => s.type === 'highlight'),
};

export const MODAL_STEP_BY_LOCALE: Record<TutorialLocale, ModalStep | undefined> = {
  ko: TUTORIAL_STEPS_BY_LOCALE.ko.find((s): s is ModalStep => s.type === 'modal'),
  en: TUTORIAL_STEPS_BY_LOCALE.en.find((s): s is ModalStep => s.type === 'modal'),
};

export interface TutorialScreenAssets {
  /** 분석 아티클 세그먼트 (원본 해상도, 세로로 이어 붙여 스크롤) */
  articleSegments: readonly string[];
  /** 'EP Agent 둘러보기' 재진입 버튼 위치 (step1 캡쳐 기준 %) */
  tourEntryRect: TutorialHotspot;
}

export const TUTORIAL_SCREEN_ASSETS: Record<TutorialLocale, TutorialScreenAssets> = {
  ko: { articleSegments: ARTICLE_ASSETS.segments, tourEntryRect: TOUR_ENTRY.rect },
  en: {
    // 영문 아티클 문서 1100×4201 — 900px 단위로 자른 5장
    articleSegments: [0, 1, 2, 3, 4].map((i) => `${CAPTURE_BASE_EN}/article-seg-${i}.png`),
    // 영문 안내문은 한 줄 위(둘째 줄 y≈423)라 8px 올린다
    tourEntryRect: { ...TOUR_ENTRY.rect, y: 44.6 },
  },
};

// ---------------------------------------------------------------------------
// 화면 UI 카피 — 스텝 스펙 밖의 버튼·안내·접근성 라벨
// ---------------------------------------------------------------------------

export interface TutorialUiCopy {
  languageLabel: string;
  stepsLabel: string;
  nextBtn: string;
  prevBtn: string;
  doneBtn: string;
  /** 진행 버튼이 따로 있는 click 스텝의 안내 */
  clickHintWithLabel: (label: string) => string;
  /** 하이라이트 자체를 클릭하는 스텝의 안내 */
  clickHint: string;
  /** next 스텝의 안내 */
  nextHint: string;
  stageAlt: (step: number) => string;
  articleLabel: string;
  skip: string;
  startIntro: string;
  startButton: string;
  captureNote: string;
  reopenNote: string;
  dismissedNote: string;
  dontShowAgain: string;
  close: string;
  tourEntry: string;
  chatLog: string;
  resultCards: string;
  signupCta: string;
  signupCtaHint: string;
  replay: string;
  mobileNotice: string;
  map: {
    beforeLabel: string;
    afterLabel: string;
    searchPlaceholder: string;
    sliderLabel: string;
    damagePanel: string;
    opacity: string;
    opacityLabel: string;
    severity: string;
    severityLevels: readonly [string, string, string];
    compareHelp: string;
    compareClose: string;
  };
}

export const TUTORIAL_UI_COPY: Record<TutorialLocale, TutorialUiCopy> = {
  ko: {
    languageLabel: '언어',
    stepsLabel: '튜토리얼 진행 단계',
    nextBtn: '다음',
    prevBtn: '이전',
    doneBtn: '계속',
    clickHintWithLabel: (label) =>
      `화면의 '${label}' 버튼을 직접 클릭해 보세요 — '다음'으로도 진행됩니다`,
    clickHint: "강조된 버튼을 클릭하거나 '다음'을 눌러 진행하세요.", // 2026-10-19 피그마 리뷰 카피
    nextHint: "체험해 본 뒤 아래 '다음' 버튼으로 진행하세요",
    stageAlt: (step) => `Agent 화면 캡쳐 — 스텝 ${step}`,
    articleLabel: '분석 아티클 (스크롤 가능)',
    skip: '건너뛰기',
    startIntro: '승인자가 직접 클릭하며 체험하는 6스텝 데모입니다',
    startButton: '데모 시작하기',
    captureNote:
      '캡쳐: agent.ep.naraspace.com 실화면 (2026-09-28, 산타로사섬 산불 분석) · 대화 목록·계정 정보는 블러 처리',
    reopenNote: ` · 튜토리얼은 '${TOUR_ENTRY.label}'로 언제든 다시 열 수 있습니다`,
    dismissedNote: " ('다시 보지 않기' 저장됨 — 사이트 데이터를 지우면 다시 자동 표시)",
    dontShowAgain: '다시 보지 않기',
    close: '닫기',
    tourEntry: TOUR_ENTRY.label,
    chatLog: '분석 진행 중',
    resultCards: '분석 결과 카드',
    signupCta: SIGNUP_CTA_LABEL,
    signupCtaHint: '실서비스에서는 여기서 가입 플로우로 연결됩니다',
    replay: '데모 다시 보기',
    mobileNotice: '이 데모는 데스크톱 전용입니다 (최소 1280px). 더 넓은 화면에서 열어 주세요.',
    map: {
      beforeLabel: COMPARE_ASSETS.beforeLabel,
      afterLabel: COMPARE_ASSETS.afterLabel,
      searchPlaceholder: MAP_TOP_BARS.search.placeholder,
      sliderLabel: '화재 전·후 비교 슬라이더',
      damagePanel: '산불 피해 보기',
      opacity: '불투명도',
      opacityLabel: '심각도 오버레이 불투명도',
      severity: '심각도',
      severityLevels: ['상', '중', '하'],
      compareHelp: '비교 도움말',
      compareClose: '비교 닫기',
    },
  },
  en: {
    languageLabel: 'Language',
    stepsLabel: 'Tutorial progress',
    nextBtn: 'Next',
    prevBtn: 'Back',
    doneBtn: 'Continue',
    clickHintWithLabel: (label) =>
      `Click the '${label}' button on screen — or press 'Next' to continue`,
    clickHint: "Click the highlighted button or press 'Next' to continue.",
    nextHint: "Try it out, then press 'Next' below to continue",
    stageAlt: (step) => `Agent screen capture — step ${step}`,
    articleLabel: 'Analysis article (scrollable)',
    skip: 'Skip',
    startIntro: 'A hands-on 6-step demo for reviewers to click through',
    startButton: 'Start demo',
    captureNote:
      'Captured from the live agent.ep.naraspace.com screen (2026-09-28, Santa Rosa Island wildfire analysis) · Conversation list and account details are blurred',
    reopenNote: " · You can reopen the tutorial anytime with 'Tour EP Agent'",
    dismissedNote: " ('Don't show again' saved — clear site data to show it automatically again)",
    dontShowAgain: "Don't show again",
    close: 'Close',
    tourEntry: 'Tour EP Agent',
    chatLog: 'Analysis in progress',
    resultCards: 'Analysis result cards',
    signupCta: 'Sign up to start',
    signupCtaHint: 'In the live service, this leads to the sign-up flow.',
    replay: 'Replay demo',
    mobileNotice:
      'This demo is desktop-only (minimum 1280px). Please open it on a wider screen.',
    map: {
      beforeLabel: 'Before fire 2026-04-20',
      afterLabel: 'After fire 2026-06-09',
      searchPlaceholder: 'Search for a place',
      sliderLabel: 'Before/after fire comparison slider',
      damagePanel: 'Wildfire damage',
      opacity: 'Opacity',
      opacityLabel: 'Severity overlay opacity',
      severity: 'Severity',
      severityLevels: ['High', 'Moderate', 'Low'],
      compareHelp: 'Comparison help',
      compareClose: 'Close comparison',
    },
  },
};
