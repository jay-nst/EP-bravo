# Session Handoff

> 생성: 2026-09-28
> 프로젝트: C:\Users\jayoh\Documents\Claude Code\260619_Code\earthpaper

## 작업 요약

**Agent 튜토리얼 제안 데모 페이지 완성 + 내부 서버 배포 완료.** `/proposals/agent-tutorial`,
헤더에 "EP Agent" 탭(서비스 옆). 배포: http://192.168.127.13:3000 (master a5c630f).
정본 설계: `docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md` (APPROVED).

- 브랜치: `feat/gyeonggi-parks` == `master` == origin (a5c630f), 작업 트리 깨끗함
- 페이지는 데모 단독 구성 (도입부/아웃트로 삭제됨 — 사용자 지시)

## 구현 내용 (이번 세션)

5스텝 driver.js 투어, 전부 실화면 캡쳐(agent.ep.naraspace.com, 산타로사섬 산불 분석 대화) 기반:

1. **스텝1** 비로그인 첫 화면 — 산타로사 예시 칩만 하이라이트(실측 좌표), 클릭 시
   **채팅 시뮬레이션**(`AnalysisChatSim`): 유저 버블 → 마스코트 좌우 흔들림 + 글자 타이핑
   스트리밍 → "분석 중". 타이포는 실서비스 실측(pretendard 14px/1.7/-0.2px, cqw 비례 스케일)
2. **스텝2** 결과 카드 하이라이트 → 화면의 '지도에서 보기' 클릭으로 진행
3. **스텝3** 전·후 비교 슬라이더 실동작(`BeforeAfterSlider`) + **불투명도 패널 DOM 재현**
   (오버레이 0%/100% 캡쳐 스택 + CSS opacity = 실서비스 raster-opacity와 동일 합성) →
   '분석 아티클 보기' 클릭 → 실제 아티클 로딩 캡쳐 1초
4. **스텝4** 아티클 실스크롤(원본해상도 4세그먼트, iframe 문서 직접 캡쳐) → 'PDF 저장' 클릭
5. **스텝5** 가입 전환 모달 (건너뛰기/ESC 포함 모든 이탈 경로가 모달 경유)

공통: 전체화면 시어터 모드, 팝오버 '다음' 버튼(advanceStep 경유라 로딩 연출 안 건너뜀),
클릭 대상 핑 애니메이션, `prefers-reduced-motion` 대응.

## 핵심 구현 지식 (다음 세션 필독)

- **스펙 정본**: `src/lib/agent-tutorial-steps.ts` — 스텝/핫스팟(%)/로딩/패널 색상 전부 여기.
  캡쳐 재작업 시 hotspot 은 라이브 DOM `getBoundingClientRect` 실측 (1600×1000 viewport)
- **driver.js 함정 3개**: ① `.driver-active * {pointer-events:none}` — 오버레이 위 커스텀
  버튼은 inline `pointerEvents:'auto'` + css `!important` 필요 ② 전체화면 컨테이너(fixed)가
  스태킹 컨텍스트를 만들어 z-index 갇힘 → AdvanceButton 은 **portal to body** + 스테이지
  rect 실측 배치 ③ public `destroy()` 는 onDestroyStarted 훅을 안 타고, 내부 destroy(닫기/
  ESC/마지막 스텝 완료)는 훅을 탐 → 모달 전환 로직이 이 차이에 의존
- **캡쳐 재작업 절차**: browse 데몬 `BROWSE_IDLE_TIMEOUT=600000` 로 재기동 후 **한 Bash
  호출 안에서** 전부 실행 (호출 사이 유휴로 데몬 죽음). 로그인은 connect 모드(사용자 직접
  로그인) — 세션 토큰이 수 시간 내 만료됨. PII 블러(사이드바·헤더 우측) 필수
- **browse 정리 3종 세트**: stop + terminal-agent bun kill + gstack chromium-profile
  chrome kill (메모리 feedback-bun-zombie 참조)
- 배포: `ssh root@192.168.127.13` → `/root/earthpaper` → pull master → npm install(신규
  의존성 driver.js 있음) → build → pm2 restart earthpaper. NetBird VPN 필수

## 다음 단계

1. **Clarity 최근 30일 수치 3개** → `CLARITY_METRICS` value 채우기 (현재 페이지에서 도입부
   삭제됐으므로 노출처는 추후 결정 — 수치는 실구현 베이스라인용으로 여전히 필요)
2. 승인자 15분 데모 일정 (설계문서 The Assignment)
3. 이월: 노출된 Mapbox `sk.` 토큰 삭제(보안, 가장 급함), 협력사용 `pk.` 토큰 발급,
   Supabase 인스턴스 복구, T1 Feed API
4. Header.tsx 기존 lint 에러 1건 (setMobileOpen in effect — 이번 작업과 무관, 미수정)

## 참고

- 데모 실측 자산: `public/proposals/agent-tutorial/` (캡쳐 14장 + mascot)
- `.gstack/browse-states/epagent.json` 은 평문 쿠키 — 이번 세션 종료 시 삭제함
- gstack 업그레이드 가능 (1.60.1 → 1.91.2) — 미적용
- 사용자 선호: 결론부터 짧게. 실물 재현 충실도 최우선 ("별도로 만들지 말고 실제 화면 모사")
