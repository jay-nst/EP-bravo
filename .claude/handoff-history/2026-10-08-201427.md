# Session Handoff

> 생성: 2026-09-29 21:47
> 프로젝트: C:\Users\jayoh\Documents\Claude Code\260619_Code\earthpaper

## 작업 요약

Agent 튜토리얼 제안 페이지(`/proposals/agent-tutorial`)에 피그마 디자인 리뷰 피드백을 반영했다.
피그마 파일 `039_EarthPaper_2026` (fileKey `1UjpfpibiqDUf2J1AB2082`)의 노드 23910:11393~11402에
EUNJI CHOI가 2026-09-28에 남긴 미해결 댓글 9건 중 8건을 코드로 반영, 1건은 재캡쳐 필요로 보류.
반영 상세는 `docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md`의 "디자인 리뷰 반영 (2026-09-28)" 섹션이 정본.

댓글 수집 방법: browse 쿠키 가져오기(DPAPI 실패)와 핸드오프 창(반복 사망) 모두 이 PC에서 실패 →
사용자가 발급한 Figma PAT로 REST API(`GET /v1/files/:key/comments`) 호출. 메모리
`feedback_figma-comments-via-rest.md`에 방법 기록됨.

## 진행 중·미완료

**모든 변경이 미커밋 상태다** (브랜치 `feat/gyeonggi-parks`, HEAD 5daa574 위 dirty).
변경 파일 6개 — 아래 "변경된 파일" 표 참조. vitest 164개 통과, tsc/eslint 클린 확인 완료.

- **브라우저 육안 확인 미실시** — 사용자가 bun/browse 사용 중단을 요청해 시각 검증을 못 했다.
  특히 확인할 것: (1) 마지막 스텝(analysis-article) 팝오버가 `side: 'right'`인데 오른쪽 여백이
  ~15.6%뿐이라 driver.js가 자동으로 위치를 뒤집을 수 있음, (2) 새 open-article 스텝의 민트 펄스가
  driver 오버레이 컷아웃 안에서 제대로 보이는지, (3) X 버튼 34px 확대가 타이틀과 겹치지 않는지.
- **피드백 1건 미반영**: "검색과 화재 전후 UI가 겹쳐 보임" (댓글 1943233805) — 스텝 3 캡쳐 PNG
  (step2-result.png 및 COMPARE_ASSETS)에 구워진 실서비스 UI라 코드 수정 불가. agent.ep.naraspace.com
  재캡쳐 필요. 캡쳐 절차·로그인 상태 파일 위치는 session-state.json의 2026-09-28 항목 참조.

## 다음 단계

1. `npm run dev` → `/proposals/agent-tutorial` 열어 새 6스텝 흐름 육안 QA (위 확인 포인트 3개)
2. QA 통과 시 커밋 (예: `feat(proposals): apply Figma design review feedback to agent tutorial`)
3. 피그마 댓글에 반영 완료 회신 / 해결 처리 (EUNJI CHOI에게 재리뷰 요청)
4. (보류) step2-result.png 재캡쳐로 검색창/비교 바 겹침 해소
5. (별개) gstack 업그레이드 대기 중 (1.60.1 → 1.91.6) — 원하면 `/gstack-upgrade`

## 참고 사항

- **Figma PAT가 대화에 노출됐다** — 사용자에게 폐기(revoke) 권고했음. 토큰 값은 어디에도 저장 안 함.
- 사용자 지시: **bun 데몬 그만 켜기** ("일단 bun 좀 그만켜"). 이 PC에서 browse 핸드오프 창이 반복적으로
  죽는다 — 피그마 등 인증 필요한 사이트는 REST API 토큰 방식 우선.
- 6스텝은 설계문서의 소프트 상한(5스텝, 초과 가능) 안의 의도적 결정 — 리뷰어 제안 반영.
  테스트 상한도 6으로 갱신됨. 더 늘리면 완주율 벤치마크(6-8스텝 25%) 근거로 재검토.
- 스텝 스펙에 `popoverSide`/`popoverAlign` 필드가 새로 생겼다 — driver.js `side`/`align`으로 전달됨.
- 직접 클릭 핫스팟의 민트 펄스는 `ep-advance-pulse` 클래스 재사용 (AdvanceButton과 동일 효과).

## 완료된 작업

- 피그마 댓글 9건 수집·분류 (REST API, node_id 필터) + 노드 4개 스크린샷 대조
- 스텝 분리: map-compare(action 'next'로 변경) + open-article(신규, 버튼 하이라이트 클릭,
  loadingAfter 이관) → 총 6스텝
- 팝오버 위치 지정: open-article 버튼 위(top/start), analysis-article PDF 저장 근처 오른쪽(right/start)
- 팝오버 가독성: 이전 버튼 명도/hover 강화, 본문 `color-mix(in srgb, var(--text) 75%, var(--text-muted))`,
  X 버튼 34px/20px, ▸ 아이콘 1.4em (span 분리)
- 액션 유도 통일: 직접 클릭 핫스팟에 ep-advance-pulse 적용
- 'next' 액션 스텝에도 힌트 문구 추가 ("체험해 본 뒤 아래 '다음' 버튼으로 진행하세요")
- 인트로 카피 5스텝→6스텝, 테스트 소프트 상한 5→6, 설계문서에 리뷰 반영 섹션 추가
- vitest 164/164 통과, tsc·eslint 클린, session-state.json 갱신

## 변경된 파일

| 파일 | 변경 내용 |
|------|-----------|
| src/lib/agent-tutorial-steps.ts | PopoverSide/Align 타입 + popoverSide/Align 필드, map-compare→next 액션, open-article 스텝 신규, analysis-article 팝오버 위치 |
| src/components/proposals/AgentTutorialDemo.tsx | 팝오버 side/align 전달, 힌트 문구 재구성(▸ span 분리, next 힌트 추가), 클릭 핫스팟 민트 펄스, 6스텝 카피 |
| src/app/(main)/proposals/agent-tutorial/tutorial.css | 이전 버튼 가시성+hover, 본문 명도(color-mix), X 버튼 확대, ▸ 아이콘 확대 |
| src/lib/agent-tutorial-steps.test.ts | 스텝 상한 5→6 (리뷰 근거 주석) |
| docs/AGENT_TUTORIAL_PROPOSAL_DESIGN.md | 디자인 리뷰 반영 섹션 추가 (미반영 1건 포함) |
| .claude/session-state.json | 2026-09-29 작업 항목 prepend |

## 미해결 이슈

- 스텝 3 캡쳐의 검색창/화재 전·후 비교 바 겹침 — PNG 재캡쳐 전까지 미해소 (댓글 1943233805)
- 마지막 스텝 팝오버 오른쪽 배치가 좁은 여백에서 어떻게 동작하는지 미검증 (육안 QA 필요)
