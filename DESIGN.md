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
| `--color-tempest` | `#C45C4A` | Tempest (disaster) | Lane header text + 8px dot |
| `--color-predict` | `#4A9EC4` | Predict (market) | Lane header text + 8px dot |
| `--color-warden` | `#6B8A5E` | Warden (defense) | Lane header text + 8px dot |
| `--color-nexus` | `#C8923A` | Nexus (urban) | Lane header text + 8px dot |
| `--color-core` | `#8A8680` | Core (map+tools) | Core module accents |

Platform colors apply to lane header text and a small 8px dot indicator.
Cards remain `--surface` with `--border` — no colored left-borders.

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

### Homepage Magazine Grid

```
Desktop (>= 1024px):
┌──────────────────────────────────────────────┐
│ Header (sticky, 52px)                        │
├──────────────────────────────────────────────┤
│ Platform Bar (sticky, anchor scroll chips)   │
├──────────────────────────────────────────────┤
│ Hero (Editor's Pick + satellite background)  │
├────────────────────────┬─────────────────────┤
│ Main (2/3)             │ Sidebar (1/3 sticky) │
│ ┌────────────────────┐ │ ┌─────────────────┐ │
│ │ Tempest Lane (2)   │ │ │ Core CTA        │ │
│ │ Predict Lane (CS)  │ │ │                 │ │
│ │ Warden Lane (CS)   │ │ │ EP Original     │ │
│ │ Nexus Lane (CS)    │ │ │ (Daily + Quiz)  │ │
│ └────────────────────┘ │ └─────────────────┘ │
├────────────────────────┴─────────────────────┤
│ Newsletter Strip                             │
│ Footer                                       │
└──────────────────────────────────────────────┘

Mobile (< 768px):
┌──────────────────────┐
│ Header               │
│ Platform Bar (scroll) │
│ Hero                 │
│ Core CTA             │  ← sidebar에서 분해, Hero 바로 아래
│ Tempest Lane         │
│ EP Original          │  ← sidebar에서 분해, Tempest 뒤 삽입
│ Predict Lane (CS)    │
│ Warden Lane (CS)     │
│ Nexus Lane (CS)      │
│ Newsletter           │
│ Footer               │
└──────────────────────┘
```

Breakpoints:
- `< 768px`: single column, sidebar 분해
- `768px–1023px`: single column with wider cards
- `>= 1024px`: 2/3 + 1/3 Magazine Grid

### Platform Bar

Sticky below header. Chips: All / Tempest / Predict / Warden / Nexus / Core.
Click = smooth scroll to lane anchor. No page navigation (MVP에서 3/4 lanes가 Coming Soon).
Mobile: horizontal scroll, 48px minimum touch target.

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
  background: rgba(14, 14, 16, 0.88);
  backdrop-filter: blur(12px);
}
```

Used for header, floating panels, sidebar on scroll.

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
