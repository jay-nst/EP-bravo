// 경기도 공원 접근성 모델 — 공원 하나가 주변에 주는 '서비스 영향'의 정의.
//
// 이 파일이 모델의 정본이다. scripts/gen-gyeonggi-parks.js 가 같은 수식을
// 복제해 격자·등고선을 오프라인 생성하므로, 여기 수식·상수를 바꾸면
// 스크립트도 같이 바꾸고 재생성해야 한다 (CELL_LNG/STEP_LNG 관례와 동일).
//
// 개별 공원에는 평가 등급이 없다 (경기기후플랫폼 spggcee:park 확인).
// 공원 서비스 종합평가(park_snths_scr 0~100)는 읍면동 단위(spggcee:emd_park_scr)
// 로만 제공되므로, 공원별 영향은 다음 셋을 곱해 만든다:
//   1. 유형·면적 기반 기본 서비스 반경 (도시공원법 시행규칙 유치거리 준용)
//   2. 소속 읍면동 종합평가 점수에 따른 반경 가중 (좋으면 넓게, 나쁘면 좁게)
//   3. 면적 기반 강도 (큰 공원이 더 크게 기여하되 제곱근으로 눌러 독주 방지)

export interface ParkForModel {
  /** 소분류명 (sclsf_nm) — 어린이공원 · 소공원 · 휴게시설 · 식물원 및 수목원 · 근린 및 주제공원 */
  sclsfNm: string;
  /** 비오톱 폴리곤 면적 m² (biotop_area) */
  areaM2: number;
}

/**
 * 퇴화 슬리버 하한. spggcee:park 에는 0.02m² 수준의 디지타이징 조각이
 * 약 3,000개 섞여 있어 이 미만은 모델에서 제외한다.
 */
export const MIN_PARK_AREA_M2 = 100;

/**
 * 유형별 기본 서비스 반경(m).
 * 도시공원법 시행규칙 [별표 3] 유치거리를 준용: 어린이공원 250m,
 * 근린생활권 근린공원 500m, 도보권 근린공원 1,000m.
 * 소공원·휴게시설은 법정 유치거리가 없어 관례적 도보 거리로 잡았다.
 */
const BASE_RADIUS_M: Record<string, number> = {
  어린이공원: 250,
  소공원: 200,
  휴게시설: 150,
  '식물원 및 수목원': 1000,
};

/** '근린 및 주제공원'은 면적으로 생활권(500m)/도보권(1km)/광역(1.5~2.5km)을 가른다. */
function neighborhoodRadiusM(areaM2: number): number {
  if (areaM2 < 30_000) return 500; // 3ha 미만 — 근린생활권
  if (areaM2 < 100_000) return 1000; // 10ha 미만 — 도보권
  if (areaM2 < 1_000_000) return 1500; // 100ha 미만 — 대형 근린·주제공원
  return 2500; // 100ha 이상 — 광역 공원
}

/** 유형·면적 기반 기본 서비스 반경(m). 평가 점수를 곱하기 전 값이다. */
export function baseRadiusM(park: ParkForModel): number {
  const fixed = BASE_RADIUS_M[park.sclsfNm];
  if (fixed !== undefined) return fixed;
  return neighborhoodRadiusM(park.areaM2);
}

/**
 * 읍면동 공원 서비스 종합평가 점수(0~100)에 따른 반경 가중.
 * 점수 0 → ×0.6, 점수 100 → ×1.4. 평가가 좋은 지역의 공원은 더 넓은
 * 범위에, 나쁜 지역의 공원은 더 좁은 범위에 긍정적 영향을 준다.
 */
export function scoreWeight(score: number): number {
  const s = Math.min(100, Math.max(0, score));
  return 0.6 + 0.8 * (s / 100);
}

/** 평가 점수까지 반영한 최종 서비스 반경(m). */
export function serviceRadiusM(park: ParkForModel, emdScore: number): number {
  return baseRadiusM(park) * scoreWeight(emdScore);
}

/**
 * 면적 기반 기여 강도. 1ha 공원이 1.0.
 * 제곱근 스케일로 눌러서 초대형 공원 하나가 지역 전체를 채우지 않게 하고,
 * 상한 3.0 / 하한 0.2 로 자른다.
 */
export function intensity(areaM2: number): number {
  return Math.min(3, Math.max(0.2, Math.sqrt(areaM2 / 10_000)));
}

/**
 * 거리 d 지점에서 공원 하나가 주는 영향값 (Epanechnikov 커널).
 * 중심에서 강도 그대로, 반경에서 0으로 매끄럽게 감쇠한다.
 * 접근성 지수는 모든 공원의 이 값을 합산한 것이다.
 */
export function influenceAt(distM: number, radiusM: number, parkIntensity: number): number {
  if (radiusM <= 0 || distM >= radiusM) return 0;
  const t = distM / radiusM;
  return parkIntensity * (1 - t * t);
}
