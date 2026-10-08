'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Button, StatusChip } from '@naraspace-technology/nds/components';
import { IconArrowLeft, IconGlobe } from '@naraspace-technology/nds/icons';
import { DAILY_EARTH } from '@/lib/sample-data';

export default function DailyEarthPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState<Set<number>>(new Set([0]));

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const idx = Number(entry.target.getAttribute('data-index'));
      if (isNaN(idx)) return;
      if (entry.isIntersecting) {
        setActiveIndex(idx);
        setVisible((prev) => {
          const next = new Set(prev);
          next.add(idx);
          return next;
        });
      }
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: container,
      threshold: 0.5,
    });

    container.querySelectorAll('[data-index]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [handleIntersection]);

  const scrollTo = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const section = container.querySelector(`[data-index="${index}"]`);
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative" style={{ height: 'calc(100vh - var(--header-height))' }}>
      <div ref={containerRef} className="cinematic-scroll h-full">
        {DAILY_EARTH.map((item, i) => {
          const isVisible = visible.has(i);

          return (
            <section
              key={item.id}
              data-index={i}
              className="cinematic-section relative flex items-center justify-center bg-bg-tertiary"
              style={{ height: 'calc(100vh - var(--header-height))' }}
            >
              {/* Content wrapper with entrance animation */}
              <div className="relative z-10 mx-auto max-w-2xl px-24 text-center">
                {/* Category + Date */}
                <div
                  className="mb-24 flex items-center justify-center gap-12"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
                  }}
                >
                  <StatusChip status="neutral" showIcon={false}>
                    {item.category}
                  </StatusChip>
                  <span className="text-body-xs-regular tabular-nums text-text-tertiary">
                    {item.date}
                  </span>
                </div>

                {/* Image placeholder — 위성 영상 자리 일러스트 배경 (§7-2 일러스트 예외) */}
                <div
                  className="relative mx-auto mb-32 flex aspect-[16/10] w-full max-w-520 flex-col items-center justify-center gap-12 overflow-hidden rounded-md inset-ring-1 inset-ring-border-tertiary"
                  style={{
                    background: `linear-gradient(${135 + i * 45}deg, #0a1a15 0%, #0d2818 30%, #0a1612 60%, #111a14 100%)`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
                    transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
                  }}
                >
                  <div className="flex size-64 items-center justify-center rounded-full bg-bg-interactive-selected">
                    <IconGlobe className="size-24 text-icon-interactive-selected" />
                  </div>
                  <p className="text-body-xs-regular text-text-tertiary">
                    {item.satellite} &middot; {item.resolution}
                  </p>
                </div>

                {/* Title */}
                <h1
                  className="mb-20 text-heading-3xl text-text-primary md:text-display-md"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(25px)',
                    transition: 'opacity 0.7s ease-out 0.35s, transform 0.7s ease-out 0.35s',
                  }}
                >
                  {item.title}
                </h1>

                {/* Description */}
                <p
                  className="mx-auto mb-20 max-w-lg text-body-md-regular text-text-secondary"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.7s ease-out 0.5s, transform 0.7s ease-out 0.5s',
                  }}
                >
                  {item.description}
                </p>

                {/* Meta */}
                <div
                  className="mb-24 flex items-center justify-center gap-16 text-body-xs-regular tabular-nums text-text-tertiary"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.6s ease-out 0.65s',
                  }}
                >
                  <span>{item.location}</span>
                  <span aria-hidden>&middot;</span>
                  <span>{item.coordinates}</span>
                </div>

                {/* CTA */}
                <div
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
                    transition: 'opacity 0.6s ease-out 0.75s, transform 0.6s ease-out 0.75s',
                  }}
                >
                  <Button render={<Link href="/map" />} nativeButton={false}>
                    이 지역 지도에서 보기
                  </Button>
                </div>
              </div>

              {/* Scroll indicator - first section only */}
              {i === 0 && (
                <div
                  className="absolute bottom-32 left-1/2 flex -translate-x-1/2 flex-col items-center gap-8"
                  style={{
                    opacity: activeIndex === 0 ? 1 : 0,
                    transition: 'opacity 0.5s',
                  }}
                >
                  <span className="text-body-xs-regular text-text-tertiary">
                    scroll
                  </span>
                  <div className="flex h-32 w-20 items-start justify-center rounded-full pt-6 inset-ring-1 inset-ring-border-tertiary">
                    <div
                      className="h-8 w-4 rounded-full bg-bg-interactive-primary"
                      style={{ animation: 'ep-float 2s ease-in-out infinite' }}
                    />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Side navigation dots — NDS 에 점(페이지) 인디케이터가 없어 네이티브 button 유지, 색은 NDS 토큰만.
          Tooltip 은 NDS 가 표시 부품만 제공(트리거·포지셔닝 없음)해서 hover 라벨도 토큰 스타일로 유지 */}
      <div className="absolute top-1/2 right-16 z-20 flex -translate-y-1/2 flex-col gap-10">
        {DAILY_EARTH.map((item, i) => (
          <button
            key={item.id}
            onClick={() => scrollTo(i)}
            className="group relative flex items-center justify-end rounded-full outline-offset-2 focus-visible:outline focus-visible:outline-border-focus-ring"
            aria-label={item.title}
            aria-current={activeIndex === i ? 'true' : undefined}
          >
            <span className="pointer-events-none absolute right-24 rounded-sm bg-bg-primary px-10 py-4 text-body-xs-regular whitespace-nowrap text-text-primary opacity-0 inset-ring-1 inset-ring-border-tertiary transition-opacity group-hover:opacity-100">
              {item.title}
            </span>
            <div
              className={`h-8 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? 'w-24 bg-bg-interactive-primary'
                  : 'w-8 bg-bg-interactive-secondary group-hover:bg-bg-interactive-secondary-hover'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Back + Counter bar */}
      <div className="absolute top-16 right-64 left-16 z-20 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<IconArrowLeft />}
          render={<Link href="/" />}
          nativeButton={false}
        >
          홈
        </Button>
        <span className="rounded-sm bg-bg-tertiary/70 px-12 py-6 text-body-sm-regular tabular-nums text-text-tertiary inset-ring-1 inset-ring-border-tertiary backdrop-blur-sm">
          <span className="text-text-primary">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span aria-hidden> / </span>
          {String(DAILY_EARTH.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
