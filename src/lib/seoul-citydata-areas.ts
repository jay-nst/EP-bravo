// 서울시 실시간 도시데이터 장소 목록 119곳 — 코드·이름·중심 좌표.
//
// 출처: 서울특별시 실시간 도시데이터 (서울 열린데이터광장, citydata).
// 좌표는 원본에 없다. 각 장소 응답에 실제로 들어있는 버스정류소·지하철역·
// 따릉이대여소·충전소의 WGS84 좌표를 모아 **중앙값**을 낸 유도값이다.
// 측정 지점이 아니라 장소를 대표하는 위치이며, anchor 필드에 어떤 소스에서
// 몇 개를 썼는지 남겨 검증 가능하게 했다.
//
// 장소 좌표는 사실상 고정 메타데이터라 번들에 내장한다. 실시간 인구 API
// (citydata_ppltn)는 장소당 2KB로 가볍지만 좌표를 주지 않고, 좌표가 있는
// 전체 API(citydata)는 장소당 155KB라 런타임에 매번 받을 수 없다.
//
// 갱신: node --env-file=.env.local scripts/fetch-citydata-areas.js src/lib/seoul-citydata-areas.ts
// 수집 시각: 2026-09-07T07:13:32.812Z

export interface SeoulCitydataArea {
  /** 실시간 도시데이터 장소 코드 (POI001 …). API 조회 키로 쓴다. */
  code: string;
  /** 장소명 (예: 광화문·덕수궁) */
  name: string;
  lng: number;
  lat: number;
  /** 중심 좌표를 유도한 소스와 지점 수 (예: BUS_STN_STTS:32) */
  anchor: string;
  anchorCount: number;
}

