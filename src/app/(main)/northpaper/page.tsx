'use client';

import dynamic from 'next/dynamic';
import { Button, Card } from '@naraspace-technology/nds/components';
import { IconArrowRight } from '@naraspace-technology/nds/icons';
import OtherSolutions from '@/components/landing/OtherSolutions';

const NorthpaperSimulator = dynamic(
  () => import('@/components/northpaper/NorthpaperSimulator'),
  { ssr: false },
);

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
    <div className="min-h-screen bg-bg-tertiary">
      <section className="mx-auto max-w-640 px-16 pb-32 pt-48 sm:px-24 sm:pb-80 sm:pt-120">
        <div
          className="mb-24 inline-flex items-center gap-8 rounded-full px-12 py-4"
          style={{ background: 'rgba(61, 90, 128, 0.12)' }}
        >
          <span className="size-8 rounded-xs" style={{ background: '#3D5A80' }} />
          <span className="text-body-xs-regular text-text-tertiary">EarthPaper ·</span>
          <span className="text-body-xs-regular" style={{ color: '#3D5A80' }}>Northpaper</span>
        </div>

        <h1 className="mb-16 text-heading-3xl text-text-primary md:text-display-md">
          국방 · 안보
        </h1>

        <p className="mb-48 max-w-[48ch] text-body-md-regular text-text-tertiary">
          보안 요건에 따라 본 페이지에서는 역량 개요만 안내합니다.
          상세 사항은 별도 채널을 통해 문의해 주시기 바랍니다.
        </p>

        {/* Use Case */}
        <div className="border-t border-border-tertiary pt-32">
          <span className="mb-16 block text-body-xs-regular text-text-tertiary">Use Case</span>

          <h2 className="mb-8 text-heading-xl text-text-primary">
            개성공단 무단 가동 탐지
          </h2>
          <p className="mb-28 text-body-sm-regular text-text-tertiary">
            2016년 공식 폐쇄된 개성공단. 북한의 무단 사용 정황을 다중 위성 분석으로 포착한
            실제 분석 시나리오입니다.
          </p>

          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2">
            {[
              {
                no: '01',
                title: '광역 스크리닝',
                desc: '열적외선 위성으로 공단 내 비정상 열원(핫스팟) 포착',
              },
              {
                no: '02',
                title: '고해상도 확인',
                desc: '의심 구역을 옵저버 고해상도 영상으로 정밀 분석',
              },
              {
                no: '03',
                title: '변화 탐지',
                desc: '버스 290대 차고지 시계열 분석 — 122대 위치 변화 포착',
              },
              {
                no: '04',
                title: '인텔리전스 리포트',
                desc: '무단 가동 정황 종합 판정, 정책 의사결정 근거 제공',
              },
            ].map((step) => (
              <Card.Root key={step.no}>
                <Card.Body className="gap-8">
                  <span className="mb-4 text-body-sm-medium tabular-nums" style={{ color: '#3D5A80' }}>
                    {step.no}
                  </span>
                  <Card.Title>{step.title}</Card.Title>
                  <p className="text-body-sm-regular text-text-tertiary">{step.desc}</p>
                </Card.Body>
              </Card.Root>
            ))}
          </div>

          <Button
            variant="text"
            className="mt-20"
            rightIcon={<IconArrowRight />}
            render={
              <a
                href="https://ep.naraspace.com/ko/post/contents/unauthorized-operation-caught-at-kaesong-industrial-complex_-along-with-disappeared-buses"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            nativeButton={false}
          >
            이 분석의 상세 내용을 확인하세요
          </Button>

          <p
            className="mt-16 rounded-sm px-16 py-14 text-body-xs-regular text-text-tertiary"
            style={{ background: 'rgba(61, 90, 128, 0.08)' }}
          >
            북한 지역 상시 모니터링 데이터셋 — 글로벌 경쟁사가 복제할 수 없는 차별점
          </p>
        </div>

        {/* Interactive Simulator */}
        <div className="mt-48 border-t border-border-tertiary pt-32">
          <NorthpaperSimulator />
        </div>

        <div className="mt-48 border-t border-border-tertiary pt-32">
          <span className="mb-20 block text-body-xs-regular text-text-tertiary">역량</span>

          <div className="grid gap-12">
            {CAPABILITIES.map((c) => (
              <Card.Root key={c.title}>
                <Card.Body className="gap-4">
                  <h3 className="text-body-md-medium" style={{ color: '#3D5A80' }}>
                    {c.title}
                  </h3>
                  <p className="text-body-sm-regular text-text-tertiary">{c.desc}</p>
                </Card.Body>
              </Card.Root>
            ))}
          </div>
        </div>

        {/* Public Analysis */}
        <div className="mt-48 border-t border-border-tertiary pt-32">
          <span className="mb-20 block text-body-xs-regular text-text-tertiary">공개 분석</span>
          <div className="grid gap-12">
            {[
              { title: '위성이 포착한 북한 5대 조선소 구조 변화', location: 'North Korea', href: 'https://ep.naraspace.com/ko/post/contents/satellite-imagery-changes-five-major-north-korean-shipyards-ports' },
              { title: '이란 핵시설 공습 피해 위성영상 분석', location: 'Iran', href: 'https://ep.naraspace.com/ko/post/contents/airstrike-damage-to-irans-nuclear-facilities-the-truth-seen-from-satellite-imagery' },
              { title: '금강산 관광지구 철거 현황과 전망', location: 'North Korea', href: 'https://ep.naraspace.com/ko/post/contents/kumgangsan-tourist-area-demolition-status-and-outlook' },
            ].map((post) => (
              <Card.Root
                key={post.href}
                interactive
                render={<a href={post.href} target="_blank" rel="noopener noreferrer" />}
              >
                <Card.Body className="gap-4">
                  <p className="text-body-md-medium" style={{ color: '#3D5A80' }}>{post.title}</p>
                  <span className="text-body-xs-regular text-text-tertiary">{post.location} · ep.naraspace.com</span>
                </Card.Body>
              </Card.Root>
            ))}
          </div>
        </div>

        {/* Contact */}
        <Card.Root className="mt-48">
          <Card.Body className="items-center gap-20 py-24 text-center">
            <p className="text-body-sm-regular text-text-tertiary">
              국방·안보 관련 문의는 별도 채널로 안내합니다.
            </p>
            <Button size="lg" render={<a href="mailto:defense@naraspace.com" />} nativeButton={false}>
              문의하기
            </Button>
          </Card.Body>
        </Card.Root>
      </section>

      <OtherSolutions current="northpaper" />
    </div>
  );
}
