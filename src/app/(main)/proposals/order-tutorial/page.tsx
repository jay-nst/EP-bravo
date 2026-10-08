'use client';

import { useEffect } from 'react';
import './tutorial.css';
import OrderTutorialDemo from '@/components/proposals/OrderTutorialDemo';
import { trackEvent } from '@/lib/analytics';

// 기획 시연 페이지 — Agent 튜토리얼과 같이 설명 섹션 없이 데모에 바로 진입한다.
// 정본 설계: docs/ORDER_TUTORIAL_PROPOSAL_DESIGN.md
export default function OrderTutorialProposalPage() {
  useEffect(() => {
    trackEvent('page_view', 'order_tutorial_proposal', {});
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-24 py-40">
      <div className="hidden xl:block">
        <OrderTutorialDemo />
      </div>
      <div className="rounded-[6px] border border-border-tertiary bg-bg-secondary p-32 text-center text-body-sm-regular text-text-tertiary xl:hidden">
        이 데모는 데스크톱 전용입니다 (최소 1280px). 더 넓은 화면에서 열어 주세요.
      </div>
    </div>
  );
}