export const SEOUL_CITYDATA_AREAS: SeoulCitydataArea[] = [
  {
    "code": "POI001",
    "name": "강남 MICE 관광특구",
    "lng": 127.060905,
    "lat": 37.510301,
    "anchor": "BUS_STN_STTS:5",
    "anchorCount": 5
  },
  {
    "code": "POI002",
    "name": "동대문 관광특구",
    "lng": 127.00912,
    "lat": 37.567115,
    "anchor": "BUS_STN_STTS:20",
    "anchorCount": 20
  },
  {
    "code": "POI003",
    "name": "명동 관광특구",
    "lng": 126.980183,
    "lat": 37.564389,
    "anchor": "BUS_STN_STTS:46",
    "anchorCount": 46
  },
  {
    "code": "POI004",
    "name": "이태원 관광특구",
    "lng": 126.99422,
    "lat": 37.534369,
    "anchor": "BUS_STN_STTS:14",
    "anchorCount": 14
  },
  {
    "code": "POI005",
    "name": "잠실 관광특구",
    "lng": 127.106964,
    "lat": 37.5128,
    "anchor": "BUS_STN_STTS:42",
    "anchorCount": 42
  },
  {
    "code": "POI006",
    "name": "종로·청계 관광특구",
    "lng": 126.992796,
    "lat": 37.570109,
    "anchor": "BUS_STN_STTS:34",
    "anchorCount": 34
  },
  {
    "code": "POI007",
    "name": "홍대 관광특구",
    "lng": 126.921004,
    "lat": 37.553769,
    "anchor": "BUS_STN_STTS:52",
    "anchorCount": 52
  },
  {
    "code": "POI008",
    "name": "경복궁",
    "lng": 126.979443,
    "lat": 37.579376,
    "anchor": "BUS_STN_STTS:10",
    "anchorCount": 10
  },
  {
    "code": "POI009",
    "name": "광화문·덕수궁",
    "lng": 126.976961,
    "lat": 37.569257,
    "anchor": "BUS_STN_STTS:32",
    "anchorCount": 32
  },
  {
    "code": "POI010",
    "name": "보신각",
    "lng": 126.98327,
    "lat": 37.570222,
    "anchor": "BUS_STN_STTS:8",
    "anchorCount": 8
  },
  {
    "code": "POI011",
    "name": "서울 암사동 유적",
    "lng": 127.13117,
    "lat": 37.559368,
    "anchor": "BUS_STN_STTS:3",
    "anchorCount": 3
  },
  {
    "code": "POI012",
    "name": "창덕궁·종묘",
    "lng": 126.995008,
    "lat": 37.573482,
    "anchor": "BUS_STN_STTS:14",
    "anchorCount": 14
  },
  {
    "code": "POI013",
    "name": "가산디지털단지역",
    "lng": 126.881283,
    "lat": 37.481159,
    "anchor": "BUS_STN_STTS:51",
    "anchorCount": 51
  },
  {
    "code": "POI014",
    "name": "강남역",
    "lng": 127.027257,
    "lat": 37.498712,
    "anchor": "BUS_STN_STTS:43",
    "anchorCount": 43
  },
  {
    "code": "POI015",
    "name": "건대입구역",
    "lng": 127.070099,
    "lat": 37.540012,
    "anchor": "BUS_STN_STTS:8",
    "anchorCount": 8
  },
  {
    "code": "POI016",
    "name": "고덕역",
    "lng": 127.155423,
    "lat": 37.553692,
    "anchor": "BUS_STN_STTS:4",
    "anchorCount": 4
  },
  {
    "code": "POI017",
    "name": "고속터미널역",
    "lng": 127.005733,
    "lat": 37.506001,
    "anchor": "BUS_STN_STTS:8",
    "anchorCount": 8
  },
  {
    "code": "POI018",
    "name": "교대역",
    "lng": 127.014474,
    "lat": 37.494028,
    "anchor": "BUS_STN_STTS:10",
    "anchorCount": 10
  },
  {
    "code": "POI019",
    "name": "구로디지털단지역",
    "lng": 126.896814,
    "lat": 37.483585,
    "anchor": "BUS_STN_STTS:28",
    "anchorCount": 28
  },
  {
    "code": "POI020",
    "name": "구로역",
    "lng": 126.882678,
    "lat": 37.501337,
    "anchor": "BUS_STN_STTS:4",
    "anchorCount": 4
  },
  {
    "code": "POI021",
    "name": "군자역",
    "lng": 127.07884,
    "lat": 37.556343,
    "anchor": "BUS_STN_STTS:10",
    "anchorCount": 10
  },
  {
    "code": "POI023",
    "name": "대림역",
    "lng": 126.894608,
    "lat": 37.493223,
    "anchor": "BUS_STN_STTS:22",
    "anchorCount": 22
  },
  {
    "code": "POI024",
    "name": "동대문역",
    "lng": 127.009282,
    "lat": 37.571726,
    "anchor": "BUS_STN_STTS:5",
    "anchorCount": 5
  },
  {
    "code": "POI025",
    "name": "뚝섬역",
    "lng": 127.045203,
    "lat": 37.547036,
    "anchor": "BUS_STN_STTS:4",
    "anchorCount": 4
  },
  {
    "code": "POI026",
    "name": "미아사거리역",
    "lng": 127.030426,
    "lat": 37.612774,
    "anchor": "BUS_STN_STTS:23",
    "anchorCount": 23
  },
  {
    "code": "POI027",
    "name": "발산역",
    "lng": 126.839251,
    "lat": 37.558996,
    "anchor": "BUS_STN_STTS:22",
    "anchorCount": 22
  },
  {
    "code": "POI029",
    "name": "사당역",
    "lng": 126.982003,
    "lat": 37.476873,
    "anchor": "BUS_STN_STTS:16",
    "anchorCount": 16
  },
  {
    "code": "POI030",
    "name": "삼각지역",
    "lng": 126.974161,
    "lat": 37.53518,
    "anchor": "BUS_STN_STTS:5",
    "anchorCount": 5
  },
  {
    "code": "POI031",
    "name": "서울대입구역",
    "lng": 126.952614,
    "lat": 37.481147,
    "anchor": "BUS_STN_STTS:12",
    "anchorCount": 12
  },
  {
    "code": "POI032",
    "name": "서울식물원·마곡나루역",
    "lng": 126.827773,
    "lat": 37.566686,
    "anchor": "BUS_STN_STTS:15",
    "anchorCount": 15
  },
  {
    "code": "POI033",
    "name": "서울역",
    "lng": 126.973493,
    "lat": 37.557094,
    "anchor": "BUS_STN_STTS:22",
    "anchorCount": 22
  },
  {
    "code": "POI034",
    "name": "선릉역",
    "lng": 127.050334,
    "lat": 37.505967,
    "anchor": "BUS_STN_STTS:12",
    "anchorCount": 12
  },
  {
    "code": "POI035",
    "name": "성신여대입구역",
    "lng": 127.016583,
    "lat": 37.593379,
    "anchor": "BUS_STN_STTS:8",
    "anchorCount": 8
  },
  {
    "code": "POI036",
    "name": "수유역",
    "lng": 127.024968,
    "lat": 37.640381,
    "anchor": "BUS_STN_STTS:27",
    "anchorCount": 27
  },
  {
    "code": "POI037",
    "name": "신논현역·논현역",
    "lng": 127.023498,
    "lat": 37.506367,
    "anchor": "BUS_STN_STTS:11",
    "anchorCount": 11
  },
  {
    "code": "POI038",
    "name": "신도림역",
    "lng": 126.890099,
    "lat": 37.509108,
    "anchor": "BUS_STN_STTS:1+SUB_STTS:1+SBIKE_STTS:1",
    "anchorCount": 3
  },
  {
    "code": "POI039",
    "name": "신림역",
    "lng": 126.929054,
    "lat": 37.483865,
    "anchor": "BUS_STN_STTS:14",
    "anchorCount": 14
  },
  {
    "code": "POI040",
    "name": "신촌·이대역",
    "lng": 126.937841,
    "lat": 37.556263,
    "anchor": "BUS_STN_STTS:31",
    "anchorCount": 31
  },
  {
    "code": "POI041",
    "name": "양재역",
    "lng": 127.035289,
    "lat": 37.484232,
    "anchor": "BUS_STN_STTS:18",
    "anchorCount": 18
  },
  {
    "code": "POI042",
    "name": "역삼역",
    "lng": 127.036766,
    "lat": 37.500429,
    "anchor": "BUS_STN_STTS:9",
    "anchorCount": 9
  },
  {
    "code": "POI043",
    "name": "연신내역",
    "lng": 126.92061,
    "lat": 37.61836,
    "anchor": "BUS_STN_STTS:9",
    "anchorCount": 9
  },
  {
    "code": "POI044",
    "name": "오목교역·목동운동장",
    "lng": 126.875315,
    "lat": 37.526419,
    "anchor": "BUS_STN_STTS:25",
    "anchorCount": 25
  },
  {
    "code": "POI045",
    "name": "왕십리역",
    "lng": 127.038798,
    "lat": 37.56262,
    "anchor": "BUS_STN_STTS:18",
    "anchorCount": 18
  },
  {
    "code": "POI046",
    "name": "용산역",
    "lng": 126.962223,
    "lat": 37.53259,
    "anchor": "BUS_STN_STTS:25",
    "anchorCount": 25
  },
  {
    "code": "POI047",
    "name": "이태원역",
    "lng": 126.993429,
    "lat": 37.534339,
    "anchor": "BUS_STN_STTS:9",
    "anchorCount": 9
  },
  {
    "code": "POI048",
    "name": "장지역",
    "lng": 127.125003,
    "lat": 37.479056,
    "anchor": "BUS_STN_STTS:18",
    "anchorCount": 18
  },
  {
    "code": "POI049",
    "name": "장한평역",
    "lng": 127.065436,
    "lat": 37.562035,
    "anchor": "BUS_STN_STTS:11",
    "anchorCount": 11
  },
  {
    "code": "POI050",
    "name": "천호역",
    "lng": 127.125539,
    "lat": 37.540362,
    "anchor": "BUS_STN_STTS:9",
    "anchorCount": 9
  },
  {
    "code": "POI051",
    "name": "총신대입구(이수)역",
    "lng": 126.981867,
    "lat": 37.484833,
    "anchor": "BUS_STN_STTS:15",
    "anchorCount": 15
  },
  {
    "code": "POI052",
    "name": "충정로역",
    "lng": 126.962918,
    "lat": 37.559649,
    "anchor": "BUS_STN_STTS:15",
    "anchorCount": 15
  },
  {
    "code": "POI053",
    "name": "합정역",
    "lng": 126.912795,
    "lat": 37.548658,
    "anchor": "BUS_STN_STTS:27",
    "anchorCount": 27
  },
  {
    "code": "POI054",
    "name": "혜화역",
    "lng": 127.001461,
    "lat": 37.583353,
    "anchor": "BUS_STN_STTS:11",
    "anchorCount": 11
  },
  {
    "code": "POI055",
    "name": "홍대입구역(2호선)",
    "lng": 126.923327,
    "lat": 37.556601,
    "anchor": "BUS_STN_STTS:12",
    "anchorCount": 12
  },
  {
    "code": "POI056",
    "name": "회기역",
    "lng": 127.056888,
    "lat": 37.590276,
    "anchor": "BUS_STN_STTS:21",
    "anchorCount": 21
  },
  {
    "code": "POI058",
    "name": "가락시장",
    "lng": 127.115605,
    "lat": 37.494073,
    "anchor": "BUS_STN_STTS:12",
    "anchorCount": 12
  },
  {
    "code": "POI059",
    "name": "가로수길",
    "lng": 127.022175,
    "lat": 37.522928,
    "anchor": "BUS_STN_STTS:9",
    "anchorCount": 9
  },
  {
    "code": "POI060",
    "name": "광장(전통)시장",
    "lng": 126.999679,
    "lat": 37.570752,
    "anchor": "BUS_STN_STTS:7",
    "anchorCount": 7
  },
  {
    "code": "POI061",
    "name": "김포공항",
    "lng": 126.802733,
    "lat": 37.562433,
    "anchor": "BUS_STN_STTS:21",
    "anchorCount": 21
  },
  {
    "code": "POI063",
    "name": "노량진",
    "lng": 126.94347,
    "lat": 37.513423,
    "anchor": "BUS_STN_STTS:17",
    "anchorCount": 17
  },
  {
    "code": "POI064",
    "name": "덕수궁길·정동길",
    "lng": 126.971626,
    "lat": 37.566121,
    "anchor": "BUS_STN_STTS:10",
    "anchorCount": 10
  },
  {
    "code": "POI066",
    "name": "북촌한옥마을",
    "lng": 126.985127,
    "lat": 37.579973,
    "anchor": "BUS_STN_STTS:49",
    "anchorCount": 49
  },
  {
    "code": "POI067",
    "name": "서촌",
    "lng": 126.97105,
    "lat": 37.579468,
    "anchor": "BUS_STN_STTS:25",
    "anchorCount": 25
  },
  {
    "code": "POI068",
    "name": "성수카페거리",
    "lng": 127.055179,
    "lat": 37.543511,
    "anchor": "BUS_STN_STTS:23",
    "anchorCount": 23
  },
  {
    "code": "POI070",
    "name": "쌍문역",
    "lng": 127.034714,
    "lat": 37.64638,
    "anchor": "BUS_STN_STTS:17",
    "anchorCount": 17
  },
  {
    "code": "POI071",
    "name": "압구정로데오거리",
    "lng": 127.039257,
    "lat": 37.524316,
    "anchor": "BUS_STN_STTS:11",
    "anchorCount": 11
  },
  {
    "code": "POI072",
    "name": "여의도",
    "lng": 126.927029,
    "lat": 37.524435,
    "anchor": "BUS_STN_STTS:58",
    "anchorCount": 58
  },
  {
    "code": "POI073",
    "name": "연남동",
    "lng": 126.921975,
    "lat": 37.562451,
    "anchor": "BUS_STN_STTS:19",
    "anchorCount": 19
  },
  {
    "code": "POI074",
    "name": "영등포 타임스퀘어",
    "lng": 126.906345,
    "lat": 37.518143,
    "anchor": "BUS_STN_STTS:16",
    "anchorCount": 16
  },
  {
    "code": "POI076",
    "name": "용리단길",
    "lng": 126.970315,
    "lat": 37.531497,
    "anchor": "BUS_STN_STTS:5",
    "anchorCount": 5
  },
  {
    "code": "POI077",
    "name": "이태원 앤틱가구거리",
    "lng": 126.995387,
    "lat": 37.531373,
    "anchor": "BUS_STN_STTS:13",
    "anchorCount": 13
  },
  {
    "code": "POI078",
    "name": "인사동",
    "lng": 126.985537,
    "lat": 37.573602,
    "anchor": "BUS_STN_STTS:19",
    "anchorCount": 19
  },
  {
    "code": "POI079",
    "name": "창동 신경제 중심지",
    "lng": 127.057241,
    "lat": 37.654309,
    "anchor": "BUS_STN_STTS:39",
    "anchorCount": 39
  },
  {
    "code": "POI080",
    "name": "청담동 명품거리",
    "lng": 127.044279,
    "lat": 37.52527,
    "anchor": "BUS_STN_STTS:6",
    "anchorCount": 6
  },
  {
    "code": "POI081",
    "name": "청량리 제기동 일대 전통시장",
    "lng": 127.040871,
    "lat": 37.580403,
    "anchor": "BUS_STN_STTS:21",
    "anchorCount": 21
  },
  {
    "code": "POI082",
    "name": "해방촌·경리단길",
    "lng": 126.987261,
    "lat": 37.540848,
    "anchor": "BUS_STN_STTS:26",
    "anchorCount": 26
  },
  {
    "code": "POI083",
    "name": "DDP(동대문디자인플라자)",
    "lng": 127.00913,
    "lat": 37.567484,
    "anchor": "BUS_STN_STTS:7",
    "anchorCount": 7
  },
  {
    "code": "POI084",
    "name": "DMC(디지털미디어시티)",
    "lng": 126.890759,
    "lat": 37.578997,
    "anchor": "BUS_STN_STTS:44",
    "anchorCount": 44
  },
  {
    "code": "POI085",
    "name": "강서한강공원",
    "lng": 126.819821,
    "lat": 37.585221,
    "anchor": "PRK_STTS:2",
    "anchorCount": 2
  },
  {
    "code": "POI086",
    "name": "고척돔",
    "lng": 126.867998,
    "lat": 37.499382,
    "anchor": "BUS_STN_STTS:2+SBIKE_STTS:1",
    "anchorCount": 3
  },
  {
    "code": "POI087",
    "name": "광나루한강공원",
    "lng": 127.118184,
    "lat": 37.543276,
    "anchor": "PRK_STTS:4",
    "anchorCount": 4
  },
  {
    "code": "POI088",
    "name": "광화문광장",
    "lng": 126.977015,
    "lat": 37.573147,
    "anchor": "BUS_STN_STTS:8",
    "anchorCount": 8
  },
  {
    "code": "POI089",
    "name": "국립중앙박물관·용산가족공원",
    "lng": 126.974027,
    "lat": 37.522363,
    "anchor": "BUS_STN_STTS:3",
    "anchorCount": 3
  },
  {
    "code": "POI090",
    "name": "난지한강공원",
    "lng": 126.877202,
    "lat": 37.56762,
    "anchor": "BUS_STN_STTS:4",
    "anchorCount": 4
  },
  {
    "code": "POI091",
    "name": "남산공원",
    "lng": 126.992424,
    "lat": 37.551508,
    "anchor": "BUS_STN_STTS:22",
    "anchorCount": 22
  },
  {
    "code": "POI092",
    "name": "노들섬",
    "lng": 126.958821,
    "lat": 37.517341,
    "anchor": "BUS_STN_STTS:2+SBIKE_STTS:2",
    "anchorCount": 4
  },
  {
    "code": "POI093",
    "name": "뚝섬한강공원",
    "lng": 127.067414,
    "lat": 37.530632,
    "anchor": "BUS_STN_STTS:1+SUB_STTS:1+PRK_STTS:8",
    "anchorCount": 10
  },
  {
    "code": "POI094",
    "name": "망원한강공원",
    "lng": 126.912989,
    "lat": 37.549011,
    "anchor": "BUS_STN_STTS:5",
    "anchorCount": 5
  },
  {
    "code": "POI095",
    "name": "반포한강공원",
    "lng": 126.984837,
    "lat": 37.506719,
    "anchor": "BUS_STN_STTS:2+PRK_STTS:9",
    "anchorCount": 11
  },
  {
    "code": "POI096",
    "name": "북서울꿈의숲",
    "lng": 127.043779,
    "lat": 37.623322,
    "anchor": "BUS_STN_STTS:14",
    "anchorCount": 14
  },
  {
    "code": "POI098",
    "name": "서리풀공원·몽마르뜨공원",
    "lng": 127.003297,
    "lat": 37.505839,
    "anchor": "BUS_STN_STTS:7",
    "anchorCount": 7
  },
  {
    "code": "POI101",
    "name": "서울숲공원",
    "lng": 127.042574,
    "lat": 37.543063,
    "anchor": "BUS_STN_STTS:9",
    "anchorCount": 9
  },
  {
    "code": "POI102",
    "name": "아차산",
    "lng": 127.094797,
    "lat": 37.560159,
    "anchor": "BUS_STN_STTS:3",
    "anchorCount": 3
  },
  {
    "code": "POI103",
    "name": "양화한강공원",
    "lng": 126.901322,
    "lat": 37.539332,
    "anchor": "BUS_STN_STTS:2+PRK_STTS:6",
    "anchorCount": 8
  },
  {
    "code": "POI104",
    "name": "어린이대공원",
    "lng": 127.077031,
    "lat": 37.546805,
    "anchor": "BUS_STN_STTS:9",
    "anchorCount": 9
  },
  {
    "code": "POI105",
    "name": "여의도한강공원",
    "lng": 126.935965,
    "lat": 37.52446,
    "anchor": "BUS_STN_STTS:3",
    "anchorCount": 3
  },
  {
    "code": "POI106",
    "name": "월드컵공원",
    "lng": 126.889762,
    "lat": 37.572625,
    "anchor": "BUS_STN_STTS:27",
    "anchorCount": 27
  },
  {
    "code": "POI107",
    "name": "응봉산",
    "lng": 127.030835,
    "lat": 37.549832,
    "anchor": "BUS_STN_STTS:24",
    "anchorCount": 24
  },
  {
    "code": "POI108",
    "name": "이촌한강공원",
    "lng": 126.96597,
    "lat": 37.519344,
    "anchor": "BUS_STN_STTS:2+PRK_STTS:2",
    "anchorCount": 4
  },
  {
    "code": "POI109",
    "name": "잠실종합운동장",
    "lng": 127.072195,
    "lat": 37.511118,
    "anchor": "BUS_STN_STTS:2+SUB_STTS:1",
    "anchorCount": 3
  },
  {
    "code": "POI110",
    "name": "잠실한강공원",
    "lng": 127.095134,
    "lat": 37.520107,
    "anchor": "BUS_STN_STTS:2+SUB_STTS:1",
    "anchorCount": 3
  },
  {
    "code": "POI111",
    "name": "잠원한강공원",
    "lng": 127.017204,
    "lat": 37.526432,
    "anchor": "BUS_STN_STTS:2+SBIKE_STTS:1",
    "anchorCount": 3
  },
  {
    "code": "POI112",
    "name": "청계산",
    "lng": 127.064878,
    "lat": 37.435975,
    "anchor": "BUS_STN_STTS:4",
    "anchorCount": 4
  },
  {
    "code": "POI114",
    "name": "북창동 먹자골목",
    "lng": 126.978568,
    "lat": 37.561325,
    "anchor": "BUS_STN_STTS:10",
    "anchorCount": 10
  },
  {
    "code": "POI115",
    "name": "남대문시장",
    "lng": 126.978656,
    "lat": 37.560953,
    "anchor": "BUS_STN_STTS:6",
    "anchorCount": 6
  },
  {
    "code": "POI116",
    "name": "익선동",
    "lng": 126.988801,
    "lat": 37.571088,
    "anchor": "BUS_STN_STTS:9",
    "anchorCount": 9
  },
  {
    "code": "POI117",
    "name": "신정네거리역",
    "lng": 126.855173,
    "lat": 37.521363,
    "anchor": "BUS_STN_STTS:9",
    "anchorCount": 9
  },
  {
    "code": "POI118",
    "name": "잠실새내역",
    "lng": 127.083832,
    "lat": 37.511529,
    "anchor": "BUS_STN_STTS:10",
    "anchorCount": 10
  },
  {
    "code": "POI119",
    "name": "잠실역",
    "lng": 127.100584,
    "lat": 37.512539,
    "anchor": "BUS_STN_STTS:18",
    "anchorCount": 18
  },
  {
    "code": "POI120",
    "name": "잠실롯데타워·석촌호수",
    "lng": 127.104338,
    "lat": 37.514692,
    "anchor": "SUB_STTS:3",
    "anchorCount": 3
  },
  {
    "code": "POI121",
    "name": "송리단길·호수단길",
    "lng": 127.105555,
    "lat": 37.507927,
    "anchor": "BUS_STN_STTS:12",
    "anchorCount": 12
  },
  {
    "code": "POI122",
    "name": "신촌 스타광장",
    "lng": 126.936884,
    "lat": 37.55583,
    "anchor": "BUS_STN_STTS:4",
    "anchorCount": 4
  },
  {
    "code": "POI123",
    "name": "보라매공원",
    "lng": 126.91841,
    "lat": 37.494694,
    "anchor": "BUS_STN_STTS:4",
    "anchorCount": 4
  },
  {
    "code": "POI124",
    "name": "서대문독립공원",
    "lng": 126.957082,
    "lat": 37.572923,
    "anchor": "BUS_STN_STTS:14",
    "anchorCount": 14
  },
  {
    "code": "POI125",
    "name": "안양천",
    "lng": 126.877964,
    "lat": 37.517338,
    "anchor": "BUS_STN_STTS:1+SBIKE_STTS:1+PRK_STTS:1",
    "anchorCount": 3
  },
  {
    "code": "POI126",
    "name": "여의서로",
    "lng": 126.913208,
    "lat": 37.530678,
    "anchor": "SBIKE_STTS:4",
    "anchorCount": 4
  },
  {
    "code": "POI127",
    "name": "올림픽공원",
    "lng": 127.120705,
    "lat": 37.516305,
    "anchor": "BUS_STN_STTS:16",
    "anchorCount": 16
  },
  {
    "code": "POI129",
    "name": "송현녹지광장",
    "lng": 126.985296,
    "lat": 37.57725,
    "anchor": "BUS_STN_STTS:22",
    "anchorCount": 22
  },
  {
    "code": "POI130",
    "name": "시의회 앞",
    "lng": 126.976907,
    "lat": 37.568734,
    "anchor": "BUS_STN_STTS:19",
    "anchorCount": 19
  },
  {
    "code": "POI131",
    "name": "숭례문",
    "lng": 126.975908,
    "lat": 37.561067,
    "anchor": "BUS_STN_STTS:13",
    "anchorCount": 13
  }
];

export const SEOUL_CITYDATA_AREA_COORD: Map<string, { lng: number; lat: number; name: string }> =
  new Map(SEOUL_CITYDATA_AREAS.map((a) => [a.code, { lng: a.lng, lat: a.lat, name: a.name }]));
