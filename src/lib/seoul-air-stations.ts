// 서울시 도시대기측정소 좌표 (에어코리아 MsrstnInfoInqireSvc)
//
// 측정소 위치는 사실상 고정 메타데이터라 번들로 내장한다.
// 측정소 목록 API가 간헐적으로 빈 응답을 주기 때문에, 이 표를 폴백으로 두면
// 실시간 측정값만 살아 있어도 레이어가 정상 렌더링된다.
// 갱신: node --env-file=.env.local scripts/fetch-seoul-air-stations.js src/lib/seoul-air-stations.ts
// 수집 시각: 2026-08-05T03:45:26.700Z

export interface SeoulAirStation {
  name: string;
  lat: number;
  lng: number;
  district: string;
}

export const SEOUL_AIR_STATIONS: SeoulAirStation[] = [
  {
    "name": "강남구",
    "lat": 37.515336,
    "lng": 127.049357,
    "district": "강남구"
  },
  {
    "name": "강남대로",
    "lat": 37.482867,
    "lng": 127.035621,
    "district": "서초구"
  },
  {
    "name": "강동구",
    "lat": 37.545089,
    "lng": 127.136806,
    "district": "강동구"
  },
  {
    "name": "강변북로",
    "lat": 37.539283,
    "lng": 127.040943,
    "district": "성동구"
  },
  {
    "name": "강북구",
    "lat": 37.64793,
    "lng": 127.011952,
    "district": "강북구"
  },
  {
    "name": "강서구",
    "lat": 37.544656,
    "lng": 126.835094,
    "district": "강서구"
  },
  {
    "name": "공항대로",
    "lat": 37.562821,
    "lng": 126.826071,
    "district": "강서구"
  },
  {
    "name": "관악구",
    "lat": 37.477837,
    "lng": 126.959128,
    "district": "관악구"
  },
  {
    "name": "광진구",
    "lat": 37.544639,
    "lng": 127.095706,
    "district": "광진구"
  },
  {
    "name": "구로구",
    "lat": 37.498498,
    "lng": 126.889692,
    "district": "구로구"
  },
  {
    "name": "금천구",
    "lat": 37.452386,
    "lng": 126.908333,
    "district": "금천구"
  },
  {
    "name": "노원구",
    "lat": 37.657415,
    "lng": 127.067876,
    "district": "노원구"
  },
  {
    "name": "도봉구",
    "lat": 37.654278,
    "lng": 127.029333,
    "district": "도봉구"
  },
  {
    "name": "도산대로",
    "lat": 37.516083,
    "lng": 127.019694,
    "district": "강남구"
  },
  {
    "name": "동대문구",
    "lat": 37.576169,
    "lng": 127.029642,
    "district": "동대문구"
  },
  {
    "name": "동작구",
    "lat": 37.480989,
    "lng": 126.971547,
    "district": "동작구"
  },
  {
    "name": "동작대로 중앙차로",
    "lat": 37.489495,
    "lng": 126.982489,
    "district": "동작구"
  },
  {
    "name": "마포구",
    "lat": 37.55561,
    "lng": 126.905457,
    "district": "마포구"
  },
  {
    "name": "서대문구",
    "lat": 37.593749,
    "lng": 126.949534,
    "district": "서대문구"
  },
  {
    "name": "서초구",
    "lat": 37.501783,
    "lng": 126.996573,
    "district": "서초구"
  },
  {
    "name": "성동구",
    "lat": 37.542036,
    "lng": 127.049685,
    "district": "성동구"
  },
  {
    "name": "성북구",
    "lat": 37.606667,
    "lng": 127.027264,
    "district": "성북구"
  },
  {
    "name": "송파구",
    "lat": 37.502685,
    "lng": 127.092385,
    "district": "송파구"
  },
  {
    "name": "시흥대로",
    "lat": 37.474899,
    "lng": 126.898657,
    "district": "금천구"
  },
  {
    "name": "신촌로",
    "lat": 37.554936,
    "lng": 126.937619,
    "district": "마포구"
  },
  {
    "name": "양천구",
    "lat": 37.523286,
    "lng": 126.858689,
    "district": "양천구"
  },
  {
    "name": "영등포구",
    "lat": 37.526339,
    "lng": 126.896256,
    "district": "영등포구"
  },
  {
    "name": "영등포로",
    "lat": 37.520222,
    "lng": 126.904967,
    "district": "영등포구"
  },
  {
    "name": "용산구",
    "lat": 37.532057,
    "lng": 127.002371,
    "district": "용산구"
  },
  {
    "name": "은평구",
    "lat": 37.610471,
    "lng": 126.933504,
    "district": "은평구"
  },
  {
    "name": "정릉로",
    "lat": 37.603593,
    "lng": 127.026007,
    "district": "성북구"
  },
  {
    "name": "종로",
    "lat": 37.570633,
    "lng": 126.996783,
    "district": "종로구"
  },
  {
    "name": "종로구",
    "lat": 37.572025,
    "lng": 127.005028,
    "district": "종로구"
  },
  {
    "name": "중구",
    "lat": 37.564639,
    "lng": 126.975961,
    "district": "중구"
  },
  {
    "name": "중랑구",
    "lat": 37.584953,
    "lng": 127.094283,
    "district": "중랑구"
  },
  {
    "name": "천호대로",
    "lat": 37.534035,
    "lng": 127.139172,
    "district": "강동구"
  },
  {
    "name": "청계천로",
    "lat": 37.56865,
    "lng": 126.998083,
    "district": "중구"
  },
  {
    "name": "한강대로",
    "lat": 37.549389,
    "lng": 126.971519,
    "district": "용산구"
  },
  {
    "name": "홍릉로",
    "lat": 37.580167,
    "lng": 127.044856,
    "district": "동대문구"
  },
  {
    "name": "화랑로",
    "lat": 37.617315,
    "lng": 127.07512,
    "district": "노원구"
  }
];
