'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { driver, type Driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { Button } from '@naraspace-technology/nds/components';
import {
  CHOICE_STEP,
  TRACK_STEPS,
  CAPTURE_WIDTH,
  CAPTURE_HEIGHT,
  type OrderHighlightStep,
  type OrderTrack,
  type StageRect,
  type StepEffect,
} from '@/lib/order-tutorial-steps';
import TaskingSim, { TaskingMapLayer, type TaskingSimMode } from '@/components/proposals/TaskingSim';
import OrderSignupModal from '@/components/proposals/OrderSignupModal';
import { trackEvent } from '@/lib/analytics';

type DemoPhase = 'idle' | 'running' | 'transition' | 'modal' | 'done';

// 투어 = [분기 선택, ...트랙 스텝]. driver 인덱스 0 이 분기, 1.. 이 트랙 스텝이다.
// Tasking 을 고르면 driver 를 Tasking 스텝으로 다시 만들어 인덱스 1 부터 이어 간다.
type TourStep = typeof CHOICE_STEP | OrderHighlightStep;
const tourOf = (track: OrderTrack): TourStep[] => [CHOICE_STEP, ...TRACK_STEPS[track]];

// 트랙 길이가 같아 진행 표시(분기 + 6 + 가입)는 트랙과 무관하게 8칸이다
const INDICATOR_COUNT = 1 + Math.max(TRACK_STEPS.archive.length, TRACK_STEPS.tasking.length) + 1;

// driver 오버레이(z 10000) 위, 팝오버(z 1e9) 아래 — 캡쳐 버튼·스포트라이트·궤도 레이어가
// 오버레이에 가려지지 않으면서 말풍선을 덮지도 않는다
const OVER_OVERLAY_Z = 100000;

function hintFor(s: TourStep): string {
  if (s.type === 'choice') return "Archive 또는 Tasking 탭을 누르세요";
  if (s.widget === 'orbits') return '카드의 동그라미를 체크하세요';
  if (s.id.endsWith('-agree')) return '안내 확인 체크박스를 누르세요';
  if (s.id === 'archive-pick') return '카드 왼쪽 동그라미를 누르세요';
  return `화면의 '${s.advanceLabel ?? ''}' 버튼을 누르세요`;
}

