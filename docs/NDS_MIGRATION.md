# NDS 마이그레이션

EarthPaper 를 [NDS — Naraspace Design System](https://github.com/Naraspace-Technology/nds)
(`@naraspace-technology/nds`, React 19 + Base UI + Tailwind v4) 기반으로 옮기는 작업 기록.

## 결정 (2026-10-08)

| 항목 | 결정 |
|---|---|
| 범위 | 앱 전체 |
| 색 | **EarthPaper "Quiet Observatory" 색 유지** — NDS 토큰 구조에 EP 값을 채움 (Agent EP 네이비/민트 룩 아님) |
| 진행 | 단계적: 1) 토큰·인프라 (화면 변화 없음) → 2) 공통 UI 를 NDS 컴포넌트로 → 3) 페이지별 마무리 |
| 작업 위치 | `feat/nds-migration` 브랜치 (별도 worktree) — 진행 중이던 /warden 작업과 충돌 회피 |

## 설치

NDS 는 GitHub Packages(비공개)로 배포된다.

1. 개인 토큰 (`read:packages`) 을 **사용자 전역** `~/.npmrc` 에 등록 — 프로젝트에 넣지 않는다
   ```bash
   gh auth refresh -h github.com -s read:packages
   npm config set //npm.pkg.github.com/:_authToken $(gh auth token)
   ```
2. 프로젝트 `.npmrc` (커밋됨, 토큰 없음): `@naraspace-technology:registry=https://npm.pkg.github.com/`
3. `npm install` — `@naraspace-technology/nds` + peer (`@base-ui/react`, `class-variance-authority`, `tw-animate-css`, `date-fns`)

> ⚠ **`npx @naraspace-technology/nds init` 을 쓰지 않는다.** `src/app/globals.css` 의 기존 내용을
> 전부 지우고 NDS import 로 대체한다. 대신 아래 구성을 수동으로 유지한다.

배포 서버도 `npm install` 시 같은 토큰이 필요하다 (서버의 `~/.npmrc`).

## CSS 구성

`src/app/globals.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@naraspace-technology/nds/tailwind.css";   /* --spacing 1px, z-index, NDS 컴포넌트 @source */
@import "../styles/nds/color.css";
@import "../styles/nds/typography.css";
@import "../styles/nds/breakpoint.css";
@import "../styles/nds/radius.css";
@import "../styles/nds/shadow.css";
```

`src/styles/nds/*.css` 는 NDS 의 커스터마이즈 대상 파일(`dist/theme/*.css`)을 복사해 수정한 것이다.
NDS 를 업데이트하면 원본과 diff 를 떠서 새 토큰을 반영한다.

| 파일 | NDS 원본 대비 수정 |
|---|---|
| `color.css` | 값 → EP 팔레트 (아래 표). `--color-*: initial` 과 `--color-white/black` 재정의 **제거** — Tailwind 기본 팔레트(`text-white`, `bg-black/50` …)와 EP 색 클래스 유지 |
| `typography.css` | 원본 + Tailwind 기본 `text-xs`~`text-9xl` 재등록 (원본의 `--text-*: initial` 이 지움, 기존 ~400곳) |
| `shadow.css` | 원본 + Tailwind 기본 `shadow`, `shadow-2xs`~`2xl` 재등록 |
| `breakpoint.css` | NDS(sm 768/md 992/lg 1200) 대신 **Tailwind 기본**(sm 640/md 768/lg 1024/xl 1280/2xl 1536) — 기존 `md:` 반응형 ~120곳 유지 |
| `radius.css` | 원본 그대로 (xs 4 / sm 8 / md 16 / lg 24 / xl 32) — 기존 클래스는 코드모드로 변환 |

## 색 매핑 (dark = 실제 화면, html 에 `.dark` 고정)

| NDS 토큰 | 값 | 출처 |
|---|---|---|
| `--bg-tertiary` | `#0e0e10` | EP `--bg` |
| `--bg-secondary` | `#1a1a1f` | EP `--surface` |
| `--bg-primary` | `#242429` | EP `--surface-elevated` |
| `--text-primary` | `#e8e4df` | EP `--text` |
| `--text-secondary` | `#b8b3ad` | 파생 (text ↔ muted 보간) |
| `--text-tertiary` | `#8a8680` | EP `--text-muted` |
| `--text-disabled` | `#5f5c58` | 파생 |
| `--bg/text/border-interactive-primary` | `#1bbfa8` | EP `--accent` |
| `…-primary-hover` | `#35d9c0` | EP `--accent-hover` |
| `--border-tertiary` | `#2a2a2f` | EP `--border` |
| `--border-secondary` / `--border-primary` | `#3a3a40` / `#5f5c58` | 파생 |
| `--border-focus-ring` | `#1bbfa8` | EP `:focus-visible` (accent) |
| `--status-success/warning/danger` | `#4a9e6b` / `#c8923a` / `#c45c4a` | EP semantic |
| `--status-info` | `#4a9ec4` | EP `--color-predict` |
| `--status-*-bold/-subtle` | NDS 기본 | — |
| `--chart-100…700` | 민트 스케일 | accent 기반 |

