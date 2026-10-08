# Design: 위성영상 구매 튜토리얼 — 기획 시연 페이지

작성 2026-10-08 · 브랜치 `feat/order-tutorial` (base `feat/nds-phase2` 08a99d3) · 라우트 `/proposals/order-tutorial`
선행 작업: Agent 튜토리얼 (`docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md`) — 구조·연출 방식을 그대로 따른다.

## 무엇을 만드나

map.ep.naraspace.com/ko/order-imagery 의 위성영상 구매 흐름을, 실화면 캡쳐 위에서 하이라이트 + 말풍선으로
따라 누르게 하는 클릭형 데모. 끝에서 가입 모달로 넘어간다. Agent 튜토리얼과 같은 "승인용 시연 페이지"다.

## 사용자 결정 (2026-10-08)

| 항목 | 결정 |
|---|---|
| 영상 | SpaceEye-T 기준 |
| 디자인 | NDS 적용 (데모 크롬은 NDS 컴포넌트·토큰, 모달은 NDS 참조 패턴 `LeadCaptureModal`) |
| 카피 | AI 티 안 나게 — 실서비스 문구·수치 그대로, 과장·감탄 없음 |
| 범위 | 첫 스텝에서 Archive / Tasking 분기 |
| 화면 | 실서비스 캡쳐 (DOM 재현은 실서비스 반영이 안 된다는 이유로 기각) |
| 캡쳐 방법 | 이번만 browse 허용 (사용 후 bun·Chromium 정리 완료) |
| Tasking 궤도 화면 | 실서비스 궤도 조회가 빈 결과라 **번들 소스 기반 DOM 재현** + "예시 일정" 표시 |
| 작업 위치 | NDS 마이그레이션 커밋 후 새 브랜치 (별도 worktree `earthpaper-order-tutorial`) |

## 캡쳐 시나리오 (비로그인, 1600×1000)

- **Archive**: 후쿠오카 도심 AOI 27.82 km² (GeoJSON 업로드로 지정 — 합성 드래그는 지도 그리기 도구가 받지 않음),
  기간 2025.01.01–2026.10.08, 필터 초고해상도 → SpaceEye-T 2026.05.31 (구름 0%, $15/km² → 프로모션 $10/km²,
  결제 금액 $278.20). 장면 선택 시 지도에 깔리는 영상은 실서비스 미리보기 그대로.
  - 최근 3개월 기본 기간에는 후쿠오카 장면이 없다 (SpaceEye-T 아카이브 대부분이 개성·해주 일대).
- **Tasking**: 후쿠오카 하카타항 지점 (33.60292°N 130.40107°E). `POST tasking/orbits` 가 서울·후쿠오카 모두
  `{"assignedOrbitInfoList":[]}` → "해당 조건으로 촬영 가능한 일정이 없습니다." 이후 화면은 캡쳐 불가.
- 로그아웃 상태에서도 구매 시트까지 열린다. `결제하기`부터 로그인 필요 (튜토리얼은 여기서 가입 모달).

## 흐름 (분기 + 트랙별 6스텝 + 가입 = 진행 표시 8칸)

| # | Archive | Tasking |
|---|---|---|
| 1 | 분기: Archive / Tasking 탭 | (같음) |
| 2 | 사각형 영역 선택 → AOI 그려지는 연출 | 위치 선택 → 지점 핑 연출 |
| 3 | 필터 → 실캡쳐 프레임(팝오버 → 초고해상도 체크) → 결과 | 시뮬레이션 확인하기 → 스켈레톤 대기 |
| 4 | 장면 카드 동그라미 선택 | 궤도 카드 (본문 클릭 = 지도 미리보기, 동그라미 = 구매 대상) |
| 5 | 구매하기 (지도 위 실제 영상 스포트라이트) | 구매하기 (1 Scene · $1,800) |
| 6 | 구매 전 안내 체크 | 구매 전 안내 체크 |
| 7 | 결제하기 → 가입 모달 | 결제하기 → 가입 모달 |

스텝 수는 Agent 튜토리얼과 같은 소프트 상한(6)을 트랙마다 지킨다 — 테스트가 고정한다.

## 구현

