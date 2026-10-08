import Link from 'next/link';
import { Card } from '@naraspace-technology/nds/components';
import { IconSatellite } from '@naraspace-technology/nds/icons';
import { DAILY_EARTH, DAILY_QUIZZES } from '@/lib/sample-data';

export default function EPOriginal() {
  const today = DAILY_EARTH[0];
  const dayIndex = new Date().getDate() % DAILY_QUIZZES.length;
  const quiz = DAILY_QUIZZES[dayIndex];

  return (
    <div className="space-y-16">
      <h3 className="text-body-xs-regular text-text-tertiary">
        EP Original
      </h3>

      {/* Daily Earth */}
      <Card.Root interactive render={<Link href="/daily" />}>
        <Card.Body className="flex-row items-center gap-12 p-4">
          <div
            className="size-40 rounded-md flex items-center justify-center shrink-0 relative overflow-hidden"
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
            <span className="text-body-xs-regular text-text-interactive-primary opacity-70 relative z-10">
              DE
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-xs-regular text-text-primary truncate">
              {today.title}
            </p>
            <p className="text-body-xs-regular text-text-tertiary">
              {today.date} &middot; {today.location}
            </p>
          </div>
        </Card.Body>
      </Card.Root>

      {/* Quiz */}
      <Card.Root interactive render={<Link href="/quiz" />}>
        <Card.Body className="flex-row items-center gap-12 p-4">
          <div className="size-40 rounded-md flex items-center justify-center shrink-0 bg-bg-interactive-primary/8">
            <IconSatellite className="size-20 text-icon-interactive-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-body-xs-regular text-text-primary truncate">
              {quiz.question}
            </p>
            <p className="text-body-xs-regular text-text-tertiary">
              오늘의 퀴즈
            </p>
          </div>
        </Card.Body>
      </Card.Root>
    </div>
  );
}
