'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
      style={{ fontFamily: 'var(--font-body)', fontSize: '0.875cqw', letterSpacing: '-0.2px' }}
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
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${pct}%`, width: '2px', background: '#1bbfa8', marginLeft: '-1px' }}
        aria-hidden
      >
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shadow-lg${
            handleHinted && hintsEnabled ? ' ep-hint-blink' : ''
          }`}
          style={{ background: '#1bbfa8', color: '#0E0E10' }}
        >
          ↔
        </div>
      </div>

      {/* 지도 상단 UI — 실서비스 현행 디자인 재현 (장식용, 조작 불가).
          캡쳐의 옛 통합 바(검색+비교 겹침)는 이미지에서 지웠다 */}
      <MapTopBars />

      {/* '산불 피해 보기' 패널 — 실캡쳐 위치·색 실측값으로 DOM 재현 (불투명도 실동작) */}
      <div
        className="absolute cursor-default"
        style={{
          left: `${rect.x}%`,
          top: `${rect.y}%`,
          width: `${rect.w}%`,
          height: `${rect.h}%`,
          background: colors.bg,
          borderRadius: '0.7em',
          padding: '0.9em 1.2em',
          color: '#E7EBEF',
        }}
        onPointerDown={(e) => {
          // 패널 조작이 비교 슬라이더 드래그로 번지지 않게
          e.stopPropagation();
          setPanelHinted(false);
        }}
      >
        <div className="flex items-center justify-between" style={{ marginBottom: '0.9em' }}>
          <span style={{ fontSize: '1.07em', fontWeight: 600 }}>산불 피해 보기</span>
          <span aria-hidden style={{ color: '#8fa0b3', fontSize: '1.1em', lineHeight: 1 }}>
            ✕
          </span>
        </div>

        <div className="flex items-center justify-between" style={{ marginBottom: '0.45em' }}>
          <span style={{ fontWeight: 600 }}>불투명도</span>
          <span style={{ color: '#9db0c4' }}>{opacity}%</span>
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

        <div style={{ marginTop: '0.9em' }}>
          <p style={{ color: '#8fa0b3', fontSize: '0.86em', marginBottom: '0.4em' }}>심각도</p>
          <div className="flex items-center" style={{ gap: '1.1em' }}>
            {(
              [
                ['상', colors.high],
                ['중', colors.mid],
                ['하', colors.low],
              ] as const
            ).map(([label, color]) => (
              <span key={label} className="flex items-center" style={{ gap: '0.4em' }}>
                <span
                  className="inline-block"
                  style={{ width: '1em', height: '1em', background: color, borderRadius: '0.15em' }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// 실서비스의 지도 상단 UI 재현: 좌상단 검색 박스 + 상단 중앙 비교 알약.
// 색·치수·아이콘은 라이브 번들 실측값 (MAP_TOP_BARS 주석 참조). 지도 크롭은
// 실서비스 1px = 스테이지 1px(1/16 cqw)이라 px 값을 lp() 로 그대로 옮긴다.
// 장식용이라 pointer-events 를 받지 않는다 — 클릭/드래그는 비교 슬라이더로 통과.
const lp = (n: number) => `${n / 16}cqw`;

// 라이브 아이콘 SVG 경로 (viewBox 0 0 24 24)
const ICON_SEARCH =
  'M11.3918 3C15.6119 3.00018 19.0325 6.42164 19.0325 10.6418C19.0325 12.3927 18.4442 14.0058 17.4539 15.2943L17.316 15.4733L20.5237 18.681C20.8254 18.9828 20.8254 19.4719 20.5237 19.7737C20.2219 20.0754 19.7328 20.0754 19.431 19.7737L16.2234 16.566L16.0443 16.7039C14.7558 17.6942 13.1427 18.2825 11.3918 18.2825C7.17164 18.2825 3.75018 14.8619 3.75 10.6418C3.75 6.42152 7.17152 3 11.3918 3ZM11.3918 4.54546C8.02506 4.54546 5.29546 7.27506 5.29546 10.6418C5.29564 14.0083 8.02517 16.7371 11.3918 16.7371C13.0293 16.737 14.5166 16.0913 15.6116 15.0407L15.6247 15.0286L15.6347 15.0145C15.6534 14.991 15.6742 14.968 15.6961 14.9461C15.718 14.9242 15.741 14.9034 15.7645 14.8847L15.7786 14.8747L15.7907 14.8616C16.8413 13.7666 17.487 12.2793 17.4871 10.6418C17.4871 7.27517 14.7583 4.54564 11.3918 4.54546Z';
const ICON_ARROW =
  'M11.5001 5.24824C11.8271 4.91724 12.357 4.91726 12.684 5.24824L18.755 11.4001C19.0817 11.7315 19.0817 12.2685 18.755 12.5998L12.684 18.7518C12.357 19.0827 11.8271 19.0828 11.5001 18.7518C11.173 18.4203 11.173 17.8825 11.5001 17.551L16.1408 12.8485L4.83733 12.8485C4.37477 12.8485 4 12.4687 4 12C4 11.5313 4.37477 11.1515 4.83733 11.1515L16.1408 11.1515L11.5001 6.44898C11.173 6.11754 11.173 5.57968 11.5001 5.24824Z';
const ICON_INFO = [
  'M12 11.0092C12.5472 11.0092 12.9908 11.4528 12.9908 12V15.3024C12.9908 15.8496 12.5472 16.2932 12 16.2932C11.4528 16.2931 11.0092 15.8496 11.0092 15.3024V12C11.0092 11.4528 11.4528 11.0092 12 11.0092Z',
  'M12.0087 7.70683C12.5558 7.70702 12.9995 8.15055 12.9995 8.69763C12.9993 9.24455 12.5556 9.68825 12.0087 9.68844H12C11.453 9.68839 11.0094 9.24464 11.0092 8.69763C11.0092 8.15046 11.4528 7.70687 12 7.70683H12.0087Z',
  'M12 3.00049C16.9703 3.00062 21.0003 7.02976 21.0005 12C21.0003 16.9702 16.9702 21.0004 12 21.0005C7.0298 21.0003 3.00068 16.9702 3.00049 12C3.00066 7.02979 7.02979 3.00066 12 3.00049ZM12 4.4867C7.8506 4.48687 4.48687 7.8506 4.4867 12C4.4869 16.1494 7.85061 19.5141 12 19.5143C16.1494 19.5141 19.5141 16.1494 19.5143 12C19.5141 7.85057 16.1494 4.48683 12 4.4867Z',
];
const ICON_X =
  'M17.5095 5.2047C17.8681 4.91217 18.3979 4.93295 18.7322 5.2672L18.7947 5.33654C19.0677 5.67127 19.0677 6.15512 18.7947 6.48986L18.7322 6.55822L13.2908 11.9996L18.7322 17.441C19.0887 17.7975 19.0885 18.3755 18.7322 18.732C18.3756 19.0886 17.7977 19.0886 17.4412 18.732L11.9998 13.2906L6.55835 18.732C6.22405 19.0663 5.69432 19.0881 5.33569 18.7955L5.26733 18.732C4.91082 18.3755 4.91079 17.7976 5.26733 17.441L10.7087 11.9996L5.26733 6.55822C4.91077 6.20165 4.91077 5.62377 5.26733 5.2672L5.33569 5.2047C5.69432 4.91215 6.22405 4.9329 6.55835 5.2672L11.9998 10.7086L17.4412 5.2672L17.5095 5.2047Z';

function LiveIcon({ paths, size, color }: { paths: readonly string[]; size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={lp(size)} height={lp(size)} fill="none" aria-hidden style={{ color, flexShrink: 0 }}>
      {paths.map((d) => (
        <path key={d} d={d} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
      ))}
    </svg>
  );
}

function MapTopBars() {
  const { search, compare, colors: c } = MAP_TOP_BARS;
  // text-body-sm (14px, -0.2px) — 배지는 regular + leading-[16px], 날짜는 medium
  const bodySm = { fontSize: lp(14), letterSpacing: '-0.2px' } as const;
  // Badge: inline-flex rounded-full px-8 py-2 text-body-sm-regular leading-[16px]
  const badge = (bg: string, fg: string): React.CSSProperties => ({
    ...bodySm,
    display: 'inline-flex',
    alignItems: 'center',
    background: bg,
    color: fg,
    borderRadius: '9999px',
    padding: `${lp(2)} ${lp(8)}`,
    fontWeight: 400,
    lineHeight: lp(16),
    whiteSpace: 'nowrap',
  });
  const date: React.CSSProperties = { ...bodySm, color: c.text, fontWeight: 500, lineHeight: lp(24) };
  return (
    <div className="pointer-events-none" aria-hidden>
      {/* 검색 박스 — Input: rounded-lg(24) py-6 pl-12 pr-16 gap-12, inset-ring border-tertiary, shadow-6 */}
      <div
        className="absolute flex items-center"
        style={{
          left: `${search.rect.x}%`,
          top: `${search.rect.y}%`,
          width: `${search.rect.w}%`,
          background: c.bg,
          borderRadius: lp(24),
          boxShadow: `inset 0 0 0 1px ${c.border}, ${c.searchShadow}`,
          padding: `${lp(6)} ${lp(16)} ${lp(6)} ${lp(12)}`,
          gap: lp(12),
        }}
      >
        <LiveIcon paths={[ICON_SEARCH]} size={24} color={c.iconPrimary} />
        <span
          style={{
            fontSize: lp(16),
            lineHeight: lp(28),
            letterSpacing: '-0.2px',
            fontWeight: 400,
            color: c.placeholder,
            whiteSpace: 'nowrap',
          }}
        >
          {search.placeholder}
        </span>
      </div>

      {/* 비교 알약 — rounded-full bg-tertiary py-4 pr-6 pl-12 gap-8, 그림자 없음 */}
      <div
        className="absolute flex items-center"
        style={{
          left: '50%',
          top: `${compare.top}%`,
          transform: 'translateX(-50%)',
          background: c.bg,
          borderRadius: '9999px',
          padding: `${lp(4)} ${lp(6)} ${lp(4)} ${lp(12)}`,
          gap: lp(8),
          whiteSpace: 'nowrap',
        }}
      >
        <span className="flex items-center" style={{ gap: lp(12) }}>
          <span className="flex items-center" style={{ gap: lp(6) }}>
            <span style={badge(c.infoSubtle, c.infoBold)}>{compare.beforeLabel}</span>
            <span style={date}>{compare.beforeDate}</span>
          </span>
          <LiveIcon paths={[ICON_ARROW]} size={18} color={c.icon} />
          <span className="flex items-center" style={{ gap: lp(6) }}>
            <span style={badge(c.dangerSubtle, c.dangerBold)}>{compare.afterLabel}</span>
            <span style={date}>{compare.afterDate}</span>
          </span>
          <LiveIcon paths={ICON_INFO} size={24} color={c.iconPrimary} />
        </span>
        <LiveIcon paths={[ICON_X]} size={24} color={c.iconPrimary} />
      </div>
    </div>
  );
}
