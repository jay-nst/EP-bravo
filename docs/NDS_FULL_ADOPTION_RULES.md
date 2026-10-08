# NDS 전면 적용 규칙 (색 제외)

2026-10-08 사용자 결정: "색 제외하고 싹다 한번에 NDS 로". 이 문서는 그 변환의 단일 기준이다.
NDS 원본 문서·예제가 이 문서보다 우선한다 — 애매하면 해당 컴포넌트의 `*.docs.mdx` / `*.examples.tsx` 를 따른다.

## 0. 대원칙

1. **NDS 문서·예제 anatomy 그대로.** 기존 화면 구조에 NDS 부품을 끼워 맞추지 않는다. 참조 구현: `src/components/shared/LeadCaptureModal.tsx`
2. **색은 바꾸지 않는다.** 팔레트(EP Quiet Observatory) 유지. 단, 같은 값의 NDS 토큰 클래스로 바꾸는 것은 허용·권장
   (`var(--text)`→`text-text-primary`, `var(--text-muted)`→`text-text-tertiary`, `var(--surface)`→`bg-bg-secondary`,
   `var(--bg)`→`bg-bg-tertiary`, `var(--surface-elevated)`→`bg-bg-primary`, `var(--border)`→`*-border-tertiary`,
   `var(--accent)`→`*-interactive-primary`). 플랫폼 색 hex(`#C45C4A` 등)·지도/차트 데이터 색은 그대로 둔다.
3. **NDS 컴포넌트에는 색·크기 커스텀 금지.** `className`/`style` 로 NDS 컴포넌트의 색·폰트·radius 를 덮지 않는다
   (레이아웃 — 폭, margin, 위치 — 만 허용). 플랫폼 색 CTA 도 NDS 기본 `solid`.
4. **인라인 style 은 Tailwind(NDS 토큰) 클래스로.** 남겨도 되는 것: 동적 값(계산된 위치·폭·퍼센트·애니메이션 진행),
   데이터 기반 색(플랫폼/지도/차트), 이미지 좌표 정합(튜토리얼 캡쳐 오버레이).
5. **간격 단위는 1px** (`p-16`=16px). 인라인 `padding: 16` → `p-16`.
6. 동작·문구·데이터·props 인터페이스는 바꾸지 않는다. 시각 표현만 바꾼다.

## 1. 타이포그래피

NDS 스케일만 쓴다. 클래스 하나가 크기·줄높이·굵기·자간을 모두 정한다 → 같이 붙은 `font-*`(굵기), `leading-*`,
`tracking-*`, 인라인 `fontWeight`/`lineHeight`/`letterSpacing` 은 **제거**.

| 원래 크기 (Tailwind / 인라인 px) | 굵기 | NDS 클래스 |
|---|---|---|
| ≤12px, `text-xs`, `text-[10px]`·`[11px]` | 모두 | `text-body-xs-regular` |
| 13–14px, `text-sm` | ≤400 | `text-body-sm-regular` |
| 13–14px, `text-sm` | ≥500 | `text-body-sm-medium` |
| 15–16px, `text-base` | ≤400 / ≥500 | `text-body-md-regular` / `text-body-md-medium` |
| 17–18px, `text-lg` | ≤500 | `text-body-lg-regular` / `text-body-lg-medium` |
| 17–19px | ≥600 (제목) | `text-heading-lg` |
| 20–21px, `text-xl` | 모두 | `text-heading-xl` |
| 22–23px | 모두 | `text-heading-2xl` |
| 24–31px, `text-2xl`, `text-3xl` | 모두 | `text-heading-3xl` |
| 32–47px, `text-4xl` | 모두 | `text-display-md` |
| ≥48px, `text-5xl`+ | 모두 | `text-display-lg` |

- **mono 폰트 제거:** `font-mono`, `fontFamily: 'IBM Plex Mono'…`, `var(--font-mono)` → 삭제 (NDS 에 mono 없음, Pretendard).
  숫자 정렬이 필요한 데이터(수치·좌표·시간)는 `tabular-nums` 추가.
- 대문자 eyebrow 라벨의 `uppercase` + 자간은 제거하고 `text-body-xs-regular text-text-tertiary` 로.
- 제목 태그(h1~h3)는 그대로 두고 클래스만 NDS 로.

## 2. 아이콘

NDS 아이콘(`@naraspace-technology/nds/icons`, 313종 — 목록은 작업 지시의 `_icons.txt`)만 쓴다.