export default function OrderTutorialDemo() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [track, setTrack] = useState<OrderTrack>('archive');
  const [stepIndex, setStepIndex] = useState(0); // 투어 인덱스 (0 = 분기)
  const [capture, setCapture] = useState(CHOICE_STEP.capture);
  const [effect, setEffect] = useState<StepEffect | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [completed, setCompleted] = useState(false);
  const driverRef = useRef<Driver | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<OrderTrack>('archive');
  const advanceRef = useRef<(i: number) => void>(() => {});

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.length = 0;
  };

  const openModal = useCallback((reason: 'completed' | 'skipped') => {
    clearTimers();
    driverRef.current?.destroy();
    driverRef.current = null;
    setEffect(null);
    setCompleted(reason === 'completed');
    setPhase('modal');
    trackEvent('cta_click', `order_tutorial_demo_${reason}`, { track: trackRef.current });
  }, []);

  const buildDriver = useCallback(
    (t: OrderTrack) => {
      const steps = tourOf(t);
      const d = driver({
        showProgress: false,
        animate: true,
        allowClose: true,
        overlayOpacity: 0.72,
        stagePadding: 6,
        popoverClass: 'ot-popover',
        nextBtnText: '다음',
        prevBtnText: '이전',
        doneBtnText: '계속',
        steps: steps.map((s, i) => ({
          element: `#ot-hotspot-${s.id}`,
          popover: {
            title: s.title,
            description: `${s.body}<div class="ot-hint">${hintFor(s)}</div>`,
            side: s.type === 'choice' ? 'right' : s.popoverSide,
            align: s.type === 'choice' ? 'start' : s.popoverAlign,
            // 분기 스텝은 어느 쪽으로 갈지 골라야 해서 '다음'이 없다
            showButtons: s.type === 'choice' ? ['close'] : ['next', 'previous', 'close'],
            onNextClick: () => advanceRef.current(i),
          },
          onHighlightStarted: () => {
            setStepIndex(i);
            setCapture(s.capture);
          },
        })),
        // 닫기·ESC·오버레이 클릭 → 가입 모달 (전환 지점은 항상 통과)
        onDestroyStarted: () => openModal('skipped'),
      });
      return d;
    },
    [openModal],
  );

  const startTour = useCallback(() => {
    clearTimers();
    driverRef.current?.destroy();
    trackRef.current = 'archive';
    setTrack('archive');
    setPreviewId(null);
    setOrderId(null);
    setEffect(null);
    setCapture(CHOICE_STEP.capture);
    setStepIndex(0);
    setPhase('running');
    const d = buildDriver('archive');
    driverRef.current = d;
    trackEvent('cta_click', 'order_tutorial_demo_started', {});
    // 전체화면 레이아웃이 적용된 뒤에 하이라이트 위치를 잰다
    timersRef.current.push(setTimeout(() => driverRef.current === d && d.drive(), 80));
  }, [buildDriver]);

  // 분기 선택 — Archive 는 그대로 다음 스텝, Tasking 은 driver 를 다시 만든다
  const chooseTrack = useCallback(
    (t: OrderTrack) => {
      trackEvent('cta_click', `order_tutorial_track_${t}`, {});
      if (t === trackRef.current) {
        driverRef.current?.moveNext();
        return;
      }
      driverRef.current?.destroy(); // public destroy — onDestroyStarted 를 타지 않는다
      trackRef.current = t;
      setTrack(t);
      const d = buildDriver(t);
      driverRef.current = d;
      // 새 트랙 핫스팟이 DOM 에 깔린 뒤 시작
      timersRef.current.push(setTimeout(() => driverRef.current === d && d.drive(1), 60));
    },
    [buildDriver],
  );

  // 스텝 진행 — 연출(effect·프레임)이 있으면 driver 를 잠시 내리고 재생한 뒤 다음 스텝에서 재개
  const advanceStep = useCallback(
    (index: number) => {
      const d = driverRef.current;
      if (!d || d.getActiveIndex() !== index) return;
      const steps = tourOf(trackRef.current);
      const step = steps[index];
      if (step.type === 'choice') return; // 분기는 chooseTrack 으로만 진행
      if (index === steps.length - 1) {
        openModal('completed');
        return;
      }
      const next = steps[index + 1];
      const fx = step.effect;
      const frames = step.framesAfter ?? [];
      if (!fx && frames.length === 0) {
        d.moveNext();
        return;
      }

      d.destroy();
      setPhase('transition');
      clearTimers();
      let at = 0;
      const push = (fn: () => void, ms: number) => timersRef.current.push(setTimeout(fn, ms));
      if (fx?.at === 'before') {
        push(() => setEffect(fx), at);
        at += fx.ms;
      }
      frames.forEach((f) => {
        push(() => {
          setEffect(null);
          setCapture(f.capture);
        }, at);
        at += f.ms;
      });
      push(() => {
        setEffect(null);
        setCapture(next.capture);
      }, at);
      if (fx?.at === 'after') {
        at += 350; // 캡쳐 크로스페이드가 끝난 뒤
        push(() => setEffect(fx), at);
        at += fx.ms;
      }
      push(() => {
        setEffect(null);
        setPhase('running');
        d.drive(index + 1);
      }, at);
    },
    [openModal],
  );

  useEffect(() => {
    advanceRef.current = advanceStep;
  }, [advanceStep]);

  const steps = tourOf(track);
  const active = phase === 'running' ? steps[stepIndex] : undefined;
  const activeHighlight = active?.type === 'highlight' ? active : undefined;

  // Tasking 재현 레이어 모드 — 시뮬레이션 대기 연출 중이면 loading
  const simMode: TaskingSimMode | null =
    track !== 'tasking'
      ? null
      : effect?.kind === 'sim-loading'
        ? 'loading'
        : phase === 'running' || phase === 'modal'
          ? (activeHighlight?.widget ?? (phase === 'modal' ? 'agreed' : null))
          : null;

  // 스테이지 배율 — 재현 레이어를 1600×1000 원본 px 로 그려 캡쳐와 맞춘다
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / CAPTURE_WIDTH));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 캡쳐 프리로드 — 프레임 전환이 이미지 로딩 없이 즉시 일어나야 실화면처럼 보인다
  useEffect(() => {
    const urls = new Set<string>([CHOICE_STEP.capture]);
    (Object.keys(TRACK_STEPS) as OrderTrack[]).forEach((t) =>
      TRACK_STEPS[t].forEach((s) => {
        urls.add(s.capture);
        s.framesAfter?.forEach((f) => urls.add(f.capture));
      }),
    );
    urls.forEach((u) => {
      const img = new window.Image();
      img.src = u;
    });
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, []);

  const fullscreen = phase === 'running' || phase === 'transition' || phase === 'modal';

  useEffect(() => {
    if (!fullscreen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [fullscreen]);

  // 진행 표시 위치: 분기 = 0, 트랙 스텝 = 1.., 가입 모달 = 마지막
  const indicatorIndex = phase === 'modal' || phase === 'done' ? INDICATOR_COUNT - 1 : stepIndex;

  return (
    <div>
      <div
        className={fullscreen ? 'fixed inset-0 z-[100] flex flex-col px-24 py-16' : ''}
        style={fullscreen ? { background: 'rgba(10, 10, 12, 0.98)' } : undefined}
      >
        <div className="mb-12 flex items-center justify-between">
          <ol className="flex items-center gap-8" aria-label="튜토리얼 진행 단계">
            {Array.from({ length: INDICATOR_COUNT }).map((_, i) => {
              const on = phase !== 'idle' && i === indicatorIndex;
              const passed = phase !== 'idle' && i < indicatorIndex;
              return (
                <li key={i} className="flex items-center gap-8">
                  <span
                    className={[
                      'flex size-28 items-center justify-center rounded-full font-mono text-body-sm-regular transition-colors',
                      on
                        ? 'bg-bg-interactive-primary text-text-inverse'
                        : passed
                          ? 'bg-bg-primary text-text-primary'
                          : 'border border-border-tertiary text-text-tertiary',
                    ].join(' ')}
                    aria-current={on ? 'step' : undefined}
                  >
                    {i + 1}
                  </span>
                  {i < INDICATOR_COUNT - 1 && <span className="h-px w-16 bg-border-tertiary" aria-hidden />}
                </li>
              );
            })}
            {phase !== 'idle' && stepIndex > 0 && (
              <li className="ml-8 text-body-sm-regular text-text-tertiary">
                {track === 'archive' ? 'Archive · 이미 찍힌 영상' : 'Tasking · 새로 촬영'}
              </li>
            )}
          </ol>

          {phase === 'running' && (
            <Button variant="outline" size="sm" onClick={() => openModal('skipped')}>
              건너뛰기
            </Button>
          )}
        </div>

        <div className={fullscreen ? 'flex min-h-0 flex-1 items-center justify-center' : ''}>
          <div
            ref={stageRef}
            className="relative w-full select-none overflow-hidden rounded-xs border border-border-tertiary bg-bg-tertiary"
            style={{
              aspectRatio: `${CAPTURE_WIDTH} / ${CAPTURE_HEIGHT}`,
              ...(fullscreen ? { width: `min(100%, calc((100vh - 130px) * ${CAPTURE_WIDTH / CAPTURE_HEIGHT}))` } : {}),
            }}
          >
            <StageCapture src={capture} alt={`주문 화면 캡쳐 — 스텝 ${stepIndex + 1}`} />

            {simMode && (
              <TaskingSim
                mode={simMode}
                scale={scale}
                previewId={previewId}
                onPreview={setPreviewId}
                orderId={orderId}
                onOrder={(id) => {
                  setOrderId(id);
                  advanceStep(stepIndex);
                }}
                onBuy={() => advanceStep(stepIndex)}
                onAgree={() => advanceStep(stepIndex)}
                onPay={() => advanceStep(stepIndex)}
              />
            )}

            {effect && effect.kind !== 'sim-loading' && <EffectOverlay effect={effect} />}

            {/* 투명 핫스팟 — driver.js 타겟. 분기 + 현재 트랙 스텝만 깐다 */}
            {steps.map((s, i) => {
              const isActive = phase === 'running' && i === stepIndex;
              // 진행 버튼이 따로 없는 클릭 스텝은 하이라이트 영역 자체가 버튼
              const selfClick = isActive && s.type === 'highlight' && s.action === 'click' && !s.advanceHotspot && !s.widget;
              return (
                <div
                  key={s.id}
                  id={`ot-hotspot-${s.id}`}
                  onClick={selfClick ? () => advanceStep(i) : undefined}
                  className={selfClick ? 'ep-advance-pulse absolute rounded-sm' : 'absolute'}
                  style={{
                    left: `${s.hotspot.x}%`,
                    top: `${s.hotspot.y}%`,
                    width: `${s.hotspot.w}%`,
                    height: `${s.hotspot.h}%`,
                    cursor: selfClick ? 'pointer' : 'default',
                    // 재현 레이어 스텝은 레이어 안 컨트롤이 클릭을 받아야 해서 핫스팟이 통과시킨다
                    pointerEvents: isActive && !(s.type === 'highlight' && s.widget) ? 'auto' : 'none',
                  }}
                  aria-label={s.title}
                >
                  {selfClick && <span className="ep-click-ping" aria-hidden />}
                </div>
              );
            })}

            {/* 분기 탭 — 캡쳐 속 Archive / Tasking 탭을 오버레이 위에 밝게 띄운다 */}
            {active?.type === 'choice' &&
              active.options.map((o) => (
                <CaptureButton
                  key={o.track}
                  stageRef={stageRef}
                  capture={active.capture}
                  rect={o.rect}
                  label={o.label}
                  onClick={() => chooseTrack(o.track)}
                />
              ))}

            {activeHighlight?.spotlight && (
              <CaptureCrop stageRef={stageRef} capture={activeHighlight.capture} rect={activeHighlight.spotlight} />
            )}

            {activeHighlight?.advanceHotspot && (
              <CaptureButton
                stageRef={stageRef}
                capture={activeHighlight.capture}
                rect={activeHighlight.advanceHotspot}
                label={activeHighlight.advanceLabel ?? '다음'}
                onClick={() => advanceStep(stepIndex)}
              />
            )}

            {/* Tasking 궤도·타이머 — 결과 목록을 하이라이트하는 동안에도 지도 위 궤도가
                보이도록 오버레이 위로 띄운다 */}
            {/* 투어 중에만 — 가입 모달(NDS Dialog) 위로 올라오지 않게 */}
            {simMode && simMode !== 'loading' && (phase === 'running' || phase === 'transition') && (
              <StagePortal stageRef={stageRef} scale={scale}>
                <TaskingMapLayer previewId={previewId} showTimer />
              </StagePortal>
            )}

            {(phase === 'idle' || phase === 'done') && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-16 bg-black/65 backdrop-blur-[2px]">
                <p className="text-body-md-regular text-text-secondary">
                  실제 주문 화면 위에서 Archive와 Tasking 구매를 직접 눌러 보는 데모입니다
                </p>
                <Button variant="solid" size="lg" onClick={startTour}>
                  {phase === 'idle' ? '데모 시작하기' : '데모 다시 보기'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <OrderSignupModal
        open={phase === 'modal'}
        track={track}
        completed={completed}
        onReplay={startTour}
        onClose={() => setPhase('done')}
      />

      <p className="mt-8 font-mono text-body-xs-regular text-text-tertiary">
        캡쳐: map.ep.naraspace.com 실화면 (2026-10-08, 비로그인, 후쿠오카 SpaceEye-T 2026.05.31). Tasking 궤도
        선택 이후 화면은 실서비스 마크업으로 재현했고 일정은 예시입니다.
      </p>
    </div>
  );
}

// 캡쳐 전환 크로스페이드 — Agent 튜토리얼과 같은 방식 (아래층 상시 마운트로 깜빡임 방지)
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
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요 */}
      <img src={prev ?? src} alt="" className="absolute inset-0 h-full w-full" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요 */}
      <img key={src} src={src} alt={alt} className="ep-capture-fade absolute inset-0 h-full w-full" draggable={false} />
    </>
  );
}

