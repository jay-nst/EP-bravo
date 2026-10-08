import Link from 'next/link';
import { AGENT_FACTS, AGENT_STEPS } from '@/lib/climate-intel';
import s from './warden.module.css';

export default function AgentShowcase() {
  return (
    <section id="agent" className={`${s.tile} ${s.tileAlt}`}>
      <div className={s.inner}>
        <div className={s.center} style={{ marginBottom: 72 }}>
          <span className={s.eyebrow}>EP Agent</span>
          <h2 className={s.hero}>물어보면,<br />위성이 답합니다.</h2>
          <p className={`${s.lead} ${s.narrow}`}>
            “이 산불, 피해가 얼마나 돼?” 한 문장이면 됩니다. 영상을 찾고, 전후를 비교하고, 피해를 계산해
            보고서까지 씁니다. GIS 전문가가 없어도 됩니다.
          </p>
          <div className={s.actions}>
            <Link href="/proposals/agent-tutorial" className={s.pill}>데모 체험하기</Link>
            <a href="https://agent.ep.naraspace.com" target="_blank" rel="noopener noreferrer" className={s.link}>
              EP Agent 열기
            </a>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 72 }}>
          {AGENT_STEPS.map((step) => (
            <figure key={step.num} className={s.shot}>
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
          {AGENT_FACTS.map((f) => (
            <div key={f.label} className={s.spec}>
              <span className={s.specValue}>
                {f.value}
                <span className={s.specUnit}>{f.unit}</span>
              </span>
              <span className={s.specLabel}>{f.label}</span>
            </div>
          ))}
        </div>
        <p className={`${s.fine} ${s.center}`} style={{ marginTop: 24 }}>
          2026년 Santa Rosa Island 산불을 EP Agent로 분석한 결과입니다.
        </p>
      </div>
    </section>
  );
}
