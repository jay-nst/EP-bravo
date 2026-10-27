import { FIRST_LIGHT, METHANE_EXAMPLES } from '@/lib/climate-content';
import PortalSectionHead from './PortalSectionHead';
import s from './climate.module.css';

/** 위성 관측 — 해외 공개 사례(NASA) + 자체 항공시험. 출처를 캡션마다 표기 */
export default function ObservationSection() {
  return (
    <section id="observe" className={s.pSection} aria-labelledby="observe-title">
      <div className={s.pInner}>
        <PortalSectionHead
          id="observe-title"
          meta="출처 · NASA/JPL-Caltech EMIT, 나라스페이스 항공시험 (2025.09)"
          title="위성으로 본 메탄"
          lead="메탄은 눈에 보이지 않지만 흡수 파장을 분석하면 지도 위에 드러납니다. 해외 위성의 공개 사례와 나라스페이스 항공시험 결과입니다."
        />

        <div className={s.pFigures}>
          {METHANE_EXAMPLES.map((ex) => (
            <figure key={ex.src} className={s.pFigure} data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ex.src} alt={ex.alt} loading="lazy" />
              <figcaption>
                <span className={s.pNewsMeta}>
                  <span className={s.pNum}>{ex.date}</span> · {ex.tag}
                </span>
                <span className={s.pBody}>{ex.caption}</span>
                <span className={s.pSource}>출처 · {ex.credit} · 나라스페이스 관측 데이터 아님</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className={s.pSub}>
          <h3 className={s.pH3}>{FIRST_LIGHT.title}</h3>
          <p className={s.pBody} style={{ maxWidth: 720, marginBottom: 32 }}>{FIRST_LIGHT.intro}</p>
          <div className={s.firstLight}>
            {FIRST_LIGHT.frames.map((f) => (
              <figure
                key={f.src}
                className={`${s.pFigure} ${'wide' in f && f.wide ? s.firstLightWide : ''}`}
                data-reveal=""
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt={f.alt} loading="lazy" />
                <figcaption>
                  <span className={s.pNewsMeta}>
                    <span className={s.pNum}>{f.date}</span> · {f.tag}
                  </span>
                  <span className={s.pBody}>{f.caption}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className={s.pSource} style={{ marginTop: 16 }}>출처 · {FIRST_LIGHT.credit}</p>
        </div>
      </div>
    </section>
  );
}
