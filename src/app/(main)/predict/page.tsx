'use client';

import dynamic from 'next/dynamic';
import { Badge, Button, Card, Separator, StatusChip } from '@naraspace-technology/nds/components';
import { IconArrowRight } from '@naraspace-technology/nds/icons';
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

// 검증 리포트 예시 값의 의미 색 — 운영 버전(78e9433) 색 그대로 (NDS_FULL_ADOPTION_RULES §8)
const REPORT_TONE_CLASS = {
  success: 'text-[#4A9E6B]',
  warning: 'text-[#C8923A]',
} as const;

// 운영 색 복원 — 색만 덮고 크기·모서리·패딩은 NDS 그대로
const CTA_SOLID_CLASS =
  'bg-[#4A9EC4] text-white [&_svg]:text-white not-data-disabled:not-aria-invalid:hover:bg-[#4A9EC4] hover:opacity-85';
const CTA_OUTLINE_CLASS =
  'text-text-tertiary inset-ring-border-tertiary not-data-disabled:not-aria-invalid:hover:bg-transparent not-data-disabled:not-aria-invalid:hover:inset-ring-border-tertiary hover:opacity-85';

export default function PredictPage() {
  return (
    <div className="min-h-screen bg-bg-tertiary">
      {/* Hero */}
      <section className="mx-auto max-w-960 px-16 pb-48 pt-48 sm:px-24 sm:pb-64 sm:pt-80">
        <div className="mb-20">
          <StatusChip
            status="neutral"
            className="bg-[rgba(74,158,196,0.12)] text-text-tertiary"
            icon={<span aria-hidden className="size-8 shrink-0 rounded-[2px] bg-[#4A9EC4]" />}
          >
            EarthPaper · <span className="text-[#4A9EC4]">Predict</span>
          </StatusChip>
        </div>

        <h1 className="mb-16 text-heading-3xl text-text-primary md:text-display-md">
          현지 실사 없이,<br />
          자산을 검증합니다
        </h1>

        <p className="mb-32 max-w-[52ch] text-body-md-regular text-text-tertiary">
          해외 태양광 발전소, 광산, 야적장 —
          위성 영상으로 자산의 존재와 상태를 원격 검증합니다.
        </p>

        <div className="flex flex-wrap gap-12">
          <Button
            size="lg"
            className={CTA_SOLID_CLASS}
            rightIcon={<IconArrowRight />}
            render={<a href="https://predicthings.com" target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
          >
            Predict 서비스
          </Button>
          <Button size="lg" variant="outline" className={CTA_OUTLINE_CLASS} render={<a href="#contact" />} nativeButton={false}>
            자산 검증 상담
          </Button>
        </div>
      </section>

      {/* Use case */}
      <section className="mx-auto max-w-960 px-16 pb-64 sm:px-24">
        <div className="mb-24 flex flex-col items-start gap-8">
          <StatusChip status="neutral" showIcon={false} className="text-text-tertiary">Use Case</StatusChip>
          <h2 className="text-heading-2xl text-text-primary">
            인도 라자스탄 태양광 발전소 — 원격 자산 검증
          </h2>
          <p className="max-w-[60ch] text-body-md-regular text-text-tertiary">
            수출입은행이 인도 라자스탄의 150MW 태양광 발전소에 투자했습니다.
            현지 실사단을 파견하는 대신, 위성 기반 검증으로 자산을 원격 관리합니다.
          </p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-12">
          {USE_CASE_STEPS.map((step) => (
            <Card.Root key={step.n} className="bg-bg-secondary">
              <Card.Body className="gap-8">
                <span className="text-body-xs-regular tabular-nums text-[#4A9EC4]">{step.n}</span>
                <Card.Title>{step.title}</Card.Title>
                <p className="text-body-sm-regular text-text-tertiary">{step.desc}</p>
              </Card.Body>
            </Card.Root>
          ))}
        </div>

        <p className="mt-16 text-body-xs-regular text-text-tertiary">
          현지 실사 비용의 1/10로, 분기마다 반복 검증 가능
        </p>
      </section>

      {/* Interactive Simulator */}
      <PredictSimulator />

      {/* Report mockup */}
      <section className="mx-auto max-w-960 px-16 pb-64 sm:px-24">
        <Card.Root>
          <Card.Body className="gap-16">
            <Card.Title className="text-text-tertiary">검증 리포트 예시</Card.Title>
            <Separator className="bg-border-tertiary" />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-16">
              {[
                { label: '자산 유형', value: '태양광 발전소' },
                { label: '위치', value: 'Rajasthan, India' },
                { label: '용량', value: '150 MW' },
                { label: '검증 상태', value: '가동 확인', tone: 'success' as const },
                { label: '패널 면적', value: '2.4 km²' },
                { label: '마지막 관측', value: '2026. 07. 12.' },
                { label: '식생 침범', value: '2개 구역 탐지', tone: 'warning' as const },
                { label: '건설 진행률', value: '100%' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-4">
                  <span className="text-body-xs-regular text-text-tertiary">{item.label}</span>
                  <span
                    className={`text-body-sm-medium tabular-nums ${item.tone ? REPORT_TONE_CLASS[item.tone] : 'text-text-primary'}`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card.Root>
      </section>

      {/* Verticals */}
      <section className="mx-auto max-w-960 px-16 pb-64 sm:px-24">
        <div className="mb-24 flex flex-col items-start gap-8 border-b border-border-tertiary pb-12">
          <h2 className="text-heading-2xl text-text-tertiary">서비스 영역</h2>
        </div>

        <div className="grid gap-12">
          {VERTICALS.map((v) => (
            <Card.Root key={v.id}>
              <Card.Body className="gap-16">
                <div className="flex items-center gap-12">
                  <Card.Title className="flex-1 text-[#4A9EC4]">{v.title}</Card.Title>
                  {v.badge && (
                    <Badge type="letter" className="bg-[rgba(138,134,128,0.15)] text-text-tertiary">
                      {v.badge}
                    </Badge>
                  )}
                </div>

                <p className="max-w-[60ch] text-body-sm-regular text-text-tertiary">{v.desc}</p>

                <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
                  <div className="flex flex-col gap-4">
                    <span className="text-body-xs-regular text-text-tertiary">고객</span>
                    <Card.Content>{v.customers}</Card.Content>
                  </div>
                  <div className="flex flex-col gap-4">
                    <span className="text-body-xs-regular text-text-tertiary">산출물</span>
                    <div className="flex flex-wrap gap-4">
                      {v.outputs.map((o) => (
                        <Badge
                          key={o}
                          type="letter"
                          className="bg-bg-secondary text-text-primary inset-ring-1 inset-ring-border-tertiary"
                        >
                          {o}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card.Root>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-960 px-16 pb-80 sm:px-24">
        <Card.Root className="bg-bg-secondary">
          <Card.Body className="items-center gap-8 py-32 text-center">
            <h2 className="text-heading-2xl text-text-primary">
              검증할 자산을 등록하세요
            </h2>
            <p className="mb-16 max-w-[44ch] text-body-md-regular text-text-tertiary">
              태양광 발전소, 광산, 야적장 — 자산 위치를 등록하면
              위성 관측 기반 검증 리포트가 자동으로 생성됩니다.
            </p>
            <Button size="lg" className={CTA_SOLID_CLASS} render={<a href="mailto:support@naraspace.com" />} nativeButton={false}>
              자산 등록 상담
            </Button>
          </Card.Body>
        </Card.Root>
      </section>

      <OtherSolutions current="predict" />
    </div>
  );
}
