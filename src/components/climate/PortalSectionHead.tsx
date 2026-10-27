import type { ReactNode } from 'react';
import s from './climate.module.css';

interface PortalSectionHeadProps {
  /** h2 id — section 의 aria-labelledby 대상 */
  id: string;
  /** 출처·기준일 한 줄 */
  meta: string;
  title: string;
  lead?: ReactNode;
}

/** 메탄 포털 섹션 공통 머리: 메타줄 → 왼쪽 정렬 h2 → 리드 (설계 결정 4A) */
export default function PortalSectionHead({ id, meta, title, lead }: PortalSectionHeadProps) {
  return (
    <header className={s.pHead}>
      <p className={s.pMeta}>{meta}</p>
      <h2 id={id} className={s.pH2}>{title}</h2>
      {lead ? <p className={s.pLead}>{lead}</p> : null}
    </header>
  );
}
