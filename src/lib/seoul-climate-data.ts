// 서울 기후 데이터
//
// 출처 및 산출 방식
// - name / lat / lng : 자치구 도시대기측정소 좌표 (src/lib/mock-public-data.ts 와 동일)
// - population       : 2024년 주민등록인구 근사치 (측정값)
// - areaKm2          : 지적통계 기준 자치구 면적 (측정값)
// - ghgPerCapita     : 자치구 토지이용 유형(도심/상업/공업/주거)별 1인당 배출계수 (파생)
// - ghgTotal         : population x ghgPerCapita / 1000 (파생)
// - energyUse        : population x 유형별 1인당 최종에너지 원단위 (파생)
// - solarCapacity    : 자치구 보급 지수와 면적 기반 추정 (파생)
// - greenRatio       : 산지·공원 보유 현황 기반 공원녹지율 근사 (파생)
// - SEOUL_HEAT_GRID  : 여름 오후 지표온도(LST) 공간분포 모델. 도심 열원(중구·종로,
//                      영등포·구로, 강남)과 냉원(북한산·관악산·남산·한강)을 중첩하여 산출 (파생)
// - SDOT_STATIONS    : S-DoT 관측망을 모사한 데모 지점. 위치명은 실제 지명이나
//                      관측값은 위 LST 모델에서 파생 (파생)
//
// 측정값 외 항목은 실제 관측/통계가 아닌 데모용 추정치다.
// 재생성: node scripts/gen-seoul-climate-data.js src/lib/seoul-climate-data.ts
// 실데이터로 교체할 때는 이 파일만 바꾸면 된다.

export interface SeoulDistrictClimate {
  code: string;
  name: string;
  lat: number;
  lng: number;
  ghgTotal: number;
  ghgPerCapita: number;
  energyUse: number;
  solarCapacity: number;
  greenRatio: number;
  population: number;
  areaKm2: number;
}

export interface SeoulHeatCell {
  lng: number;
  lat: number;
  lst: number;
  anomaly: number;
}

export interface SDotStation {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  temp: number;
  humidity: number;
  pm25: number;
  noise: number;
}

export const SEOUL_DISTRICTS: SeoulDistrictClimate[] = [
  {
    "code": "11110",
    "name": "종로구",
    "lat": 37.572,
    "lng": 126.979,
    "ghgTotal": 896,
    "ghgPerCapita": 6.4,
    "energyUse": 322000,
    "solarCapacity": 9347,
    "greenRatio": 52,
    "population": 140000,
    "areaKm2": 23.91
  },
  {
    "code": "11140",
    "name": "중구",
    "lat": 37.5641,
    "lng": 126.9979,
    "ghgTotal": 768,
    "ghgPerCapita": 6.4,
    "energyUse": 276000,
    "solarCapacity": 11394,
    "greenRatio": 20,
    "population": 120000,
    "areaKm2": 9.96
  },
  {
    "code": "11170",
    "name": "용산구",
    "lat": 37.532,
    "lng": 126.99,
    "ghgTotal": 1376,
    "ghgPerCapita": 6.4,
    "energyUse": 494500,
    "solarCapacity": 10062,
    "greenRatio": 33,
    "population": 215000,
    "areaKm2": 21.87
  },
  {
    "code": "11200",
    "name": "성동구",
    "lat": 37.5634,
    "lng": 127.0371,
    "ghgTotal": 1204,
    "ghgPerCapita": 4.3,
    "energyUse": 448000,
    "solarCapacity": 10359,
    "greenRatio": 22,
    "population": 280000,
    "areaKm2": 16.85
  },
  {
    "code": "11215",
    "name": "광진구",
    "lat": 37.5385,
    "lng": 127.0823,
    "ghgTotal": 1224,
    "ghgPerCapita": 3.6,
    "energyUse": 459000,
    "solarCapacity": 11388,
    "greenRatio": 28,
    "population": 340000,
    "areaKm2": 17.06
  },
  {
    "code": "11230",
    "name": "동대문구",
    "lat": 37.5744,
    "lng": 127.0396,
    "ghgTotal": 1462,
    "ghgPerCapita": 4.3,
    "energyUse": 544000,
    "solarCapacity": 12991,
    "greenRatio": 15,
    "population": 340000,
    "areaKm2": 14.22
  },
  {
    "code": "11260",
    "name": "중랑구",
    "lat": 37.6063,
    "lng": 127.0927,
    "ghgTotal": 1386,
    "ghgPerCapita": 3.6,
    "energyUse": 519750,
    "solarCapacity": 12590,
    "greenRatio": 32,
    "population": 385000,
    "areaKm2": 18.5
  },
  {
    "code": "11290",
    "name": "성북구",
    "lat": 37.5894,
    "lng": 127.0167,
    "ghgTotal": 1548,
    "ghgPerCapita": 3.6,
    "energyUse": 580500,
    "solarCapacity": 12440,
    "greenRatio": 38,
    "population": 430000,
    "areaKm2": 24.57
  },
  {
    "code": "11305",
    "name": "강북구",
    "lat": 37.6396,
    "lng": 127.0257,
    "ghgTotal": 1044,
    "ghgPerCapita": 3.6,
    "energyUse": 391500,
    "solarCapacity": 10304,
    "greenRatio": 54,
    "population": 290000,
    "areaKm2": 23.6
  },
  {
    "code": "11320",
    "name": "도봉구",
    "lat": 37.6688,
    "lng": 127.0471,
    "ghgTotal": 1098,
    "ghgPerCapita": 3.6,
    "energyUse": 411750,
    "solarCapacity": 10898,
    "greenRatio": 56,
    "population": 305000,
    "areaKm2": 20.7
  },
  {
    "code": "11350",
    "name": "노원구",
    "lat": 37.654,
    "lng": 127.056,
    "ghgTotal": 1800,
    "ghgPerCapita": 3.6,
    "energyUse": 675000,
    "solarCapacity": 16962,
    "greenRatio": 48,
    "population": 500000,
    "areaKm2": 35.44
  },
  {
    "code": "11380",
    "name": "은평구",
    "lat": 37.6027,
    "lng": 126.9291,
    "ghgTotal": 1656,
    "ghgPerCapita": 3.6,
    "energyUse": 621000,
    "solarCapacity": 15159,
    "greenRatio": 47,
    "population": 460000,
    "areaKm2": 29.71
  },
  {
    "code": "11410",
    "name": "서대문구",
    "lat": 37.5791,
    "lng": 126.9368,
    "ghgTotal": 1312,
    "ghgPerCapita": 4.3,
    "energyUse": 488000,
    "solarCapacity": 10465,
    "greenRatio": 41,
    "population": 305000,
    "areaKm2": 17.61
  },
  {
    "code": "11440",
    "name": "마포구",
    "lat": 37.566,
    "lng": 126.901,
    "ghgTotal": 1570,
    "ghgPerCapita": 4.3,
    "energyUse": 584000,
    "solarCapacity": 13339,
    "greenRatio": 24,
    "population": 365000,
    "areaKm2": 23.85
  },
  {
    "code": "11470",
    "name": "양천구",
    "lat": 37.517,
    "lng": 126.8664,
    "ghgTotal": 1548,
    "ghgPerCapita": 3.6,
    "energyUse": 580500,
    "solarCapacity": 11437,
    "greenRatio": 19,
    "population": 430000,
    "areaKm2": 17.41
  },
  {
    "code": "11500",
    "name": "강서구",
    "lat": 37.5509,
    "lng": 126.8495,
    "ghgTotal": 2451,
    "ghgPerCapita": 4.3,
    "energyUse": 912000,
    "solarCapacity": 20802,
    "greenRatio": 26,
    "population": 570000,
    "areaKm2": 41.44
  },
  {
    "code": "11530",
    "name": "구로구",
    "lat": 37.495,
    "lng": 126.858,
    "ghgTotal": 2080,
    "ghgPerCapita": 5.2,
    "energyUse": 780000,
    "solarCapacity": 14817,
    "greenRatio": 21,
    "population": 400000,
    "areaKm2": 20.12
  },
  {
    "code": "11545",
    "name": "금천구",
    "lat": 37.4569,
    "lng": 126.8956,
    "ghgTotal": 1196,
    "ghgPerCapita": 5.2,
    "energyUse": 448500,
    "solarCapacity": 10823,
    "greenRatio": 18,
    "population": 230000,
    "areaKm2": 13.02
  },
  {
    "code": "11560",
    "name": "영등포구",
    "lat": 37.526,
    "lng": 126.896,
    "ghgTotal": 2175,
    "ghgPerCapita": 5.8,
    "energyUse": 787500,
    "solarCapacity": 14437,
    "greenRatio": 17,
    "population": 375000,
    "areaKm2": 24.55
  },
  {
    "code": "11590",
    "name": "동작구",
    "lat": 37.5124,
    "lng": 126.9393,
    "ghgTotal": 1368,
    "ghgPerCapita": 3.6,
    "energyUse": 513000,
    "solarCapacity": 10289,
    "greenRatio": 29,
    "population": 380000,
    "areaKm2": 16.35
  },
  {
    "code": "11620",
    "name": "관악구",
    "lat": 37.4784,
    "lng": 126.9516,
    "ghgTotal": 1764,
    "ghgPerCapita": 3.6,
    "energyUse": 661500,
    "solarCapacity": 14140,
    "greenRatio": 56,
    "population": 490000,
    "areaKm2": 29.57
  },
  {
    "code": "11650",
    "name": "서초구",
    "lat": 37.484,
    "lng": 127.032,
    "ghgTotal": 2349,
    "ghgPerCapita": 5.8,
    "energyUse": 850500,
    "solarCapacity": 19577,
    "greenRatio": 49,
    "population": 405000,
    "areaKm2": 46.98
  },
  {
    "code": "11680",
    "name": "강남구",
    "lat": 37.518,
    "lng": 127.047,
    "ghgTotal": 3219,
    "ghgPerCapita": 5.8,
    "energyUse": 1165500,
    "solarCapacity": 21530,
    "greenRatio": 24,
    "population": 555000,
    "areaKm2": 39.5
  },
  {
    "code": "11710",
    "name": "송파구",
    "lat": 37.515,
    "lng": 127.106,
    "ghgTotal": 3770,
    "ghgPerCapita": 5.8,
    "energyUse": 1365000,
    "solarCapacity": 19742,
    "greenRatio": 27,
    "population": 650000,
    "areaKm2": 33.87
  },
  {
    "code": "11740",
    "name": "강동구",
    "lat": 37.5301,
    "lng": 127.1238,
    "ghgTotal": 1674,
    "ghgPerCapita": 3.6,
    "energyUse": 627750,
    "solarCapacity": 14443,
    "greenRatio": 30,
    "population": 465000,
    "areaKm2": 24.59
  }
];

