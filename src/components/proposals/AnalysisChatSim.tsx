'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CAPTURE_WIDTH,
  CAPTURE_HEIGHT,
  CHAT_COLORS,
  MASCOT_SRC,
  type TutorialChatSim,
} from '@/lib/agent-tutorial-steps';

interface AnalysisChatSimProps {
  sim: TutorialChatSim;
  onDone: () => void;
}

const TYPE_MS = 26; // 글자당 타이핑 간격
const USER_DELAY = 350; // 유저 버블 등장
const MSG_GAP = 550; // 메시지 사이 숨 고르기
const PENDING_MS = 1800; // "분석 중" 대기 표시 시간
const DONE_HOLD_MS = 900; // 완료 메시지를 읽을 시간 (결과 카드 없을 때의 전환 대기)
const CARDS_ENTER_MS = 450; // 결과 카드 등장 애니메이션을 기다리는 시간
const SCROLL_MS = 600; // 채팅 스크롤업 (실채팅 autoscroll 재현)
const CARDS_HOLD_MS = 800; // 스크롤 후 카드가 제자리에 안착한 걸 보여주는 시간

/** 채팅 컬럼의 스테이지 % 좌표 — 캡쳐(loading-1.png) 실측값 */
const COLUMN = { x: 16.25, y: 5.6, w: 25, h: 80.8 } as const;

type SimState = {
  /** 완료된 에이전트 메시지 수 */
  done: number;
  /** 현재 타이핑 중인 메시지의 표시 글자 수 (-1 = 아직 시작 전) */
  typed: number;
  showUser: boolean;
  pending: boolean;
  /** 완료 메시지(doneMessage)의 표시 글자 수 (-1 = 아직 시작 전) */
  doneTyped: number;
};

// 실서비스의 응답 생성 연출 재현 — 유저 버블, 마스코트 좌우 흔들림, 타이핑 스트리밍,
// "분석 중" 말풍선. 채팅 컬럼 영역 위에 겹쳐 렌더되며 색·문구는 실캡쳐 실측값이다.
export default function AnalysisChatSim({ sim, onDone }: AnalysisChatSimProps) {
  const [state, setState] = useState<SimState>({
    done: 0,
    typed: -1,
    showUser: false,
    pending: false,
    doneTyped: -1,
  });
  // 결과 카드 — 채팅 아래 새 메시지처럼 등장한 뒤, 실채팅 autoscroll 처럼
  // 위로 스크롤해 다음 스텝 캡쳐 속 카드 위치에 정확히 안착시킨다
  const [showCards, setShowCards] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
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
          setState({ done: m, typed: c, showUser: true, pending: false, doneTyped: -1 });
          await wait(TYPE_MS);
        }
        setState({ done: m + 1, typed: -1, showUser: true, pending: false, doneTyped: -1 });
        await wait(MSG_GAP);
      }

      if (cancelled) return;
      const allDone = sim.agentMessages.length;
      setState({ done: allDone, typed: -1, showUser: true, pending: true, doneTyped: -1 });
      await wait(PENDING_MS);

      // 완료 메시지 — 결과 화면이 갑자기 뜨지 않도록 채팅 흐름 안에서 전환을 예고
      if (sim.doneMessage) {
        for (let c = 1; c <= sim.doneMessage.length; c++) {
          if (cancelled) return;
          setState({ done: allDone, typed: -1, showUser: true, pending: false, doneTyped: c });
          await wait(TYPE_MS);
        }
      }

      // 결과 카드 — 완료 메시지 아래 새 메시지처럼 등장 → 스크롤업 → 전체 캡쳐 전환.
      // 스크롤 목표: 카드 상단이 다음 스텝 캡쳐 속 카드 위치(rect.y)와 일치하는 지점.
      if (sim.resultCards) {
        if (cancelled) return;
        setShowCards(true);
        await wait(CARDS_ENTER_MS);
        if (cancelled) return;
        const container = containerRef.current;
        const cards = cardsRef.current;
        if (container && cards) {
          const cRect = container.getBoundingClientRect();
          const kRect = cards.getBoundingClientRect();
          const targetTop =
            cRect.top + ((sim.resultCards.rect.y - COLUMN.y) / COLUMN.h) * cRect.height;
          setScrollY(Math.max(0, kRect.top - targetTop));
        }
        await wait(SCROLL_MS + CARDS_HOLD_MS);
      } else if (sim.doneMessage) {
        await wait(DONE_HOLD_MS);
      }
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
      ref={containerRef}
      className="absolute overflow-hidden"
      style={{
        left: `${COLUMN.x}%`,
        top: `${COLUMN.y}%`,
        width: `${COLUMN.w}%`,
        height: `${COLUMN.h}%`,
        background: CHAT_COLORS.bg,
        // 실서비스 타이포 실측값: pretendard, body 14px / line-height 1.7 / -0.2px
        // (agent.ep.naraspace.com CSS 확인, 2026-09-28). 14px 은 1600px 스테이지 기준
        // 이므로 cqw 로 스테이지 폭에 비례 스케일한다: 14/1600 = 0.875cqw.
        fontFamily: 'var(--font-body)',
        fontSize: '0.875cqw',
        lineHeight: 1.7,
        letterSpacing: '-0.2px',
      }}
      role="log"
      aria-live="polite"
      aria-label="분석 진행 중"
    >
    {/* 스크롤 래퍼 — 결과 카드 안착 시 실채팅 autoscroll 처럼 위로 밀어 올린다 */}
    <div
      className="flex flex-col ep-chat-scroll"
      style={{
        gap: '1.4em',
        padding: '2.4em 1.8em 0 2.1em',
        transform: `translateY(${-scrollY}px)`,
      }}
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

      {/* 완료 메시지 — "분석 중" 뒤에 타이핑되어 결과 화면 전환을 예고 */}
      {state.doneTyped >= 0 && sim.doneMessage && (
        <AgentRow
          text={sim.doneMessage.slice(0, state.doneTyped)}
          wiggle={state.doneTyped < sim.doneMessage.length}
          caret={state.doneTyped < sim.doneMessage.length}
        />
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

      {/* 결과 카드 — 다음 스텝 캡쳐의 카드 영역 크롭을 새 메시지처럼 아래에 붙인다.
          폭·좌표는 cqw(스테이지 % 단위)로 캡쳐와 동일 배율 — 전환 시 제자리 안착 */}
      {showCards && sim.resultCards && (
        <div
          ref={cardsRef}
          className="ep-chat-cards-enter relative overflow-hidden flex-shrink-0"
          style={{
            width: `${sim.resultCards.rect.w}cqw`,
            marginLeft: `calc(${sim.resultCards.rect.x - COLUMN.x}cqw - 2.1em)`,
            aspectRatio: `${sim.resultCards.rect.w * CAPTURE_WIDTH} / ${sim.resultCards.rect.h * CAPTURE_HEIGHT}`,
            borderRadius: '0.6em',
          }}
          aria-label="분석 결과 카드"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 캡쳐 크롭 표시용 */}
          <img
            src={sim.resultCards.capture}
            alt=""
            draggable={false}
            className="absolute max-w-none"
            style={{
              width: `${10000 / sim.resultCards.rect.w}%`,
              height: `${10000 / sim.resultCards.rect.h}%`,
              left: `${-(sim.resultCards.rect.x / sim.resultCards.rect.w) * 100}%`,
              top: `${-(sim.resultCards.rect.y / sim.resultCards.rect.h) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
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
