import Link from 'next/link';
import { Card } from '@naraspace-technology/nds/components';
import { IconSatellite } from '@naraspace-technology/nds/icons';
import { DAILY_EARTH, DAILY_QUIZZES } from '@/lib/sample-data';

// 썸네일 격자 — 일러스트. 액센트 임의 rgba 대신 NDS 토큰을 섞어 쓴다 (§7-2)
const GRID_LINE = 'color-mix(in srgb, var(--bg-interactive-primary) 6%, transparent)';

export default function EPOriginal() {
  const today = DAILY_EARTH[0];
  const dayIndex = new Date().getDate() % DAILY_QUIZZES.length;
  const quiz = DAILY_QUIZZES[dayIndex];

  return (
    <div className="space-y-16">
      {/* eyebrow → 사이드바 블록 제목 (대시보드 사이드바 패널 제목과 같은 역할·클래스, §7-1) */}
      <h3 className="text-heading-lg text-text-primary">
        EP Original
      </h3>

      {/* Daily Earth */}
      <Card.Root interactive orientation="horizontal" render={<Link href="/daily" />}>
        {/* 일러스트 썸네일 (그라데이션·격자) — 인라인 유지 */}
        <div
          className="size-40 self-center rounded-md flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(135deg, #0a1a15 0%, #0d2818 50%, #0a1612 100%)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(${GRID_LINE} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE} 1px, transparent 1px)`,
              backgroundSize: '8px 8px',
            }}
          />
          <span className="text-body-xs-regular text-text-interactive-primary relative z-10">
            DE
          </span>
        </div>
        <Card.Body className="flex-1 min-w-0 gap-4">
          <Card.Title className="truncate">{today.title}</Card.Title>
          <p className="text-body-xs-regular text-text-tertiary">
            {today.date} &middot; {today.location}
          </p>
        </Card.Body>
      </Card.Root>

      {/* Quiz */}
      <Card.Root interactive orientation="horizontal" render={<Link href="/quiz" />}>
        <div className="size-40 self-center rounded-md flex items-center justify-center shrink-0 bg-bg-interactive-selected">
          <IconSatellite className="size-20 text-icon-interactive-primary" />
        </div>
        <Card.Body className="flex-1 min-w-0 gap-4">
          <Card.Title className="truncate">{quiz.question}</Card.Title>
          <p className="text-body-xs-regular text-text-tertiary">
            오늘의 퀴즈
          </p>
        </Card.Body>
      </Card.Root>
    </div>
  );
}
