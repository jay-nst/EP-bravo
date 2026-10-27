import {
  DATA_REQUEST_EMAIL,
  DATA_REQUEST_MAILTO,
  METHANE_RESOURCES,
  PORTAL_OPERATORS,
  PORTAL_UPDATED,
} from '@/lib/climate-content';
import PortalSectionHead from './PortalSectionHead';
import s from './climate.module.css';

/** 데이터 요청 (소프트 CTA, 설계 결정 6) + 글로벌 리소스 + 운영 주체 */
export default function PortalFooterSections() {
  return (
    <>
      <section id="request" className={`${s.pSection} ${s.tileAlt}`} aria-labelledby="request-title">
        <div className={`${s.pInner} ${s.pRequest}`}>
          <PortalSectionHead
            id="request-title"
            meta="기관·기업 대상"
            title="데이터 요청"
            lead="관심 지역과 활용 목적을 알려주시면 이용할 수 있는 위성 데이터와 관측 일정을 안내해 드립니다."
          />
          <div className={s.pRequestAction}>
            <a href={DATA_REQUEST_MAILTO} className={s.pill}>메일로 요청하기</a>
            <span className={s.pBody}>{DATA_REQUEST_EMAIL}</span>
            <span className={s.pSource}>메일 본문에 기관명 · 담당 부서 · 관심 지역 · 활용 목적 항목이 미리 들어갑니다.</span>
          </div>
        </div>
      </section>

      <section id="links" className={s.pSection} aria-labelledby="links-title">
        <div className={s.pInner}>
          <PortalSectionHead id="links-title" meta="외부 사이트 · 새 탭에서 열림" title="글로벌 메탄 리소스" />
          <ul className={s.pResources}>
            {METHANE_RESOURCES.map((r) => (
              <li key={r.href}>
                <a href={r.href} target="_blank" rel="noopener noreferrer">
                  <span className={s.pResourceName}>
                    {r.name} <span aria-hidden="true">↗</span>
                  </span>
                  <span className={s.pSource}>{r.org}</span>
                  <span className={s.pBody}>{r.desc}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className={s.pFooter}>
        <div className={s.pInner}>
          <p className={s.pSource}>
            운영 {PORTAL_OPERATORS.join(' · ')} · 최종 업데이트 <span className={s.pNum}>{PORTAL_UPDATED}</span> · 해외 위성
            사례와 외부 기사는 각 출처의 저작물이며 나라스페이스 관측 데이터가 아닙니다.
          </p>
        </div>
      </div>
    </>
  );
}
