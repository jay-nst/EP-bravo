'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Button, StatusChip } from '@naraspace-technology/nds/components';
import { IconSatellite } from '@naraspace-technology/nds/icons';
import { DAILY_QUIZZES } from '@/lib/sample-data';

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
            <StatusChip status="brand" showIcon={false}>
              DAILY
            </StatusChip>
          </div>
          <p className="text-body-md-regular text-text-secondary">
            위성 영상을 보고 장소를 맞혀보세요
          </p>
        </div>
        {/* Streak */}
        <div className="text-center">
          <div
            className={`flex size-48 items-center justify-center rounded-full text-heading-xl tabular-nums ${
              streak > 0
                ? 'bg-bg-interactive-selected text-text-interactive-selected'
                : 'bg-bg-secondary text-text-tertiary'
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
          <div className="mb-16 flex size-64 items-center justify-center rounded-full bg-bg-interactive-selected">
            <IconSatellite className="size-24 text-icon-interactive-selected" />
          </div>
          <p className="max-w-md text-body-md-regular text-text-secondary">
            {quiz.imageHint}
          </p>
          <p className="mt-12 text-body-xs-regular text-text-tertiary">
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
          색은 NDS 토큰만: 기본 = Card 표면, 정답 = status-success, 오답 = status-danger, "정답" 표시 = StatusChip */}
      <div className="mb-32 space-y-10">
        {quiz.choices.map((choice, i) => {
          let surfaceClass =
            'bg-bg-tertiary inset-ring-1 inset-ring-border-tertiary enabled:hover:bg-bg-secondary enabled:hover:inset-ring-2 enabled:hover:inset-ring-border-interactive-primary-hover';
          let markClass = 'inset-ring-1 inset-ring-border-primary text-text-secondary';
          let textClass = 'text-text-primary';

          if (revealed) {
            if (i === quiz.answer) {
              surfaceClass = 'bg-status-success-subtle';
              markClass = 'inset-ring-1 inset-ring-status-success text-status-success-bold';
              textClass = 'text-status-success-bold';
            } else if (i === selected && i !== quiz.answer) {
              surfaceClass = 'bg-status-danger-subtle';
              markClass = 'inset-ring-1 inset-ring-status-danger text-status-danger-bold';
              textClass = 'text-status-danger-bold';
            } else {
              surfaceClass = 'bg-bg-tertiary inset-ring-1 inset-ring-border-tertiary';
              markClass = 'inset-ring-1 inset-ring-border-tertiary text-text-disabled';
              textClass = 'text-text-disabled';
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
                <StatusChip status="success" className="ml-auto">
                  정답
                </StatusChip>
              )}
            </button>
          );
        })}
      </div>

      {/* Result */}
      {revealed && (
        <div className="space-y-16 rounded-lg bg-bg-tertiary p-24 inset-ring-1 inset-ring-border-tertiary">
          <div className="flex items-center gap-8">
            <span
              className={`text-heading-lg ${isCorrect ? 'text-status-success' : 'text-status-danger'}`}
            >
              {isCorrect ? '정답입니다!' : '아쉽네요!'}
            </span>
            {isCorrect && streak > 1 && (
              <StatusChip status="brand" showIcon={false}>
                {streak}일 연속 정답
              </StatusChip>
            )}
          </div>
          <p className="text-body-md-regular text-text-secondary">
            {quiz.explanation}
          </p>
          <div className="flex items-center gap-16 text-body-xs-regular tabular-nums text-text-tertiary">
            <span>{quiz.location}</span>
            <span aria-hidden>&middot;</span>
            <span>{quiz.coordinates}</span>
          </div>
          <div className="flex gap-12 pt-8">
            <Button render={<Link href="/map" />} nativeButton={false}>
              지도에서 보기
            </Button>
            <Button variant="outline" render={<Link href="/explore" />} nativeButton={false}>
              탐색하기
            </Button>
          </div>
        </div>
      )}

      {/* Tomorrow teaser */}
      {revealed && (
        <div className="mt-32 border-t border-border-tertiary py-24 text-center">
          <p className="text-body-md-regular text-text-secondary">
            내일 새로운 퀴즈가 공개됩니다
          </p>
          <p className="mt-4 text-body-xs-regular text-text-tertiary">
            매일 자정 업데이트
          </p>
        </div>
      )}
    </div>
  );
}
