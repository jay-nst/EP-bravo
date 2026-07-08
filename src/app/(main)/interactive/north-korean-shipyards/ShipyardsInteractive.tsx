'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

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
    <div ref={progressRef} style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Progress bar */}
      <div className="fixed top-[var(--header-height)] left-0 right-0 z-40 h-0.5" style={{ background: 'var(--border)' }}>
        <div className="h-full transition-all duration-150" style={{ background: 'var(--accent)', width: `${scrollProgress * 100}%` }} />
      </div>

      {/* Floating site indicator */}
      <div className="fixed top-[calc(var(--header-height)+16px)] right-6 z-40 hidden lg:flex flex-col gap-1.5">
        {SITES.map((site) => (
          <a
            key={site.id}
            href={`#${site.id}`}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md transition-all text-right"
            style={{
              background: activeSite === site.id ? 'var(--surface-elevated)' : 'transparent',
              border: activeSite === site.id ? '1px solid var(--accent)' : '1px solid transparent',
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: activeSite === site.id ? 'var(--accent)' : 'var(--border)' }}
            />
            <span className="text-[10px] font-mono" style={{ color: activeSite === site.id ? 'var(--accent)' : 'var(--text-muted)' }}>
              {site.name}
            </span>
          </a>
        ))}
      </div>

      {/* ===== COVER ===== */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(27,191,168,0.015) 4px, rgba(27,191,168,0.015) 5px)',
        }} />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse at 65% 30%, rgba(27,191,168,0.08), transparent 60%)',
        }} />

        <div className="max-w-3xl mx-auto px-6 py-24 relative z-10">
          <div
            ref={setRef(sectionIdx++)}
            className="transition-all duration-700"
            style={{ opacity: visible[0] !== false ? 1 : 0, transform: visible[0] !== false ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-block w-8 h-px" style={{ background: 'var(--accent)' }} />
              <span className="text-xs font-mono tracking-[0.15em] uppercase font-semibold" style={{ color: 'var(--accent)' }}>
                EarthPaper Original · 방위 분석
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-[1.15] mb-6" style={{ color: 'var(--text)' }}>
              위성이 포착한<br />
              북한 5대 조선소
            </h1>
            <p className="text-lg md:text-xl leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
              사라진 선박의 행방 — 남포, 신포, 마양도, 청진, 라진<br />
              5개 핵심 거점의 구조 변화를 위성영상으로 추적합니다.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              <span>2026.05.26</span>
              <span>·</span>
              <span>6분 읽기</span>
              <span>·</span>
              <span>EarthPaper 편집팀</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ===== EXECUTIVE SUMMARY ===== */}
      <section className="py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div
            ref={setRef(sectionIdx++)}
            className="transition-all duration-700 delay-100"
            style={{ opacity: visible[1] ? 1 : 0, transform: visible[1] ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <p className="text-xs font-mono tracking-wider mb-4 uppercase" style={{ color: 'var(--accent)' }}>Executive Summary</p>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              위성영상 분석 결과, 북한 5개 핵심 조선소·항만에서 <span style={{ color: 'var(--text)' }}>조직적인 해군 활동 징후</span>가 식별되었습니다.
              남포와 청진에서는 신형 수상함(최현함, 강건함)이, 신포와 마양도에서는 잠수함 지원 활동이 관측되었습니다.
              청진에서 좌초된 강건함은 라진항에서 재진수에 성공한 것으로 확인됩니다.
            </p>
          </div>

          {/* Overview stats */}
          <div
            ref={setRef(sectionIdx++)}
            className="grid grid-cols-3 gap-6 mt-12 transition-all duration-700 delay-200"
            style={{ opacity: visible[2] ? 1 : 0, transform: visible[2] ? 'translateY(0)' : 'translateY(30px)' }}
          >
            {[
              { label: '분석 지점', value: '5', unit: '곳' },
              { label: '분석 기간', value: '2023–2026', unit: '' },
              { label: '주요 변화', value: '12', unit: '건' },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-lg" style={{ border: '1px solid var(--border)' }}>
                <p className="text-2xl font-bold font-mono" style={{ color: 'var(--accent)' }}>{stat.value}</p>
                <p className="text-[10px] font-mono mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label} {stat.unit}</p>
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
            className="py-20"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="max-w-3xl mx-auto px-6">
              {/* Site header */}
              <div
                ref={setRef(refIdx)}
                className="transition-all duration-700"
                style={{ opacity: visible[refIdx] ? 1 : 0, transform: visible[refIdx] ? 'translateY(0)' : 'translateY(30px)' }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-bold font-mono" style={{ color: 'var(--accent)' }}>
                    {String(siteIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="w-8 h-px" style={{ background: 'var(--accent)' }} />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(27,191,168,0.15)', color: 'var(--accent)' }}>
                    {site.badge}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-1">{site.name}</h2>
                <p className="text-sm font-mono mb-6" style={{ color: 'var(--text-muted)' }}>
                  {site.nameEn} · {site.coord.lat}°N {site.coord.lng}°E
                </p>
              </div>

              {/* Before/After comparison visual */}
              <div
                ref={setRef(contentRefIdx)}
                className="transition-all duration-700 delay-150"
                style={{ opacity: visible[contentRefIdx] ? 1 : 0, transform: visible[contentRefIdx] ? 'translateY(0)' : 'translateY(30px)' }}
              >
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="rounded-lg overflow-hidden relative" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <img
                      src={site.images.before}
                      alt={`${site.name} — ${site.dates.before}`}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(14,14,16,0.8)', color: 'var(--text-muted)', backdropFilter: 'blur(4px)' }}>
                        BEFORE · {site.dates.before}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden relative" style={{ background: 'var(--surface)', border: '1px solid var(--accent)' }}>
                    <img
                      src={site.images.after}
                      alt={`${site.name} — ${site.dates.after}`}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(14,14,16,0.8)', color: 'var(--accent)', backdropFilter: 'blur(4px)' }}>
                        AFTER · {site.dates.after}
                      </span>
                    </div>
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div style={{
                        position: 'absolute', left: 0, right: 0, height: 2,
                        background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                        animation: 'scan-line 3s ease-in-out infinite',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Key change callout */}
                <div className="p-4 rounded-lg mb-8" style={{ background: 'rgba(27,191,168,0.06)', border: '1px solid rgba(27,191,168,0.2)' }}>
                  <p className="text-[10px] font-mono tracking-wider mb-1 uppercase" style={{ color: 'var(--accent)' }}>Key Change</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{site.keyChange}</p>
                </div>

                {/* Paragraphs */}
                <div className="space-y-4">
                  {site.paragraphs.map((p, i) => (
                    <p key={i} className="text-sm leading-[1.8]" style={{ color: 'var(--text-muted)' }}>
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
      <section className="py-20" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div
            ref={setRef(sectionIdx++)}
            className="transition-all duration-700"
            style={{ opacity: visible[sectionIdx - 1] ? 1 : 0, transform: visible[sectionIdx - 1] ? 'translateY(0)' : 'translateY(30px)' }}
          >
            <p className="text-xs font-mono tracking-wider mb-4 uppercase" style={{ color: 'var(--accent)' }}>Conclusion</p>
            <p className="text-base md:text-lg leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              위성영상만으로 함정의 내부 능력이나 구체적 용도를 완전히 평가하는 데는 한계가 있습니다.
              그러나 <span style={{ color: 'var(--text)' }}>지속적인 위성영상 분석</span>은 함정 위치 변화, 시설 및 지형 변화, 재고 야적장 상태를 객관적으로 추적하는 데 상당한 가치를 지닙니다.
              이러한 데이터의 축적은 <span style={{ color: 'var(--text)' }}>북한 내부 변화를 분석하는 보다 정밀하고 과학적인 근거</span>가 됩니다.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start gap-4 mt-12 p-6 rounded-xl" style={{ border: '1px solid var(--border)' }}>
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">방위·보안 분야 위성영상 분석이 필요하신가요?</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nara Space의 위성영상 분석 솔루션에 대해 알아보세요.</p>
            </div>
            <a
              href="https://ep.naraspace.com/post/contents/satellite-imagery-changes-five-major-north-korean-shipyards-ports"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-md text-sm font-medium flex-shrink-0"
              style={{ background: 'var(--accent)', color: '#0E0E10' }}
            >
              원문 보기 →
            </a>
          </div>

          <div className="mt-8">
            <Link href="/" className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              ← EarthPaper 홈으로
            </Link>
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
