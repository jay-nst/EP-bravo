'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button, Checkbox, Field, Tabs } from '@naraspace-technology/nds/components';
import { IconPlay } from '@naraspace-technology/nds/icons';
import {
  TUTORIAL_STEPS,
  CAPTURE_WIDTH,
  CAPTURE_HEIGHT,
  CHAT_COLORS,
  COMPARE_ASSETS,
  type TutorialHotspot,
} from '@/lib/agent-tutorial-steps';
import { isTutorialDismissed, saveTutorialDismissed } from '@/lib/agent-tutorial-dismiss';
import {
  HIGHLIGHT_STEPS_BY_LOCALE,
  TUTORIAL_SCREEN_ASSETS,
  TUTORIAL_UI_COPY,
  type TutorialLocale,
} from '@/lib/agent-tutorial-i18n';
import SignupConversionModal from '@/components/proposals/SignupConversionModal';
import BeforeAfterSlider from '@/components/proposals/BeforeAfterSlider';
import AnalysisChatSim from '@/components/proposals/AnalysisChatSim';
import { trackEvent } from '@/lib/analytics';

type DemoPhase = 'idle' | 'running' | 'analyzing' | 'modal' | 'done';

const MODAL_STEP_INDEX = TUTORIAL_STEPS.length - 1;

// 스텝 간 캡쳐 전환이 이 데모의 유일한 비자명 구현 지점 (설계문서 구현 스펙):
// driver.js 는 단일 정적 페이지를 가정하므로, 스텝별 onHighlightStarted 훅에서
// 배경 캡쳐 이미지를 교체한다. 핫스팟 div 는 스텝마다 별도 요소로 미리 깔아두므로
// 하이라이트 위치 재계산은 driver 가 다음 요소로 이동하며 자연히 처리한다.
interface AgentTutorialDemoProps {
  /** 카피 언어 (2026-10-22 한/영 토글). 캡쳐 이미지는 한국어 실화면 그대로다 */
  locale?: TutorialLocale;
  /** 지정하면 상단에 한/영 전환 탭을 보여준다 */
  onLocaleChange?: (locale: TutorialLocale) => void;
}

