import { METHANE_NEWS, PORTAL_STATS, PORTAL_UPDATED } from '@/lib/climate-content';
import s from './climate.module.css';

/** 첫 화면 — 왼쪽: 최신성·메시지·수치·영상 자리 / 오른쪽: 최근 소식·나르샤 공개 예정 (승인 목업 B) */
export default function PortalHero() {
  return (
    <section id="top" className={s.pHero} aria-labelledby="portal-title">
      <div className={`${s.pInner} ${s.pHeroGrid}`}>
        <div className={s.pHeroHead}>
          <p className={s.pMeta}>
            최종 업데이트 <time className={s.pNum}>{PORTAL_UPDATED}</time>
          </p>
          <h1 id="portal-title" className={s.pH1}>
            메탄은 가장 빨리 줄일 수 있는 온실가스입니다.
          </h1>
          <p className={s.pLead}>
            한국의 메탄 감축 목표와 정책, 위성 관측 사례, 세계 메탄 소식을 국문으로 정리합니다.
          </p>
        </div>

        <div className={s.pStats}>
          {PORTAL_STATS.map((st) => (
            <div key={st.label} className={s.pStat}>
              <span className={`${s.pStatValue} ${s.pNum}`}>{st.value}</span>
              <span className={s.pStatLabel}>{st.label}</span>
              <span className={s.pSource}>
                {st.basis} · 출처{' '}
                <a href={st.href} target="_blank" rel="noopener noreferrer">
                  {st.source} ↗
                </a>
              </span>
            </div>
          ))}
        </div>

        {/* 영상은 2027-01-01 공개. 그 전까지는 대표 이미지 + 공개일만 (재생 버튼 없음, 설계 결정 2A) */}
        <figure className={s.pVideo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/warden/narsha-render.png" alt="태양전지판을 펼친 NarSha 플랫폼 메탄 관측 위성 렌더 이미지" />
          <figcaption>
            <span className={s.pNum}>2027.01.01</span> 공개 예정 · 나르샤 관측 영상
            <span className={s.pVideoNote}>현재 이미지는 위성 렌더</span>
          </figcaption>
        </figure>

        <section id="news" className={s.pNews} aria-labelledby="news-title">
          <div className={s.pNewsHead}>
            <h2 id="news-title" className={s.pH3}>최근 메탄 소식</h2>
            <span className={s.pSource}>원문 링크 · 발행일 기준</span>
          </div>
          <ul className={s.pNewsList}>
            {METHANE_NEWS.map((n) => (
              <li key={n.href}>
                <p className={s.pNewsMeta}>
                  <time className={s.pNum}>{n.date}</time> · {n.outlet}
                </p>
                <a href={n.href} target="_blank" rel="noopener noreferrer" className={s.pNewsTitle}>
                  <span className={s.pTag}>{n.tag}</span>
                  {n.title} <span aria-hidden="true">↗</span>
                  <span className={s.srOnly}> (새 탭에서 원문 열기)</span>
                </a>
                <p className={s.pNewsSummary}>{n.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <aside className={s.pSlot} aria-label="나르샤 관측 데이터 공개 예정">
          <p className={s.pSlotLabel}>나르샤 관측 데이터</p>
          <p className={s.pSlotBody}>검보정을 마친 첫 관측 결과를 이곳에 공개합니다.</p>
          <p className={s.pSource}>검보정 진행 중 · 공개 일정은 이곳에 먼저 안내</p>
        </aside>
      </div>
    </section>
  );
}
