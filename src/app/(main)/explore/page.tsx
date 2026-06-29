'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BEFORE_AFTER } from '@/lib/sample-data';

export default function ExplorePage() {
  const [selectedBA, setSelectedBA] = useState(BEFORE_AFTER[0]);
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
            탐색
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            위성으로 기록하는 변화, 그리고 당신의 Earth Score
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main: Before/After Viewer */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Before / After
          </h2>

          {/* Comparison Viewer */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {/* Slider viewer */}
            <div className="relative" style={{ background: 'var(--surface)' }}>
              <div className="grid grid-cols-2" style={{ minHeight: '300px' }}>
                <div
                  className="flex flex-col items-center justify-center p-8"
                  style={{
                    background: 'linear-gradient(135deg, #1a1510 0%, #151210 50%, #1a1612 100%)',
                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                    position: 'absolute',
                    inset: 0,
                    zIndex: 2,
                  }}
                >
                  <span className="text-xs font-mono tracking-wider mb-2" style={{ color: 'var(--warning)' }}>
                    BEFORE
                  </span>
                  <span className="text-2xl font-mono" style={{ color: 'var(--text-muted)' }}>
                    {selectedBA.beforeDate}
                  </span>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    실제 위성 영상
                  </p>
                </div>
                <div className="col-span-2 flex flex-col items-center justify-center p-8"
                  style={{ background: 'linear-gradient(135deg, #0a1a15 0%, #0d2216 50%, #0f1a12 100%)' }}
                >
                  <span className="text-xs font-mono tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
                    AFTER
                  </span>
                  <span className="text-2xl font-mono" style={{ color: 'var(--text)' }}>
                    {selectedBA.afterDate}
                  </span>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    실제 위성 영상
                  </p>
                </div>
              </div>
              {/* Slider control */}
              <div className="px-4 py-3" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <div className="flex justify-between text-xs font-mono mt-1" style={{ color: 'var(--text-muted)' }}>
                  <span>{selectedBA.beforeDate}</span>
                  <span>{selectedBA.afterDate}</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="p-5 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ background: 'rgba(27, 191, 168, 0.12)', color: 'var(--accent)' }}
                >
                  {selectedBA.changeType}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {selectedBA.location}
                </span>
              </div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                {selectedBA.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {selectedBA.description}
              </p>
            </div>
          </div>

          {/* BA Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BEFORE_AFTER.map((ba) => {
              const isActive = ba.id === selectedBA.id;
              return (
                <button
                  key={ba.id}
                  onClick={() => { setSelectedBA(ba); setSliderPos(50); }}
                  className="text-left rounded-lg p-4 transition-colors space-y-1"
                  style={{
                    border: isActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                    background: isActive ? 'rgba(27, 191, 168, 0.05)' : 'transparent',
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {ba.title}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {ba.location}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    <span>{ba.beforeDate}</span>
                    <span>→</span>
                    <span>{ba.afterDate}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Earth Score */}
        <aside className="space-y-6">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
            Earth Score
          </h2>

          {/* Score Card */}
          <div
            className="rounded-xl p-6 text-center space-y-4"
            style={{ border: '1px solid var(--border)' }}
          >
            <div
              className="w-24 h-24 rounded-full mx-auto flex items-center justify-center"
              style={{ background: 'rgba(27, 191, 168, 0.1)', border: '2px solid var(--accent)' }}
            >
              <span className="text-3xl font-mono font-semibold" style={{ color: 'var(--accent)' }}>
                72
              </span>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>나의 Earth Score</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                상위 15% 탐험가
              </p>
            </div>
            <div
              className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
            >
              영상 구매, 탐색, 공유 활동으로 점수가 올라갑니다
            </div>
          </div>

          {/* Badges */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ border: '1px solid var(--border)' }}
          >
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              획득한 배지
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <Badge icon="&#127759;" label="첫 탐색" earned />
              <Badge icon="&#128752;" label="첫 구매" earned />
              <Badge icon="&#128225;" label="첫 공유" earned={false} />
              <Badge icon="&#127756;" label="야간 관측" earned={false} />
              <Badge icon="&#127783;" label="기상 추적" earned={false} />
              <Badge icon="&#127806;" label="농업 분석" earned={false} />
            </div>
          </div>

          {/* Leaderboard */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ border: '1px solid var(--border)' }}
          >
            <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
              이번 주 리더보드
            </h3>
            <div className="space-y-2">
              <LeaderRow rank={1} name="김지구" score={94} />
              <LeaderRow rank={2} name="이위성" score={87} />
              <LeaderRow rank={3} name="박관측" score={82} />
              <LeaderRow rank={4} name="나" score={72} isMe />
              <LeaderRow rank={5} name="최탐사" score={68} />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <Link
              href="/map"
              className="block px-4 py-3 rounded-lg text-sm transition-colors"
              style={{ background: 'var(--accent)', color: '#0E0E10', textAlign: 'center' }}
            >
              지도에서 탐색하기
            </Link>
            <Link
              href="/daily"
              className="block px-4 py-3 rounded-lg text-sm transition-colors text-center"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              오늘의 지구 보기
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Badge({ icon, label, earned }: { icon: string; label: string; earned: boolean }) {
  return (
    <div
      className="flex flex-col items-center gap-1 py-2 rounded-lg text-center"
      style={{
        opacity: earned ? 1 : 0.35,
        background: earned ? 'rgba(27, 191, 168, 0.06)' : 'var(--surface)',
      }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs" style={{ color: earned ? 'var(--text)' : 'var(--text-muted)' }}>
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
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
      style={{
        background: isMe ? 'rgba(27, 191, 168, 0.08)' : 'transparent',
        border: isMe ? '1px solid rgba(27, 191, 168, 0.2)' : '1px solid transparent',
      }}
    >
      <span
        className="w-5 text-center font-mono text-xs"
        style={{ color: rank <= 3 ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        {rank}
      </span>
      <span className="flex-1" style={{ color: isMe ? 'var(--accent)' : 'var(--text)' }}>
        {name}
      </span>
      <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
        {score}
      </span>
    </div>
  );
}
