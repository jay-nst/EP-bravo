'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
}

// 실서비스(mapbox-gl-compare)의 전·후 비교를 정적 캡쳐 2장으로 재현한 위젯.
// 왼쪽 = 화재 전, 오른쪽 = 화재 후. clip-path 로 후 이미지를 핸들 위치까지만 가린다.
// 마운트 시 한 번 자동 스윕으로 "움직인다"는 것을 보여주고, 이후 드래그에 반응한다.
export default function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel,
  afterLabel,
}: BeforeAfterSliderProps) {
  const [pct, setPct] = useState(15);
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
      {/* 화재 후 — 핸들 오른쪽만 노출 */}
      {/* eslint-disable-next-line @next/next/no-img-element -- 정적 캡쳐, 최적화 불필요 */}
      <img
        src={afterSrc}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full"
        draggable={false}
        style={{ clipPath: `inset(0 0 0 ${pct}%)` }}
      />

      {/* 핸들 라인 + 그립 (실서비스 compare-swiper 재현) */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${pct}%`, width: '2px', background: '#1bbfa8', marginLeft: '-1px' }}
        aria-hidden
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shadow-lg"
          style={{ background: '#1bbfa8', color: '#0E0E10' }}
        >
          ↔
        </div>
      </div>

      {/* 라벨 칩 */}
      <span
        className="absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-mono pointer-events-none"
        style={{ background: 'rgba(14,14,16,0.8)', color: '#E8E4DF' }}
      >
        {beforeLabel}
      </span>
      <span
        className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-mono pointer-events-none"
        style={{ background: 'rgba(14,14,16,0.8)', color: '#E8E4DF' }}
      >
        {afterLabel}
      </span>
    </div>
  );
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