// DOM 연출 — 사각형 영역 그리기 / 지점 핑
function EffectOverlay({ effect }: { effect: StepEffect }) {
  const { x, y, w, h } = effect.rect;
  const style = {
    left: `${x}%`,
    top: `${y}%`,
    width: `${w}%`,
    height: `${h}%`,
    animationDuration: `${effect.ms}ms`,
  };
  if (effect.kind === 'draw-aoi') {
    return (
      <div className="pointer-events-none absolute" style={style} aria-hidden>
        <div className="ep-draw-aoi absolute inset-0" style={{ animationDuration: `${effect.ms}ms` }} />
        <span className="ep-draw-corner" style={{ animationDuration: `${effect.ms}ms` }} />
      </div>
    );
  }
  return (
    <div className="pointer-events-none absolute" style={style} aria-hidden>
      <span className="ep-drop-pin" style={{ animationDuration: `${effect.ms}ms` }} />
    </div>
  );
}

function useStageBox(stageRef: React.RefObject<HTMLDivElement | null>) {
  const [box, setBox] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      if (el) setBox(el.getBoundingClientRect());
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [stageRef]);
  return box;
}

// driver 오버레이 위(팝오버 아래)에 스테이지와 같은 자리·배율로 띄우는 레이어.
// 전체화면 컨테이너(fixed)가 스태킹 컨텍스트를 만들어 z-index 가 갇히므로 body 로 portal.
function StagePortal({
  stageRef,
  scale,
  children,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  children: React.ReactNode;
}) {
  const box = useStageBox(stageRef);
  if (!box) return null;
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: box.left,
        top: box.top,
        width: CAPTURE_WIDTH,
        height: CAPTURE_HEIGHT,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        zIndex: OVER_OVERLAY_Z,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>,
    document.body,
  );
}

