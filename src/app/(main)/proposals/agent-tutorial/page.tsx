'use client';

import { useEffect } from 'react';
import { Card } from '@naraspace-technology/nds/components';
import './tutorial.css';
import AgentTutorialDemo from '@/components/proposals/AgentTutorialDemo';
import { trackEvent } from '@/lib/analytics';

// 기획 시연 페이지 — 설명 섹션 없이 데모에 바로 진입한다.
// 정본 설계: docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md
export default function AgentTutorialProposalPage() {
  useEffect(() => {
    trackEvent('page_view', 'agent_tutorial_proposal', {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-24 py-40">
      <div className="hidden xl:block">
        <AgentTutorialDemo />
      </div>
      {/* 모바일 안내 — NDS Card 표면 (Root/Body/Content) */}
      <Card.Root className="xl:hidden">
        <Card.Body className="w-full text-center">
          <Card.Content>
            이 데모는 데스크톱 전용입니다 (최소 1280px). 더 넓은 화면에서 열어 주세요.
          </Card.Content>
        </Card.Body>
      </Card.Root>
    </div>
  );
}
