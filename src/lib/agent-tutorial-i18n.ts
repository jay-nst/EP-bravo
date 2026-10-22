// Agent 튜토리얼 제안 데모 — 한/영 카피 (2026-10-22 요청: 영문 번역 + 한/영 토글)
//
// 한국어 카피의 정본은 agent-tutorial-steps.ts 그대로다. 이 파일은 영어 카피만 들고,
// 스텝 스펙(좌표·캡쳐·액션)은 한국어 스펙을 복제한 뒤 문구만 덮어쓴다 — 좌표가
// 두 벌로 갈라지지 않게. 캡쳐 이미지는 한국어 실화면(/ko) 그대로라 영어 모드에서도
// 캡쳐 속 글자는 한국어로 보인다.
//
// 스텝 배열·카피 객체는 모듈 레벨 상수다. AnalysisChatSim 이 sim 참조를 effect
// 의존성으로 쓰므로, 렌더마다 새로 만들면 시뮬레이션이 처음부터 다시 돈다.

import {
  TUTORIAL_STEPS,
  SIGNUP_CTA_LABEL,
  TOUR_ENTRY,
  COMPARE_ASSETS,
  MAP_TOP_BARS,
  type TutorialStep,
  type HighlightStep,
  type ModalStep,
  type TutorialChatSim,
} from './agent-tutorial-steps';

export type TutorialLocale = 'ko' | 'en';

export const TUTORIAL_LOCALES: readonly TutorialLocale[] = ['ko', 'en'];

/** URL `?lang=` 값 → 로케일. 모르는 값은 한국어 */
export function parseTutorialLocale(value: string | null | undefined): TutorialLocale {
  return value === 'en' ? 'en' : 'ko';
}

interface StepCopy {
  title: string;
  body: string;
  advanceLabel?: string;
  loadingChat?: Pick<
    TutorialChatSim,
    'userMessage' | 'agentMessages' | 'pendingLabel' | 'doneMessage' | 'skipNotice'
  >;
}

/** 스텝 id → 영어 카피. 테스트가 모든 스텝의 번역 존재를 강제한다 */
export const STEP_COPY_EN: Record<string, StepCopy> = {
  'cold-start-input': {
    title: 'Not sure what to ask?',
    body: 'Click the Santa Rosa Island wildfire example to start an analysis.',
    loadingChat: {
      userMessage: "Analyze this year's wildfire on Santa Rosa Island",
      agentMessages: [
        "First, I'll check where Santa Rosa Island is and look up the wildfires that occurred there this year.",
        'I found pre- and post-fire imagery for the analysis. Starting the analysis now. The area is large, so this usually takes a few minutes and can take up to about 10 minutes. Please wait a moment.',
      ],
      pendingLabel: 'Analyzing',
      doneMessage: "The analysis is complete. I've summarized the burned area and the severity distribution.",
      skipNotice: "You're watching an example analysis.",
    },
  },
  'analysis-result': {
    title: 'From one question to satellite analysis',
    body: 'The Agent finds pre- and post-fire satellite imagery and calculates the burned area automatically. The total burned area of 7,428.8 ha and the severity distribution are summarized in cards.',
    advanceLabel: 'View on map',
  },
  'map-compare': {
    title: 'Compare before and after the fire on the map',
    body: 'Drag the slider to compare the area before and after the fire. In the panel at the bottom left, you can also adjust the opacity of the severity overlay (high, medium, low).',
  },
  'open-article': {
    title: 'Turn the analysis into a report',
    body: 'The analysis you just saw is also compiled into a finished report. Click the button at the bottom of the chat to open it.',
    advanceLabel: 'View analysis article',
  },
  'analysis-article': {
    title: 'Your report, as an analysis article',
    body: "The results are compiled into a finished report. Scroll through it, and when you're done, try saving it as a PDF.",
    advanceLabel: 'Save PDF',
  },
  signup: {
    title: 'Now, analyze an area you care about!',
    body: 'Tell the Agent which area and time period to analyze, and it will find satellite imagery, run the analysis, and compile a report. You can start right after signing up.',
  },
};

function localizeStep(step: TutorialStep, copy: StepCopy | undefined): TutorialStep {
  if (!copy) return step;
  if (step.type === 'modal') return { ...step, title: copy.title, body: copy.body };
  return {
    ...step,
    title: copy.title,
    body: copy.body,
    ...(copy.advanceLabel !== undefined ? { advanceLabel: copy.advanceLabel } : {}),
    ...(step.loadingChat && copy.loadingChat
      ? { loadingChat: { ...step.loadingChat, ...copy.loadingChat } }
      : {}),
  };
}

const TUTORIAL_STEPS_EN: TutorialStep[] = TUTORIAL_STEPS.map((s) =>
  localizeStep(s, STEP_COPY_EN[s.id]),
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
      searchPlaceholder: 'Search for a location',
      sliderLabel: 'Before/after fire comparison slider',
      damagePanel: 'Wildfire damage',
      opacity: 'Opacity',
      opacityLabel: 'Severity overlay opacity',
      severity: 'Severity',
      severityLevels: ['High', 'Medium', 'Low'],
      compareHelp: 'Comparison help',
      compareClose: 'Close comparison',
    },
  },
};