| 문자/의미 | NDS |
|---|---|
| `×` `✕` 닫기 | `IconX` |
| `→` `⟶` / `←` | `IconArrowRight` / `IconArrowLeft` |
| `↗` 외부 링크 | `IconArrowUpRight` (또는 `IconExternalLink`) |
| `✓` | `IconCheck` |
| `›` `▸` / `▾` / `‹` | `IconChevronRight` / `IconChevronDown` / `IconChevronLeft` |
| `●` 상태 점 | `<Badge type="dot" status=… />` 또는 StatusChip |
| 장식용 `◆` 등 | 제거 |

- 인라인 `<svg>`: 의미가 같은 NDS 아이콘이 있으면 교체 (검색·닫기·메뉴·화살표·정보·위치·레이어·위성·다운로드…).
  로고·일러스트·지도/차트 그래픽은 그대로.
- 크기: 본문 옆 `size-16`, 버튼 안은 Button 이 정함(지정 금지), 독립 아이콘 `size-20`/`size-24`. 색은 `text-icon-*` 토큰.
- 아이콘만 있는 버튼은 `<Button iconOnly aria-label="…">`.

## 3. 모서리·테두리·표면

NDS radius: `xs` 4 · `sm` 8 · `md` 16 · `lg` 24 · `xl` 32 · `full`.

| 대상 | NDS |
|---|---|
| 카드·패널·모달·섹션 박스 등 **표면** | NDS Card 와 같은 표면: `rounded-lg bg-bg-tertiary inset-ring-1 inset-ring-border-tertiary` (가능하면 `Card` 컴포넌트) |
| 표면 안의 작은 박스·썸네일 | `rounded-md` |
| 칩·태그·작은 버튼 같은 요소 | `rounded-full` (NDS Badge/StatusChip 이면 컴포넌트가 정함) |
| 그 외 남는 radius | 가장 가까운 NDS 값: ≤5→`xs`, 6–11→`sm`, 12–19→`md`, 20–27→`lg`, ≥28·999·50%→`full` |
| `border: 1px solid var(--border)` 표면 테두리 | `inset-ring-1 inset-ring-border-tertiary` |
| 구분선 (`borderTop/Bottom`) | `<Separator />` 또는 `border-t border-border-tertiary` |
| 강조/hover 테두리 | `inset-ring-border-interactive-primary(-hover)` |
| 그림자 | NDS `shadow-2/4/6/8/16` (Tailwind `shadow-lg` 등은 가장 가까운 NDS 단계로) |

`rounded-[6px]`, `rounded-[12px]` 같은 임의 radius 는 남기지 않는다.

## 4. 컴포넌트

| 기존 | NDS | 메모 |
|---|---|---|
| `<button>` | `Button` | 주요 액션 `solid`, 보조 `outline`, 도구·링크성 `text`. 기본 `size="md"`, 히어로 CTA `lg`, 밀집 패널 `sm`. 로딩은 `loading` |
| 버튼처럼 생긴 `<Link>`/`<a>` | `<Button render={<Link href=… />} nativeButton={false}>` | |
| `<input>` `<textarea>` `<select>` | `Input` `Textarea` `Select` + `Field` | LeadCaptureModal 패턴. 범위 슬라이더(`type=range`)는 유지 |
| 토글/체크 | `Switch` / `Checkbox` | |
| 모달·오버레이 | `Dialog` (파괴적 확인은 `AlertDialog`) | Title→Description→본문→SubDescription→Footer(Cancel+Action), × 없음 |
| LIVE/DEMO/상태 라벨 | `StatusChip` (상태 의미) 또는 `Badge` (수량·짧은 표시) | status 는 의미대로: LIVE→success, DEMO→neutral, 분석/통계→information |
| 스피너 / 펄스 스켈레톤 | `Spinner` / `Skeleton.Group` + `Skeleton.Item` | |
| 탭 UI | `Tabs` | 링크 이동이면 Tabs 아님 |
| 카드 묶음 | `Card` (Root/Image/Body/Title/Subtitle/Content, 링크면 `interactive` + `render`) | |
| 구분선 | `Separator` | |

NDS 에 없는 것은 기존 유지 + 위 1~3 규칙만 적용: 범위 슬라이더, 드롭다운 메뉴/팝오버(알림 벨), Mapbox 컨트롤, 차트/지도 그래픽.

## 5. 이번 패스 제외 (다른 세션이 작업 중)

