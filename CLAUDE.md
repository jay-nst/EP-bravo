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

총 21건 수정 완료 (4 rounds). 현재 점수: Design B+ / AI Slop A / Performance A.
- Round 1 (2026-06-29): FINDING-001~012 — 다크테마, 타이포, 터치타겟, 브랜딩, Empty State, 위성느낌
- Round 2 (2026-07-02): FINDING-014~017 — 히어로CTA/푸터/보조링크 터치타겟, Before/After 텍스트겹침
- Round 3 (2026-07-14): FINDING-018~022 — 섹션 제목 크기, AI Slop 패턴 제거(colored left-border, circle icons), 터치 타겟 개선
- Round 4 (2026-07-14): 시뮬레이터 디자인 정합성 — glass panel opacity(var(--panel-bg)), Northpaper 크기 통일, --color-northpaper CSS 변수 추가, 버튼 hover 피드백
- Deferred: 푸터 링크 36px (허용), 실 위성영상 교체 후 재평가

## Current State (2026-07-14)

Homepage Bloomberg 스타일 에디토리얼 매거진 레이아웃 완성.
플랫폼 5개 랜딩페이지 완성 (Citadel, Predict, Warden, Northpaper, Nexus).
각 플랫폼에 인터랙티브 시뮬레이터 탑재 (EarthMap AOI 드로잉 → 모듈별 시뮬레이션 결과).
인증 제거, DEMO_USER fallback. Vitest 71개 테스트 통과.
NetBird VPN 네트워크 접속 설정 완료 (allowedDevOrigins + Windows 방화벽).

### Simulator Components

4개 플랫폼 시뮬레이터 — 동일 패턴 (3-phase 상태 머신: draw → analyzing → result):
- `src/components/warden/WardenSimulator.tsx` — EUDR 산림전용 스크리닝 (Kalimantan, zoom 8)
- `src/components/predict/PredictSimulator.tsx` — 태양광 자산 검증 (Rajasthan, zoom 9)
- `src/components/citadel/CitadelSimulator.tsx` — 재난 피해 분석 (광양, zoom 11)
- `src/components/northpaper/NorthpaperSimulator.tsx` — 변화 탐지 (개성, zoom 12)

공통: EarthMap dynamic import, floating glass panel (var(--panel-bg)), 플랫폼 색상 accent, hover 피드백 버튼.

### Remaining Work

- T1: Feed API → Supabase 실 데이터 연동 (스키마 설계 선행 필요)
- 실제 위성 영상 이미지 교체 (현재 placeholder)
- 모바일 반응형 (별도 스프린트)
