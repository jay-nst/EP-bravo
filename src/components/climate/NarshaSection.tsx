import { GG2A_NOTES, GG2A_SPECS, LAUNCH_SEQUENCE } from '@/lib/climate-content';
import PortalSectionHead from './PortalSectionHead';
import s from './climate.module.css';

/** 나르샤·경기샛 — 사실 위주. "국내 최초" 주어는 경기샛-2A (기존 공지와 동일). 군집 위성 수 미표기 */
export default function NarshaSection() {
  return (
    <section id="narsha" className={s.pSection} aria-labelledby="narsha-title">
      <div className={s.pInner}>
        <PortalSectionHead
          id="narsha-title"
          meta="출처 · 나라스페이스 보도자료 (2026.10.02), 경기기후위성 리플렛"
          title="경기샛-2A와 나르샤"
          lead="경기샛-2A는 2026년 10월 2일 발사된 국내 최초의 메탄 관측 위성입니다. 나라스페이스는 같은 플랫폼으로 메탄 관측 위성군 나르샤(NarSha)를 구축하고 있습니다."
        />

        <div className={s.pFacts}>
          {GG2A_SPECS.map((sp) => (
            <div key={sp.label} className={s.pFact} data-reveal="">
              <span className={`${s.pStatValue} ${s.pNum}`}>
                {sp.value}
                <span className={s.pUnit}>{sp.unit}</span>
              </span>
              <span className={s.pStatLabel}>{sp.label}</span>
            </div>
          ))}
        </div>

        <ol className={`${s.pSteps} ${s.pSteps4}`}>
          {LAUNCH_SEQUENCE.map((step) => (
            <li key={step.title}>
              <span className={s.pStepKey}>{step.key}</span>
              <span className={s.pStepTitle}>{step.title}</span>
              <span className={s.pBody}>{step.detail}</span>
            </li>
          ))}
        </ol>

        <ul className={s.pNotes}>
          {GG2A_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