export default function AgentTutorialDemo({
  locale = 'ko',
  onLocaleChange,
}: AgentTutorialDemoProps = {}) {
  // 문구·캡쳐·좌표 모두 로케일별 (2026-10-23 영문 실화면 재캡쳐). 모듈 레벨 상수라
  // 로케일이 같으면 참조가 유지된다
  const steps = HIGHLIGHT_STEPS_BY_LOCALE[locale];
  const screen = TUTORIAL_SCREEN_ASSETS[locale];
  const t = TUTORIAL_UI_COPY[locale];
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [capture, setCapture] = useState(steps[0].capture);
  // driverRef 는 투어 진행 중에만 non-null — openModal/언마운트에서 null 로 되돌린다.
  const driverRef = useRef<Driver | null>(null);
  const loadingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // 진행 버튼(portal)의 위치 계산 기준이 되는 캡쳐 스테이지
  const stageRef = useRef<HTMLDivElement>(null);
  // 팝오버 '다음' 버튼이 최신 advanceStep 을 부르도록 (startTour 가 advanceStep 보다 먼저 정의됨)
  const advanceRef = useRef<(i: number) => void>(() => {});
  const [chatExiting, setChatExiting] = useState(false);
  // '다시 보지 않기' (2026-10-19 피그마 리뷰) — 체크 상태는 닫는 순간에만 저장한다.
  // driver 의 X·ESC 훅이 최신 값을 읽도록 ref 로도 들고 있다.
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const dontShowAgainRef = useRef(false);
  // 저장된 선택 — true 면 첫 진입 자동 표시(시작 오버레이)를 건너뛰고
  // 'EP Agent 둘러보기' 재진입 버튼만 보여준다. localStorage 는 마운트 후에만 읽는다.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 저장소는 hydration 후에만 읽을 수 있다
    setDismissed(isTutorialDismissed());
  }, []);

  const toggleDontShowAgain = useCallback((checked: boolean) => {
    dontShowAgainRef.current = checked;
    setDontShowAgain(checked);
  }, []);

  const openModal = useCallback((reason: 'completed' | 'skipped') => {
    driverRef.current?.destroy();
    driverRef.current = null;
    setStepIndex(MODAL_STEP_INDEX);
    setPhase('modal');
    trackEvent('cta_click', `agent_tutorial_demo_${reason}`, {});
  }, []);

  // 닫기 (2026-10-19 피그마 리뷰): 어느 단계에서든 데모를 끝내고 Agent 첫 화면으로
  // 돌아간다 — 가입 모달로 점프하지 않는다. '다시 보지 않기'가 체크돼 있으면 저장.
  const closeTour = useCallback(() => {
    const timers = loadingTimersRef.current;
    timers.forEach(clearTimeout);
    timers.length = 0;
    driverRef.current?.destroy();
    driverRef.current = null;
    if (dontShowAgainRef.current) {
      saveTutorialDismissed();
      setDismissed(true);
    }
    setChatExiting(false);
    setCapture(steps[0].capture);
    setStepIndex(0);
    setPhase('done');
    trackEvent('cta_click', 'agent_tutorial_demo_closed', {
      dont_show_again: dontShowAgainRef.current,
    });
  }, [steps]);

  const startTour = useCallback(() => {
    driverRef.current?.destroy();
    dontShowAgainRef.current = false;
    setDontShowAgain(false);

    const d = driver({
      // 전체화면에서 상단 스텝 인디케이터를 없앤 대신 팝오버에 진행 표시 (n / 6)
      showProgress: true,
      animate: true,
      allowClose: true,
      // 닫기가 '데모 종료'가 되면서, 오버레이 빈 곳을 잘못 눌러 끝나지 않도록 막는다
      // (닫기는 상단 [닫기]·팝오버 X·ESC 로만)
      overlayClickBehavior: () => {},
      overlayOpacity: 0.72,
      stagePadding: 6,
      popoverClass: 'ep-tutorial-popover',
      nextBtnText: t.nextBtn,
      prevBtnText: t.prevBtn,
      doneBtnText: t.doneBtn,
      steps: steps.map((s, i) => ({
        element: `#tut-hotspot-${s.id}`,
        popover: {
          title: s.title,
          description: `${s.body}<div class="ep-tutorial-click-hint"><span class="ep-tutorial-click-arrow" aria-hidden="true"></span><span>${
            s.action === 'click'
              ? s.advanceLabel
                ? t.clickHintWithLabel(s.advanceLabel)
                : t.clickHint
              : t.nextHint
          }</span></div>`,
          // 리뷰 반영: 툴팁을 다음 액션 대상 근처에 붙인다 (미지정 시 driver 자동 배치)
          side: s.popoverSide,
          align: s.popoverAlign,
          showButtons: ['next', 'previous', 'close'],
          progressText: `${i + 1} / ${TUTORIAL_STEPS.length}`,
          // '다음' 버튼도 실제 클릭과 동일 경로로 진행 (로딩 연출 포함)
          onNextClick: () => advanceRef.current(i),
        },
        onHighlightStarted: () => {
          setStepIndex(i);
          setCapture(s.capture);
        },
      })),
      // 닫기(X·ESC)와 마지막 스텝 완료가 모두 여기로 온다.
      // 완료 → 가입 모달, 닫기 → 데모 종료 (2026-10-19 피그마 리뷰: '닫기' 시 데모 종료.
      // 이전에는 닫기도 가입 모달로 점프시켰다)
      onDestroyStarted: () => {
        const completed = !d.hasNextStep() && d.isLastStep();
        if (completed) openModal('completed');
        else closeTour();
      },
    });

    driverRef.current = d;
    setCapture(steps[0].capture);
    setStepIndex(0);
    setPhase('running');
    trackEvent('cta_click', 'agent_tutorial_demo_started', {});
    // 전체화면 레이아웃이 적용된 뒤에 하이라이트 위치를 재도록 한 프레임 지연
    setTimeout(() => {
      if (driverRef.current === d) d.drive();
    }, 80);
  }, [openModal, closeTour, steps, t]);

  // 로딩 연출: driver 오버레이를 잠시 내리고, 실제 대화가 차오르는 화면 캡쳐를
  // 순서대로 전환한 뒤 다음 스텝에서 투어를 재개한다. 별도 UI 없이 실화면만 쓴다.
  const runLoadingThen = useCallback((index: number) => {
    const step = steps[index];
    const loading = step.loadingAfter;
    const d = driverRef.current;
    if (!d || !loading) return;

    d.destroy(); // public destroy — onDestroyStarted 훅을 타지 않는다
    setPhase('analyzing');

    // 배열을 재할당하지 않고 in-place 로 관리한다 — 언마운트 cleanup 이 같은 참조를 본다.
    const timers = loadingTimersRef.current;
    timers.forEach(clearTimeout);
    timers.length = 0;
    let at = 0;
    loading.frames.forEach((frame) => {
      timers.push(setTimeout(() => setCapture(frame.capture), at));
      at += frame.ms;
    });
    timers.push(
      setTimeout(() => {
        setPhase('running');
        d.drive(index + 1); // onHighlightStarted 가 캡쳐·인디케이터를 갱신한다
      }, at),
    );
  }, [steps]);

  // 채팅 시뮬레이션 (타이핑 스트리밍) — 배경 캡쳐로 바꾸고 driver 를 잠시 내린다.
  // 완료 콜백(handleChatSimDone)에서 다음 스텝으로 재개한다.
  const runChatSim = useCallback((index: number) => {
    const step = steps[index];
    const d = driverRef.current;
    if (!d || !step.loadingChat) return;
    d.destroy();
    setCapture(step.loadingChat.background);
    setPhase('analyzing');
  }, [steps]);

  // 채팅 → 결과 전환은 2단계: ① 배경을 먼저 다음 캡쳐로 크로스페이드 — 채팅
  // 컬럼은 오버레이가 덮고 있어 지도 영역만 바뀐다 (loading 캡쳐에 구워진 옛
  // 채팅이 비쳐 보이는 문제 방지). ② 채팅 컬럼을 페이드 아웃 — 결과 카드는
  // 캡쳐 속 같은 위치에 안착해 있어 끊김 없이 이어진다.
  const handleChatSimDone = useCallback(() => {
    const d = driverRef.current;
    if (!d) return;
    const next = stepIndex + 1; // 시뮬레이션 동안 stepIndex 는 시작 스텝에 머물러 있다
    setCapture(steps[next].capture);
    setChatExiting(true);
    loadingTimersRef.current.push(
      setTimeout(() => {
        setChatExiting(false);
        setPhase('running');
        d.drive(next);
      }, 700), // 배경 크로스페이드(350ms) + 컬럼 페이드(300ms, 350ms 지연)
    );
  }, [stepIndex, steps]);

  // 분석 연출 건너뛰기 (2026-10-19 피그마 리뷰: 재생 시간이 길다) — 채팅 시뮬레이션을
  // 끊고 결과 카드가 나온 다음 스텝으로 바로 넘어간다. phase 가 바뀌면 시뮬레이션이
  // 언마운트되며 자체 타이머를 정리한다.
  const skipAnalysis = useCallback(() => {
    const d = driverRef.current;
    if (!d) return;
    const timers = loadingTimersRef.current;
    timers.forEach(clearTimeout);
    timers.length = 0;
    const next = stepIndex + 1;
    setCapture(steps[next].capture);
    setChatExiting(false);
    setPhase('running');
    d.drive(next);
    trackEvent('cta_click', 'agent_tutorial_demo_analysis_skipped', {});
  }, [stepIndex, steps]);

  // 스텝 진행 — 로딩 연출이 있으면 재생 후, 없으면 즉시 다음 스텝으로.
  // 마지막 스텝에서는 driver 내부 destroy → onDestroyStarted → 가입 모달로 이어진다.
  const advanceStep = useCallback(
    (index: number) => {
      const d = driverRef.current;
      if (!d || d.getActiveIndex() !== index) return;
      if (steps[index].loadingChat) {
        runChatSim(index);
      } else if (steps[index].loadingAfter) {
        runLoadingThen(index);
      } else {
        d.moveNext();
      }
    },
    [runChatSim, runLoadingThen, steps],
  );

  useEffect(() => {
    advanceRef.current = advanceStep;
  }, [advanceStep]);

  const handleHotspotClick = useCallback(
    (index: number) => {
      const s = steps[index];
      // 진행 버튼(advanceHotspot)이 따로 있는 스텝은 핫스팟 클릭으로 진행하지 않는다
      if (s.action !== 'click' || s.advanceHotspot) return;
      advanceStep(index);
    },
    [advanceStep, steps],
  );

  // 캡쳐 프리로드 — 로딩 프레임 전환이 이미지 로딩 없이 즉시 일어나야 실화면처럼 보인다
  useEffect(() => {
    const urls = new Set<string>();
    steps.forEach((s) => {
      urls.add(s.capture);
      s.loadingAfter?.frames.forEach((f) => urls.add(f.capture));
    });
    urls.add(COMPARE_ASSETS.before);
    urls.add(COMPARE_ASSETS.afterBase);
    urls.add(COMPARE_ASSETS.severity);
    screen.articleSegments.forEach((seg) => urls.add(seg));
    steps.forEach((s) => {
      if (s.loadingChat) urls.add(s.loadingChat.background);
    });
    urls.add('/proposals/agent-tutorial/mascot.png');
    urls.forEach((u) => {
      const img = new window.Image();
      img.src = u;
    });
  }, [steps, screen]);

  // 언마운트 시 driver 오버레이·로딩 타이머 잔재 제거
  useEffect(() => {
    const timers = loadingTimersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  const closeModal = useCallback(() => {
    setPhase('done');
  }, []);

  const activeStep = phase === 'running' ? steps[stepIndex] : undefined;
  const chatSim = phase === 'analyzing' ? steps[stepIndex]?.loadingChat : undefined;

  // 데모 진행 중에는 전체화면(시어터 모드) — 화면 안의 화면이 아니라 실사용 크기로 보여준다
  const fullscreen = phase === 'running' || phase === 'analyzing' || phase === 'modal';

  useEffect(() => {
    if (!fullscreen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  const replay = useCallback(() => {
    startTour();
  }, [startTour]);

  return (
    <div lang={locale}>
      <div
        className={
          fullscreen
            ? // 실제 화면처럼: 사이트 헤더(z-50)·여백 없이 캡쳐가 뷰포트를 채운다.
              // 비율이 다른 뷰포트에서 남는 가장자리만 불투명 검정 레터박스
              'dark fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0c]'
            : ''
        }
      >
      {/* 한/영 전환 — 시작 전·종료 후에만. 스텝 인디케이터(1-6)는 2026-10-23 요청으로 제거
          (팝오버의 n / 6 진행 표시만 남김) */}
      {!fullscreen && onLocaleChange && (
      <div className="flex items-center justify-end mb-12">
        <Tabs.Root
          value={locale}
          onValueChange={(v) => onLocaleChange(v === 'en' ? 'en' : 'ko')}
        >
          <Tabs.List aria-label={t.languageLabel}>
            <Tabs.Tab value="ko">한국어</Tabs.Tab>
            <Tabs.Tab value="en">English</Tabs.Tab>
          </Tabs.List>
        </Tabs.Root>
      </div>
      )}

      {/* 모든 화면 공통 [다시 보지 않기] [닫기] (2026-10-19 피그마 리뷰) — 기존
          '건너뛰기(→ 가입 모달)'를 대체. driver 오버레이 위에서 클릭돼야 하므로 portal */}
      {(phase === 'running' || phase === 'analyzing') && (
        <TourControls
          checked={dontShowAgain}
          onCheckedChange={toggleDontShowAgain}
          onClose={closeTour}
          dontShowAgainLabel={t.dontShowAgain}
          closeLabel={t.close}
        />
      )}

      {/* 캡쳐 스테이지 — aspect-ratio 고정, 핫스팟은 % 절대배치로 스케일 추종.
          전체화면에서는 뷰포트를 꽉 채운다 (비율 유지 contain — 크롭하면 핫스팟·헤더가 잘린다) */}
      <div
        ref={stageRef}
        // @container: 채팅 시뮬레이션의 폰트가 스테이지 폭에 비례(cqw)해 캡쳐와 같은 배율로 보이게.
        // 테두리는 inset-ring 대신 border — 안쪽 그림자는 캡쳐 이미지에 가려진다.
        // 전체화면에서는 테두리·라운드 없이 실화면처럼
        className={`dark @container relative overflow-hidden select-none bg-bg-tertiary ${
          fullscreen ? 'shrink-0' : 'w-full rounded-sm border border-border-tertiary'
        }`}
        style={{
          aspectRatio: `${CAPTURE_WIDTH} / ${CAPTURE_HEIGHT}`,
          ...(fullscreen
            ? { width: `min(100vw, calc(100vh * ${CAPTURE_WIDTH / CAPTURE_HEIGHT}))` }
            : {}),
        }}
      >
        {/* 대기·종료 화면은 항상 현재 로케일의 첫 화면 — 투어 밖에서 한/영을 바꿔도 따라온다 */}
        <StageCapture
          src={phase === 'idle' || phase === 'done' ? steps[0].capture : capture}
          alt={t.stageAlt(stepIndex + 1)}
        />

        {/* 투명 핫스팟 — driver.js 타겟. 스텝별로 미리 깔아두고 활성 스텝만 클릭 허용 */}
        {steps.map((s, i) => (
          <div
            key={s.id}
            id={`tut-hotspot-${s.id}`}
            onClick={() => handleHotspotClick(i)}
            // 리뷰 반영: 직접 클릭 대상은 진행 버튼(AdvanceButton)과 동일한 민트
            // 펄스로 통일 — 액션 유도 효과가 스텝마다 다르지 않게
            className={
              phase === 'running' && i === stepIndex && s.action === 'click' && !s.advanceHotspot
                ? 'absolute ep-advance-pulse rounded-sm'
                : 'absolute'
            }
            style={{
              left: `${s.hotspot.x}%`,
              top: `${s.hotspot.y}%`,
              width: `${s.hotspot.w}%`,
              height: `${s.hotspot.h}%`,
              cursor:
                phase === 'running' && i === stepIndex && s.action === 'click' && !s.advanceHotspot
                  ? 'pointer'
                  : 'default',
              pointerEvents: phase === 'running' && i === stepIndex ? 'auto' : 'none',
            }}
            aria-label={s.title}
          >
            {/* 클릭 유도 핑 — 직접 클릭해야 하는 영역임을 시각적으로 강조 */}
            {phase === 'running' &&
              i === stepIndex &&
              s.action === 'click' &&
              !s.advanceHotspot && <span className="ep-click-ping" aria-hidden />}
            {/* 전·후 비교 위젯 — 활성 스텝, 그리고 같은 캡쳐를 쓰는 다음 스텝
                (open-article)까지 유지. 스텝 전환에서 언마운트되면 사용자가
                움직여 둔 슬라이더·불투명도가 캡쳐의 구운 상태로 점프한다 */}
            {s.widget === 'compare' &&
              phase === 'running' &&
              (i === stepIndex || steps[stepIndex]?.capture === s.capture) && (
              <BeforeAfterSlider
                beforeSrc={COMPARE_ASSETS.before}
                afterBaseSrc={COMPARE_ASSETS.afterBase}
                severitySrc={COMPARE_ASSETS.severity}
                beforeLabel={t.map.beforeLabel}
                afterLabel={t.map.afterLabel}
                hintsEnabled={i === stepIndex}
                locale={locale}
              />
            )}
            {/* 분석 아티클 — 실제 iframe 영역처럼 원본 해상도 세그먼트를 세로로 스크롤 */}
            {s.widget === 'article' && phase === 'running' && i === stepIndex && (
              <div
                className="absolute inset-0 overflow-y-auto overflow-x-hidden"
                // 라이브 복제(§7 예외): 실서비스 아티클 iframe 배경색 실측값 — 세그먼트 캡쳐 여백과 이어지게
                style={{ background: '#F2F3F7' }}
                aria-label={t.articleLabel}
              >
                {screen.articleSegments.map((seg) => (
                  // eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요
                  <img key={seg} src={seg} alt="" className="block w-full max-w-none" draggable={false} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* 분석 채팅 시뮬레이션 — 유저 버블 → 마스코트 흔들림 + 타이핑 스트리밍 → 분석 중 */}
        {chatSim && (
          <AnalysisChatSim
            sim={chatSim}
            onDone={handleChatSimDone}
            exiting={chatExiting}
            locale={locale}
          />
        )}

        {/* 분석 연출 안내 + 건너뛰기 — 지도 영역 상단, 검색창 아래 (피그마 댓글 위치) */}
        {chatSim?.skipNotice && !chatExiting && (
          <div
            role="status"
            className="absolute z-10 flex items-center gap-12 rounded-full bg-bg-secondary py-4 pl-16 pr-4 shadow-6 inset-ring-1 inset-ring-border-tertiary"
            style={{ left: '43.5%', top: '13.5%' }}
          >
            <span className="text-body-sm-regular text-text-secondary">{chatSim.skipNotice}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={skipAnalysis}
              className="rounded-full text-text-primary inset-ring-border-tertiary not-data-disabled:not-aria-invalid:hover:bg-bg-tertiary not-data-disabled:not-aria-invalid:hover:inset-ring-border-tertiary"
            >
              {t.skip}
            </Button>
          </div>
        )}

        {/* 튜토리얼 재진입 — Agent 첫 화면 빈 상태 안내문 아래 (2026-10-19 피그마 리뷰).
            닫은 뒤, 또는 '다시 보지 않기'가 저장돼 자동 표시를 건너뛴 첫 진입에서 보인다 */}
        {(phase === 'done' || (phase === 'idle' && dismissed)) && (
          <TourEntryButton onClick={startTour} label={t.tourEntry} rect={screen.tourEntryRect} />
        )}

        {/* 진행 클릭 버튼 — 실제 UX 의 버튼 위치를 오버레이 위에 밝게 띄운다.
            전체화면 컨테이너(fixed)가 스태킹 컨텍스트를 만들어 z-index 가 갇히므로
            portal 로 body 에 직접 렌더한다 (driver 오버레이 z 1e9 위) */}
        {activeStep?.advanceHotspot && (
          <AdvanceButton
            stageRef={stageRef}
            capture={activeStep.capture}
            hotspot={activeStep.advanceHotspot}
            label={activeStep.advanceLabel ?? t.nextBtn}
            onClick={() => advanceStep(stepIndex)}
          />
        )}


        {/* 시작 오버레이 — 실서비스의 '첫 진입 자동 표시' 자리. 다시 보지 않기가
            저장돼 있으면 띄우지 않는다. 닫은 뒤에는 재진입 버튼(TourEntryButton)이 대신한다 */}
        {phase === 'idle' && !dismissed && (
          // 스크림 색 = 운영 값 rgba(14,14,16,0.65) (§8)
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-16 bg-[rgba(14,14,16,0.65)] backdrop-blur-[2px]">
            <p className="text-body-md-regular text-text-tertiary">{t.startIntro}</p>
            <Button
              variant="solid"
              size="lg"
              onClick={startTour}
              // 색만 운영 값(§8): 민트 CTA(accent) + 어두운 글자, hover opacity 0.85
              className="bg-bg-interactive-primary text-text-inverse transition-opacity hover:opacity-85 not-data-disabled:not-aria-invalid:hover:bg-bg-interactive-primary not-data-disabled:data-active:not-hover:text-text-inverse"
            >
              {t.startButton}
            </Button>
          </div>
        )}

        <SignupConversionModal
          open={phase === 'modal'}
          onReplay={replay}
          onClose={closeModal}
          locale={locale}
        />
      </div>
      </div>
    </div>
  );
}

// 캡쳐 전환 크로스페이드: 하드 스왑은 결과 화면이 서프라이즈로 뜨는 느낌을 줘서,
// 이전 프레임을 깔아두고 새 프레임을 350ms(--duration-medium, DESIGN.md Motion)로
// 페이드 인한다. reduced-motion 에서도 opacity 전환은 유지한다 (DESIGN.md 규칙).
function StageCapture({ src, alt }: { src: string; alt: string }) {
  const lastRef = useRef(src);
  const [prev, setPrev] = useState<string | null>(null);

  useEffect(() => {
    if (lastRef.current === src) return;
    setPrev(lastRef.current);
    lastRef.current = src;
    const t = setTimeout(() => setPrev(null), 400);
    return () => clearTimeout(t);
  }, [src]);

  return (
    <>
      {/* 아래층은 항상 마운트 유지 — 전환 때 요소를 새로 만들면 페인트 공백
          1-2 프레임 동안 어두운 배경이 비쳐 화면이 깜빡인다. 전환 중에는 이전
          캡쳐(prev)를 그대로 들고 있다가, 페이드가 끝난 뒤 현재 캡쳐로 따라온다
          (그 시점엔 위층이 완전 불투명이라 교체가 보이지 않는다) */}
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요 */}
      <img
        src={prev ?? src}
        alt=""
        className="absolute inset-0 w-full h-full"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요 */}
      <img
        key={src}
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full ep-capture-fade"
        draggable={false}
      />
    </>
  );
}

// 모든 화면 공통 [다시 보지 않기] [닫기] — 전체화면 상단 바 오른쪽 자리(px-24 py-16)에
// 고정. AdvanceButton 과 같은 이유로 body 에 portal 하고 driver 오버레이 위에 띄운다
// (tutorial.css .ep-tour-controls 가 driver 의 pointer-events 차단을 푼다).
// 다크 토큰을 쓰도록 portal 루트에 .dark 를 다시 건다.
function TourControls({
  checked,
  onCheckedChange,
  onClose,
  dontShowAgainLabel,
  closeLabel,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onClose: () => void;
  dontShowAgainLabel: string;
  closeLabel: string;
}) {
  return createPortal(
    <div
      // 전체화면에서는 캡쳐 위에 바로 떠 있으므로 표면(pill)을 깔아 어떤 배경에서도 읽히게
      className="dark ep-tour-controls fixed right-16 top-16 flex items-center gap-16 rounded-full bg-bg-secondary py-4 pl-16 pr-4 shadow-6 inset-ring-1 inset-ring-border-tertiary"
      style={{ zIndex: 1000000001 }}
    >
      <Field.Root orientation="horizontal" className="w-fit">
        <Field.Control>
          <Checkbox checked={checked} onCheckedChange={(c) => onCheckedChange(c === true)} />
        </Field.Control>
        <Field.Label className="text-body-sm-regular text-text-secondary">{dontShowAgainLabel}</Field.Label>
      </Field.Root>
      <Button
        variant="outline"
        size="sm"
        onClick={onClose}
        // 색만 운영 값(§8): 기존 건너뛰기 버튼과 같은 muted 글자 + border 테두리
        className="text-text-tertiary inset-ring-border-tertiary not-data-disabled:not-aria-invalid:hover:bg-bg-secondary not-data-disabled:not-aria-invalid:hover:inset-ring-border-tertiary not-data-disabled:data-active:not-hover:bg-transparent not-data-disabled:data-active:not-hover:inset-ring-border-tertiary not-data-disabled:data-active:not-hover:text-text-tertiary"
      >
        {closeLabel}
      </Button>
    </div>,
    document.body,
  );
}

// 'EP Agent 둘러보기' 재진입 버튼 — 실서비스 첫 화면 빈 상태 안내문 바로 아래에 놓일
// DOM 을 캡쳐 위에 재현한다. 캡쳐와 같은 배율로 보이도록 글자는 cqw 로 스케일
// (AnalysisChatSim 과 같은 방식: 14px / 1600px = 0.875cqw), 색은 캡쳐 실측 채팅 색.
function TourEntryButton({
  onClick,
  label,
  rect,
}: {
  onClick: () => void;
  label: string;
  rect: TutorialHotspot;
}) {
  const { x, y, w, h } = rect;
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute z-10 flex cursor-pointer items-center justify-center rounded-full border-none p-0 transition-colors hover:bg-[rgba(231,235,239,0.08)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus-ring"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        gap: '0.35em',
        fontSize: '0.875cqw',
        color: CHAT_COLORS.agentText,
        // 라이브 복제(§7 예외): 채팅 컬럼 구분선 실측값 (MAP_TOP_BARS.colors.border)
        boxShadow: 'inset 0 0 0 1px #24405b',
      }}
    >
      <IconPlay style={{ width: '1.15em', height: '1.15em' }} aria-hidden />
      <span>{label}</span>
    </button>
  );
}

// 진행 클릭 버튼: 캡쳐에서 해당 버튼 픽셀만 잘라 driver 오버레이 위에 원래 위치
// 그대로 밝게 띄운다 — 승인자는 실제 버튼을 누르는 것처럼 클릭한다.
// 스테이지 조상(fixed 컨테이너)이 스태킹 컨텍스트를 만들면 z-index 가 갇혀
// 오버레이에 가려지므로, body 로 portal 하고 위치는 스테이지 rect 로 실측한다.
function AdvanceButton({
  stageRef,
  capture,
  hotspot,
  label,
  onClick,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  capture: string;
  hotspot: TutorialHotspot;
  label: string;
  onClick: () => void;
}) {
  const { x, y, w, h } = hotspot;
  const [box, setBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setBox({
        left: r.left + (x / 100) * r.width,
        top: r.top + (y / 100) * r.height,
        width: (w / 100) * r.width,
        height: (h / 100) * r.height,
      });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [stageRef, x, y, w, h]);

  if (!box) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: box.left,
        top: box.top,
        width: box.width,
        height: box.height,
        // driver 오버레이(z-index 1e9)보다 위 — 버튼만 어두워지지 않고 떠 보인다
        zIndex: 1000000001,
        pointerEvents: 'none',
      }}
    >
      {/* 클릭 유도 핑 — 버튼 밖으로 퍼지는 링 (overflow 제약 없는 래퍼에 배치) */}
      <span className="ep-click-ping" aria-hidden />
      <button
        onClick={onClick}
        // pointer-events-auto: driver.css 의 `.driver-active * { pointer-events: none }` 를 이긴다
        // (tutorial.css .ep-advance-btn 에도 !important 로 한 번 더 걸려 있다).
        // NDS Button 이 아닌 이유: 캡쳐 속 실제 버튼 픽셀을 그대로 보여주는 투명 클릭 영역이다
        className="absolute inset-0 overflow-hidden ep-advance-pulse ep-advance-btn pointer-events-auto cursor-pointer border-none p-0 bg-transparent rounded-sm"
        aria-label={label}
        title={label}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 캡쳐 크롭 표시용 */}
        <img
          src={capture}
          alt=""
          draggable={false}
          className="absolute max-w-none"
          style={{
            width: `${10000 / w}%`,
            height: `${10000 / h}%`,
            left: `${-(x / w) * 100}%`,
            top: `${-(y / h) * 100}%`,
          }}
        />
      </button>
    </div>,
    document.body,
  );
}
