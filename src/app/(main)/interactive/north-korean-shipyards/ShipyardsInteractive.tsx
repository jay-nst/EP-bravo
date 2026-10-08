'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, StatusChip } from '@naraspace-technology/nds/components';
import { IconArrowDown, IconArrowLeft, IconArrowUpRight } from '@naraspace-technology/nds/icons';

// 색 기준 78e9433 — NDS 컴포넌트 색만 원래 값으로 덮는다
const HOVER_KEEP = 'not-data-disabled:not-aria-invalid:hover:';
/** 민트 CTA (accent 배경 + 어두운 글자) */
const MINT_CTA =
  'bg-bg-interactive-primary text-[#0E0E10] [&_svg]:text-[#0E0E10] not-data-disabled:data-active:not-hover:text-[#0E0E10] not-data-disabled:data-active:not-hover:[&_svg]:text-[#0E0E10]';
/** 홈 링크: muted 글자 (hover 색 변화 없음) */
const HOME_LINK_CLS = `text-text-tertiary [&_svg]:text-text-tertiary ${HOVER_KEEP}text-text-tertiary ${HOVER_KEEP}[&_svg]:text-text-tertiary`;
/** 사이트 배지: accent 15% 틴트 + accent 글자 */
const SITE_BADGE_CLS = 'bg-[rgba(27,191,168,0.15)] text-text-interactive-primary';

const S3 = 'https://earthpaper.s3.ap-northeast-2.amazonaws.com/post/v2/editor/48';

