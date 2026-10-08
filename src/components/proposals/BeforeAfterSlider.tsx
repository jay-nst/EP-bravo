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
// 색·배치는 라이브 번들 실측값 (MAP_TOP_BARS 주석 참조). 장식용이라
// pointer-events 를 받지 않는다 — 클릭/드래그는 비교 슬라이더로 통과.
function MapTopBars() {
  const { search, compare, colors: c } = MAP_TOP_BARS;
  const badge = (bg: string, fg: string): React.CSSProperties => ({
    background: bg,
    color: fg,
    borderRadius: '999px',
    padding: '0.1em 0.65em',
    fontSize: '0.86em',
    fontWeight: 600,
    lineHeight: 1.45,
  });
  return (
    <div className="pointer-events-none" aria-hidden>
      {/* 검색 박스 */}
      <div
        className="absolute flex items-center"
        style={{
          left: `${search.rect.x}%`,
          top: `${search.rect.y}%`,
          width: `${search.rect.w}%`,
          height: `${search.rect.h}%`,
          background: c.bg,
          borderRadius: '0.6em',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
          padding: '0 0.9em',
          gap: '0.6em',
          color: c.icon,
        }}
      >
        <svg viewBox="0 0 24 24" width="1.1em" height="1.1em" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16 16L20.5 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span>{search.placeholder}</span>
      </div>

      {/* 비교 알약 — Before/After 배지 + 날짜 + ⓘ + ✕ */}
      <div
        className="absolute flex items-center"
        style={{
          left: '50%',
          top: `${compare.top}%`,
          transform: 'translateX(-50%)',
          background: c.bg,
          borderRadius: '999px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
          padding: '0.32em 0.6em 0.32em 0.9em',
          gap: '0.75em',
          whiteSpace: 'nowrap',
        }}
      >
        <span className="flex items-center" style={{ gap: '0.4em' }}>
          <span style={badge(c.infoBold, c.infoSubtle)}>{compare.beforeLabel}</span>
          <span style={{ color: c.text, fontWeight: 500 }}>{compare.beforeDate}</span>
        </span>
        <span style={{ color: c.icon }}>→</span>
        <span className="flex items-center" style={{ gap: '0.4em' }}>
          <span style={badge(c.dangerBold, c.dangerSubtle)}>{compare.afterLabel}</span>
          <span style={{ color: c.text, fontWeight: 500 }}>{compare.afterDate}</span>
        </span>
        <span style={{ color: c.icon, fontSize: '1.05em' }}>ⓘ</span>
        <span style={{ color: c.icon, fontSize: '1.05em' }}>✕</span>
      </div>
    </div>
  );
}
