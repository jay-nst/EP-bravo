'use client';

import OtherSolutions from '@/components/landing/OtherSolutions';

const NEXUS_COLOR = '#C8923A';

const VERTICALS = [
  {
    id: 'api',
    label: 'API',
    title: 'API 데이터 구독',
    desc: 'REST API로 위성 영상과 분석 결과에 접근합니다. 검색 → 주문 → 다운로드까지 자동화하고, 웹훅으로 신규 촬영 알림을 받으세요.',
    customers: 'SaaS 개발사 · 연구기관 · 핀테크 · 보험사',
    outputs: ['카탈로그 검색 API', 'AOI 기반 자동 주문', '웹훅 알림', '분석 결과 JSON'],
  },
  {
    id: 'archive',
    label: 'Archive',
    title: '아카이브 검색',
    desc: '2019년부터 축적된 위성 영상 아카이브를 검색하고 구매합니다. 시계열 변화 분석에 필요한 과거 데이터를 한 곳에서.',
    customers: '도시계획 연구 · 환경 컨설팅 · 법률 증거 · 학술 연구',
    outputs: ['시계열 영상 검색', '메타데이터 필터링', 'AOI 클리핑 다운로드', 'COG 포맷 제공'],
  },
  {
    id: 'package',
    label: 'Package',
    title: '맞춤 데이터 패키지',
    desc: '산업별 요구에 맞춘 위성 데이터 번들. 관심 지역 설정 후 정기 배송하거나, 프로젝트 단위로 일괄 구매할 수 있습니다.',
    customers: '건설사 · 농업법인 · 에너지 기업 · 정부기관',
    outputs: ['월간 구독 배송', '프로젝트 일괄 패키지', '전처리 완료 데이터', '분석 리포트 포함 옵션'],
  },
];

const DATA_STATS = [
  { label: '누적 촬영 면적', value: '42M km²', sub: '2019년~현재' },
  { label: '일 평균 신규 영상', value: '2,400+', sub: 'Observer + SpaceEye-T' },
  { label: '최고 해상도', value: '25cm', sub: 'SpaceEye-T 초해상도 8.3cm' },
  { label: 'API 응답 시간', value: '<200ms', sub: 'p95 기준' },
];

export default function NexusPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero */}
      <section style={{ padding: '80px 24px 64px', maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 4,
            background: `${NEXUS_COLOR}1A`,
            marginBottom: 20,
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: 2, background: NEXUS_COLOR }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', fontWeight: 400 }}>
            EarthPaper ·
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: NEXUS_COLOR, fontWeight: 600 }}>
            Nexus
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 600, lineHeight: 1.3, color: 'var(--text)', marginBottom: 16 }}>
          위성 데이터,<br />
          바로 연결합니다
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--text-muted)', maxWidth: '52ch', marginBottom: 32 }}>
          검색에서 다운로드까지 한 곳에서. API 자동화, 아카이브 탐색,
          산업별 맞춤 패키지로 위성 데이터를 가장 빠르게 확보하세요.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
          <a
            href="#contact"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 8, background: NEXUS_COLOR,
              color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none',
            }}
          >
            API 키 신청
          </a>
          <a
            href="#verticals"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none',
            }}
          >
            데이터 살펴보기
          </a>
        </div>
      </section>

      {/* Data Stats */}
      <section style={{ padding: '0 24px 64px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {DATA_STATS.map((s) => (
            <div
              key={s.label}
              style={{
                padding: 20,
                borderRadius: 8,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                {s.label}
              </span>
              <span style={{ fontSize: 28, fontWeight: 700, color: NEXUS_COLOR, display: 'block', marginBottom: 4, fontFamily: "'IBM Plex Mono', monospace" }}>
                {s.value}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {s.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Verticals */}
      <section id="verticals" style={{ padding: '64px 24px', maxWidth: 960, margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 11, fontFamily: "'IBM Plex Mono', monospace",
            letterSpacing: '0.12em', textTransform: 'uppercase' as const,
            color: 'var(--text-muted)', marginBottom: 32,
            paddingBottom: 12, borderBottom: '1px solid var(--border)',
          }}
        >
          데이터 접근 방식
        </h2>

        <div style={{ display: 'grid', gap: 16 }}>
          {VERTICALS.map((v) => (
            <div
              key={v.id}
              style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '16px 20px', background: 'var(--surface)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: NEXUS_COLOR }}>{v.title}</h3>
                </div>
                <span
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
                    letterSpacing: '0.06em', padding: '3px 8px', borderRadius: 3,
                    border: '1px solid var(--border)', color: 'var(--text-muted)',
                  }}
                >
                  {v.label}
                </span>
              </div>

              <div style={{ padding: 20, background: 'var(--bg)' }}>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)', marginBottom: 16, maxWidth: '60ch' }}>
                  {v.desc}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      고객
                    </span>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{v.customers}</p>
                  </div>
                  <div>
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                      제공 항목
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 4 }}>
                      {v.outputs.map((o) => (
                        <span
                          key={o}
                          style={{
                            fontSize: 12, padding: '3px 8px', borderRadius: 3,
                            background: 'var(--surface)', border: '1px solid var(--border)',
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
      <section id="contact" style={{ padding: '64px 24px 80px', maxWidth: 960, margin: '0 auto' }}>
        <div
          style={{
            padding: 40, borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--surface)', textAlign: 'center' as const,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
            데이터에 바로 연결하세요
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, maxWidth: '44ch', margin: '0 auto 24px' }}>
            API 키를 발급받고 위성 영상 카탈로그에 즉시 접근하거나,
            맞춤 데이터 패키지를 상담하세요.
          </p>
          <a
            href="mailto:contact@earthpaper.space"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '12px 28px', borderRadius: 8, background: NEXUS_COLOR,
              color: '#fff', fontSize: 14, fontWeight: 500, textDecoration: 'none',
            }}
          >
            문의하기
          </a>
        </div>
      </section>

      <OtherSolutions current="nexus" />
    </div>
  );
}
