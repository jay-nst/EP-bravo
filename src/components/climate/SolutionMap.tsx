import { SOLUTIONS } from '@/lib/climate-content';
import s from './climate.module.css';
import { revealDelay } from './useScrollReveal';

export default function SolutionMap() {
  return (
    <section id="solutions" className={s.tile}>
      <div className={s.inner}>
        <div className={s.center} style={{ marginBottom: 56 }} data-reveal="">
          <h2 className={s.h2}>관측부터 의사결정까지.</h2>
          <p className={`${s.lead} ${s.narrow}`}>
            이 위성들이 하는 일을 아래 순서대로 하나씩 소개합니다.
          </p>
        </div>
        <div className={s.grid2}>
          {SOLUTIONS.map((sol, i) => (
            <div key={sol.id} className={`${s.card} ${i === SOLUTIONS.length - 1 ? s.cardWide : ''}`} data-reveal="" style={revealDelay((i % 2) * 120)}>
              <h3 className={s.h3}>{sol.title}</h3>
              <p className={s.body}>{sol.desc}</p>
              <div className={s.cardFoot}>
                <a href={sol.link.href} className={s.link}>{sol.link.label}</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
