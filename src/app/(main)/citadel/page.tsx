'use client';

import dynamic from 'next/dynamic';
import { Badge, Button, Card, StatusChip } from '@naraspace-technology/nds/components';
import type { StatusChipProps } from '@naraspace-technology/nds/components';
import { IconArrowRight } from '@naraspace-technology/nds/icons';
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

// 심각도 라벨 → NDS StatusChip 상태 (NDS 컴포넌트는 기본 상태 색만 쓴다)
const SEVERITY_STATUS: Record<'critical' | 'high' | 'moderate', NonNullable<StatusChipProps['status']>> = {
  critical: 'error',
  high: 'warning',
  moderate: 'alert',
};

export default function CitadelPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      {/* Hero */}
      <section className="mx-auto max-w-960 px-16 pb-48 pt-48 sm:px-24 sm:pb-64 sm:pt-80">
        <div className="mb-20">
          <StatusChip status="neutral" showIcon={false}>EarthPaper · Citadel</StatusChip>
        </div>

        <h1 className="mb-16 text-heading-3xl text-text-primary md:text-display-md">
          도시를 관측하고,<br />
          재난에 대응합니다
        </h1>

        <p className="mb-32 max-w-[52ch] text-body-md-regular text-text-secondary">
          위성 영상 기반 도시 모니터링과 재난 대응 솔루션.
          정기 관측 구독부터 국가 단위 턴키 시스템까지,
          정부와 도시가 필요로 하는 위성 인프라를 제공합니다.
        </p>

        <div className="flex flex-wrap gap-12">
          <Button size="lg" render={<a href="#contact" />} nativeButton={false}>
            데모 요청
          </Button>
          <Button size="lg" variant="outline" render={<a href="#verticals" />} nativeButton={false}>
            서비스 살펴보기
          </Button>
        </div>
      </section>

      {/* Use Case */}
      <section className="mx-auto max-w-960 px-16 pb-64 sm:px-24">
        <div className="mb-24 flex flex-col items-start gap-8">
          <StatusChip status="neutral" showIcon={false}>Use Case</StatusChip>
          <h2 className="text-heading-2xl text-text-primary">
            2026 광양 산불 — 48시간 재난 리포트
          </h2>
          <p className="max-w-[60ch] text-body-md-regular text-text-secondary">
            발생 탐지부터 피해 판정 리포트 전달까지, Citadel이 실제 재난 상황에서
            어떻게 작동하는지 단계별로 살펴봅니다.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12">
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
            <Card.Root key={step.n}>
              <Card.Body className="gap-8">
                <span className="text-body-xs-regular tabular-nums text-text-tertiary">{step.n}</span>
                <Card.Title>{step.title}</Card.Title>
                <p className="text-body-sm-regular text-text-secondary">{step.desc}</p>
              </Card.Body>
            </Card.Root>
          ))}
        </div>

        <Button
          variant="text"
          className="mt-16"
          rightIcon={<IconArrowRight />}
          render={
            <a
              href="https://ep.naraspace.com/ko/post/contents/2026-gwangyang-wildfire-ndmi-dnbr-analysis"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          nativeButton={false}
        >
          이 시나리오의 실제 분석 결과를 확인하세요
        </Button>
      </section>

      {/* Interactive Simulator */}
      <CitadelSimulator />

      {/* Live Events */}
      <section className="mx-auto max-w-960 px-16 pb-64 sm:px-24">
        <div className="mb-24 flex flex-col items-start gap-8">
          <h2 className="text-heading-2xl text-text-primary">최근 탐지</h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-12">
          {CASE_STUDIES.map((c) => (
            <Card.Root
              key={c.location}
              interactive
              render={<a href={c.href} target="_blank" rel="noopener noreferrer" />}
            >
              <Card.Body className="gap-8">
                <div className="flex items-center justify-between">
                  <StatusChip status={SEVERITY_STATUS[c.severity]}>{c.severity}</StatusChip>
                  <span className="text-body-xs-regular tabular-nums text-text-tertiary">{c.date}</span>
                </div>
                <Card.Title render={<p />}>{c.event}</Card.Title>
                <span className="text-body-xs-regular text-text-tertiary">{c.location}</span>
                <span className="text-body-sm-medium tabular-nums text-text-primary">{c.stat}</span>
              </Card.Body>
            </Card.Root>
          ))}
        </div>
      </section>

      {/* Verticals */}
      <section id="verticals" className="mx-auto max-w-960 px-16 pb-64 sm:px-24">
        <div className="mb-24 flex flex-col items-start gap-8">
          <h2 className="text-heading-2xl text-text-primary">서비스 영역</h2>
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
                    <span className="text-body-xs-regular text-text-tertiary">산출물</span>
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
            <h2 className="text-heading-2xl text-text-primary">관심 구역으로 시작하세요</h2>
            <p className="mb-16 max-w-[44ch] text-body-md-regular text-text-secondary">
              모니터링할 행정구역이나 관심 지역을 설정하면,
              정기 관측부터 재난 대응 SLA까지 맞춤 시나리오를 구성합니다.
            </p>
            <Button size="lg" render={<a href="mailto:support@naraspace.com" />} nativeButton={false}>
              문의하기
            </Button>
          </Card.Body>
        </Card.Root>
      </section>

      <OtherSolutions current="citadel" />
    </div>
  );
}
