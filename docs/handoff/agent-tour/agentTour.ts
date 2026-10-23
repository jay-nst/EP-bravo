// EP Agent 튜토리얼 — 스텝 스펙과 한/영 카피
//
// 대상 요소는 좌표가 아니라 data-tour 속성으로 찾는다. 실제 화면의 해당 요소에
// data-tour="<target>" 을 달면 된다 (README 의 표 참고).
//
// 동작 기준 데모: http://192.168.127.13:3000/proposals/agent-tutorial (사내망)

export type TourLocale = 'ko' | 'en';

/**
 * 'click' = 실제 요소를 눌러야 다음으로 간다 ('다음' 버튼을 누르면 그 요소를 대신 클릭).
 * 'next'  = 말풍선의 '다음' 버튼으로만 간다 (그 화면을 자유롭게 써 보는 스텝).
 */
export type TourAdvance = 'click' | 'next';

export interface TourStepCopy {
  title: string;
  body: string;
  /** 눌러야 하는 버튼의 화면 라벨 — 안내 문구에 들어간다 */
  clickLabel?: string;
}

export interface TourStep {
  id: string;
  /** 하이라이트할 요소의 data-tour 값 */
  target: string;
  /** 눌러야 하는 요소가 target 안의 다른 요소일 때 그 data-tour 값 (예: 카드 안 버튼) */
  clickTarget?: string;
  advance: TourAdvance;
  /**
   * 클릭 뒤 이 data-tour 요소가 나타나면 자동으로 눌러 준다 — 클릭 결과가 바로 다음
   * 화면이 아니라 중간 버튼을 한 번 더 거칠 때 (아티클 작성 요청 → 'View analysis article').
   */
  openWhenReady?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  copy: Record<TourLocale, TourStepCopy>;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'cold-start-input',
    // 첫 화면 예시 칩 중 산타로사섬 산불 칩 하나
    target: 'example-chip',
    advance: 'click',
    copy: {
      ko: {
        title: '무엇을 물어볼지 막막하다면',
        body: '산타로사섬 산불 예시를 클릭해 분석을 시작해 보세요.',
      },
      en: {
        title: 'Not sure what to ask?',
        body: 'Click the Santa Rosa Island wildfire example to start an analysis.',
      },
    },
  },
  {
    // 분석이 끝나 결과 카드가 나타나면 자동으로 이 스텝이 열린다 (그 전까지 투어는 대기)
    id: 'analysis-result',
    target: 'analysis-result',
    clickTarget: 'show-on-map',
    advance: 'click',
    copy: {
      ko: {
        title: '질문 하나로 위성 분석까지',
        body: 'Agent가 화재 전·후 위성영상을 찾아 피해 면적을 자동 산출합니다. 총 피해 면적과 심각도 분포가 카드로 정리됐습니다.',
        clickLabel: '지도에서 보기',
      },
      en: {
        title: 'From one question to satellite analysis',
        body: 'The Agent finds pre- and post-fire satellite imagery and calculates the burned area automatically. The total burned area and the severity distribution are summarized in cards.',
        clickLabel: 'Show on map',
      },
    },
  },
  {
    // 지도 영역 전체 — 비교 슬라이더와 '산불 피해 보기' 패널을 직접 써 보게 한다
    id: 'map-compare',
    target: 'map',
    advance: 'next',
    copy: {
      ko: {
        title: '지도에서 화재 전·후 비교',
        body: '슬라이더를 직접 움직여 화재 전·후를 비교해 보세요. 좌측 하단 패널에서 심각도(상·중·하) 오버레이의 불투명도도 직접 조절할 수 있습니다.',
      },
      en: {
        title: 'Compare before and after the fire on the map',
        body: 'Drag the slider to compare the area before and after the fire. In the panel at the bottom left, you can also adjust the opacity of the severity overlay (high, moderate, low).',
      },
    },
  },
  {
    // 실서비스는 '이 결과를 분석 아티클로 정리해줘'를 눌러야 아티클이 만들어지고(약 30초)
    // 그 뒤에 '분석 아티클 보기' 버튼이 생긴다. 작성 요청 버튼을 하이라이트하고,
    // 아티클이 준비되면 보기 버튼을 자동으로 눌러 모달을 연다 (데모의 6단계 흐름 유지)
    id: 'open-article',
    target: 'write-article',
    openWhenReady: 'view-article',
    advance: 'click',
    // 말풍선을 버튼 바로 위에 붙인다 (디자인 리뷰: 다음 액션 가까이)
    side: 'top',
    align: 'start',
    copy: {
      ko: {
        title: '분석 결과를 보고서로',
        body: '방금 본 분석은 완성된 보고서로도 정리됩니다. 채팅의 버튼을 눌러 보고서를 만들어 보세요.',
        clickLabel: '이 결과를 분석 아티클로 정리해줘',
      },
      en: {
        title: 'Turn the analysis into a report',
        body: 'The analysis you just saw can also be compiled into a finished report. Click the button in the chat to create it.',
        clickLabel: 'Write an analysis article from this result',
      },
    },
  },
  {
    // 아티클 모달 전체 — 스크롤해 보고, 헤더의 PDF 저장을 누르면 투어 완료
    id: 'analysis-article',
    target: 'article-modal',
    clickTarget: 'save-pdf',
    advance: 'click',
    side: 'right',
    align: 'start',
    copy: {
      ko: {
        title: '보고서는 분석 아티클로',
        body: '분석 결과가 완성된 보고서로 정리됩니다. 스크롤로 살펴보고, 다 봤으면 PDF로 저장해 보세요.',
        clickLabel: 'PDF 저장',
      },
      en: {
        title: 'Your report, as an analysis article',
        body: "The results are compiled into a finished report. Scroll through it, and when you're done, try saving it as a PDF.",
        clickLabel: 'Save as PDF',
      },
    },
  },
];

