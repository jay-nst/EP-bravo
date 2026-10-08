'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button, Input, StatusChip } from '@naraspace-technology/nds/components';
import {
  IconArrowRight,
  IconChevronLeft,
  IconChevronRight,
  IconInfoCircle,
  IconSearch,
  IconX,
} from '@naraspace-technology/nds/icons';
import { DAMAGE_PANEL, MAP_TOP_BARS } from '@/lib/agent-tutorial-steps';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  /** 화재 후 — 심각도 오버레이 0% */
  afterBaseSrc: string;
  /** 화재 후 — 심각도 오버레이 100% (base 위에 CSS opacity 로 겹침) */
  severitySrc: string;
  beforeLabel: string;
  afterLabel: string;
  /** false 면 깜빡임 힌트를 숨긴다 (비활성 스텝에서 위젯이 유지될 때) */
  hintsEnabled?: boolean;
}

// 실서비스(mapbox-gl-compare)의 전·후 비교를 정적 캡쳐로 재현한 위젯.
// 왼쪽 = 화재 전, 오른쪽 = 화재 후(심각도 오버레이). clip-path 로 후 레이어를
// 핸들 위치까지만 가리고, '산불 피해 보기' 패널의 불투명도 슬라이더는 DOM 으로
// 재현해 심각도 오버레이 투명도를 실제로 조절한다.
// 마운트 시 한 번 자동 스윕으로 "움직인다"는 것을 보여주고, 이후 드래그에 반응한다.
export default function BeforeAfterSlider({
  beforeSrc,
  afterBaseSrc,
  severitySrc,
  beforeLabel,
  afterLabel,
  hintsEnabled = true,
}: BeforeAfterSliderProps) {
  const [pct, setPct] = useState(15);
  const [opacity, setOpacity] = useState<number>(DAMAGE_PANEL.defaultOpacity);
  // 조작 가능 어포던스 — 핸들은 테두리 깜빡임, 패널은 민트 점 깜빡임. 첫 조작 시 해제
  const [handleHinted, setHandleHinted] = useState(true);
  const [panelHinted, setPanelHinted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const sweepRef = useRef<number | null>(null);
  const interactedRef = useRef(false);
  const liveScale = useLiveScale(containerRef);

  // 자동 스윕: 15% → 85% → 50% (1.8s). 사용자가 만지면 즉시 중단.
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // 스윕 없이 중앙으로만 이동
      sweepRef.current = requestAnimationFrame(() => setPct(50));
      return () => {
        if (sweepRef.current !== null) cancelAnimationFrame(sweepRef.current);
      };
    }
    const start = performance.now();
    const DUR = 1800;
    const tick = (now: number) => {
      if (interactedRef.current) return;
      const t = Math.min((now - start) / DUR, 1);
      // 두 구간 이징: 0~0.6 에서 15→85, 0.6~1 에서 85→50
      const eased =
        t < 0.6
          ? 15 + (85 - 15) * easeInOut(t / 0.6)
          : 85 + (50 - 85) * easeInOut((t - 0.6) / 0.4);
      setPct(eased);
      if (t < 1) sweepRef.current = requestAnimationFrame(tick);
    };
    sweepRef.current = requestAnimationFrame(tick);
    return () => {
      if (sweepRef.current !== null) cancelAnimationFrame(sweepRef.current);
    };
  }, []);

  const moveTo = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPct(Math.min(98, Math.max(2, next)));
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      interactedRef.current = true;
      setHandleHinted(false);
      draggingRef.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      moveTo(e.clientX);
    },
    [moveTo],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (draggingRef.current) moveTo(e.clientX);
    },
    [moveTo],
  );

  const endDrag = useCallback(() => {
    draggingRef.current = false;
  }, []);

  const { rect, colors } = DAMAGE_PANEL;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 select-none touch-none cursor-ew-resize"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="slider"
      aria-label="화재 전·후 비교 슬라이더"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      {/* 화재 전 (base) */}
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요 */}
      <img
        src={beforeSrc}
        alt={beforeLabel}
        className="absolute inset-0 w-full h-full"
        draggable={false}
      />
      {/* 화재 후 — 핸들 오른쪽만 노출. base + 심각도(불투명도 조절) 스택 */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pct}%)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요 */}
        <img
          src={afterBaseSrc}
          alt={afterLabel}
          className="absolute inset-0 w-full h-full"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요 */}
        <img
          src={severitySrc}
          alt=""
          className="absolute inset-0 w-full h-full"
          style={{ opacity: opacity / 100 }}
          draggable={false}
        />
      </div>

      {/* 핸들 라인 + 그립 (실서비스 compare-swiper 재현) */}
      <div
        className="absolute top-0 bottom-0 w-2 -ml-1 pointer-events-none bg-bg-interactive-primary"
        style={{ left: `${pct}%` }}
        aria-hidden
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 size-36 rounded-full flex items-center justify-center shadow-8 bg-bg-interactive-primary text-[#0E0E10]${
            handleHinted && hintsEnabled ? ' ep-hint-blink' : ''
          }`}
        >
          <IconChevronLeft className="size-16 -mr-2" />
          <IconChevronRight className="size-16 -ml-2" />
        </div>
      </div>

      {/* 라이브 px 레이어 — 실서비스 지도 영역(940×944 px)을 1:1 좌표로 깔고 컨테이너 폭에
          맞춰 transform 으로 축소한다. 안쪽은 NDS 컴포넌트·클래스를 px 그대로 쓴다.
          측정 전(첫 레이아웃)에는 숨겨 0 배율 플래시를 막는다 */}
      <div
        className="absolute top-0 left-0 origin-top-left pointer-events-none"
        style={{
          ...LIVE_THEME,
          width: LIVE_MAP_PX.w,
          height: LIVE_MAP_PX.h,
          transform: `scale(${liveScale ?? 1})`,
          visibility: liveScale === null ? 'hidden' : undefined,
        }}
      >
        {/* 지도 상단 UI — 실서비스 현행 마크업 그대로 (장식용, 조작 불가).
            캡쳐의 옛 통합 바(검색+비교 겹침)는 이미지에서 지웠다 */}
        <MapTopBars />

        {/* '산불 피해 보기' 패널 — 실캡쳐 위치·색 실측값으로 DOM 재현 (불투명도 실동작) */}
        <div
          className="absolute cursor-default pointer-events-auto rounded-sm px-16 py-12 text-[#E7EBEF]"
          style={{
            left: `${rect.x}%`,
            top: `${rect.y}%`,
            width: `${rect.w}%`,
            height: `${rect.h}%`,
            background: colors.bg,
          }}
          onPointerDown={(e) => {
            // 패널 조작이 비교 슬라이더 드래그로 번지지 않게
            e.stopPropagation();
            setPanelHinted(false);
          }}
        >
          <div className="flex items-center justify-between mb-12">
            <span className="text-body-md-medium">산불 피해 보기</span>
            <IconX aria-hidden className="size-16 text-[#8fa0b3]" />
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-body-sm-medium">불투명도</span>
            <span className="text-body-sm-regular tabular-nums text-[#9db0c4]">{opacity}%</span>
          </div>
          {/* 조작 가능 어포던스 — 슬라이더의 민트 썸(점)이 반짝인다 (첫 조작 시 해제) */}
          <input
            type="range"
            min={0}
            max={100}
            value={opacity}
            onChange={(e) => {
              setOpacity(Number(e.target.value));
              setPanelHinted(false); // 키보드 조작도 어포던스 해제
            }}
            className={`ep-opacity-range w-full${
              panelHinted && hintsEnabled ? ' ep-opacity-hint' : ''
            }`}
            aria-label="심각도 오버레이 불투명도"
          />

          <div className="mt-12">
            <p className="text-body-xs-regular text-[#8fa0b3] mb-4">심각도</p>
            <div className="flex items-center gap-16">
              {(
                [
                  ['상', colors.high],
                  ['중', colors.mid],
                  ['하', colors.low],
                ] as const
              ).map(([label, color]) => (
                <span key={label} className="flex items-center gap-6 text-body-sm-regular">
                  <span className="inline-block size-14 rounded-xs" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// 지도 크롭 = 실서비스 지도 영역 실측 (660,56,940,944 — map-compare 핫스팟과 동일).
// 캡쳐는 1600px 뷰포트 1:1 이라, 스테이지 폭이 바뀌면 지도 영역도 같은 비율로 줄어든다.
const LIVE_MAP_PX = { w: 940, h: 944 } as const;

// 라이브 px → 화면 px 배율 = 지도 영역 실제 폭 / 940.
// NDS 컴포넌트는 px(1px 간격 단위)·rem 타이포로 크기가 고정돼 cqw 로 늘이고 줄일 수 없다.
// 그래서 1:1 레이어 전체에 transform scale 을 건다 (CSS 만으로는 길이÷길이 배율을
// 아직 브라우저 공통으로 계산할 수 없어 ResizeObserver 로 잰다). 이전 lp() 의
// `n/16 cqw` 와 같은 값이다: 지도 폭 = 58.75cqw → 1 라이브px = 58.75/940 cqw = 1/16 cqw.
function useLiveScale(ref: React.RefObject<HTMLDivElement | null>): number | null {
  const [scale, setScale] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // clientWidth 는 정수로 반올림돼 배율이 미세하게 어긋난다 — 소수 폭을 쓴다
    const measure = () => setScale(el.getBoundingClientRect().width / LIVE_MAP_PX.w);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return scale;
}

// 실서비스(Agent EP) 다크 테마 토큰을 레이어 범위에만 주입한다. EP 팔레트의 같은 이름
// 토큰과 값이 달라서, NDS 컴포넌트에 색 클래스를 덮어쓰지 않고 테마 변수로 맞춘다
// (NDS 의 테마 방식 그대로 — 실서비스도 알약에서 status 토큰을 inline 변수로 바꾼다).
const { colors: LIVE } = MAP_TOP_BARS;
const LIVE_THEME = {
  '--bg-tertiary': LIVE.bg,
  '--border-tertiary': LIVE.border,
  '--text-primary': LIVE.text,
  '--text-tertiary': LIVE.textTertiary,
  '--icon-primary': LIVE.iconPrimary,
  '--icon-secondary': LIVE.icon,
  '--elevation-6': LIVE.searchShadow,
} as React.CSSProperties;

// 실서비스 알약은 다크 테마에서도 Before/After 칩에 라이트 status 토큰을 강제한다
const LIVE_STATUS_LIGHT = {
  '--status-info-subtle': LIVE.infoSubtle,
  '--status-info-bold': LIVE.infoBold,
  '--status-danger-subtle': LIVE.dangerSubtle,
  '--status-danger-bold': LIVE.dangerBold,
} as React.CSSProperties;

// 실서비스의 지도 상단 UI: 좌상단 검색 Input + 상단 중앙 비교 알약.
// 라이브 번들(agent.ep.naraspace.com, 2026-10-08)의 마크업·클래스를 그대로 옮겼다 —
// 검색 = NDS Input(leftIcon, bg-bg-tertiary shadow-6), 칩 = NDS StatusChip
// (showIcon=false, solid, rounded-full leading-[16px]), 도움말·닫기 = NDS Button
// (text, sm, iconOnly). 장식용이라 inert — 포커스·클릭·보조기술 모두 받지 않고
// 클릭/드래그는 아래 비교 슬라이더로 통과한다.
function MapTopBars() {
  const { search, compare } = MAP_TOP_BARS;
  return (
    <div inert>
      <div className="absolute top-20 left-20 w-280">
        <Input
          leftIcon={<IconSearch />}
          placeholder={search.placeholder}
          className="bg-bg-tertiary shadow-6"
          readOnly
        />
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-8 rounded-full bg-bg-tertiary py-4 pr-6 pl-12 whitespace-nowrap">
        <div className="flex items-center gap-12" style={LIVE_STATUS_LIGHT}>
          <div className="flex items-center gap-6">
            <StatusChip
              showIcon={false}
              status="information"
              variant="solid"
              className="rounded-full leading-[16px]"
            >
              {compare.beforeLabel}
            </StatusChip>
            <span className="text-body-sm-medium text-text-primary">{compare.beforeDate}</span>
          </div>
          <IconArrowRight className="size-18 text-icon-secondary" />
          <div className="flex items-center gap-6">
            <StatusChip
              showIcon={false}
              status="error"
              variant="solid"
              className="rounded-full leading-[16px]"
            >
              {compare.afterLabel}
            </StatusChip>
            <span className="text-body-sm-medium text-text-primary">{compare.afterDate}</span>
          </div>
          <Button variant="text" size="sm" iconOnly aria-label="비교 도움말">
            <IconInfoCircle />
          </Button>
        </div>
        <Button variant="text" size="sm" iconOnly aria-label="비교 닫기">
          <IconX />
        </Button>
      </div>
    </div>
  );
}
