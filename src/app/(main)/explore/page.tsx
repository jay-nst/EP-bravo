'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Badge as NdsBadge, Button, Card, StatusChip } from '@naraspace-technology/nds/components';
import {
  IconArrowRight,
  IconCloudRain,
  IconGlobe,
  IconMoon,
  IconSatellite,
  IconSatelliteSignal,
  IconSun,
} from '@naraspace-technology/nds/icons';
import { BEFORE_AFTER } from '@/lib/sample-data';

export default function ExplorePage() {
  const [selectedBA, setSelectedBA] = useState(BEFORE_AFTER[0]);
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="mx-auto w-full max-w-6xl px-16 py-32">
      <div className="mb-24 flex items-center justify-between">
        <div>
          <h1 className="text-heading-3xl text-text-primary md:text-display-md">
            탐색
          </h1>
          <p className="mt-4 text-body-md-regular text-text-secondary">
            위성으로 기록하는 변화, 그리고 당신의 Earth Score
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-32 lg:grid-cols-3">
        {/* Main: Before/After Viewer */}
        <div className="space-y-24 lg:col-span-2">
          <h2 className="text-heading-2xl text-text-primary">
            Before / After
          </h2>

          {/* Comparison Viewer — 자식 배경이 가장자리까지 차서 inset-ring 대신 border 로 테두리 */}
          <div className="overflow-hidden rounded-lg border border-border-tertiary bg-bg-tertiary">
            {/* Slider viewer — BEFORE/AFTER 그라데이션은 위성 영상 자리 일러스트 배경 (§7-2 일러스트 예외) */}
            <div className="relative bg-bg-secondary">
              <div className="grid min-h-300 grid-cols-2">
                <div
                  className="absolute inset-0 z-2 flex flex-col items-start justify-end p-20"
                  style={{
                    background: 'linear-gradient(135deg, #1a1510 0%, #151210 50%, #1a1612 100%)',
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                  }}
                >
                  <span className="mb-4 text-body-xs-regular text-text-tertiary">
                    BEFORE
                  </span>
                  <span className="text-body-sm-medium tabular-nums text-text-primary">
                    {selectedBA.beforeDate}
                  </span>
                </div>
                <div
                  className="col-span-2 flex flex-col items-end justify-end p-20"
                  style={{ background: 'linear-gradient(135deg, #0a1a15 0%, #0d2216 50%, #0f1a12 100%)' }}
                >
                  <span className="mb-4 text-body-xs-regular text-text-tertiary">
                    AFTER
                  </span>
                  <span className="text-body-sm-medium tabular-nums text-text-primary">
                    {selectedBA.afterDate}
                  </span>
                </div>
              </div>
              {/* Slider control — 범위 슬라이더는 NDS 에 없어 네이티브 유지 */}
              <div className="border-t border-border-tertiary bg-bg-tertiary px-16 py-12">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  aria-label="Before / After 비교 위치"
                  className="w-full accent-bg-interactive-primary"
                />
                <div className="mt-4 flex justify-between text-body-xs-regular tabular-nums text-text-tertiary">
                  <span>{selectedBA.beforeDate}</span>
                  <span>{selectedBA.afterDate}</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-8 border-t border-border-tertiary p-20">
              <div className="flex items-center gap-12">
                <StatusChip status="neutral" showIcon={false}>
                  {selectedBA.changeType}
                </StatusChip>
                <span className="text-body-xs-regular text-text-tertiary">
                  {selectedBA.location}
                </span>
              </div>
              <h3 className="text-heading-lg text-text-primary">
                {selectedBA.title}
              </h3>
              <p className="text-body-sm-regular text-text-secondary">
                {selectedBA.description}
              </p>
            </div>
          </div>

          {/* BA Selector */}
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3">
            {BEFORE_AFTER.map((ba) => {
              const isActive = ba.id === selectedBA.id;
              return (
                <Card.Root
                  key={ba.id}
                  interactive
                  render={<button type="button" aria-pressed={isActive} />}
                  onClick={() => { setSelectedBA(ba); setSliderPos(50); }}
                  className="text-left"
                >
                  {/* Card 에 선택 상태가 없어 색 덮어쓰기 대신 NDS Badge dot 으로 현재 항목 표시 */}
                  <Card.Body className="gap-4">
                    <div className="flex items-center gap-8">
                      <Card.Title>{ba.title}</Card.Title>
                      {isActive && <NdsBadge status="brand" aria-hidden />}
                    </div>
                    <p className="text-body-xs-regular text-text-tertiary">{ba.location}</p>
                    <div className="flex items-center gap-8 text-body-xs-regular tabular-nums text-text-tertiary">
                      <span>{ba.beforeDate}</span>
                      <IconArrowRight className="size-16 text-icon-tertiary" />
                      <span>{ba.afterDate}</span>
                    </div>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Earth Score */}
        <aside className="space-y-24">
          <h2 className="text-heading-2xl text-text-primary">
            Earth Score
          </h2>

          {/* Score Card */}
          <Card.Root>
            <Card.Body className="items-center gap-16 text-center">
              <div className="mx-auto flex size-96 items-center justify-center rounded-full bg-bg-interactive-selected">
                <span className="text-heading-xl tabular-nums text-text-primary">
                  72
                </span>
              </div>
              <div>
                <p className="text-body-md-medium text-text-primary">나의 Earth Score</p>
                <p className="mt-4 text-body-xs-regular text-text-tertiary">
                  상위 15% 탐험가
                </p>
              </div>
              <div className="rounded-md bg-bg-secondary px-12 py-8 text-body-xs-regular text-text-tertiary">
                영상 구매, 탐색, 공유 활동으로 점수가 올라갑니다
              </div>
            </Card.Body>
          </Card.Root>

          {/* Badges */}
          <Card.Root>
            <Card.Body className="gap-16">
              <Card.Title>획득한 배지</Card.Title>
              <div className="grid grid-cols-3 gap-12">
                <Badge icon={<IconGlobe />} label="첫 탐색" earned />
                <Badge icon={<IconSatellite />} label="첫 구매" earned />
                <Badge icon={<IconSatelliteSignal />} label="첫 공유" earned={false} />
                <Badge icon={<IconMoon />} label="야간 관측" earned={false} />
                <Badge icon={<IconCloudRain />} label="기상 추적" earned={false} />
                <Badge icon={<IconSun />} label="농업 분석" earned={false} />
              </div>
            </Card.Body>
          </Card.Root>

          {/* Leaderboard */}
          <Card.Root>
            <Card.Body className="gap-12">
              <Card.Title>이번 주 리더보드</Card.Title>
              <div className="space-y-8">
                <LeaderRow rank={1} name="김지구" score={94} />
                <LeaderRow rank={2} name="이위성" score={87} />
                <LeaderRow rank={3} name="박관측" score={82} />
                <LeaderRow rank={4} name="나" score={72} isMe />
                <LeaderRow rank={5} name="최탐사" score={68} />
              </div>
            </Card.Body>
          </Card.Root>

          {/* Quick Links */}
          <div className="space-y-8">
            <Button display="block" render={<Link href="/map" />} nativeButton={false}>
              지도에서 탐색하기
            </Button>
            <Button variant="outline" display="block" render={<Link href="/daily" />} nativeButton={false}>
              오늘의 지구 보기
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Badge({ icon, label, earned }: { icon: ReactNode; label: string; earned: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-md py-8 text-center ${
        earned ? 'bg-bg-interactive-selected' : 'bg-bg-secondary'
      }`}
    >
      <span
        className={`flex size-20 items-center justify-center [&>svg]:size-20 ${
          earned ? 'text-icon-interactive-selected' : 'text-icon-disabled'
        }`}
      >
        {icon}
      </span>
      <span className={`text-body-xs-regular ${earned ? 'text-text-interactive-selected' : 'text-text-disabled'}`}>
        {label}
      </span>
    </div>
  );
}

function LeaderRow({
  rank,
  name,
  score,
  isMe = false,
}: {
  rank: number;
  name: string;
  score: number;
  isMe?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-12 rounded-sm px-12 py-8 text-body-sm-regular ${
        isMe ? 'bg-bg-interactive-selected' : ''
      }`}
    >
      <span
        className={`w-20 text-center text-body-xs-regular tabular-nums ${
          rank <= 3 ? 'text-text-primary' : 'text-text-tertiary'
        }`}
      >
        {rank}
      </span>
      <span className={`flex-1 ${isMe ? 'text-text-interactive-selected' : 'text-text-primary'}`}>
        {name}
      </span>
      <span className="text-body-sm-medium tabular-nums text-text-primary">
        {score}
      </span>
    </div>
  );
}
