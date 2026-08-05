'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type mapboxgl from 'mapbox-gl';
import type { ExpressionSpecification } from 'mapbox-gl';
import SeoulLayerPanel from '@/components/seoul/SeoulLayerPanel';
import type { SeoulLayer, SeoulLayerId, DataSourceKind } from '@/components/seoul/SeoulLayerPanel';
import { SEOUL_DISTRICTS, SEOUL_HEAT_GRID } from '@/lib/seoul-climate-data';
import { SEOUL_DISTRICT_BOUNDARIES, SEOUL_MASK } from '@/lib/seoul-boundary';
import { SeoulAnimationController } from '@/lib/seoul-animations';
import type { SeoulAnimationId } from '@/lib/seoul-animations';
import { MAP_STYLES } from '@/components/map/EarthMap';
import type { MapStyleId } from '@/components/map/EarthMap';
import { fmtNum } from '@/lib/format';
import { trackEvent } from '@/lib/analytics';

const EarthMap = dynamic(() => import('@/components/map/EarthMap'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div className="text-center">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
          style={{ borderColor: 'var(--border)', borderTopColor: 'transparent' }}
        />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          지도 로딩 중...
        </p>
      </div>
    </div>
  ),
});

const SEOUL_CENTER: [number, number] = [126.978, 37.5665];
const SEOUL_ZOOM = 10.6;

const SEOUL_BBOX = { west: 126.73, south: 37.40, east: 127.22, north: 37.72 };

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

const AIR_GRADE_COLORS: Record<string, string> = {
  good: '#4CAF50',
  moderate: '#FFC107',
  unhealthy: '#FF9800',
  very_unhealthy: '#F44336',
  hazardous: '#9C27B0',
};

const INITIAL_LAYERS: SeoulLayer[] = [
  {
    id: 'air-quality',
    label: '초미세먼지 PM2.5',
    sublabel: '에어코리아 도시대기측정망',
    color: '#FFC107',
    enabled: true,
    featureCount: 0,
    source: 'loading',
    group: '대기·기상',
  },
  {
    id: 'cai',
    label: '자치구 대기환경지수',
    sublabel: '서울시 통합대기환경지수 CAI',
    color: '#4CAF50',
    enabled: false,
    featureCount: 0,
    source: 'loading',
    group: '대기·기상',
  },
  {
    id: 'sdot',
    label: 'S-DoT 도시센서 기온',
    sublabel: '서울시 IoT 관측망 · 자치구 평균',
    color: '#1bbfa8',
    enabled: false,
    featureCount: 0,
    source: 'loading',
    group: '대기·기상',
  },
  {
    id: 'heat',
    label: '폭염·열섬 지표온도',
    sublabel: '위성 열적외선 LST',
    color: '#FF6D00',
    enabled: false,
    featureCount: 0,
    source: 'demo',
    group: '기후위기',
  },
  {
    id: 'satellite',
    label: '위성영상',
    sublabel: 'Mapbox Satellite 고해상 영상',
    color: '#4A9EC4',
    enabled: false,
    featureCount: 0,
    source: 'imagery',
    group: '위성·분석',
  },
  {
    id: 'vulnerable',
    label: '폭염 취약지 추출',
    sublabel: '열적외선 LST 기반 자동 판정',
    color: '#C45C4A',
    enabled: false,
    featureCount: 0,
    source: 'analysis',
    group: '위성·분석',
  },
  {
    id: 'ghg',
    label: '자치구 온실가스 배출',
    sublabel: '천tCO₂eq / 년',
    color: '#C45C4A',
    enabled: false,
    featureCount: 0,
    source: 'demo',
    group: '탄소·에너지',
  },
  {
    id: 'solar',
    label: '태양광 보급 용량',
    sublabel: 'kW / 자치구',
    color: '#C8923A',
    enabled: false,
    featureCount: 0,
    source: 'demo',
    group: '탄소·에너지',
  },
];

const LAYER_IDS: Record<SeoulLayerId, { source: string; layers: string[] }> = {
  'air-quality': {
    source: 'seoul-air-quality',
    layers: ['seoul-air-heatmap', 'seoul-air-ping', 'seoul-air-circle', 'seoul-air-label'],
  },
  cai: {
    source: 'seoul-cai',
    layers: ['seoul-cai-ping', 'seoul-cai-circle', 'seoul-cai-index', 'seoul-cai-name'],
  },
  sdot: {
    source: 'seoul-sdot',
    layers: ['seoul-sdot-circle', 'seoul-sdot-label'],
  },
  heat: {
    source: 'seoul-heat',
    layers: ['seoul-heat-fill', 'seoul-heat-outline'],
  },
  satellite: {
    // 래스터 레이어. 데이터를 받아오지 않고 표시만 토글한다.
    source: 'seoul-satellite',
    layers: ['seoul-satellite-raster'],
  },
  vulnerable: {
    source: 'seoul-vulnerable',
    layers: ['seoul-vulnerable-fill', 'seoul-vulnerable-line'],
  },
  ghg: {
    source: 'seoul-ghg',
    layers: ['seoul-ghg-circle', 'seoul-ghg-label'],
  },
  solar: {
    source: 'seoul-solar',
    layers: ['seoul-solar-circle', 'seoul-solar-label'],
  },
};

