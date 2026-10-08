import { ROADMAP } from '@/lib/climate-content';
import s from './climate.module.css';
import { revealDelay } from './useScrollReveal';

/** 로드맵 — Muon Space 발표 페이지의 "What's Next" */
export default function RoadmapSection() {
  return (
    <section id="next" className={`${s.tile} ${s.tileAlt}`}>
      <div className={s.inner}>
        <div className={s.center} style={{ marginBottom: 56 }} data-reveal="">
          <span className={s.eyebrow}>로드맵</span>
          <h2 className={s.h2}>다음 위성,<br />다음 데이터.</h2>
        </div>
        <ol className={`${s.timeline} ${s.timeline4}`} style={{ listStyle: 'none', padding: 0, marginTop: 0 }}>
          {ROADMAP.map((r, i) => (
            <li key={r.title} className={`${s.step} ${i === 0 ? s.stepNow : ''}`} data-reveal="" style={revealDelay(i * 100)}>
              <span className={s.stepKey}>{r.when}</span>
              <span className={s.stepTitle}>{r.title}</span>
              <span className={s.body} style={{ fontSize: 15 }}>{r.desc}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
