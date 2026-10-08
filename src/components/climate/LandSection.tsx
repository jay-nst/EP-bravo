import { LAND_FACTS, LAND_USES } from '@/lib/climate-content';
import s from './climate.module.css';
import { revealDelay } from './useScrollReveal';

/** 토지 변화 — 경기샛-1(광학 1.5 m)·Observer-1A 활용 */
export default function LandSection() {
  return (
    <section id="land" className={s.tile}>
      <div className={s.inner}>
        <div className={s.center} data-reveal="">
          <span className={s.eyebrow}>경기샛-1 · Observer-1A</span>
          <h2 className={s.h2}>변하는 경기도를<br />1.5 m로 지켜봅니다.</h2>
          <p className={`${s.lead} ${s.narrow}`}>
            광학 위성은 같은 곳을 반복해서 찍어 땅이 어떻게 바뀌는지 기록합니다.
            경기샛-1 영상은 2026년 3월부터 경기도에 제공되고 있습니다.
          </p>
        </div>

        <div className={s.specs}>
          {LAND_FACTS.map((f, i) => (
            <div key={f.label} className={s.spec} data-reveal="" style={revealDelay(i * 120)}>
              <span className={s.specValue}>
                {f.value}
                <span className={s.specUnit}>{f.unit}</span>
              </span>
              <span className={s.specLabel}>{f.label}</span>
            </div>
          ))}
        </div>

        <div className={s.grid2} style={{ marginTop: 72 }}>
          {LAND_USES.map((u, i) => (
            <div key={u.title} className={s.card} data-reveal="" style={revealDelay((i % 2) * 120)}>
              <h3 className={s.h3}>{u.title}</h3>
              <p className={s.body}>{u.desc}</p>
            </div>
          ))}
        </div>

        <ul className={s.notes} data-reveal="">
          <li>경기샛-1 첫 공개 영상 6장: 경기 화성·김포(반복 촬영), 경주, 미국 올랜도·투싼, 두바이 부르즈 칼리파</li>
          <li>Observer-1A 영상도 경기도에 함께 제공 · 포천 산사태 피해·복구 현황 파악에 활용</li>
        </ul>
      </div>
    </section>
  );
}
