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
            <h1 className="text-heading-3xl text-text-primary">
              오늘의 퀴즈
            </h1>
            <StatusChip status="brand" showIcon={false}>
              DAILY
            </StatusChip>
          </div>
          <p className="text-body-sm-regular text-text-tertiary">
            위성 영상을 보고 장소를 맞혀보세요
          </p>
        </div>
        {/* Streak */}
        <div className="text-center">
          <div
            className={`flex size-48 items-center justify-center rounded-full border-2 text-body-lg-medium tabular-nums ${
              streak > 0
                ? 'border-border-interactive-primary text-text-interactive-primary'
                : 'border-border-tertiary text-text-tertiary'
            }`}
          >
            {streak}
          </div>
          <p className="mt-4 text-body-xs-regular text-text-tertiary">연속</p>
        </div>
      </div>

      {/* Image / Hint area — 자식 배경이 가장자리까지 차서 inset-ring 대신 border 로 테두리 */}
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
            <IconSatellite className="size-24 text-icon-interactive-primary" />
          </div>
          <p className="relative z-10 max-w-md text-body-sm-regular text-text-tertiary">
            {quiz.imageHint}
          </p>
          <p className="relative z-10 mt-12 text-body-xs-regular text-text-tertiary opacity-50">
            실제 위성 영상이 여기에 표시됩니다
          </p>
        </div>
      </div>

      {/* Question */}
      <h2 className="mb-16 text-heading-lg text-text-primary">
        {quiz.question}
      </h2>

      {/* Choices — 정답/오답 상태를 보여주는 선택지 타일. NDS Button 에 해당 상태가 없어 네이티브 button 유지 */}
      <div className="mb-32 space-y-10">
        {quiz.choices.map((choice, i) => {
          let ringClass = 'inset-ring-border-tertiary';
          let borderClass = 'border-border-tertiary';
          let bgClass = '';
          let textClass = 'text-text-primary';

          if (revealed) {
            if (i === quiz.answer) {
              ringClass = 'inset-ring-border-interactive-primary';
              borderClass = 'border-border-interactive-primary';
              bgClass = 'bg-[rgba(27,191,168,0.08)]';
              textClass = 'text-text-interactive-primary';
            } else if (i === selected && i !== quiz.answer) {
              ringClass = 'inset-ring-status-danger';
              borderClass = 'border-status-danger';
              bgClass = 'bg-status-danger/8';
              textClass = 'text-status-danger';
            } else {
              textClass = 'text-text-tertiary';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className={`flex w-full items-center gap-12 rounded-md px-20 py-16 text-left inset-ring-1 transition-all ${ringClass} ${bgClass}`}
            >
              <span
                className={`flex size-28 shrink-0 items-center justify-center rounded-full border-[1.5px] text-body-xs-regular tabular-nums ${borderClass} ${textClass}`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className={`text-body-sm-regular ${textClass}`}>
                {choice}
              </span>
              {revealed && i === quiz.answer && (
                <span className="ml-auto text-body-xs-regular text-text-interactive-primary">
                  정답
                </span>
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
              className={`text-body-sm-medium ${isCorrect ? 'text-text-interactive-primary' : 'text-status-danger'}`}
            >
              {isCorrect ? '정답입니다!' : '아쉽네요!'}
            </span>
            {isCorrect && streak > 1 && (
              <StatusChip status="brand" showIcon={false}>
                {streak}일 연속 정답
              </StatusChip>
            )}
          </div>
          <p className="text-body-sm-regular text-text-tertiary">
            {quiz.explanation}
          </p>
          <div className="flex items-center gap-16 text-body-xs-regular tabular-nums text-text-tertiary">
            <span>{quiz.location}</span>
            <span className="text-border-tertiary">&middot;</span>
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
          <p className="text-body-sm-regular text-text-tertiary">
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
