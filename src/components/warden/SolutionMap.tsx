import { SOLUTIONS } from '@/lib/climate-intel';
import s from './warden.module.css';
import { revealDelay } from './useScrollReveal';

export default function SolutionMap() {
  return (
    <section id="solutions" className={`${s.tile} ${s.tileAlt}`}>
      <div className={s.inner}>
        <div className={s.center} style={{ marginBottom: 56 }} data-reveal="">
          <h2 className={s.h2}>관측에서 결정까지.</h2>
          <p className={`${s.lead} ${s.narrow}`}>
            위성을 만들고, 띄우고, 데이터를 읽는 일까지 직접 합니다. 아래 순서대로 하나씩 소개합니다.
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
