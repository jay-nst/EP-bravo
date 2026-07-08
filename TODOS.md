# TODOS

## Homepage

### Analytics dashboard

**What:** CTR/D7/전환율 시각화 대시보드 구축 (Plausible, PostHog, 또는 자체 구현)

**Why:** Design Doc의 성공 지표 4개(Core CTA CTR 8%, Tempest CTR 12%, EP Original D7 15%, 구매 전환율 2%)를 측정하려면 이벤트 데이터를 시각화하는 대시보드가 필요. 8B에서 기본 이벤트 트래킹은 추가하지만 대시보드는 별도.

**Context:** MVP에 Supabase 이벤트 테이블 + CTA 클릭 로깅 추가 예정(8B 결정). 이 이벤트 데이터를 시각화하는 대시보드는 배포 후 작업. Plausible(셀프 호스트 가능, 가벼움) vs PostHog(기능 풍부, 무거움) 선택 필요. SQL 직접 조회로 시작해도 됨.

**Effort:** M
**Priority:** P2
**Depends on:** 8B 이벤트 트래킹 구현 완료

### EarthPulse/SatelliteCountdown 정리

**What:** EarthPulse.tsx(202줄), SatelliteCountdown.tsx(139줄) 미사용 코드 제거

**Why:** Magazine Grid 전환으로 Hero가 Editor's Pick으로 교체되면 두 컴포넌트가 데드코드가 됨. 번들에 포함되지 않더라도 유지보수 부담.

**Context:** 현재 page.tsx 히어로에서 사용. 9A 결정으로 히어로가 Editor's Pick + Today's Earth + Core 맵 프리뷰로 교체. 컴포넌트 자체는 잘 만들어져 있어서 다른 페이지(About 등)에서 재활용 가능성 있음. 재작성 완료 후 실제 사용 여부 확인하고 결정.

**Effort:** S
**Priority:** P3
**Depends on:** Homepage Magazine Grid 재작성 완료

### 모바일 반응형 스펙 문서화

**What:** Magazine Grid 모바일 전환점(breakpoint), Platform Bar 수평 스크롤, 터치 타겟 48px 미니멀 등을 DESIGN.md에 문서화

**Why:** D10에서 모바일 전략(사이드바 분해)은 결정했지만, 구체적 브레이크포인트와 터치 타겟 스펙이 없으면 구현자가 임의로 정함. 반응형 일관성 보장 필요.

**Context:** T1(DESIGN.md 작성)에서 globals.css 토큰 추출 시 함께 진행 가능. 모바일에서 Core CTA는 Hero 아래, EP Original은 Tempest 레인 뒤에 삽입하는 전략이 결정됨(D10).

**Effort:** S
**Priority:** P2
**Depends on:** T1 (DESIGN.md 작성)

### 테스트 인프라 구축

**What:** Vitest 테스트 패턴 정립 + API 라우트/컴포넌트 테스트 기반 구축

**Why:** 프로젝트 전체에 테스트 파일이 0개. vitest.config.ts는 있으나 테스트 디렉토리/파일 없음. Homepage v2 카드 컴포넌트부터 시작하되, API 라우트 테스트와 컴포넌트 테스트 패턴을 정립해야 이후 기능에도 적용 가능.

**Context:** T4(Homepage v2 카드 테스트)에서 첫 테스트를 작성하면서 패턴이 정립될 예정. 이 TODO는 그 패턴을 프로젝트 전체로 확장하는 작업. React 19 + Next.js 16 환경에서 vitest + @testing-library/react 조합 검증 필요. API 라우트 테스트는 NextRequest mock 패턴 정립 필요.

**Effort:** M
**Priority:** P2
**Depends on:** Homepage v2 Phase 1 (카드 분리) 완료

## Completed
