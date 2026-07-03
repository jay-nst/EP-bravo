import Link from 'next/link';
import { DAILY_EARTH, DAILY_QUIZZES } from '@/lib/sample-data';

export default function EPOriginal() {
  const today = DAILY_EARTH[0];
  const dayIndex = new Date().getDate() % DAILY_QUIZZES.length;
  const quiz = DAILY_QUIZZES[dayIndex];

  return (
    <div className="space-y-4">
      <h3
        className="text-xs font-mono tracking-wider uppercase"
        style={{ color: 'var(--text-muted)' }}
      >
        EP Original
      </h3>

      {/* Daily Earth */}
      <Link
        href="/daily"
        className="block rounded-lg overflow-hidden transition-colors"
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="p-3 flex items-center gap-3"
          style={{ background: 'var(--surface)' }}
        >
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, #0a1a15 0%, #0d2818 50%, #0a1612 100%)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(27,191,168,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(27,191,168,0.06) 1px, transparent 1px)',
                backgroundSize: '8px 8px',
              }}
            />
            <span
              className="text-xs font-mono relative z-10"
              style={{ color: 'var(--accent)', opacity: 0.7 }}
            >
              DE
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium truncate"
              style={{ color: 'var(--text)' }}
            >
              {today.title}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {today.date} &middot; {today.location}
            </p>
          </div>
        </div>
      </Link>

      {/* Quiz */}
      <Link
        href="/quiz"
        className="block rounded-lg overflow-hidden transition-colors"
        style={{ border: '1px solid var(--border)' }}
      >
        <div
          className="p-3 flex items-center gap-3"
          style={{ background: 'var(--surface)' }}
        >
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(27,191,168,0.08)' }}
          >
            <span className="text-lg" style={{ color: 'var(--accent)' }}>
              &#128752;
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-medium truncate"
              style={{ color: 'var(--text)' }}
            >
              {quiz.question}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              오늘의 퀴즈
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}
