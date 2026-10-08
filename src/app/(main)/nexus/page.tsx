'use client';

import { Badge, Button, Card, StatusChip } from '@naraspace-technology/nds/components';
import OtherSolutions from '@/components/landing/OtherSolutions';

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
    <div className="min-h-screen bg-bg-tertiary">
      {/* Hero */}
      <section className="mx-auto max-w-960 px-16 pb-48 pt-48 sm:px-24 sm:pb-64 sm:pt-80">
        <div className="mb-20">
          <StatusChip status="neutral" showIcon={false}>EarthPaper · Nexus</StatusChip>
        </div>

        <h1 className="mb-16 text-heading-3xl text-text-primary md:text-display-md">
          위성 데이터,<br />
          바로 연결합니다
        </h1>

        <p className="mb-32 max-w-[52ch] text-body-md-regular text-text-secondary">
          검색에서 다운로드까지 한 곳에서. API 자동화, 아카이브 탐색,
          산업별 맞춤 패키지로 위성 데이터를 가장 빠르게 확보하세요.
        </p>

        <div className="flex flex-wrap gap-12">
          <Button size="lg" render={<a href="#contact" />} nativeButton={false}>
            API 키 신청
          </Button>
          <Button size="lg" variant="outline" render={<a href="#verticals" />} nativeButton={false}>
            데이터 살펴보기
          </Button>
        </div>
      </section>

      {/* Data Stats */}
      <section className="mx-auto max-w-960 px-16 pb-64 sm:px-24">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-12">
          {DATA_STATS.map((s) => (
            <Card.Root key={s.label}>
              <Card.Body className="gap-8">
                <span className="text-body-xs-regular text-text-tertiary">{s.label}</span>
                <span className="text-heading-xl tabular-nums text-text-primary">{s.value}</span>
                <span className="text-body-xs-regular text-text-tertiary">{s.sub}</span>
              </Card.Body>
            </Card.Root>
          ))}
        </div>
      </section>

      {/* Verticals */}
      <section id="verticals" className="mx-auto max-w-960 px-16 pb-64 sm:px-24">
        <div className="mb-24 flex flex-col items-start gap-8">
          <h2 className="text-heading-2xl text-text-primary">데이터 접근 방식</h2>
        </div>

        <div className="grid gap-12">
          {VERTICALS.map((v) => (
            <Card.Root key={v.id}>
              <Card.Body className="gap-16">
                <div className="flex items-center gap-12">
                  <Card.Title className="flex-1">{v.title}</Card.Title>
                  <Badge type="letter">{v.label}</Badge>
                </div>

                <p className="max-w-[60ch] text-body-sm-regular text-text-secondary">{v.desc}</p>

                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
                  <div className="flex flex-col gap-4">
                    <span className="text-body-xs-regular text-text-tertiary">고객</span>
                    <Card.Content>{v.customers}</Card.Content>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-body-xs-regular text-text-tertiary">제공 항목</span>
                    <div className="flex flex-wrap gap-4">
                      {v.outputs.map((o) => (
                        <Badge key={o} type="letter">{o}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card.Root>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="mx-auto max-w-960 px-16 pb-80 sm:px-24">
        <Card.Root>
          <Card.Body className="items-center gap-8 py-32 text-center">
            <h2 className="text-heading-2xl text-text-primary">
              데이터에 바로 연결하세요
            </h2>
            <p className="mb-16 max-w-[44ch] text-body-md-regular text-text-secondary">
              API 키를 발급받고 위성 영상 카탈로그에 즉시 접근하거나,
              맞춤 데이터 패키지를 상담하세요.
            </p>
            <Button size="lg" render={<a href="mailto:support@naraspace.com" />} nativeButton={false}>
              문의하기
            </Button>
          </Card.Body>
        </Card.Root>
      </section>

      <OtherSolutions current="nexus" />
    </div>
  );
}
