'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { DAMAGE_PANEL } from '@/lib/agent-tutorial-steps';

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

      {/* 라벨 칩 */}
      <span
        className="absolute px-2 py-1 rounded text-xs font-mono pointer-events-none"
        style={{ bottom: '2%', left: '32%', background: 'rgba(14,14,16,0.8)', color: '#E8E4DF' }}
      >
        {beforeLabel}
      </span>
      <span
        className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-mono pointer-events-none"
        style={{ background: 'rgba(14,14,16,0.8)', color: '#E8E4DF' }}
      >
        {afterLabel}
      </span>

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
          <span className="flex items-center" style={{ fontWeight: 600, gap: '0.45em' }}>
            불투명도
            {/* 조작 가능 어포던스 — 라벨 옆 민트 점 깜빡임 (첫 조작 시 해제) */}
            {panelHinted && hintsEnabled && <span className="ep-hint-dot" aria-hidden />}
          </span>
          <span style={{ color: '#9db0c4' }}>{opacity}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={opacity}
          onChange={(e) => {
            setOpacity(Number(e.target.value));
            setPanelHinted(false); // 키보드 조작도 어포던스 해제
          }}
          className="ep-opacity-range w-full"
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
