'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
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
    <div className="max-w-2xl mx-auto px-16 py-32 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-32">
        <div>
          <div className="flex items-center gap-8 mb-4">
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
              오늘의 퀴즈
            </h1>
            <span
              className="text-xs font-mono px-8 py-2 rounded-full"
              style={{ background: 'rgba(27,191,168,0.1)', color: 'var(--accent)' }}
            >
              DAILY
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            위성 영상을 보고 장소를 맞혀보세요
          </p>
        </div>
        {/* Streak */}
        <div className="text-center">
          <div
            className="w-48 h-48 rounded-full flex items-center justify-center text-lg font-mono font-semibold"
            style={{
              border: streak > 0 ? '2px solid var(--accent)' : '2px solid var(--border)',
              color: streak > 0 ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            {streak}
          </div>
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>연속</p>
        </div>
      </div>

      {/* Image / Hint area */}
      <div
        className="rounded-[12px] overflow-hidden mb-24"
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="aspect-[16/10] flex flex-col items-center justify-center p-32 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0a1a15 0%, #0d2818 30%, #0a1612 60%, #111a14 100%)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(27,191,168,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div
            className="w-64 h-64 rounded-full flex items-center justify-center text-3xl mb-16 relative z-10"
            style={{ background: 'rgba(27,191,168,0.08)' }}
          >
            <span style={{ color: 'var(--accent)' }}>&#128752;</span>
          </div>
          <p
            className="text-sm leading-relaxed max-w-md relative z-10"
            style={{ color: 'var(--text-muted)' }}
          >
            {quiz.imageHint}
          </p>
          <p className="text-xs font-mono mt-12 relative z-10" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
            실제 위성 영상이 여기에 표시됩니다
          </p>
        </div>
      </div>

      {/* Question */}
      <h2 className="text-lg font-semibold mb-16" style={{ color: 'var(--text)' }}>
        {quiz.question}
      </h2>

      {/* Choices */}
      <div className="space-y-10 mb-32">
        {quiz.choices.map((choice, i) => {
          let borderColor = 'var(--border)';
          let bg = 'transparent';
          let textColor = 'var(--text)';

          if (revealed) {
            if (i === quiz.answer) {
              borderColor = 'var(--accent)';
              bg = 'rgba(27,191,168,0.08)';
              textColor = 'var(--accent)';
            } else if (i === selected && i !== quiz.answer) {
              borderColor = 'var(--error)';
              bg = 'rgba(196,92,74,0.08)';
              textColor = 'var(--error)';
            } else {
              textColor = 'var(--text-muted)';
            }
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={revealed}
              className="w-full text-left rounded-[12px] px-20 py-16 transition-all flex items-center gap-12"
              style={{ border: `1px solid ${borderColor}`, background: bg }}
            >
              <span
                className="w-28 h-28 rounded-full flex items-center justify-center text-xs font-mono font-semibold flex-shrink-0"
                style={{
                  border: `1.5px solid ${borderColor}`,
                  color: textColor,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-sm" style={{ color: textColor }}>
                {choice}
              </span>
              {revealed && i === quiz.answer && (
                <span className="ml-auto text-xs font-medium" style={{ color: 'var(--accent)' }}>
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
          className="rounded-[12px] p-24 space-y-16"
          style={{
            border: `1px solid ${isCorrect ? 'rgba(27,191,168,0.3)' : 'rgba(196,92,74,0.3)'}`,
            background: isCorrect ? 'rgba(27,191,168,0.04)' : 'rgba(196,92,74,0.04)',
          }}
        >
          <div className="flex items-center gap-8">
            <span
              className="text-sm font-semibold"
              style={{ color: isCorrect ? 'var(--accent)' : 'var(--error)' }}
            >
              {isCorrect ? '정답입니다!' : '아쉽네요!'}
            </span>
            {isCorrect && streak > 1 && (
              <span
                className="text-xs font-mono px-8 py-2 rounded-full"
                style={{ background: 'rgba(27,191,168,0.1)', color: 'var(--accent)' }}
              >
                {streak}일 연속 정답
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {quiz.explanation}
          </p>
          <div className="flex items-center gap-16 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            <span>{quiz.location}</span>
            <span style={{ color: 'var(--border)' }}>&middot;</span>
            <span>{quiz.coordinates}</span>
          </div>
          <div className="flex gap-12 pt-8">
            <Link
              href="/map"
              className="px-16 py-8 rounded-sm text-sm font-medium transition-colors"
              style={{ background: 'var(--accent)', color: '#0E0E10' }}
            >
              지도에서 보기
            </Link>
            <Link
              href="/explore"
              className="px-16 py-8 rounded-sm text-sm transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              탐색하기
            </Link>
          </div>
        </div>
      )}

      {/* Tomorrow teaser */}
      {revealed && (
        <div className="mt-32 text-center py-24" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            내일 새로운 퀴즈가 공개됩니다
          </p>
          <p className="text-xs font-mono mt-4" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
            매일 자정 업데이트
          </p>
        </div>
      )}
    </div>
  );
}
