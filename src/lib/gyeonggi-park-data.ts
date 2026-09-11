// 자동 생성 파일 — 직접 수정하지 말 것.
// 재생성: node scripts/gen-gyeonggi-parks.js
// (수집: node --env-file=.env.local scripts/fetch-gyeonggi-parks.js)
//
// 원본: 경기기후플랫폼 도시공원 평가 (기준일 20240630)
// - spggcee:sigun_park_scr  시군 공원 서비스 종합평가 32개
// - spggcee:emd_park_scr    읍면동 종합평가 600개 (choropleth 는 public/data/gyeonggi/emd-park-score.json)
// - spggcee:park            공원 비오톱 폴리곤 35288개 중 32295개 사용 (100m² 미만 슬리버 제외)
//
// score(park_snths_scr)·순위는 플랫폼이 산출한 실측 통계이고,
// 접근성 등고선(access-contours.json)은 이를 입력으로 한 EarthPaper 자체 분석이다.

export interface SigunParkScore {
  name: string;
  code: string;
  /** 공원 서비스 종합평가 점수 (0~100) */
  score: number;
  /** 도내 순위 */
  rank: number | null;
  /** 1인당 공원녹지 면적 m² */
  perCapita: number;
  /** 공원 서비스 수혜 인구 비율 % */
  benefitRate: number;
  /** 라벨 표시용 대표 좌표 */
  lng: number;
  lat: number;
}

