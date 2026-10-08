#!/usr/bin/env node
// NDS 마이그레이션 코드모드 — Tailwind 기본 스케일로 작성된 클래스를 NDS 테마에서
// 같은 px 로 렌더되도록 바꾼다. 규칙 정본: docs/NDS_MIGRATION.md
//
//   1) 간격: NDS --spacing 이 0.25rem → 0.0625rem(1px) 이므로 숫자 ×4
//      p-4 → p-16, md:gap-1.5 → md:gap-6, -mt-1 → -mt-4
//   2) radius: 이름이 같고 값이 다른 스케일을 같은 px 의 NDS 이름/임의값으로
//      rounded-lg(8px) → rounded-sm, rounded-xl(12px) → rounded-[12px] …
//   3) CSS/인라인 style 의 EP var(--radius-*) → 같은 px 의 NDS 변수/리터럴
//
// ⚠ 멱등이 아니다 (×4 를 두 번 하면 ×16). 반드시 "아직 변환 안 된" 파일만 넘긴다.
//   사용: node scripts/nds-codemod.mjs [--dry] <file...>
//         node scripts/nds-codemod.mjs [--dry] --since <commit>   (그 커밋 이후 바뀐 src 파일)

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// Tailwind v4 에서 값이 calc(var(--spacing) * N) 인 유틸리티
const SPACING_UTILS = [
  'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe',
  'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me',
  'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
  'w', 'h', 'size', 'min-w', 'min-h', 'max-w', 'max-h',
  'inset', 'inset-x', 'inset-y', 'top', 'right', 'bottom', 'left', 'start', 'end',
  'translate-x', 'translate-y', 'basis', 'indent', 'leading',
  'scroll-m', 'scroll-mx', 'scroll-my', 'scroll-mt', 'scroll-mr', 'scroll-mb', 'scroll-ml',
  'scroll-p', 'scroll-px', 'scroll-py', 'scroll-pt', 'scroll-pr', 'scroll-pb', 'scroll-pl',
  'border-spacing', 'border-spacing-x', 'border-spacing-y',
];

// Tailwind v4 기본 radius(px) → NDS 테마에서 같은 px 를 내는 이름
//   NDS: xs 4 / sm 8 / md 16 / lg 24 / xl 32
const RADIUS_MAP = {
  '': 'xs', // rounded = 4px
  xs: '[2px]',
  sm: 'xs', // 4px
  md: '[6px]',
  lg: 'sm', // 8px
  xl: '[12px]',
  '2xl': 'md', // 16px
  '3xl': 'lg', // 24px
  '4xl': 'xl', // 32px
};
const RADIUS_SIDES = ['', 't', 'r', 'b', 'l', 's', 'e', 'tl', 'tr', 'br', 'bl', 'ss', 'se', 'es', 'ee'];

// EP 전역 변수(제거됨) → NDS 동일 px
const RADIUS_VAR_MAP = {
  'var(--radius-sm)': 'var(--radius-xs)', // 4px
  'var(--radius-md)': 'var(--radius-sm)', // 8px
  'var(--radius-lg)': '12px',
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// 클래스 토큰 경계: 공백/따옴표/백틱/괄호/중괄호 또는 문자열 시작·끝
const PRE = String.raw`(?<=^|[\s"'\`{(])`;
const POST = String.raw`(?=$|[\s"'\`})])`;
// 변형 접두사 (md:, hover:, group-hover:, [&>svg]: …) + important(!)
const VARIANTS = String.raw`((?:[a-z0-9_\-\[\]&>=.*@/]+:)*!?)`;

const spacingRe = new RegExp(
  `${PRE}${VARIANTS}(-?)(${SPACING_UTILS.slice().sort((a, b) => b.length - a.length).map(esc).join('|')})-(\\d+(?:\\.\\d+)?)${POST}`,
  'g',
);
const radiusRe = new RegExp(
  `${PRE}${VARIANTS}rounded((?:-(?:${RADIUS_SIDES.filter(Boolean).join('|')}))?)(?:-(xs|sm|md|lg|xl|2xl|3xl|4xl))?${POST}`,
  'g',
);

export function scaleSpacing(n) {
  const v = Number(n) * 4;
  return Number.isInteger(v) ? String(v) : String(+v.toFixed(2));
}

// 주석은 변환하지 않는다 — 이미 NDS 단위로 적힌 설명(예: "px-8 py-2")이 ×4 되는 걸 막는다.
// `//` 는 URL(https://) 과 구분하려고 줄 시작/공백 뒤에 올 때만 주석으로 본다.
const COMMENT_RE = /\/\*[\s\S]*?\*\/|(?<=^|\s)\/\/[^\n]*/gm;

export function transformClasses(src) {
  let count = 0;
  let out = '';
  let last = 0;
  for (const m of src.matchAll(COMMENT_RE)) {
    const code = transformCode(src.slice(last, m.index));
    count += code.count;
    out += code.out + m[0];
    last = m.index + m[0].length;
  }
  const tail = transformCode(src.slice(last));
  return { out: out + tail.out, count: count + tail.count };
}

function transformCode(src) {
  let count = 0;
  let out = src.replace(spacingRe, (m, variants, neg, util, num) => {
    if (Number(num) === 0) return m;
    count++;
    return `${variants}${neg}${util}-${scaleSpacing(num)}`;
  });
  out = out.replace(radiusRe, (m, variants, side, size = '') => {
    const mapped = RADIUS_MAP[size];
    if (mapped === undefined) return m;
    count++;
    return `${variants}rounded${side}-${mapped}`;
  });
  for (const [from, to] of Object.entries(RADIUS_VAR_MAP)) {
    const parts = out.split(from);
    count += parts.length - 1;
    out = parts.join(to);
  }
  return { out, count };
}

function filesSince(commit) {
  const list = execFileSync('git', ['diff', '--name-only', '--diff-filter=AM', commit, '--', 'src'], {
    encoding: 'utf8',
  });
  return list.split('\n').filter((f) => /\.(tsx?|css)$/.test(f) && !f.startsWith('src/styles/nds/'));
}

function main(argv) {
  const dry = argv.includes('--dry');
  const args = argv.filter((a) => a !== '--dry');
  const sinceIdx = args.indexOf('--since');
  const files = sinceIdx >= 0 ? filesSince(args[sinceIdx + 1]) : args;
  if (files.length === 0) {
    console.error('대상 파일이 없습니다. 사용: nds-codemod.mjs [--dry] <file...> | --since <commit>');
    process.exit(1);
  }
  let total = 0;
  for (const f of files) {
    const raw = readFileSync(f, 'utf8');
    const { out, count } = transformClasses(raw);
    if (count === 0) continue;
    total += count;
    console.log(`${String(count).padStart(4)}  ${f}`);
    if (!dry) writeFileSync(f, out);
  }
  console.log(`${dry ? '[dry] ' : ''}총 ${total}건 변환, 파일 ${files.length}개 검사`);
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('nds-codemod.mjs')) {
  main(process.argv.slice(2));
}