/** 투어 UI 문구 */
export const TOUR_UI: Record<
  TourLocale,
  {
    next: string;
    prev: string;
    done: string;
    clickHint: string;
    clickHintWithLabel: (label: string) => string;
    nextHint: string;
    dontShowAgain: string;
    close: string;
    /** 재진입 버튼 (첫 화면 안내문 아래) */
    tourEntry: string;
  }
> = {
  ko: {
    next: '다음',
    prev: '이전',
    done: '계속',
    clickHint: "강조된 버튼을 클릭하거나 '다음'을 눌러 진행하세요.",
    clickHintWithLabel: (label) =>
      `화면의 '${label}' 버튼을 직접 클릭해 보세요 — '다음'으로도 진행됩니다`,
    nextHint: "체험해 본 뒤 아래 '다음' 버튼으로 진행하세요",
    dontShowAgain: '다시 보지 않기',
    close: '닫기',
    tourEntry: 'EP Agent 둘러보기',
  },
  en: {
    next: 'Next',
    prev: 'Back',
    done: 'Continue',
    clickHint: "Click the highlighted button or press 'Next' to continue.",
    clickHintWithLabel: (label) =>
      `Click the '${label}' button on screen — or press 'Next' to continue`,
    nextHint: "Try it out, then press 'Next' below to continue",
    dontShowAgain: "Don't show again",
    close: 'Close',
    tourEntry: 'Tour EP Agent',
  },
};

/** 끝까지 진행했을 때 띄우는 가입 유도 모달 문구 (모달은 서비스의 Dialog 로 구현) */
export const SIGNUP_COPY: Record<
  TourLocale,
  { title: string; body: string; cta: string; replay: string }
> = {
  ko: {
    title: '이제, 관심 지역을 직접 분석해 보세요!',
    body: '분석할 지역과 시기를 알려주면 Agent가 위성영상을 찾아 분석하고 보고서로 정리합니다. 회원가입 후 바로 시작할 수 있습니다.',
    cta: '가입하고 분석 시작하기',
    replay: '데모 다시 보기',
  },
  en: {
    title: 'Now, analyze an area you care about!',
    body: 'Tell the Agent which area and time period to analyze, and it will find satellite imagery, run the analysis, and compile a report. You can start right after signing up.',
    cta: 'Sign up to start',
    replay: 'Replay demo',
  },
};

/** data-tour 선택자 */
export const tourSelector = (id: string) => `[data-tour="${id}"]`;
