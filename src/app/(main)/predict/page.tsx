'use client';

import dynamic from 'next/dynamic';
import OtherSolutions from '@/components/landing/OtherSolutions';

const PredictSimulator = dynamic(
  () => import('@/components/predict/PredictSimulator'),
  { ssr: false },
);

const USE_CASE_STEPS = [
  {
    n: '01',
    title: '자산 등록',
    desc: '태양광 발전소 좌표·경계를 AOI로 등록, 투자 포트폴리오에 연결',
  },
  {
    n: '02',
    title: '건설 진행률',
    desc: '착공~완공까지 위성 시계열 분석으로 진행률 원격 확인, 대출 인출 조건 검증',
  },
  {
    n: '03',
    title: '분기 검증',
    desc: '완공 후 자산 존재·패널 상태·식생 침범을 분기마다 자동 검증',
  },
  {
    n: '04',
    title: '재해 스크리닝',
    desc: '우박·태풍 후 피해 범위 신속 파악, 드론 투입 우선순위 결정',
  },
];

const VERTICALS = [
  {
    id: 'solar',
    title: '태양광 자산 검증',
    desc: '해외 태양광에 투자·대출한 금융기관을 위한 원격 검증. 현지 실사단 파견 없이 건설 진행률, 완공 후 자산 상태, 재해 피해를 위성으로 확인합니다.',
    customers: '수출입은행 · 인프라 펀드 · 보험사',
    outputs: ['건설 진행률 원격 검증', '자산 존재·상태 분기 검증', '재해 후 피해 스크리닝', '식생 침범 탐지'],
    icon: '◎',
  },
  {
    id: 'asset',
    title: '범용 자산 검증',
    desc: '"이 자산이 존재하고 가동 중인가" — 규제와 내규가 요구하는 검증을 위성 리포트로 자동화합니다.',
    customers: '무보·수은 · 시중은행 · 회계법인 · PE',
    outputs: ['자산 존재 검증 리포트', '가동률 정기 모니터링', '야적장 재고 수준 확인', '건설 진행 추적'],
    icon: '□',
  },
  {
    id: 'commodity',
    title: '원자재 시그널',
    badge: '장기',
    desc: '팜유·커피·석탄·니켈 — 위성 관측 데이터를 기반으로 작황, 재고 수준, 출하 동향을 분석합니다.',
    customers: '원자재 트레이더 · 식품기업 · 에너지기업',
    outputs: ['수확량 예측 데이터', '재고·출하 시그널', '위성 기반 작황 조기경보'],
    icon: '△',
  },
];

export default function PredictPage() {
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
            background: 'rgba(74, 158, 196, 0.12)',
            marginBottom: 20,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 2, background: '#4A9EC4' }} />
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
              color: '#4A9EC4',
              fontWeight: 600,
            }}
          >
            Predict
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
          현지 실사 없이,<br />
          자산을 검증합니다
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
          해외 태양광 발전소, 광산, 야적장 —
          위성 영상으로 자산의 존재와 상태를 원격 검증합니다.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
          <a
            href="https://predicthings.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ep-cta"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 8,
              background: '#4A9EC4',
              color: '#fff',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Predict 서비스 →
          </a>
          <a
            href="#contact"
            className="ep-cta"
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
            자산 검증 상담
          </a>
        </div>
      </section>

      {/* Use case */}
      <section style={{ padding: '0 24px 56px', maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 8 }}>
          Use Case
        </h2>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
          인도 라자스탄 태양광 발전소 — 원격 자산 검증
        </h3>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)', maxWidth: '64ch', marginBottom: 28 }}>
          수출입은행이 인도 라자스탄의 150MW 태양광 발전소에 투자했습니다.
          현지 실사단을 파견하는 대신, 위성 기반 검증으로 자산을 원격 관리합니다.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
          {USE_CASE_STEPS.map((step) => (
            <div key={step.n} style={{ background: 'var(--surface)', padding: 20 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: '#4A9EC4', display: 'block', marginBottom: 12 }}>
                {step.n}
              </span>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                {step.title}
              </h4>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-muted)' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: '0.04em', color: 'var(--text-muted)', marginTop: 16 }}>
          현지 실사 비용의 1/10로, 분기마다 반복 검증 가능
        </p>
      </section>

      {/* Interactive Simulator */}
      <PredictSimulator />

      {/* Report mockup */}
      <section style={{ padding: '0 24px 64px', maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 20px',
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)' }}>
              검증 리포트 예시
            </span>
          </div>
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { label: '자산 유형', value: '태양광 발전소' },
              { label: '위치', value: 'Rajasthan, India' },
              { label: '용량', value: '150 MW' },
              { label: '검증 상태', value: '가동 확인', color: '#4A9E6B' },
              { label: '패널 면적', value: '2.4 km²' },
              { label: '마지막 관측', value: '2026. 07. 12.' },
              { label: '식생 침범', value: '2개 구역 탐지', color: '#C8923A' },
              { label: '건설 진행률', value: '100%' },
            ].map((item) => (
              <div key={item.label}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  {item.label}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: item.color || 'var(--text)' }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verticals */}
      <section style={{ padding: '64px 24px', maxWidth: 960, margin: '0 auto' }}>
        <h2 style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', marginBottom: 32, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          서비스 영역
        </h2>

        <div style={{ display: 'grid', gap: 16 }}>
          {VERTICALS.map((v) => (
            <div key={v.id} style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4A9EC4', flex: 1 }}>{v.title}</h3>
                {v.badge && (
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, padding: '3px 8px', borderRadius: 3, background: 'rgba(138, 134, 128, 0.15)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {v.badge}
                  </span>
                )}
              </div>
              <div style={{ padding: 20 }}>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 16, maxWidth: '60ch' }}>{v.desc}</p>
                <div className="ep-cols-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>고객</span>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{v.customers}</p>
                  </div>
                  <div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>산출물</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                      {v.outputs.map((o) => (
                        <span key={o} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 3, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>{o}</span>
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
            검증할 자산을 등록하세요
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, maxWidth: '44ch', margin: '0 auto 24px' }}>
            태양광 발전소, 광산, 야적장 — 자산 위치를 등록하면
            위성 관측 기반 검증 리포트가 자동으로 생성됩니다.
          </p>
          <a
            href="mailto:contact@earthpaper.space"
            className="ep-cta"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 28px', borderRadius: 8, background: '#4A9EC4', color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
          >
            자산 등록 상담
          </a>
        </div>
      </section>

      <OtherSolutions current="predict" />

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
