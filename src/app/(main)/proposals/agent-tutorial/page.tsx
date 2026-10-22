'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@naraspace-technology/nds/components';
import './tutorial.css';
import AgentTutorialDemo from '@/components/proposals/AgentTutorialDemo';
import { trackEvent } from '@/lib/analytics';
import {
  TUTORIAL_UI_COPY,
  parseTutorialLocale,
  type TutorialLocale,
} from '@/lib/agent-tutorial-i18n';

// 기획 시연 페이지 — 설명 섹션 없이 데모에 바로 진입한다.
// 정본 설계: docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md
export default function AgentTutorialProposalPage() {
  // 한/영 토글 (2026-10-22) — ?lang=en 링크로 영어판을 바로 공유할 수 있다
  const [locale, setLocale] = useState<TutorialLocale>('ko');

  useEffect(() => {
    trackEvent('page_view', 'agent_tutorial_proposal', {});
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL 쿼리는 hydration 후에만 읽는다
    setLocale(parseTutorialLocale(new URLSearchParams(window.location.search).get('lang')));
  }, []);

  const changeLocale = useCallback((next: TutorialLocale) => {
    setLocale(next);
    const url = new URL(window.location.href);
    if (next === 'ko') url.searchParams.delete('lang');
    else url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-24 py-40">
      <div className="hidden xl:block">
        <AgentTutorialDemo locale={locale} onLocaleChange={changeLocale} />
      </div>
      {/* 모바일 안내 — NDS Card 표면 (Root/Body/Content), 색은 운영 값(§8): surface 배경 + muted 글자 */}
      <Card.Root className="xl:hidden bg-bg-secondary">
        <Card.Body className="w-full text-center">
          <Card.Content className="text-text-tertiary">
            {TUTORIAL_UI_COPY[locale].mobileNotice}
          </Card.Content>
        </Card.Body>
      </Card.Root>
    </div>
  );
}