export const SEOUL_HEAT_GRID: SeoulHeatCell[] = [{"lng":126.91,"lat":37.432,"lst":29.8,"anomaly":-2.2},{"lng":127.0525,"lat":37.432,"lst":30.9,"anomaly":-1.1},{"lng":127.06,"lat":37.432,"lst":31.1,"anomaly":-0.9},{"lng":127.0675,"lat":37.432,"lst":31.3,"anomaly":-0.7},{"lng":126.9025,"lat":37.438,"lst":30.6,"anomaly":-1.4},{"lng":126.91,"lat":37.438,"lst":30.1,"anomaly":-1.9},{"lng":126.9175,"lat":37.438,"lst":29.6,"anomaly":-2.4},{"lng":126.9475,"lat":37.438,"lst":28,"anomaly":-4},{"lng":126.955,"lat":37.438,"lst":27.8,"anomaly":-4.2},{"lng":127.045,"lat":37.438,"lst":30.7,"anomaly":-1.3},{"lng":127.0525,"lat":37.438,"lst":31,"anomaly":-1},{"lng":127.06,"lat":37.438,"lst":31.3,"anomaly":-0.7},{"lng":127.0675,"lat":37.438,"lst":31.5,"anomaly":-0.5},{"lng":126.9025,"lat":37.444,"lst":31,"anomaly":-1},{"lng":126.91,"lat":37.444,"lst":30.5,"anomaly":-1.5},{"lng":126.9175,"lat":37.444,"lst":30,"anomaly":-2},{"lng":126.925,"lat":37.444,"lst":29.4,"anomaly":-2.6},{"lng":126.94,"lat":37.444,"lst":28.5,"anomaly":-3.5},{"lng":126.9475,"lat":37.444,"lst":28.2,"anomaly":-3.8},{"lng":126.955,"lat":37.444,"lst":28,"anomaly":-4},{"lng":126.9625,"lat":37.444,"lst":27.8,"anomaly":-4.2},{"lng":126.97,"lat":37.444,"lst":27.8,"anomaly":-4.2},{"lng":127.045,"lat":37.444,"lst":30.8,"anomaly":-1.2},{"lng":127.0525,"lat":37.444,"lst":31.2,"anomaly":-0.8},{"lng":127.06,"lat":37.444,"lst":31.6,"anomaly":-0.4},{"lng":127.0675,"lat":37.444,"lst":31.8,"anomaly":-0.2},{"lng":127.075,"lat":37.444,"lst":32,"anomaly":0},{"lng":127.0825,"lat":37.444,"lst":32,"anomaly":0},{"lng":127.09,"lat":37.444,"lst":32,"anomaly":0},{"lng":126.895,"lat":37.45,"lst":31.9,"anomaly":-0.1},{"lng":126.9025,"lat":37.45,"lst":31.5,"anomaly":-0.5},{"lng":126.91,"lat":37.45,"lst":30.9,"anomaly":-1.1},{"lng":126.9175,"lat":37.45,"lst":30.4,"anomaly":-1.6},{"lng":126.925,"lat":37.45,"lst":29.8,"anomaly":-2.2},{"lng":126.9325,"lat":37.45,"lst":29.3,"anomaly":-2.7},{"lng":126.94,"lat":37.45,"lst":28.9,"anomaly":-3.1},{"lng":126.9475,"lat":37.45,"lst":28.5,"anomaly":-3.5},{"lng":126.955,"lat":37.45,"lst":28.2,"anomaly":-3.8},{"lng":126.9625,"lat":37.45,"lst":28.1,"anomaly":-3.9},{"lng":126.97,"lat":37.45,"lst":28,"anomaly":-4},{"lng":126.9775,"lat":37.45,"lst":28.1,"anomaly":-3.9},{"lng":127.045,"lat":37.45,"lst":31.1,"anomaly":-0.9},{"lng":127.0525,"lat":37.45,"lst":31.5,"anomaly":-0.5},{"lng":127.06,"lat":37.45,"lst":31.8,"anomaly":-0.2},{"lng":127.0675,"lat":37.45,"lst":32.1,"anomaly":0.1},{"lng":127.075,"lat":37.45,"lst":32.3,"anomaly":0.3},{"lng":127.0825,"lat":37.45,"lst":32.3,"anomaly":0.3},{"lng":127.09,"lat":37.45,"lst":32.3,"anomaly":0.3},{"lng":126.895,"lat":37.456,"lst":32.4,"anomaly":0.4},{"lng":126.9025,"lat":37.456,"lst":32,"anomaly":0},{"lng":126.91,"lat":37.456,"lst":31.4,"anomaly":-0.6},{"lng":126.9175,"lat":37.456,"lst":30.9,"anomaly":-1.1},{"lng":126.925,"lat":37.456,"lst":30.3,"anomaly":-1.7},{"lng":126.9325,"lat":37.456,"lst":29.7,"anomaly":-2.3},{"lng":126.94,"lat":37.456,"lst":29.3,"anomaly":-2.7},{"lng":126.9475,"lat":37.456,"lst":28.9,"anomaly":-3.1},{"lng":126.955,"lat":37.456,"lst":28.6,"anomaly":-3.4},{"lng":126.9625,"lat":37.456,"lst":28.4,"anomaly":-3.6},{"lng":126.97,"lat":37.456,"lst":28.3,"anomaly":-3.7},{"lng":126.9775,"lat":37.456,"lst":28.3,"anomaly":-3.7},{"lng":126.985,"lat":37.456,"lst":28.4,"anomaly":-3.6},{"lng":127.015,"lat":37.456,"lst":29.4,"anomaly":-2.6},{"lng":127.0225,"lat":37.456,"lst":29.8,"anomaly":-2.2},{"lng":127.0375,"lat":37.456,"lst":30.8,"anomaly":-1.2},{"lng":127.045,"lat":37.456,"lst":31.3,"anomaly":-0.7},{"lng":127.0525,"lat":37.456,"lst":31.8,"anomaly":-0.2},{"lng":127.06,"lat":37.456,"lst":32.2,"anomaly":0.2},{"lng":127.0675,"lat":37.456,"lst":32.4,"anomaly":0.4},{"lng":127.075,"lat":37.456,"lst":32.6,"anomaly":0.6},{"lng":127.0825,"lat":37.456,"lst":32.7,"anomaly":0.7},{"lng":127.09,"lat":37.456,"lst":32.7,"anomaly":0.7},{"lng":126.895,"lat":37.462,"lst":33,"anomaly":1},{"lng":126.9025,"lat":37.462,"lst":32.5,"anomaly":0.5},{"lng":126.91,"lat":37.462,"lst":32,"anomaly":0},{"lng":126.9175,"lat":37.462,"lst":31.4,"anomaly":-0.6},{"lng":126.925,"lat":37.462,"lst":30.8,"anomaly":-1.2},{"lng":126.9325,"lat":37.462,"lst":30.2,"anomaly":-1.8},{"lng":126.94,"lat":37.462,"lst":29.8,"anomaly":-2.2},{"lng":126.9475,"lat":37.462,"lst":29.4,"anomaly":-2.6},{"lng":126.955,"lat":37.462,"lst":29.1,"anomaly":-2.9},{"lng":126.9625,"lat":37.462,"lst":28.9,"anomaly":-3.1},{"lng":126.97,"lat":37.462,"lst":28.8,"anomaly":-3.2},{"lng":126.9775,"lat":37.462,"lst":28.7,"anomaly":-3.3},{"lng":126.985,"lat":37.462,"lst":28.8,"anomaly":-3.2},{"lng":126.9925,"lat":37.462,"lst":28.9,"anomaly":-3.1},{"lng":127.0075,"lat":37.462,"lst":29.3,"anomaly":-2.7},{"lng":127.015,"lat":37.462,"lst":29.7,"anomaly":-2.3},{"lng":127.0225,"lat":37.462,"lst":30.1,"anomaly":-1.9},{"lng":127.03,"lat":37.462,"lst":30.6,"anomaly":-1.4},{"lng":127.0375,"lat":37.462,"lst":31.1,"anomaly":-0.9},{"lng":127.045,"lat":37.462,"lst":31.7,"anomaly":-0.3},{"lng":127.0525,"lat":37.462,"lst":32.1,"anomaly":0.1},{"lng":127.06,"lat":37.462,"lst":32.5,"anomaly":0.5},{"lng":127.0675,"lat":37.462,"lst":32.8,"anomaly":0.8},{"lng":127.075,"lat":37.462,"lst":33,"anomaly":1},{"lng":127.0825,"lat":37.462,"lst":33.1,"anomaly":1.1},{"lng":127.09,"lat":37.462,"lst":33,"anomaly":1},{"lng":127.0975,"lat":37.462,"lst":32.9,"anomaly":0.9},{"lng":127.105,"lat":37.462,"lst":32.8,"anomaly":0.8},{"lng":127.1125,"lat":37.462,"lst":32.6,"anomaly":0.6},{"lng":127.12,"lat":37.462,"lst":32.3,"anomaly":0.3},{"lng":126.8875,"lat":37.468,"lst":33.9,"anomaly":1.9},{"lng":126.895,"lat":37.468,"lst":33.5,"anomaly":1.5},{"lng":126.9025,"lat":37.468,"lst":33.1,"anomaly":1.1},{"lng":126.91,"lat":37.468,"lst":32.6,"anomaly":0.6},{"lng":126.9175,"lat":37.468,"lst":32,"anomaly":0},{"lng":126.925,"lat":37.468,"lst":31.4,"anomaly":-0.6},{"lng":126.9325,"lat":37.468,"lst":30.8,"anomaly":-1.2},{"lng":126.94,"lat":37.468,"lst":30.3,"anomaly":-1.7},{"lng":126.9475,"lat":37.468,"lst":29.9,"anomaly":-2.1},{"lng":126.955,"lat":37.468,"lst":29.6,"anomaly":-2.4},{"lng":126.9625,"lat":37.468,"lst":29.4,"anomaly":-2.6},{"lng":126.97,"lat":37.468,"lst":29.2,"anomaly":-2.8},{"lng":126.9775,"lat":37.468,"lst":29.2,"anomaly":-2.8},{"lng":126.985,"lat":37.468,"lst":29.2,"anomaly":-2.8},{"lng":126.9925,"lat":37.468,"lst":29.3,"anomaly":-2.7},{"lng":127,"lat":37.468,"lst":29.5,"anomaly":-2.5},{"lng":127.0075,"lat":37.468,"lst":29.8,"anomaly":-2.2},{"lng":127.015,"lat":37.468,"lst":30.1,"anomaly":-1.9},{"lng":127.0225,"lat":37.468,"lst":30.5,"anomaly":-1.5},{"lng":127.03,"lat":37.468,"lst":31,"anomaly":-1},{"lng":127.0375,"lat":37.468,"lst":31.5,"anomaly":-0.5},{"lng":127.045,"lat":37.468,"lst":32.1,"anomaly":0.1},{"lng":127.0525,"lat":37.468,"lst":32.5,"anomaly":0.5},{"lng":127.06,"lat":37.468,"lst":32.9,"anomaly":0.9},{"lng":127.0675,"lat":37.468,"lst":33.2,"anomaly":1.2},{"lng":127.075,"lat":37.468,"lst":33.4,"anomaly":1.4},{"lng":127.0825,"lat":37.468,"lst":33.4,"anomaly":1.4},{"lng":127.09,"lat":37.468,"lst":33.4,"anomaly":1.4},{"lng":127.0975,"lat":37.468,"lst":33.3,"anomaly":1.3},{"lng":127.105,"lat":37.468,"lst":33.1,"anomaly":1.1},{"lng":127.1125,"lat":37.468,"lst":32.9,"anomaly":0.9},{"lng":127.12,"lat":37.468,"lst":32.6,"anomaly":0.6},{"lng":127.1275,"lat":37.468,"lst":32.3,"anomaly":0.3},{"lng":126.8275,"lat":37.474,"lst":32.7,"anomaly":0.7},{"lng":126.8425,"lat":37.474,"lst":33.6,"anomaly":1.6},{"lng":126.88,"lat":37.474,"lst":34.6,"anomaly":2.6},{"lng":126.8875,"lat":37.474,"lst":34.4,"anomaly":2.4},{"lng":126.895,"lat":37.474,"lst":34.1,"anomaly":2.1},{"lng":126.9025,"lat":37.474,"lst":33.7,"anomaly":1.7},{"lng":126.91,"lat":37.474,"lst":33.2,"anomaly":1.2},{"lng":126.9175,"lat":37.474,"lst":32.6,"anomaly":0.6},{"lng":126.925,"lat":37.474,"lst":32,"anomaly":0},{"lng":126.9325,"lat":37.474,"lst":31.4,"anomaly":-0.6},{"lng":126.94,"lat":37.474,"lst":30.9,"anomaly":-1.1},{"lng":126.9475,"lat":37.474,"lst":30.5,"anomaly":-1.5},{"lng":126.955,"lat":37.474,"lst":30.2,"anomaly":-1.8},{"lng":126.9625,"lat":37.474,"lst":29.9,"anomaly":-2.1},{"lng":126.97,"lat":37.474,"lst":29.8,"anomaly":-2.2},{"lng":126.9775,"lat":37.474,"lst":29.7,"anomaly":-2.3},{"lng":126.985,"lat":37.474,"lst":29.8,"anomaly":-2.2},{"lng":126.9925,"lat":37.474,"lst":29.8,"anomaly":-2.2},{"lng":127,"lat":37.474,"lst":30,"anomaly":-2},{"lng":127.0075,"lat":37.474,"lst":30.3,"anomaly":-1.7},{"lng":127.015,"lat":37.474,"lst":30.6,"anomaly":-1.4},{"lng":127.0225,"lat":37.474,"lst":31,"anomaly":-1},{"lng":127.03,"lat":37.474,"lst":31.5,"anomaly":-0.5},{"lng":127.0375,"lat":37.474,"lst":32,"anomaly":0},{"lng":127.045,"lat":37.474,"lst":32.5,"anomaly":0.5},{"lng":127.0525,"lat":37.474,"lst":33,"anomaly":1},{"lng":127.06,"lat":37.474,"lst":33.3,"anomaly":1.3},{"lng":127.0675,"lat":37.474,"lst":33.6,"anomaly":1.6},{"lng":127.075,"lat":37.474,"lst":33.8,"anomaly":1.8},{"lng":127.0825,"lat":37.474,"lst":33.8,"anomaly":1.8},{"lng":127.09,"lat":37.474,"lst":33.8,"anomaly":1.8},{"lng":127.0975,"lat":37.474,"lst":33.6,"anomaly":1.6},{"lng":127.105,"lat":37.474,"lst":33.4,"anomaly":1.4},{"lng":127.1125,"lat":37.474,"lst":33.2,"anomaly":1.2},{"lng":127.12,"lat":37.474,"lst":32.9,"anomaly":0.9},{"lng":127.1275,"lat":37.474,"lst":32.6,"anomaly":0.6},{"lng":127.135,"lat":37.474,"lst":32.3,"anomaly":0.3},{"lng":127.1425,"lat":37.474,"lst":32,"anomaly":0},{"lng":126.8275,"lat":37.48,"lst":32.9,"anomaly":0.9},{"lng":126.835,"lat":37.48,"lst":33.4,"anomaly":1.4},{"lng":126.8425,"lat":37.48,"lst":33.9,"anomaly":1.9},{"lng":126.85,"lat":37.48,"lst":34.3,"anomaly":2.3},{"lng":126.88,"lat":37.48,"lst":35.1,"anomaly":3.1},{"lng":126.8875,"lat":37.48,"lst":34.9,"anomaly":2.9},{"lng":126.895,"lat":37.48,"lst":34.7,"anomaly":2.7},{"lng":126.9025,"lat":37.48,"lst":34.3,"anomaly":2.3},{"lng":126.91,"lat":37.48,"lst":33.8,"anomaly":1.8},{"lng":126.9175,"lat":37.48,"lst":33.2,"anomaly":1.2},{"lng":126.925,"lat":37.48,"lst":32.6,"anomaly":0.6},{"lng":126.9325,"lat":37.48,"lst":32,"anomaly":0},{"lng":126.94,"lat":37.48,"lst":31.5,"anomaly":-0.5},{"lng":126.9475,"lat":37.48,"lst":31.1,"anomaly":-0.9},{"lng":126.955,"lat":37.48,"lst":30.8,"anomaly":-1.2},{"lng":126.9625,"lat":37.48,"lst":30.5,"anomaly":-1.5},{"lng":126.97,"lat":37.48,"lst":30.4,"anomaly":-1.6},{"lng":126.9775,"lat":37.48,"lst":30.3,"anomaly":-1.7},{"lng":126.985,"lat":37.48,"lst":30.3,"anomaly":-1.7},{"lng":126.9925,"lat":37.48,"lst":30.4,"anomaly":-1.6},{"lng":127,"lat":37.48,"lst":30.5,"anomaly":-1.5},{"lng":127.0075,"lat":37.48,"lst":30.8,"anomaly":-1.2},{"lng":127.015,"lat":37.48,"lst":31.1,"anomaly":-0.9},{"lng":127.0225,"lat":37.48,"lst":31.5,"anomaly":-0.5},{"lng":127.03,"lat":37.48,"lst":32,"anomaly":0},{"lng":127.0375,"lat":37.48,"lst":32.4,"anomaly":0.4},{"lng":127.045,"lat":37.48,"lst":32.9,"anomaly":0.9},{"lng":127.0525,"lat":37.48,"lst":33.4,"anomaly":1.4},{"lng":127.06,"lat":37.48,"lst":33.7,"anomaly":1.7},{"lng":127.0675,"lat":37.48,"lst":34,"anomaly":2},{"lng":127.075,"lat":37.48,"lst":34.1,"anomaly":2.1},{"lng":127.0825,"lat":37.48,"lst":34.2,"anomaly":2.2},{"lng":127.09,"lat":37.48,"lst":34.1,"anomaly":2.1},{"lng":127.0975,"lat":37.48,"lst":33.9,"anomaly":1.9},{"lng":127.105,"lat":37.48,"lst":33.7,"anomaly":1.7},{"lng":127.1125,"lat":37.48,"lst":33.4,"anomaly":1.4},{"lng":127.12,"lat":37.48,"lst":33.1,"anomaly":1.1},{"lng":127.1275,"lat":37.48,"lst":32.8,"anomaly":0.8},{"lng":127.135,"lat":37.48,"lst":32.4,"anomaly":0.4},{"lng":127.1425,"lat":37.48,"lst":32.1,"anomaly":0.1},{"lng":127.15,"lat":37.48,"lst":31.8,"anomaly":-0.2},{"lng":126.8275,"lat":37.486,"lst":33.1,"anomaly":1.1},{"lng":126.835,"lat":37.486,"lst":33.6,"anomaly":1.6},{"lng":126.8425,"lat":37.486,"lst":34.1,"anomaly":2.1},{"lng":126.85,"lat":37.486,"lst":34.6,"anomaly":2.6},{"lng":126.8575,"lat":37.486,"lst":35,"anomaly":3},{"lng":126.88,"lat":37.486,"lst":35.5,"anomaly":3.5},{"lng":126.8875,"lat":37.486,"lst":35.4,"anomaly":3.4},{"lng":126.895,"lat":37.486,"lst":35.2,"anomaly":3.2},{"lng":126.9025,"lat":37.486,"lst":34.8,"anomaly":2.8},{"lng":126.91,"lat":37.486,"lst":34.3,"anomaly":2.3},{"lng":126.9175,"lat":37.486,"lst":33.8,"anomaly":1.8},{"lng":126.925,"lat":37.486,"lst":33.2,"anomaly":1.2},{"lng":126.9325,"lat":37.486,"lst":32.6,"anomaly":0.6},{"lng":126.94,"lat":37.486,"lst":32.1,"anomaly":0.1},{"lng":126.9475,"lat":37.486,"lst":31.7,"anomaly":-0.3},{"lng":126.955,"lat":37.486,"lst":31.3,"anomaly":-0.7},{"lng":126.9625,"lat":37.486,"lst":31.1,"anomaly":-0.9},{"lng":126.97,"lat":37.486,"lst":30.9,"anomaly":-1.1},{"lng":126.9775,"lat":37.486,"lst":30.8,"anomaly":-1.2},{"lng":126.985,"lat":37.486,"lst":30.8,"anomaly":-1.2},{"lng":126.9925,"lat":37.486,"lst":30.8,"anomaly":-1.2},{"lng":127,"lat":37.486,"lst":31,"anomaly":-1},{"lng":127.0075,"lat":37.486,"lst":31.3,"anomaly":-0.7},{"lng":127.015,"lat":37.486,"lst":31.6,"anomaly":-0.4},{"lng":127.0225,"lat":37.486,"lst":32,"anomaly":0},{"lng":127.03,"lat":37.486,"lst":32.4,"anomaly":0.4},{"lng":127.0375,"lat":37.486,"lst":32.9,"anomaly":0.9},{"lng":127.045,"lat":37.486,"lst":33.3,"anomaly":1.3},{"lng":127.0525,"lat":37.486,"lst":33.7,"anomaly":1.7},{"lng":127.06,"lat":37.486,"lst":34.1,"anomaly":2.1},{"lng":127.0675,"lat":37.486,"lst":34.3,"anomaly":2.3},{"lng":127.075,"lat":37.486,"lst":34.4,"anomaly":2.4},{"lng":127.0825,"lat":37.486,"lst":34.4,"anomaly":2.4},{"lng":127.09,"lat":37.486,"lst":34.3,"anomaly":2.3},{"lng":127.0975,"lat":37.486,"lst":34.2,"anomaly":2.2},{"lng":127.105,"lat":37.486,"lst":33.9,"anomaly":1.9},{"lng":127.1125,"lat":37.486,"lst":33.6,"anomaly":1.6},{"lng":127.12,"lat":37.486,"lst":33.3,"anomaly":1.3},{"lng":127.1275,"lat":37.486,"lst":33,"anomaly":1},{"lng":127.135,"lat":37.486,"lst":32.6,"anomaly":0.6},{"lng":127.1425,"lat":37.486,"lst":32.3,"anomaly":0.3},{"lng":127.15,"lat":37.486,"lst":31.9,"anomaly":-0.1},{"lng":127.1575,"lat":37.486,"lst":31.6,"anomaly":-0.4},{"lng":126.82,"lat":37.492,"lst":32.8,"anomaly":0.8},{"lng":126.8275,"lat":37.492,"lst":33.3,"anomaly":1.3},{"lng":126.835,"lat":37.492,"lst":33.9,"anomaly":1.9},{"lng":126.8425,"lat":37.492,"lst":34.4,"anomaly":2.4},{"lng":126.85,"lat":37.492,"lst":34.9,"anomaly":2.9},{"lng":126.8575,"lat":37.492,"lst":35.3,"anomaly":3.3},{"lng":126.865,"lat":37.492,"lst":35.7,"anomaly":3.7},{"lng":126.8725,"lat":37.492,"lst":35.9,"anomaly":3.9},{"lng":126.88,"lat":37.492,"lst":35.9,"anomaly":3.9},{"lng":126.8875,"lat":37.492,"lst":35.9,"anomaly":3.9},{"lng":126.895,"lat":37.492,"lst":35.6,"anomaly":3.6},{"lng":126.9025,"lat":37.492,"lst":35.3,"anomaly":3.3},{"lng":126.91,"lat":37.492,"lst":34.8,"anomaly":2.8},{"lng":126.9175,"lat":37.492,"lst":34.2,"anomaly":2.2},{"lng":126.925,"lat":37.492,"lst":33.6,"anomaly":1.6},{"lng":126.9325,"lat":37.492,"lst":33,"anomaly":1},{"lng":126.94,"lat":37.492,"lst":32.5,"anomaly":0.5},{"lng":126.9475,"lat":37.492,"lst":32.1,"anomaly":0.1},{"lng":126.955,"lat":37.492,"lst":31.8,"anomaly":-0.2},{"lng":126.9625,"lat":37.492,"lst":31.5,"anomaly":-0.5},{"lng":126.97,"lat":37.492,"lst":31.3,"anomaly":-0.7},{"lng":126.9775,"lat":37.492,"lst":31.2,"anomaly":-0.8},{"lng":126.985,"lat":37.492,"lst":31.1,"anomaly":-0.9},{"lng":126.9925,"lat":37.492,"lst":31.2,"anomaly":-0.8},{"lng":127,"lat":37.492,"lst":31.4,"anomaly":-0.6},{"lng":127.0075,"lat":37.492,"lst":31.6,"anomaly":-0.4},{"lng":127.015,"lat":37.492,"lst":32,"anomaly":0},{"lng":127.0225,"lat":37.492,"lst":32.3,"anomaly":0.3},{"lng":127.03,"lat":37.492,"lst":32.7,"anomaly":0.7},{"lng":127.0375,"lat":37.492,"lst":33.1,"anomaly":1.1},{"lng":127.045,"lat":37.492,"lst":33.6,"anomaly":1.6},{"lng":127.0525,"lat":37.492,"lst":34,"anomaly":2},{"lng":127.06,"lat":37.492,"lst":34.3,"anomaly":2.3},{"lng":127.0675,"lat":37.492,"lst":34.5,"anomaly":2.5},{"lng":127.075,"lat":37.492,"lst":34.6,"anomaly":2.6},{"lng":127.0825,"lat":37.492,"lst":34.6,"anomaly":2.6},{"lng":127.09,"lat":37.492,"lst":34.5,"anomaly":2.5},{"lng":127.0975,"lat":37.492,"lst":34.3,"anomaly":2.3},{"lng":127.105,"lat":37.492,"lst":34,"anomaly":2},{"lng":127.1125,"lat":37.492,"lst":33.8,"anomaly":1.8},{"lng":127.12,"lat":37.492,"lst":33.4,"anomaly":1.4},{"lng":127.1275,"lat":37.492,"lst":33.1,"anomaly":1.1},{"lng":127.135,"lat":37.492,"lst":32.7,"anomaly":0.7},{"lng":127.1425,"lat":37.492,"lst":32.4,"anomaly":0.4},{"lng":127.15,"lat":37.492,"lst":32,"anomaly":0},{"lng":127.1575,"lat":37.492,"lst":31.7,"anomaly":-0.3},{"lng":126.8275,"lat":37.498,"lst":33.5,"anomaly":1.5},{"lng":126.835,"lat":37.498,"lst":34.1,"anomaly":2.1},{"lng":126.8425,"lat":37.498,"lst":34.6,"anomaly":2.6},{"lng":126.85,"lat":37.498,"lst":35.1,"anomaly":3.1},{"lng":126.8575,"lat":37.498,"lst":35.6,"anomaly":3.6},{"lng":126.865,"lat":37.498,"lst":36,"anomaly":4},{"lng":126.8725,"lat":37.498,"lst":36.2,"anomaly":4.2},{"lng":126.88,"lat":37.498,"lst":36.3,"anomaly":4.3},{"lng":126.8875,"lat":37.498,"lst":36.2,"anomaly":4.2},{"lng":126.895,"lat":37.498,"lst":36,"anomaly":4},{"lng":126.9025,"lat":37.498,"lst":35.6,"anomaly":3.6},{"lng":126.91,"lat":37.498,"lst":35.2,"anomaly":3.2},{"lng":126.9175,"lat":37.498,"lst":34.6,"anomaly":2.6},{"lng":126.925,"lat":37.498,"lst":33.9,"anomaly":1.9},{"lng":126.9325,"lat":37.498,"lst":33.3,"anomaly":1.3},{"lng":126.94,"lat":37.498,"lst":32.8,"anomaly":0.8},{"lng":126.9475,"lat":37.498,"lst":32.4,"anomaly":0.4},{"lng":126.955,"lat":37.498,"lst":32,"anomaly":0},{"lng":126.9625,"lat":37.498,"lst":31.8,"anomaly":-0.2},{"lng":126.97,"lat":37.498,"lst":31.6,"anomaly":-0.4},{"lng":126.9775,"lat":37.498,"lst":31.4,"anomaly":-0.6},{"lng":126.985,"lat":37.498,"lst":31.4,"anomaly":-0.6},{"lng":126.9925,"lat":37.498,"lst":31.4,"anomaly":-0.6},{"lng":127,"lat":37.498,"lst":31.6,"anomaly":-0.4},{"lng":127.0075,"lat":37.498,"lst":31.9,"anomaly":-0.1},{"lng":127.015,"lat":37.498,"lst":32.2,"anomaly":0.2},{"lng":127.0225,"lat":37.498,"lst":32.5,"anomaly":0.5},{"lng":127.03,"lat":37.498,"lst":32.9,"anomaly":0.9},{"lng":127.0375,"lat":37.498,"lst":33.3,"anomaly":1.3},{"lng":127.045,"lat":37.498,"lst":33.6,"anomaly":1.6},{"lng":127.0525,"lat":37.498,"lst":34,"anomaly":2},{"lng":127.06,"lat":37.498,"lst":34.3,"anomaly":2.3},{"lng":127.0675,"lat":37.498,"lst":34.5,"anomaly":2.5},{"lng":127.075,"lat":37.498,"lst":34.5,"anomaly":2.5},{"lng":127.0825,"lat":37.498,"lst":34.5,"anomaly":2.5},{"lng":127.09,"lat":37.498,"lst":34.4,"anomaly":2.4},{"lng":127.0975,"lat":37.498,"lst":34.2,"anomaly":2.2},{"lng":127.105,"lat":37.498,"lst":34,"anomaly":2},{"lng":127.1125,"lat":37.498,"lst":33.8,"anomaly":1.8},{"lng":127.12,"lat":37.498,"lst":33.5,"anomaly":1.5},{"lng":127.1275,"lat":37.498,"lst":33.1,"anomaly":1.1},{"lng":127.135,"lat":37.498,"lst":32.8,"anomaly":0.8},{"lng":127.1425,"lat":37.498,"lst":32.4,"anomaly":0.4},{"lng":127.15,"lat":37.498,"lst":32.1,"anomaly":0.1},{"lng":127.1575,"lat":37.498,"lst":31.8,"anomaly":-0.2},{"lng":126.8275,"lat":37.504,"lst":33.7,"anomaly":1.7},{"lng":126.835,"lat":37.504,"lst":34.2,"anomaly":2.2},{"lng":126.8425,"lat":37.504,"lst":34.8,"anomaly":2.8},{"lng":126.85,"lat":37.504,"lst":35.3,"anomaly":3.3},{"lng":126.8575,"lat":37.504,"lst":35.8,"anomaly":3.8},{"lng":126.865,"lat":37.504,"lst":36.2,"anomaly":4.2},{"lng":126.8725,"lat":37.504,"lst":36.4,"anomaly":4.4},{"lng":126.88,"lat":37.504,"lst":36.5,"anomaly":4.5},{"lng":126.8875,"lat":37.504,"lst":36.5,"anomaly":4.5},{"lng":126.895,"lat":37.504,"lst":36.2,"anomaly":4.2},{"lng":126.9025,"lat":37.504,"lst":35.9,"anomaly":3.9},{"lng":126.91,"lat":37.504,"lst":35.4,"anomaly":3.4},{"lng":126.9175,"lat":37.504,"lst":34.7,"anomaly":2.7},{"lng":126.925,"lat":37.504,"lst":34.1,"anomaly":2.1},{"lng":126.9325,"lat":37.504,"lst":33.4,"anomaly":1.4},{"lng":126.94,"lat":37.504,"lst":32.9,"anomaly":0.9},{"lng":126.9475,"lat":37.504,"lst":32.5,"anomaly":0.5},{"lng":126.955,"lat":37.504,"lst":32.2,"anomaly":0.2},{"lng":126.9625,"lat":37.504,"lst":31.9,"anomaly":-0.1},{"lng":126.97,"lat":37.504,"lst":31.7,"anomaly":-0.3},{"lng":126.9775,"lat":37.504,"lst":31.6,"anomaly":-0.4},{"lng":126.985,"lat":37.504,"lst":31.5,"anomaly":-0.5},{"lng":126.9925,"lat":37.504,"lst":31.6,"anomaly":-0.4},{"lng":127,"lat":37.504,"lst":31.8,"anomaly":-0.2},{"lng":127.0075,"lat":37.504,"lst":32,"anomaly":0},{"lng":127.015,"lat":37.504,"lst":32.3,"anomaly":0.3},{"lng":127.0225,"lat":37.504,"lst":32.6,"anomaly":0.6},{"lng":127.03,"lat":37.504,"lst":33,"anomaly":1},{"lng":127.0375,"lat":37.504,"lst":33.3,"anomaly":1.3},{"lng":127.045,"lat":37.504,"lst":33.6,"anomaly":1.6},{"lng":127.0525,"lat":37.504,"lst":33.9,"anomaly":1.9},{"lng":127.06,"lat":37.504,"lst":34.1,"anomaly":2.1},{"lng":127.0675,"lat":37.504,"lst":34.2,"anomaly":2.2},{"lng":127.075,"lat":37.504,"lst":34.3,"anomaly":2.3},{"lng":127.0825,"lat":37.504,"lst":34.2,"anomaly":2.2},{"lng":127.09,"lat":37.504,"lst":34.1,"anomaly":2.1},{"lng":127.0975,"lat":37.504,"lst":33.9,"anomaly":1.9},{"lng":127.105,"lat":37.504,"lst":33.8,"anomaly":1.8},{"lng":127.1125,"lat":37.504,"lst":33.6,"anomaly":1.6},{"lng":127.12,"lat":37.504,"lst":33.3,"anomaly":1.3},{"lng":127.1275,"lat":37.504,"lst":33,"anomaly":1},{"lng":127.135,"lat":37.504,"lst":32.7,"anomaly":0.7},{"lng":127.1425,"lat":37.504,"lst":32.4,"anomaly":0.4},{"lng":126.8275,"lat":37.51,"lst":33.8,"anomaly":1.8},{"lng":126.835,"lat":37.51,"lst":34.4,"anomaly":2.4},{"lng":126.8425,"lat":37.51,"lst":34.9,"anomaly":2.9},{"lng":126.85,"lat":37.51,"lst":35.5,"anomaly":3.5},{"lng":126.8575,"lat":37.51,"lst":35.9,"anomaly":3.9},{"lng":126.865,"lat":37.51,"lst":36.3,"anomaly":4.3},{"lng":126.8725,"lat":37.51,"lst":36.5,"anomaly":4.5},{"lng":126.88,"lat":37.51,"lst":36.6,"anomaly":4.6},{"lng":126.8875,"lat":37.51,"lst":36.5,"anomaly":4.5},{"lng":126.895,"lat":37.51,"lst":36.3,"anomaly":4.3},{"lng":126.9025,"lat":37.51,"lst":35.9,"anomaly":3.9},{"lng":126.91,"lat":37.51,"lst":35.3,"anomaly":3.3},{"lng":126.9175,"lat":37.51,"lst":34.7,"anomaly":2.7},{"lng":126.925,"lat":37.51,"lst":34,"anomaly":2},{"lng":126.9325,"lat":37.51,"lst":33.3,"anomaly":1.3},{"lng":126.94,"lat":37.51,"lst":32.8,"anomaly":0.8},{"lng":126.9475,"lat":37.51,"lst":32.5,"anomaly":0.5},{"lng":126.955,"lat":37.51,"lst":32.2,"anomaly":0.2},{"lng":126.9625,"lat":37.51,"lst":32,"anomaly":0},{"lng":126.97,"lat":37.51,"lst":31.8,"anomaly":-0.2},{"lng":126.9775,"lat":37.51,"lst":31.7,"anomaly":-0.3},{"lng":126.985,"lat":37.51,"lst":31.7,"anomaly":-0.3},{"lng":126.9925,"lat":37.51,"lst":31.7,"anomaly":-0.3},{"lng":127,"lat":37.51,"lst":31.9,"anomaly":-0.1},{"lng":127.0075,"lat":37.51,"lst":32.2,"anomaly":0.2},{"lng":127.015,"lat":37.51,"lst":32.5,"anomaly":0.5},{"lng":127.0225,"lat":37.51,"lst":32.8,"anomaly":0.8},{"lng":127.03,"lat":37.51,"lst":33,"anomaly":1},{"lng":127.0375,"lat":37.51,"lst":33.3,"anomaly":1.3},{"lng":127.045,"lat":37.51,"lst":33.5,"anomaly":1.5},{"lng":127.0525,"lat":37.51,"lst":33.7,"anomaly":1.7},{"lng":127.06,"lat":37.51,"lst":33.8,"anomaly":1.8},{"lng":127.0675,"lat":37.51,"lst":33.9,"anomaly":1.9},{"lng":127.075,"lat":37.51,"lst":33.9,"anomaly":1.9},{"lng":127.0825,"lat":37.51,"lst":33.8,"anomaly":1.8},{"lng":127.09,"lat":37.51,"lst":33.6,"anomaly":1.6},{"lng":127.0975,"lat":37.51,"lst":33.5,"anomaly":1.5},{"lng":127.105,"lat":37.51,"lst":33.4,"anomaly":1.4},{"lng":127.1125,"lat":37.51,"lst":33.2,"anomaly":1.2},{"lng":127.12,"lat":37.51,"lst":33,"anomaly":1},{"lng":127.1275,"lat":37.51,"lst":32.7,"anomaly":0.7},{"lng":127.135,"lat":37.51,"lst":32.5,"anomaly":0.5},{"lng":127.1425,"lat":37.51,"lst":32.2,"anomaly":0.2},{"lng":126.8275,"lat":37.516,"lst":33.9,"anomaly":1.9},{"lng":126.835,"lat":37.516,"lst":34.5,"anomaly":2.5},{"lng":126.8425,"lat":37.516,"lst":35,"anomaly":3},{"lng":126.85,"lat":37.516,"lst":35.5,"anomaly":3.5},{"lng":126.8575,"lat":37.516,"lst":36,"anomaly":4},{"lng":126.865,"lat":37.516,"lst":36.3,"anomaly":4.3},{"lng":126.8725,"lat":37.516,"lst":36.5,"anomaly":4.5},{"lng":126.88,"lat":37.516,"lst":36.5,"anomaly":4.5},{"lng":126.8875,"lat":37.516,"lst":36.4,"anomaly":4.4},{"lng":126.895,"lat":37.516,"lst":36.1,"anomaly":4.1},{"lng":126.9025,"lat":37.516,"lst":35.7,"anomaly":3.7},{"lng":126.91,"lat":37.516,"lst":35.1,"anomaly":3.1},{"lng":126.9175,"lat":37.516,"lst":34.5,"anomaly":2.5},{"lng":126.925,"lat":37.516,"lst":33.8,"anomaly":1.8},{"lng":126.9325,"lat":37.516,"lst":33.2,"anomaly":1.2},{"lng":126.94,"lat":37.516,"lst":32.7,"anomaly":0.7},{"lng":126.9475,"lat":37.516,"lst":32.5,"anomaly":0.5},{"lng":126.955,"lat":37.516,"lst":32.3,"anomaly":0.3},{"lng":126.9625,"lat":37.516,"lst":32.1,"anomaly":0.1},{"lng":126.97,"lat":37.516,"lst":32,"anomaly":0},{"lng":126.9775,"lat":37.516,"lst":32,"anomaly":0},{"lng":126.985,"lat":37.516,"lst":32,"anomaly":0},{"lng":126.9925,"lat":37.516,"lst":32,"anomaly":0},{"lng":127,"lat":37.516,"lst":32.2,"anomaly":0.2},{"lng":127.0075,"lat":37.516,"lst":32.5,"anomaly":0.5},{"lng":127.015,"lat":37.516,"lst":32.8,"anomaly":0.8},{"lng":127.0225,"lat":37.516,"lst":33,"anomaly":1},{"lng":127.03,"lat":37.516,"lst":33.2,"anomaly":1.2},{"lng":127.0375,"lat":37.516,"lst":33.4,"anomaly":1.4},{"lng":127.045,"lat":37.516,"lst":33.5,"anomaly":1.5},{"lng":127.0525,"lat":37.516,"lst":33.6,"anomaly":1.6},{"lng":127.06,"lat":37.516,"lst":33.6,"anomaly":1.6},{"lng":127.0675,"lat":37.516,"lst":33.5,"anomaly":1.5},{"lng":127.075,"lat":37.516,"lst":33.4,"anomaly":1.4},{"lng":127.0825,"lat":37.516,"lst":33.3,"anomaly":1.3},{"lng":127.09,"lat":37.516,"lst":33.1,"anomaly":1.1},{"lng":127.0975,"lat":37.516,"lst":32.9,"anomaly":0.9},{"lng":127.105,"lat":37.516,"lst":32.8,"anomaly":0.8},{"lng":127.1125,"lat":37.516,"lst":32.6,"anomaly":0.6},{"lng":127.12,"lat":37.516,"lst":32.4,"anomaly":0.4},{"lng":127.1275,"lat":37.516,"lst":32.3,"anomaly":0.3},{"lng":127.135,"lat":37.516,"lst":32,"anomaly":0},{"lng":127.1425,"lat":37.516,"lst":31.8,"anomaly":-0.2},{"lng":126.835,"lat":37.522,"lst":34.5,"anomaly":2.5},{"lng":126.8425,"lat":37.522,"lst":35,"anomaly":3},{"lng":126.85,"lat":37.522,"lst":35.5,"anomaly":3.5},{"lng":126.8575,"lat":37.522,"lst":35.9,"anomaly":3.9},{"lng":126.865,"lat":37.522,"lst":36.2,"anomaly":4.2},{"lng":126.8725,"lat":37.522,"lst":36.3,"anomaly":4.3},{"lng":126.88,"lat":37.522,"lst":36.3,"anomaly":4.3},{"lng":126.8875,"lat":37.522,"lst":36.1,"anomaly":4.1},{"lng":126.895,"lat":37.522,"lst":35.7,"anomaly":3.7},{"lng":126.9025,"lat":37.522,"lst":35.2,"anomaly":3.2},{"lng":126.91,"lat":37.522,"lst":34.7,"anomaly":2.7},{"lng":126.9175,"lat":37.522,"lst":34.1,"anomaly":2.1},{"lng":126.925,"lat":37.522,"lst":33.6,"anomaly":1.6},{"lng":126.9325,"lat":37.522,"lst":33.1,"anomaly":1.1},{"lng":126.94,"lat":37.522,"lst":32.8,"anomaly":0.8},{"lng":126.9475,"lat":37.522,"lst":32.7,"anomaly":0.7},{"lng":126.955,"lat":37.522,"lst":32.6,"anomaly":0.6},{"lng":126.9625,"lat":37.522,"lst":32.5,"anomaly":0.5},{"lng":126.97,"lat":37.522,"lst":32.4,"anomaly":0.4},{"lng":126.9775,"lat":37.522,"lst":32.4,"anomaly":0.4},{"lng":126.985,"lat":37.522,"lst":32.5,"anomaly":0.5},{"lng":126.9925,"lat":37.522,"lst":32.6,"anomaly":0.6},{"lng":127,"lat":37.522,"lst":32.7,"anomaly":0.7},{"lng":127.0075,"lat":37.522,"lst":33,"anomaly":1},{"lng":127.015,"lat":37.522,"lst":33.3,"anomaly":1.3},{"lng":127.0225,"lat":37.522,"lst":33.5,"anomaly":1.5},{"lng":127.03,"lat":37.522,"lst":33.7,"anomaly":1.7},{"lng":127.0375,"lat":37.522,"lst":33.8,"anomaly":1.8},{"lng":127.045,"lat":37.522,"lst":33.8,"anomaly":1.8},{"lng":127.0525,"lat":37.522,"lst":33.7,"anomaly":1.7},{"lng":127.06,"lat":37.522,"lst":33.6,"anomaly":1.6},{"lng":127.0675,"lat":37.522,"lst":33.4,"anomaly":1.4},{"lng":127.075,"lat":37.522,"lst":33.2,"anomaly":1.2},{"lng":127.0825,"lat":37.522,"lst":32.9,"anomaly":0.9},{"lng":127.09,"lat":37.522,"lst":32.6,"anomaly":0.6},{"lng":127.0975,"lat":37.522,"lst":32.4,"anomaly":0.4},{"lng":127.105,"lat":37.522,"lst":32.2,"anomaly":0.2},{"lng":127.1125,"lat":37.522,"lst":32,"anomaly":0},{"lng":127.12,"lat":37.522,"lst":31.8,"anomaly":-0.2},{"lng":127.1275,"lat":37.522,"lst":31.6,"anomaly":-0.4},{"lng":127.135,"lat":37.522,"lst":31.4,"anomaly":-0.6},{"lng":127.1425,"lat":37.522,"lst":31.3,"anomaly":-0.7},{"lng":127.15,"lat":37.522,"lst":31.1,"anomaly":-0.9},{"lng":126.8275,"lat":37.528,"lst":33.8,"anomaly":1.8},{"lng":126.835,"lat":37.528,"lst":34.4,"anomaly":2.4},{"lng":126.8425,"lat":37.528,"lst":34.9,"anomaly":2.9},{"lng":126.85,"lat":37.528,"lst":35.3,"anomaly":3.3},{"lng":126.8575,"lat":37.528,"lst":35.7,"anomaly":3.7},{"lng":126.865,"lat":37.528,"lst":35.8,"anomaly":3.8},{"lng":126.8725,"lat":37.528,"lst":35.9,"anomaly":3.9},{"lng":126.88,"lat":37.528,"lst":35.8,"anomaly":3.8},{"lng":126.8875,"lat":37.528,"lst":35.5,"anomaly":3.5},{"lng":126.895,"lat":37.528,"lst":35.1,"anomaly":3.1},{"lng":126.9025,"lat":37.528,"lst":34.7,"anomaly":2.7},{"lng":126.91,"lat":37.528,"lst":34.2,"anomaly":2.2},{"lng":126.9175,"lat":37.528,"lst":33.7,"anomaly":1.7},{"lng":126.925,"lat":37.528,"lst":33.4,"anomaly":1.4},{"lng":126.9325,"lat":37.528,"lst":33.2,"anomaly":1.2},{"lng":126.94,"lat":37.528,"lst":33.1,"anomaly":1.1},{"lng":126.9475,"lat":37.528,"lst":33.1,"anomaly":1.1},{"lng":126.955,"lat":37.528,"lst":33.1,"anomaly":1.1},{"lng":126.9625,"lat":37.528,"lst":33.1,"anomaly":1.1},{"lng":126.97,"lat":37.528,"lst":33.1,"anomaly":1.1},{"lng":126.9775,"lat":37.528,"lst":33.1,"anomaly":1.1},{"lng":126.985,"lat":37.528,"lst":33.1,"anomaly":1.1},{"lng":126.9925,"lat":37.528,"lst":33.2,"anomaly":1.2},{"lng":127,"lat":37.528,"lst":33.4,"anomaly":1.4},{"lng":127.0075,"lat":37.528,"lst":33.7,"anomaly":1.7},{"lng":127.015,"lat":37.528,"lst":34,"anomaly":2},{"lng":127.0225,"lat":37.528,"lst":34.3,"anomaly":2.3},{"lng":127.03,"lat":37.528,"lst":34.4,"anomaly":2.4},{"lng":127.0375,"lat":37.528,"lst":34.5,"anomaly":2.5},{"lng":127.045,"lat":37.528,"lst":34.3,"anomaly":2.3},{"lng":127.0525,"lat":37.528,"lst":34.1,"anomaly":2.1},{"lng":127.06,"lat":37.528,"lst":33.8,"anomaly":1.8},{"lng":127.0675,"lat":37.528,"lst":33.5,"anomaly":1.5},{"lng":127.075,"lat":37.528,"lst":33.2,"anomaly":1.2},{"lng":127.0825,"lat":37.528,"lst":32.8,"anomaly":0.8},{"lng":127.09,"lat":37.528,"lst":32.4,"anomaly":0.4},{"lng":127.0975,"lat":37.528,"lst":32,"anomaly":0},{"lng":127.105,"lat":37.528,"lst":31.6,"anomaly":-0.4},{"lng":127.1125,"lat":37.528,"lst":31.3,"anomaly":-0.7},{"lng":127.12,"lat":37.528,"lst":31.1,"anomaly":-0.9},{"lng":127.1275,"lat":37.528,"lst":30.9,"anomaly":-1.1},{"lng":127.135,"lat":37.528,"lst":30.7,"anomaly":-1.3},{"lng":127.1425,"lat":37.528,"lst":30.6,"anomaly":-1.4},{"lng":127.15,"lat":37.528,"lst":30.5,"anomaly":-1.5},{"lng":126.7975,"lat":37.534,"lst":31.9,"anomaly":-0.1},{"lng":126.8275,"lat":37.534,"lst":33.7,"anomaly":1.7},{"lng":126.835,"lat":37.534,"lst":34.1,"anomaly":2.1},{"lng":126.8425,"lat":37.534,"lst":34.6,"anomaly":2.6},{"lng":126.85,"lat":37.534,"lst":35,"anomaly":3},{"lng":126.8575,"lat":37.534,"lst":35.2,"anomaly":3.2},{"lng":126.865,"lat":37.534,"lst":35.3,"anomaly":3.3},{"lng":126.8725,"lat":37.534,"lst":35.2,"anomaly":3.2},{"lng":126.88,"lat":37.534,"lst":35.1,"anomaly":3.1},{"lng":126.8875,"lat":37.534,"lst":34.8,"anomaly":2.8},{"lng":126.895,"lat":37.534,"lst":34.4,"anomaly":2.4},{"lng":126.9025,"lat":37.534,"lst":34,"anomaly":2},{"lng":126.91,"lat":37.534,"lst":33.7,"anomaly":1.7},{"lng":126.9175,"lat":37.534,"lst":33.5,"anomaly":1.5},{"lng":126.925,"lat":37.534,"lst":33.4,"anomaly":1.4},{"lng":126.9325,"lat":37.534,"lst":33.4,"anomaly":1.4},{"lng":126.94,"lat":37.534,"lst":33.6,"anomaly":1.6},{"lng":126.9475,"lat":37.534,"lst":33.8,"anomaly":1.8},{"lng":126.955,"lat":37.534,"lst":33.9,"anomaly":1.9},{"lng":126.9625,"lat":37.534,"lst":33.9,"anomaly":1.9},{"lng":126.97,"lat":37.534,"lst":33.9,"anomaly":1.9},{"lng":126.9775,"lat":37.534,"lst":33.8,"anomaly":1.8},{"lng":126.985,"lat":37.534,"lst":33.8,"anomaly":1.8},{"lng":126.9925,"lat":37.534,"lst":34,"anomaly":2},{"lng":127,"lat":37.534,"lst":34.1,"anomaly":2.1},{"lng":127.0075,"lat":37.534,"lst":34.4,"anomaly":2.4},{"lng":127.015,"lat":37.534,"lst":34.8,"anomaly":2.8},{"lng":127.0225,"lat":37.534,"lst":35.1,"anomaly":3.1},{"lng":127.03,"lat":37.534,"lst":35.3,"anomaly":3.3},{"lng":127.0375,"lat":37.534,"lst":35.3,"anomaly":3.3},{"lng":127.045,"lat":37.534,"lst":35.1,"anomaly":3.1},{"lng":127.0525,"lat":37.534,"lst":34.8,"anomaly":2.8},{"lng":127.06,"lat":37.534,"lst":34.4,"anomaly":2.4},{"lng":127.0675,"lat":37.534,"lst":33.9,"anomaly":1.9},{"lng":127.075,"lat":37.534,"lst":33.4,"anomaly":1.4},{"lng":127.0825,"lat":37.534,"lst":32.9,"anomaly":0.9},{"lng":127.09,"lat":37.534,"lst":32.4,"anomaly":0.4},{"lng":127.0975,"lat":37.534,"lst":31.9,"anomaly":-0.1},{"lng":127.105,"lat":37.534,"lst":31.4,"anomaly":-0.6},{"lng":127.1125,"lat":37.534,"lst":30.9,"anomaly":-1.1},{"lng":127.12,"lat":37.534,"lst":30.6,"anomaly":-1.4},{"lng":127.1275,"lat":37.534,"lst":30.3,"anomaly":-1.7},{"lng":127.135,"lat":37.534,"lst":30,"anomaly":-2},{"lng":127.1425,"lat":37.534,"lst":29.9,"anomaly":-2.1},{"lng":127.15,"lat":37.534,"lst":29.8,"anomaly":-2.2},{"lng":127.1575,"lat":37.534,"lst":29.9,"anomaly":-2.1},{"lng":126.7975,"lat":37.54,"lst":31.7,"anomaly":-0.3},{"lng":126.805,"lat":37.54,"lst":32.1,"anomaly":0.1},{"lng":126.8125,"lat":37.54,"lst":32.4,"anomaly":0.4},{"lng":126.82,"lat":37.54,"lst":32.9,"anomaly":0.9},{"lng":126.8275,"lat":37.54,"lst":33.3,"anomaly":1.3},{"lng":126.835,"lat":37.54,"lst":33.7,"anomaly":1.7},{"lng":126.8425,"lat":37.54,"lst":34.1,"anomaly":2.1},{"lng":126.85,"lat":37.54,"lst":34.5,"anomaly":2.5},{"lng":126.8575,"lat":37.54,"lst":34.6,"anomaly":2.6},{"lng":126.865,"lat":37.54,"lst":34.6,"anomaly":2.6},{"lng":126.8725,"lat":37.54,"lst":34.4,"anomaly":2.4},{"lng":126.88,"lat":37.54,"lst":34.2,"anomaly":2.2},{"lng":126.8875,"lat":37.54,"lst":34,"anomaly":2},{"lng":126.895,"lat":37.54,"lst":33.7,"anomaly":1.7},{"lng":126.9025,"lat":37.54,"lst":33.5,"anomaly":1.5},{"lng":126.91,"lat":37.54,"lst":33.4,"anomaly":1.4},{"lng":126.9175,"lat":37.54,"lst":33.4,"anomaly":1.4},{"lng":126.925,"lat":37.54,"lst":33.6,"anomaly":1.6},{"lng":126.9325,"lat":37.54,"lst":33.8,"anomaly":1.8},{"lng":126.94,"lat":37.54,"lst":34.2,"anomaly":2.2},{"lng":126.9475,"lat":37.54,"lst":34.5,"anomaly":2.5},{"lng":126.955,"lat":37.54,"lst":34.7,"anomaly":2.7},{"lng":126.9625,"lat":37.54,"lst":34.7,"anomaly":2.7},{"lng":126.97,"lat":37.54,"lst":34.7,"anomaly":2.7},{"lng":126.9775,"lat":37.54,"lst":34.6,"anomaly":2.6},{"lng":126.985,"lat":37.54,"lst":34.5,"anomaly":2.5},{"lng":126.9925,"lat":37.54,"lst":34.6,"anomaly":2.6},{"lng":127,"lat":37.54,"lst":34.7,"anomaly":2.7},{"lng":127.0075,"lat":37.54,"lst":35.1,"anomaly":3.1},{"lng":127.015,"lat":37.54,"lst":35.5,"anomaly":3.5},{"lng":127.0225,"lat":37.54,"lst":35.9,"anomaly":3.9},{"lng":127.03,"lat":37.54,"lst":36.1,"anomaly":4.1},{"lng":127.0375,"lat":37.54,"lst":36.1,"anomaly":4.1},{"lng":127.045,"lat":37.54,"lst":35.8,"anomaly":3.8},{"lng":127.0525,"lat":37.54,"lst":35.4,"anomaly":3.4},{"lng":127.06,"lat":37.54,"lst":35,"anomaly":3},{"lng":127.0675,"lat":37.54,"lst":34.4,"anomaly":2.4},{"lng":127.075,"lat":37.54,"lst":33.9,"anomaly":1.9},{"lng":127.0825,"lat":37.54,"lst":33.3,"anomaly":1.3},{"lng":127.09,"lat":37.54,"lst":32.7,"anomaly":0.7},{"lng":127.0975,"lat":37.54,"lst":32,"anomaly":0},{"lng":127.105,"lat":37.54,"lst":31.4,"anomaly":-0.6},{"lng":127.1125,"lat":37.54,"lst":30.8,"anomaly":-1.2},{"lng":127.12,"lat":37.54,"lst":30.3,"anomaly":-1.7},{"lng":127.1275,"lat":37.54,"lst":29.9,"anomaly":-2.1},{"lng":127.135,"lat":37.54,"lst":29.5,"anomaly":-2.5},{"lng":127.1425,"lat":37.54,"lst":29.3,"anomaly":-2.7},{"lng":127.15,"lat":37.54,"lst":29.2,"anomaly":-2.8},{"lng":127.1575,"lat":37.54,"lst":29.2,"anomaly":-2.8},{"lng":126.775,"lat":37.546,"lst":30.9,"anomaly":-1.1},{"lng":126.7825,"lat":37.546,"lst":31,"anomaly":-1},{"lng":126.79,"lat":37.546,"lst":31.2,"anomaly":-0.8},{"lng":126.7975,"lat":37.546,"lst":31.4,"anomaly":-0.6},{"lng":126.805,"lat":37.546,"lst":31.7,"anomaly":-0.3},{"lng":126.8125,"lat":37.546,"lst":32,"anomaly":0},{"lng":126.82,"lat":37.546,"lst":32.4,"anomaly":0.4},{"lng":126.8275,"lat":37.546,"lst":32.7,"anomaly":0.7},{"lng":126.835,"lat":37.546,"lst":33.1,"anomaly":1.1},{"lng":126.8425,"lat":37.546,"lst":33.4,"anomaly":1.4},{"lng":126.85,"lat":37.546,"lst":33.7,"anomaly":1.7},{"lng":126.8575,"lat":37.546,"lst":33.8,"anomaly":1.8},{"lng":126.865,"lat":37.546,"lst":33.7,"anomaly":1.7},{"lng":126.8725,"lat":37.546,"lst":33.6,"anomaly":1.6},{"lng":126.88,"lat":37.546,"lst":33.4,"anomaly":1.4},{"lng":126.8875,"lat":37.546,"lst":33.3,"anomaly":1.3},{"lng":126.895,"lat":37.546,"lst":33.2,"anomaly":1.2},{"lng":126.9025,"lat":37.546,"lst":33.2,"anomaly":1.2},{"lng":126.91,"lat":37.546,"lst":33.3,"anomaly":1.3},{"lng":126.9175,"lat":37.546,"lst":33.5,"anomaly":1.5},{"lng":126.925,"lat":37.546,"lst":33.8,"anomaly":1.8},{"lng":126.9325,"lat":37.546,"lst":34.3,"anomaly":2.3},{"lng":126.94,"lat":37.546,"lst":34.7,"anomaly":2.7},{"lng":126.9475,"lat":37.546,"lst":35.2,"anomaly":3.2},{"lng":126.955,"lat":37.546,"lst":35.3,"anomaly":3.3},{"lng":126.9625,"lat":37.546,"lst":35.4,"anomaly":3.4},{"lng":126.97,"lat":37.546,"lst":35.3,"anomaly":3.3},{"lng":126.9775,"lat":37.546,"lst":35.1,"anomaly":3.1},{"lng":126.985,"lat":37.546,"lst":35,"anomaly":3},{"lng":126.9925,"lat":37.546,"lst":35,"anomaly":3},{"lng":127,"lat":37.546,"lst":35.2,"anomaly":3.2},{"lng":127.0075,"lat":37.546,"lst":35.6,"anomaly":3.6},{"lng":127.015,"lat":37.546,"lst":36.1,"anomaly":4.1},{"lng":127.0225,"lat":37.546,"lst":36.5,"anomaly":4.5},{"lng":127.03,"lat":37.546,"lst":36.7,"anomaly":4.7},{"lng":127.0375,"lat":37.546,"lst":36.7,"anomaly":4.7},{"lng":127.045,"lat":37.546,"lst":36.4,"anomaly":4.4},{"lng":127.0525,"lat":37.546,"lst":36,"anomaly":4},{"lng":127.06,"lat":37.546,"lst":35.5,"anomaly":3.5},{"lng":127.0675,"lat":37.546,"lst":34.9,"anomaly":2.9},{"lng":127.075,"lat":37.546,"lst":34.4,"anomaly":2.4},{"lng":127.0825,"lat":37.546,"lst":33.8,"anomaly":1.8},{"lng":127.09,"lat":37.546,"lst":33.1,"anomaly":1.1},{"lng":127.0975,"lat":37.546,"lst":32.4,"anomaly":0.4},{"lng":127.105,"lat":37.546,"lst":31.7,"anomaly":-0.3},{"lng":127.1125,"lat":37.546,"lst":31,"anomaly":-1},{"lng":127.12,"lat":37.546,"lst":30.4,"anomaly":-1.6},{"lng":127.1275,"lat":37.546,"lst":29.8,"anomaly":-2.2},{"lng":127.135,"lat":37.546,"lst":29.3,"anomaly":-2.7},{"lng":127.1425,"lat":37.546,"lst":29,"anomaly":-3},{"lng":127.15,"lat":37.546,"lst":28.7,"anomaly":-3.3},{"lng":127.1575,"lat":37.546,"lst":28.6,"anomaly":-3.4},{"lng":127.165,"lat":37.546,"lst":28.6,"anomaly":-3.4},{"lng":127.1725,"lat":37.546,"lst":28.8,"anomaly":-3.2},{"lng":127.18,"lat":37.546,"lst":29,"anomaly":-3},{"lng":126.775,"lat":37.552,"lst":30.7,"anomaly":-1.3},{"lng":126.7825,"lat":37.552,"lst":30.7,"anomaly":-1.3},{"lng":126.79,"lat":37.552,"lst":30.7,"anomaly":-1.3},{"lng":126.7975,"lat":37.552,"lst":30.9,"anomaly":-1.1},{"lng":126.805,"lat":37.552,"lst":31.1,"anomaly":-0.9},{"lng":126.8125,"lat":37.552,"lst":31.4,"anomaly":-0.6},{"lng":126.82,"lat":37.552,"lst":31.7,"anomaly":-0.3},{"lng":126.8275,"lat":37.552,"lst":32,"anomaly":0},{"lng":126.835,"lat":37.552,"lst":32.3,"anomaly":0.3},{"lng":126.8425,"lat":37.552,"lst":32.5,"anomaly":0.5},{"lng":126.85,"lat":37.552,"lst":32.8,"anomaly":0.8},{"lng":126.8575,"lat":37.552,"lst":32.9,"anomaly":0.9},{"lng":126.865,"lat":37.552,"lst":32.8,"anomaly":0.8},{"lng":126.8725,"lat":37.552,"lst":32.8,"anomaly":0.8},{"lng":126.88,"lat":37.552,"lst":32.8,"anomaly":0.8},{"lng":126.8875,"lat":37.552,"lst":32.8,"anomaly":0.8},{"lng":126.895,"lat":37.552,"lst":32.9,"anomaly":0.9},{"lng":126.9025,"lat":37.552,"lst":33.1,"anomaly":1.1},{"lng":126.91,"lat":37.552,"lst":33.3,"anomaly":1.3},{"lng":126.9175,"lat":37.552,"lst":33.7,"anomaly":1.7},{"lng":126.925,"lat":37.552,"lst":34.1,"anomaly":2.1},{"lng":126.9325,"lat":37.552,"lst":34.6,"anomaly":2.6},{"lng":126.94,"lat":37.552,"lst":35.1,"anomaly":3.1},{"lng":126.9475,"lat":37.552,"lst":35.5,"anomaly":3.5},{"lng":126.955,"lat":37.552,"lst":35.7,"anomaly":3.7},{"lng":126.9625,"lat":37.552,"lst":35.8,"anomaly":3.8},{"lng":126.97,"lat":37.552,"lst":35.7,"anomaly":3.7},{"lng":126.9775,"lat":37.552,"lst":35.5,"anomaly":3.5},{"lng":126.985,"lat":37.552,"lst":35.3,"anomaly":3.3},{"lng":126.9925,"lat":37.552,"lst":35.4,"anomaly":3.4},{"lng":127,"lat":37.552,"lst":35.6,"anomaly":3.6},{"lng":127.0075,"lat":37.552,"lst":36,"anomaly":4},{"lng":127.015,"lat":37.552,"lst":36.5,"anomaly":4.5},{"lng":127.0225,"lat":37.552,"lst":36.8,"anomaly":4.8},{"lng":127.03,"lat":37.552,"lst":37,"anomaly":5},{"lng":127.0375,"lat":37.552,"lst":37,"anomaly":5},{"lng":127.045,"lat":37.552,"lst":36.7,"anomaly":4.7},{"lng":127.0525,"lat":37.552,"lst":36.3,"anomaly":4.3},{"lng":127.06,"lat":37.552,"lst":35.8,"anomaly":3.8},{"lng":127.0675,"lat":37.552,"lst":35.3,"anomaly":3.3},{"lng":127.075,"lat":37.552,"lst":34.7,"anomaly":2.7},{"lng":127.0825,"lat":37.552,"lst":34.1,"anomaly":2.1},{"lng":127.09,"lat":37.552,"lst":33.4,"anomaly":1.4},{"lng":127.0975,"lat":37.552,"lst":32.7,"anomaly":0.7},{"lng":127.105,"lat":37.552,"lst":32,"anomaly":0},{"lng":127.1125,"lat":37.552,"lst":31.3,"anomaly":-0.7},{"lng":127.12,"lat":37.552,"lst":30.7,"anomaly":-1.3},{"lng":127.1275,"lat":37.552,"lst":30,"anomaly":-2},{"lng":127.135,"lat":37.552,"lst":29.5,"anomaly":-2.5},{"lng":127.1425,"lat":37.552,"lst":28.9,"anomaly":-3.1},{"lng":127.15,"lat":37.552,"lst":28.5,"anomaly":-3.5},{"lng":127.1575,"lat":37.552,"lst":28.3,"anomaly":-3.7},{"lng":127.165,"lat":37.552,"lst":28.2,"anomaly":-3.8},{"lng":127.1725,"lat":37.552,"lst":28.2,"anomaly":-3.8},{"lng":127.18,"lat":37.552,"lst":28.3,"anomaly":-3.7},{"lng":126.7825,"lat":37.558,"lst":30.3,"anomaly":-1.7},{"lng":126.79,"lat":37.558,"lst":30.2,"anomaly":-1.8},{"lng":126.7975,"lat":37.558,"lst":30.3,"anomaly":-1.7},{"lng":126.805,"lat":37.558,"lst":30.4,"anomaly":-1.6},{"lng":126.8125,"lat":37.558,"lst":30.7,"anomaly":-1.3},{"lng":126.82,"lat":37.558,"lst":30.9,"anomaly":-1.1},{"lng":126.8275,"lat":37.558,"lst":31.2,"anomaly":-0.8},{"lng":126.835,"lat":37.558,"lst":31.4,"anomaly":-0.6},{"lng":126.8425,"lat":37.558,"lst":31.7,"anomaly":-0.3},{"lng":126.85,"lat":37.558,"lst":31.9,"anomaly":-0.1},{"lng":126.8575,"lat":37.558,"lst":32.1,"anomaly":0.1},{"lng":126.865,"lat":37.558,"lst":32.1,"anomaly":0.1},{"lng":126.8725,"lat":37.558,"lst":32.2,"anomaly":0.2},{"lng":126.88,"lat":37.558,"lst":32.3,"anomaly":0.3},{"lng":126.8875,"lat":37.558,"lst":32.5,"anomaly":0.5},{"lng":126.895,"lat":37.558,"lst":32.8,"anomaly":0.8},{"lng":126.9025,"lat":37.558,"lst":33.1,"anomaly":1.1},{"lng":126.91,"lat":37.558,"lst":33.5,"anomaly":1.5},{"lng":126.9175,"lat":37.558,"lst":33.9,"anomaly":1.9},{"lng":126.925,"lat":37.558,"lst":34.3,"anomaly":2.3},{"lng":126.9325,"lat":37.558,"lst":34.7,"anomaly":2.7},{"lng":126.94,"lat":37.558,"lst":35.2,"anomaly":3.2},{"lng":126.9475,"lat":37.558,"lst":35.6,"anomaly":3.6},{"lng":126.955,"lat":37.558,"lst":35.8,"anomaly":3.8},{"lng":126.9625,"lat":37.558,"lst":35.9,"anomaly":3.9},{"lng":126.97,"lat":37.558,"lst":35.8,"anomaly":3.8},{"lng":126.9775,"lat":37.558,"lst":35.7,"anomaly":3.7},{"lng":126.985,"lat":37.558,"lst":35.6,"anomaly":3.6},{"lng":126.9925,"lat":37.558,"lst":35.6,"anomaly":3.6},{"lng":127,"lat":37.558,"lst":35.8,"anomaly":3.8},{"lng":127.0075,"lat":37.558,"lst":36.2,"anomaly":4.2},{"lng":127.015,"lat":37.558,"lst":36.6,"anomaly":4.6},{"lng":127.0225,"lat":37.558,"lst":37,"anomaly":5},{"lng":127.03,"lat":37.558,"lst":37.1,"anomaly":5.1},{"lng":127.0375,"lat":37.558,"lst":37,"anomaly":5},{"lng":127.045,"lat":37.558,"lst":36.7,"anomaly":4.7},{"lng":127.0525,"lat":37.558,"lst":36.3,"anomaly":4.3},{"lng":127.06,"lat":37.558,"lst":35.8,"anomaly":3.8},{"lng":127.0675,"lat":37.558,"lst":35.3,"anomaly":3.3},{"lng":127.075,"lat":37.558,"lst":34.8,"anomaly":2.8},{"lng":127.0825,"lat":37.558,"lst":34.2,"anomaly":2.2},{"lng":127.09,"lat":37.558,"lst":33.6,"anomaly":1.6},{"lng":127.0975,"lat":37.558,"lst":32.9,"anomaly":0.9},{"lng":127.12,"lat":37.558,"lst":31,"anomaly":-1},{"lng":127.1275,"lat":37.558,"lst":30.4,"anomaly":-1.6},{"lng":127.135,"lat":37.558,"lst":29.8,"anomaly":-2.2},{"lng":127.1425,"lat":37.558,"lst":29.2,"anomaly":-2.8},{"lng":127.15,"lat":37.558,"lst":28.6,"anomaly":-3.4},{"lng":127.1575,"lat":37.558,"lst":28.2,"anomaly":-3.8},{"lng":127.165,"lat":37.558,"lst":27.9,"anomaly":-4.1},{"lng":127.1725,"lat":37.558,"lst":27.8,"anomaly":-4.2},{"lng":127.18,"lat":37.558,"lst":27.8,"anomaly":-4.2},{"lng":126.7825,"lat":37.564,"lst":29.9,"anomaly":-2.1},{"lng":126.79,"lat":37.564,"lst":29.6,"anomaly":-2.4},{"lng":126.7975,"lat":37.564,"lst":29.5,"anomaly":-2.5},{"lng":126.805,"lat":37.564,"lst":29.7,"anomaly":-2.3},{"lng":126.8125,"lat":37.564,"lst":29.9,"anomaly":-2.1},{"lng":126.82,"lat":37.564,"lst":30.1,"anomaly":-1.9},{"lng":126.8275,"lat":37.564,"lst":30.4,"anomaly":-1.6},{"lng":126.835,"lat":37.564,"lst":30.7,"anomaly":-1.3},{"lng":126.8425,"lat":37.564,"lst":30.9,"anomaly":-1.1},{"lng":126.85,"lat":37.564,"lst":31.2,"anomaly":-0.8},{"lng":126.8575,"lat":37.564,"lst":31.4,"anomaly":-0.6},{"lng":126.865,"lat":37.564,"lst":31.6,"anomaly":-0.4},{"lng":126.8725,"lat":37.564,"lst":31.9,"anomaly":-0.1},{"lng":126.88,"lat":37.564,"lst":32.1,"anomaly":0.1},{"lng":126.8875,"lat":37.564,"lst":32.5,"anomaly":0.5},{"lng":126.895,"lat":37.564,"lst":32.8,"anomaly":0.8},{"lng":126.9025,"lat":37.564,"lst":33.1,"anomaly":1.1},{"lng":126.91,"lat":37.564,"lst":33.5,"anomaly":1.5},{"lng":126.9175,"lat":37.564,"lst":33.9,"anomaly":1.9},{"lng":126.925,"lat":37.564,"lst":34.2,"anomaly":2.2},{"lng":126.9325,"lat":37.564,"lst":34.6,"anomaly":2.6},{"lng":126.94,"lat":37.564,"lst":35,"anomaly":3},{"lng":126.9475,"lat":37.564,"lst":35.4,"anomaly":3.4},{"lng":126.955,"lat":37.564,"lst":35.7,"anomaly":3.7},{"lng":126.9625,"lat":37.564,"lst":35.8,"anomaly":3.8},{"lng":126.97,"lat":37.564,"lst":35.8,"anomaly":3.8},{"lng":126.9775,"lat":37.564,"lst":35.7,"anomaly":3.7},{"lng":126.985,"lat":37.564,"lst":35.7,"anomaly":3.7},{"lng":126.9925,"lat":37.564,"lst":35.7,"anomaly":3.7},{"lng":127,"lat":37.564,"lst":35.9,"anomaly":3.9},{"lng":127.0075,"lat":37.564,"lst":36.3,"anomaly":4.3},{"lng":127.015,"lat":37.564,"lst":36.6,"anomaly":4.6},{"lng":127.0225,"lat":37.564,"lst":36.9,"anomaly":4.9},{"lng":127.03,"lat":37.564,"lst":37,"anomaly":5},{"lng":127.0375,"lat":37.564,"lst":36.8,"anomaly":4.8},{"lng":127.045,"lat":37.564,"lst":36.5,"anomaly":4.5},{"lng":127.0525,"lat":37.564,"lst":36.1,"anomaly":4.1},{"lng":127.06,"lat":37.564,"lst":35.6,"anomaly":3.6},{"lng":127.0675,"lat":37.564,"lst":35.1,"anomaly":3.1},{"lng":127.075,"lat":37.564,"lst":34.6,"anomaly":2.6},{"lng":127.0825,"lat":37.564,"lst":34.1,"anomaly":2.1},{"lng":127.09,"lat":37.564,"lst":33.5,"anomaly":1.5},{"lng":127.0975,"lat":37.564,"lst":33,"anomaly":1},{"lng":127.135,"lat":37.564,"lst":30.2,"anomaly":-1.8},{"lng":127.1425,"lat":37.564,"lst":29.6,"anomaly":-2.4},{"lng":127.15,"lat":37.564,"lst":29,"anomaly":-3},{"lng":127.1575,"lat":37.564,"lst":28.4,"anomaly":-3.6},{"lng":127.165,"lat":37.564,"lst":28,"anomaly":-4},{"lng":127.1725,"lat":37.564,"lst":27.7,"anomaly":-4.3},{"lng":127.18,"lat":37.564,"lst":27.6,"anomaly":-4.4},{"lng":126.79,"lat":37.57,"lst":29,"anomaly":-3},{"lng":126.7975,"lat":37.57,"lst":28.8,"anomaly":-3.2},{"lng":126.805,"lat":37.57,"lst":29,"anomaly":-3},{"lng":126.8125,"lat":37.57,"lst":29.3,"anomaly":-2.7},{"lng":126.82,"lat":37.57,"lst":29.6,"anomaly":-2.4},{"lng":126.8275,"lat":37.57,"lst":29.9,"anomaly":-2.1},{"lng":126.835,"lat":37.57,"lst":30.2,"anomaly":-1.8},{"lng":126.8425,"lat":37.57,"lst":30.5,"anomaly":-1.5},{"lng":126.85,"lat":37.57,"lst":30.8,"anomaly":-1.2},{"lng":126.8575,"lat":37.57,"lst":31.1,"anomaly":-0.9},{"lng":126.865,"lat":37.57,"lst":31.4,"anomaly":-0.6},{"lng":126.8725,"lat":37.57,"lst":31.8,"anomaly":-0.2},{"lng":126.88,"lat":37.57,"lst":32.1,"anomaly":0.1},{"lng":126.8875,"lat":37.57,"lst":32.5,"anomaly":0.5},{"lng":126.895,"lat":37.57,"lst":32.8,"anomaly":0.8},{"lng":126.9025,"lat":37.57,"lst":33.1,"anomaly":1.1},{"lng":126.91,"lat":37.57,"lst":33.4,"anomaly":1.4},{"lng":126.9175,"lat":37.57,"lst":33.7,"anomaly":1.7},{"lng":126.925,"lat":37.57,"lst":34,"anomaly":2},{"lng":126.9325,"lat":37.57,"lst":34.3,"anomaly":2.3},{"lng":126.94,"lat":37.57,"lst":34.6,"anomaly":2.6},{"lng":126.9475,"lat":37.57,"lst":35,"anomaly":3},{"lng":126.955,"lat":37.57,"lst":35.3,"anomaly":3.3},{"lng":126.9625,"lat":37.57,"lst":35.5,"anomaly":3.5},{"lng":126.97,"lat":37.57,"lst":35.6,"anomaly":3.6},{"lng":126.9775,"lat":37.57,"lst":35.6,"anomaly":3.6},{"lng":126.985,"lat":37.57,"lst":35.6,"anomaly":3.6},{"lng":126.9925,"lat":37.57,"lst":35.7,"anomaly":3.7},{"lng":127,"lat":37.57,"lst":35.9,"anomaly":3.9},{"lng":127.0075,"lat":37.57,"lst":36.2,"anomaly":4.2},{"lng":127.015,"lat":37.57,"lst":36.5,"anomaly":4.5},{"lng":127.0225,"lat":37.57,"lst":36.6,"anomaly":4.6},{"lng":127.03,"lat":37.57,"lst":36.6,"anomaly":4.6},{"lng":127.0375,"lat":37.57,"lst":36.4,"anomaly":4.4},{"lng":127.045,"lat":37.57,"lst":36.1,"anomaly":4.1},{"lng":127.0525,"lat":37.57,"lst":35.7,"anomaly":3.7},{"lng":127.06,"lat":37.57,"lst":35.2,"anomaly":3.2},{"lng":127.0675,"lat":37.57,"lst":34.7,"anomaly":2.7},{"lng":127.075,"lat":37.57,"lst":34.3,"anomaly":2.3},{"lng":127.0825,"lat":37.57,"lst":33.8,"anomaly":1.8},{"lng":127.09,"lat":37.57,"lst":33.3,"anomaly":1.3},{"lng":127.0975,"lat":37.57,"lst":32.8,"anomaly":0.8},{"lng":127.1575,"lat":37.57,"lst":28.9,"anomaly":-3.1},{"lng":127.165,"lat":37.57,"lst":28.4,"anomaly":-3.6},{"lng":127.1725,"lat":37.57,"lst":27.9,"anomaly":-4.1},{"lng":126.7975,"lat":37.576,"lst":28.4,"anomaly":-3.6},{"lng":126.805,"lat":37.576,"lst":28.7,"anomaly":-3.3},{"lng":126.8125,"lat":37.576,"lst":29,"anomaly":-3},{"lng":126.82,"lat":37.576,"lst":29.3,"anomaly":-2.7},{"lng":126.8275,"lat":37.576,"lst":29.7,"anomaly":-2.3},{"lng":126.835,"lat":37.576,"lst":30.1,"anomaly":-1.9},{"lng":126.8425,"lat":37.576,"lst":30.4,"anomaly":-1.6},{"lng":126.88,"lat":37.576,"lst":32.2,"anomaly":0.2},{"lng":126.8875,"lat":37.576,"lst":32.5,"anomaly":0.5},{"lng":126.895,"lat":37.576,"lst":32.7,"anomaly":0.7},{"lng":126.9025,"lat":37.576,"lst":32.9,"anomaly":0.9},{"lng":126.91,"lat":37.576,"lst":33.1,"anomaly":1.1},{"lng":126.9175,"lat":37.576,"lst":33.3,"anomaly":1.3},{"lng":126.925,"lat":37.576,"lst":33.5,"anomaly":1.5},{"lng":126.9325,"lat":37.576,"lst":33.7,"anomaly":1.7},{"lng":126.94,"lat":37.576,"lst":34,"anomaly":2},{"lng":126.9475,"lat":37.576,"lst":34.4,"anomaly":2.4},{"lng":126.955,"lat":37.576,"lst":34.7,"anomaly":2.7},{"lng":126.9625,"lat":37.576,"lst":35,"anomaly":3},{"lng":126.97,"lat":37.576,"lst":35.2,"anomaly":3.2},{"lng":126.9775,"lat":37.576,"lst":35.3,"anomaly":3.3},{"lng":126.985,"lat":37.576,"lst":35.4,"anomaly":3.4},{"lng":126.9925,"lat":37.576,"lst":35.6,"anomaly":3.6},{"lng":127,"lat":37.576,"lst":35.7,"anomaly":3.7},{"lng":127.0075,"lat":37.576,"lst":36,"anomaly":4},{"lng":127.015,"lat":37.576,"lst":36.1,"anomaly":4.1},{"lng":127.0225,"lat":37.576,"lst":36.2,"anomaly":4.2},{"lng":127.03,"lat":37.576,"lst":36.1,"anomaly":4.1},{"lng":127.0375,"lat":37.576,"lst":35.9,"anomaly":3.9},{"lng":127.045,"lat":37.576,"lst":35.6,"anomaly":3.6},{"lng":127.0525,"lat":37.576,"lst":35.1,"anomaly":3.1},{"lng":127.06,"lat":37.576,"lst":34.7,"anomaly":2.7},{"lng":127.0675,"lat":37.576,"lst":34.2,"anomaly":2.2},{"lng":127.075,"lat":37.576,"lst":33.8,"anomaly":1.8},{"lng":127.0825,"lat":37.576,"lst":33.3,"anomaly":1.3},{"lng":127.09,"lat":37.576,"lst":32.9,"anomaly":0.9},{"lng":127.0975,"lat":37.576,"lst":32.5,"anomaly":0.5},{"lng":127.1725,"lat":37.576,"lst":28.4,"anomaly":-3.6},{"lng":126.805,"lat":37.582,"lst":28.6,"anomaly":-3.4},{"lng":126.8125,"lat":37.582,"lst":29,"anomaly":-3},{"lng":126.82,"lat":37.582,"lst":29.4,"anomaly":-2.6},{"lng":126.8275,"lat":37.582,"lst":29.8,"anomaly":-2.2},{"lng":126.835,"lat":37.582,"lst":30.3,"anomaly":-1.7},{"lng":126.88,"lat":37.582,"lst":32.2,"anomaly":0.2},{"lng":126.8875,"lat":37.582,"lst":32.4,"anomaly":0.4},{"lng":126.895,"lat":37.582,"lst":32.5,"anomaly":0.5},{"lng":126.9025,"lat":37.582,"lst":32.6,"anomaly":0.6},{"lng":126.91,"lat":37.582,"lst":32.6,"anomaly":0.6},{"lng":126.9175,"lat":37.582,"lst":32.7,"anomaly":0.7},{"lng":126.925,"lat":37.582,"lst":32.9,"anomaly":0.9},{"lng":126.9325,"lat":37.582,"lst":33.1,"anomaly":1.1},{"lng":126.94,"lat":37.582,"lst":33.3,"anomaly":1.3},{"lng":126.9475,"lat":37.582,"lst":33.7,"anomaly":1.7},{"lng":126.955,"lat":37.582,"lst":34,"anomaly":2},{"lng":126.9625,"lat":37.582,"lst":34.4,"anomaly":2.4},{"lng":126.97,"lat":37.582,"lst":34.6,"anomaly":2.6},{"lng":126.9775,"lat":37.582,"lst":34.9,"anomaly":2.9},{"lng":126.985,"lat":37.582,"lst":35.1,"anomaly":3.1},{"lng":126.9925,"lat":37.582,"lst":35.2,"anomaly":3.2},{"lng":127,"lat":37.582,"lst":35.4,"anomaly":3.4},{"lng":127.0075,"lat":37.582,"lst":35.5,"anomaly":3.5},{"lng":127.015,"lat":37.582,"lst":35.6,"anomaly":3.6},{"lng":127.0225,"lat":37.582,"lst":35.6,"anomaly":3.6},{"lng":127.03,"lat":37.582,"lst":35.5,"anomaly":3.5},{"lng":127.0375,"lat":37.582,"lst":35.2,"anomaly":3.2},{"lng":127.045,"lat":37.582,"lst":34.9,"anomaly":2.9},{"lng":127.0525,"lat":37.582,"lst":34.5,"anomaly":2.5},{"lng":127.06,"lat":37.582,"lst":34,"anomaly":2},{"lng":127.0675,"lat":37.582,"lst":33.6,"anomaly":1.6},{"lng":127.075,"lat":37.582,"lst":33.2,"anomaly":1.2},{"lng":127.0825,"lat":37.582,"lst":32.8,"anomaly":0.8},{"lng":127.09,"lat":37.582,"lst":32.5,"anomaly":0.5},{"lng":127.0975,"lat":37.582,"lst":32.1,"anomaly":0.1},{"lng":127.105,"lat":37.582,"lst":31.9,"anomaly":-0.1},{"lng":126.805,"lat":37.588,"lst":29,"anomaly":-3},{"lng":126.8125,"lat":37.588,"lst":29.4,"anomaly":-2.6},{"lng":126.82,"lat":37.588,"lst":29.8,"anomaly":-2.2},{"lng":126.8875,"lat":37.588,"lst":32.2,"anomaly":0.2},{"lng":126.9025,"lat":37.588,"lst":32.1,"anomaly":0.1},{"lng":126.91,"lat":37.588,"lst":32.1,"anomaly":0.1},{"lng":126.9175,"lat":37.588,"lst":32.1,"anomaly":0.1},{"lng":126.925,"lat":37.588,"lst":32.1,"anomaly":0.1},{"lng":126.9325,"lat":37.588,"lst":32.3,"anomaly":0.3},{"lng":126.94,"lat":37.588,"lst":32.6,"anomaly":0.6},{"lng":126.9475,"lat":37.588,"lst":32.9,"anomaly":0.9},{"lng":126.955,"lat":37.588,"lst":33.2,"anomaly":1.2},{"lng":126.9625,"lat":37.588,"lst":33.6,"anomaly":1.6},{"lng":126.97,"lat":37.588,"lst":34,"anomaly":2},{"lng":126.9775,"lat":37.588,"lst":34.3,"anomaly":2.3},{"lng":126.985,"lat":37.588,"lst":34.5,"anomaly":2.5},{"lng":126.9925,"lat":37.588,"lst":34.7,"anomaly":2.7},{"lng":127,"lat":37.588,"lst":34.9,"anomaly":2.9},{"lng":127.0075,"lat":37.588,"lst":35,"anomaly":3},{"lng":127.015,"lat":37.588,"lst":35,"anomaly":3},{"lng":127.0225,"lat":37.588,"lst":34.9,"anomaly":2.9},{"lng":127.03,"lat":37.588,"lst":34.8,"anomaly":2.8},{"lng":127.0375,"lat":37.588,"lst":34.5,"anomaly":2.5},{"lng":127.045,"lat":37.588,"lst":34.1,"anomaly":2.1},{"lng":127.0525,"lat":37.588,"lst":33.7,"anomaly":1.7},{"lng":127.06,"lat":37.588,"lst":33.3,"anomaly":1.3},{"lng":127.0675,"lat":37.588,"lst":32.9,"anomaly":0.9},{"lng":127.075,"lat":37.588,"lst":32.5,"anomaly":0.5},{"lng":127.0825,"lat":37.588,"lst":32.2,"anomaly":0.2},{"lng":127.09,"lat":37.588,"lst":31.9,"anomaly":-0.1},{"lng":127.0975,"lat":37.588,"lst":31.7,"anomaly":-0.3},{"lng":127.105,"lat":37.588,"lst":31.5,"anomaly":-0.5},{"lng":127.1125,"lat":37.588,"lst":31.3,"anomaly":-0.7},{"lng":126.805,"lat":37.594,"lst":29.4,"anomaly":-2.6},{"lng":126.8125,"lat":37.594,"lst":29.8,"anomaly":-2.2},{"lng":126.91,"lat":37.594,"lst":31.5,"anomaly":-0.5},{"lng":126.9175,"lat":37.594,"lst":31.4,"anomaly":-0.6},{"lng":126.925,"lat":37.594,"lst":31.4,"anomaly":-0.6},{"lng":126.9325,"lat":37.594,"lst":31.5,"anomaly":-0.5},{"lng":126.94,"lat":37.594,"lst":31.7,"anomaly":-0.3},{"lng":126.9475,"lat":37.594,"lst":32,"anomaly":0},{"lng":126.955,"lat":37.594,"lst":32.4,"anomaly":0.4},{"lng":126.9625,"lat":37.594,"lst":32.8,"anomaly":0.8},{"lng":126.97,"lat":37.594,"lst":33.2,"anomaly":1.2},{"lng":126.9775,"lat":37.594,"lst":33.5,"anomaly":1.5},{"lng":126.985,"lat":37.594,"lst":33.8,"anomaly":1.8},{"lng":126.9925,"lat":37.594,"lst":34,"anomaly":2},{"lng":127,"lat":37.594,"lst":34.2,"anomaly":2.2},{"lng":127.0075,"lat":37.594,"lst":34.3,"anomaly":2.3},{"lng":127.015,"lat":37.594,"lst":34.2,"anomaly":2.2},{"lng":127.0225,"lat":37.594,"lst":34.1,"anomaly":2.1},{"lng":127.03,"lat":37.594,"lst":33.9,"anomaly":1.9},{"lng":127.0375,"lat":37.594,"lst":33.6,"anomaly":1.6},{"lng":127.045,"lat":37.594,"lst":33.3,"anomaly":1.3},{"lng":127.0525,"lat":37.594,"lst":32.9,"anomaly":0.9},{"lng":127.06,"lat":37.594,"lst":32.5,"anomaly":0.5},{"lng":127.0675,"lat":37.594,"lst":32.2,"anomaly":0.2},{"lng":127.075,"lat":37.594,"lst":31.8,"anomaly":-0.2},{"lng":127.0825,"lat":37.594,"lst":31.6,"anomaly":-0.4},{"lng":127.09,"lat":37.594,"lst":31.4,"anomaly":-0.6},{"lng":127.0975,"lat":37.594,"lst":31.2,"anomaly":-0.8},{"lng":127.105,"lat":37.594,"lst":31.1,"anomaly":-0.9},{"lng":127.1125,"lat":37.594,"lst":31,"anomaly":-1},{"lng":126.805,"lat":37.6,"lst":30,"anomaly":-2},{"lng":126.9025,"lat":37.6,"lst":31,"anomaly":-1},{"lng":126.91,"lat":37.6,"lst":30.8,"anomaly":-1.2},{"lng":126.9175,"lat":37.6,"lst":30.7,"anomaly":-1.3},{"lng":126.925,"lat":37.6,"lst":30.7,"anomaly":-1.3},{"lng":126.9325,"lat":37.6,"lst":30.7,"anomaly":-1.3},{"lng":126.94,"lat":37.6,"lst":30.9,"anomaly":-1.1},{"lng":126.9475,"lat":37.6,"lst":31.2,"anomaly":-0.8},{"lng":126.955,"lat":37.6,"lst":31.6,"anomaly":-0.4},{"lng":126.9625,"lat":37.6,"lst":32,"anomaly":0},{"lng":126.97,"lat":37.6,"lst":32.3,"anomaly":0.3},{"lng":126.9775,"lat":37.6,"lst":32.7,"anomaly":0.7},{"lng":126.985,"lat":37.6,"lst":33,"anomaly":1},{"lng":126.9925,"lat":37.6,"lst":33.2,"anomaly":1.2},{"lng":127,"lat":37.6,"lst":33.4,"anomaly":1.4},{"lng":127.0075,"lat":37.6,"lst":33.4,"anomaly":1.4},{"lng":127.015,"lat":37.6,"lst":33.4,"anomaly":1.4},{"lng":127.0225,"lat":37.6,"lst":33.3,"anomaly":1.3},{"lng":127.03,"lat":37.6,"lst":33.1,"anomaly":1.1},{"lng":127.0375,"lat":37.6,"lst":32.8,"anomaly":0.8},{"lng":127.045,"lat":37.6,"lst":32.4,"anomaly":0.4},{"lng":127.0525,"lat":37.6,"lst":32.1,"anomaly":0.1},{"lng":127.06,"lat":37.6,"lst":31.7,"anomaly":-0.3},{"lng":127.0675,"lat":37.6,"lst":31.4,"anomaly":-0.6},{"lng":127.075,"lat":37.6,"lst":31.1,"anomaly":-0.9},{"lng":127.0825,"lat":37.6,"lst":30.9,"anomaly":-1.1},{"lng":127.09,"lat":37.6,"lst":30.8,"anomaly":-1.2},{"lng":127.0975,"lat":37.6,"lst":30.7,"anomaly":-1.3},{"lng":127.105,"lat":37.6,"lst":30.7,"anomaly":-1.3},{"lng":127.1125,"lat":37.6,"lst":30.7,"anomaly":-1.3},{"lng":126.91,"lat":37.606,"lst":30.3,"anomaly":-1.7},{"lng":126.9175,"lat":37.606,"lst":30.1,"anomaly":-1.9},{"lng":126.925,"lat":37.606,"lst":30,"anomaly":-2},{"lng":126.9325,"lat":37.606,"lst":30,"anomaly":-2},{"lng":126.94,"lat":37.606,"lst":30.2,"anomaly":-1.8},{"lng":126.9475,"lat":37.606,"lst":30.4,"anomaly":-1.6},{"lng":126.955,"lat":37.606,"lst":30.8,"anomaly":-1.2},{"lng":126.9625,"lat":37.606,"lst":31.1,"anomaly":-0.9},{"lng":126.97,"lat":37.606,"lst":31.5,"anomaly":-0.5},{"lng":126.9775,"lat":37.606,"lst":31.8,"anomaly":-0.2},{"lng":126.985,"lat":37.606,"lst":32.1,"anomaly":0.1},{"lng":126.9925,"lat":37.606,"lst":32.3,"anomaly":0.3},{"lng":127,"lat":37.606,"lst":32.5,"anomaly":0.5},{"lng":127.0075,"lat":37.606,"lst":32.5,"anomaly":0.5},{"lng":127.015,"lat":37.606,"lst":32.5,"anomaly":0.5},{"lng":127.0225,"lat":37.606,"lst":32.4,"anomaly":0.4},{"lng":127.03,"lat":37.606,"lst":32.2,"anomaly":0.2},{"lng":127.0375,"lat":37.606,"lst":31.9,"anomaly":-0.1},{"lng":127.045,"lat":37.606,"lst":31.6,"anomaly":-0.4},{"lng":127.0525,"lat":37.606,"lst":31.2,"anomaly":-0.8},{"lng":127.06,"lat":37.606,"lst":30.9,"anomaly":-1.1},{"lng":127.0675,"lat":37.606,"lst":30.6,"anomaly":-1.4},{"lng":127.075,"lat":37.606,"lst":30.4,"anomaly":-1.6},{"lng":127.0825,"lat":37.606,"lst":30.3,"anomaly":-1.7},{"lng":127.09,"lat":37.606,"lst":30.3,"anomaly":-1.7},{"lng":127.0975,"lat":37.606,"lst":30.3,"anomaly":-1.7},{"lng":127.105,"lat":37.606,"lst":30.3,"anomaly":-1.7},{"lng":127.1125,"lat":37.606,"lst":30.4,"anomaly":-1.6},{"lng":126.91,"lat":37.612,"lst":29.7,"anomaly":-2.3},{"lng":126.9175,"lat":37.612,"lst":29.5,"anomaly":-2.5},{"lng":126.925,"lat":37.612,"lst":29.4,"anomaly":-2.6},{"lng":126.9325,"lat":37.612,"lst":29.4,"anomaly":-2.6},{"lng":126.94,"lat":37.612,"lst":29.5,"anomaly":-2.5},{"lng":126.9475,"lat":37.612,"lst":29.7,"anomaly":-2.3},{"lng":126.955,"lat":37.612,"lst":30,"anomaly":-2},{"lng":126.9625,"lat":37.612,"lst":30.3,"anomaly":-1.7},{"lng":126.97,"lat":37.612,"lst":30.6,"anomaly":-1.4},{"lng":126.9775,"lat":37.612,"lst":31,"anomaly":-1},{"lng":126.985,"lat":37.612,"lst":31.3,"anomaly":-0.7},{"lng":126.9925,"lat":37.612,"lst":31.5,"anomaly":-0.5},{"lng":127,"lat":37.612,"lst":31.6,"anomaly":-0.4},{"lng":127.0075,"lat":37.612,"lst":31.7,"anomaly":-0.3},{"lng":127.015,"lat":37.612,"lst":31.6,"anomaly":-0.4},{"lng":127.0225,"lat":37.612,"lst":31.5,"anomaly":-0.5},{"lng":127.03,"lat":37.612,"lst":31.3,"anomaly":-0.7},{"lng":127.0375,"lat":37.612,"lst":31,"anomaly":-1},{"lng":127.045,"lat":37.612,"lst":30.7,"anomaly":-1.3},{"lng":127.0525,"lat":37.612,"lst":30.4,"anomaly":-1.6},{"lng":127.06,"lat":37.612,"lst":30.1,"anomaly":-1.9},{"lng":127.0675,"lat":37.612,"lst":29.9,"anomaly":-2.1},{"lng":127.075,"lat":37.612,"lst":29.8,"anomaly":-2.2},{"lng":127.0825,"lat":37.612,"lst":29.7,"anomaly":-2.3},{"lng":127.09,"lat":37.612,"lst":29.7,"anomaly":-2.3},{"lng":127.0975,"lat":37.612,"lst":29.8,"anomaly":-2.2},{"lng":127.105,"lat":37.612,"lst":29.9,"anomaly":-2.1},{"lng":127.1125,"lat":37.612,"lst":30.1,"anomaly":-1.9},{"lng":126.91,"lat":37.618,"lst":29.3,"anomaly":-2.7},{"lng":126.9175,"lat":37.618,"lst":29.1,"anomaly":-2.9},{"lng":126.925,"lat":37.618,"lst":28.9,"anomaly":-3.1},{"lng":126.9325,"lat":37.618,"lst":28.8,"anomaly":-3.2},{"lng":126.94,"lat":37.618,"lst":28.9,"anomaly":-3.1},{"lng":126.9475,"lat":37.618,"lst":29,"anomaly":-3},{"lng":126.955,"lat":37.618,"lst":29.3,"anomaly":-2.7},{"lng":126.9625,"lat":37.618,"lst":29.6,"anomaly":-2.4},{"lng":126.97,"lat":37.618,"lst":29.9,"anomaly":-2.1},{"lng":126.9775,"lat":37.618,"lst":30.2,"anomaly":-1.8},{"lng":126.985,"lat":37.618,"lst":30.4,"anomaly":-1.6},{"lng":126.9925,"lat":37.618,"lst":30.6,"anomaly":-1.4},{"lng":127,"lat":37.618,"lst":30.7,"anomaly":-1.3},{"lng":127.0075,"lat":37.618,"lst":30.8,"anomaly":-1.2},{"lng":127.015,"lat":37.618,"lst":30.7,"anomaly":-1.3},{"lng":127.0225,"lat":37.618,"lst":30.6,"anomaly":-1.4},{"lng":127.03,"lat":37.618,"lst":30.4,"anomaly":-1.6},{"lng":127.0375,"lat":37.618,"lst":30.2,"anomaly":-1.8},{"lng":127.045,"lat":37.618,"lst":29.9,"anomaly":-2.1},{"lng":127.0525,"lat":37.618,"lst":29.6,"anomaly":-2.4},{"lng":127.06,"lat":37.618,"lst":29.4,"anomaly":-2.6},{"lng":127.0675,"lat":37.618,"lst":29.2,"anomaly":-2.8},{"lng":127.075,"lat":37.618,"lst":29.2,"anomaly":-2.8},{"lng":127.0825,"lat":37.618,"lst":29.2,"anomaly":-2.8},{"lng":127.09,"lat":37.618,"lst":29.3,"anomaly":-2.7},{"lng":127.0975,"lat":37.618,"lst":29.4,"anomaly":-2.6},{"lng":127.105,"lat":37.618,"lst":29.6,"anomaly":-2.4},{"lng":126.9175,"lat":37.624,"lst":28.7,"anomaly":-3.3},{"lng":126.925,"lat":37.624,"lst":28.5,"anomaly":-3.5},{"lng":126.9325,"lat":37.624,"lst":28.4,"anomaly":-3.6},{"lng":126.94,"lat":37.624,"lst":28.4,"anomaly":-3.6},{"lng":126.9475,"lat":37.624,"lst":28.5,"anomaly":-3.5},{"lng":126.955,"lat":37.624,"lst":28.7,"anomaly":-3.3},{"lng":126.9625,"lat":37.624,"lst":28.9,"anomaly":-3.1},{"lng":126.97,"lat":37.624,"lst":29.1,"anomaly":-2.9},{"lng":126.9775,"lat":37.624,"lst":29.4,"anomaly":-2.6},{"lng":126.985,"lat":37.624,"lst":29.6,"anomaly":-2.4},{"lng":126.9925,"lat":37.624,"lst":29.8,"anomaly":-2.2},{"lng":127,"lat":37.624,"lst":29.9,"anomaly":-2.1},{"lng":127.0075,"lat":37.624,"lst":30,"anomaly":-2},{"lng":127.015,"lat":37.624,"lst":29.9,"anomaly":-2.1},{"lng":127.0225,"lat":37.624,"lst":29.8,"anomaly":-2.2},{"lng":127.03,"lat":37.624,"lst":29.6,"anomaly":-2.4},{"lng":127.0375,"lat":37.624,"lst":29.4,"anomaly":-2.6},{"lng":127.045,"lat":37.624,"lst":29.2,"anomaly":-2.8},{"lng":127.0525,"lat":37.624,"lst":28.9,"anomaly":-3.1},{"lng":127.06,"lat":37.624,"lst":28.8,"anomaly":-3.2},{"lng":127.0675,"lat":37.624,"lst":28.6,"anomaly":-3.4},{"lng":127.075,"lat":37.624,"lst":28.6,"anomaly":-3.4},{"lng":127.0825,"lat":37.624,"lst":28.7,"anomaly":-3.3},{"lng":127.09,"lat":37.624,"lst":28.9,"anomaly":-3.1},{"lng":127.0975,"lat":37.624,"lst":29.1,"anomaly":-2.9},{"lng":127.105,"lat":37.624,"lst":29.3,"anomaly":-2.7},{"lng":126.91,"lat":37.63,"lst":28.7,"anomaly":-3.3},{"lng":126.9175,"lat":37.63,"lst":28.4,"anomaly":-3.6},{"lng":126.925,"lat":37.63,"lst":28.2,"anomaly":-3.8},{"lng":126.9325,"lat":37.63,"lst":28,"anomaly":-4},{"lng":126.94,"lat":37.63,"lst":28,"anomaly":-4},{"lng":126.9475,"lat":37.63,"lst":28,"anomaly":-4},{"lng":126.955,"lat":37.63,"lst":28.1,"anomaly":-3.9},{"lng":126.9625,"lat":37.63,"lst":28.3,"anomaly":-3.7},{"lng":126.97,"lat":37.63,"lst":28.5,"anomaly":-3.5},{"lng":126.985,"lat":37.63,"lst":28.9,"anomaly":-3.1},{"lng":126.9925,"lat":37.63,"lst":29.1,"anomaly":-2.9},{"lng":127,"lat":37.63,"lst":29.2,"anomaly":-2.8},{"lng":127.0075,"lat":37.63,"lst":29.2,"anomaly":-2.8},{"lng":127.015,"lat":37.63,"lst":29.2,"anomaly":-2.8},{"lng":127.0225,"lat":37.63,"lst":29.1,"anomaly":-2.9},{"lng":127.03,"lat":37.63,"lst":29,"anomaly":-3},{"lng":127.0375,"lat":37.63,"lst":28.8,"anomaly":-3.2},{"lng":127.045,"lat":37.63,"lst":28.6,"anomaly":-3.4},{"lng":127.0525,"lat":37.63,"lst":28.4,"anomaly":-3.6},{"lng":127.06,"lat":37.63,"lst":28.2,"anomaly":-3.8},{"lng":127.0675,"lat":37.63,"lst":28.1,"anomaly":-3.9},{"lng":127.075,"lat":37.63,"lst":28.2,"anomaly":-3.8},{"lng":127.0825,"lat":37.63,"lst":28.3,"anomaly":-3.7},{"lng":127.09,"lat":37.63,"lst":28.5,"anomaly":-3.5},{"lng":127.0975,"lat":37.63,"lst":28.8,"anomaly":-3.2},{"lng":127.105,"lat":37.63,"lst":29.1,"anomaly":-2.9},{"lng":127.1125,"lat":37.63,"lst":29.4,"anomaly":-2.6},{"lng":126.9175,"lat":37.636,"lst":28.2,"anomaly":-3.8},{"lng":126.925,"lat":37.636,"lst":27.9,"anomaly":-4.1},{"lng":126.9325,"lat":37.636,"lst":27.8,"anomaly":-4.2},{"lng":126.94,"lat":37.636,"lst":27.7,"anomaly":-4.3},{"lng":126.9475,"lat":37.636,"lst":27.6,"anomaly":-4.4},{"lng":126.955,"lat":37.636,"lst":27.7,"anomaly":-4.3},{"lng":126.9625,"lat":37.636,"lst":27.8,"anomaly":-4.2},{"lng":126.97,"lat":37.636,"lst":28,"anomaly":-4},{"lng":126.9925,"lat":37.636,"lst":28.4,"anomaly":-3.6},{"lng":127,"lat":37.636,"lst":28.5,"anomaly":-3.5},{"lng":127.0075,"lat":37.636,"lst":28.6,"anomaly":-3.4},{"lng":127.015,"lat":37.636,"lst":28.6,"anomaly":-3.4},{"lng":127.0225,"lat":37.636,"lst":28.5,"anomaly":-3.5},{"lng":127.03,"lat":37.636,"lst":28.4,"anomaly":-3.6},{"lng":127.0375,"lat":37.636,"lst":28.2,"anomaly":-3.8},{"lng":127.045,"lat":37.636,"lst":28,"anomaly":-4},{"lng":127.0525,"lat":37.636,"lst":27.9,"anomaly":-4.1},{"lng":127.06,"lat":37.636,"lst":27.8,"anomaly":-4.2},{"lng":127.0675,"lat":37.636,"lst":27.8,"anomaly":-4.2},{"lng":127.075,"lat":37.636,"lst":27.8,"anomaly":-4.2},{"lng":127.0825,"lat":37.636,"lst":28,"anomaly":-4},{"lng":127.09,"lat":37.636,"lst":28.3,"anomaly":-3.7},{"lng":127.0975,"lat":37.636,"lst":28.6,"anomaly":-3.4},{"lng":127.105,"lat":37.636,"lst":28.9,"anomaly":-3.1},{"lng":127.1125,"lat":37.636,"lst":29.2,"anomaly":-2.8},{"lng":126.9175,"lat":37.642,"lst":28.1,"anomaly":-3.9},{"lng":126.925,"lat":37.642,"lst":27.8,"anomaly":-4.2},{"lng":126.9325,"lat":37.642,"lst":27.6,"anomaly":-4.4},{"lng":126.94,"lat":37.642,"lst":27.4,"anomaly":-4.6},{"lng":126.9475,"lat":37.642,"lst":27.4,"anomaly":-4.6},{"lng":126.955,"lat":37.642,"lst":27.4,"anomaly":-4.6},{"lng":126.9625,"lat":37.642,"lst":27.4,"anomaly":-4.6},{"lng":126.9925,"lat":37.642,"lst":27.9,"anomaly":-4.1},{"lng":127,"lat":37.642,"lst":28,"anomaly":-4},{"lng":127.0075,"lat":37.642,"lst":28.1,"anomaly":-3.9},{"lng":127.015,"lat":37.642,"lst":28.1,"anomaly":-3.9},{"lng":127.0225,"lat":37.642,"lst":28,"anomaly":-4},{"lng":127.03,"lat":37.642,"lst":27.9,"anomaly":-4.1},{"lng":127.0375,"lat":37.642,"lst":27.8,"anomaly":-4.2},{"lng":127.045,"lat":37.642,"lst":27.6,"anomaly":-4.4},{"lng":127.0525,"lat":37.642,"lst":27.5,"anomaly":-4.5},{"lng":127.06,"lat":37.642,"lst":27.5,"anomaly":-4.5},{"lng":127.0675,"lat":37.642,"lst":27.5,"anomaly":-4.5},{"lng":127.075,"lat":37.642,"lst":27.6,"anomaly":-4.4},{"lng":127.0825,"lat":37.642,"lst":27.8,"anomaly":-4.2},{"lng":127.09,"lat":37.642,"lst":28.1,"anomaly":-3.9},{"lng":127.0975,"lat":37.642,"lst":28.5,"anomaly":-3.5},{"lng":127.105,"lat":37.642,"lst":28.8,"anomaly":-3.2},{"lng":126.94,"lat":37.648,"lst":27.3,"anomaly":-4.7},{"lng":126.9475,"lat":37.648,"lst":27.2,"anomaly":-4.8},{"lng":126.955,"lat":37.648,"lst":27.1,"anomaly":-4.9},{"lng":126.985,"lat":37.648,"lst":27.4,"anomaly":-4.6},{"lng":126.9925,"lat":37.648,"lst":27.5,"anomaly":-4.5},{"lng":127,"lat":37.648,"lst":27.6,"anomaly":-4.4},{"lng":127.0075,"lat":37.648,"lst":27.6,"anomaly":-4.4},{"lng":127.015,"lat":37.648,"lst":27.6,"anomaly":-4.4},{"lng":127.0225,"lat":37.648,"lst":27.6,"anomaly":-4.4},{"lng":127.03,"lat":37.648,"lst":27.6,"anomaly":-4.4},{"lng":127.0375,"lat":37.648,"lst":27.5,"anomaly":-4.5},{"lng":127.045,"lat":37.648,"lst":27.4,"anomaly":-4.6},{"lng":127.0525,"lat":37.648,"lst":27.3,"anomaly":-4.7},{"lng":127.06,"lat":37.648,"lst":27.3,"anomaly":-4.7},{"lng":127.0675,"lat":37.648,"lst":27.4,"anomaly":-4.6},{"lng":127.075,"lat":37.648,"lst":27.5,"anomaly":-4.5},{"lng":127.0825,"lat":37.648,"lst":27.7,"anomaly":-4.3},{"lng":127.09,"lat":37.648,"lst":28,"anomaly":-4},{"lng":126.9475,"lat":37.654,"lst":27.1,"anomaly":-4.9},{"lng":126.985,"lat":37.654,"lst":27.1,"anomaly":-4.9},{"lng":126.9925,"lat":37.654,"lst":27.2,"anomaly":-4.8},{"lng":127,"lat":37.654,"lst":27.2,"anomaly":-4.8},{"lng":127.0075,"lat":37.654,"lst":27.3,"anomaly":-4.7},{"lng":127.015,"lat":37.654,"lst":27.3,"anomaly":-4.7},{"lng":127.0225,"lat":37.654,"lst":27.4,"anomaly":-4.6},{"lng":127.03,"lat":37.654,"lst":27.3,"anomaly":-4.7},{"lng":127.0375,"lat":37.654,"lst":27.3,"anomaly":-4.7},{"lng":127.045,"lat":37.654,"lst":27.2,"anomaly":-4.8},{"lng":127.0525,"lat":37.654,"lst":27.2,"anomaly":-4.8},{"lng":127.06,"lat":37.654,"lst":27.2,"anomaly":-4.8},{"lng":127.0675,"lat":37.654,"lst":27.3,"anomaly":-4.7},{"lng":127.075,"lat":37.654,"lst":27.5,"anomaly":-4.5},{"lng":127.0825,"lat":37.654,"lst":27.7,"anomaly":-4.3},{"lng":127.09,"lat":37.654,"lst":28.1,"anomaly":-3.9},{"lng":126.9925,"lat":37.66,"lst":26.9,"anomaly":-5.1},{"lng":127,"lat":37.66,"lst":27,"anomaly":-5},{"lng":127.0075,"lat":37.66,"lst":27.1,"anomaly":-4.9},{"lng":127.015,"lat":37.66,"lst":27.2,"anomaly":-4.8},{"lng":127.0225,"lat":37.66,"lst":27.2,"anomaly":-4.8},{"lng":127.03,"lat":37.66,"lst":27.2,"anomaly":-4.8},{"lng":127.0375,"lat":37.66,"lst":27.2,"anomaly":-4.8},{"lng":127.045,"lat":37.66,"lst":27.2,"anomaly":-4.8},{"lng":127.0525,"lat":37.66,"lst":27.2,"anomaly":-4.8},{"lng":127.06,"lat":37.66,"lst":27.3,"anomaly":-4.7},{"lng":127.0675,"lat":37.66,"lst":27.4,"anomaly":-4.6},{"lng":127.075,"lat":37.66,"lst":27.6,"anomaly":-4.4},{"lng":127.0825,"lat":37.66,"lst":27.8,"anomaly":-4.2},{"lng":127.09,"lat":37.66,"lst":28.2,"anomaly":-3.8},{"lng":127.0975,"lat":37.66,"lst":28.5,"anomaly":-3.5},{"lng":127,"lat":37.666,"lst":26.9,"anomaly":-5.1},{"lng":127.0075,"lat":37.666,"lst":27,"anomaly":-5},{"lng":127.015,"lat":37.666,"lst":27.1,"anomaly":-4.9},{"lng":127.0225,"lat":37.666,"lst":27.1,"anomaly":-4.9},{"lng":127.03,"lat":37.666,"lst":27.2,"anomaly":-4.8},{"lng":127.0375,"lat":37.666,"lst":27.2,"anomaly":-4.8},{"lng":127.045,"lat":37.666,"lst":27.2,"anomaly":-4.8},{"lng":127.0525,"lat":37.666,"lst":27.3,"anomaly":-4.7},{"lng":127.06,"lat":37.666,"lst":27.4,"anomaly":-4.6},{"lng":127.0675,"lat":37.666,"lst":27.5,"anomaly":-4.5},{"lng":127.075,"lat":37.666,"lst":27.7,"anomaly":-4.3},{"lng":127.0825,"lat":37.666,"lst":28,"anomaly":-4},{"lng":127.09,"lat":37.666,"lst":28.3,"anomaly":-3.7},{"lng":127,"lat":37.672,"lst":26.8,"anomaly":-5.2},{"lng":127.0075,"lat":37.672,"lst":26.9,"anomaly":-5.1},{"lng":127.015,"lat":37.672,"lst":27,"anomaly":-5},{"lng":127.0225,"lat":37.672,"lst":27.1,"anomaly":-4.9},{"lng":127.03,"lat":37.672,"lst":27.2,"anomaly":-4.8},{"lng":127.0375,"lat":37.672,"lst":27.3,"anomaly":-4.7},{"lng":127.045,"lat":37.672,"lst":27.4,"anomaly":-4.6},{"lng":127.0525,"lat":37.672,"lst":27.5,"anomaly":-4.5},{"lng":127.06,"lat":37.672,"lst":27.6,"anomaly":-4.4},{"lng":127.0675,"lat":37.672,"lst":27.7,"anomaly":-4.3},{"lng":127.075,"lat":37.672,"lst":28,"anomaly":-4},{"lng":127.0825,"lat":37.672,"lst":28.2,"anomaly":-3.8},{"lng":127.09,"lat":37.672,"lst":28.5,"anomaly":-3.5},{"lng":127,"lat":37.678,"lst":26.9,"anomaly":-5.1},{"lng":127.0075,"lat":37.678,"lst":27,"anomaly":-5},{"lng":127.015,"lat":37.678,"lst":27.1,"anomaly":-4.9},{"lng":127.0225,"lat":37.678,"lst":27.2,"anomaly":-4.8},{"lng":127.03,"lat":37.678,"lst":27.3,"anomaly":-4.7},{"lng":127.0375,"lat":37.678,"lst":27.4,"anomaly":-4.6},{"lng":127.045,"lat":37.678,"lst":27.5,"anomaly":-4.5},{"lng":127.0525,"lat":37.678,"lst":27.7,"anomaly":-4.3},{"lng":127.06,"lat":37.678,"lst":27.8,"anomaly":-4.2},{"lng":127.0675,"lat":37.678,"lst":28,"anomaly":-4},{"lng":127.075,"lat":37.678,"lst":28.2,"anomaly":-3.8},{"lng":127.0825,"lat":37.678,"lst":28.4,"anomaly":-3.6},{"lng":127.09,"lat":37.678,"lst":28.7,"anomaly":-3.3},{"lng":127.015,"lat":37.684,"lst":27.2,"anomaly":-4.8},{"lng":127.0225,"lat":37.684,"lst":27.3,"anomaly":-4.7},{"lng":127.03,"lat":37.684,"lst":27.5,"anomaly":-4.5},{"lng":127.0375,"lat":37.684,"lst":27.6,"anomaly":-4.4},{"lng":127.045,"lat":37.684,"lst":27.8,"anomaly":-4.2},{"lng":127.0525,"lat":37.684,"lst":27.9,"anomaly":-4.1},{"lng":127.06,"lat":37.684,"lst":28.1,"anomaly":-3.9},{"lng":127.0675,"lat":37.684,"lst":28.3,"anomaly":-3.7},{"lng":127.075,"lat":37.684,"lst":28.5,"anomaly":-3.5},{"lng":127.0825,"lat":37.684,"lst":28.7,"anomaly":-3.3},{"lng":127.09,"lat":37.684,"lst":28.9,"anomaly":-3.1},{"lng":127.0975,"lat":37.684,"lst":29.2,"anomaly":-2.8},{"lng":127.015,"lat":37.69,"lst":27.4,"anomaly":-4.6},{"lng":127.0225,"lat":37.69,"lst":27.5,"anomaly":-4.5},{"lng":127.03,"lat":37.69,"lst":27.7,"anomaly":-4.3},{"lng":127.045,"lat":37.69,"lst":28,"anomaly":-4},{"lng":127.075,"lat":37.69,"lst":28.7,"anomaly":-3.3},{"lng":127.0825,"lat":37.69,"lst":28.9,"anomaly":-3.1},{"lng":127.0225,"lat":37.696,"lst":27.7,"anomaly":-4.3},{"lng":127.03,"lat":37.696,"lst":27.9,"anomaly":-4.1}];