라이트(`:root`) 값도 EP light 모드 팔레트로 채웠다 (현재 화면에선 쓰이지 않음).

EP 의 기존 변수(`--bg`, `--surface`, `--text`, `--text-muted`, `--accent`, `--border`, `--success` …)는
`globals.css` `:root` 에서 위 NDS 토큰을 가리키는 **별칭**으로 남겼다 — 기존 ~1,200곳 그대로 동작.
EP `--radius-sm/md/lg` 는 NDS 와 이름이 겹쳐 제거했다 (사용처는 코드모드로 변환).

## 코드모드 — `scripts/nds-codemod.mjs`

| 규칙 | 예 |
|---|---|
| 간격 유틸리티 숫자 ×4 (NDS `--spacing` 1px) | `p-4`→`p-16`, `md:gap-1.5`→`md:gap-6`, `-mt-1`→`-mt-4`, `max-w-80`→`max-w-320` |
| radius: 같은 px 의 NDS 이름 | `rounded`/`rounded-sm`→`rounded-xs`, `rounded-md`→`rounded-[6px]`, `rounded-lg`→`rounded-sm`, `rounded-xl`→`rounded-[12px]`, `rounded-2xl`→`rounded-md` (방향 `rounded-t-*` 등 포함) |
| EP radius 변수 | `var(--radius-sm)`→`var(--radius-xs)`, `var(--radius-md)`→`var(--radius-sm)`, `var(--radius-lg)`→`12px` |
| 그대로 | `0`, 분수(`w-1/2`), 키워드(`w-full`), 임의값(`w-[300px]`), `px`, 주석 안 텍스트 |

> ⚠ **멱등이 아니다.** 이미 변환된 파일에 다시 돌리면 ×16 이 된다.
> 변환 안 된 코드(예: 마이그레이션 브랜치 이후 master 에 들어온 파일)에만 적용한다:
> ```bash
> node scripts/nds-codemod.mjs --dry <file...>     # 미리보기
> node scripts/nds-codemod.mjs <file...>
> ```
> 단위 테스트: `scripts/nds-codemod.test.ts`

`globals.css` 의 `a[class*="rounded-lg"]` 카드 hover 셀렉터도 변환 후 이름(`rounded-sm`, `rounded-[12px]`)으로 바꿨다.

## 검증 — `scripts/nds-verify.mjs`

```bash
node scripts/nds-verify.mjs <변환 전 커밋>
```

변환 전 커밋의 테마 + 원본 클래스 vs 현재 NDS 테마 + 코드모드 결과를 Tailwind 디자인 시스템
(`@tailwindcss/node`)으로 클래스마다 CSS 를 뽑아 비교한다 (var·calc·rem 을 px 로 정규화).

1단계 결과 (base `edc415f`):
- 유효 클래스 387개 중 **384 동일** (이름이 바뀐 167개 포함), 변환 후 무효 0
- 다름 3: `delay-100/150/200` — `tw-animate-css` 가 `animation-delay` 를 추가. 사용처 3곳 모두
  transition 전용(애니메이션 없음)이라 화면 영향 없음
- 새로 유효해진 토큰 5개 — 모두 주석/비클래스 단어 (`paused`, `running`, 주석 속 `shadow-6` 등)
- EP `:root` 색·레이아웃 변수 40개 전부 동일 값

자동 검증이 다루지 않는 것: 브라우저 렌더링 자체 → 배포 후 육안 확인.

## 다음 단계

- **2단계** — 공통 UI 를 NDS 컴포넌트로 교체 (Button, Input, Badge, Dialog, Tooltip, Tabs …).
  `<body>` 안에 `<div className="isolate">` 포털 래퍼 추가 (NDS README). 지도 상단바 수제 재현
  (`BeforeAfterSlider` `MapTopBars`) → NDS `Badge`/`Input`/`Button`/아이콘.
- **3단계** — 페이지별: 인라인 style·EP 별칭·Tailwind 기본 글자 크기를 NDS 토큰/타이포 스케일로.
  다 옮기면 EP 별칭과 typography/shadow 재등록 블록 제거.
