import DeepDive from './DeepDive';
import { SpectrumDiagram } from './MethaneSection';
import PortalSectionHead from './PortalSectionHead';
import { METHANE_DEEP_DIVE, METHANE_FACTS, METHANE_HOW, METHANE_REGULATIONS } from '@/lib/climate-content';
import s from './climate.module.css';

/** 메탄 해설 — MethaneSection 의 설명 부분만 정보원 문법으로. 판매 톤 블록(강점·업종)·대표 인용은 제외 */
export default function MethaneExplainer() {
  return (
    <section id="explain" className={`${s.pSection} ${s.tileAlt}`} aria-labelledby="explain-title">
      <div className={s.pInner}>
        <PortalSectionHead
          id="explain-title"
          meta="출처 · IPCC AR6, IEA, NOAA, 기후솔루션"
          title="메탄 해설"
          lead="메탄은 온실효과가 크지만 대기 중에 머무는 기간이 짧습니다. 배출원을 찾아 줄이면 효과가 빨리 나타납니다."
        />

        <div className={s.pFacts}>
          {METHANE_FACTS.map((f) => (
            <div key={f.label} className={s.pFact} data-reveal="">
              <span className={`${s.pStatValue} ${s.pNum}`}>
                {f.value}
                <span className={s.pUnit}>{f.unit}</span>
              </span>
              <span className={s.pStatLabel}>{f.label}</span>
              <span className={s.pSource}>출처 · {f.source}</span>
            </div>
          ))}
        </div>

        <div className={s.pSub}>
          <h3 className={s.pH3}>위성이 메탄을 찾는 원리</h3>
          <p className={s.pBody} style={{ maxWidth: 720 }}>
            지표에서 반사된 햇빛이 위성으로 돌아오다가 메탄을 통과하면 특정 파장만 약해집니다. 초분광 센서는 이 차이를 잽니다.
          </p>
          <SpectrumDiagram />
          <ol className={s.pSteps}>
            {METHANE_HOW.map((step) => (
              <li key={step.num}>
                <span className={`${s.pStepKey} ${s.pNum}`}>{step.num}</span>
                <span className={s.pStepTitle}>{step.title}</span>
                <span className={s.pBody}>{step.desc}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className={s.pSub}>
          <h3 className={s.pH3}>주요국 메탄 규제</h3>
          <div className={s.pFacts}>
            {METHANE_REGULATIONS.map((r) => (
              <div key={r.label} className={s.pFact} data-reveal="">
                <span className={s.pStatValue}>{r.value}</span>
                <span className={s.pStatLabel}>{r.label}</span>
                <span className={s.pSource}>{r.detail}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.pSub}>
          <DeepDive article={METHANE_DEEP_DIVE} />
        </div>
      </div>
    </section>
  );
}
