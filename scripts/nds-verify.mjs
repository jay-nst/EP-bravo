#!/usr/bin/env node
// NDS 마이그레이션 검증 — 변환 전(<base> 커밋의 테마 + 원본 클래스) vs 변환 후(현재 NDS 테마 +
// 코드모드 클래스)가 같은 CSS 를 내는지 Tailwind 디자인 시스템으로 직접 비교한다.
//   사용: node scripts/nds-verify.mjs <base-commit>
//   기대 결과: "다름" 은 delay-* 3건(tw-animate-css 의 animation-delay — transition 전용이라 무해)뿐,
//            "변환 후 무효" 0, EP :root 변수 전부 동일. 규칙: docs/NDS_MIGRATION.md

import { __unstable__loadDesignSystem as loadDesignSystem } from '@tailwindcss/node';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { transformClasses } from './nds-codemod.mjs';

const BASE = process.argv[2];
if (!BASE) {
  console.error('사용: node scripts/nds-verify.mjs <base-commit>');
  process.exit(1);
}
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 26 });

// 비교용 CSS: base 의 globals.css, 현재 globals.css (테마 상대 import 를 절대 경로로)
const tmp = mkdtempSync(join(tmpdir(), 'nds-verify-'));
const OLD_CSS = join(tmp, 'old.css');
const NEW_CSS = join(tmp, 'new.css');
const NDS_DIR = resolve('src/styles/nds').replace(/\\/g, '/');
writeFileSync(OLD_CSS, git('show', `${BASE}:src/app/globals.css`));
writeFileSync(NEW_CSS, readFileSync('src/app/globals.css', 'utf8').split('"../styles/nds/').join(`"${NDS_DIR}/`));

const load = (f) => loadDesignSystem(readFileSync(f, 'utf8'), { base: resolve('.') });
const oldDs = await load(OLD_CSS);
const newDs = await load(NEW_CSS);
// @theme inline 이 가리키는 :root 런타임 변수 (NDS radius.css)
const NEW_ROOT = { '--radius-xs': '4px', '--radius-sm': '8px', '--radius-md': '16px', '--radius-lg': '24px', '--radius-xl': '32px' };

// base 시점 소스의 모든 토큰을 후보로 (유효한 Tailwind 클래스만 비교 대상이 된다)
const files = git('ls-tree', '-r', '--name-only', BASE, 'src').split('\n').filter((f) => /\.tsx?$/.test(f));
const toks = new Set();
for (const f of files) {
  for (const t of git('show', `${BASE}:${f}`).split(/[\s"'`{}()]+/)) if (t && t.length < 100) toks.add(t);
}

function norm(css, ds, rootVars = {}) {
  let s = css.replace(/^[^{]+\{/, '{'); // 선택자(클래스명) 차이 제거
  for (let i = 0; i < 8; i++)
    s = s.replace(/var\((--[\w-]+)(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/g, (m, v) => {
      if (v.startsWith('--tw-')) return m;
      return rootVars[v] ?? ds.theme.get([v]) ?? m;
    });
  s = s.replace(/calc\(\s*(-?[\d.]+)(rem|px)\s*\*\s*(-?[\d.]+)\s*\)/g, (m, a, u, n) => `${+(a * (u === 'rem' ? 16 : 1) * n).toFixed(3)}px`);
  s = s.replace(/calc\(\s*(-?[\d.]+)\s*\/\s*(-?[\d.]+)\s*\)/g, (m, a, b) => `${+(a / b).toFixed(4)}`);
  s = s.replace(/(-?[\d.]+)rem\b/g, (m, a) => `${+(a * 16).toFixed(3)}px`);
  s = s.replace(/\b0px\b/g, '0');
  return s.replace(/\s+/g, ' ').trim();
}

const list = [...toks];
const convs = list.map((t) => transformClasses(`"${t}"`).out.slice(1, -1));
const oldCss = oldDs.candidatesToCss(list);
const newCss = newDs.candidatesToCss(convs);
let same = 0;
let renamed = 0;
const diff = [];
const lost = [];
list.forEach((tok, i) => {
  if (!oldCss[i]) return;
  if (!newCss[i]) return lost.push(`${tok} -> ${convs[i]}`);
  const a = norm(oldCss[i], oldDs);
  const b = norm(newCss[i], newDs, NEW_ROOT);
  if (a === b) {
    same++;
    if (tok !== convs[i]) renamed++;
  } else diff.push(`✗ ${tok} -> ${convs[i]}\n   old: ${a.slice(0, 240)}\n   new: ${b.slice(0, 240)}`);
});
console.log(`유효 클래스 ${same + diff.length + lost.length}개: 동일 ${same} (그중 이름 변환 ${renamed}), 다름 ${diff.length}, 변환 후 무효 ${lost.length}`);
if (diff.length) console.log(diff.join('\n'));
if (lost.length) console.log('\n무효:', lost.join(', '));

// 기존엔 무효 → 변환 후 새로 유효해진 토큰 (의도치 않은 스타일 적용 후보 — 클래스로 쓰였는지 확인 필요)
const newlyValid = list
  .map((t, i) => (!oldCss[i] && newCss[i] ? `${t} -> ${convs[i]}: ${norm(newCss[i], newDs, NEW_ROOT).slice(0, 160)}` : null))
  .filter(Boolean);
console.log(`\n새로 유효해진 토큰 ${newlyValid.length}개`);
if (newlyValid.length) console.log(newlyValid.join('\n'));

// EP 색 별칭 런타임 값 대조 (base :root 리터럴 vs 현재 html.dark NDS 토큰)
const vars = (block) => Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim().toLowerCase()]));
const oldRoot = vars(readFileSync(OLD_CSS, 'utf8').split(':root {')[1].split('}')[0]);
const dark = vars(readFileSync('src/styles/nds/color.css', 'utf8').split('.dark {')[1].split('\n}')[0]);
const newRoot = vars(readFileSync('src/app/globals.css', 'utf8').split(':root {')[1].split('}')[0]);
let ok = 0;
const bad = [];
for (const [k, v] of Object.entries(oldRoot)) {
  if (!(k in newRoot)) {
    if (!k.startsWith('--radius')) bad.push(`${k}: 삭제됨`);
    continue;
  }
  let nv = newRoot[k];
  const m = nv.match(/^var\((--[\w-]+)\)$/);
  if (m) nv = dark[m[1]] ?? nv;
  if (nv === v) ok++;
  else bad.push(`${k}: ${v} -> ${nv}`);
}
console.log(`\nEP :root 변수 ${ok + bad.length}개 중 동일 ${ok}`);
if (bad.length) console.log(bad.join('\n'));
