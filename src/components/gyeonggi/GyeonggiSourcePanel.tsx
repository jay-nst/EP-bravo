'use client';

import { SOURCE_KIND_BADGE } from '@/lib/seoul-data-sources';
import { GYEONGGI_DATA_SOURCES, type GyeonggiDataSource } from '@/lib/gyeonggi-data-sources';

// 사이드바 하단의 '데이터 출처' 섹션. 접힌 상태가 기본.
// SeoulSourcePanel 과 같은 구조로, 읽는 레지스트리만 경기 것이다.

interface GyeonggiSourcePanelProps {
  defaultOpen?: boolean;
}

export default function GyeonggiSourcePanel({ defaultOpen = false }: GyeonggiSourcePanelProps) {
  return (
    <details
      className="ep-src-details pt-4"
      style={{ borderTop: '1px solid var(--border)' }}
      open={defaultOpen}
    >
      <summary
        className="text-xs font-mono tracking-wider uppercase cursor-pointer list-none flex items-center gap-1.5 py-1"
        style={{ color: 'var(--text-muted)' }}
      >
        <span className="ep-src-caret" aria-hidden>
          ▸
        </span>
        데이터 출처 ({GYEONGGI_DATA_SOURCES.length})
      </summary>

      <ul className="mt-2 space-y-2.5">
        {GYEONGGI_DATA_SOURCES.map((s) => (
          <SourceRow key={s.id} source={s} />
        ))}
      </ul>

      <p className="text-xs leading-relaxed mt-3" style={{ color: 'var(--text-muted)' }}>
        접근성 등고선은 공식 평가가 아니라 EarthPaper 자체 분석이다. 정책 판단 근거로 쓰지 않는다.
      </p>

      <style>{`
        .ep-src-details > summary::-webkit-details-marker { display: none; }
        .ep-src-details[open] .ep-src-caret { transform: rotate(90deg); }
        .ep-src-details .ep-src-caret {
          display: inline-block;
          transition: transform var(--duration-short) var(--ease-move);
        }
        @media (prefers-reduced-motion: reduce) {
          .ep-src-details .ep-src-caret { transition: none; }
        }
      `}</style>
    </details>
  );
}

function SourceRow({ source }: { source: GyeonggiDataSource }) {
  const badge = SOURCE_KIND_BADGE[source.kind];

  return (
    <li className="text-xs leading-relaxed">
      <div className="flex items-baseline gap-1.5">
        <span
          className="font-mono px-1 rounded flex-shrink-0"
          style={{
            background: 'var(--surface-elevated)',
            color: badge.color,
            letterSpacing: '0.04em',
          }}
        >
          {badge.label}
        </span>
        <span style={{ color: 'var(--text)' }}>{source.layer}</span>
      </div>

      <div className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: 'var(--text-muted)', textDecorationColor: 'var(--border)' }}
          >
            {source.provider}
          </a>
        ) : (
          source.provider
        )}
      </div>

      <div className="font-mono break-words" style={{ color: 'var(--text-muted)', opacity: 0.85 }}>
        {source.dataset}
      </div>

      <p className="mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.75 }}>
        {source.note}
      </p>
    </li>
  );
}
