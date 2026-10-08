'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Button, StatusChip } from '@naraspace-technology/nds/components';
import { IconSatellite } from '@naraspace-technology/nds/icons';
import { DAILY_QUIZZES } from '@/lib/sample-data';

// 색 기준 78e9433 — NDS 컴포넌트 색만 원래 값으로 덮는다
/** accent 10% 틴트 알약 (DAILY, N일 연속 정답) */
const ACCENT_PILL_CLS = 'bg-[rgba(27,191,168,0.1)] text-text-interactive-primary';
/** 민트 CTA (accent 배경 + 어두운 글자) */
const MINT_CTA =
  'bg-bg-interactive-primary text-[#0E0E10] [&_svg]:text-[#0E0E10] not-data-disabled:data-active:not-hover:text-[#0E0E10] not-data-disabled:data-active:not-hover:[&_svg]:text-[#0E0E10]';
/** 보조 링크: border 테두리 + muted 글자 (hover 색 변화 없음) */
const GHOST_LINK_CLS =
  'text-text-tertiary [&_svg]:text-text-tertiary inset-ring-border-tertiary not-data-disabled:not-aria-invalid:hover:bg-transparent not-data-disabled:not-aria-invalid:hover:inset-ring-border-tertiary';

function getTodayQuiz() {
  const today = new Date();
  const dayIndex = today.getDate() % DAILY_QUIZZES.length;
  return DAILY_QUIZZES[dayIndex];
}

function getStreak(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem('ep-quiz-streak') ?? '0', 10);
  } catch {
    return 0;
  }
}

function getTodayResult(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = `ep-quiz-${new Date().toISOString().slice(0, 10)}`;
    const val = localStorage.getItem(key);
    return val !== null ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}

