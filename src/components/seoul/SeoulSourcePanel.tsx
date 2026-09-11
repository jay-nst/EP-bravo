'use client';

import {
  SEOUL_DATA_SOURCES,
  SOURCE_KIND_BADGE,
  type SeoulDataSource,
} from '@/lib/seoul-data-sources';

// 사이드바 하단의 '데이터 출처' 섹션. 접힌 상태가 기본이고, 펼치면 레이어별
// 기관·데이터셋·산출 방식이 전부 나온다. 최소 글자 크기는 12px (DESIGN.md).

interface SeoulSourcePanelProps {
  /** 기본으로 펼쳐둘지. 데모 시연 때 열어두고 싶을 수 있어 열어둔다. */
  defaultOpen?: boolean;
}

export default function SeoulSourcePanel({ defaultOpen = false }: SeoulSourcePanelProps) {
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
        데이터 출처 ({SEOUL_DATA_SOURCES.length})
      </summary>

      <ul className="mt-2 space-y-2.5">
        {SEOUL_DATA_SOURCES.map((s) => (
          <SourceRow key={s.id} source={s} />
        ))}
      </ul>

      <p className="text-xs leading-relaxed mt-3" style={{ color: 'var(--text-muted)' }}>
        DEMO·분석 표기 항목은 실제 관측·통계가 아닌 추정치다. 정책 판단 근거로 쓰지 않는다.
      </p>

      {/* 셀렉터를 .ep-src-details 로 묶어 다른 details 요소에 새지 않게 한다. */}
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

function SourceRow({ source }: { source: SeoulDataSource }) {
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
