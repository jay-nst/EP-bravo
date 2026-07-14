# EarthPaper Design System — "Quiet Observatory"

Source of truth: `src/app/globals.css` (CSS custom properties)
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

| Role | Family | Weight | Usage |
|------|--------|--------|-------|
| Display | Pretendard Variable | 600–700 | Headings, hero text |
| Body | Pretendard Variable | 400–500 | Paragraphs, UI labels |
| Mono | IBM Plex Mono | 400–500 | Data, coordinates, timestamps |

- Letter spacing: `-0.2px` globally
- Monospace: `font-feature-settings: 'tnum' 1` for tabular numbers
- Font smoothing: antialiased on all platforms

## Spacing

4px base grid. Use CSS custom properties, not magic numbers.

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

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Chips, small badges |
| `--radius-md` | 8px | Cards, buttons, inputs |
| `--radius-lg` | 12px | Hero sections, modals |

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
- Radius: `--radius-md` (8px)
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

- Map container: `height: 480px`, `border-radius: var(--radius-md)`, `border: 1px solid var(--border)`
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

CSS custom properties map to Tailwind tokens via `@theme inline` in globals.css.
Use Tailwind classes (`bg-surface`, `text-accent`, `border-border`) instead of
raw CSS variables in components.

```
bg-bg, bg-surface, bg-surface-elevated
text-text-primary, text-text-muted
text-accent, text-accent-hover
border-border
bg-success, bg-warning, bg-error
```