const SITES = [
  {
    id: 'nampo',
    name: '남포 조선소',
    nameEn: 'Nampo Shipyard Complex',
    coord: { lat: 38.73, lng: 125.38 },
    dates: { before: '2025.04.25', after: '2026.04.30' },
    badge: 'DDGHM 최현함',
    summary: '신형 유도탄 구축함 최현함 발견 — 진수식 후 조선소 복귀',
    images: {
      before: `${S3}/en-20250425-north-korea-nampo-port-and-nampo-shipyard.png`,
      after: `${S3}/en-20260430-north-korea-nampo-port-and-nampo-shipyard.png`,
    },
    paragraphs: [
      '남포는 북한 서해안의 주요 항구로, 선박 건조 시설이 밀집된 핵심 조선 거점입니다. 2025년 4월 25일 조선인민혁명군 창건 기념일에 맞춰 신형 유도탄 구축함(DDGHM) 최현함의 진수식이 진행되었습니다.',
      '2026년 4월 30일 위성영상에서 진수식이 진행된 남포항 일반 부두는 일상적인 항만 운용 상태로 복귀한 것을 확인했습니다. 동시에, 최현함으로 추정되는 대형 전투함이 남포 조선소 단지에 정박한 것이 포착되어, 진수 후 후속 작업이 진행 중인 것으로 보입니다.',
      '남포 조선소 북동쪽에서는 시설 철거 및 매립 징후가 관측되었고, 석탄·컨테이너 터미널에서는 재고 상태, 크레인 위치, 건물 배치, 컨테이너 밀도 변화 등 다양한 활동 지표가 포착되었습니다.',
    ],
    keyChange: '최현함이 일반 부두에서 조선소로 이동 — 후속 장비 탑재 작업 진행 추정',
  },
  {
    id: 'sinpo',
    name: '신포 남조선소',
    nameEn: 'Sinpo South Shipyard',
    coord: { lat: 40.03, lng: 128.17 },
    dates: { before: '2023.09.07', after: '2026.04.02' },
    badge: '잠수함 건조 기지',
    summary: '김군옥영웅함 잠수함, 안보 정박지에서 재포착',
    images: {
      before: `${S3}/en-20230907-north-korea-sinpo.png`,
      after: `${S3}/en-20260402-north-korea-sinpo.png`,
    },
    paragraphs: [
      '신포 남조선소는 북한 동해안의 핵심 잠수함 건조·정비 시설로, 잠수함 건조홀, 건선거, 안보 정박지, 건조/정비홀 등 고도화된 잠수함 지원 인프라가 집중되어 있습니다.',
      '2023년 9월 7일과 2026년 4월 2일의 위성영상 비교 분석에서, 건선거 내 활동, 안보 정박지의 함정 정박, 건조/정비홀 전면 부두 확장, 주변 지역 매립 징후 등 주목할 만한 변화들이 식별되었습니다.',
      '특히 2026년 영상에서 핵잠수함 건조홀 인근 안보 정박지에 김군옥영웅함으로 추정되는 잠수함이 확인되어, 진수 이후 정비·수리·성능 향상 활동이 지속되고 있는 것으로 판단됩니다.',
    ],
    keyChange: '김군옥영웅함이 핵잠수함 건조홀 인근에서 확인 — 성능 향상 작업 지속',
  },
  {
    id: 'mayang',
    name: '마양도 해군기지',
    nameEn: 'Mayang Island Naval Base',
    coord: { lat: 40.06, lng: 128.19 },
    dates: { before: '2023.11.10', after: '2026.04.02' },
    badge: '잠수함 운용 기지',
    summary: '로미오급 잠수함 포함 다수 전투함 정박',
    images: {
      before: `${S3}/en-20231110-north-korea-mayang-do-naval-base.png`,
      after: `${S3}/en-20260402-north-korea-mayang-do-naval-base.png`,
    },
    paragraphs: [
      '마양도는 북한 동해안의 핵심 잠수함 기지로, 잠수함 정박·정비·운용의 해군 거점 역할을 수행합니다.',
      '마양도 내 만(inlet) 위치와 정박 시설 배치를 기준으로 A구역과 B구역으로 나누어 변화를 분석했습니다. A구역의 건선거 앞에는 전투함과 로미오급 잠수함으로 추정되는 다수의 선박이 정박해 있었습니다.',
      'B구역 부두에서도 유사한 패턴의 함정 정박이 관측되었습니다. B구역에서는 별도의 건선거 시설이 확인되지 않아, 해군 임무를 수행하는 잠수함의 정박지이자 초계정의 정상 운용 기지로 주로 활용되는 것으로 추정됩니다.',
    ],
    keyChange: 'A/B 두 구역에서 동시에 잠수함·전투함 활동 포착',
  },
  {
    id: 'chongjin',
    name: '청진 조선소',
    nameEn: 'Chongjin Shipyard',
    coord: { lat: 41.78, lng: 129.79 },
    dates: { before: '2025.05.23', after: '2026.04.30' },
    badge: '강건함 좌초 사건',
    summary: '강건함 좌초 후 이동 — 진수대에서 굴착 작업 진행',
    images: {
      before: `${S3}/en-20250523-north-korea-chongjin-shipyard.png`,
      after: `${S3}/en-20260430-north-korea-chongjin-shipyard.png`,
    },
    paragraphs: [
      '청진 조선소는 2025년 5월 21일 두 번째 최현급 유도탄 구축함인 강건함의 진수식이 진행된 곳입니다. 강건함은 진수 중 좌초된 것으로 보도되었으며, 2025년 5월 23일 위성영상에서 선체가 진수 구역에 걸쳐 있는 모습이 확인되었습니다.',
      '2026년 4월 30일 영상에서 강건함은 원래 진수 위치에서 사라졌으며, 그 자리에 전투함으로 보이는 선박이 정박해 있었습니다.',
      '조선소의 선대(slipway)에서는 굴착 작업과 일치하는 지면 변화가 관측되었고, 부지 북측에서는 근로자 숙소 또는 지원 시설 추가로 추정되는 건물 확장 징후가 포착되었습니다.',
    ],
    keyChange: '좌초된 강건함이 사라지고, 진수대에 굴착 작업 징후 포착',
  },
  {
    id: 'rajin',
    name: '라진항',
    nameEn: 'Rajin Port',
    coord: { lat: 42.31, lng: 130.39 },
    dates: { before: '2025.06.12', after: '2026.04.05' },
    badge: '재진수 성공',
    summary: '강건함 복구 후 건선거 침수 방식으로 재진수',
    images: {
      before: `${S3}/en-20250612-north-korea-rajin-port-satellite-imagery.png`,
      after: `${S3}/en-20260405-north-korea-rajin-port-satellite-imagery.png`,
    },
    paragraphs: [
      '라진항은 북한 북동부의 주요 상업 항구이자 중국·러시아와의 국경 물류를 연결하는 전략적 해상 거점입니다.',
      '2025년 6월 12일, 청진 조선소에서 좌초된 강건함의 수리 및 복구 작업 후, 북한은 라진항 1번 부두 인근에서 다시 한번 진수식을 진행했습니다. 강건함을 직접 개방 수역으로 진수하는 대신, 건선거에 물을 채워 선체를 부양시키는 방식을 사용했습니다.',
      '종합하면, 남포와 청진은 신형 수상함 관련 활동에, 신포와 마양도는 잠수함 운용 및 지원에 특화되어 있으며, 라진항은 후속 정비와 재진수 의식의 전략적 거점으로 활용되고 있습니다.',
    ],
    keyChange: '건선거 침수 방식으로 강건함 재진수 — 전략적 정비 거점으로 확인',
  },
] as const;

