# TODOS

## Open

### 서울 기후 대시보드 후속

**What:** `/seoul` 데모 페이지의 남은 DEMO 레이어를 실데이터로 교체

1. **열섬 LST 실데이터** — Landsat 8/9 열적외선 밴드 → 기존 Titiler/COG 파이프라인 활용. 현재는 도심 열원/냉원 중첩 모델
2. **자치구 온실가스·태양광** — 현재 인구·면적·토지이용 유형 기반 파생값. 서울시 온실가스 인벤토리 공식 통계로 교체
3. **S-DoT 지점 좌표 확보** — 현재 원본에 좌표가 없어 자치구 중심에 집계값을 얹고 있다. 지점별 좌표표를 구하면 ~890지점을 실제 위치에 뿌릴 수 있다 (S-DoT은 파일셋으로 좌표를 배포하는 것으로 보임)
4. **DATA_GO_KR_AWS_KEY 점검** — 현재 미작동해서 AWS 기상 레이어가 목업 폴백 (서울 페이지에서는 제외했지만 Core 지도에는 영향)

**Why:** LIVE 3개(대기질·CAI·S-DoT)는 실연동 완료. 남은 DEMO 배지 레이어를 승격하면 영업 자산으로 쓸 수 있다.

**Effort:** M
**Priority:** P1

### Supabase 연결 복구

**What:** Supabase 인스턴스에 연결 불가 (`fetch failed`). `/api/events`(애널리틱스), `/api/catalog/search`(Core 카탈로그)가 500 반환

**Why:** 이벤트 트래킹이 전부 유실되고 Core 지도의 카탈로그 검색이 죽는다. 무료 티어 프로젝트 일시정지 여부부터 확인할 것

**Effort:** S
**Priority:** P0

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
