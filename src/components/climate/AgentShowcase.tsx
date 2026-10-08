import Link from 'next/link';
import { AGENT_FACTS, AGENT_STEPS, FIRE_DEEP_DIVE } from '@/lib/climate-content';
import s from './climate.module.css';
import { revealDelay } from './useScrollReveal';
import CaseStudy from './CaseStudy';
import DeepDive from './DeepDive';

export default function AgentShowcase() {
  return (
    <section id="agent" className={`${s.tile} ${s.tileAlt}`}>
      <div className={s.inner}>
        <div className={s.center} style={{ marginBottom: 72 }} data-reveal="">
          <span className={s.eyebrow}>EP Agent</span>
          <h2 className={s.hero}>질문 하나로<br />위성 분석까지.</h2>
          <p className={`${s.lead} ${s.narrow}`}>
            “이 산불, 피해가 얼마나 돼?” 한 문장이면 됩니다. 영상 검색과 전후 비교, 피해 계산을 거쳐 보고서까지 작성합니다. GIS 전문가가 없어도 됩니다.
          </p>
          <div className={s.actions}>
            <Link href="/proposals/agent-tutorial" className={s.pill}>데모 체험하기</Link>
            <a href="https://agent.ep.naraspace.com" target="_blank" rel="noopener noreferrer" className={s.link}>
              EP Agent 열기
            </a>
          </div>
        </div>

        <CaseStudy />
        <div style={{ marginBottom: 120 }}>
          <DeepDive article={FIRE_DEEP_DIVE} />
        </div>

        <div style={{ display: 'grid', gap: 72 }}>
          {AGENT_STEPS.map((step) => (
            <figure key={step.num} className={s.shot} data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={step.image} alt={step.alt} loading="lazy" />
              <figcaption>
                <h3 className={s.h3}>{step.title}</h3>
                <p className={s.body}>{step.desc}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={s.specs}>
          {AGENT_FACTS.map((f, i) => (
            <div key={f.label} className={s.spec} data-reveal="" style={revealDelay(i * 120)}>
              <span className={s.specValue}>
                <span data-count={f.value}>{f.value}</span>
                <span className={s.specUnit}>{f.unit}</span>
              </span>
              <span className={s.specLabel}>{f.label}</span>
            </div>
          ))}
        </div>
        <p className={`${s.fine} ${s.center}`} style={{ marginTop: 24 }}>
          Santa Rosa Island 산불 (2026) · EP Agent 분석 결과
        </p>
      </div>
    </section>
  );
}
