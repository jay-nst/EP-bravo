# EarthPaper Design System — "Quiet Observatory"

Source of truth: `src/styles/nds/*.css` (NDS 토큰, EarthPaper 값) + `src/app/globals.css`
Foundation: [NDS — Naraspace Design System](https://github.com/Naraspace-Technology/nds) (`@naraspace-technology/nds`).
색은 Quiet Observatory 팔레트를 그대로 유지하고, 토큰 이름·간격·radius·컴포넌트는 NDS 를 따른다.
마이그레이션 규칙·색 매핑: `docs/NDS_MIGRATION.md`
Aesthetic: dark-first observatory — data-dense but calm, professional but not sterile.

## Color

### Core Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#0E0E10` | Page background |
| `--surface` | `#1A1A1F` | Card, panel background |
| `--surface-elevated` | `#242429` | Hover states, elevated panels |
| `--text` | `#E8E4DF` | Primary text (warm off-white) |
| `--text-muted` | `#8A8680` | Secondary text, captions |
| `--accent` | `#1bbfa8` | Primary CTA, links, focus rings |
| `--accent-hover` | `#35d9c0` | Hover state for accent elements |
| `--secondary` | `#5B8C6F` | Secondary actions |
| `--border` | `#2A2A2F` | Dividers, card borders |

### Semantic

| Token | Hex | Usage |
|-------|-----|-------|
| `--success` | `#4A9E6B` | Positive feedback |
| `--warning` | `#C8923A` | Warnings, attention |
| `--error` | `#C45C4A` | Error states, destructive |

### Platform Colors

| Token | Hex | Platform | Usage |
|-------|-----|----------|-------|
| `--color-citadel` | `#C45C4A` | Citadel (disaster + urban) | Section accent, severity badge |
| `--color-predict` | `#4A9EC4` | Predict (asset/finance) | Section accent |
| `--color-warden` | `#6B8A5E` | Warden (climate/compliance) | Section accent |
| `--color-northpaper` | `#3D5A80` | Northpaper (defense/security) | Section accent |
| `--color-nexus` | `#C8923A` | Nexus (data market) | Section accent |
| `--color-core` | `#8A8680` | Core (map+tools) | Core module accents |

Platform colors apply to section headers, severity badges, and hover borders on linked cards.
Cards remain `--surface` with `--border` — hover shows platform-colored border.

### Light Mode

Opt-in via `class="light"` on `:root`. Not used in MVP.

## Typography

Pretendard Variable 단일 서체 + **NDS 타이포 스케일만** 사용 (크기·줄높이·굵기·자간이 클래스 하나에 포함 — font-weight/leading/tracking 덧붙이지 않음).
mono 서체 없음 (NDS 에 없음, IBM Plex Mono 제거 2026-10-08) — 숫자 정렬은 `tabular-nums`.

| Class | Size / line | Weight | Usage |
|---|---|---|---|
| `text-display-lg` / `-md` | 52(60)/64 · 44(52)/56 | 400 | 히어로 |
| `text-heading-3xl` · `-2xl` · `-xl` · `-lg` | 24(28) · 22(24) · 20 · 18 | 600 | 제목 (괄호는 sm 이상) |
| `text-body-lg-*` · `-md-*` · `-sm-*` | 18 · 16 · 14 | 400 regular / 500 medium | 본문·UI |
| `text-body-xs-regular` | 12/16 | 400 | 캡션·eyebrow·메타 |

- Letter spacing: `-0.2px` (스케일에 포함)
- 변환 기준: docs/NDS_FULL_ADOPTION_RULES.md §1
- Font smoothing: antialiased on all platforms

## Spacing

4px base grid. Use CSS custom properties, not magic numbers.

> **NDS: Tailwind 간격 단위가 1px 이다** (`--spacing: 0.0625rem`). `p-16` = 16px, `gap-8` = 8px.
> 기존 Tailwind 습관(`p-4` = 16px)으로 쓰면 1/4 크기가 된다.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-2xs` | 2px | Tight internal padding |
| `--space-xs` | 4px | Icon gaps, chip padding |
| `--space-sm` | 8px | Card internal padding |
| `--space-md` | 16px | Section gaps, card padding |
| `--space-lg` | 24px | Between sections |
| `--space-xl` | 32px | Major section breaks |
| `--space-2xl` | 48px | Page section spacing |
| `--space-3xl` | 64px | Hero/footer spacing |

## Radii

NDS radius 스케일 (`rounded-xs` ~ `rounded-xl`). Tailwind 기본과 이름이 같고 값이 다르니 주의.

| Token / class | Value | Usage |
|-------|-------|-------|
| `--radius-xs` / `rounded-xs` | 4px | Chips, small badges |
| `--radius-sm` / `rounded-sm` | 8px | Cards, buttons, inputs |
| `rounded-[12px]` | 12px | Hero sections, modals (NDS 스케일 밖 — EP 유지값) |
| `--radius-md` / `rounded-md` | 16px | NDS 컴포넌트 |
| `--radius-lg` / `rounded-lg` | 24px | NDS 컴포넌트 (Input 등) |
| `--radius-xl` / `rounded-xl` | 32px | NDS 컴포넌트 |

## Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-micro` | 80ms | Tooltip show/hide |
| `--duration-short` | 200ms | Button hover, card hover |
| `--duration-medium` | 350ms | Panel open/close, page transitions |
| `--ease-enter` | ease-out | Elements appearing |
| `--ease-exit` | ease-in | Elements disappearing |
| `--ease-move` | ease-in-out | Position changes |

Respect `prefers-reduced-motion`: skip animations, keep opacity transitions.

## Layout

| Token | Value |
|-------|-------|
| `--header-height` | 52px |
| `--panel-width` | 280px |

### Homepage — Bloomberg Editorial Magazine Layout

실제 구현: `DashboardClient.tsx` (단일 파일, 서버 데이터 없이 클라이언트 렌더링)

```
Desktop (>= 1024px):
┌──────────────────────────────────────────────┐
│ Header (sticky, 52px)                        │
├──────────────────────────────────────────────┤
│ Breaking Strip (최신 critical/high 1건 정적) │
├──────────────────────────────────────────────┤
│ Hero (Editor's Pick, inline CSS bg image)    │
├──────────────────────────────────────────────┤
│ Live Feed (auto-scroll, rAF, mouseenter pause│
│  10개 큐레이션 카드, 외부/내부 링크 분기)     │
├──────────────────────────────────────────────┤
│ YouTube Shorts (8개, thumbnail-first lazy)   │
├────────────────────────┬─────────────────────┤
│ Main Content (2/3)     │ Sidebar (1/3)        │
│ ┌────────────────────┐ │ ┌─────────────────┐ │
│ │ Citadel 리포트     │ │ │ EP Original     │ │
│ │ Predict 리포트     │ │ │ (뉴스 3건)      │ │
│ │ Warden 리포트      │ │ │                 │ │
│ │ Northpaper 리포트  │ │ │ 인기 콘텐츠     │ │
│ └────────────────────┘ │ └─────────────────┘ │
├────────────────────────┴─────────────────────┤
│ Footer                                       │
└──────────────────────────────────────────────┘
```

Key decisions:
- Breaking Strip: 정적 1건 (Live Feed 자동스크롤과 애니메이션 겹침 방지)
- Live Feed: `requestAnimationFrame` 기반 auto-scroll, `mouseenter`로 정지
- ep.naraspace.com 링크: `/ko/` 프리픽스 (한국어 사이트)
- Predict CTA: predicthings.com 외부 링크
- 플랫폼 리포트 카드: hover 시 platform-colored border 효과

## Components

### Cards

- Background: `--surface`
- Border: 1px solid `--border`
- Radius: `--radius-sm` (8px)
- Hover: border-color transitions to `--text-muted` over `--duration-short`
- No colored borders, no shadows. Platform identity via lane header, not card chrome.

### Coming Soon Card (Branded Teaser)

- Background: platform color at 5% opacity over `--surface`
- Platform name in platform color (bold)
- 1-line description in `--text-muted`
- "Notify me" CTA in `--accent`
- Same card radius and border as regular cards

### Loading Skeleton (Shimmer)

- Maintain 2/3 + 1/3 grid during loading
- Shimmer: linear-gradient sweep animation on `--surface` → `--surface-elevated`
- Duration: `--duration-medium` per sweep cycle

### Error States (Core Map)

Three error types, each with specific messaging:
1. **Mapbox token missing**: "지도를 불러올 수 없습니다" + static fallback image
2. **GeoJSON load failure**: "데이터를 불러오는 중 문제가 발생했습니다" + retry button
3. **Network error**: "네트워크 연결을 확인해 주세요" + retry button

All error states show a static satellite image fallback.

### Glass Effect

```css
.glass-panel {
  background: var(--panel-bg); /* rgba(14, 14, 16, 0.88) */
  backdrop-filter: blur(12px);
}
```

Used for header, floating panels, sidebar on scroll, simulator overlays.

### Simulator Panel (Platform Pages)

Interactive map + floating glass overlay. 3-phase state machine (draw → analyzing → result).

- Map container: `height: 480px`, `border-radius: var(--radius-sm)` (8px), `border: 1px solid var(--border)`
- Overlay panel: `position: absolute`, `top: 12px`, `right: 12px`, `width: 280px`
- Panel background: `var(--panel-bg)` + `backdrop-filter: blur(12px)`
- Section title: IBM Plex Mono, 13px, uppercase, `--text-muted`
- Panel title: Pretendard, 16px/600, `--text`
- Result rows: label (IBM Plex Mono 12px, `--text-muted`) + value (14px/500, `--text` or semantic color)
- Action button: 100% width, platform color background, white text, 14px/500, opacity hover (0.85)
- Spinner: 32px circle, `border-top-color` = platform color, 1s linear infinite
- Disclaimer: IBM Plex Mono, 12px, `--text-muted`, below map

## Accessibility

- Focus visible: 2px solid `--accent`, 2px offset
- Touch targets: minimum 48px on mobile
- Color contrast: `--text` on `--bg` = 14.5:1 (AAA)
- Reduced motion: honor `prefers-reduced-motion`
- Scrollbar: 6px width, subtle `--border` color

## Tailwind v4 Integration

**신규 코드는 NDS 토큰 클래스를 쓴다** (`bg-bg-secondary`, `text-text-tertiary`, `border-border-tertiary`,
`bg-bg-interactive-primary`, `text-body-sm-medium`, `shadow-6` …). 공통 UI 는 NDS 컴포넌트
(`@naraspace-technology/nds/components`) 를 먼저 찾는다.

| EP (레거시 별칭) | NDS 토큰 |
|---|---|
| `--bg` / `bg-bg` | `--bg-tertiary` |
| `--surface` / `bg-surface` | `--bg-secondary` |
| `--surface-elevated` | `--bg-primary` |
| `--text` / `text-text-primary` | `--text-primary` |
| `--text-muted` / `text-text-muted` | `--text-tertiary` |
| `--accent` / `--accent-hover` | `--bg-interactive-primary` / `-hover` |
| `--border` / `border-border` | `--border-tertiary` |
| `--success` / `--warning` / `--error` | `--status-success` / `--status-warning` / `--status-danger` |

기존 EP 클래스/변수는 위 NDS 토큰을 가리키는 별칭으로 계속 동작한다 (2·3단계에서 점진 교체).
Tailwind 기본 글자 크기(`text-sm` 등)·그림자(`shadow-lg` 등)·브레이크포인트(md 768)는 호환을 위해 유지.

레거시 클래스 목록:

```
bg-bg, bg-surface, bg-surface-elevated
text-text-primary, text-text-muted
text-accent, text-accent-hover
border-border
bg-success, bg-warning, bg-error
```
