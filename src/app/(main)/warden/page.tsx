'use client';

import dynamic from 'next/dynamic';
import OtherSolutions from '@/components/landing/OtherSolutions';

const WardenSimulator = dynamic(
  () => import('@/components/warden/WardenSimulator'),
  { ssr: false },
);

const TIMELINE = [
  { date: '2026. 12. 30.', label: 'EUDR 시행 (대·중견기업)', active: true },
  { date: '2027', label: 'EU 메탄 규제 — 수입 화석연료 보고 의무', active: false },
  { date: '2030', label: 'EU 메탄 배출 상한 적용', active: false },
];

const VERTICALS = [
  {
    id: 'eudr',
    label: 'EUDR',
    title: 'EUDR 공급망 컴플라이언스',
    badge: '즉시 가능',
    badgeType: 'ready' as const,
    desc: 'EU 산림전용규제(EUDR) 실사를 자동화합니다. 공급 플롯 등록 후 2020년 기준선 대비 산림전용 판정, TRACES 제출용 실사보고서(DDS) 자동 생성.',
    customers: '인니·말레이 팜유 수출사 · 한·일 식품·타이어 기업',
    outputs: ['산림전용 자동 판정', 'DDS 보고서 생성', '상시 모니터링 알림', '프리미엄 위성 검증'],
  },
  {
    id: 'methane',
    label: '메탄 검증',
    title: '메탄 배출 검증 · MRV',
    badge: '위성 필요',
    badgeType: 'sat' as const,
    desc: '시설 단위 메탄 플룸 탐지·정량화 리포트를 제공합니다. Sentinel-5P 광역 스크리닝과 NarSha 정밀 관측의 2단 파이프라인.',
    customers: '환경부 · 가스공사 · SK E&S · 아시아 NOC',
    outputs: ['월간/분기 탐지 리포트', '배출 이상 알림', 'ESG 보고용 검증 패키지', 'OGMP 2.0 대응'],
  },
  {
    id: 'palm',
    label: '팜 인텔리전스',
    title: '팜 플랜테이션 인텔리전스',
    badge: '위성 필요',
    badgeType: 'sat' as const,
    desc: 'EUDR 컴플라이언스를 넘어 플랜테이션 운영 효율까지. 개체 단위 트리 센서스, 수령·밀도 기반 수확량 예측, 병해 조기 탐지.',
    customers: '팜유·커피 수출사 · 플랜테이션 운영사',
    outputs: ['트리 센서스', '수확량 예측', '병해 조기 탐지', '필지 단위 분석'],
  },
];

const BADGE_STYLES = {
  ready: { bg: 'rgba(107, 138, 94, 0.15)', color: '#6B8A5E' },
  sat: { bg: 'rgba(200, 146, 58, 0.15)', color: '#C8923A' },
};

const USE_CASE_STEPS = [
  {
    num: '01',
    title: 'AOI 등록',
    desc: '공급 플롯 2,400개를 지도에 등록',
    mark: '◫',
  },
  {
    num: '02',
    title: '기준선 분석',
    desc: '2020년 기준선 대비 Sentinel-2 산림전용 자동 판정',
    mark: '⊹',
  },
  {
    num: '03',
    title: 'DDS 자동 생성',
    desc: 'EU TRACES 포맷 실사보고서(DDS) 자동 생성',
    mark: '≡',
  },
  {
    num: '04',
    title: '상시 모니터링',
    desc: '분기마다 변화 탐지 알림, 위험 플롯 즉시 통보',
    mark: '△',
  },
];

const EUDR_DEADLINE = new Date('2026-12-30T00:00:00');

