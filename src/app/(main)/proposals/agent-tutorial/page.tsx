'use client';

import { useEffect } from 'react';
import './tutorial.css';
import AgentTutorialDemo from '@/components/proposals/AgentTutorialDemo';
import {
  CLARITY_METRICS,
  SUCCESS_METRICS,
  BENCHMARK_COMPLETION,
  type ClarityMetric,
} from '@/lib/agent-tutorial-steps';
import { trackEvent } from '@/lib/analytics';

// 기획 시연 페이지 — 실제 제품 내 튜토리얼이 아니라, 그 제안을 통과시키기 위한
// 클릭형 인터랙티브 데모다. 정본 설계: docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md
export default function AgentTutorialProposalPage() {
  useEffect(() => {
    trackEvent('page_view', 'agent_tutorial_proposal', {});
  }, []);

  const exposedMetrics = CLARITY_METRICS.filter((m) => m.exposed);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
      {/* ① 도입부 — 왜 이게 필요한가 */}
      <section>
        <p
          className="text-xs font-mono tracking-wider uppercase mb-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Proposal — Agent Onboarding
        </p>
        <h1
          className="text-3xl font-semibold leading-tight mb-4"
          style={{ color: 'var(--text)' }}
        >
          Agent 게임형 튜토리얼 온보딩
        </h1>
        <p
          className="text-base leading-relaxed max-w-2xl mb-8"
          style={{ color: 'var(--text-muted)' }}
        >
          agent.ep.naraspace.com 신규 사용자가 &ldquo;어떻게 써야 할지 모르겠다&rdquo;며
          이탈합니다. 타겟 하이라이트 + 단계별 말풍선의 게임 튜토리얼식 온보딩으로 첫
          경험을 안내하고, 마지막 스텝에서 가입 전환까지 하나의 퍼널로 연결하는
          제안입니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {exposedMetrics.map((m) => (
            <ClarityCard key={m.id} metric={m} />
          ))}
        </div>
        <p className="mt-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          출처: Microsoft Clarity, 최근 30일 · 실측값 확보 후 갱신 예정
        </p>
      </section>

      {/* ② 클릭형 튜토리얼 데모 (본체) */}
      <section id="demo">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
          직접 클릭해 보세요
        </h2>
        <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
          실제 Agent 화면 위에서 튜토리얼이 어떻게 동작하는지 그대로 체험하는
          데모입니다. 비로그인 체험으로 시작해 가입 전환 모달로 끝납니다. 언제든 건너뛸
          수 있습니다 — 건너뛰어도 가입 모달은 거치게 됩니다.
        </p>

        <div className="hidden xl:block">
          <AgentTutorialDemo />
        </div>
        <div
          className="xl:hidden p-8 text-center text-sm rounded-md"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          이 데모는 데스크톱 전용입니다 (최소 1280px). 더 넓은 화면에서 열어 주세요.
        </div>
      </section>

      {/* ③ 아웃트로 — 기대효과와 측정 지표 */}
      <section>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
          기대효과와 측정 지표
        </h2>
        <p className="text-sm leading-relaxed mb-6 max-w-2xl" style={{ color: 'var(--text-muted)' }}>
          승인 시 아래 지표로 효과를 측정합니다. 도입부의 Clarity 수치가 그대로
          베이스라인이 됩니다.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {SUCCESS_METRICS.map((m) => (
            <div
              key={m.label}
              className="p-5 rounded-md"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
                {m.label}
              </p>
              <p className="text-lg font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                {m.target}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {m.note}
              </p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl">
          <h3
            className="text-xs font-mono tracking-wider uppercase mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            왜 5스텝 이하인가 — 투어 완주율 벤치마크 (2026)
          </h3>
          <div className="space-y-2">
            {BENCHMARK_COMPLETION.map((b) => (
              <div key={b.steps} className="flex items-center gap-3">
                <span
                  className="w-16 text-xs font-mono flex-shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {b.steps}
                </span>
                <div
                  className="flex-1 h-4 rounded-sm overflow-hidden"
                  style={{ background: 'var(--surface)' }}
                >
                  <div
                    className="h-full rounded-sm"
                    style={{ width: `${b.rate}%`, background: 'var(--accent)', opacity: 0.75 }}
                  />
                </div>
                <span
                  className="w-10 text-xs font-mono text-right flex-shrink-0"
                  style={{ color: 'var(--text)' }}
                >
                  {b.rate}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            스텝 수가 완주율을 지배합니다. 이 제안은 5스텝(가입 모달 포함)으로 cold-start
            해소와 핵심 기능 발견에만 집중합니다.
          </p>
        </div>

        <div
          className="mt-10 p-5 rounded-md max-w-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h3
            className="text-xs font-mono tracking-wider uppercase mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            실구현 핸드오프
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            이 데모의 스텝 스펙(<span className="font-mono text-xs">src/lib/agent-tutorial-steps.ts</span>)이
            곧 실구현 설정의 원형입니다. 오버레이는 driver.js(MIT, ~5KB)를 데모에서 실제
            사용 중이므로, 승인 시 타겟만 실서비스 DOM으로 치환하면 됩니다. AGPL
            라이브러리(Intro.js, Shepherd.js)는 상용 서비스 부적합으로 배제했습니다.
          </p>
        </div>
      </section>
    </div>
  );
}

function ClarityCard({ metric }: { metric: ClarityMetric }) {
  const pending = metric.value === null;
  return (
    <div
      className="p-5 rounded-md"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
        {metric.label}
      </p>
      <p className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
        {pending ? '—' : `${metric.value}${metric.unit}`}
      </p>
      {pending && (
        <span
          className="inline-block mt-2 px-2 py-0.5 rounded-sm text-xs font-mono"
          style={{
            background: 'var(--surface-elevated)',
            color: 'var(--warning)',
            border: '1px solid var(--border)',
          }}
        >
          수치 입력 대기
        </span>
      )}
    </div>
  );
}