function saveResult(chosen: number, correct: boolean) {
  try {
    const key = `ep-quiz-${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(key, String(chosen));

    const streak = getStreak();
    if (correct) {
      localStorage.setItem('ep-quiz-streak', String(streak + 1));
    } else {
      localStorage.setItem('ep-quiz-streak', '0');
    }
  } catch {
    // localStorage unavailable
  }
}

export default function QuizPage() {
  const quiz = useMemo(() => getTodayQuiz(), []);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const prev = getTodayResult();
    if (prev !== null) {
      setSelected(prev);
      setRevealed(true);
    }
    setStreak(getStreak());
  }, []);

  const handleSelect = (index: number) => {
    if (revealed) return;
    setSelected(index);
    setRevealed(true);
    const correct = index === quiz.answer;
    saveResult(index, correct);
    setStreak(correct ? getStreak() + 1 : 0);
  };

  const isCorrect = selected === quiz.answer;

  return (
    <div className="mx-auto w-full max-w-2xl px-16 py-32">
      {/* Header */}
      <div className="mb-32 flex items-center justify-between">
        <div>
          <div className="mb-4 flex items-center gap-8">
            <h1 className="text-heading-3xl text-text-primary md:text-display-md">
              오늘의 퀴즈
            </h1>
            <StatusChip status="brand" showIcon={false} className={ACCENT_PILL_CLS}>
              DAILY
            </StatusChip>
          </div>
          <p className="text-body-md-regular text-text-tertiary">
            위성 영상을 보고 장소를 맞혀보세요
          </p>
        </div>
        {/* Streak */}
        <div className="text-center">
          <div
            className={`flex size-48 items-center justify-center rounded-full text-heading-xl tabular-nums ${
              streak > 0
                ? 'text-text-interactive-primary inset-ring-2 inset-ring-border-interactive-primary'
                : 'text-text-tertiary inset-ring-2 inset-ring-border-tertiary'
            }`}
          >
            {streak}
          </div>
          <p className="mt-4 text-body-xs-regular text-text-tertiary">연속</p>
        </div>
      </div>

      {/* Image / Hint area — 자식 배경이 가장자리까지 차서 inset-ring 대신 border 로 테두리.
          그라데이션(style background)은 위성 영상 자리 일러스트 배경 (§7-2 일러스트 예외) */}
      <div className="mb-24 overflow-hidden rounded-lg border border-border-tertiary">
        <div
          className="relative flex aspect-[16/10] flex-col items-center justify-center overflow-hidden p-32 text-center"
          style={{ background: 'linear-gradient(135deg, #0a1a15 0%, #0d2818 30%, #0a1612 60%, #111a14 100%)' }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(27,191,168,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative z-10 mb-16 flex size-64 items-center justify-center rounded-full bg-[rgba(27,191,168,0.08)]">
            <IconSatellite className="size-24 text-text-interactive-primary" />
          </div>
          <p className="relative z-10 max-w-md text-body-md-regular text-text-tertiary">
            {quiz.imageHint}
          </p>
          <p className="relative z-10 mt-12 text-body-xs-regular text-text-tertiary opacity-50">
            실제 위성 영상이 여기에 표시됩니다
          </p>
        </div>
      </div>

      {/* Question */}
      <h2 className="mb-16 text-heading-2xl text-text-primary">
        {quiz.question}
      </h2>

      {/* Choices — 정답/오답 상태를 보여주는 선택지 타일.
          NDS 에 맞는 부품이 없어(Radio 는 선택 표시만, Card 는 선택·정오 상태 없음) 네이티브 button 유지.
          색은 78e9433 기준: 기본 = border 테두리, 정답 = accent, 오답 = error (틴트 8%), "정답" 표시 = StatusChip */}
      <div className="mb-32 space-y-10">
        {quiz.choices.map((choice, i) => {
          let surfaceClass = 'bg-transparent inset-ring-1 inset-ring-border-tertiary';
          let markClass = 'inset-ring-1 inset-ring-border-tertiary text-text-primary';
          let textClass = 'text-text-primary';

          if (revealed) {
            if (i === quiz.answer) {
              surfaceClass = 'bg-[rgba(27,191,168,0.08)] inset-ring-1 inset-ring-border-interactive-primary';
              markClass = 'inset-ring-1 inset-ring-border-interactive-primary text-text-interactive-primary';
              textClass = 'text-text-interactive-primary';
            } else if (i === selected && i !== quiz.answer) {
              surfaceClass = 'bg-[rgba(196,92,74,0.08)] inset-ring-1 inset-ring-status-danger';
              markClass = 'inset-ring-1 inset-ring-status-danger text-status-danger';
              textClass = 'text-status-danger';
            } else {
              surfaceClass = 'bg-transparent inset-ring-1 inset-ring-border-tertiary';
              markClass = 'inset-ring-1 inset-ring-border-tertiary text-text-tertiary';
              textClass = 'text-text-tertiary';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`flex w-full items-center gap-12 rounded-md px-20 py-16 text-left outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-border-focus-ring ${surfaceClass}`}
            >
              <span
                className={`flex size-28 shrink-0 items-center justify-center rounded-full text-body-sm-medium tabular-nums ${markClass}`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className={`text-body-md-regular ${textClass}`}>
                {choice}
              </span>
              {revealed && i === quiz.answer && (
                <StatusChip status="success" className="ml-auto bg-transparent text-text-interactive-primary [&>svg]:text-text-interactive-primary">
                  정답
                </StatusChip>
              )}
            </button>
          );
        })}
      </div>

      {/* Result */}
      {revealed && (
        <div
          className={`space-y-16 rounded-lg p-24 inset-ring-1 ${
            isCorrect
              ? 'bg-[rgba(27,191,168,0.04)] inset-ring-[rgba(27,191,168,0.3)]'
              : 'bg-[rgba(196,92,74,0.04)] inset-ring-[rgba(196,92,74,0.3)]'
          }`}
        >
          <div className="flex items-center gap-8">
            <span
              className={`text-heading-lg ${isCorrect ? 'text-text-interactive-primary' : 'text-status-danger'}`}
            >
              {isCorrect ? '정답입니다!' : '아쉽네요!'}
            </span>
            {isCorrect && streak > 1 && (
              <StatusChip status="brand" showIcon={false} className={ACCENT_PILL_CLS}>
                {streak}일 연속 정답
              </StatusChip>
            )}
          </div>
          <p className="text-body-md-regular text-text-tertiary">
            {quiz.explanation}
          </p>
          <div className="flex items-center gap-16 text-body-xs-regular tabular-nums text-text-tertiary">
            <span>{quiz.location}</span>
            <span aria-hidden className="text-border-tertiary">&middot;</span>
            <span>{quiz.coordinates}</span>
          </div>
          <div className="flex gap-12 pt-8">
            <Button render={<Link href="/map" />} nativeButton={false} className={MINT_CTA}>
              지도에서 보기
            </Button>
            <Button variant="outline" render={<Link href="/explore" />} nativeButton={false} className={GHOST_LINK_CLS}>
              탐색하기
            </Button>
          </div>
        </div>
      )}

      {/* Tomorrow teaser */}
      {revealed && (
        <div className="mt-32 border-t border-border-tertiary py-24 text-center">
          <p className="text-body-md-regular text-text-tertiary">
            내일 새로운 퀴즈가 공개됩니다
          </p>
          <p className="mt-4 text-body-xs-regular text-text-tertiary opacity-50">
            매일 자정 업데이트
          </p>
        </div>
      )}
    </div>
  );
}
