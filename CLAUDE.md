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

### Remaining Work

- T1: Feed API → Supabase 실 데이터 연동 (스키마 설계 선행 필요)
- 실제 위성 영상 이미지 교체 (현재 placeholder)
- AI Chat 산불 탐지 데모 (P2, design doc 완료)
