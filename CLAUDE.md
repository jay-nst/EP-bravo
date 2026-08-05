@AGENTS.md

## Session Continuity (자동 체크포인트)

세션 시작 시 반드시 `.claude/session-state.json`을 읽어서 이전 작업 상태를 확인한다.

다음 시점에 `.claude/session-state.json`을 자동 업데이트한다:
- 스킬(/design-review, /qa 등) 완료 시
- 세션 종료 전 (사용자가 끝내겠다고 하면)

형식: `{"timestamp", "branch", "last_commit", "completed_tasks", "in_progress", "remaining_tasks", "blockers", "test_status", "decisions_made"}`

이전 세션 상태를 추측하거나 환각하지 않는다 — 파일이 곧 기억이다.

## Project: EarthPaper

위성영상 데이터를 검색, 구매, 클리핑할 수 있는 마켓플레이스 ("위성 데이터의 Shopify")

- **Stack:** Next.js 16 + React 19 + Supabase + Mapbox + Tailwind v4
- **Design:** DESIGN.md 참조 (Quiet Observatory 미학, Pretendard Variable, dark-first)
- **Dev server:** `npm run dev` (localhost:3000)

## Design Review History

총 24건 수정 완료 (5 rounds). 현재 점수: Design A- / AI Slop A / Performance A.
- Round 1 (2026-06-29): FINDING-001~012 — 다크테마, 타이포, 터치타겟, 브랜딩, Empty State, 위성느낌
- Round 2 (2026-07-02): FINDING-014~017 — 히어로CTA/푸터/보조링크 터치타겟, Before/After 텍스트겹침
- Round 3 (2026-07-14): FINDING-018~022 — 섹션 제목 크기, AI Slop 패턴 제거(colored left-border, circle icons), 터치 타겟 개선
- Round 4 (2026-07-14): 시뮬레이터 디자인 정합성 — glass panel opacity(var(--panel-bg)), Northpaper 크기 통일, --color-northpaper CSS 변수 추가, 버튼 hover 피드백
- Round 5 (2026-07-16): FINDING-023~025 — Breaking Strip 11px→12px, Footer sub-12px 5건→12px
- Deferred: 69 hardcoded hex (opacity suffix 패턴), ~45 landing page sub-12px mono labels, 사이드바 터치타겟 28px (모바일 스프린트)

## Current State (2026-07-16)

Homepage Bloomberg 스타일 에디토리얼 매거진 레이아웃 완성.
플랫폼 5개 랜딩페이지 완성 (Citadel, Predict, Warden, Northpaper, Nexus).
각 플랫폼에 인터랙티브 시뮬레이터 탑재 (EarthMap AOI 드로잉 → 모듈별 시뮬레이션 결과).
인증 제거, DEMO_USER fallback. Vitest 105개 테스트 통과.
NetBird VPN 네트워크 접속 설정 완료 (allowedDevOrigins + Windows 방화벽).
모바일 반응형 완료 (Header 햄버거/Core 사이드바 드로어/시뮬레이터 바텀시트/랜딩 CSS 미디어쿼리).

### Content Funnel (Phase 0 완료)

- Lead Capture: `LeadCaptureModal` 공통 컴포넌트 + `/api/leads` Supabase 연동
- 퍼널 트래킹: 5 이벤트 × 4 시뮬레이터 (simulator_viewed → aoi_drawn → result_viewed → lead_form_opened → lead_form_submitted)
- 뉴스레터 구독: `NewsletterForm` → leads API (vertical='newsletter')
- DB: `00007_leads.sql`, `00008_analytics_event_types.sql`, `00009_leads_newsletter.sql`

### Platform Polish (2026-07-16 완료)

- `fmtNum` 유틸리티 (`src/lib/format.ts`): 전체 코드베이스 숫자 포맷팅 통일 (24개 인스턴스)
- NotificationBell: 에러 핸들링, Escape 키 닫기
- 결제 흐름: `purchasing` 상태 해제 버그 수정, `useCallback` stale closure 수정
- 채팅: 제안 버튼 클릭 시 바로 전송
- DashboardClient: "views"→"조회", 로딩 상태 버그, AI ASSISTANT→EP AGENT, 뉴스레터→한글
- 14개 페이지별 브라우저 탭 제목 (layout.tsx)
- Map 로딩 색상 → 디자인 토큰, aria-label 추가, PII 로그 제거

### Simulator Components

4개 플랫폼 시뮬레이터 — 동일 패턴 (3-phase 상태 머신: draw → analyzing → result):
- `src/components/warden/WardenSimulator.tsx` — EUDR 산림전용 스크리닝 (Kalimantan, zoom 8)
- `src/components/predict/PredictSimulator.tsx` — 태양광 자산 검증 (Rajasthan, zoom 9)
- `src/components/citadel/CitadelSimulator.tsx` — 재난 피해 분석 (광양, zoom 11)
- `src/components/northpaper/NorthpaperSimulator.tsx` — 변화 탐지 (개성, zoom 12)

공통: EarthMap dynamic import, floating glass panel (var(--panel-bg)), 플랫폼 색상 accent, hover 피드백 버튼, 리드 캡처 CTA, 퍼널 트래킹.

### 서울 기후 대시보드 `/seoul` (2026-08-05)