// 캡쳐 일부를 오버레이 위 원래 자리에 밝게 띄운다 (클릭 없음)
function CaptureCrop({
  stageRef,
  capture,
  rect,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  capture: string;
  rect: StageRect;
}) {
  const box = useStageBox(stageRef);
  if (!box) return null;
  const { x, y, w, h } = rect;
  return createPortal(
    <div
      className="ep-capture-fade overflow-hidden rounded-xs"
      style={{
        position: 'fixed',
        left: box.left + (x / 100) * box.width,
        top: box.top + (y / 100) * box.height,
        width: (w / 100) * box.width,
        height: (h / 100) * box.height,
        zIndex: OVER_OVERLAY_Z,
        pointerEvents: 'none',
      }}
      aria-hidden
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
    </div>,
    document.body,
  );
}

// 캡쳐 속 실제 버튼을 잘라 오버레이 위 원래 자리에 띄운다 (Agent 튜토리얼 AdvanceButton 과 같은 방식)
function CaptureButton({
  stageRef,
  capture,
  rect,
  label,
  onClick,
}: {
  stageRef: React.RefObject<HTMLDivElement | null>;
  capture: string;
  rect: StageRect;
  label: string;
  onClick: () => void;
}) {
  const box = useStageBox(stageRef);
  if (!box) return null;
  const { x, y, w, h } = rect;
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: box.left + (x / 100) * box.width,
        top: box.top + (y / 100) * box.height,
        width: (w / 100) * box.width,
        height: (h / 100) * box.height,
        zIndex: OVER_OVERLAY_Z,
        pointerEvents: 'none',
      }}
    >
      <span className="ep-click-ping" aria-hidden />
      <button
        onClick={onClick}
        className="ep-advance-pulse ep-advance-btn absolute inset-0 overflow-hidden rounded-[6px]"
        style={{ pointerEvents: 'auto', cursor: 'pointer', border: 'none', padding: 0, background: 'transparent' }}
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