function useScrollReveal() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = refs.current.indexOf(entry.target as HTMLDivElement);
          if (idx !== -1 && entry.isIntersecting) {
            setVisible((prev) => {
              const next = [...prev];
              next[idx] = true;
              return next;
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );

    refs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const setRef = (idx: number) => (el: HTMLDivElement | null) => {
    refs.current[idx] = el;
  };

  return { setRef, visible };
}

export default function ShipyardsInteractive() {
  const { setRef, visible } = useScrollReveal();
  const [activeSite, setActiveSite] = useState<string | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = progressRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight - window.innerHeight;
      const scrolled = -rect.top;
      setScrollProgress(Math.min(1, Math.max(0, scrolled / total)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSite(entry.target.getAttribute('data-site'));
          }
        });
      },
      { threshold: 0.4 }
    );

    document.querySelectorAll('[data-site]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  let sectionIdx = 0;

  return (
    <div ref={progressRef} className="bg-bg-tertiary text-text-primary">
      {/* Progress bar */}
      <div className="fixed top-[var(--header-height)] right-0 left-0 z-40 h-2 bg-border-tertiary">
        <div className="h-full bg-bg-interactive-primary transition-all duration-150" style={{ width: `${scrollProgress * 100}%` }} />
      </div>

      {/* Floating site indicator — 스크롤 위치 표시용 앵커 내비 (버튼 아님) */}
      <div className="fixed top-[calc(var(--header-height)+16px)] right-24 z-40 hidden flex-col gap-6 lg:flex">
        {SITES.map((site) => {
          const isActive = activeSite === site.id;
          return (
            <a
              key={site.id}
              href={`#${site.id}`}
              aria-current={isActive ? 'location' : undefined}
              className={`flex items-center gap-8 rounded-sm px-10 py-4 text-right transition-colors ${
                isActive
                  ? 'bg-bg-primary inset-ring-1 inset-ring-border-interactive-primary'
                  : 'inset-ring-1 inset-ring-transparent'
              }`}
            >
              <span
                className={`size-8 shrink-0 rounded-full ${isActive ? 'bg-bg-interactive-primary' : 'bg-border-tertiary'}`}
              />
              <span className={`text-body-xs-regular ${isActive ? 'text-text-interactive-primary' : 'text-text-tertiary'}`}>
                {site.name}
              </span>
            </a>
          );
        })}
      </div>

      {/* ===== COVER ===== */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden">
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(27,191,168,0.015) 4px, rgba(27,191,168,0.015) 5px)',
        }} />
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 65% 30%, rgba(27,191,168,0.08), transparent 60%)',
        }} />
        <div className="relative z-10 mx-auto max-w-3xl px-24 py-96">
          <div
            ref={setRef(sectionIdx++)}
            className="transition-all duration-700"
            style={{ opacity: visible[0] !== false ? 1 : 0, transform: visible[0] !== false ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <div className="mb-24 flex items-center gap-8">
              <span className="inline-block h-px w-32 bg-[#3D5A80]" />
              <StatusChip status="neutral" showIcon={false} className="bg-transparent text-[#3D5A80]">
                Northpaper Original · 방위 분석
              </StatusChip>
            </div>
            <h1 className="mb-24 text-heading-3xl text-text-primary md:text-display-md">
              위성이 포착한<br />
              북한 5대 조선소
            </h1>
            <p className="mb-32 text-body-md-regular text-text-tertiary">
              사라진 선박의 행방 — 남포, 신포, 마양도, 청진, 라진<br />
              5개 핵심 거점의 구조 변화를 위성영상으로 추적합니다.
            </p>
            <div className="flex items-center gap-16 text-body-xs-regular tabular-nums text-text-tertiary">
              <span>2026.05.26</span>
              <span>·</span>
              <span>6분 읽기</span>
              <span>·</span>
              <span>EarthPaper 편집팀</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-bounce">
          <IconArrowDown className="size-20 text-icon-tertiary" />
        </div>
      </section>

      {/* ===== EXECUTIVE SUMMARY ===== */}
      <section className="border-t border-border-tertiary py-80">
        <div className="mx-auto max-w-3xl px-24">
          <div
            ref={setRef(sectionIdx++)}
            className="transition-all delay-100 duration-700"
            style={{ opacity: visible[1] ? 1 : 0, transform: visible[1] ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <h2 className="mb-16 text-heading-2xl text-text-interactive-primary">Executive Summary</h2>
            <p className="text-body-md-regular text-text-tertiary">
              위성영상 분석 결과, 북한 5개 핵심 조선소·항만에서 <span className="text-text-primary">조직적인 해군 활동 징후</span>가 식별되었습니다.
              남포와 청진에서는 신형 수상함(최현함, 강건함)이, 신포와 마양도에서는 잠수함 지원 활동이 관측되었습니다.
              청진에서 좌초된 강건함은 라진항에서 재진수에 성공한 것으로 확인됩니다.
            </p>
          </div>

          {/* Overview stats */}
          <div
            ref={setRef(sectionIdx++)}
            className="mt-48 grid grid-cols-3 gap-24 transition-all delay-200 duration-700"
            style={{ opacity: visible[2] ? 1 : 0, transform: visible[2] ? 'translateY(0)' : 'translateY(30px)' }}
          >
            {[
              { label: '분석 지점', value: '5', unit: '곳' },
              { label: '분석 기간', value: '2023–2026', unit: '' },
              { label: '주요 변화', value: '12', unit: '건' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-bg-tertiary p-16 text-center inset-ring-1 inset-ring-border-tertiary">
                <p className="text-heading-xl tabular-nums text-text-interactive-primary">{stat.value}</p>
                <p className="mt-4 text-body-xs-regular text-text-tertiary">{stat.label} {stat.unit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SITE SECTIONS ===== */}
      {SITES.map((site, siteIndex) => {
        const refIdx = sectionIdx++;
        const contentRefIdx = sectionIdx++;
        return (
          <section
            key={site.id}
            id={site.id}
            data-site={site.id}
            className="border-t border-border-tertiary py-80"
          >
            <div className="mx-auto max-w-3xl px-24">
              {/* Site header */}
              <div
                ref={setRef(refIdx)}
                className="transition-all duration-700"
                style={{ opacity: visible[refIdx] ? 1 : 0, transform: visible[refIdx] ? 'translateY(0)' : 'translateY(30px)' }}
              >
                <div className="mb-8 flex items-center gap-12">
                  <span className="text-body-sm-medium tabular-nums text-text-interactive-primary">
                    {String(siteIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="h-px w-32 bg-bg-interactive-primary" />
                  <StatusChip status="neutral" showIcon={false} className={SITE_BADGE_CLS}>
                    {site.badge}
                  </StatusChip>
                </div>
                <h2 className="mb-4 text-heading-2xl text-text-primary">{site.name}</h2>
                <p className="mb-24 text-body-xs-regular tabular-nums text-text-tertiary">
                  {site.nameEn} · {site.coord.lat}°N {site.coord.lng}°E
                </p>
              </div>

              {/* Before/After comparison visual */}
              <div
                ref={setRef(contentRefIdx)}
                className="transition-all delay-150 duration-700"
                style={{ opacity: visible[contentRefIdx] ? 1 : 0, transform: visible[contentRefIdx] ? 'translateY(0)' : 'translateY(30px)' }}
              >
                {/* 이미지가 inset-ring 을 덮으므로 썸네일 테두리는 border 로 둔다 */}
                <div className="mb-32 grid grid-cols-2 gap-16">
                  <div className="relative overflow-hidden rounded-md border border-border-tertiary bg-bg-secondary">
                    <img
                      src={site.images.before}
                      alt={`${site.name} — ${site.dates.before}`}
                      className="block h-auto w-full"
                      loading="lazy"
                    />
                    <div className="absolute top-12 left-12">
                      <span className="rounded-xs bg-bg-tertiary/80 px-8 py-2 text-body-xs-regular tabular-nums text-text-tertiary backdrop-blur-xs">
                        BEFORE · {site.dates.before}
                      </span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-md border border-border-interactive-primary bg-bg-secondary">
                    <img
                      src={site.images.after}
                      alt={`${site.name} — ${site.dates.after}`}
                      className="block h-auto w-full"
                      loading="lazy"
                    />
                    <div className="absolute top-12 left-12">
                      <span className="rounded-xs bg-bg-tertiary/80 px-8 py-2 text-body-xs-regular tabular-nums text-text-interactive-primary backdrop-blur-xs">
                        AFTER · {site.dates.after}
                      </span>
                    </div>
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      <div style={{
                        position: 'absolute', left: 0, right: 0, height: 2,
                        background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                        animation: 'scan-line 3s ease-in-out infinite',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Key change callout */}
                <div className="mb-32 rounded-md bg-[rgba(27,191,168,0.06)] p-16 inset-ring-1 inset-ring-[rgba(27,191,168,0.2)]">
                  <h3 className="mb-4 text-body-md-medium text-text-interactive-primary">Key Change</h3>
                  <p className="text-body-md-regular text-text-primary">{site.keyChange}</p>
                </div>

                {/* Paragraphs */}
                <div className="space-y-16">
                  {site.paragraphs.map((p, i) => (
                    <p key={i} className="text-body-md-regular text-text-tertiary">
                      {p}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ===== CONCLUSION ===== */}
      <section className="border-t border-border-tertiary py-80">
        <div className="mx-auto max-w-3xl px-24">
          <div
            ref={setRef(sectionIdx++)}
            className="transition-all duration-700"
            style={{ opacity: visible[sectionIdx - 1] ? 1 : 0, transform: visible[sectionIdx - 1] ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <h2 className="mb-16 text-heading-2xl text-text-interactive-primary">Conclusion</h2>
            <p className="mb-24 text-body-md-regular text-text-tertiary">
              위성영상만으로 함정의 내부 능력이나 구체적 용도를 완전히 평가하는 데는 한계가 있습니다.
              그러나 <span className="text-text-primary">지속적인 위성영상 분석</span>은 함정 위치 변화, 시설 및 지형 변화, 재고 야적장 상태를 객관적으로 추적하는 데 상당한 가치를 지닙니다.
              이러한 데이터의 축적은 <span className="text-text-primary">북한 내부 변화를 분석하는 보다 정밀하고 과학적인 근거</span>가 됩니다.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-48 flex flex-col items-start gap-16 rounded-lg bg-bg-tertiary p-24 inset-ring-1 inset-ring-border-tertiary sm:flex-row">
            <div className="flex-1">
              <h3 className="mb-4 text-heading-lg text-text-primary">방위·보안 분야 위성영상 분석이 필요하신가요?</h3>
              <p className="text-body-md-regular text-text-tertiary">Nara Space의 위성영상 분석 솔루션에 대해 알아보세요.</p>
            </div>
            <Button
              className={`shrink-0 ${MINT_CTA}`}
              rightIcon={<IconArrowUpRight />}
              render={
                <a
                  href="https://ep.naraspace.com/post/contents/satellite-imagery-changes-five-major-north-korean-shipyards-ports"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
            >
              원문 보기
            </Button>
          </div>

          <div className="mt-32">
            <Button
              variant="text"
              size="sm"
              leftIcon={<IconArrowLeft />}
              render={<Link href="/" />}
              nativeButton={false}
              className={HOME_LINK_CLS}
            >
              EarthPaper 홈으로
            </Button>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes shipyard-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        @keyframes scan-line {
          0% { top: -2px; }
          50% { top: 100%; }
          100% { top: -2px; }
        }
      `}</style>
    </div>
  );
}
