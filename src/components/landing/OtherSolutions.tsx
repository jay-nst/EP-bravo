'use client';

import Link from 'next/link';

const SOLUTIONS = [
  { key: 'citadel', label: 'Citadel', desc: '재난 · 도시 관제', color: '#C45C4A', href: '/citadel' },
  { key: 'predict', label: 'Predict', desc: '자산 검증 · 금융', color: '#4A9EC4', href: '/predict' },
  { key: 'warden', label: 'Warden', desc: '기후 · 컴플라이언스', color: '#6B8A5E', href: '/warden' },
  { key: 'northpaper', label: 'Northpaper', desc: '국방 · 안보', color: '#3D5A80', href: '/northpaper' },
  { key: 'nexus', label: 'Nexus', desc: '데이터 마켓', color: '#C8923A', href: '/nexus' },
] as const;

interface OtherSolutionsProps {
  current: typeof SOLUTIONS[number]['key'];
}

export default function OtherSolutions({ current }: OtherSolutionsProps) {
  const others = SOLUTIONS.filter((s) => s.key !== current);

  return (
    <section className="px-4 md:px-6 pb-12 md:pb-20" style={{ maxWidth: 960, margin: '0 auto' }}>
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 32,
        }}
      >
        <span
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            color: 'var(--text-muted)',
            display: 'block',
            marginBottom: 16,
          }}
        >
          EarthPaper의 다른 솔루션
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {others.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
              <div>
                <span style={{ fontSize: 14, fontWeight: 600, color: s.color, display: 'block' }}>
                  {s.label}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {s.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
