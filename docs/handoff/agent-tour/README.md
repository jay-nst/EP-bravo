# EP Agent 튜토리얼 — 이식용 예시 코드

첫 방문자에게 EP Agent 사용 흐름(예시 질문 → 분석 결과 → 지도 비교 → 분석 아티클)을 6단계로 안내하는 투어입니다.

- 동작 기준 데모: http://192.168.127.13:3000/proposals/agent-tutorial (사내망, 우상단에서 한국어/English 전환)
- 데모는 캡처 이미지 위에서 돌아가는 시연용입니다. 이 폴더는 같은 흐름을 **실제 Agent 화면**에 붙이도록 다시 작성한 코드입니다.

## 파일

| 파일 | 내용 |
|---|---|
| `agentTour.ts` | 스텝 정의(대상 요소, 진행 방식), 한/영 카피, 가입 모달 카피 |
| `useAgentTour.ts` | React 훅. 투어 시작·진행·닫기·다시 보지 않기 |
| `tourDismiss.ts` | '다시 보지 않기' 저장 (localStorage) |
| `agentTour.css` | 말풍선 테마, 상단 [다시 보지 않기][닫기], 클릭 유도 펄스 |
| `*.test.ts` | 동작 테스트 (vitest + jsdom + Testing Library) |

의존성: `driver.js` 1.x (`npm i driver.js`), React 18 이상.

## 적용 방법

### 1. 폴더 복사 후 대상 요소에 `data-tour` 달기

투어는 좌표가 아니라 `data-tour` 속성으로 요소를 찾습니다.

| 단계 | `data-tour` 값 | 붙일 요소 |
|---|---|---|
| 1 | `example-chip` | 첫 화면 예시 칩 중 **Santa Rosa Island wildfire report** 칩 |
| 2 | `analysis-result` | 분석 완료 후 채팅에 나오는 결과 카드 전체 |
| 2 | `show-on-map` | 결과 카드 안 '지도에서 보기 / Show on map' 버튼 |
| 3 | `map` | 지도 영역 전체 (비교 슬라이더 + 산불 피해 패널 포함) |
| 4 | `write-article` | '이 결과를 분석 아티클로 정리해줘 / Write an analysis article from this result' 버튼 |
| 4 | `view-article` | 아티클 작성 완료 후 생기는 '분석 아티클 보기 / View analysis article' 버튼 |
| 5 | `article-modal` | 분석 아티클 모달 전체 |
| 5 | `save-pdf` | 아티클 모달 헤더의 'PDF 저장 / Save as PDF' 버튼 |

```tsx
<button data-tour="example-chip" onClick={...}>Santa Rosa Island wildfire report (May 2026)</button>
```

### 2. 훅 연결

```tsx
import { useEffect, useState } from 'react';
import { useAgentTour } from './agent-tour/useAgentTour';
import { isTourDismissed } from './agent-tour/tourDismiss';
import { TOUR_UI, SIGNUP_COPY } from './agent-tour/agentTour';

function AgentHome({ locale, isLoggedIn }: { locale: 'ko' | 'en'; isLoggedIn: boolean }) {
  const [signupOpen, setSignupOpen] = useState(false);
  const tour = useAgentTour({
    locale,
    onComplete: () => setSignupOpen(true), // 6단계: 가입 유도 모달
    onEvent: (name, data) => analytics.track(`agent_tutorial_${name}`, data),
  });

  // 첫 진입 자동 표시 — '다시 보지 않기'를 저장한 사용자는 건너뛴다
  useEffect(() => {
    if (!isLoggedIn && !isTourDismissed()) tour.start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {/* 재진입 버튼 — 첫 화면 안내문 아래. 저장 여부와 상관없이 항상 연다 */}
      <button onClick={tour.start}>{TOUR_UI[locale].tourEntry}</button>
      <SignupDialog open={signupOpen} copy={SIGNUP_COPY[locale]} onReplay={tour.start} />
    </>
  );
}
```

### 3. 색 맞추기

`agentTour.css` 맨 위 `--agent-tour-*` 변수만 서비스 디자인 토큰으로 바꾸면 됩니다. 기본값은 현재 Agent 다크 테마에서 잰 값입니다.

## 동작 규칙

- **진행 방식**
  - 클릭 단계(1, 2, 4, 5)는 강조된 실제 버튼을 누르면 앱이 원래대로 동작하고 투어가 다음 단계로 이어집니다. 말풍선의 '다음'은 같은 버튼을 대신 눌러 줍니다.
  - 체험 단계(3)는 지도를 자유롭게 써 보고 '다음'으로 넘어갑니다.
- **기다리기**
  - 클릭 뒤에는 투어를 잠시 내리고, 다음 단계 대상(`data-tour`)이 화면에 나타나면 자동으로 다시 띄웁니다.
  - 1→2단계는 실제 분석 시간만큼 기다립니다. 기본 최대 15분이며 `waitTimeoutMs`로 바꿀 수 있습니다. 시간을 넘기면 투어를 조용히 끝냅니다.
- **4단계**: 아티클 작성 버튼을 누르면 작성이 끝날 때까지(약 30초) 기다렸다가 '보기' 버튼을 자동으로 눌러 모달을 엽니다.
- **닫기**
  - 상단 [닫기], 말풍선 X, ESC 중 어느 것을 눌러도 투어가 끝납니다. 가입 모달로 가지 않습니다.
  - 오버레이 빈 곳을 클릭해도 닫히지 않습니다.
- **다시 보지 않기**: 체크한 채 닫으면 저장되고, 다음 방문부터 자동 표시를 건너뜁니다. 재진입 버튼은 저장 여부와 상관없이 항상 투어를 엽니다.
- **완료**: 5단계에서 PDF 저장을 누르면 `onComplete`가 호출됩니다. 가입 유도 모달(`SIGNUP_COPY`)은 서비스의 Dialog로 띄웁니다.
- **진행 표시**: 말풍선에 `n / 6`이 나옵니다. 6번째는 가입 모달입니다.

## 테스트

```bash
npx vitest run agent-tour
```
가짜 DOM에 `data-tour` 요소를 만들고 다음 세 가지를 검증합니다.
- 칩 클릭 → 분석 대기 → 단계 진행 → 완료
- 닫기와 '다시 보지 않기' 저장
- 대기 시간 초과 시 종료
