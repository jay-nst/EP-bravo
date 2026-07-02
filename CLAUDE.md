@AGENTS.md

## Session Continuity

세션 시작 시 `.claude/session-state.json`을 읽어서 이전 작업 상태를 확인한다.
디자인 리뷰, 기능 구현 등 주요 마일스톤마다 이 파일을 업데이트한다.

## Project: EarthPaper

위성영상 데이터를 검색, 구매, 클리핑할 수 있는 마켓플레이스 ("위성 데이터의 Shopify")

- **Stack:** Next.js 16 + React 19 + Supabase + Mapbox + Tailwind v4
- **Design:** DESIGN.md 참조 (Quiet Observatory 미학, Pretendard Variable, dark-first)
- **Dev server:** `npm run dev` (localhost:3000)

## Design Review History

총 16건 수정 완료 (2 rounds). 현재 점수: Design B+ / AI Slop A / Performance A.
- Round 1 (2026-06-29): FINDING-001~012 — 다크테마, 타이포, 터치타겟, 브랜딩, Empty State, 위성느낌
- Round 2 (2026-07-02): FINDING-014~017 — 히어로CTA/푸터/보조링크 터치타겟, Before/After 텍스트겹침
- Deferred: 푸터 링크 36px (허용), 실 위성영상 교체 후 재평가

## Remaining Work

- Sprint A 구현 시작 (dashboard v4.2, map, portal, chat, tasking)
- 인증 후 페이지 디자인 리뷰
- 실제 위성 영상 이미지 교체
