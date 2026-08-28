# Session Handoff

> 생성: 2026-08-26 17:22
> 프로젝트: C:\Users\jayoh\Documents\Claude Code\260619_Code\earthpaper

## 작업 요약

Core 지도에 **라이트 모드 basemap**을 추가하고, 같은 디자인을 **Mapbox 계정에 스타일로 구워 업로드**해서 외부 웹사이트에서 재사용할 수 있게 했다.

작업 중 `setPaintProperty` 예외가 `catch`에 삼켜져 **조용히 실패하던 버그 3개**를 발견해 함께 고쳤다. 색 조정 요청("노란끼 제거")은 팔레트를 실측해가며 두 차례 반복했다.

전부 커밋·푸시 완료. 작업 트리 깨끗함.

## 진행 중·미완료

미커밋 작업은 없다. 다음 세 가지가 **코드 외부**에 남아 있다:

1. **협력사에 넘길 `pk.` 토큰 미발급** — 기존 `naraspace-map` 토큰들은 URL restrictions 때문에 상대 도메인에서 403이다 (Mapbox 기본 스타일에서도 403인 것으로 대조 확인). 상대 도메인을 허용한 토큰을 새로 만들어 **스타일 URL과 함께** 전달해야 한다. 토큰만 주면 상대는 Mapbox 기본 지도를 보게 된다.

2. **`sk.` 토큰 삭제 필요** — 업로드용으로 발급한 secret 토큰이 대화 중 노출됐다. account.mapbox.com/access-tokens 에서 삭제할 것. 업로드는 끝났으므로 더 필요 없다.

3. **`/api/catalog/search` 500 — 코드 방어 미착수** (아래 미해결 이슈 참고). 차단기(circuit breaker) 구현을 사용자가 승인했으나, Mapbox 작업 우선순위로 보류됐다.

## 다음 단계

1. `sk.` 토큰 삭제 (보안, 가장 급함)
2. 협력사 도메인 허용된 `pk.` 토큰 발급 → 스타일 URL과 함께 전달
3. `EarthMap.tsx`의 `searchCatalog`에 차단기 추가 — 연속 실패 3회 시 조회 중단. 동시 in-flight 요청 가드도 함께 검토했음 (실패에 최대 12초 걸려 요청이 겹쳐 쌓이는 게 실제 폭주 경로)
4. Supabase 프로젝트 복구 후 `NEXT_PUBLIC_SUPABASE_URL` 갱신 → 카탈로그 기능 정상화 확인
5. 라이트 모드 모바일 확인 (이번 세션에서 데스크톱만 봤음)

## 참고 사항

**색 조정 판단 근거** — 라이트 팔레트는 `globals.css`의 `:root.light` 토큰(warm off-white)에서 파생했다가 노란끼 문제로 **의도적으로 이탈**했다. 중성은 R≈G≈B로 잡고, 식생은 청록 쪽으로(`B-R` +4~+16) 기울였다. 균형 잡힌 세이지 그린은 국토 대부분을 덮으면 올리브로 읽혀 "누리끼리"하게 보인다. 노랑 지표는 `R-B`가 아니라 `min(R,G)-B`로 재야 한다.

**팔레트 이중 관리 (주의)** — 색을 바꿀 때 **두 곳을 반드시 함께** 고친다:
- `src/lib/map-style-overrides.ts` → `LIGHT_PALETTE` (웹앱 런타임)
- `scripts/gen-mapbox-style.js` → `PALETTE` (업로드용 정적 스타일)

갈라지면 웹앱과 협력사 사이트가 달라진다. 동기화 검증은 두 파일에서 hex/rgba를 뽑아 정렬 비교하면 된다 (현재 26색 일치).

**라벨 처리가 양쪽에서 의도적으로 다르다**
- 웹앱: `navigator.languages` 기반 자동 전환 (`applyLocalizedLabels`)
- 업로드 스타일: **영어 고정**. 정적 JSON은 브라우저 언어를 읽을 수 없다. 협력사가 언어 전환을 원하면 로드 후 `setLayoutProperty('text-field', ...)`로 덮어써야 하고, 그 방법은 `gen-mapbox-style.js`의 `TEXT_FIELD` 주석에 적혀 있다.

**Mapbox 계정이 두 개로 갈려 있다**
- 웹앱: `jayoh` 계정 토큰 (`.env.local`의 `NEXT_PUBLIC_MAPBOX_TOKEN`) — 사용자 결정으로 **그대로 유지**
- 업로드한 스타일: `naraspace-map` 계정
- 토큰은 자기 계정 스타일만 접근 가능하므로 서로 호환되지 않는다. `jayoh` 토큰으로 `naraspace-map` 스타일을 부르면 404다.

**업로드 스타일 URL**: `mapbox://styles/naraspace-map/cmt9qf93k005001ss4sdngwwx`
갱신 시 `upload-mapbox-style.js`에 이 ID를 **인자로 넘겨야** PATCH가 되어 URL이 유지된다. 인자를 빼면 새 스타일이 생겨 URL이 바뀐다.

**검증 방법 메모** — Static Images API 이미지는 CDN 캐시 때문에 갱신 직후에도 옛 그림이 나온다. 업로드 반영 확인은 **스타일 JSON을 직접 GET**해서 색상값과 `modified` 타임스탬프를 보는 게 확실하다.

**토큰 취급** — `sk.`는 절대 전달·커밋하지 않는다. `pk.`는 공개용이라 클라이언트 번들에 실려도 되지만, URL restrictions를 걸어야 한다. 시크릿 값은 `.env.local`에 있고 파일 내용은 읽지 않는다.