function daysUntilDeadline() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = EUDR_DEADLINE.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function WardenPage() {
  const dDay = daysUntilDeadline();

  return (
    <div className="ep-page" style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 48px', maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 4,
            background: 'rgba(107, 138, 94, 0.12)',
            marginBottom: 20,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#6B8A5E' }} />
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
              color: '#6B8A5E',
              fontWeight: 600,
            }}
          >
            Warden
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
          규제가 요구하는 검증,<br />
          위성이 제공합니다
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
          EUDR 산림전용규제, EU 메탄 규제 — 다가오는 시행일에 맞춰
          컴플라이언스를 위성 데이터로 자동화하고, 보고 의무를 해결합니다.
        </p>

        <a
          href="#contact"
          className="ep-cta"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 8,
            background: '#6B8A5E',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          EUDR 실사 시작하기
        </a>
      </section>

      {/* Use Case */}
      <section style={{ padding: '0 24px 64px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
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

        <div
          style={{
            borderRadius: 8,
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
              인도네시아 팜유 수출사의 EUDR 대응
            </h2>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: '64ch' }}>
              EU로 팜유를 수출하는 정제사. 2026년 12월 30일 EUDR 시행 전까지
              공급망 전체가 2020년 이후 산림전용과 무관함을 증명해야 합니다.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap' as const,
              alignItems: 'stretch',
              padding: '28px 24px',
            }}
          >
            {USE_CASE_STEPS.map((step, i) => (
              <div
                key={step.num}
                style={{
                  flex: '1 1 180px',
                  display: 'flex',
                  alignItems: 'stretch',
                  minWidth: 0,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '0.08em',
                      color: '#6B8A5E',
                      fontWeight: 600,
                      display: 'block',
                      marginBottom: 12,
                    }}
                  >
                    {step.num}
                  </span>
                  <div
                    style={{
                      fontSize: 20,
                      lineHeight: 1,
                      color: 'var(--text-muted)',
                      marginBottom: 12,
                    }}
                    aria-hidden="true"
                  >
                    {step.mark}
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--text-muted)', maxWidth: '22ch' }}>
                    {step.desc}
                  </p>
                </div>
                {i < USE_CASE_STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    style={{
                      width: 1,
                      alignSelf: 'stretch',
                      background: 'var(--border)',
                      margin: '0 20px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--border)',
              background: 'var(--surface)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              자체 위성 없이 Sentinel-2 무료 데이터로 즉시 시작 가능
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Simulator */}
      <WardenSimulator />

      {/* Regulatory Timeline */}
      <section style={{ padding: '0 24px 64px', maxWidth: 960, margin: '0 auto' }}>
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
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-muted)',
            }}
          >
            규제 시행 일정
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 1,
            background: 'var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
            border: '1px solid var(--border)',
          }}
        >
          {TIMELINE.map((t) => (
            <div
              key={t.date}
              style={{
                padding: 20,
                background: t.active ? 'var(--surface)' : 'var(--bg)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  color: t.active ? '#6B8A5E' : 'var(--text-muted)',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                {t.date}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                {t.label}
              </span>
              {t.active && (
                <span
                  style={{
                    display: 'block',
                    marginTop: 8,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: '#C45C4A',
                    fontWeight: 600,
                  }}
                >
                  D-{dDay}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Case Study */}
      <section style={{ padding: '0 24px 64px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)' }}>
            최근 분석
          </span>
        </div>
        <a
          href="https://ep.naraspace.com/ko/post/contents/indonesia-raja-ampat-nickel-mining-permits-forest-loss"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: 20,
            borderRadius: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            textDecoration: 'none',
            transition: 'border-color 0.2s ease-out',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--text-muted)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase' as const, padding: '2px 8px', borderRadius: 3, background: 'rgba(107, 138, 94, 0.15)', color: '#6B8A5E', fontWeight: 600 }}>
              FOREST · MINING
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text-muted)' }}>
              ep.naraspace.com
            </span>
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
            Raja Ampat 니켈 채굴 허가 취소 후 산림 변화
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            인도네시아 Raja Ampat 니켈 채굴 허가 취소 이후 산림 손실이 멈췄는지 위성영상으로 검증
          </p>
        </a>
      </section>

      {/* Verticals */}
      <section style={{ padding: '64px 24px', maxWidth: 960, margin: '0 auto' }}>
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
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#6B8A5E', flex: 1 }}>
                  {v.title}
                </h3>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.04em',
                    padding: '3px 8px',
                    borderRadius: 3,
                    background: BADGE_STYLES[v.badgeType].bg,
                    color: BADGE_STYLES[v.badgeType].color,
                    fontWeight: 600,
                  }}
                >
                  {v.badge}
                </span>
              </div>

              <div style={{ padding: 20 }}>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 16, maxWidth: '60ch' }}>
                  {v.desc}
                </p>
                <div className="ep-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      고객
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{v.customers}</p>
                  </div>
                  <div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      산출물
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                      {v.outputs.map((o) => (
                        <span key={o} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 3, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
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

      {/* Contact */}
      <section id="contact" style={{ padding: '64px 24px 80px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ padding: 40, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' as const }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            EUDR 시행까지 5개월
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, maxWidth: '40ch', margin: '0 auto 24px' }}>
            모니터링할 공급 플롯을 등록하면 산림전용 판정과
            DDS 보고서 생성이 자동으로 시작됩니다.
          </p>
          <a
            href="mailto:contact@earthpaper.space"
            className="ep-cta"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 28px', borderRadius: 8, background: '#6B8A5E', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
          >
            공급 플롯 등록하기
          </a>
        </div>
      </section>

      <OtherSolutions current="warden" />

      <style>{`
        @media (max-width: 640px) {
          .ep-page > section { padding-left: 16px !important; padding-right: 16px !important; }
          .ep-page > section:first-of-type { padding-top: 48px !important; padding-bottom: 32px !important; }
          .ep-cols-2 { grid-template-columns: 1fr !important; }
          .ep-cta { min-height: 48px !important; }
        }
      `}</style>
    </div>
  );
}