const API_LAYERS: SeoulLayerId[] = ['air-quality', 'cai', 'sdot'];

const ENDPOINTS: Partial<Record<SeoulLayerId, string>> = {
  // 서울 전용 라우트. 좌표를 번들에서 읽어 측정소 목록 API 실패에 영향받지 않는다.
  'air-quality': '/api/layers/seoul-air',
  cai: '/api/layers/seoul-cai',
  sdot: '/api/layers/sdot',
};

// 실데이터 자동 갱신 주기 (초). 상황판이라 화면을 켜둔 채로 값이 갱신돼야 한다.
const REFRESH_SEC = 60;

// 레이어를 켤 때 같이 돌릴 애니메이션
const LAYER_ANIMATION: Partial<Record<SeoulLayerId, SeoulAnimationId>> = {
  'air-quality': 'air-ping',
};

// 통합대기환경지수 등급별 색 (한국 대기환경기준 관례: 좋음 파랑 → 매우나쁨 빨강)
const CAI_COLORS: Record<string, string> = {
  좋음: '#2196F3',
  보통: '#4CAF50',
  나쁨: '#FF9800',
  매우나쁨: '#F44336',
};

function inSeoul(lng: number, lat: number): boolean {
  return (
    lng >= SEOUL_BBOX.west &&
    lng <= SEOUL_BBOX.east &&
    lat >= SEOUL_BBOX.south &&
    lat <= SEOUL_BBOX.north
  );
}

function filterToSeoul(fc: GeoJSON.FeatureCollection): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: fc.features.filter((f) => {
      if (f.geometry.type !== 'Point') return false;
      const [lng, lat] = f.geometry.coordinates;
      return inSeoul(lng, lat);
    }),
  };
}

// 격자 셀 크기. scripts/gen-seoul-climate-data.js 의 STEP_LNG/STEP_LAT 과
// 반드시 같아야 셀이 빈틈없이 맞물린다.
const CELL_LNG = 0.0075;
const CELL_LAT = 0.006;

// 지표온도는 연속적인 면 데이터다. Mapbox heatmap은 값이 아니라 점 밀도에
// 색을 매핑하므로 균일 격자에서는 온도차가 사라진다. 셀을 폴리곤으로 만들어
// 값으로 직접 칠한다.
function buildHeatFC(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: SEOUL_HEAT_GRID.map((c) => ({
      type: 'Feature',
      geometry: cellPolygon(c.lng, c.lat),
      properties: { lst: c.lst, anomaly: c.anomaly },
    })),
  };
}

// 폭염 취약지 판정 기준: 서울 평균 지표온도 대비 +2.5°C 이상.
const VULNERABLE_ANOMALY = 2.5;
const VULNERABLE_CELLS = SEOUL_HEAT_GRID.filter((c) => c.anomaly >= VULNERABLE_ANOMALY).length;

// 위도 37.5 기준 셀 한 변의 실제 길이로 면적을 낸다.
const CELL_AREA_KM2 = CELL_LNG * 88.3 * (CELL_LAT * 111);
const VULNERABLE_AREA_KM2 = VULNERABLE_CELLS * CELL_AREA_KM2;

function cellPolygon(lng: number, lat: number): GeoJSON.Polygon {
  const hw = CELL_LNG / 2;
  const hh = CELL_LAT / 2;
  return {
    type: 'Polygon',
    coordinates: [[
      [lng - hw, lat - hh],
      [lng + hw, lat - hh],
      [lng + hw, lat + hh],
      [lng - hw, lat + hh],
      [lng - hw, lat - hh],
    ]],
  };
}

// 열섬 격자에서 임계 초과 셀만 뽑아낸 "분석 결과" 레이어.
function buildVulnerableFC(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: SEOUL_HEAT_GRID.filter((c) => c.anomaly >= VULNERABLE_ANOMALY).map((c) => ({
      type: 'Feature',
      geometry: cellPolygon(c.lng, c.lat),
      properties: { lst: c.lst, anomaly: c.anomaly },
    })),
  };
}