**사용자 선호** — 설명이 길면 답답해한다. 결론부터 짧게. 개념 설명 반복하지 말 것.

## 완료된 작업

- Core 스타일 스위처에 4번째 옵션 `☀️ 라이트` 추가. `CORE_STYLE_IDS` / `DEFAULT_STYLE_IDS`로 노출 범위를 코드에 명시 (Seoul 페이지는 제외 — 사용자 요청)
- 브라우저 언어 자동 라벨 전환. 12개 언어 + 중국어 간·번체 지역 분기, 미지원 언어는 다음 선호로 스킵, 최종 폴백 `name_en` → `name`
- Mapbox DEM 기반 지형 음영. `hillshade` 레이어가 classic 스타일에 없으므로 소스+레이어를 직접 추가. `minzoom: 9`로 광역 뷰에서는 DEM 미요청
- `landuse` class별 식생 색 (wood/scrub/grass/rock/agriculture/residential/park/snow)
- 경계선 톤다운 (라이트 전용, 다크 무변경)
- 경량화: fog·road casing 제거, hillshade zoom 하한. 광역 뷰 DEM 타일 **7 → 1**, 총 요청 **18 → 12**
- 스타일 굽기·업로드 스크립트 2개 신규
- 테스트 12개 신규 (105 → **117**)
- Mapbox 업로드 완료 및 반영 확인 (`modified: 2026-08-26T08:16:02Z`)

**고친 버그 3개** — 전부 런타임에서 조용히 실패하던 것들. typecheck로는 안 잡히고 브라우저 확인으로 발견했다:

| 버그 | 내용 |
|------|------|
| `land` 색 미적용 | `land`는 `fill`이 아니라 **`background` 레이어**라 `background-color`를 써야 한다. `landColor`가 **다크·라이트 양쪽에서 한 번도 적용된 적 없었다**. Mapbox 기본 배경색이 우연히 비슷해 아무도 몰랐다. 이제 다크 배경도 의도한 `#0e0e10`이 실제 적용된다 |
| `waterway-label` | `id.includes('waterway')`가 symbol 레이어까지 잡아 `line-color`를 넣고 있었다. 그 분기가 라벨 분기보다 앞이라 **라벨 색·헤일로를 아예 못 받았다**. `&& layer.type === 'line'` 가드 추가 |
| 산림 색 미적용 | 존재하지 않는 `landcover` 레이어를 겨냥했다. classic 스타일에는 그 레이어가 없고, 실제 데이터는 **`landuse`의 class 값**에 있다 |

## 변경된 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/map-style-overrides.ts` | 팔레트 객체화(DARK/LIGHT), `applyLightStyleOverrides`, `applyLocalizedLabels` + `resolveNameField`, hillshade/DEM 추가, `landuse` class별 색, land/waterway 타입 가드. `applyKoreanLabels`는 한글 강제용 별칭으로 유지(기존 export 미제거) |
| `src/components/map/EarthMap.tsx` | `MapStyleId`에 `'light'` union 확장, `MAP_STYLES.light`, `CORE_STYLE_IDS`/`DEFAULT_STYLE_IDS` export, `applyStyleOverridesFor()`로 초기 로드·`setStyle` 두 지점 통일 |
| `src/app/(main)/core/page.tsx` | 스위처가 `CORE_STYLE_IDS` 순회 |
| `src/app/(main)/seoul/page.tsx` | 스위처가 `DEFAULT_STYLE_IDS` 고정 (라이트 제외) |
| `src/lib/map-style-overrides.test.ts` | 신규. 언어 해석 12개 테스트 (언어별 매핑, 중국어 지역 분기, 미지원 스킵, SSR) |
| `scripts/gen-mapbox-style.js` | 신규. light-v11을 받아 팔레트 적용 후 standalone 스타일 JSON 생성 |
| `scripts/upload-mapbox-style.js` | 신규. Styles API POST(생성)/PATCH(갱신). `sk.` 검증, 에러별 힌트, 응답 내 토큰 redact |
| `.gitignore` | `*.style.json` 제외 (스크립트로 재생성되는 산출물) |

## 미해결 이슈

- **Supabase 프로젝트가 존재하지 않는다.** `/api/catalog/search`가 항상 500. 원인은 SQL이나 RPC가 아니라 **DNS `ENOTFOUND`** — 프로젝트 호스트만 해석되지 않는다 (`supabase.com`/`google.com`은 정상, NetBird VPN도 정상). 삭제된 프로젝트로 보인다. 마이그레이션 파일(`00007_leads.sql` 등)이 레포에 있어 새 프로젝트에 재적용 가능. **코드 버그가 아니므로 코드로는 해결 불가.**
- **죽은 백엔드로 요청이 폭주한다.** 지도 `moveend`마다(500ms 디바운스) 요청이 나가고 실패에 최대 **12초**가 걸린다. 재시도 횟수 제한이 없고 `catch { /* Silent fail */ }`로 삼켜져 화면에 아무 표시가 없다. 체감 느림의 유력한 원인. 차단기 구현이 다음 단계 3번.
- `icon-192.png` 404 (PWA manifest 참조). 이번 작업과 무관, 영향 낮음.
- 라이트 모드 모바일 미확인.
- `EarthMap.tsx`에 기존 경고 2건 (`ACCENT_DIM` 미사용, `useEffect` exhaustive-deps). 이번 세션 이전부터 있던 것.
