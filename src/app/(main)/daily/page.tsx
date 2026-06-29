'use client';

import Link from 'next/link';
import { useRef, useState, useEffect, useCallback } from 'react';
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
                className="absolute pointer-events-none"
                style={{
                  width: '500px',
                  height: '500px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(27,191,168,0.06) 0%, transparent 70%)',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) scale(${isActive ? 1.05 : 0.95})`,
                  opacity: isActive ? 1 : 0,
                  transition: 'transform 1.5s ease-out, opacity 1s ease-out',
                }}
              />

              {/* Content wrapper with entrance animation */}
              <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
                {/* Category + Date */}
                <div
                  className="flex items-center justify-center gap-3 mb-6"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
                  }}
                >
                  <span
                    className="text-xs font-mono tracking-[0.3em] uppercase px-3 py-1 rounded-full"
                    style={{ background: 'rgba(27,191,168,0.08)', color: 'var(--accent)' }}
                  >
                    {item.category}
                  </span>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {item.date}
                  </span>
                </div>

                {/* Image placeholder */}
                <div
                  className="mx-auto rounded-2xl overflow-hidden mb-8 relative"
                  style={{
                    width: '100%',
                    maxWidth: '520px',
                    aspectRatio: '16/10',
                    background: `linear-gradient(${135 + i * 45}deg, #0a1a15 0%, #0d2818 30%, #0a1612 60%, #111a14 100%)`,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
                    transition: 'opacity 0.8s ease-out 0.2s, transform 0.8s ease-out 0.2s',
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(27,191,168,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.05) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl relative z-10"
                    style={{ background: 'rgba(27,191,168,0.08)' }}
                  >
                    <span style={{ color: 'var(--accent)' }}>&#127758;</span>
                  </div>
                  <p className="text-xs font-mono relative z-10" style={{ color: 'var(--text-muted)' }}>
                    {item.satellite} &middot; {item.resolution}
                  </p>
                </div>

                {/* Title */}
                <h1
                  className="text-3xl md:text-5xl font-semibold leading-tight mb-5"
                  style={{
                    color: 'var(--text)',
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(25px)',
                    transition: 'opacity 0.7s ease-out 0.35s, transform 0.7s ease-out 0.35s',
                  }}
                >
                  {item.title}
                </h1>

                {/* Description */}
                <p
                  className="text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-5"
                  style={{
                    color: 'var(--text-muted)',
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.7s ease-out 0.5s, transform 0.7s ease-out 0.5s',
                  }}
                >
                  {item.description}
                </p>

                {/* Meta */}
                <div
                  className="flex items-center justify-center gap-4 text-xs font-mono mb-6"
                  style={{
                    color: 'var(--text-muted)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.6s ease-out 0.65s',
                  }}
                >
                  <span>{item.location}</span>
                  <span style={{ color: 'var(--border)' }}>&middot;</span>
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
                  <Link
                    href="/map"
                    className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: 'var(--accent)', color: '#0E0E10' }}
                  >
                    이 지역 지도에서 보기
                  </Link>
                </div>
              </div>

              {/* Scroll indicator - first section only */}
              {i === 0 && (
                <div
                  className="absolute bottom-8 left-1/2 flex flex-col items-center gap-2"
                  style={{
                    transform: 'translateX(-50%)',
                    opacity: activeIndex === 0 ? 1 : 0,
                    transition: 'opacity 0.5s',
                  }}
                >
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    scroll
                  </span>
                  <div
                    className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-1 h-2 rounded-full"
                      style={{
                        background: 'var(--accent)',
                        animation: 'ep-float 2s ease-in-out infinite',
                      }}
                    />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Side navigation dots */}
      <div
        className="absolute right-4 top-1/2 flex flex-col gap-2.5 z-20"
        style={{ transform: 'translateY(-50%)' }}
      >
        {DAILY_EARTH.map((item, i) => (
          <button
            key={item.id}
            onClick={() => scrollTo(i)}
            className="group relative flex items-center justify-end"
            aria-label={item.title}
          >
            <span
              className="absolute right-6 text-xs whitespace-nowrap px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              style={{ background: 'var(--surface-elevated)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              {item.title}
            </span>
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: activeIndex === i ? '24px' : '8px',
                height: '8px',
                background: activeIndex === i ? 'var(--accent)' : 'var(--border)',
                boxShadow: activeIndex === i ? '0 0 8px rgba(27,191,168,0.4)' : 'none',
              }}
            />
          </button>
        ))}
      </div>

      {/* Back + Counter bar */}
      <div className="absolute top-4 left-4 right-16 z-20 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs font-mono px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: 'rgba(14,14,16,0.7)', color: 'var(--text-muted)', border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}
        >
          &larr; 홈
        </Link>
        <span
          className="text-sm font-mono px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(14,14,16,0.7)', color: 'var(--text-muted)', border: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}
        >
          <span style={{ color: 'var(--accent)' }}>{String(activeIndex + 1).padStart(2, '0')}</span>
          <span style={{ color: 'var(--border)' }}> / </span>
          {String(DAILY_EARTH.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
