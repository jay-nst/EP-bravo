'use client';

import { useEffect, useState } from 'react';

const PASSES = [
  { satellite: 'Observer-1A', area: '서울 강남구', offsetMin: 47 },
  { satellite: 'Observer-1B', area: '부산 해운대구', offsetMin: 123 },
  { satellite: 'Observer-1A', area: '인천 송도', offsetMin: 215 },
  { satellite: 'NarSha', area: '제주 서귀포시', offsetMin: 290 },
  { satellite: 'Observer-1B', area: '대전 유성구', offsetMin: 340 },
  { satellite: 'NarSha', area: '세종시', offsetMin: 355 },
];

function getNextPass() {
  const now = Date.now();
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const elapsed = now - dayStart.getTime();
  const cycleMs = 6 * 60 * 60 * 1000;
  const cyclePos = elapsed % cycleMs;

  for (const pass of PASSES) {
    const passTime = pass.offsetMin * 60 * 1000;
    if (passTime > cyclePos) {
      return {
        ...pass,
        targetTime: dayStart.getTime() + Math.floor(elapsed / cycleMs) * cycleMs + passTime,
      };
    }
  }
  return {
    ...PASSES[0],
    targetTime: dayStart.getTime() + (Math.floor(elapsed / cycleMs) + 1) * cycleMs + PASSES[0].offsetMin * 60 * 1000,
  };
}

function formatTime(ms: number) {
  if (ms <= 0) return { h: '00', m: '00', s: '00' };
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
  const s = String(totalSec % 60).padStart(2, '0');
  return { h, m, s };
}

const SAT_COLORS: Record<string, string> = {
  'Observer-1A': 'rgba(27,191,168,0.1)',
  'Observer-1B': 'rgba(53,217,192,0.1)',
  'NarSha': 'rgba(200,146,58,0.1)',
};

const SAT_TEXT_COLORS: Record<string, string> = {
  'Observer-1A': 'var(--accent)',
  'Observer-1B': '#35d9c0',
  'NarSha': 'var(--warning)',
};

export default function SatelliteCountdown() {
  const [pass, setPass] = useState(() => getNextPass());
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const current = getNextPass();
      const diff = current.targetTime - Date.now();
      if (diff <= 0) {
        setPass(getNextPass());
      } else {
        setPass(current);
      }
      setRemaining(Math.max(0, diff));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const time = formatTime(remaining);
  const satBg = SAT_COLORS[pass.satellite] ?? 'rgba(27,191,168,0.1)';
  const satColor = SAT_TEXT_COLORS[pass.satellite] ?? 'var(--accent)';

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: satBg }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={satColor === 'var(--accent)' ? '#1bbfa8' : satColor === 'var(--warning)' ? '#C8923A' : '#35d9c0'} strokeWidth="1.5">
            <path d="M13 7L9 3L5 7l4 4" />
            <path d="M17 11l4 4-4 4-4-4" />
            <path d="M8 12l4 4" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <path d="M3 21l4-4" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
              다음 위성 통과
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{ background: satBg, color: satColor, fontSize: '10px' }}
            >
              {pass.satellite}
            </span>
          </div>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {pass.area} 상공
          </p>
        </div>
        <div className="flex items-center gap-0.5 font-mono tabular-nums flex-shrink-0">
          <TimeUnit value={time.h} label="h" />
          <span style={{ color: 'var(--text-muted)', animation: 'ep-count-pulse 1s ease-in-out infinite' }}>:</span>
          <TimeUnit value={time.m} label="m" />
          <span style={{ color: 'var(--text-muted)', animation: 'ep-count-pulse 1s ease-in-out infinite' }}>:</span>
          <TimeUnit value={time.s} label="s" />
        </div>
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="text-lg font-semibold" style={{ color: 'var(--text)', letterSpacing: '1px' }}>
        {value}
      </span>
      <span className="text-xs ml-0.5" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
        {label}
      </span>
    </div>
  );
}
