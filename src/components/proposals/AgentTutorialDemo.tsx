'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import {
  HIGHLIGHT_STEPS,
  TUTORIAL_STEPS,
  CAPTURE_WIDTH,
  CAPTURE_HEIGHT,
  COMPARE_ASSETS,
  ARTICLE_ASSETS,
  type TutorialHotspot,
} from '@/lib/agent-tutorial-steps';
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
export default function AgentTutorialDemo() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [stepIndex, setStepIndex] = useState(0);
  const [capture, setCapture] = useState(HIGHLIGHT_STEPS[0].capture);
  // driverRef 는 투어 진행 중에만 non-null — openModal/언마운트에서 null 로 되돌린다.
  const driverRef = useRef<Driver | null>(null);
  const loadingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  // 진행 버튼(portal)의 위치 계산 기준이 되는 캡쳐 스테이지
  const stageRef = useRef<HTMLDivElement>(null);
  // 팝오버 '다음' 버튼이 최신 advanceStep 을 부르도록 (startTour 가 advanceStep 보다 먼저 정의됨)
  const advanceRef = useRef<(i: number) => void>(() => {});

  const openModal = useCallback((reason: 'completed' | 'skipped') => {
    driverRef.current?.destroy();
    driverRef.current = null;
    setStepIndex(MODAL_STEP_INDEX);
    setPhase('modal');
    trackEvent('cta_click', `agent_tutorial_demo_${reason}`, {});
  }, []);

  const startTour = useCallback(() => {
    driverRef.current?.destroy();

    const d = driver({
      showProgress: false,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.72,
      stagePadding: 6,
      popoverClass: 'ep-tutorial-popover',
      nextBtnText: '다음',
      prevBtnText: '이전',
      doneBtnText: '계속',
      steps: HIGHLIGHT_STEPS.map((s, i) => ({
        element: `#tut-hotspot-${s.id}`,
        popover: {
          title: s.title,
          description:
            s.action === 'click'
              ? `${s.body}<div class="ep-tutorial-click-hint">▸ ${
                  s.advanceLabel
                    ? `화면의 '${s.advanceLabel}' 버튼을 직접 클릭해 보세요 — '다음'으로도 진행됩니다`
                    : "하이라이트된 예시를 직접 클릭해 보세요 — '다음'으로도 진행됩니다"
                }</div>`
              : s.body,
          showButtons: ['next', 'previous', 'close'],
          // '다음' 버튼도 실제 클릭과 동일 경로로 진행 (로딩 연출 포함)
          onNextClick: () => advanceRef.current(i),
        },
        onHighlightStarted: () => {
          setStepIndex(i);
          setCapture(s.capture);
        },
      })),
      // 건너뛰기(닫기·ESC·오버레이 클릭)와 마지막 스텝 완료가 모두 여기로 온다.
      // 어느 쪽이든 스텝 5(가입 모달)로 점프 — 전환 지점은 항상 통과시킨다.
      onDestroyStarted: () => {
        const completed = !d.hasNextStep() && d.isLastStep();
        openModal(completed ? 'completed' : 'skipped');
      },
    });

    driverRef.current = d;
    setCapture(HIGHLIGHT_STEPS[0].capture);
    setStepIndex(0);
    setPhase('running');
    trackEvent('cta_click', 'agent_tutorial_demo_started', {});
    // 전체화면 레이아웃이 적용된 뒤에 하이라이트 위치를 재도록 한 프레임 지연
    setTimeout(() => {
      if (driverRef.current === d) d.drive();
    }, 80);
  }, [openModal]);

  // 로딩 연출: driver 오버레이를 잠시 내리고, 실제 대화가 차오르는 화면 캡쳐를
  // 순서대로 전환한 뒤 다음 스텝에서 투어를 재개한다. 별도 UI 없이 실화면만 쓴다.
  const runLoadingThen = useCallback((index: number) => {
    const step = HIGHLIGHT_STEPS[index];
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
  }, []);

  // 채팅 시뮬레이션 (타이핑 스트리밍) — 배경 캡쳐로 바꾸고 driver 를 잠시 내린다.
  // 완료 콜백(handleChatSimDone)에서 다음 스텝으로 재개한다.
  const runChatSim = useCallback((index: number) => {
    const step = HIGHLIGHT_STEPS[index];
    const d = driverRef.current;
    if (!d || !step.loadingChat) return;
    d.destroy();
    setCapture(step.loadingChat.background);
    setPhase('analyzing');
  }, []);

  const handleChatSimDone = useCallback(() => {
    const d = driverRef.current;
    if (!d) return;
    setPhase('running');
    d.drive(stepIndex + 1); // 시뮬레이션 동안 stepIndex 는 시작 스텝에 머물러 있다
  }, [stepIndex]);

  // 스텝 진행 — 로딩 연출이 있으면 재생 후, 없으면 즉시 다음 스텝으로.
  // 마지막 스텝에서는 driver 내부 destroy → onDestroyStarted → 가입 모달로 이어진다.
  const advanceStep = useCallback(
    (index: number) => {
      const d = driverRef.current;
      if (!d || d.getActiveIndex() !== index) return;
      if (HIGHLIGHT_STEPS[index].loadingChat) {
        runChatSim(index);
      } else if (HIGHLIGHT_STEPS[index].loadingAfter) {
        runLoadingThen(index);
      } else {
        d.moveNext();
      }
    },
    [runChatSim, runLoadingThen],
  );

  useEffect(() => {
    advanceRef.current = advanceStep;
  }, [advanceStep]);

  const handleHotspotClick = useCallback(
    (index: number) => {
      const s = HIGHLIGHT_STEPS[index];
      // 진행 버튼(advanceHotspot)이 따로 있는 스텝은 핫스팟 클릭으로 진행하지 않는다
      if (s.action !== 'click' || s.advanceHotspot) return;
      advanceStep(index);
    },
    [advanceStep],
  );

  // 캡쳐 프리로드 — 로딩 프레임 전환이 이미지 로딩 없이 즉시 일어나야 실화면처럼 보인다
  useEffect(() => {
    const urls = new Set<string>();
    HIGHLIGHT_STEPS.forEach((s) => {
      urls.add(s.capture);
      s.loadingAfter?.frames.forEach((f) => urls.add(f.capture));
    });
    urls.add(COMPARE_ASSETS.before);
    urls.add(COMPARE_ASSETS.afterBase);
    urls.add(COMPARE_ASSETS.severity);
    ARTICLE_ASSETS.segments.forEach((seg) => urls.add(seg));
    HIGHLIGHT_STEPS.forEach((s) => {
      if (s.loadingChat) urls.add(s.loadingChat.background);
    });
    urls.add('/proposals/agent-tutorial/mascot.png');
    urls.forEach((u) => {
      const img = new window.Image();
      img.src = u;
    });
  }, []);

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

  const activeStep = phase === 'running' ? HIGHLIGHT_STEPS[stepIndex] : undefined;
  const chatSim = phase === 'analyzing' ? HIGHLIGHT_STEPS[stepIndex]?.loadingChat : undefined;

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
    <div>
      <div
        className={
          fullscreen
            ? 'fixed inset-0 z-[100] flex flex-col px-6 py-4'
            : ''
        }
        style={fullscreen ? { background: 'rgba(10, 10, 12, 0.98)' } : undefined}
      >
      {/* 스텝 인디케이터 — 진행 가시화 (완주율 모범사례) */}
      <div className="flex items-center justify-between mb-3">
        <ol className="flex items-center gap-2" aria-label="튜토리얼 진행 단계">
          {TUTORIAL_STEPS.map((s, i) => {
            const active = phase !== 'idle' && i === stepIndex;
            const passed = phase !== 'idle' && i < stepIndex;
            return (
              <li key={s.id} className="flex items-center gap-2">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-mono transition-colors"
                  style={{
                    background: active ? 'var(--accent)' : passed ? 'var(--surface-elevated)' : 'transparent',
                    color: active ? '#0E0E10' : passed ? 'var(--text)' : 'var(--text-muted)',
                    border: active ? 'none' : '1px solid var(--border)',
                  }}
                  aria-current={active ? 'step' : undefined}
                >
                  {i + 1}
                </span>
                {i < TUTORIAL_STEPS.length - 1 && (
                  <span className="w-4 h-px" style={{ background: 'var(--border)' }} aria-hidden />
                )}
              </li>
            );
          })}
        </ol>

        {phase === 'running' && (
          <button
            onClick={() => openModal('skipped')}
            className="text-sm px-3.5 py-2 rounded-md transition-colors hover:bg-[var(--surface)]"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            건너뛰기
          </button>
        )}
      </div>

      {/* 캡쳐 스테이지 — aspect-ratio 고정, 핫스팟은 % 절대배치로 스케일 추종.
          전체화면에서는 뷰포트에 꽉 차게 (비율 유지, 레터박스) */}
      <div className={fullscreen ? 'flex-1 flex items-center justify-center min-h-0' : ''}>
      <div
        ref={stageRef}
        className="relative w-full overflow-hidden select-none"
        style={{
          aspectRatio: `${CAPTURE_WIDTH} / ${CAPTURE_HEIGHT}`,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg)',
          // 채팅 시뮬레이션의 폰트가 스테이지 폭에 비례(cqw)해 캡쳐와 같은 배율로 보이게
          containerType: 'inline-size',
          ...(fullscreen
            ? {
                width: `min(100%, calc((100vh - 130px) * ${CAPTURE_WIDTH / CAPTURE_HEIGHT}))`,
              }
            : {}),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 placeholder SVG, 최적화 불필요 */}
        <img
          src={capture}
          alt={`Agent 화면 캡쳐 — 스텝 ${stepIndex + 1}`}
          className="absolute inset-0 w-full h-full"
          draggable={false}
        />

        {/* 투명 핫스팟 — driver.js 타겟. 스텝별로 미리 깔아두고 활성 스텝만 클릭 허용 */}
        {HIGHLIGHT_STEPS.map((s, i) => (
          <div
            key={s.id}
            id={`tut-hotspot-${s.id}`}
            onClick={() => handleHotspotClick(i)}
            className="absolute"
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
            {/* 전·후 비교 위젯 — 활성 스텝일 때만 하이라이트 컷아웃 안에 렌더 */}
            {s.widget === 'compare' && phase === 'running' && i === stepIndex && (
              <BeforeAfterSlider
                beforeSrc={COMPARE_ASSETS.before}
                afterBaseSrc={COMPARE_ASSETS.afterBase}
                severitySrc={COMPARE_ASSETS.severity}
                beforeLabel={COMPARE_ASSETS.beforeLabel}
                afterLabel={COMPARE_ASSETS.afterLabel}
              />
            )}
            {/* 분석 아티클 — 실제 iframe 영역처럼 원본 해상도 세그먼트를 세로로 스크롤 */}
            {s.widget === 'article' && phase === 'running' && i === stepIndex && (
              <div
                className="absolute inset-0 overflow-y-auto overflow-x-hidden"
                style={{ background: '#F2F3F7' }}
                aria-label="분석 아티클 (스크롤 가능)"
              >
                {ARTICLE_ASSETS.segments.map((seg) => (
                  // eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요
                  <img key={seg} src={seg} alt="" className="block w-full max-w-none" draggable={false} />
                ))}
              </div>
            )}
          </div>
        ))}

        {/* 분석 채팅 시뮬레이션 — 유저 버블 → 마스코트 흔들림 + 타이핑 스트리밍 → 분석 중 */}
        {chatSim && <AnalysisChatSim sim={chatSim} onDone={handleChatSimDone} />}

        {/* 진행 클릭 버튼 — 실제 UX 의 버튼 위치를 오버레이 위에 밝게 띄운다.
            전체화면 컨테이너(fixed)가 스태킹 컨텍스트를 만들어 z-index 가 갇히므로
            portal 로 body 에 직접 렌더한다 (driver 오버레이 z 1e9 위) */}
        {activeStep?.advanceHotspot && (
          <AdvanceButton
            stageRef={stageRef}
            capture={activeStep.capture}
            hotspot={activeStep.advanceHotspot}
            label={activeStep.advanceLabel ?? '다음'}
            onClick={() => advanceStep(stepIndex)}
          />
        )}


        {/* 시작/재시작 오버레이 */}
        {(phase === 'idle' || phase === 'done') && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4"
            style={{ background: 'rgba(14,14,16,0.65)', backdropFilter: 'blur(2px)' }}
          >
            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
              승인자가 직접 클릭하며 체험하는 5스텝 데모입니다
            </p>
            <button
              onClick={startTour}
              className="px-7 py-3.5 rounded-md text-base font-semibold transition-opacity hover:opacity-85"
              style={{ background: 'var(--accent)', color: '#0E0E10' }}
            >
              {phase === 'idle' ? '데모 시작하기' : '데모 다시 보기'}
            </button>
          </div>
        )}

        <SignupConversionModal open={phase === 'modal'} onReplay={replay} onClose={closeModal} />
      </div>
      </div>
      </div>

      <p className="mt-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        캡쳐: agent.ep.naraspace.com 실화면 (2026-09-28, 산타로사섬 산불 분석) · 대화
        목록·계정 정보는 블러 처리
      </p>
    </div>
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
        className="absolute inset-0 overflow-hidden ep-advance-pulse ep-advance-btn"
        style={{
          // driver.css 의 `.driver-active * { pointer-events: none }` 를 이긴다
          pointerEvents: 'auto',
          cursor: 'pointer',
          border: 'none',
          padding: 0,
          background: 'transparent',
          borderRadius: '6px',
        }}
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