export const SIGUN_PARK_SCORES: SigunParkScore[] = [
  {
    "name": "성남시",
    "code": "31020",
    "score": 67.1,
    "rank": 1,
    "perCapita": 11.5,
    "benefitRate": 47.5,
    "lng": 127.11176,
    "lat": 37.40409
  },
  {
    "name": "수원시",
    "code": "31010",
    "score": 65.2,
    "rank": 2,
    "perCapita": 7.8,
    "benefitRate": 29.2,
    "lng": 127.00831,
    "lat": 37.28779
  },
  {
    "name": "안산시",
    "code": "31090",
    "score": 64.2,
    "rank": 3,
    "perCapita": 10.7,
    "benefitRate": 39.9,
    "lng": 126.59472,
    "lat": 37.24951
  },
  {
    "name": "과천시",
    "code": "31110",
    "score": 63.6,
    "rank": 4,
    "perCapita": 88.1,
    "benefitRate": 40.1,
    "lng": 127.00414,
    "lat": 37.43416
  },
  {
    "name": "의왕시",
    "code": "31170",
    "score": 61.2,
    "rank": 5,
    "perCapita": 12.1,
    "benefitRate": 40.2,
    "lng": 126.98821,
    "lat": 37.35797
  },
  {
    "name": "군포시",
    "code": "31160",
    "score": 60.1,
    "rank": 6,
    "perCapita": 5.4,
    "benefitRate": 32.9,
    "lng": 126.9176,
    "lat": 37.34186
  },
  {
    "name": "안양시",
    "code": "31040",
    "score": 57.7,
    "rank": 7,
    "perCapita": 3.5,
    "benefitRate": 39.6,
    "lng": 126.92655,
    "lat": 37.40449
  },
  {
    "name": "시흥시",
    "code": "31150",
    "score": 57.6,
    "rank": 8,
    "perCapita": 9.5,
    "benefitRate": 20.7,
    "lng": 126.74792,
    "lat": 37.39033
  },
  {
    "name": "하남시",
    "code": "31180",
    "score": 57.4,
    "rank": 9,
    "perCapita": 8.5,
    "benefitRate": 34.6,
    "lng": 127.21282,
    "lat": 37.53027
  },
  {
    "name": "광명시",
    "code": "31060",
    "score": 56.8,
    "rank": 10,
    "perCapita": 3.6,
    "benefitRate": 35.8,
    "lng": 126.86301,
    "lat": 37.44833
  },
  {
    "name": "오산시",
    "code": "31140",
    "score": 56.5,
    "rank": 11,
    "perCapita": 7.6,
    "benefitRate": 35.6,
    "lng": 127.049,
    "lat": 37.1631
  },
  {
    "name": "화성시",
    "code": "31240",
    "score": 55.2,
    "rank": 12,
    "perCapita": 13.2,
    "benefitRate": 16.8,
    "lng": 126.89535,
    "lat": 37.15357
  },
  {
    "name": "구리시",
    "code": "31120",
    "score": 54.8,
    "rank": 13,
    "perCapita": 4.7,
    "benefitRate": 23.6,
    "lng": 127.13574,
    "lat": 37.60121
  },
  {
    "name": "고양시",
    "code": "31100",
    "score": 54.7,
    "rank": 14,
    "perCapita": 6.6,
    "benefitRate": 27.3,
    "lng": 126.83236,
    "lat": 37.66014
  },
  {
    "name": "김포시",
    "code": "31230",
    "score": 54.6,
    "rank": 15,
    "perCapita": 8.1,
    "benefitRate": 38.8,
    "lng": 126.65982,
    "lat": 37.68483
  },
  {
    "name": "부천시",
    "code": "31050",
    "score": 54.4,
    "rank": 16,
    "perCapita": 3.6,
    "benefitRate": 43.5,
    "lng": 126.78754,
    "lat": 37.50631
  },
  {
    "name": "의정부시",
    "code": "31030",
    "score": 54.3,
    "rank": 17,
    "perCapita": 5.3,
    "benefitRate": 25.1,
    "lng": 127.07448,
    "lat": 37.73308
  },
  {
    "name": "용인시",
    "code": "31190",
    "score": 51.5,
    "rank": 18,
    "perCapita": 7.4,
    "benefitRate": 35,
    "lng": 127.22212,
    "lat": 37.22798
  },
  {
    "name": "양주시",
    "code": "31260",
    "score": 49,
    "rank": 19,
    "perCapita": 7.7,
    "benefitRate": 17.1,
    "lng": 127.01207,
    "lat": 37.8054
  },
  {
    "name": "평택시",
    "code": "31070",
    "score": 48.8,
    "rank": 20,
    "perCapita": 8.5,
    "benefitRate": 32.6,
    "lng": 126.96669,
    "lat": 37.02313
  },
  {
    "name": "동두천시",
    "code": "31080",
    "score": 46.1,
    "rank": 21,
    "perCapita": 6.7,
    "benefitRate": 13.5,
    "lng": 127.0808,
    "lat": 37.9207
  },
  {
    "name": "남양주시",
    "code": "31130",
    "score": 43.4,
    "rank": 22,
    "perCapita": 7,
    "benefitRate": 15.7,
    "lng": 127.23061,
    "lat": 37.64301
  },
  {
    "name": "파주시",
    "code": "31200",
    "score": 42.8,
    "rank": 23,
    "perCapita": 13.1,
    "benefitRate": 11,
    "lng": 126.83821,
    "lat": 37.8496
  },
  {
    "name": "이천시",
    "code": "31210",
    "score": 38.1,
    "rank": 24,
    "perCapita": 10.5,
    "benefitRate": 10.3,
    "lng": 127.4839,
    "lat": 37.20147
  },
  {
    "name": "연천군",
    "code": "31550",
    "score": 36.4,
    "rank": 25,
    "perCapita": 15.8,
    "benefitRate": 25.4,
    "lng": 126.98896,
    "lat": 38.10524
  },
  {
    "name": "가평군",
    "code": "31570",
    "score": 33.9,
    "rank": 26,
    "perCapita": 5.4,
    "benefitRate": 4.7,
    "lng": 127.44203,
    "lat": 37.81118
  },
  {
    "name": "안성시",
    "code": "31220",
    "score": 33.2,
    "rank": 27,
    "perCapita": 3.6,
    "benefitRate": 9.7,
    "lng": 127.3093,
    "lat": 37.02483
  },
  {
    "name": "광주시",
    "code": "31250",
    "score": 30.3,
    "rank": 28,
    "perCapita": 3.6,
    "benefitRate": 12.1,
    "lng": 127.28962,
    "lat": 37.40044
  },
  {
    "name": "여주시",
    "code": "31280",
    "score": 27.9,
    "rank": 29,
    "perCapita": 8.7,
    "benefitRate": 3.3,
    "lng": 127.58332,
    "lat": 37.28774
  },
  {
    "name": "양평군",
    "code": "31580",
    "score": 27.8,
    "rank": 30,
    "perCapita": 4.6,
    "benefitRate": 9.8,
    "lng": 127.57702,
    "lat": 37.5189
  },
  {
    "name": "포천시",
    "code": "31270",
    "score": 17.6,
    "rank": 31,
    "perCapita": 2.6,
    "benefitRate": 3,
    "lng": 127.26844,
    "lat": 37.96763
  },
  {
    "name": "경기도",
    "code": "31000",
    "score": 0,
    "rank": null,
    "perCapita": 8.4,
    "benefitRate": 29,
    "lng": 127.18738,
    "lat": 37.56654
  }
];

/** 접근성 등고선 밴드 정의. gen-gyeonggi-parks.js 의 LEVELS 와 동일해야 한다. */
export const ACCESS_LEVELS = [
  {
    "min": 0.5,
    "label": "낮음"
  },
  {
    "min": 1.5,
    "label": "보통"
  },
  {
    "min": 3.5,
    "label": "양호"
  },
  {
    "min": 7,
    "label": "높음"
  },
  {
    "min": 12,
    "label": "매우 높음"
  }
] as const;

/** 평가 기준일 (YYYYMMDD) */
export const PARK_SCORE_CRTR_YMD = '20240630';
/** 접근성 모델에 들어간 공원 폴리곤 수 (슬리버 제외) */
export const PARK_FEATURE_COUNT = 32295;
/** 모델에 들어간 공원 총면적 km² */
export const PARK_TOTAL_AREA_KM2 = 61.1;
/** 읍면동 평가 구역 수 */
export const EMD_COUNT = 600;
