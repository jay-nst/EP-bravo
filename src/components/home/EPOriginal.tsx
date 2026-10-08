import Link from 'next/link';
import { Card } from '@naraspace-technology/nds/components';
import { IconSatellite } from '@naraspace-technology/nds/icons';
import { DAILY_EARTH, DAILY_QUIZZES } from '@/lib/sample-data';

// 썸네일 격자 — 일러스트 (운영 색, §8)
const GRID_LINE = 'rgba(27,191,168,0.06)';
// 운영: surface 박스 + border 테두리, hover 색 변화 없음 (§8)
const CARD_COLOR = 'bg-bg-secondary hover:bg-bg-secondary hover:inset-ring-border-tertiary';

export default function EPOriginal() {
  const today = DAILY_EARTH[0];
  const dayIndex = new Date().getDate() % DAILY_QUIZZES.length;
  const quiz = DAILY_QUIZZES[dayIndex];

  return (
    <div className="space-y-16">
      {/* eyebrow → 사이드바 블록 제목 (대시보드 사이드바 패널 제목과 같은 역할·클래스, §7-1) */}
      <h3 className="text-heading-lg text-text-tertiary">
        EP Original
      </h3>

      {/* Daily Earth */}
      <Card.Root interactive orientation="horizontal" className={CARD_COLOR} render={<Link href="/daily" />}>
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
          <span className="text-body-xs-regular text-text-interactive-primary/70 relative z-10">
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
      <Card.Root interactive orientation="horizontal" className={CARD_COLOR} render={<Link href="/quiz" />}>
        <div className="size-40 self-center rounded-md flex items-center justify-center shrink-0 bg-[rgba(27,191,168,0.08)]">
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
