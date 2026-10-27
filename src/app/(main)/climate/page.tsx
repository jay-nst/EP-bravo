'use client';

import { useRef } from 'react';
import KoreaMethaneSection from '@/components/climate/KoreaMethaneSection';
import MethaneExplainer from '@/components/climate/MethaneExplainer';
import NarshaSection from '@/components/climate/NarshaSection';
import ObservationSection from '@/components/climate/ObservationSection';
import PortalFooterSections from '@/components/climate/PortalFooterSections';
import PortalHero from '@/components/climate/PortalHero';
import PortalNav from '@/components/climate/PortalNav';
import s from '@/components/climate/climate.module.css';
import { useScrollReveal } from '@/components/climate/useScrollReveal';

// 2026-10-27 메탄 정보 포털로 개편 (기획 예시, 회의록 NST-20261019).
// 이전 기후 인텔리전스 섹션(SatelliteSection, SolutionMap, AgentShowcase, LandSection, PostCuration,
// RoadmapSection, MethaneSection, GyeonggisatSection, LocalNav, OtherSolutions)은 마운트만 뺐고 파일은 유지한다.
export default function ClimatePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);

  return (
    <div ref={rootRef} className={s.page} style={{ minHeight: '100vh' }}>
      <PortalNav />
      {/* (main)/layout.tsx 가 이미 <main> 과 사이트 Footer 를 감싼다 */}
      <PortalHero />
      <KoreaMethaneSection />
      <ObservationSection />
      <MethaneExplainer />
      <NarshaSection />
      <PortalFooterSections />
    </div>
  );
}
