'use client';

import dynamic from 'next/dynamic';
import OtherSolutions from '@/components/landing/OtherSolutions';

const CitadelSimulator = dynamic(
  () => import('@/components/citadel/CitadelSimulator'),
  { ssr: false },
);

const VERTICALS = [
  {
    id: 'citysat',
    label: 'CitySat',
    title: '도시·행정구역 구독',
    desc: '월 2회 이상 정기 위성 촬영으로 도시 변화를 추적합니다. 무허가 건축 탐지, 도시 확장 모니터링, 침수 상습지 분석까지.',
    customers: '동남아 메가시티 · 중동 신도시 · 국내 광역지자체',
    outputs: ['무허가 건축 탐지', '도시 확장 추적', '침수 상습지 분석', '열섬 모니터링'],
  },
  {
    id: 'disaster',
    label: '재난재해',
    title: '재난재해 대응',
    desc: '평시 모니터링 구독에 재난 시 48시간 SLA 리포트를 결합합니다. 산불·산사태·지진·녹조 등 광학 영상이 유리한 재해부터.',
    customers: '산림청 · 소방청 · 동남아 재난관리청 (OCD, BNPB)',
    outputs: ['산불 피해 면적 산정', '붕괴 판정 자동화', '녹조·적조 탐지', '48h SLA 리포트'],
  },
  {
    id: 'turnkey',
    label: '민수 턴키',
    title: '동남아 민수 턴키 솔루션',
    desc: '위성 제작·발사부터 EarthPaper 화이트라벨까지 통째로 인도합니다. 데이터가 아니라 주권 역량을 원하는 국가를 위한 솔루션.',
    customers: '필리핀 PhilSA · 베트남 · 말레이 · 태국 GISTDA',
    outputs: ['위성 2~4기 제작·발사', '기술이전 · 운영 교육', '화이트라벨 플랫폼', 'CaaS 관측 보충'],
  },
];

const CASE_STUDIES = [
  {
    location: 'Santa Rosa Island, USA',
    event: 'Santa Rosa Island 산불 확산 및 피해 범위 위성 추적',
    severity: 'critical' as const,
    stat: '연소 범위 시계열 분석',
    date: '2026. 07. 05.',
    href: 'https://ep.naraspace.com/ko/post/contents/santa-rosa-island-wildfire-satellite-analysis',
  },
  {
    location: 'Jamaica',
    event: '자메이카 홍수 피해 위성영상 분석',
    severity: 'critical' as const,
    stat: '피해 면적 산출 · 복구 우선순위',
    date: '2026. 07. 03.',
    href: 'https://ep.naraspace.com/ko/post/contents/disaster-impact-jamaica-flood-damage-satellite-imagery',
  },
  {
    location: 'Patagonia, Chile',
    event: '2026 파타고니아 산불 피해 분석',
    severity: 'high' as const,
    stat: '64,468ha · dNBR 등급 분류',
    date: '2026. 06. 28.',
    href: 'https://ep.naraspace.com/ko/post/contents/2026-patagonia-wildfire-damage-analysis-64468ha-satellite-severity-spread-rate',
  },
];

const SEVERITY_COLORS = {
  critical: '#C45C4A',
  high: '#E07B5F',
  moderate: '#C8923A',
};

