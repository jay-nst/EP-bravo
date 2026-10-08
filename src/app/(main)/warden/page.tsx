'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import OtherSolutions from '@/components/landing/OtherSolutions';
import GyeonggisatSection from '@/components/warden/GyeonggisatSection';
import SolutionMap from '@/components/warden/SolutionMap';
import AgentShowcase from '@/components/warden/AgentShowcase';
import PostCuration from '@/components/warden/PostCuration';
import { CLIMATE_DASHBOARDS, SOURCES } from '@/lib/climate-intel';
import s from '@/components/warden/warden.module.css';

const WardenSimulator = dynamic(
  () => import('@/components/warden/WardenSimulator'),
  { ssr: false },
);

const TIMELINE = [
  { date: '2026년 12월 30일', label: 'EUDR 시행 (대·중견기업)', active: true },
  { date: '2027년', label: 'EU 메탄 규제 — 수입 화석연료 보고 의무', active: false },
  { date: '2030년', label: 'EU 메탄 배출 상한 적용', active: false },
];

const USE_CASE_STEPS = [
  { num: '01', title: '농지 등록', desc: '공급 농지 2,400곳을 지도에 올립니다.' },
  { num: '02', title: '기준선 비교', desc: 'Sentinel-2로 2020년과 비교해 산림전용 여부를 판정합니다.' },
  { num: '03', title: 'DDS 생성', desc: 'EU TRACES 형식의 실사보고서를 자동으로 만듭니다.' },
  { num: '04', title: '계속 지켜보기', desc: '분기마다 변화를 확인하고 위험한 농지는 바로 알립니다.' },
];

const EUDR_DEADLINE = new Date('2026-12-30T00:00:00');

function daysUntilDeadline() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = EUDR_DEADLINE.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function WardenPage() {
  const dDay = daysUntilDeadline();

  return (
    <div className={s.page} style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section className={s.tile} style={{ paddingTop: 140, paddingBottom: 140 }}>
        <div className={`${s.inner} ${s.center}`}>
          <span className={s.eyebrow}>Warden 기후 인텔리전스</span>
          <h1 className={s.hero}>
            지구의 변화,<br />
            우주에서 먼저 봅니다.
          </h1>
          <p className={`${s.lead} ${s.narrow}`}>
            메탄이 새는 곳, 산불이 지나간 자리, 사라진 숲. 나라스페이스가 만든 위성과 AI가
            기후 문제를 <strong>숫자로</strong> 보여줍니다.
          </p>
          <div className={s.actions}>
            <a href="#contact" className={s.pill}>도입 문의</a>
            <a href="#gyeonggisat" className={s.link}>경기샛-2A 발사 소식</a>
          </div>
        </div>
      </section>

      <GyeonggisatSection />
      <SolutionMap />
      <AgentShowcase />

      {/* Compliance (기존 Warden EUDR) */}
      <section id="compliance" className={s.tile}>
        <div className={s.inner}>
          <div className={s.center} style={{ marginBottom: 64 }}>
            <span className={s.eyebrow}>EUDR</span>
            <h2 className={s.h2}>산림을 훼손하지 않았다는 증명,<br />위성으로 합니다.</h2>
            <p className={`${s.lead} ${s.narrow}`}>
              EU 산림전용규제가 2026년 12월 30일 시행됩니다. 팜유를 EU로 수출하는 회사라면, 공급망 전체가
              2020년 이후 숲을 베지 않았다는 걸 보여줘야 합니다.
            </p>
          </div>

          <div className={s.specs} style={{ marginTop: 0, marginBottom: 72 }}>
            <div className={s.spec}>
              <span className={s.specValue}>D-{dDay}</span>
              <span className={s.specLabel}>EUDR 시행까지</span>
            </div>
            <div className={s.spec}>
              <span className={s.specValue}>2020<span className={s.specUnit}>년</span></span>
              <span className={s.specLabel}>산림전용 판정 기준선</span>
            </div>
            <div className={s.spec}>
              <span className={s.specValue}>10<span className={s.specUnit}>m</span></span>
              <span className={s.specLabel}>자체 위성 없이, Sentinel-2 무료 데이터로 시작</span>
            </div>
          </div>

          <ol className={s.timeline} style={{ listStyle: 'none', padding: 0, marginTop: 0 }}>
            {USE_CASE_STEPS.map((step) => (
              <li key={step.num} className={s.step}>
                <span className={s.stepKey}>{step.num}</span>
                <span className={s.stepTitle}>{step.title}</span>
                <span className={s.body} style={{ fontSize: 15 }}>{step.desc}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div style={{ background: 'var(--w-black)', paddingBottom: 56 }}>
        <WardenSimulator />
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div className={s.grid3}>
            {TIMELINE.map((t) => (
              <div key={t.date} className={s.card} style={{ padding: '28px 28px' }}>
                <span className={`${s.cardMeta} ${t.active ? s.statusLive : ''}`}>{t.date}</span>
                <span className={s.body} style={{ color: 'var(--w-text)' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PostCuration />

      {/* Climate dashboards */}
      <section id="dashboards" className={s.tile}>
        <div className={s.inner}>
          <div className={s.center} style={{ marginBottom: 56 }}>
            <h2 className={s.h2}>지금 돌아가는 기후 지도.</h2>
            <p className={`${s.lead} ${s.narrow}`}>공공데이터와 위성 분석을 합쳐 지자체가 바로 쓰는 지도로 만들었습니다.</p>
          </div>
          <div className={s.grid2}>
            {CLIMATE_DASHBOARDS.map((d) => (
              <Link key={d.href} href={d.href} className={`${s.card} ${s.cardLink}`}>
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
          <h2 className={s.hero}>어디를 봐야 할지<br />알려주세요.</h2>
          <p className={`${s.lead} ${s.narrow}`}>
            메탄 배출원, 재난 피해, EUDR 실사. 관심 있는 지역과 목적을 알려주시면 맞는 위성과 분석을 제안드립니다.
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
          {' · 경기기후위성 리플렛 (경기도·나라스페이스)'}
        </p>
      </section>

      <div style={{ background: 'var(--w-black)', paddingTop: 24 }}>
        <OtherSolutions current="warden" />
      </div>
    </div>
  );
}