function buildDistrictFC(metric: 'ghg' | 'solar'): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: SEOUL_DISTRICTS.map((d) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
      properties: {
        name: d.name,
        value: metric === 'ghg' ? d.ghgTotal : d.solarCapacity,
        ghgTotal: d.ghgTotal,
        ghgPerCapita: d.ghgPerCapita,
        energyUse: d.energyUse,
        solarCapacity: d.solarCapacity,
        greenRatio: d.greenRatio,
        population: d.population,
      },
    })),
  };
}

export default function SeoulPage() {
  const [layers, setLayers] = useState<SeoulLayer[]>(INITIAL_LAYERS);
  const [mapStyleId, setMapStyleId] = useState<MapStyleId>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveAvgPm25, setLiveAvgPm25] = useState<number | null>(null);
  const [liveAvgTemp, setLiveAvgTemp] = useState<number | null>(null);

  const [lastUpdated, setLastUpdated] = useState('');
  const [countdown, setCountdown] = useState(REFRESH_SEC);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const animRef = useRef<SeoulAnimationController | null>(null);
  const enabledRef = useRef<Record<string, boolean>>({ 'air-quality': true });
  const cacheRef = useRef<Record<string, GeoJSON.FeatureCollection>>({});
  // 배경지도를 바꾸면 setStyle이 소스/레이어를 날리고 onMapReady가 다시 불린다.
  // 소스·레이어는 매번 다시 만들어야 하지만 클릭 핸들러는 맵 인스턴스에 남으므로 1회만 바인딩한다.
  const handlersBoundRef = useRef(false);

  const seoulGhgTotal = SEOUL_DISTRICTS.reduce((sum, d) => sum + d.ghgTotal, 0);
  const seoulSolarTotal = SEOUL_DISTRICTS.reduce((sum, d) => sum + d.solarCapacity, 0);

  const setLayerSource = useCallback((id: SeoulLayerId, source: DataSourceKind, count: number) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, source, featureCount: count } : l)),
    );
  }, []);

  const addLayers = useCallback((map: mapboxgl.Map) => {
    // ---- sources -------------------------------------------------------
    // satellite 은 래스터라 아래에서 따로 만든다. 여기서 geojson 으로 만들면
    // 같은 ID로 두 번 addSource 하게 되어 전체 addLayers 가 죽는다.
    (Object.keys(LAYER_IDS) as SeoulLayerId[]).forEach((id) => {
      if (id === 'satellite') return;
      if (map.getSource(LAYER_IDS[id].source)) return;
      map.addSource(LAYER_IDS[id].source, { type: 'geojson', data: EMPTY_FC });
    });

    // ---- 서울 경계 강조 (토글 없이 항상 표시, 데이터 레이어보다 아래) ------
    // 서울 밖을 어둡게 덮어 시선을 서울로 가둔다.
    if (!map.getSource('seoul-mask')) {
      map.addSource('seoul-mask', { type: 'geojson', data: SEOUL_MASK });
    }
    if (!map.getSource('seoul-boundary')) {
      map.addSource('seoul-boundary', { type: 'geojson', data: SEOUL_DISTRICT_BOUNDARIES });
    }

    // 위성영상은 마스크보다 아래. 켜면 서울 안쪽만 선명하게 남는다.
    if (!map.getSource('seoul-satellite')) {
      map.addSource('seoul-satellite', {
        type: 'raster',
        url: 'mapbox://mapbox.satellite',
        tileSize: 256,
      });
    }

    map.addLayer({
      id: 'seoul-satellite-raster',
      type: 'raster',
      source: 'seoul-satellite',
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 0.95 },
    });

    // 주변은 살짝만 눌러 맥락을 남기고, 서울 안쪽을 들어올려 대비를 만든다.
    map.addLayer({
      id: 'seoul-mask-fill',
      type: 'fill',
      source: 'seoul-mask',
      paint: {
        'fill-color': '#08080A',
        'fill-opacity': 0.45,
      },
    });

    map.addLayer({
      id: 'seoul-inner-lift',
      type: 'fill',
      source: 'seoul-boundary',
      paint: {
        'fill-color': '#9FD8CE',
        'fill-opacity': 0.07,
      },
    });

    // ---- 폭염·열섬 (아래에 깔림) ----------------------------------------
    map.addLayer({
      id: 'seoul-heat-fill',
      type: 'fill',
      source: LAYER_IDS.heat.source,
      layout: { visibility: 'none' },
      paint: {
        // 인접 셀 사이에 안티에일리어싱 실선이 생기지 않게 한다.
        'fill-antialias': false,
        'fill-color': [
          'interpolate', ['linear'], ['get', 'lst'],
          27, '#1A237E',
          29, '#0277BD',
          31, '#00ACC1',
          32.5, '#9CCC65',
          34, '#FDD835',
          35.5, '#FB8C00',
          37, '#D84315',
        ],
        'fill-opacity': 0.55,
      },
    });

    map.addLayer({
      id: 'seoul-heat-outline',
      type: 'line',
      source: LAYER_IDS.heat.source,
      layout: { visibility: 'none' },
      minzoom: 12.5,
      paint: {
        'line-color': 'rgba(255,255,255,0.10)',
        'line-width': 0.5,
      },
    });

    // ---- 폭염 취약지 (분석 결과) -----------------------------------------
    map.addLayer({
      id: 'seoul-vulnerable-fill',
      type: 'fill',
      source: LAYER_IDS.vulnerable.source,
      layout: { visibility: 'none' },
      paint: {
        'fill-antialias': false,
        'fill-color': '#C45C4A',
        'fill-opacity': 0.42,
      },
    });

    map.addLayer({
      id: 'seoul-vulnerable-line',
      type: 'line',
      source: LAYER_IDS.vulnerable.source,
      layout: { visibility: 'none' },
      paint: {
        'line-color': '#FF7043',
        'line-width': 1.6,
        'line-opacity': 0.6,
      },
    });

    // ---- 초미세먼지 ------------------------------------------------------
    // 레이더 핑 (수신 중이라는 신호). 실제 값 레이어보다 아래에 깐다.
    map.addLayer({
      id: 'seoul-air-ping',
      type: 'circle',
      source: LAYER_IDS['air-quality'].source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': 6,
        'circle-color': 'rgba(0,0,0,0)',
        'circle-opacity': 0,
        'circle-stroke-color': '#FFC107',
        'circle-stroke-width': 1.2,
        'circle-stroke-opacity': 0.5,
      },
    });

    map.addLayer({
      id: 'seoul-air-heatmap',
      type: 'heatmap',
      source: LAYER_IDS['air-quality'].source,
      layout: { visibility: 'none' },
      maxzoom: 14,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'pm25'], 0, 0, 25, 0.4, 50, 0.8, 80, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 9, 0.7, 13, 1.5],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 9, 40, 13, 90],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, 'rgba(76,175,80,0.4)',
          0.4, 'rgba(255,193,7,0.55)',
          0.6, 'rgba(255,152,0,0.65)',
          0.8, 'rgba(244,67,54,0.7)',
          1, 'rgba(156,39,176,0.75)',
        ],
        'heatmap-opacity': 0.6,
      },
    });

    map.addLayer({
      id: 'seoul-air-circle',
      type: 'circle',
      source: LAYER_IDS['air-quality'].source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 6, 14, 14],
        'circle-color': [
          'match', ['get', 'grade'],
          'good', AIR_GRADE_COLORS.good,
          'moderate', AIR_GRADE_COLORS.moderate,
          'unhealthy', AIR_GRADE_COLORS.unhealthy,
          'very_unhealthy', AIR_GRADE_COLORS.very_unhealthy,
          'hazardous', AIR_GRADE_COLORS.hazardous,
          AIR_GRADE_COLORS.moderate,
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': 'rgba(14,14,16,0.7)',
        'circle-opacity': 0.9,
      },
    });

    map.addLayer({
      id: 'seoul-air-label',
      type: 'symbol',
      source: LAYER_IDS['air-quality'].source,
      layout: {
        visibility: 'none',
        'text-field': ['concat', ['to-string', ['get', 'pm25']], ' ㎍'],
        'text-size': 10,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
      },
      minzoom: 10,
      paint: {
        'text-color': '#E8E4DF',
        'text-halo-color': 'rgba(14,14,16,0.85)',
        'text-halo-width': 1,
      },
    });

    // ---- 자치구 통합대기환경지수 -------------------------------------------
    map.addLayer({
      id: 'seoul-cai-ping',
      type: 'circle',
      source: LAYER_IDS.cai.source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': 18,
        'circle-color': 'rgba(0,0,0,0)',
        'circle-opacity': 0,
        'circle-stroke-color': '#4CAF50',
        'circle-stroke-width': 1.4,
        'circle-stroke-opacity': 0.5,
      },
    });

    map.addLayer({
      id: 'seoul-cai-circle',
      type: 'circle',
      source: LAYER_IDS.cai.source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['get', 'cai'], 40, 16, 100, 30, 150, 40],
        'circle-color': [
          'match', ['get', 'grade'],
          '좋음', CAI_COLORS['좋음'],
          '보통', CAI_COLORS['보통'],
          '나쁨', CAI_COLORS['나쁨'],
          '매우나쁨', CAI_COLORS['매우나쁨'],
          CAI_COLORS['보통'],
        ],
        'circle-opacity': 0.3,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': [
          'match', ['get', 'grade'],
          '좋음', CAI_COLORS['좋음'],
          '보통', CAI_COLORS['보통'],
          '나쁨', CAI_COLORS['나쁨'],
          '매우나쁨', CAI_COLORS['매우나쁨'],
          CAI_COLORS['보통'],
        ],
      },
    });

    map.addLayer({
      id: 'seoul-cai-index',
      type: 'symbol',
      source: LAYER_IDS.cai.source,
      layout: {
        visibility: 'none',
        'text-field': ['to-string', ['get', 'cai']],
        'text-size': 14,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': 'rgba(14,14,16,0.9)',
        'text-halo-width': 1.2,
      },
    });

    map.addLayer({
      id: 'seoul-cai-name',
      type: 'symbol',
      source: LAYER_IDS.cai.source,
      layout: {
        visibility: 'none',
        'text-field': ['get', 'name'],
        'text-size': 10,
        'text-offset': [0, 2.2],
        'text-anchor': 'top',
      },
      minzoom: 10,
      paint: {
        'text-color': '#E8E4DF',
        'text-halo-color': 'rgba(14,14,16,0.85)',
        'text-halo-width': 1,
      },
    });

    // ---- S-DoT -----------------------------------------------------------
    map.addLayer({
      id: 'seoul-sdot-circle',
      type: 'circle',
      source: LAYER_IDS.sdot.source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 13, 14, 26],
        // 색 구간은 실제 수신값 범위에 맞춰 loadLayer에서 다시 설정한다.
        // 자치구 평균은 하루 중 시각에 따라 2~3°C 안에 몰리기도 해서
        // 고정 구간을 쓰면 전부 같은 색으로 뭉개진다.
        'circle-color': '#1bbfa8',
        'circle-opacity': 0.35,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#1bbfa8',
      },
    });

    map.addLayer({
      id: 'seoul-sdot-label',
      type: 'symbol',
      source: LAYER_IDS.sdot.source,
      layout: {
        visibility: 'none',
        'text-field': ['concat', ['to-string', ['get', 'temp']], '°'],
        'text-size': 13,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': 'rgba(14,14,16,0.9)',
        'text-halo-width': 1.2,
      },
    });

    // ---- 자치구 온실가스 --------------------------------------------------
    map.addLayer({
      id: 'seoul-ghg-circle',
      type: 'circle',
      source: LAYER_IDS.ghg.source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'value'],
          0, 10,
          3000, 26,
          8000, 44,
        ],
        'circle-color': '#C45C4A',
        'circle-opacity': 0.35,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#C45C4A',
      },
    });

    map.addLayer({
      id: 'seoul-ghg-label',
      type: 'symbol',
      source: LAYER_IDS.ghg.source,
      layout: {
        visibility: 'none',
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#E8E4DF',
        'text-halo-color': 'rgba(14,14,16,0.85)',
        'text-halo-width': 1.2,
      },
    });

    // ---- 태양광 -----------------------------------------------------------
    map.addLayer({
      id: 'seoul-solar-circle',
      type: 'circle',
      source: LAYER_IDS.solar.source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': [
          'interpolate', ['linear'], ['get', 'value'],
          0, 8,
          15000, 24,
          45000, 42,
        ],
        'circle-color': '#C8923A',
        'circle-opacity': 0.35,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#C8923A',
      },
    });

    map.addLayer({
      id: 'seoul-solar-label',
      type: 'symbol',
      source: LAYER_IDS.solar.source,
      layout: {
        visibility: 'none',
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-anchor': 'center',
      },
      paint: {
        'text-color': '#E8E4DF',
        'text-halo-color': 'rgba(14,14,16,0.85)',
        'text-halo-width': 1.2,
      },
    });

    // ---- 서울 윤곽선 (데이터 레이어 위에 얹어 항상 보이게) -----------------
    map.addLayer({
      id: 'seoul-boundary-glow',
      type: 'line',
      source: 'seoul-boundary',
      paint: {
        'line-color': '#1bbfa8',
        'line-width': ['interpolate', ['linear'], ['zoom'], 9, 4, 13, 8],
        'line-opacity': 0.10,
        'line-blur': 4,
      },
    });

    map.addLayer({
      id: 'seoul-district-line',
      type: 'line',
      source: 'seoul-boundary',
      paint: {
        'line-color': 'rgba(27,191,168,0.42)',
        'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.7, 13, 1.5],
      },
    });

    // ---- 팝업 -------------------------------------------------------------
    if (handlersBoundRef.current) return;
    handlersBoundRef.current = true;

    const popupLayers: { layer: string; render: (p: Record<string, unknown>) => string }[] = [
      {
        layer: 'seoul-air-circle',
        render: (p) => `
          <div style="font-weight:600;margin-bottom:6px">${String(p.name ?? '')}</div>
          <div>PM2.5 <b>${String(p.pm25 ?? '-')}</b> ㎍/㎥</div>
          <div>PM10 <b>${String(p.pm10 ?? '-')}</b> ㎍/㎥</div>
          <div style="opacity:.6;margin-top:6px;font-size:11px">${String(p.dataTime ?? '')}</div>`,
      },
      {
        layer: 'seoul-cai-circle',
        render: (p) => `
          <div style="font-weight:600;margin-bottom:6px">${String(p.name ?? '')} <span style="opacity:.6;font-weight:400">${String(p.region ?? '')}</span></div>
          <div>통합대기환경지수 <b>${String(p.cai ?? '-')}</b> (${String(p.grade ?? '-')})</div>
          <div>초미세먼지 <b>${String(p.pm25 ?? '-')}</b> ㎍/㎥</div>
          <div>미세먼지 <b>${String(p.pm10 ?? '-')}</b> ㎍/㎥</div>
          <div>오존 <b>${String(p.o3 ?? '-')}</b> ppm</div>
          <div style="opacity:.6;margin-top:6px;font-size:11px">주오염물질 ${String(p.dominant ?? '-')} · ${String(p.dataTime ?? '')}</div>`,
      },
      {
        layer: 'seoul-sdot-circle',
        render: (p) => `
          <div style="font-weight:600;margin-bottom:6px">${String(p.name ?? '')}</div>
          <div>기온 <b>${String(p.temp ?? '-')}</b> °C</div>
          <div>습도 <b>${String(p.humidity ?? '-')}</b> %</div>
          <div style="opacity:.6;margin-top:6px;font-size:11px">
            S-DoT ${String(p.sensorCount ?? '-')}지점 평균${p.dongCount ? ` · ${String(p.dongCount)}개 행정동` : ''}<br/>
            ${String(p.dataTime ?? '')}
          </div>`,
      },
      {
        layer: 'seoul-ghg-circle',
        render: (p) => `
          <div style="font-weight:600;margin-bottom:6px">${String(p.name ?? '')}</div>
          <div>온실가스 <b>${fmtNum(Number(p.ghgTotal ?? 0))}</b> 천tCO₂eq</div>
          <div>1인당 <b>${String(p.ghgPerCapita ?? '-')}</b> tCO₂eq</div>
          <div>에너지 <b>${fmtNum(Number(p.energyUse ?? 0))}</b> TOE</div>
          <div>녹지율 <b>${String(p.greenRatio ?? '-')}</b> %</div>`,
      },
      {
        layer: 'seoul-solar-circle',
        render: (p) => `
          <div style="font-weight:600;margin-bottom:6px">${String(p.name ?? '')}</div>
          <div>태양광 <b>${fmtNum(Number(p.solarCapacity ?? 0))}</b> kW</div>
          <div>인구 <b>${fmtNum(Number(p.population ?? 0))}</b> 명</div>`,
      },
    ];

    popupLayers.forEach(({ layer, render }) => {
      map.on('click', layer, (e) => {
        const feature = e.features?.[0];
        if (!feature || feature.geometry.type !== 'Point') return;

        const coords = feature.geometry.coordinates as [number, number];

        const el = document.createElement('div');
        el.style.cssText = 'font-size:13px;line-height:1.6;color:#E8E4DF';
        el.innerHTML = render(feature.properties ?? {});

        void import('mapbox-gl').then((mod) => {
          new mod.default.Popup({ closeButton: true, maxWidth: '260px', className: 'ep-popup' })
            .setLngLat(coords)
            .setDOMContent(el)
            .addTo(map);
        });
      });

      map.on('mouseenter', layer, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = '';
      });
    });
  }, []);

  const applyVisibility = useCallback((map: mapboxgl.Map, id: SeoulLayerId, visible: boolean) => {
    LAYER_IDS[id].layers.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    });
  }, []);

  const loadLayer = useCallback(
    async (map: mapboxgl.Map, id: SeoulLayerId) => {
      if (cacheRef.current[id]) {
        const src = map.getSource(LAYER_IDS[id].source);
        if (src && 'setData' in src) {
          (src as mapboxgl.GeoJSONSource).setData(cacheRef.current[id]);
        }
        return;
      }

      let fc: GeoJSON.FeatureCollection = EMPTY_FC;
      let kind: DataSourceKind = 'demo';

      if (API_LAYERS.includes(id)) {
        try {
          const res = await fetch(ENDPOINTS[id] ?? `/api/layers/${id}`);
          if (res.ok) {
            const raw = (await res.json()) as GeoJSON.FeatureCollection;
            fc = filterToSeoul(raw);
            const header = res.headers.get('X-Data-Source');
            kind = header && !header.startsWith('mock') ? 'live' : 'demo';
          }
        } catch {
          fc = EMPTY_FC;
        }
      } else if (id === 'satellite') {
        // 래스터 타일이라 받아올 GeoJSON이 없다. 표시만 토글한다.
        return;
      } else if (id === 'heat') {
        fc = buildHeatFC();
      } else if (id === 'vulnerable') {
        fc = buildVulnerableFC();
        kind = 'analysis';
      } else if (id === 'ghg') {
        fc = buildDistrictFC('ghg');
      } else if (id === 'solar') {
        fc = buildDistrictFC('solar');
      }

      cacheRef.current[id] = fc;

      const src = map.getSource(LAYER_IDS[id].source);
      if (src && 'setData' in src) {
        (src as mapboxgl.GeoJSONSource).setData(fc);
      }

      setLayerSource(id, kind, fc.features.length);

      // 헤더 통계
      if (id === 'air-quality' && fc.features.length > 0) {
        const vals = fc.features
          .map((f) => Number(f.properties?.pm25))
          .filter((v) => Number.isFinite(v));
        if (vals.length > 0) {
          setLiveAvgPm25(Math.round(vals.reduce((a, b) => a + b, 0) / vals.length));
        }
      }
      if (id === 'sdot' && fc.features.length > 0) {
        const vals = fc.features
          .map((f) => Number(f.properties?.temp))
          .filter((v) => Number.isFinite(v));

        if (vals.length > 0) {
          setLiveAvgTemp(Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10);

          // 실제 수신 범위로 색 구간을 다시 잡는다. 자치구 평균은 시각에 따라
          // 2~3°C 안에 몰리기도 해서, 고정 구간이면 전 자치구가 같은 색이 된다.
          const lo = Math.min(...vals);
          const hi = Math.max(...vals);
          const span = hi - lo;
          if (span > 0.05 && map.getLayer('seoul-sdot-circle')) {
            const expr: ExpressionSpecification = [
              'interpolate',
              ['linear'],
              ['get', 'temp'],
              lo, '#2962FF',
              lo + span * 0.33, '#00BCD4',
              lo + span * 0.66, '#FFC107',
              hi, '#FF5722',
            ];
            map.setPaintProperty('seoul-sdot-circle', 'circle-color', expr);
            map.setPaintProperty('seoul-sdot-circle', 'circle-stroke-color', expr);
          }
        }
      }
    },
    [setLayerSource],
  );

  const handleMapReady = useCallback(
    (map: mapboxgl.Map) => {
      mapRef.current = map;
      addLayers(map);

      // 배경지도를 바꾸면 onMapReady가 다시 불린다. 컨트롤러는 한 번만 만든다.
      if (!animRef.current) animRef.current = new SeoulAnimationController();
      animRef.current.attach(map);

      // 기본 활성 레이어
      (Object.keys(enabledRef.current) as SeoulLayerId[]).forEach((id) => {
        if (!enabledRef.current[id]) return;
        applyVisibility(map, id, true);
        void loadLayer(map, id);
        const anim = LAYER_ANIMATION[id];
        if (anim) animRef.current?.start(anim);
      });

      // 꺼져 있는 API 레이어도 미리 받아둔다. 배지(LIVE/DEMO)와 지점 수가
      // 진입 즉시 채워지고, 토글할 때 캐시에서 바로 그려진다.
      API_LAYERS.filter((id) => !enabledRef.current[id]).forEach((id) => {
        void loadLayer(map, id);
      });

      setLastUpdated(
        new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
      setCountdown(REFRESH_SEC);
    },
    [addLayers, applyVisibility, loadLayer],
  );

  const handleToggle = useCallback(
    (id: SeoulLayerId) => {
      const next = !enabledRef.current[id];
      enabledRef.current[id] = next;

      setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, enabled: next } : l)));

      const map = mapRef.current;
      if (!map) return;

      applyVisibility(map, id, next);

      const anim = LAYER_ANIMATION[id];
      if (anim) {
        if (next) animRef.current?.start(anim);
        else animRef.current?.stop(anim);
      }

      if (next) {
        void loadLayer(map, id);
        trackEvent('layer_toggle', 'seoul_layer_enabled', { layer_id: id });
      }
    },
    [applyVisibility, loadLayer],
  );

  // 화면을 켜둔 채로 실데이터가 갱신되게 한다. 상황판의 핵심.
  const refreshLive = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    API_LAYERS.forEach((id) => {
      delete cacheRef.current[id];
      void loadLayer(map, id);
    });

    setLastUpdated(
      new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
  }, [loadLayer]);

  useEffect(() => {
    trackEvent('page_view', 'seoul_dashboard', {});

    const tick = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_SEC : c - 1));
    }, 1000);
    const refresh = setInterval(refreshLive, REFRESH_SEC * 1000);

    return () => {
      clearInterval(tick);
      clearInterval(refresh);
      animRef.current?.dispose();
      animRef.current = null;
    };
  }, [refreshLive]);

  const activeCount = layers.filter((l) => l.enabled).length;

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - var(--header-height))' }}>
      <EarthMap
        hideControls
        mapStyleId={mapStyleId}
        center={SEOUL_CENTER}
        zoom={SEOUL_ZOOM}
        onMapReady={handleMapReady}
      />

      {/* 상단 헤더 */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center gap-4 px-4 py-3 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(14,14,16,0.9), rgba(14,14,16,0))',
        }}
      >
        <div className="pointer-events-auto">
          <h1 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
            서울 기후 대시보드
          </h1>
          <p className="text-xs font-mono flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--text-muted)' }}>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#1bbfa8' }}
              aria-hidden
            />
            <span style={{ color: '#1bbfa8' }}>LIVE</span>
            <span>· {activeCount} LAYERS</span>
            {lastUpdated && <span>· 갱신 {lastUpdated}</span>}
            <span>· 다음 {countdown}s</span>
          </p>
        </div>

        <div className="hidden md:flex items-center gap-5 ml-auto pointer-events-auto">
          <Stat label="평균 PM2.5" value={liveAvgPm25 !== null ? `${liveAvgPm25}` : '—'} unit="㎍/㎥" />
          <Stat label="S-DoT 기온" value={liveAvgTemp !== null ? `${liveAvgTemp}` : '—'} unit="°C" />
          <Stat label="폭염취약" value={fmtNum(Math.round(VULNERABLE_AREA_KM2))} unit="km²" />
          <Stat label="온실가스" value={fmtNum(Math.round(seoulGhgTotal))} unit="천tCO₂eq" />
          <Stat label="태양광" value={fmtNum(Math.round(seoulSolarTotal))} unit="kW" />
        </div>

        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="md:hidden ml-auto px-3 py-2 rounded-md text-sm pointer-events-auto"
          style={{ background: 'var(--surface)', color: 'var(--text)' }}
          aria-label="레이어 패널 열기"
        >
          레이어
        </button>
      </div>

      {/* 사이드바 */}
      <aside
        className={`absolute top-0 bottom-0 left-0 z-20 w-72 overflow-y-auto transition-transform md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--panel-bg)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid var(--border)',
          paddingTop: '72px',
        }}
      >
        <div className="px-4 pb-6 space-y-5">
          <SeoulLayerPanel layers={layers} onToggle={handleToggle} />

          <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <h3
              className="text-xs font-mono tracking-wider uppercase mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              배경 지도
            </h3>
            <div className="flex gap-1.5">
              {(Object.keys(MAP_STYLES) as MapStyleId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setMapStyleId(id)}
                  className="flex-1 px-2 py-1.5 rounded text-xs transition-colors"
                  style={{
                    background: mapStyleId === id ? 'var(--surface)' : 'transparent',
                    color: mapStyleId === id ? 'var(--text)' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  {MAP_STYLES[id].label}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs leading-relaxed space-y-1" style={{ color: 'var(--text-muted)' }}>
            <p>
              <span style={{ color: '#1bbfa8' }}>LIVE</span> 공공 API 실시간 수신 ·{' '}
              <span style={{ color: '#C8923A' }}>DEMO</span> 공개 통계 기반 데모
            </p>
            <p>
              <span style={{ color: '#C45C4A' }}>분석</span> 위성 데이터 처리 결과 ·{' '}
              <span style={{ color: '#4A9EC4' }}>영상</span> 위성 래스터
            </p>
            <p>실시간 레이어는 {REFRESH_SEC}초마다 자동 갱신됩니다.</p>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="md:hidden absolute inset-0 z-10"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSidebarOpen(false)}
          aria-label="닫기"
        />
      )}
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="text-right">
      <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div className="text-sm" style={{ color: 'var(--text)' }}>
        <span className="font-semibold">{value}</span>{' '}
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {unit}
        </span>
      </div>
    </div>
  );
}
