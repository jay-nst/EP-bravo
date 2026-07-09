'use client';

import OtherSolutions from '@/components/landing/OtherSolutions';

const CAPABILITIES = [
  {
    title: '초소형위성체계',
    desc: '16U 헤리티지 기반 위성 버스·본체 공급 및 조기 운용',
  },
  {
    title: '영상 구독',
    desc: '옵저버 군집의 보장 태스킹(assured access) 연 구독',
  },
  {
    title: 'GEOINT AI',
    desc: '군사 시설 자동 판독, 변화탐지, 초해상화 분석',
  },
  {
    title: '위성 수출',
    desc: 'K-방산 패키지 연계 정찰 초소형위성 G2G 수출',
  },
];

export default function NorthpaperPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <section
        style={{
          padding: '120px 24px 80px',
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 4,
            background: 'rgba(61, 90, 128, 0.12)',
            marginBottom: 24,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#3D5A80' }} />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-muted)',
              fontWeight: 400,
            }}
          >
            EarthPaper ·
          </span>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: '#3D5A80',
              fontWeight: 600,
            }}
          >
            Northpaper
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'var(--text)',
            marginBottom: 16,
          }}
        >
          국방 · 안보
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            maxWidth: '48ch',
            marginBottom: 48,
          }}
        >
          보안 요건에 따라 본 페이지에서는 역량 개요만 안내합니다.
          상세 사항은 별도 채널을 통해 문의해 주시기 바랍니다.
        </p>

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
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: 20,
            }}
          >
            역량
          </span>

          <div style={{ display: 'grid', gap: 12 }}>
            {CAPABILITIES.map((c) => (
              <div
                key={c.title}
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  padding: '16px 20px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 20,
                    borderRadius: 2,
                    background: '#3D5A80',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: 4,
                    }}
                  >
                    {c.title}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {c.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Analysis */}
        <div style={{ marginTop: 48, borderTop: '1px solid var(--border)', paddingTop: 32 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 20 }}>
            공개 분석
          </span>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { title: '위성이 포착한 북한 5대 조선소 구조 변화', location: 'North Korea', href: 'https://ep.naraspace.com/ko/post/contents/satellite-imagery-changes-five-major-north-korean-shipyards-ports' },
              { title: '이란 핵시설 공습 피해 위성영상 분석', location: 'Iran', href: 'https://ep.naraspace.com/ko/post/contents/airstrike-damage-to-irans-nuclear-facilities-the-truth-seen-from-satellite-imagery' },
              { title: '금강산 관광지구 철거 현황과 전망', location: 'North Korea', href: 'https://ep.naraspace.com/ko/post/contents/kumgangsan-tourist-area-demolition-status-and-outlook' },
            ].map((post) => (
              <a
                key={post.href}
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                  padding: '16px 20px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s ease-out',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
              >
                <span style={{ width: 4, height: 20, borderRadius: 2, background: '#3D5A80', flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>{post.title}</p>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>{post.location} · ep.naraspace.com</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div
          style={{
            marginTop: 48,
            padding: 32,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            textAlign: 'center' as const,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              marginBottom: 20,
            }}
          >
            국방·안보 관련 문의는 별도 채널로 안내합니다.
          </p>
          <a
            href="mailto:defense@naraspace.com"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '12px 28px',
              borderRadius: 8,
              background: '#3D5A80',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            문의하기
          </a>
        </div>
      </section>

      <OtherSolutions current="northpaper" />
    </div>
  );
}