| 파일 | 역할 |
|---|---|
| `src/lib/order-tutorial-steps.ts` | 스텝 스펙 (실구현 핸드오프 원형). 좌표는 라이브 DOM 실측 px → `px()` 로 % 변환 |
| `src/components/proposals/OrderTutorialDemo.tsx` | driver.js 투어, 분기(트랙 선택 시 driver 재생성), 연출 타임라인, 캡쳐 버튼·스포트라이트 portal |
| `src/components/proposals/TaskingSim.tsx` | Tasking 재현 레이어 + 지도 궤도·5분 타이머 레이어 |
| `src/components/proposals/OrderSignupModal.tsx` | NDS Dialog 가입 모달 (완주 시에만 주문 요약) |
| `src/app/(main)/proposals/order-tutorial/` | 페이지·메타·CSS. 말풍선은 `.ot-popover` — NDS Dialog(rounded-lg, bg-tertiary, inset-ring, p-20, heading-lg/body-md) + Button sm(solid/outline, rounded-xl) 값을 토큰 변수로 옮김. 펄스·핑·크로스페이드만 Agent 튜토리얼 CSS import |
| `public/proposals/order-tutorial/*.webp` | 실캡쳐 10장 (PNG → WebP q90, 육안 차이 없음, 장당 134–469 KB) |

### Tasking 재현 레이어

- 마크업·클래스·문구: 실서비스 번들 모듈 625473(사이드바), 622918(하단 바), 310665(구매 시트), 397660(지도 레이어·타이머)
  을 그대로 옮겼다. 궤도 값만 `EXAMPLE_STRIPS` (예시, 캡쳐일 이후 일정). 목록 맨 위에 "예시 일정입니다. 실제 위성 궤도가 아닙니다."
- 1600×1000 원본 px 로 그리고 스테이지 폭에 맞춰 `transform: scale()` — NDS 컴포넌트가 실서비스와 같은 px 로 캡쳐 헤더와 이어진다.
- 상세정보 접기는 실서비스와 같이 **Base UI** `Collapsible` + NDS `Button`(render). NDS `Collapsible.Trigger` 는 자체 라벨·셰브론을 그려 겹친다.
- 지도 궤도 레이어는 결과 목록을 하이라이트하는 동안에도 보이도록 오버레이 위로 portal.

### 라이트 토큰 (`.ep-live-light`)

EarthPaper 앱은 `.dark` 고정이지만 주문 화면은 라이트다. 재현 레이어 래퍼에서 NDS 토큰을 실서비스 값으로 다시 선언한다.
**함정**: `globals.css` 의 `@theme inline` 이 `--color-text-primary: var(--text)` 처럼 EP 별칭을 가리키고, 별칭(`--text`, `--bg` …)은
`:root` 에서 다크 값으로 계산돼 상속된다. NDS 토큰만 바꾸면 배경은 바뀌는데 글자는 다크 값으로 남는다 → 별칭도 같은 래퍼에서 다시 선언.

### z-index

driver 오버레이 10000, 팝오버 1e9. 캡쳐 버튼·스포트라이트·궤도 레이어는 100000 (오버레이 위, 말풍선 아래).
궤도 레이어는 가입 모달(NDS Dialog) 위로 올라오지 않게 투어 중(running/transition)에만 마운트한다.

## 검증 (2026-10-08)

- vitest: 187개 통과 (새 테스트 16개 포함 — 스펙 계약 10, TaskingSim 렌더 6).
  `scripts/nds-codemod.test.ts` 는 base 커밋(78abc3e)부터 로드 단계 SyntaxError — 이 작업과 무관, 미수정.
- tsc·eslint 클린.
- 로컬 dev 서버에서 browse 로 두 트랙 전 구간 클릭 확인 (분기 → 연출 → 각 스텝 → 가입 모달, 건너뛰기 → 모달).
  `/api/events` 500 은 기존 이슈(Supabase 연결 불가).

## 남은 것

- 사용자 육안 QA → 카피·위치 미세조정
- 커밋·배포 (아직 미커밋). 헤더에 탭을 달지 여부 (Agent 튜토리얼은 헤더 'EP Agent' 탭)
- 실서비스 궤도 조회가 일정을 돌려주는 날 Tasking 4–7 스텝을 실캡쳐로 교체할지 결정
