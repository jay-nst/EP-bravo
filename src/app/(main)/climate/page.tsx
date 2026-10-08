'use client';

import { useRef } from 'react';
import Link from 'next/link';
import OtherSolutions from '@/components/landing/OtherSolutions';
import GyeonggisatSection from '@/components/climate/GyeonggisatSection';
import LocalNav from '@/components/climate/LocalNav';
import MethaneSection from '@/components/climate/MethaneSection';
import SatelliteSection from '@/components/climate/SatelliteSection';
import SolutionMap from '@/components/climate/SolutionMap';
import AgentShowcase from '@/components/climate/AgentShowcase';
import LandSection from '@/components/climate/LandSection';
import PostCuration from '@/components/climate/PostCuration';
import { CLIMATE_DASHBOARDS, SOURCES } from '@/lib/climate-content';
import s from '@/components/climate/climate.module.css';
import { revealDelay, useScrollReveal } from '@/components/climate/useScrollReveal';

export default function ClimatePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);

  return (
    <div ref={rootRef} className={s.page} style={{ minHeight: '100vh' }}>
      <LocalNav />

      <a href="#methane" className={s.notice}>
        경기샛-2A, 궤도에 올랐습니다. 국내 최초 메탄 관측 위성<span>자세히 보기 ›</span>
      </a>

      {/* Hero */}
      <section id="top" className={s.tile} style={{ paddingTop: 140, paddingBottom: 140 }}>
        <div className={`${s.inner} ${s.center}`}>
          <span className={s.eyebrow} data-reveal="">나라스페이스 기후 인텔리전스</span>
          <h1 className={s.hero} data-reveal="" style={revealDelay(120)}>
            지구의 변화,<br />
            우주에서 먼저 봅니다.
          </h1>
          <p className={`${s.lead} ${s.narrow}`} data-reveal="" style={revealDelay(240)}>
            메탄이 새는 곳, 산불이 지나간 자리, 바뀌는 땅. 나라스페이스가 만든 위성과 AI가
            기후 문제를 <strong>숫자로</strong> 보여줍니다.
          </p>
          <div className={s.actions} data-reveal="" style={revealDelay(360)}>
            <a href="#contact" className={s.pill}>도입 문의</a>
            <a href="#satellites" className={s.link}>우리 위성 보기</a>
          </div>
        </div>
      </section>

      {/* 섹션 순서 = CLIMATE_SECTIONS = 솔루션 카드 순서 (위성 → 솔루션 개요 → 각 솔루션) */}
      <SatelliteSection />
      <SolutionMap />
      <div id="methane">
        <GyeonggisatSection alt />
        <MethaneSection />
      </div>
      <AgentShowcase />
      <LandSection />
      <PostCuration />

      {/* Climate dashboards */}
      <section id="dashboards" className={s.tile}>
        <div className={s.inner}>
          <div className={s.center} style={{ marginBottom: 56 }}>
            <h2 className={s.h2} data-reveal="">지금 돌아가는 기후 지도.</h2>
            <p className={`${s.lead} ${s.narrow}`}>공공데이터와 위성 분석을 합쳐 지자체가 바로 쓰는 지도로 만들었습니다.</p>
          </div>
          <div className={s.grid2}>
            {CLIMATE_DASHBOARDS.map((d, i) => (
              <Link key={d.href} href={d.href} className={`${s.card} ${s.cardLink}`} data-reveal="" style={revealDelay(i * 120)}>
                <h3 className={s.h3}>{d.label}</h3>
                <p className={s.body}>{d.desc}</p>
                <div className={s.cardFoot}>
                  <span className={s.link}>지도 열기</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className={`${s.tile} ${s.tileAlt}`}>
        <div className={`${s.inner} ${s.center}`}>
          <h2 className={s.hero} data-reveal="">어디를 봐야 할지<br />알려주세요.</h2>
          <p className={`${s.lead} ${s.narrow}`} data-reveal="" style={revealDelay(120)}>
            메탄 배출원, 재난 피해, 토지 변화. 관심 있는 지역과 목적을 알려주시면 맞는 위성과 분석을 제안드립니다.
          </p>
          <div className={s.actions}>
            <a href="mailto:support@naraspace.com" className={s.pill}>도입 문의</a>
            <span className={s.body} style={{ fontSize: 15 }}>support@naraspace.com</span>
          </div>
        </div>
      </section>

      <section className={s.tile} style={{ paddingTop: 40, paddingBottom: 24 }}>
        <p className={`${s.fine} ${s.inner}`}>
          출처:{' '}
          {SOURCES.map((src, i) => (
            <span key={src.href}>
              <a href={src.href} target="_blank" rel="noopener noreferrer">{src.label}</a>
              {i < SOURCES.length - 1 ? ' · ' : ''}
            </span>
          ))}
          {' · 경기기후위성 리플렛 (경기도·나라스페이스) · 경기샛-1 첫 영상 공개 보도자료 (2026.03)'}
        </p>
      </section>

      <div style={{ background: 'var(--w-black)', paddingTop: 24 }}>
        <OtherSolutions />
      </div>
    </div>
  );
}
