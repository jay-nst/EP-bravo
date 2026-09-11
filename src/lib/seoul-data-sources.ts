// 서울 기후 대시보드에 표시되는 모든 데이터의 출처.
//
// 사이드바 '데이터 출처' 섹션과 지도 하단 크레딧이 이 파일만 읽는다.
// 레이어를 추가하면 여기에도 항목을 넣는다 — 출처 없이 화면에 뜨는 데이터가 없어야 한다.
//
// 지점 수·셀 수는 실제 데이터 배열 길이에서 뽑는다. 숫자를 문장에 박아두면
// 데이터를 재생성했을 때 화면과 어긋난다.
//
// kind
// - live      공공 API 실시간 수신 (실측)
// - stat      공공기관 산출 통계 (실측이지만 기준일 고정 — 실시간 아님)
// - demo      공개 통계 기반 산출 (추정 — 실측 아님)
// - analysis  다른 레이어를 가공한 분석 결과
// - imagery   위성·항공 래스터 영상
// - basemap   배경 지도 타일
// - boundary  행정 경계 등 참조 지오메트리

import { SEOUL_DISTRICTS, SEOUL_HEAT_GRID, SDOT_STATIONS } from './seoul-climate-data';
import { SEOUL_AIR_STATIONS } from './seoul-air-stations';
import { SEOUL_CITYDATA_AREAS } from './seoul-citydata-areas';

export type SeoulSourceKind =
  | 'live'
  | 'stat'
  | 'demo'
  | 'analysis'
  | 'imagery'
  | 'basemap'
  | 'boundary';

export interface SeoulDataSource {
  /** 레이어 id, 또는 토글 없이 항상 표시되는 요소의 식별자 */
  id: string;
  /** 화면에 보이는 레이어·요소 이름 */
  layer: string;
  kind: SeoulSourceKind;
  /** 데이터를 만든 기관 (전체 표기) */
  provider: string;
  /** 지도 하단 크레딧에 쓰는 짧은 기관명 */
  providerShort: string;
  /** 데이터셋 · API 이름 */
  dataset: string;
  /** 산출 방식과 주의사항 */
  note: string;
  /** 공개 문서·포털 링크 */
  url?: string;
}

export const SOURCE_KIND_BADGE: Record<SeoulSourceKind, { label: string; color: string }> = {
  live: { label: 'LIVE', color: '#1bbfa8' },
  stat: { label: '통계', color: '#4A9E6B' },
  demo: { label: 'DEMO', color: '#C8923A' },
  analysis: { label: '분석', color: '#C45C4A' },
  imagery: { label: '영상', color: '#4A9EC4' },
  basemap: { label: '배경', color: '#8A8680' },
  boundary: { label: '경계', color: '#8A8680' },
};

