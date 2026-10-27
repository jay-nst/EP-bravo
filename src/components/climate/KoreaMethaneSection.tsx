import { KOREA_MRV_PROPOSAL, KOREA_SECTOR_TARGETS } from '@/lib/climate-content';
import PortalSectionHead from './PortalSectionHead';
import s from './climate.module.css';

/** 한국의 메탄 — 주 독자(정부 실무자)용 핵심 섹션. 공개 출처 수치만 */
export default function KoreaMethaneSection() {
  return (
    <section id="korea" className={`${s.pSection} ${s.tileAlt}`} aria-labelledby="korea-title">
      <div className={s.pInner}>
        <PortalSectionHead
          id="korea-title"
          meta="출처 · 2030 메탄 감축 로드맵 (2023년 말 발표)"
          title="한국의 메탄 감축 목표"
          lead="정부는 2030년까지 국내 메탄 배출을 2020년 대비 30% 줄이기로 했습니다. 감축 폭이 가장 큰 부문은 폐기물입니다."
        />

        <div className={s.pSplit}>
          <div data-reveal="">
            <h3 className={s.pH3}>부문별 2030 감축 목표</h3>
            <ul className={s.pBars}>
              {KOREA_SECTOR_TARGETS.map((t) => (
                <li key={t.sector}>
                  <span className={s.pBarLabel}>{t.sector}</span>
                  <span className={s.pBarTrack} aria-hidden="true">
                    <span className={s.pBarFill} style={{ width: `${t.value}%` }} />
                  </span>
                  <span className={`${s.pBarValue} ${s.pNum}`}>{t.value}%</span>
                </li>
              ))}
            </ul>
            <p className={s.pSource}>
              2020년 대비 · 출처{' '}
              <a href="https://forourclimate.org/ko/research/535" target="_blank" rel="noopener noreferrer">
                기후솔루션 로드맵 분석 ↗
              </a>
            </p>

            <div className={s.pFact}>
              <span className={`${s.pStatValue} ${s.pNum}`}>71%</span>
              <span className={s.pStatLabel}>국내 에너지 부문 메탄 가운데 탈루(의도치 않은 누출) 비중</span>
              <span className={s.pSource}>
                출처{' '}
                <a href="https://forourclimate.org/ko/research/357" target="_blank" rel="noopener noreferrer">
                  기후솔루션 (2023) ↗
                </a>
              </span>
            </div>
          </div>

          <div data-reveal="">
            <h3 className={s.pH3}>추정에서 실측으로</h3>
            <p className={s.pBody}>
              국내 메탄 배출량은 대부분 활동량과 배출계수로 계산한 산정치로 집계됩니다. 실제 배출을 재서 검증하는
              체계를 2027년부터 단계적으로 만들자는 제안이 나와 있습니다.
            </p>
            <ol className={s.pSteps}>
              {KOREA_MRV_PROPOSAL.map((step) => (
                <li key={step.key}>
                  <span className={`${s.pStepKey} ${s.pNum}`}>{step.key}</span>
                  <span className={s.pStepTitle}>{step.title}</span>
                  <span className={s.pBody}>{step.detail}</span>
                </li>
              ))}
            </ol>
            <p className={s.pSource}>
              민간 정책 제안 · 기후변화재단·한양대 연구팀 (2026.09) · 출처{' '}
              <a href="https://www.gukjenews.com/news/articleView.html?idxno=3691786" target="_blank" rel="noopener noreferrer">
                국제뉴스 ↗
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