서울시 기후환경정책과 방문 데모용. Core와 달리 결제/AOI구매 없이 기후 레이어에 집중한 슬림 페이지.
서울시청 중심 `[126.978, 37.5665]`, zoom 10.6.

| 레이어 | 소스 | 배지 |
|---|---|---|
| 초미세먼지 PM2.5 | `/api/layers/seoul-air` — 에어코리아 실시간 39개소 | LIVE |
| 자치구 대기환경지수 | `/api/layers/seoul-cai` — 서울 열린데이터광장 `RealtimeCityAir` 25자치구 | LIVE |
| S-DoT 도시센서 기온 | `/api/layers/sdot` — 서울 열린데이터광장 `IotVdata017`, 센서 ~890지점을 자치구로 집계 | LIVE |
| 폭염·열섬 지표온도 | `SEOUL_HEAT_GRID` 격자 폴리곤 558셀 | DEMO |
| 자치구 온실가스 | `SEOUL_DISTRICTS` 비례원 25개 | DEMO |
| 태양광 보급 용량 | 동일 | DEMO |

서울 열린데이터광장 (`SEOUL_OPEN_DATA_KEY`) 사용 시 주의:
- `IotVdata017`은 **최신순 정렬**이다. 인덱스 1부터가 최근 데이터고 꼬리는 한 달 전이다.
- 같은 서비스 안에서 **행마다 필드 구성이 다르다.** 조도·자외선만 있는 행과 `AVG_TP`/`AVG_HUM`이 있는 행이 섞여 있다. 필드 존재를 가정하지 말 것.
- 고장 센서가 `AVG_TP: -40.0`, `AVG_HUM: 100`, 잘린 `"77."` 같은 값을 그대로 올린다. 반드시 범위 검증할 것.
- `CGG`(자치구)가 로마자다 (`Gangnam-gu`). 좌표는 없고 자치구·행정동만 있어서, 자치구 중심에 집계값을 얹는다. **없는 좌표를 지어내지 않는다.**
- S-DoT 자치구 평균은 시각에 따라 2~3°C 안에 몰린다. 고정 색 구간을 쓰면 전 자치구가 같은 색이 되므로, `loadLayer`에서 실제 수신 범위로 램프를 다시 설정한다.

서울 경계 강조 (토글 없이 항상 표시):
- `src/lib/seoul-boundary.ts` — 자치구 25개 경계 + 외곽 마스크. 출처 [southkorea/seoul-maps](https://github.com/southkorea/seoul-maps) 통계청 2013 단순화본, 원본은 `scripts/seoul-municipalities-src.json`
- `SEOUL_MASK` 은 **세계 전체 외곽 링에 자치구 25개를 구멍으로 뚫은 폴리곤**이다. union 계산 없이 서울만 뚫린다 (자치구가 서울을 빈틈없이 덮으므로). 이걸 어둡게 칠해 주변을 가린다
- 마스크 fill 은 데이터 레이어보다 **아래**, 경계선(`seoul-boundary-glow` / `seoul-district-line`)은 **위**에 둔다. 안 그러면 열섬 fill 이 경계선을 덮는다
- 재생성: `node scripts/gen-seoul-boundary.js scripts/seoul-municipalities-src.json src/lib/seoul-boundary.ts`

- `src/lib/seoul-climate-data.ts` — 재생성: `node scripts/gen-seoul-climate-data.js src/lib/seoul-climate-data.ts`
  - 열섬 격자는 실제 자치구 폴리곤 ray casting 으로 클리핑한다. 근사 원을 쓰면 경계 밖으로 삐져나온다
  - 페이지의 `CELL_LNG`/`CELL_LAT` 는 스크립트의 `STEP_LNG`/`STEP_LAT` 와 반드시 같아야 셀이 맞물린다
- `src/lib/seoul-air-stations.ts` — 갱신: `node --env-file=.env.local scripts/fetch-seoul-air-stations.js src/lib/seoul-air-stations.ts`
- 파일 상단 주석에 측정값/파생값 구분 명시. 데모 데이터를 실측인 것처럼 쓰지 않는다.

주의사항:
- **열섬은 Mapbox `heatmap`을 쓰지 않는다.** heatmap은 값이 아니라 *점 밀도*에 색을 매핑해서 균일 격자에서는 온도차가 전부 사라진다. 격자 폴리곤 `fill` + `fill-antialias: false`로 그린다.
- 측정소 좌표는 번들에 내장한다. 에어코리아 측정소 목록 API가 간헐적으로 빈 응답을 주는데, 좌표가 없으면 측정값이 멀쩡해도 레이어가 통째로 빈 화면이 된다.
- 배경지도 전환 시 `setStyle`이 소스/레이어를 날리고 `onMapReady`가 재호출된다. 소스·레이어는 매번 다시 만들되 클릭 핸들러는 `handlersBoundRef`로 1회만 바인딩한다.
- 단기예보/AWS기상은 서울 내 지점이 3개/6개뿐이라 이 페이지에서 제외했다.

### Remaining Work

- T1: Feed API → Supabase 실 데이터 연동 (스키마 설계 선행 필요)
- 실제 위성 영상 이미지 교체 (현재 placeholder)
- AI Chat 산불 탐지 데모 (P2, design doc 완료)
