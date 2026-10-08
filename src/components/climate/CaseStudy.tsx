import { CASE_FRAMES } from '@/lib/climate-content';
import s from './climate.module.css';
import { revealDelay } from './useScrollReveal';

/** 실제 사례 — 영상마다 날짜·구분·긴 캡션 (Muon Space FireSat 발표 페이지 구성) */
export default function CaseStudy() {
  const [before, after, severity] = CASE_FRAMES;

  return (
    <div className={s.caseStudy}>
      <div className={s.caseHead} data-reveal="">
        <span className={s.cardMeta}>실제 사례 · 2026</span>
        <h3 className={s.h3}>Santa Rosa Island 산불, 채널 제도 역대 최대 피해</h3>
      </div>

      <div className={s.grid2}>
        {[before, after].map((f, i) => (
          <figure key={f.src} className={s.caseFrame} data-reveal="" style={revealDelay(i * 120)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.src} alt={f.alt} loading="lazy" />
            <figcaption>
              <span className={s.caseTag}>
                <strong>{f.date}</strong> · {f.tag}
              </span>
              <span>{f.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <figure className={`${s.caseFrame} ${s.caseWide}`} data-reveal="zoom">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={severity.src} alt={severity.alt} loading="lazy" />
        <figcaption>
          <span className={s.caseTag}>
            <strong>{severity.date}</strong> · {severity.tag}
          </span>
          <span>{severity.caption}</span>
        </figcaption>
      </figure>
    </div>
  );
}