export const SDOT_STATIONS: SDotStation[] = [
  {
    "id": "SDOT-0001",
    "name": "종로구 세종대로 사거리",
    "district": "종로구",
    "lat": 37.572,
    "lng": 126.979,
    "temp": 31.2,
    "humidity": 60,
    "pm25": 25,
    "noise": 64
  },
  {
    "id": "SDOT-0002",
    "name": "종로구 광화문광장",
    "district": "종로구",
    "lat": 37.58,
    "lng": 126.992,
    "temp": 31,
    "humidity": 61,
    "pm25": 27,
    "noise": 66
  },
  {
    "id": "SDOT-0003",
    "name": "종로구 종로3가역",
    "district": "종로구",
    "lat": 37.579,
    "lng": 126.967,
    "temp": 31,
    "humidity": 61,
    "pm25": 29,
    "noise": 68
  },
  {
    "id": "SDOT-0004",
    "name": "종로구 혜화동로터리",
    "district": "종로구",
    "lat": 37.562,
    "lng": 126.988,
    "temp": 31.2,
    "humidity": 60,
    "pm25": 25,
    "noise": 70
  },
  {
    "id": "SDOT-0005",
    "name": "종로구 독립문역",
    "district": "종로구",
    "lat": 37.563,
    "lng": 126.969,
    "temp": 31.2,
    "humidity": 60,
    "pm25": 27,
    "noise": 64
  },
  {
    "id": "SDOT-0006",
    "name": "중구 을지로입구역",
    "district": "중구",
    "lat": 37.5641,
    "lng": 126.9979,
    "temp": 31.3,
    "humidity": 60,
    "pm25": 25,
    "noise": 64
  },
  {
    "id": "SDOT-0007",
    "name": "중구 서울시청 앞",
    "district": "중구",
    "lat": 37.5721,
    "lng": 127.0109,
    "temp": 31.4,
    "humidity": 60,
    "pm25": 27,
    "noise": 66
  },
  {
    "id": "SDOT-0008",
    "name": "중구 동대문역사문화공원",
    "district": "중구",
    "lat": 37.5711,
    "lng": 126.9859,
    "temp": 31.2,
    "humidity": 60,
    "pm25": 29,
    "noise": 68
  },
  {
    "id": "SDOT-0009",
    "name": "중구 충무로역",
    "district": "중구",
    "lat": 37.5541,
    "lng": 127.0069,
    "temp": 31.3,
    "humidity": 60,
    "pm25": 25,
    "noise": 70
  },
  {
    "id": "SDOT-0010",
    "name": "중구 남대문시장",
    "district": "중구",
    "lat": 37.5551,
    "lng": 126.9879,
    "temp": 31.2,
    "humidity": 60,
    "pm25": 27,
    "noise": 64
  },
  {
    "id": "SDOT-0011",
    "name": "용산구 이태원로",
    "district": "용산구",
    "lat": 37.532,
    "lng": 126.99,
    "temp": 30.5,
    "humidity": 62,
    "pm25": 24,
    "noise": 64
  },
  {
    "id": "SDOT-0012",
    "name": "용산구 용산역 광장",
    "district": "용산구",
    "lat": 37.54,
    "lng": 127.003,
    "temp": 30.8,
    "humidity": 61,
    "pm25": 26,
    "noise": 66
  },
  {
    "id": "SDOT-0013",
    "name": "용산구 한강대로",
    "district": "용산구",
    "lat": 37.539,
    "lng": 126.978,
    "temp": 30.7,
    "humidity": 61,
    "pm25": 28,
    "noise": 68
  },
  {
    "id": "SDOT-0014",
    "name": "용산구 삼각지역",
    "district": "용산구",
    "lat": 37.522,
    "lng": 126.999,
    "temp": 29.9,
    "humidity": 63,
    "pm25": 23,
    "noise": 70
  },
  {
    "id": "SDOT-0015",
    "name": "용산구 효창공원앞역",
    "district": "용산구",
    "lat": 37.523,
    "lng": 126.98,
    "temp": 29.8,
    "humidity": 64,
    "pm25": 25,
    "noise": 64
  },
  {
    "id": "SDOT-0016",
    "name": "성동구 왕십리역",
    "district": "성동구",
    "lat": 37.5634,
    "lng": 127.0371,
    "temp": 31.7,
    "humidity": 64,
    "pm25": 17,
    "noise": 56
  },
  {
    "id": "SDOT-0017",
    "name": "성동구 성수동 카페거리",
    "district": "성동구",
    "lat": 37.5714,
    "lng": 127.0501,
    "temp": 31.2,
    "humidity": 65,
    "pm25": 18,
    "noise": 58
  },
  {
    "id": "SDOT-0018",
    "name": "성동구 뚝섬역",
    "district": "성동구",
    "lat": 37.5704,
    "lng": 127.0251,
    "temp": 31.6,
    "humidity": 64,
    "pm25": 20,
    "noise": 60
  },
  {
    "id": "SDOT-0019",
    "name": "성동구 응봉교",
    "district": "성동구",
    "lat": 37.5534,
    "lng": 127.0461,
    "temp": 31.6,
    "humidity": 64,
    "pm25": 16,
    "noise": 62
  },
  {
    "id": "SDOT-0020",
    "name": "성동구 한양대앞",
    "district": "성동구",
    "lat": 37.5544,
    "lng": 127.0271,
    "temp": 31.7,
    "humidity": 64,
    "pm25": 19,
    "noise": 56
  },
  {
    "id": "SDOT-0021",
    "name": "광진구 건대입구역",
    "district": "광진구",
    "lat": 37.5385,
    "lng": 127.0823,
    "temp": 30.2,
    "humidity": 68,
    "pm25": 14,
    "noise": 56
  },
  {
    "id": "SDOT-0022",
    "name": "광진구 구의역",
    "district": "광진구",
    "lat": 37.5465,
    "lng": 127.0953,
    "temp": 29.8,
    "humidity": 69,
    "pm25": 16,
    "noise": 58
  },
  {
    "id": "SDOT-0023",
    "name": "광진구 아차산역",
    "district": "광진구",
    "lat": 37.5455,
    "lng": 127.0703,
    "temp": 30.9,
    "humidity": 66,
    "pm25": 19,
    "noise": 60
  },
  {
    "id": "SDOT-0024",
    "name": "광진구 뚝섬유원지",
    "district": "광진구",
    "lat": 37.5285,
    "lng": 127.0913,
    "temp": 29.8,
    "humidity": 69,
    "pm25": 14,
    "noise": 62
  },
  {
    "id": "SDOT-0025",
    "name": "광진구 자양사거리",
    "district": "광진구",
    "lat": 37.5295,
    "lng": 127.0723,
    "temp": 30.1,
    "humidity": 68,
    "pm25": 16,
    "noise": 56
  },
  {
    "id": "SDOT-0026",
    "name": "동대문구 청량리역",
    "district": "동대문구",
    "lat": 37.5744,
    "lng": 127.0396,
    "temp": 31.3,
    "humidity": 65,
    "pm25": 16,
    "noise": 56
  },
  {
    "id": "SDOT-0027",
    "name": "동대문구 회기역",
    "district": "동대문구",
    "lat": 37.5824,
    "lng": 127.0526,
    "temp": 30.7,
    "humidity": 66,
    "pm25": 17,
    "noise": 58
  },
  {
    "id": "SDOT-0028",
    "name": "동대문구 장안동사거리",
    "district": "동대문구",
    "lat": 37.5814,
    "lng": 127.0276,
    "temp": 31.1,
    "humidity": 65,
    "pm25": 20,
    "noise": 60
  },
  {
    "id": "SDOT-0029",
    "name": "동대문구 답십리역",
    "district": "동대문구",
    "lat": 37.5644,
    "lng": 127.0486,
    "temp": 31.5,
    "humidity": 64,
    "pm25": 16,
    "noise": 62
  },
  {
    "id": "SDOT-0030",
    "name": "동대문구 경동시장",
    "district": "동대문구",
    "lat": 37.5654,
    "lng": 127.0296,
    "temp": 31.7,
    "humidity": 64,
    "pm25": 19,
    "noise": 56
  },
  {
    "id": "SDOT-0031",
    "name": "중랑구 상봉역",
    "district": "중랑구",
    "lat": 37.6063,
    "lng": 127.0927,
    "temp": 28.9,
    "humidity": 71,
    "pm25": 12,
    "noise": 56
  },
  {
    "id": "SDOT-0032",
    "name": "중랑구 면목역",
    "district": "중랑구",
    "lat": 37.6143,
    "lng": 127.1057,
    "temp": 28.8,
    "humidity": 71,
    "pm25": 14,
    "noise": 58
  },
  {
    "id": "SDOT-0033",
    "name": "중랑구 묵동사거리",
    "district": "중랑구",
    "lat": 37.6133,
    "lng": 127.0807,
    "temp": 28.7,
    "humidity": 72,
    "pm25": 16,
    "noise": 60
  },
  {
    "id": "SDOT-0034",
    "name": "중랑구 중화역",
    "district": "중랑구",
    "lat": 37.5963,
    "lng": 127.1017,
    "temp": 29.3,
    "humidity": 70,
    "pm25": 13,
    "noise": 62
  },
  {
    "id": "SDOT-0035",
    "name": "중랑구 망우역",
    "district": "중랑구",
    "lat": 37.5973,
    "lng": 127.0827,
    "temp": 29.2,
    "humidity": 70,
    "pm25": 15,
    "noise": 56
  },
  {
    "id": "SDOT-0036",
    "name": "성북구 성신여대입구역",
    "district": "성북구",
    "lat": 37.5894,
    "lng": 127.0167,
    "temp": 30.9,
    "humidity": 66,
    "pm25": 15,
    "noise": 56
  },
  {
    "id": "SDOT-0037",
    "name": "성북구 길음역",
    "district": "성북구",
    "lat": 37.5974,
    "lng": 127.0297,
    "temp": 30.1,
    "humidity": 68,
    "pm25": 16,
    "noise": 58
  },
  {
    "id": "SDOT-0038",
    "name": "성북구 돈암사거리",
    "district": "성북구",
    "lat": 37.5964,
    "lng": 127.0047,
    "temp": 30.6,
    "humidity": 67,
    "pm25": 19,
    "noise": 60
  },
  {
    "id": "SDOT-0039",
    "name": "성북구 정릉동",
    "district": "성북구",
    "lat": 37.5794,
    "lng": 127.0257,
    "temp": 31.2,
    "humidity": 65,
    "pm25": 16,
    "noise": 62
  },
  {
    "id": "SDOT-0040",
    "name": "성북구 안암오거리",
    "district": "성북구",
    "lat": 37.5804,
    "lng": 127.0067,
    "temp": 31.1,
    "humidity": 65,
    "pm25": 18,
    "noise": 56
  },
  {
    "id": "SDOT-0041",
    "name": "강북구 수유역",
    "district": "강북구",
    "lat": 37.6396,
    "lng": 127.0257,
    "temp": 28,
    "humidity": 73,
    "pm25": 11,
    "noise": 56
  },
  {
    "id": "SDOT-0042",
    "name": "강북구 미아사거리역",
    "district": "강북구",
    "lat": 37.6476,
    "lng": 127.0387,
    "temp": 27.8,
    "humidity": 74,
    "pm25": 13,
    "noise": 58
  },
  {
    "id": "SDOT-0043",
    "name": "강북구 번동사거리",
    "district": "강북구",
    "lat": 37.6466,
    "lng": 127.0137,
    "temp": 27.8,
    "humidity": 74,
    "pm25": 15,
    "noise": 60
  },
  {
    "id": "SDOT-0044",
    "name": "강북구 4·19민주묘지",
    "district": "강북구",
    "lat": 37.6296,
    "lng": 127.0347,
    "temp": 28.3,
    "humidity": 73,
    "pm25": 11,
    "noise": 62
  },
  {
    "id": "SDOT-0045",
    "name": "강북구 우이동",
    "district": "강북구",
    "lat": 37.6306,
    "lng": 127.0157,
    "temp": 28.5,
    "humidity": 72,
    "pm25": 14,
    "noise": 56
  },
  {
    "id": "SDOT-0046",
    "name": "도봉구 창동역",
    "district": "도봉구",
    "lat": 37.6688,
    "lng": 127.0471,
    "temp": 27.6,
    "humidity": 74,
    "pm25": 10,
    "noise": 56
  },
  {
    "id": "SDOT-0047",
    "name": "도봉구 쌍문역",
    "district": "도봉구",
    "lat": 37.6768,
    "lng": 127.0601,
    "temp": 27.9,
    "humidity": 74,
    "pm25": 13,
    "noise": 58
  },
  {
    "id": "SDOT-0048",
    "name": "도봉구 방학사거리",
    "district": "도봉구",
    "lat": 37.6758,
    "lng": 127.0351,
    "temp": 27.7,
    "humidity": 74,
    "pm25": 15,
    "noise": 60
  },
  {
    "id": "SDOT-0049",
    "name": "도봉구 도봉산역",
    "district": "도봉구",
    "lat": 37.6588,
    "lng": 127.0561,
    "temp": 27.6,
    "humidity": 74,
    "pm25": 10,
    "noise": 62
  },
  {
    "id": "SDOT-0050",
    "name": "도봉구 노해로",
    "district": "도봉구",
    "lat": 37.6598,
    "lng": 127.0371,
    "temp": 27.6,
    "humidity": 74,
    "pm25": 12,
    "noise": 56
  },
  {
    "id": "SDOT-0051",
    "name": "노원구 노원역",
    "district": "노원구",
    "lat": 37.654,
    "lng": 127.056,
    "temp": 27.6,
    "humidity": 74,
    "pm25": 10,
    "noise": 56
  },
  {
    "id": "SDOT-0052",
    "name": "노원구 상계역",
    "district": "노원구",
    "lat": 37.662,
    "lng": 127.069,
    "temp": 27.7,
    "humidity": 74,
    "pm25": 13,
    "noise": 58
  },
  {
    "id": "SDOT-0053",
    "name": "노원구 중계동 학원가",
    "district": "노원구",
    "lat": 37.661,
    "lng": 127.044,
    "temp": 27.6,
    "humidity": 74,
    "pm25": 14,
    "noise": 60
  },
  {
    "id": "SDOT-0054",
    "name": "노원구 공릉역",
    "district": "노원구",
    "lat": 37.644,
    "lng": 127.065,
    "temp": 27.8,
    "humidity": 74,
    "pm25": 11,
    "noise": 62
  },
  {
    "id": "SDOT-0055",
    "name": "노원구 태릉입구역",
    "district": "노원구",
    "lat": 37.645,
    "lng": 127.046,
    "temp": 27.8,
    "humidity": 74,
    "pm25": 13,
    "noise": 56
  },
  {
    "id": "SDOT-0056",
    "name": "은평구 연신내역",
    "district": "은평구",
    "lat": 37.6027,
    "lng": 126.9291,
    "temp": 29.1,
    "humidity": 71,
    "pm25": 13,
    "noise": 56
  },
  {
    "id": "SDOT-0057",
    "name": "은평구 불광역",
    "district": "은평구",
    "lat": 37.6107,
    "lng": 126.9421,
    "temp": 28.6,
    "humidity": 72,
    "pm25": 14,
    "noise": 58
  },
  {
    "id": "SDOT-0058",
    "name": "은평구 응암오거리",
    "district": "은평구",
    "lat": 37.6097,
    "lng": 126.9171,
    "temp": 28.6,
    "humidity": 72,
    "pm25": 16,
    "noise": 60
  },
  {
    "id": "SDOT-0059",
    "name": "은평구 구파발역",
    "district": "은평구",
    "lat": 37.5927,
    "lng": 126.9381,
    "temp": 29.5,
    "humidity": 70,
    "pm25": 13,
    "noise": 62
  },
  {
    "id": "SDOT-0060",
    "name": "은평구 수색로",
    "district": "은평구",
    "lat": 37.5937,
    "lng": 126.9191,
    "temp": 29.4,
    "humidity": 70,
    "pm25": 15,
    "noise": 56
  },
  {
    "id": "SDOT-0061",
    "name": "서대문구 신촌로터리",
    "district": "서대문구",
    "lat": 37.5791,
    "lng": 126.9368,
    "temp": 30.2,
    "humidity": 68,
    "pm25": 14,
    "noise": 56
  },
  {
    "id": "SDOT-0062",
    "name": "서대문구 홍제역",
    "district": "서대문구",
    "lat": 37.5871,
    "lng": 126.9498,
    "temp": 30,
    "humidity": 68,
    "pm25": 16,
    "noise": 58
  },
  {
    "id": "SDOT-0063",
    "name": "서대문구 독립문공원",
    "district": "서대문구",
    "lat": 37.5861,
    "lng": 126.9248,
    "temp": 29.7,
    "humidity": 69,
    "pm25": 18,
    "noise": 60
  },
  {
    "id": "SDOT-0064",
    "name": "서대문구 가좌역",
    "district": "서대문구",
    "lat": 37.5691,
    "lng": 126.9458,
    "temp": 30.9,
    "humidity": 66,
    "pm25": 15,
    "noise": 62
  },
  {
    "id": "SDOT-0065",
    "name": "서대문구 아현동",
    "district": "서대문구",
    "lat": 37.5701,
    "lng": 126.9268,
    "temp": 30.5,
    "humidity": 67,
    "pm25": 17,
    "noise": 56
  },
  {
    "id": "SDOT-0066",
    "name": "마포구 홍대입구역",
    "district": "마포구",
    "lat": 37.566,
    "lng": 126.901,
    "temp": 30.1,
    "humidity": 68,
    "pm25": 14,
    "noise": 56
  },
  {
    "id": "SDOT-0067",
    "name": "마포구 합정역",
    "district": "마포구",
    "lat": 37.574,
    "lng": 126.914,
    "temp": 30.2,
    "humidity": 68,
    "pm25": 16,
    "noise": 58
  },
  {
    "id": "SDOT-0068",
    "name": "마포구 상암DMC",
    "district": "마포구",
    "lat": 37.573,
    "lng": 126.889,
    "temp": 29.9,
    "humidity": 68,
    "pm25": 18,
    "noise": 60
  },
  {
    "id": "SDOT-0069",
    "name": "마포구 공덕오거리",
    "district": "마포구",
    "lat": 37.556,
    "lng": 126.91,
    "temp": 30.3,
    "humidity": 67,
    "pm25": 14,
    "noise": 62
  },
  {
    "id": "SDOT-0070",
    "name": "마포구 망원시장",
    "district": "마포구",
    "lat": 37.557,
    "lng": 126.891,
    "temp": 29.9,
    "humidity": 68,
    "pm25": 16,
    "noise": 56
  },
  {
    "id": "SDOT-0071",
    "name": "양천구 목동운동장",
    "district": "양천구",
    "lat": 37.517,
    "lng": 126.8664,
    "temp": 31.4,
    "humidity": 65,
    "pm25": 16,
    "noise": 56
  },
  {
    "id": "SDOT-0072",
    "name": "양천구 오목교역",
    "district": "양천구",
    "lat": 37.525,
    "lng": 126.8794,
    "temp": 31.4,
    "humidity": 65,
    "pm25": 18,
    "noise": 58
  },
  {
    "id": "SDOT-0073",
    "name": "양천구 신정네거리역",
    "district": "양천구",
    "lat": 37.524,
    "lng": 126.8544,
    "temp": 31.3,
    "humidity": 65,
    "pm25": 20,
    "noise": 60
  },
  {
    "id": "SDOT-0074",
    "name": "양천구 신월동",
    "district": "양천구",
    "lat": 37.507,
    "lng": 126.8754,
    "temp": 31.5,
    "humidity": 64,
    "pm25": 16,
    "noise": 62
  },
  {
    "id": "SDOT-0075",
    "name": "양천구 등촌로",
    "district": "양천구",
    "lat": 37.508,
    "lng": 126.8564,
    "temp": 31.3,
    "humidity": 65,
    "pm25": 18,
    "noise": 56
  },
  {
    "id": "SDOT-0076",
    "name": "강서구 김포공항",
    "district": "강서구",
    "lat": 37.5509,
    "lng": 126.8495,
    "temp": 30,
    "humidity": 68,
    "pm25": 14,
    "noise": 56
  },
  {
    "id": "SDOT-0077",
    "name": "강서구 발산역",
    "district": "강서구",
    "lat": 37.5589,
    "lng": 126.8625,
    "temp": 29.7,
    "humidity": 69,
    "pm25": 16,
    "noise": 58
  },
  {
    "id": "SDOT-0078",
    "name": "강서구 까치산역",
    "district": "강서구",
    "lat": 37.5579,
    "lng": 126.8375,
    "temp": 29.4,
    "humidity": 70,
    "pm25": 17,
    "noise": 60
  },
  {
    "id": "SDOT-0079",
    "name": "강서구 마곡나루역",
    "district": "강서구",
    "lat": 37.5409,
    "lng": 126.8585,
    "temp": 30.7,
    "humidity": 66,
    "pm25": 15,
    "noise": 62
  },
  {
    "id": "SDOT-0080",
    "name": "강서구 화곡로",
    "district": "강서구",
    "lat": 37.5419,
    "lng": 126.8395,
    "temp": 30.5,
    "humidity": 67,
    "pm25": 17,
    "noise": 56
  },
  {
    "id": "SDOT-0081",
    "name": "구로구 구로디지털단지역",
    "district": "구로구",
    "lat": 37.495,
    "lng": 126.858,
    "temp": 31,
    "humidity": 61,
    "pm25": 25,
    "noise": 64
  },
  {
    "id": "SDOT-0082",
    "name": "구로구 신도림역",
    "district": "구로구",
    "lat": 37.503,
    "lng": 126.871,
    "temp": 31.5,
    "humidity": 59,
    "pm25": 27,
    "noise": 66
  },
  {
    "id": "SDOT-0083",
    "name": "구로구 고척스카이돔",
    "district": "구로구",
    "lat": 37.502,
    "lng": 126.846,
    "temp": 30.8,
    "humidity": 61,
    "pm25": 28,
    "noise": 68
  },
  {
    "id": "SDOT-0084",
    "name": "구로구 오류동역",
    "district": "구로구",
    "lat": 37.485,
    "lng": 126.867,
    "temp": 31.2,
    "humidity": 60,
    "pm25": 25,
    "noise": 70
  },
  {
    "id": "SDOT-0085",
    "name": "구로구 개봉역",
    "district": "구로구",
    "lat": 37.486,
    "lng": 126.848,
    "temp": 30.7,
    "humidity": 61,
    "pm25": 26,
    "noise": 64
  },
  {
    "id": "SDOT-0086",
    "name": "금천구 가산디지털단지역",
    "district": "금천구",
    "lat": 37.4569,
    "lng": 126.8956,
    "temp": 29.8,
    "humidity": 64,
    "pm25": 23,
    "noise": 64
  },
  {
    "id": "SDOT-0087",
    "name": "금천구 독산역",
    "district": "금천구",
    "lat": 37.4649,
    "lng": 126.9086,
    "temp": 29.6,
    "humidity": 64,
    "pm25": 24,
    "noise": 66
  },
  {
    "id": "SDOT-0088",
    "name": "금천구 시흥대로",
    "district": "금천구",
    "lat": 37.4639,
    "lng": 126.8836,
    "temp": 30.4,
    "humidity": 62,
    "pm25": 28,
    "noise": 68
  },
  {
    "id": "SDOT-0089",
    "name": "금천구 금천구청역",
    "district": "금천구",
    "lat": 37.4469,
    "lng": 126.9046,
    "temp": 29.2,
    "humidity": 65,
    "pm25": 22,
    "noise": 70
  },
  {
    "id": "SDOT-0090",
    "name": "금천구 석수역",
    "district": "금천구",
    "lat": 37.4479,
    "lng": 126.8856,
    "temp": 29.6,
    "humidity": 64,
    "pm25": 24,
    "noise": 64
  },
  {
    "id": "SDOT-0091",
    "name": "영등포구 여의도공원",
    "district": "영등포구",
    "lat": 37.526,
    "lng": 126.896,
    "temp": 30.9,
    "humidity": 61,
    "pm25": 24,
    "noise": 64
  },
  {
    "id": "SDOT-0092",
    "name": "영등포구 영등포역",
    "district": "영등포구",
    "lat": 37.534,
    "lng": 126.909,
    "temp": 30.4,
    "humidity": 62,
    "pm25": 26,
    "noise": 66
  },
  {
    "id": "SDOT-0093",
    "name": "영등포구 당산역",
    "district": "영등포구",
    "lat": 37.533,
    "lng": 126.884,
    "temp": 30.8,
    "humidity": 61,
    "pm25": 28,
    "noise": 68
  },
  {
    "id": "SDOT-0094",
    "name": "영등포구 문래동 철공소거리",
    "district": "영등포구",
    "lat": 37.516,
    "lng": 126.905,
    "temp": 31.2,
    "humidity": 60,
    "pm25": 25,
    "noise": 70
  },
  {
    "id": "SDOT-0095",
    "name": "영등포구 국회의사당",
    "district": "영등포구",
    "lat": 37.517,
    "lng": 126.886,
    "temp": 31.5,
    "humidity": 59,
    "pm25": 27,
    "noise": 64
  },
  {
    "id": "SDOT-0096",
    "name": "동작구 사당역",
    "district": "동작구",
    "lat": 37.5124,
    "lng": 126.9393,
    "temp": 30,
    "humidity": 68,
    "pm25": 14,
    "noise": 56
  },
  {
    "id": "SDOT-0097",
    "name": "동작구 노량진수산시장",
    "district": "동작구",
    "lat": 37.5204,
    "lng": 126.9523,
    "temp": 29.9,
    "humidity": 68,
    "pm25": 16,
    "noise": 58
  },
  {
    "id": "SDOT-0098",
    "name": "동작구 상도역",
    "district": "동작구",
    "lat": 37.5194,
    "lng": 126.9273,
    "temp": 30.3,
    "humidity": 67,
    "pm25": 18,
    "noise": 60
  },
  {
    "id": "SDOT-0099",
    "name": "동작구 흑석동",
    "district": "동작구",
    "lat": 37.5024,
    "lng": 126.9483,
    "temp": 29.9,
    "humidity": 68,
    "pm25": 14,
    "noise": 62
  },
  {
    "id": "SDOT-0100",
    "name": "동작구 장승배기역",
    "district": "동작구",
    "lat": 37.5034,
    "lng": 126.9293,
    "temp": 30.2,
    "humidity": 68,
    "pm25": 16,
    "noise": 56
  },
  {
    "id": "SDOT-0101",
    "name": "관악구 서울대입구역",
    "district": "관악구",
    "lat": 37.4784,
    "lng": 126.9516,
    "temp": 29.1,
    "humidity": 71,
    "pm25": 13,
    "noise": 56
  },
  {
    "id": "SDOT-0102",
    "name": "관악구 신림역",
    "district": "관악구",
    "lat": 37.4864,
    "lng": 126.9646,
    "temp": 29.3,
    "humidity": 70,
    "pm25": 15,
    "noise": 58
  },
  {
    "id": "SDOT-0103",
    "name": "관악구 낙성대역",
    "district": "관악구",
    "lat": 37.4854,
    "lng": 126.9396,
    "temp": 29.7,
    "humidity": 69,
    "pm25": 18,
    "noise": 60
  },
  {
    "id": "SDOT-0104",
    "name": "관악구 봉천사거리",
    "district": "관악구",
    "lat": 37.4684,
    "lng": 126.9606,
    "temp": 28.5,
    "humidity": 72,
    "pm25": 12,
    "noise": 62
  },
  {
    "id": "SDOT-0105",
    "name": "관악구 서울대 정문",
    "district": "관악구",
    "lat": 37.4694,
    "lng": 126.9416,
    "temp": 28.9,
    "humidity": 71,
    "pm25": 14,
    "noise": 56
  },
  {
    "id": "SDOT-0106",
    "name": "서초구 강남역 12번출구",
    "district": "서초구",
    "lat": 37.484,
    "lng": 127.032,
    "temp": 29.8,
    "humidity": 64,
    "pm25": 23,
    "noise": 64
  },
  {
    "id": "SDOT-0107",
    "name": "서초구 고속터미널역",
    "district": "서초구",
    "lat": 37.492,
    "lng": 127.045,
    "temp": 30.3,
    "humidity": 62,
    "pm25": 25,
    "noise": 66
  },
  {
    "id": "SDOT-0108",
    "name": "서초구 양재시민의숲",
    "district": "서초구",
    "lat": 37.491,
    "lng": 127.02,
    "temp": 29.8,
    "humidity": 64,
    "pm25": 27,
    "noise": 68
  },
  {
    "id": "SDOT-0109",
    "name": "서초구 서초구청",
    "district": "서초구",
    "lat": 37.474,
    "lng": 127.041,
    "temp": 29.6,
    "humidity": 64,
    "pm25": 22,
    "noise": 70
  },
  {
    "id": "SDOT-0110",
    "name": "서초구 방배동 카페골목",
    "district": "서초구",
    "lat": 37.475,
    "lng": 127.022,
    "temp": 29.2,
    "humidity": 65,
    "pm25": 24,
    "noise": 64
  },
  {
    "id": "SDOT-0111",
    "name": "강남구 테헤란로",
    "district": "강남구",
    "lat": 37.518,
    "lng": 127.047,
    "temp": 30.3,
    "humidity": 62,
    "pm25": 23,
    "noise": 64
  },
  {
    "id": "SDOT-0112",
    "name": "강남구 삼성역 코엑스",
    "district": "강남구",
    "lat": 37.526,
    "lng": 127.06,
    "temp": 30.4,
    "humidity": 62,
    "pm25": 26,
    "noise": 66
  },
  {
    "id": "SDOT-0113",
    "name": "강남구 압구정로데오",
    "district": "강남구",
    "lat": 37.525,
    "lng": 127.035,
    "temp": 30.4,
    "humidity": 62,
    "pm25": 28,
    "noise": 68
  },
  {
    "id": "SDOT-0114",
    "name": "강남구 대치동 학원가",
    "district": "강남구",
    "lat": 37.508,
    "lng": 127.056,
    "temp": 30.4,
    "humidity": 62,
    "pm25": 24,
    "noise": 70
  },
  {
    "id": "SDOT-0115",
    "name": "강남구 청담사거리",
    "district": "강남구",
    "lat": 37.509,
    "lng": 127.037,
    "temp": 30.2,
    "humidity": 63,
    "pm25": 25,
    "noise": 64
  },
  {
    "id": "SDOT-0116",
    "name": "송파구 잠실역",
    "district": "송파구",
    "lat": 37.515,
    "lng": 127.106,
    "temp": 30,
    "humidity": 63,
    "pm25": 23,
    "noise": 64
  },
  {
    "id": "SDOT-0117",
    "name": "송파구 석촌호수",
    "district": "송파구",
    "lat": 37.523,
    "lng": 127.119,
    "temp": 29.6,
    "humidity": 64,
    "pm25": 24,
    "noise": 66
  },
  {
    "id": "SDOT-0118",
    "name": "송파구 올림픽공원",
    "district": "송파구",
    "lat": 37.522,
    "lng": 127.094,
    "temp": 29.8,
    "humidity": 64,
    "pm25": 27,
    "noise": 68
  },
  {
    "id": "SDOT-0119",
    "name": "송파구 문정동 법조타운",
    "district": "송파구",
    "lat": 37.505,
    "lng": 127.115,
    "temp": 30.3,
    "humidity": 62,
    "pm25": 23,
    "noise": 70
  },
  {
    "id": "SDOT-0120",
    "name": "송파구 가락시장",
    "district": "송파구",
    "lat": 37.506,
    "lng": 127.096,
    "temp": 30.4,
    "humidity": 62,
    "pm25": 26,
    "noise": 64
  },
  {
    "id": "SDOT-0121",
    "name": "강동구 천호역",
    "district": "강동구",
    "lat": 37.5301,
    "lng": 127.1238,
    "temp": 29.2,
    "humidity": 70,
    "pm25": 13,
    "noise": 56
  },
  {
    "id": "SDOT-0122",
    "name": "강동구 길동사거리",
    "district": "강동구",
    "lat": 37.5381,
    "lng": 127.1368,
    "temp": 28.6,
    "humidity": 72,
    "pm25": 14,
    "noise": 58
  },
  {
    "id": "SDOT-0123",
    "name": "강동구 암사역",
    "district": "강동구",
    "lat": 37.5371,
    "lng": 127.1118,
    "temp": 29.1,
    "humidity": 71,
    "pm25": 17,
    "noise": 60
  },
  {
    "id": "SDOT-0124",
    "name": "강동구 고덕역",
    "district": "강동구",
    "lat": 37.5201,
    "lng": 127.1328,
    "temp": 29.4,
    "humidity": 70,
    "pm25": 13,
    "noise": 62
  },
  {
    "id": "SDOT-0125",
    "name": "강동구 둔촌동",
    "district": "강동구",
    "lat": 37.5211,
    "lng": 127.1138,
    "temp": 29.6,
    "humidity": 69,
    "pm25": 15,
    "noise": 56
  }
];