export default function CitadelPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <section
        style={{
          padding: '80px 24px 64px',
          maxWidth: 960,
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
            background: 'rgba(196, 92, 74, 0.12)',
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: '#C45C4A',
            }}
          />
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
              color: '#C45C4A',
              fontWeight: 600,
            }}
          >
            Citadel
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 600,
            lineHeight: 1.3,
            color: 'var(--text)',
            marginBottom: 16,
          }}
        >
          도시를 관측하고,<br />
          재난에 대응합니다
        </h1>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            maxWidth: '52ch',
            marginBottom: 32,
          }}
        >
          위성 영상 기반 도시 모니터링과 재난 대응 솔루션.
          정기 관측 구독부터 국가 단위 턴키 시스템까지,
          정부와 도시가 필요로 하는 위성 인프라를 제공합니다.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
          <a
            href="#contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 8,
              background: '#C45C4A',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            데모 요청
          </a>
          <a
            href="#verticals"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            서비스 살펴보기
          </a>
        </div>
      </section>

      {/* Use Case */}
      <section
        style={{
          padding: '0 24px 64px',
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-muted)',
            }}
          >
            Use Case
          </span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(20px, 3vw, 26px)',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: 8,
          }}
        >
          2026 광양 산불 — 48시간 재난 리포트
        </h2>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: 'var(--text-muted)',
            maxWidth: '60ch',
            marginBottom: 28,
          }}
        >
          발생 탐지부터 피해 판정 리포트 전달까지, Citadel이 실제 재난 상황에서
          어떻게 작동하는지 단계별로 살펴봅니다.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            {
              n: '01',
              title: '발생 탐지',
              desc: 'GK-2A 천리안 + FIRMS 실시간 화점 데이터로 산불 발생을 인지합니다.',
            },
            {
              n: '02',
              title: '긴급 촬영',
              desc: '옵저버 위성 긴급 태스킹으로 피해 지역 고해상도 영상을 확보합니다.',
            },
            {
              n: '03',
              title: '피해 분석',
              desc: 'NDMI · dNBR 분석으로 피해 강도와 면적을 자동 산출합니다.',
            },
            {
              n: '04',
              title: 'SLA 리포트',
              desc: '48시간 내 피해 판정 리포트를 생성해 산림청·지자체에 전달합니다.',
            },
          ].map((step) => (
            <div
              key={step.n}
              style={{
                padding: 20,
                borderRadius: 8,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  color: '#C45C4A',
                  display: 'block',
                  marginBottom: 12,
                }}
              >
                {step.n}
              </span>
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 6,
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <a
          href="https://ep.naraspace.com/ko/post/contents/2026-gwangyang-wildfire-ndmi-dnbr-analysis"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 14,
            fontWeight: 500,
            color: '#C45C4A',
            textDecoration: 'none',
          }}
        >
          이 시나리오의 실제 분석 결과를 확인하세요 →
        </a>
      </section>

      {/* Interactive Simulator */}
      <CitadelSimulator />

      {/* Live Events */}
      <section
        style={{
          padding: '0 24px 64px',
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#C45C4A',
              animation: 'pulse 2s infinite',
            }}
          />
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-muted)',
            }}
          >
            최근 탐지
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 12,
          }}
        >
          {CASE_STUDIES.map((c) => (
            <a
              key={c.location}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: 20,
                borderRadius: 8,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                textDecoration: 'none',
                display: 'block',
                transition: 'border-color 0.2s ease-out',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase' as const,
                    padding: '2px 8px',
                    borderRadius: 3,
                    background: `${SEVERITY_COLORS[c.severity]}20`,
                    color: SEVERITY_COLORS[c.severity],
                    fontWeight: 600,
                  }}
                >
                  {c.severity}
                </span>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11,
                    color: 'var(--text-muted)',
                  }}
                >
                  {c.date}
                </span>
              </div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--text)',
                  marginBottom: 4,
                }}
              >
                {c.event}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                {c.location}
              </p>
              <p
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  color: '#C45C4A',
                  fontWeight: 500,
                }}
              >
                {c.stat}
              </p>
            </a>
          ))}
        </div>
      </section>

      {/* Verticals */}
      <section
        id="verticals"
        style={{
          padding: '64px 24px',
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            fontSize: 11,
            fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: 'var(--text-muted)',
            marginBottom: 32,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border)',
          }}
        >
          서비스 영역
        </h2>

        <div style={{ display: 'grid', gap: 16 }}>
          {VERTICALS.map((v) => (
            <div
              key={v.id}
              style={{
                borderRadius: 8,
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 20px',
                  background: 'var(--surface)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: '#C45C4A',
                    }}
                  >
                    {v.title}
                  </h3>
                </div>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.06em',
                    padding: '3px 8px',
                    borderRadius: 3,
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {v.label}
                </span>
              </div>

              <div style={{ padding: 20, background: 'var(--bg)' }}>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: 'var(--text-muted)',
                    marginBottom: 16,
                    maxWidth: '60ch',
                  }}
                >
                  {v.desc}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase' as const,
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      고객
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                      {v.customers}
                    </p>
                  </div>
                  <div>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase' as const,
                        color: 'var(--text-muted)',
                        display: 'block',
                        marginBottom: 6,
                      }}
                    >
                      산출물
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                      {v.outputs.map((o) => (
                        <span
                          key={o}
                          style={{
                            fontSize: 12,
                            padding: '3px 8px',
                            borderRadius: 3,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            color: 'var(--text)',
                          }}
                        >
                          {o}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section
        id="contact"
        style={{
          padding: '64px 24px 80px',
          maxWidth: 960,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            padding: 40,
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            textAlign: 'center' as const,
          }}
        >
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: 'var(--text)',
              marginBottom: 8,
            }}
          >
            관심 구역으로 시작하세요
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-muted)',
              marginBottom: 24,
              maxWidth: '44ch',
              margin: '0 auto 24px',
            }}
          >
            모니터링할 행정구역이나 관심 지역을 설정하면,
            정기 관측부터 재난 대응 SLA까지 맞춤 시나리오를 구성합니다.
          </p>
          <a
            href="mailto:contact@earthpaper.space"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '12px 28px',
              borderRadius: 8,
              background: '#C45C4A',
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

      <OtherSolutions current="citadel" />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