`src/app/(main)/warden/**`, `src/app/(main)/climate/**`, `src/components/warden/**`, `src/components/climate/**`
— CSS 모듈 기반 랜딩, 2026-10-08 현재 다른 세션이 활발히 수정 중. 끝난 뒤 같은 규칙으로 별도 적용.

## 7. 역할 기반 재정의 (2차 패스, 2026-10-08) — §1·§0-2 보다 우선

1차 패스는 "예전 크기·색 → 가장 가까운 NDS 값"으로 옮겨서, NDS 컴포넌트 옆에 EP식 위계(작은 eyebrow 섹션 제목,
플랫폼 색 텍스트)가 남아 화면이 섞여 보였다 (사용자 지적: citadel "서비스 영역", "연소 범위 시계열 분석").
2차 패스는 **예전 값이 아니라 요소의 역할**로 NDS 스타일을 정한다.

### 7-1. 텍스트 위계 (역할 → 클래스, 예전 크기 무시)

| 역할 | 클래스 | 색 |
|---|---|---|
| 페이지 제목 (h1, 히어로) | `text-heading-3xl md:text-display-md` | `text-text-primary` |
| 섹션 제목 (h2 — 예전 eyebrow+밑줄 라벨 포함) | `text-heading-2xl` | `text-text-primary` |
| 섹션 설명 (제목 아래 한두 줄) | `text-body-md-regular` | `text-text-secondary` |
| 카드·블록 제목 (h3) | `text-heading-lg` (Card 면 `Card.Title`) | `text-text-primary` |
| 소제목·필드 그룹 라벨 (h4) | `text-body-md-medium` | `text-text-primary` |
| 본문 | `text-body-md-regular` (밀집 UI·패널은 `text-body-sm-regular`) | `text-text-secondary` |
| 강조 수치·핵심 값 | `text-body-sm-medium` / 큰 지표는 `text-heading-xl` + `tabular-nums` | `text-text-primary` |
| 메타·캡션·출처·타임스탬프 | `text-body-xs-regular` | `text-text-tertiary` |
| 패널 내부 그룹 라벨 (사이드바 "레이어" 등, 제목이 아닌 것) | `text-body-sm-medium` | `text-text-secondary` |

- **eyebrow(제목 위 작은 라벨) 를 섹션 제목처럼 쓰던 곳 → 진짜 h2 섹션 제목**(`text-heading-2xl`)으로 승격. 밑줄 장식은 제거
  (섹션 구분이 필요하면 섹션 간 여백 또는 `<Separator />`).
- 제목 위에 붙은 kicker(“EarthPaper · Platform” 등)는 NDS `Badge`/`StatusChip`(neutral) 로, 아니면 제거.
- 같은 페이지에서 같은 역할은 같은 클래스 — 섹션마다 제목 크기가 다르면 안 된다.

### 7-2. 텍스트 색 = NDS 텍스트 토큰만

- 글자 색은 `text-text-primary/secondary/tertiary/disabled`, `text-text-interactive-*`, `text-status-*` 만.
  **플랫폼 hex(#C45C4A·#4A9EC4·#3D5A80·#C8923A·#6B8A5E 등)를 글자 색으로 쓰지 않는다** (사용자 결정, §0-2 대체).
  의미가 있는 수치(위험·경고·성공)는 `text-status-danger/warning/success`, 그 외는 primary.
- 링크·강조 텍스트는 `text-text-interactive-primary`.
- 플랫폼 색이 남아도 되는 곳: 지도·차트·범례·데이터 시각화의 색, 플랫폼을 나타내는 작은 점/마크(로고 dot, 범례 swatch),
  일러스트 배경. 그 외 배경 틴트(`${color}15` 같은 hex+alpha 박스)도 제거하고 NDS 표면으로.
- 같은 이유로 `rgba(27,191,168,x)` 같은 액센트 임의 틴트는 `bg-bg-interactive-selected`·`bg-status-*-subtle` 등 NDS 토큰으로.

### 7-3. 점검 방법

작업 후 각 파일에서 다음이 0 이어야 한다 (데이터 시각화 예외만 허용):
`grep -nE "color: ?'#|style=\{\{[^}]*color|text-\[#|bg-\[#|rgba\(" <file>` — 남는 줄은 데이터 시각화임을 주석으로 표시.

## 6. 검증

- `npx tsc --noEmit`, 관련 vitest, `npx eslint <파일>` (기존 오류 7건 외 증가 없음)
- 동작 회귀가 없도록 핸들러·조건부 렌더·데이터 흐름은 그대로
- 최종: `next build`, :3001 미리보기 육안 확인
