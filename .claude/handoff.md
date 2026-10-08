# Session Handoff

> 생성: 2026-10-08 18:50
> 프로젝트: C:\Users\jayoh\Documents\Claude Code\260619_Code\earthpaper-order-tutorial (worktree)
> 브랜치: feat/order-tutorial (base feat/nds-phase2 08a99d3)

## 작업 요약

map.ep.naraspace.com/ko/order-imagery 위성영상 구매 튜토리얼 제안 데모 `/proposals/order-tutorial` 을 만들고 배포했다.
Agent 튜토리얼 구조 복제 + 첫 스텝 Archive / Tasking 분기, 트랙당 6스텝 → NDS Dialog 가입 모달.
정본 문서: `docs/ORDER_TUTORIAL_PROPOSAL_DESIGN.md` (결정·캡쳐 시나리오·구현·함정 전부 여기).

- 화면: 실서비스 실캡쳐 10장 (비로그인, 후쿠오카 SpaceEye-T 2026.05.31, AOI 27.82 km², $278.20)
- Tasking 궤도 선택 이후: 실서비스 궤도 조회가 `{"assignedOrbitInfoList":[]}` 라 번들 마크업 기반 DOM 재현 + "예시 일정" 표시
- 말풍선·버튼: NDS Dialog/Button 값을 토큰 변수로 옮긴 `.ot-popover` (사용자 요청 "NDS 적용")

## 커밋·배포 상태

- 개발 브랜치 `feat/order-tutorial`: a4f317c (전체 작업 + TaskingSim 렌더 테스트) + 이 핸드오프 커밋
- 운영: master **02b0d3f** — 최신 master 위로 튜토리얼 파일만 이식 (NDS 2단계 미완성 작업이 같이 배포되지 않게).
  TaskingSim.test.tsx 는 master 에 Testing Library·jsdom 이 없어 제외. 192.168.127.13 배포·HTTP 200 확인
- 헤더 탭 'EP Map Tutorial' (EP Agent 다음, 기후 인텔리전스 앞, 데스크톱·모바일) — master **6bbf633** 으로 배포·확인.
  이 개발 브랜치에는 없음 (헤더가 NDS 2단계에서 바뀌어 있어 master 에만 넣음)
- 로컬 브랜치 `deploy/order-tutorial` = master 6bbf633 (배포용 작업 브랜치, 다음에도 여기서 master 기준 수정)

## 다음 단계

1. 사용자 육안 QA 피드백 반영 (http://192.168.127.13:3000/proposals/order-tutorial)
3. NDS 2단계가 master 에 합쳐지면 `src/components/proposals/TaskingSim.test.tsx` 를 master 로 이식
4. 실서비스 궤도 조회가 일정을 돌려주는 날 Tasking 4–7 스텝 실캡쳐 교체 검토
5. 수정 후 배포: master 에 이식한 파일만 갱신 → push → `ssh root@192.168.127.13 "cd /root/earthpaper && git pull origin master && npm run build && pm2 restart earthpaper"`

## 참고 사항

- 이 worktree 에 `.env.local` 을 earthpaper-nds 에서 복사해 둠 (gitignore, 내용 미열람). 없으면 Supabase 미들웨어가 500
- dev 서버: `npx next dev -p 3100` (3000 은 다른 세션이 씀). `/api/events` 500 은 기존 Supabase 이슈
- master `Header.tsx:35` setState-in-effect 린트 에러는 기존 코드 (미수정)
- `scripts/nds-codemod.test.ts` 는 base 78abc3e 부터 로드 단계 SyntaxError — 이 작업과 무관
- 캡쳐 원본·검증 스크린샷은 `.cap/` (git exclude). 재촬영 시 AOI 는 GeoJSON 업로드로 지정 (합성 드래그는 지도 도구가 안 받음)
- browse 는 이번 작업에서만 허용받아 사용, 종료 시 bun·Chromium 정리 확인함. 다음엔 다시 허락받을 것
- 함정: 라이트 재현 래퍼(`.ep-live-light`)는 NDS 토큰 + EP 별칭(--text, --bg …)까지 재선언해야 글자색이 바뀐다
