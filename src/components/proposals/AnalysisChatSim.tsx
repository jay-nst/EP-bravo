'use client';

import { useEffect, useRef, useState } from 'react';
import { CHAT_COLORS, MASCOT_SRC, type TutorialChatSim } from '@/lib/agent-tutorial-steps';

interface AnalysisChatSimProps {
  sim: TutorialChatSim;
  onDone: () => void;
}

const TYPE_MS = 26; // 글자당 타이핑 간격
const USER_DELAY = 350; // 유저 버블 등장
const MSG_GAP = 550; // 메시지 사이 숨 고르기
const PENDING_MS = 1800; // "분석 중" 대기 표시 시간

type SimState = {
  /** 완료된 에이전트 메시지 수 */
  done: number;
  /** 현재 타이핑 중인 메시지의 표시 글자 수 (-1 = 아직 시작 전) */
  typed: number;
  showUser: boolean;
  pending: boolean;
};

// 실서비스의 응답 생성 연출 재현 — 유저 버블, 마스코트 좌우 흔들림, 타이핑 스트리밍,
// "분석 중" 말풍선. 채팅 컬럼 영역 위에 겹쳐 렌더되며 색·문구는 실캡쳐 실측값이다.
export default function AnalysisChatSim({ sim, onDone }: AnalysisChatSimProps) {
  const [state, setState] = useState<SimState>({
    done: 0,
    typed: -1,
    showUser: false,
    pending: false,
  });
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    void (async () => {
      await wait(USER_DELAY);
      if (cancelled) return;
      setState((s) => ({ ...s, showUser: true }));
      await wait(MSG_GAP);

      for (let m = 0; m < sim.agentMessages.length; m++) {
        const msg = sim.agentMessages[m];
        for (let c = 1; c <= msg.length; c++) {
          if (cancelled) return;
          setState({ done: m, typed: c, showUser: true, pending: false });
          await wait(TYPE_MS);
        }
        setState({ done: m + 1, typed: -1, showUser: true, pending: false });
        await wait(MSG_GAP);
      }

      if (cancelled) return;
      setState({ done: sim.agentMessages.length, typed: -1, showUser: true, pending: true });
      await wait(PENDING_MS);
      if (!cancelled) onDoneRef.current();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [sim]);

  const typingMsg = state.typed >= 0 ? sim.agentMessages[state.done] : null;

  return (
    <div
      className="absolute overflow-hidden flex flex-col"
      style={{
        left: '16.25%',
        top: '5.6%',
        width: '25%',
        height: '80.8%',
        background: CHAT_COLORS.bg,
        // 실서비스 타이포 실측값: pretendard, body 14px / line-height 1.7 / -0.2px
        // (agent.ep.naraspace.com CSS 확인, 2026-09-28). 14px 은 1600px 스테이지 기준
        // 이므로 cqw 로 스테이지 폭에 비례 스케일한다: 14/1600 = 0.875cqw.
        fontFamily: 'var(--font-body)',
        fontSize: '0.875cqw',
        lineHeight: 1.7,
        letterSpacing: '-0.2px',
        gap: '1.4em',
        padding: '2.4em 1.8em 0 2.1em',
      }}
      role="log"
      aria-live="polite"
      aria-label="분석 진행 중"
    >
      {/* 유저 버블 (우측 정렬, 크림색 — 실측) */}
      {state.showUser && (
        <div className="flex justify-end">
          <div
            className="max-w-[85%]"
            style={{
              background: CHAT_COLORS.userBubble,
              color: CHAT_COLORS.userText,
              padding: '0.6em 1em',
              borderRadius: '0.8em',
            }}
          >
            {sim.userMessage}
          </div>
        </div>
      )}

      {/* 완료된 에이전트 메시지 */}
      {sim.agentMessages.slice(0, state.done).map((msg) => (
        <AgentRow key={msg} text={msg} wiggle={false} />
      ))}

      {/* 타이핑 중인 메시지 — 마스코트 좌우 흔들림 + 커서 */}
      {typingMsg !== null && (
        <AgentRow text={typingMsg.slice(0, state.typed)} wiggle caret />
      )}

      {/* 대기 상태 — 마스코트 흔들림 + "분석 중" 말풍선 */}
      {state.pending && (
        <div className="flex items-center" style={{ gap: '0.7em' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 캡쳐 크롭 에셋 */}
          <img
            src={MASCOT_SRC}
            alt=""
            className="ep-mascot-wiggle flex-shrink-0"
            style={{ width: '2.2em' }}
            draggable={false}
          />
          <div
            style={{
              background: 'rgba(231,235,239,0.08)',
              color: CHAT_COLORS.agentText,
              padding: '0.45em 1em',
              borderRadius: '0.8em',
            }}
          >
            {sim.pendingLabel}
            <span className="ep-typing-dots" aria-hidden />
          </div>
        </div>
      )}
    </div>
  );
}

function AgentRow({ text, wiggle, caret }: { text: string; wiggle: boolean; caret?: boolean }) {
  return (
    <div className="flex items-start" style={{ gap: '0.7em' }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 캡쳐 크롭 에셋 */}
      <img
        src={MASCOT_SRC}
        alt=""
        className={`flex-shrink-0 ${wiggle ? 'ep-mascot-wiggle' : ''}`}
        style={{ width: '2.2em', marginTop: '0.1em' }}
        draggable={false}
      />
      <p className="whitespace-pre-wrap" style={{ color: CHAT_COLORS.agentText }}>
        {text}
        {caret && <span className="ep-typing-caret" aria-hidden />}
      </p>
    </div>
  );
}
