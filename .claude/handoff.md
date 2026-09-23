# Session Handoff

> 생성: 2026-09-23 11:10
> 프로젝트: C:\Users\jayoh\Documents\Claude Code\260619_Code\earthpaper

## 작업 요약

**다음 주 작업은 Agent 튜토리얼 제안 페이지 구현이다.** 기획은 완료·승인됨 — 정본: `docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md` (2026-09-22 /office-hours, 적대적 검토 2라운드 반영, Status: APPROVED). 구현은 미착수.

이번 세션(9/22~23)의 코드 작업: `searchCatalog` 차단기 + in-flight 가드 구현 (`1e48cb2`, 테스트 157개 통과).

- 브랜치: `feat/gyeonggi-parks`, origin과 일치, 작업 트리 깨끗함
- 프로젝트 전체 맥락(경기 공원 모델, 서울 대시보드, API 실측 특이사항)은 `CLAUDE.md` 참조

## 진행 중·미완료

**Agent 튜토리얼 제안 페이지 (기획 완료, 구현 미착수)** — 설계문서가 단일 진실. 요약:
- earthpaper에 `/proposals/agent-tutorial` 라우트 추가. 실화면 캡쳐 위 driver.js(MIT) 오버레이 + `steps.ts` 구조화 스펙 (Approach B)
- 5스텝: 입력창+예시 프롬프트 → 응답 화면 → 핵심 기능 2개 → 회원가입 모달(전환 클라이맥스). 건너뛰기 시에도 모달 통과
- 페이지 구성: 도입부(Clarity 수치 1-2개) → 데모 → 아웃트로(기대효과)
- 유일한 비자명 구현 지점: driver.js 스텝 훅에서 배경 캡쳐 교체 + 하이라이트 재계산
- **착수 전 사용자 준비물**: ① Clarity 최근 30일 수치 3개 (첫 화면 이탈률·평균 체류·방문→가입 전환율) ② Agent 실화면 캡쳐 4장 (비로그인 우선, 불가 시 계정 UI 크롭/블러) ③ 승인자 확정. 캡쳐 없이 placeholder로 골격 먼저 만드는 것도 가능 (사용자가 "나중에" 선택함)

코드 외부 미처리 2건 (8/27부터 이월):

1. **노출된 Mapbox `sk.` 토큰 삭제** — 업로드용 secret 토큰이 이전 대화 중 노출됐다. account.mapbox.com/access-tokens 에서 삭제. 업로드는 끝났으므로 더 필요 없다. (가장 급함)
2. **협력사용 `pk.` 토큰 미발급** — 기존 `naraspace-map` 토큰들은 URL restrictions로 상대 도메인에서 403. 상대 도메인 허용 토큰을 새로 만들어 **스타일 URL과 함께** 전달해야 한다.

## 다음 단계

1. **Agent 튜토리얼 제안 페이지 구현** — `docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md` 기준. 캡쳐·Clarity 수치 확보 후 착수 (또는 placeholder로 골격 먼저)
2. `sk.` 토큰 삭제 (보안)
3. 협력사 도메인 허용 `pk.` 토큰 발급 → 스타일 URL과 함께 전달
4. Supabase 프로젝트 복구 → `NEXT_PUBLIC_SUPABASE_URL` 갱신 → 카탈로그·이벤트 기능 정상화 (마이그레이션 `00007~00009` 레포에 있어 재적용 가능)
5. T1: Feed API → Supabase 실 데이터 연동 (스키마 설계 선행)
6. 라이트 모드 모바일 확인 (데스크톱만 확인됨)
7. P2: AI Chat 산불 탐지 데모 (design doc 완료), Analytics 대시보드 (이벤트 수집 완료, 시각화 필요)

## 참고 사항

**새 환경 셋업 주의** — `.env.local`은 git에 없다. 필요 키: `NEXT_PUBLIC_MAPBOX_TOKEN`(jayoh 계정), `SEOUL_OPEN_DATA_KEY`, `GYEONGGI_CLIMATE_API_KEY`, `DATA_GO_KR_*`. 값은 기존 컴퓨터의 `.env.local`에서 옮길 것 (파일 내용을 AI가 읽지 않는다).

**블로커 (환경 이슈, 코드로 해결 불가)**
- Supabase 인스턴스 삭제됨 (DNS ENOTFOUND) — `/api/catalog/search`, `/api/events` 500. `/seoul`·`/gyeonggi`는 Supabase 비의존이라 무관
- `DATA_GO_KR_AWS_KEY` 미작동 — AWS 기상 레이어 목업 폴백
- Mapbox Styles API가 `mapbox://` 소스 maxzoom을 저장하지 않음 — 호스팅 스타일 소비자는 DEM maxzoom 14 그대로 (상세: session-state.json blockers)

**팔레트 이중 관리** — 색 변경 시 두 곳 동시 수정: `src/lib/map-style-overrides.ts`의 `LIGHT_PALETTE` (웹앱) + `scripts/gen-mapbox-style.js`의 `PALETTE` (업로드용). 현재 26색 일치.

**Mapbox 계정 2개** — 웹앱은 `jayoh` 토큰, 업로드 스타일은 `naraspace-map` 계정. 상호 호환 안 됨 (404). 업로드 스타일 URL: `mapbox://styles/naraspace-map/cmt9qf93k005001ss4sdngwwx` — 갱신 시 `upload-mapbox-style.js`에 이 ID를 인자로 넘겨야 PATCH (안 넘기면 새 스타일 생성돼 URL 바뀜).

**브랜치 상태** — `feat/core-light-basemap`(local)이 origin보다 2커밋 앞서 있으나, 그 커밋들은 `feat/gyeonggi-parks`에 포함되어 원격에 존재. master 머지는 미완 — 배포 전 `feat/gyeonggi-parks` → master 머지 필요.

**사용자 선호** — 설명이 길면 답답해한다. 결론부터 짧게. 개념 설명 반복하지 말 것.

## 완료된 작업

(9/11 세션, 커밋 `ef04f8d`, `f08b8d7`)
- `/gyeonggi` 경기 공원 접근성 등고선 지도 — 경기기후플랫폼 연동, 공원 35,288개, 접근성 모델 정본 `src/lib/park-accessibility.ts` + vitest 12개
- `/seoul` 혼잡·열집중 분석 레이어 + 데이터 소스 패널

(8/28 세션, 커밋 `00383fc`, `fa66a2b`)
- 업로드 스타일 경량화 4건 (미참조 타일셋 제거, globe→mercator, admin-2 minzoom, DEM maxzoom) + Studio draft 동기화

## 미해결 이슈

- `icon-192.png` 404 (PWA manifest 참조) — 영향 낮음
- `EarthMap.tsx` 기존 경고 2건 (`ACCENT_DIM` 미사용, `useEffect` exhaustive-deps)
- 라이트 모드 모바일 미확인