export const SEOUL_DATA_SOURCES: SeoulDataSource[] = [
  {
    id: 'air-quality',
    layer: '초미세먼지 PM2.5',
    kind: 'live',
    provider: '한국환경공단 에어코리아 (공공데이터포털)',
    providerShort: '에어코리아',
    dataset: '대기오염정보 ArpltnInforInqireSvc · getCtprvnRltmMesureDnsty',
    note: `서울 도시대기측정망의 실시간 PM2.5·PM10·오존·이산화질소. 측정소 좌표 ${SEOUL_AIR_STATIONS.length}개소는 측정소정보(MsrstnInfoInqireSvc)에서 받아 번들에 내장했다 — 목록 API가 간헐적으로 빈 응답을 주면 측정값이 멀쩡해도 레이어가 통째로 비기 때문.`,
    url: 'https://www.airkorea.or.kr',
  },
  {
    id: 'cai',
    layer: '자치구 대기환경지수',
    kind: 'live',
    provider: '서울특별시 · 서울 열린데이터광장',
    providerShort: '서울 열린데이터광장',
    dataset: '실시간 도시데이터 대기환경 RealtimeCityAir',
    note: `${SEOUL_DISTRICTS.length}개 자치구 통합대기환경지수(CAI)와 주오염물질, 1시간 주기. 원본에 좌표가 없어 자치구 도시대기측정소 위치에 표시한다.`,
    url: 'https://data.seoul.go.kr',
  },
  {
    id: 'sdot',
    layer: 'S-DoT 도시센서 기온',
    kind: 'live',
    provider: '서울특별시 · 서울 열린데이터광장',
    providerShort: '서울 열린데이터광장',
    dataset: 'S-DoT 도시데이터 센서 IotVdata017',
    note: '센서 지점의 기온·습도를 자치구 단위로 평균해 자치구 중심에 표시한다. 원본에 좌표가 없고 자치구·행정동만 있어 지점 위치는 만들지 않았다. 고장 센서값(-40°C, 습도 100% 등)은 제외한다.',
    url: 'https://data.seoul.go.kr',
  },
  {
    id: 'sdot-fallback',
    layer: 'S-DoT 폴백 지점',
    kind: 'demo',
    provider: 'EarthPaper 자체 산출',
    providerShort: 'EarthPaper 산출',
    dataset: `SDOT_STATIONS — 관측망 모사 데모 지점 ${SDOT_STATIONS.length}곳`,
    note: '열린데이터광장 응답이 비었을 때만 쓰는 폴백이다. 위치명은 실제 지명이지만 관측값은 아래 지표온도 모델에서 파생한 추정치다. 이 데이터로 그려진 경우 배지가 DEMO로 바뀐다.',
  },
  {
    id: 'heat',
    layer: '폭염·열섬 지표온도',
    kind: 'demo',
    provider: 'EarthPaper 자체 산출',
    providerShort: 'EarthPaper 산출',
    dataset: `여름 오후 지표온도(LST) 공간분포 모델 · 격자 ${SEOUL_HEAT_GRID.length}셀`,
    note: '실측 위성 LST가 아니다. 도심 열원(중구·종로, 영등포·구로, 강남)과 냉원(북한산·관악산·남산·한강)을 중첩해 만든 추정 격자이며, 자치구 경계로 클리핑했다.',
  },
  {
    id: 'satellite',
    layer: '위성영상',
    kind: 'imagery',
    provider: 'Mapbox',
    providerShort: 'Mapbox',
    dataset: 'Mapbox Satellite (mapbox://mapbox.satellite)',
    note: '상용 고해상 위성·항공영상과 Landsat·Sentinel-2 등을 합성한 래스터 타일. 촬영 시점은 지역마다 다르다.',
    url: 'https://docs.mapbox.com/data/tilesets/reference/mapbox-satellite/',
  },
  {
    id: 'vulnerable',
    layer: '폭염 취약지 추출',
    kind: 'analysis',
    provider: 'EarthPaper 분석',
    providerShort: 'EarthPaper 산출',
    dataset: '지표온도 격자에서 서울 평균 대비 +2.5°C 이상 셀 추출',
    note: '입력이 위 지표온도 모델(추정치)이므로 결과도 데모다. 실제 폭염 취약지 판정 근거로 쓸 수 없다.',
  },
  {
    id: 'congestion',
    layer: '장소 실시간 혼잡도',
    kind: 'live',
    provider: '서울특별시 · 서울 열린데이터광장',
    providerShort: '서울 열린데이터광장',
    dataset: '실시간 도시데이터 인구현황 citydata_ppltn',
    note: `주요 장소 ${SEOUL_CITYDATA_AREAS.length}곳의 혼잡도 4단계와 실시간 생활인구 범위, 5분 주기. 자치구 집계가 아니라 장소 단위다. 원본에 좌표가 없어, 같은 API 의 전체 응답에 들어있는 버스정류소·지하철역·따릉이대여소 좌표의 중앙값을 장소 중심으로 유도해 표시한다 (측정 지점이 아니라 장소 대표 위치). 인구는 원본이 범위로만 제공하며 팝업에도 범위로 표시한다.`,
    url: 'https://data.seoul.go.kr/SeoulRtd/',
  },
  {
    id: 'heat-crowd',
    layer: '폭염 × 인구밀집 교차',
    kind: 'analysis',
    provider: 'EarthPaper 분석',
    providerShort: 'EarthPaper 산출',
    dataset: '실시간 혼잡도 ∩ 지표온도 격자 +2.5°C 이상',
    note: '혼잡도는 실시간 실측이지만 지표온도가 추정 격자이므로 결과는 분석·데모다. 실제 폭염 대응 우선순위 판정 근거로 쓸 수 없다. 판정 기준은 혼잡도 "약간 붐빔" 이상이면서 장소 중심이 +2.5°C 이상 격자에 속하는 경우다.',
  },
  {
    id: 'ghg',
    layer: '자치구 온실가스 배출',
    kind: 'demo',
    provider: 'EarthPaper 산출 · 공개 통계 기반',
    providerShort: 'EarthPaper 산출',
    dataset: '자치구별 온실가스·최종에너지 추정 (SEOUL_DISTRICTS)',
    note: '인구는 2024년 주민등록인구 근사치, 면적은 지적통계 기준 자치구 면적으로 실제 통계값이다. 배출량·1인당 배출량·에너지 사용량은 토지이용 유형(도심/상업/공업/주거)별 1인당 계수를 곱한 추정치다.',
  },
  {
    id: 'solar',
    layer: '태양광 보급 용량',
    kind: 'demo',
    provider: 'EarthPaper 산출 · 공개 통계 기반',
    providerShort: 'EarthPaper 산출',
    dataset: '자치구별 태양광 보급 용량 추정 (SEOUL_DISTRICTS)',
    note: '자치구 보급 지수와 면적을 기반으로 만든 추정치다. 실제 보급 실적이 아니다. 팝업의 녹지율도 산지·공원 보유 현황 기반 근사값이다.',
  },
  {
    id: 'boundary',
    layer: '서울 자치구 경계 · 외곽 마스크',
    kind: 'boundary',
    provider: 'southkorea/seoul-maps (통계청 2013 자료 단순화본)',
    providerShort: '통계청 행정경계',
    dataset: `서울 자치구 ${SEOUL_DISTRICTS.length}개 경계 폴리곤`,
    note: '토글 없이 항상 표시된다. 서울 외곽을 어둡게 덮는 마스크와 열섬 격자 클리핑도 이 경계에서 만들었다. 단순화본이라 실제 지적 경계와 미세한 차이가 있다.',
    url: 'https://github.com/southkorea/seoul-maps',
  },
  {
    id: 'basemap',
    layer: '배경 지도',
    kind: 'basemap',
    provider: 'Mapbox · OpenStreetMap contributors',
    // Mapbox 는 위성영상 항목에서 이미 세므로 크레딧 한 줄에는 OSM 만 더한다.
    providerShort: 'OpenStreetMap',
    dataset: 'Mapbox Streets 기반 스타일 (위성 / 다크 / 야간)',
    note: '© Mapbox © OpenStreetMap contributors. 지명 라벨은 한국어로 재설정했다.',
    url: 'https://www.mapbox.com/about/maps/',
  },
];

/** 지도 하단 한 줄 크레딧용 기관 목록. 등장 순서를 지키면서 중복만 뺀다. */
export const SEOUL_SOURCE_PROVIDERS: string[] = [
  ...new Set(SEOUL_DATA_SOURCES.map((s) => s.providerShort)),
];
