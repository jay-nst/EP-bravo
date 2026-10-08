# Session Handoff

> 생성: 2026-10-08 20:14
> 프로젝트: C:\Users\jayoh\Documents\Claude Code\260619_Code\earthpaper-nds (git worktree, 메인 체크아웃은 ../earthpaper)

## 작업 요약

EarthPaper 를 NDS(Naraspace Design System, `@naraspace-technology/nds`, GitHub Packages 비공개)로 전환했다.

1. **1단계 (운영 배포 완료, master 597a0fd)** — NDS 설치 + EP 색 테마(`src/styles/nds/*.css`) + 코드모드(간격 ×4, radius 이름 변환) + 검증 스크립트. 화면 변화 없음.
2. **2단계 (`feat/nds-phase2`, :3001 미리보기, master 미병합)** — 사용자 요청 "색 제외 싹다 한번에":
   - 참조 구현 `LeadCaptureModal` (NDS Dialog/Field/Form anatomy)
   - 전면 적용 1차(7e7c3d6): 타이포·아이콘·표면·컴포넌트 50파일
   - 역할 기반 2차(d59e738): "바뀐애/안바뀐애 섞임" 지적 → 역할별 위계(h2=heading-2xl 등) + 텍스트 토큰
   - Mapbox 컨트롤 NDS 아이콘(068b2a3, CSS mask 생성 스크립트)
   - **색 복원 3차(47c586e)**: "버튼 색 날아감" 지적 → 사용자 결정 "3000(운영) 색 전부 복원" — 모양은 NDS, 색은 운영 EP 그대로(NDS 컴포넌트도 className 으로 색만 덮음)
3. 지도 상단바(튜토리얼) 실서비스 정합 수정 edc415f — master 반영됨.

## 진행 중·미완료

- `feat/nds-phase2` (HEAD 47c586e) 는 커밋·push 완료, **master 미병합 / 운영 미배포**. :3001 미리보기(서버 `/root/earthpaper-nds`, PM2 `earthpaper-nds`)에 최신 반영됨.
- 사용자 육안 QA 대기. 열린 질문: 섹션 제목("서비스 영역", "최근 탐지", "역량" 등)이 NDS 22px 크기 + 운영의 흐린 회색 + 밑줄로 복원됨 → 다시 "예전 같다" 느낄 수 있음. 기본 글자색으로 할지 결정 필요.
- warden/** · climate/** 는 다른 세션이 작업 중이라 NDS 2단계 미적용 (CSS 모듈 랜딩).

## 다음 단계

1. 사용자 :3001 QA 피드백 반영 (특히 섹션 제목 색)
2. master 병합: `git fetch && git merge origin/master` (master 새 커밋은 이미 NDS 단위로 작성됨 → 코드모드 불필요, 단 새 코드의 색/타이포 규칙 확인) → tsc/vitest/build
3. 운영 배포는 **사용자가 직접 실행** (자동 모드 분류기가 master push 를 막음):
   `git -C ".../earthpaper-nds" push origin HEAD:master` → `ssh root@192.168.127.13 "cd /root/earthpaper && git pull origin master && npm ci && npm run build && pm2 restart earthpaper"`
4. 배포 후 :3001 슬롯 정리 (`pm2 delete earthpaper-nds && pm2 save && rm -r /root/earthpaper-nds`)
5. warden/climate 세션 종료 후 같은 규칙(§7 모양 + §8 색) 적용
6. 정리 후보: EP 별칭 변수, typography/shadow 재등록 블록, 미사용 홈 컴포넌트(ComingSoonLane/CoreCTA/EPOriginal/PlatformBar), worktree 정리

## 참고 사항

- **규칙 정본:** `docs/NDS_FULL_ADOPTION_RULES.md` — §0~6 기본, §7 역할 기반 위계, §8 색 복원(최신, §0-2/§0-3 색/§7-2 대체). `docs/NDS_MIGRATION.md` (설치·1단계·2단계 결정).
- **사용자 결정 요약:** NDS = 모양(타이포 스케일·위계, 간격, radius, 아이콘, anatomy). 색 = 운영 EP 그대로. 작업 전 NDS `*.docs.mdx`/`*.examples.tsx` 먼저 확인. (메모리 `feedback_nds-max-fidelity`, `project_nds-design-system`)
- **Tailwind 간격 단위 1px** (`p-16`=16px). `scripts/nds-codemod.mjs` 는 멱등 아님 — 변환 안 된 코드에만.
- **`npx nds init` 금지** (globals.css 덮어씀).
- GitHub Packages 토큰: PC `~/.npmrc`, 서버 `/root/.npmrc` 에 사용자가 등록 (값 기록 안 함).
- 이 PC: browse/bun·claude-in-chrome 금지 → 시각 QA 는 사용자 육안.
- master 는 다른 세션이 계속 push 중 (climate/warden). worktree 는 refs 공유 — fetch 결과가 즉시 반영됨.
- NDS 문서 로컬 사본은 세션 scratchpad 에 있었음(휘발) — 필요 시 `gh api repos/Naraspace-Technology/nds/contents/src/lib/components/<name>/<Name>.docs.mdx` 로 재다운로드.
- 모델: Opus 4.6 금지.

## 완료된 작업

- edc415f 지도 상단바 배지 색 반전 수정 + 라이브 px/SVG (master)
- 78abc3e/268664b/597a0fd NDS 1단계 + warden 병합 (master, 운영 배포)
- 08a99d3/dff450a 포털 isolate 래퍼 + LeadCaptureModal 참조 구현, Testing Library/jsdom 도입
- 7e7c3d6 전면 NDS(색 제외) 50파일 / d59e738 역할 기반 위계 / 068b2a3 Mapbox 컨트롤 / 47c586e 운영 색 복원
- 검증(최종): tsc ok, vitest 183/183, eslint 기존 7 errors 만, next build ok, :3001 17개 페이지 200

## 변경된 파일

| 파일 | 변경 내용 |
|------|-----------|
| src/styles/nds/*.css | NDS 테마(EP 색), mapbox-controls.css(자동 생성) |
| src/app/globals.css, layout.tsx | NDS import, EP 별칭, IBM Plex 제거, isolate 래퍼 |
| src/components/shared/LeadCaptureModal.tsx (+test) | NDS 참조 구현 + accentColor 색 복원 |
| src/app/(main)/**, src/components/** (warden/climate 제외 ~50) | NDS 모양 + 운영 색 |
| scripts/nds-codemod.mjs, nds-verify.mjs, gen-mapbox-controls-css.mjs | 변환·검증·생성 스크립트 |
| docs/NDS_MIGRATION.md, NDS_FULL_ADOPTION_RULES.md, DESIGN.md, CLAUDE.md | 규칙·결정·참조 패턴 |

## 미해결 이슈

- /seoul·/gyeonggi 데스크톱에서 사이드바가 상단 제목·LIVE 표시를 가림 (기존 레이아웃 버그, 미수정)
- 서버 `npm ci` 가 sharp/unrs-resolver 설치 스크립트를 차단 (npm 11 allowScripts) — 이미지 문제 시 `npm install-scripts approve sharp`
- NDS 에 없는 것: 인라인 텍스트 링크, 세그먼트 컨트롤, 종 아이콘(IconAlertOn 대체), Popover/Menu
