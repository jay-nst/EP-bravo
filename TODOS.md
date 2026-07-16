# TODOS

## Open

### AI Chat 산불 탐지 데모

**What:** Citadel 시뮬레이터에 AI 채팅 인터페이스 추가. 사용자가 "이 지역 산불 위험도 분석해줘" 같은 자연어로 질문하면 LLM이 위성 데이터 기반 분석 결과를 SSE 스트리밍으로 응답. 텍스트 + 지도 마커 + 통계 ContentBlock 지원.

**Why:** 비전문가가 위성 데이터를 자연어로 접근할 수 있는 인터페이스. 콘텐츠 퍼널 전략의 "aha moment" 강화.

**Design doc:** `~/.gstack/projects/earthpaper/jayoh-master-design-20260716-144440.md` (3라운드 spec review 완료, 8/10)

**Effort:** L
**Priority:** P2

### Analytics 대시보드

**What:** CTR/D7/전환율 시각화 대시보드 구축 (Plausible, PostHog, 또는 자체 구현)

**Why:** 성공 지표 4개(Core CTA CTR 8%, Citadel CTR 12%, EP Original D7 15%, 구매 전환율 2%) 측정. 이벤트 트래킹은 구현 완료(analytics.ts), 시각화 대시보드 필요.

**Effort:** M
**Priority:** P2

## Completed

- ~~플랫폼 고도화 (숫자 포맷팅 + 품질 수정)~~ — 2026-07-16 완료. fmtNum 유틸리티 24개 적용, 에러 핸들링/결제 상태 버그/채팅 UX/페이지 메타데이터/뉴스레터 API 연동 등 16건 수정
- ~~EarthPulse/SatelliteCountdown 정리~~ — 2026-07-16 삭제 완료 (미사용 데드코드)
- ~~모바일 반응형~~ — 2026-07-16 구현 완료 (16파일, Header 햄버거/Core 사이드바 드로어/시뮬레이터 바텀시트/랜딩 미디어쿼리)
- ~~테스트 인프라 구축~~ — Vitest 105개 테스트 (11파일). payment/rate-limit/api-error/geo/order/security/analytics/mock 커버리지
- ~~Lead Capture Form~~ — 2026-07-16 구현 완료. LeadCaptureModal 공통 컴포넌트 + /api/leads Supabase 연동 + 4개 시뮬레이터 CTA 버튼
- ~~시뮬레이터 퍼널 트래킹~~ — 2026-07-16 구현 완료. simulator_viewed → aoi_drawn → result_viewed → lead_form_opened → lead_form_submitted (4개 시뮬레이터 × 5 이벤트)
- ~~Supabase leads 테이블~~ — 2026-07-16 마이그레이션 00007_leads.sql 생성. RLS 설정 (insert: public, select: service_role)
- ~~뉴스레터 구독 leads 연동~~ — 2026-07-16 NewsletterForm → /api/leads (vertical='newsletter') + 00009 마이그레이션
