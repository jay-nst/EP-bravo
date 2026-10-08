'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Button } from '@naraspace-technology/nds/components';
import { IconArrowLeft, IconGlobe } from '@naraspace-technology/nds/icons';
import { DAILY_EARTH } from '@/lib/sample-data';

const GRADIENTS = [
  'linear-gradient(160deg, #0a1a2e 0%, #0E0E10 45%, #0d1f1a 100%)',
  'linear-gradient(160deg, #0E0E10 0%, #0d1520 45%, #0a1a1f 100%)',
  'linear-gradient(160deg, #0d1f1a 0%, #0E0E10 45%, #0a1520 100%)',
  'linear-gradient(160deg, #1a0a1e 0%, #0E0E10 45%, #0a1a2e 100%)',
  'linear-gradient(160deg, #0a1520 0%, #0E0E10 45%, #0d1f1a 100%)',
];

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
          const isActive = activeIndex === i;

          return (
            <section
              key={item.id}
              data-index={i}
              className="cinematic-section relative flex items-center justify-center"
              style={{
                height: 'calc(100vh - var(--header-height))',
                background: GRADIENTS[i % GRADIENTS.length],
              }}
            >
              {/* Background orb */}
              <div
                className="pointer-events-none absolute top-1/2 left-1/2 size-500 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(27,191,168,0.06) 0%, transparent 70%)',
                  transform: `translate(-50%, -50%) scale(${isActive ? 1.05 : 0.95})`,
                  opacity: isActive ? 1 : 0,
                  transition: 'transform 1.5s ease-out, opacity 1s ease-out',
                }}
              />

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
                  <span className="rounded-full bg-[rgba(27,191,168,0.08)] px-12 py-4 text-body-xs-regular text-text-interactive-primary">
                    {item.category}
                  </span>
                  <span className="text-body-xs-regular tabular-nums text-text-tertiary">
                    {item.date}
                  </span>
                </div>

                {/* Image placeholder */}
                <div
                  className="relative mx-auto mb-32 flex aspect-[16/10] w-full max-w-520 flex-col items-center justify-center gap-12 overflow-hidden rounded-md inset-ring-1 inset-ring-border-tertiary"
                  style={{
                    background: `linear-gradient(${135 + i * 45}deg, #0a1a15 0%, #0d2818 30%, #0a1612 60%, #111a14 100%)`,
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
                    transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
                  }}
                >
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(27,191,168,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.05) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <div className="relative z-10 flex size-64 items-center justify-center rounded-full bg-[rgba(27,191,168,0.08)]">
                    <IconGlobe className="size-24 text-icon-interactive-primary" />
                  </div>
                  <p className="relative z-10 text-body-xs-regular text-text-tertiary">
                    {item.satellite} &middot; {item.resolution}
                  </p>
                </div>

                {/* Title */}
                <h1
                  className="mb-20 text-heading-3xl text-text-primary md:text-display-lg"
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
                  className="mx-auto mb-20 max-w-lg text-body-md-regular text-text-tertiary md:text-body-lg-regular"
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
                  <span className="text-border-tertiary">&middot;</span>
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

      {/* Side navigation dots — NDS 에 점 인디케이터가 없어 네이티브 button 유지 */}
      <div className="absolute top-1/2 right-16 z-20 flex -translate-y-1/2 flex-col gap-10">
        {DAILY_EARTH.map((item, i) => (
          <button
            key={item.id}
            onClick={() => scrollTo(i)}
            className="group relative flex items-center justify-end"
            aria-label={item.title}
          >
            <span className="pointer-events-none absolute right-24 rounded-sm bg-bg-primary px-10 py-4 text-body-xs-regular whitespace-nowrap text-text-primary opacity-0 inset-ring-1 inset-ring-border-tertiary transition-opacity group-hover:opacity-100">
              {item.title}
            </span>
            <div
              className={`h-8 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? 'w-24 bg-bg-interactive-primary shadow-[0_0_8px_rgba(27,191,168,0.4)]'
                  : 'w-8 bg-border-tertiary'
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
          <span className="text-text-interactive-primary">{String(activeIndex + 1).padStart(2, '0')}</span>
          <span className="text-border-tertiary"> / </span>
          {String(DAILY_EARTH.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
