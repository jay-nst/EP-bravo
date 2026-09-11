'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type mapboxgl from 'mapbox-gl';
import GyeonggiLayerPanel from '@/components/gyeonggi/GyeonggiLayerPanel';
import type {
  GyeonggiLayer,
  GyeonggiLayerId,
  DataSourceKind,
} from '@/components/gyeonggi/GyeonggiLayerPanel';
import GyeonggiSourcePanel from '@/components/gyeonggi/GyeonggiSourcePanel';
import { GYEONGGI_SOURCE_PROVIDERS } from '@/lib/gyeonggi-data-sources';
import { GYEONGGI_SIGUN_BOUNDARIES, GYEONGGI_MASK } from '@/lib/gyeonggi-boundary';
import {
  SIGUN_PARK_SCORES,
  ACCESS_LEVELS,
  PARK_SCORE_CRTR_YMD,
  PARK_FEATURE_COUNT,
  PARK_TOTAL_AREA_KM2,
  EMD_COUNT,
} from '@/lib/gyeonggi-park-data';
import { baseRadiusM } from '@/lib/park-accessibility';
import { MAP_STYLES, DEFAULT_STYLE_IDS } from '@/components/map/EarthMap';
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

const GYEONGGI_CENTER: [number, number] = [127.18, 37.42];
const GYEONGGI_ZOOM = 8.4;

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

// 접근성 등고선 5단계 색. ACCESS_LEVELS(낮음→매우 높음) 순서와 1:1.
// 긍정 지표라 어두운 청록 → 밝은 민트로 올라가는 단일 색상 램프를 쓴다
// (DESIGN.md accent #1bbfa8 계열 — 평가 choropleth 의 적/황과 계열을 갈라놓는다).
const CONTOUR_COLORS = ['#17453C', '#1A6353', '#178A72', '#1bbfa8', '#7FE8D2'] as const;

// 읍면동 평가 점수 램프. 관측 범위 0.1~67.8 — 낮음 적색(--error) → 높음 청록(accent).
const EMD_SCORE_STOPS: [number, string][] = [
  [5, '#C45C4A'],
  [20, '#C8923A'],
  [35, '#8A8680'],
  [50, '#4A9E6B'],
  [68, '#1bbfa8'],
];

const INITIAL_LAYERS: GyeonggiLayer[] = [
  {
    id: 'access-contour',
    label: '공원 접근성 등고선',
    sublabel: '공원별 서비스 영향 중첩 · 자체 모델',
    color: '#1bbfa8',
    enabled: true,
    featureCount: 0,
    source: 'analysis',
    group: '접근성 분석',
  },
  {
    id: 'park-wms',
    label: '공원 현황 (폴리곤)',
    sublabel: '경기기후플랫폼 WMS · 클릭하면 상세',
    color: '#4A9E6B',
    enabled: true,
    featureCount: PARK_FEATURE_COUNT,
    source: 'live',
    group: '접근성 분석',
  },
  {
    id: 'emd-score',
    label: '읍면동 공원 서비스 평가',
    sublabel: `종합점수 · 읍면동 ${EMD_COUNT}개`,
    color: '#C8923A',
    enabled: false,
    featureCount: 0,
    source: 'stat',
    group: '평가 데이터',
  },
  {
    id: 'satellite',
    label: '위성영상',
    sublabel: 'Mapbox Satellite 고해상 영상',
    color: '#4A9EC4',
    enabled: false,
    featureCount: 0,
    source: 'imagery',
    group: '위성·배경',
  },
];

const CONTOUR_FILL_LAYERS = CONTOUR_COLORS.map((_, i) => `gg-contour-fill-${i}`);

const LAYER_IDS: Record<GyeonggiLayerId, { source: string; layers: string[] }> = {
  'access-contour': {
    source: 'gg-contours',
    layers: [...CONTOUR_FILL_LAYERS, 'gg-contour-line'],
  },
  'park-wms': {
    // WMS 래스터. GeoJSON 을 받아오지 않고 표시만 토글한다.
    source: 'gg-park-tiles',
    layers: ['gg-park-raster'],
  },
  'emd-score': {
    source: 'gg-emd',
    layers: ['gg-emd-fill', 'gg-emd-line'],
  },
  satellite: {
    source: 'gg-satellite',
    layers: ['gg-satellite-raster'],
  },
};

// 정적 파일에서 받아오는 레이어와 그 경로. 평가 기준일 고정 데이터라
// 서울처럼 주기 갱신하지 않는다 — 재수집은 scripts/fetch-gyeonggi-parks.js 몫.
const STATIC_ENDPOINTS: Partial<Record<GyeonggiLayerId, { url: string; kind: DataSourceKind }>> = {
  'access-contour': { url: '/data/gyeonggi/access-contours.json', kind: 'analysis' },
  'emd-score': { url: '/data/gyeonggi/emd-park-score.json', kind: 'stat' },
};

const CRTR_LABEL = `${PARK_SCORE_CRTR_YMD.slice(0, 4)}.${PARK_SCORE_CRTR_YMD.slice(4, 6)}.${PARK_SCORE_CRTR_YMD.slice(6, 8)}`;

// 시군 이름 라벨용 포인트 FC (번들 좌표라 항상 표시 가능)
const SIGUN_LABEL_FC: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: SIGUN_PARK_SCORES.map((s) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [s.lng, s.lat] },
    properties: { name: s.name, score: s.score, rank: s.rank },
  })),
};

function emdScoreColorExpr(): mapboxgl.ExpressionSpecification {
  return [
    'interpolate',
    ['linear'],
    ['get', 'score'],
    ...EMD_SCORE_STOPS.flat(),
  ] as mapboxgl.ExpressionSpecification;
}

function areaLabel(areaM2: number): string {
  if (areaM2 >= 10_000) return `${fmtNum(Math.round(areaM2 / 1000) / 10)} ha`;
  return `${fmtNum(Math.round(areaM2))} ㎡`;
}

export default function GyeonggiPage() {
  const [layers, setLayers] = useState<GyeonggiLayer[]>(INITIAL_LAYERS);
  const [mapStyleId, setMapStyleId] = useState<MapStyleId>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const enabledRef = useRef<Record<string, boolean>>({ 'access-contour': true, 'park-wms': true });
  const cacheRef = useRef<Record<string, GeoJSON.FeatureCollection>>({});
  // 배경지도를 바꾸면 setStyle 이 소스/레이어를 날리고 onMapReady 가 다시 불린다.
  // 소스·레이어는 매번 다시 만들되 클릭 핸들러는 1회만 바인딩한다.
  const handlersBoundRef = useRef(false);

  const setLayerSource = useCallback(
    (id: GyeonggiLayerId, source: DataSourceKind, count: number) => {
      setLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, source, featureCount: count } : l)),
      );
    },
    [],
  );

  const addLayers = useCallback((map: mapboxgl.Map) => {
    // ---- sources -------------------------------------------------------
    (['access-contour', 'emd-score'] as GyeonggiLayerId[]).forEach((id) => {
      if (map.getSource(LAYER_IDS[id].source)) return;
      map.addSource(LAYER_IDS[id].source, { type: 'geojson', data: EMPTY_FC });
    });

    if (!map.getSource('gg-mask')) {
      map.addSource('gg-mask', { type: 'geojson', data: GYEONGGI_MASK });
    }
    if (!map.getSource('gg-boundary')) {
      map.addSource('gg-boundary', { type: 'geojson', data: GYEONGGI_SIGUN_BOUNDARIES });
    }
    if (!map.getSource('gg-sigun-labels')) {
      map.addSource('gg-sigun-labels', { type: 'geojson', data: SIGUN_LABEL_FC });
    }
    if (!map.getSource('gg-satellite')) {
      map.addSource('gg-satellite', {
        type: 'raster',
        url: 'mapbox://mapbox.satellite',
        tileSize: 256,
      });
    }
    if (!map.getSource('gg-park-tiles')) {
      // 공원 폴리곤은 35,000+개라 GeoJSON 대신 WMS 래스터 프록시로 그린다.
      // 키는 서버 라우트에만 있다.
      map.addSource('gg-park-tiles', {
        type: 'raster',
        tiles: ['/api/layers/gyeonggi-park-tiles?bbox={bbox-epsg-3857}'],
        tileSize: 512,
      });
    }

    // ---- 배경/마스크 (아래) ----------------------------------------------
    map.addLayer({
      id: 'gg-satellite-raster',
      type: 'raster',
      source: 'gg-satellite',
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 0.95 },
    });

    map.addLayer({
      id: 'gg-mask-fill',
      type: 'fill',
      source: 'gg-mask',
      paint: { 'fill-color': '#08080A', 'fill-opacity': 0.45 },
    });

    map.addLayer({
      id: 'gg-inner-lift',
      type: 'fill',
      source: 'gg-boundary',
      paint: { 'fill-color': '#9FD8CE', 'fill-opacity': 0.05 },
    });

    // ---- 읍면동 평가 choropleth (등고선보다 아래 — 맥락용) ------------------
    map.addLayer({
      id: 'gg-emd-fill',
      type: 'fill',
      source: LAYER_IDS['emd-score'].source,
      layout: { visibility: 'none' },
      paint: {
        'fill-color': emdScoreColorExpr(),
        'fill-opacity': 0.45,
      },
    });

    map.addLayer({
      id: 'gg-emd-line',
      type: 'line',
      source: LAYER_IDS['emd-score'].source,
      layout: { visibility: 'none' },
      minzoom: 9.5,
      paint: {
        'line-color': 'rgba(232,228,223,0.15)',
        'line-width': 0.5,
      },
    });

    // ---- 접근성 등고선 (메인) ---------------------------------------------
    // d3-contour 밴드는 '값 ≥ 임계' 영역이라 서로 중첩(포개짐)된다.
    // 낮은 단계부터 그려서 높은 단계가 위에 얹히게 한다.
    CONTOUR_COLORS.forEach((color, i) => {
      map.addLayer({
        id: CONTOUR_FILL_LAYERS[i],
        type: 'fill',
        source: LAYER_IDS['access-contour'].source,
        filter: ['==', ['get', 'level'], i],
        layout: { visibility: 'none' },
        paint: {
          'fill-color': color,
          'fill-opacity': 0.5,
        },
      });
    });

    map.addLayer({
      id: 'gg-contour-line',
      type: 'line',
      source: LAYER_IDS['access-contour'].source,
      layout: { visibility: 'none' },
      paint: {
        'line-color': '#7FE8D2',
        'line-width': 0.6,
        'line-opacity': 0.35,
      },
    });

    // ---- 공원 현황 WMS 래스터 (등고선 위 — 실제 공원 위치가 뚜렷하게) --------
    map.addLayer({
      id: 'gg-park-raster',
      type: 'raster',
      source: 'gg-park-tiles',
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 0.85 },
    });

    // ---- 시군 경계 (항상 표시, 데이터 위) ----------------------------------
    map.addLayer({
      id: 'gg-boundary-glow',
      type: 'line',
      source: 'gg-boundary',
      paint: {
        'line-color': '#1bbfa8',
        'line-width': ['interpolate', ['linear'], ['zoom'], 7, 3, 12, 7],
        'line-opacity': 0.08,
        'line-blur': 4,
      },
    });

    map.addLayer({
      id: 'gg-sigun-line',
      type: 'line',
      source: 'gg-boundary',
      paint: {
        'line-color': 'rgba(27,191,168,0.38)',
        'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.6, 12, 1.4],
      },
    });

    map.addLayer({
      id: 'gg-sigun-name',
      type: 'symbol',
      source: 'gg-sigun-labels',
      minzoom: 8,
      layout: {
        'text-field': ['get', 'name'],
        'text-size': 11,
        'text-allow-overlap': false,
      },
      paint: {
        'text-color': '#E8E4DF',
        'text-halo-color': 'rgba(14,14,16,0.85)',
        'text-halo-width': 1,
        'text-opacity': 0.8,
      },
    });

    // ---- 클릭 팝업 (1회 바인딩) --------------------------------------------
    if (handlersBoundRef.current) return;
    handlersBoundRef.current = true;

    map.on('click', (e) => {
      void (async () => {
        const sections: string[] = [];

        // 공원 식별 — WMS 래스터는 피처가 없으므로 서버에 좌표로 물어본다.
        if (enabledRef.current['park-wms']) {
          try {
            const res = await fetch(
              `/api/layers/gyeonggi-park-info?lng=${e.lngLat.lng.toFixed(6)}&lat=${e.lngLat.lat.toFixed(6)}`,
            );
            if (res.ok) {
              const fc = (await res.json()) as GeoJSON.FeatureCollection;
              const p = fc.features[0]?.properties as
                | { uid: string; sggNm: string; sclsfNm: string; areaM2: number }
                | undefined;
              if (p) {
                const radius = baseRadiusM({ sclsfNm: p.sclsfNm, areaM2: p.areaM2 });
                sections.push(`
                  <div style="font-weight:600;margin-bottom:6px">${p.sclsfNm} <span style="opacity:.6;font-weight:400">${p.sggNm}</span></div>
                  <div>면적 <b>${areaLabel(p.areaM2)}</b></div>
                  <div>기본 서비스 반경 <b>${fmtNum(radius)}</b> m <span style="opacity:.6">(평가 가중 전)</span></div>
                  <div style="opacity:.6;margin-top:4px;font-size:11px">${p.uid}</div>`);
              }
            }
          } catch {
            // 식별 실패는 조용히 넘어간다 — 아래 등고선/평가 정보는 계속 보여준다.
          }
        }

        // 접근성 등고선 — 겹친 밴드 중 최상위(가장 높은 단계)가 먼저 온다.
        const contourHits = map.queryRenderedFeatures(e.point, { layers: CONTOUR_FILL_LAYERS });
        if (contourHits.length > 0) {
          const p = contourHits[0].properties as { label: string; min: number; max: number | null };
          sections.push(`
            <div style="font-weight:600;margin-bottom:2px">공원 접근성 <b style="color:#7FE8D2">${p.label}</b></div>
            <div style="opacity:.7;font-size:12px">영향 지수 ${p.min}${p.max !== null ? `~${p.max}` : ' 이상'}</div>`);
        }

        // 읍면동 평가
        const emdHits = map.queryRenderedFeatures(e.point, { layers: ['gg-emd-fill'] });
        if (emdHits.length > 0) {
          const p = emdHits[0].properties as {
            emdNm: string;
            sigunNm: string;
            sggNm: string | null;
            score: number;
            rank: number;
            perCapita: number;
            greenRate: number;
            benefitRate: number;
          };
          sections.push(`
            <div style="font-weight:600;margin-bottom:6px">${p.sigunNm}${p.sggNm ? ` ${p.sggNm}` : ''} ${p.emdNm}</div>
            <div>종합평가 <b>${p.score}</b>점 · <b>${p.rank}</b>위/${EMD_COUNT}</div>
            <div>1인당 공원녹지 <b>${p.perCapita}</b> ㎡</div>
            <div>공원녹지율 <b>${p.greenRate}</b> %</div>
            <div>서비스 수혜인구 <b>${p.benefitRate}</b> %</div>`);
        }

        if (sections.length === 0) return;

        const el = document.createElement('div');
        el.style.cssText = 'font-size:13px;line-height:1.6;color:#E8E4DF';
        el.innerHTML = sections.join(
          '<div style="border-top:1px solid rgba(232,228,223,0.12);margin:8px 0"></div>',
        );

        void import('mapbox-gl').then((mod) => {
          new mod.default.Popup({ closeButton: true, maxWidth: '280px', className: 'ep-popup' })
            .setLngLat(e.lngLat)
            .setDOMContent(el)
            .addTo(map);
        });
      })();
    });

    ['gg-emd-fill', ...CONTOUR_FILL_LAYERS].forEach((layer) => {
      map.on('mouseenter', layer, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = '';
      });
    });
  }, []);

  const applyVisibility = useCallback(
    (map: mapboxgl.Map, id: GyeonggiLayerId, visible: boolean) => {
      LAYER_IDS[id].layers.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
        }
      });
    },
    [],
  );

  const loadLayer = useCallback(
    async (map: mapboxgl.Map, id: GyeonggiLayerId) => {
      const endpoint = STATIC_ENDPOINTS[id];
      if (!endpoint) return; // 래스터 레이어 — 표시만 토글한다.

      if (cacheRef.current[id]) {
        const src = map.getSource(LAYER_IDS[id].source);
        if (src && 'setData' in src) {
          (src as mapboxgl.GeoJSONSource).setData(cacheRef.current[id]);
        }
        return;
      }

      let fc: GeoJSON.FeatureCollection = EMPTY_FC;
      try {
        const res = await fetch(endpoint.url);
        if (res.ok) fc = (await res.json()) as GeoJSON.FeatureCollection;
      } catch {
        fc = EMPTY_FC;
      }

      cacheRef.current[id] = fc;

      const src = map.getSource(LAYER_IDS[id].source);
      if (src && 'setData' in src) {
        (src as mapboxgl.GeoJSONSource).setData(fc);
      }

      setLayerSource(id, fc.features.length > 0 ? endpoint.kind : 'loading', fc.features.length);
    },
    [setLayerSource],
  );

  const handleMapReady = useCallback(
    (map: mapboxgl.Map) => {
      mapRef.current = map;
      addLayers(map);

      (Object.keys(LAYER_IDS) as GyeonggiLayerId[]).forEach((id) => {
        if (enabledRef.current[id]) {
          applyVisibility(map, id, true);
        }
        // 꺼져 있어도 정적 데이터는 미리 받아 피처 수를 채워둔다.
        void loadLayer(map, id);
      });
    },
    [addLayers, applyVisibility, loadLayer],
  );

  const handleToggle = useCallback(
    (id: GyeonggiLayerId) => {
      const next = !enabledRef.current[id];
      enabledRef.current[id] = next;

      setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, enabled: next } : l)));

      const map = mapRef.current;
      if (!map) return;

      applyVisibility(map, id, next);

      if (next) {
        void loadLayer(map, id);
        trackEvent('layer_toggle', 'gyeonggi_layer_enabled', { layer_id: id });
      }
    },
    [applyVisibility, loadLayer],
  );

  const flyToSigun = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 10.5, duration: 1200 });
  }, []);

  useEffect(() => {
    trackEvent('page_view', 'gyeonggi_parks', {});
  }, []);

  const activeCount = layers.filter((l) => l.enabled).length;
  const showContourLegend = layers.some((l) => l.enabled && l.id === 'access-contour');
  const showEmdLegend = layers.some((l) => l.enabled && l.id === 'emd-score');
  const bestSigun = SIGUN_PARK_SCORES[0];

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - var(--header-height))' }}>
      <EarthMap
        hideControls
        mapStyleId={mapStyleId}
        center={GYEONGGI_CENTER}
        zoom={GYEONGGI_ZOOM}
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
            경기 공원 접근성 지도
          </h1>
          <p
            className="text-xs font-mono flex items-center gap-1.5 flex-wrap"
            style={{ color: 'var(--text-muted)' }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: '#4A9E6B' }}
              aria-hidden
            />
            <span style={{ color: '#4A9E6B' }}>평가 기준 {CRTR_LABEL}</span>
            <span>· {activeCount} LAYERS</span>
          </p>
        </div>

        <div className="hidden md:flex items-center gap-5 ml-auto pointer-events-auto">
          <Stat label="공원 폴리곤" value={fmtNum(PARK_FEATURE_COUNT)} unit="개" />
          <Stat label="공원 총면적" value={fmtNum(Math.round(PARK_TOTAL_AREA_KM2))} unit="km²" />
          <Stat label="평가 구역" value={fmtNum(EMD_COUNT)} unit="읍면동" />
          <div className="hidden lg:block">
            <Stat label="1위 시군" value={bestSigun.name} unit={`${bestSigun.score}점`} />
          </div>
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
          <GyeonggiLayerPanel layers={layers} onToggle={handleToggle} />

          <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <h3
              className="text-xs font-mono tracking-wider uppercase mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              배경 지도
            </h3>
            <div className="flex gap-1.5">
              {DEFAULT_STYLE_IDS.map((id) => (
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

          {showContourLegend && (
            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <h3
                className="text-xs font-mono tracking-wider uppercase mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                접근성 등급
              </h3>
              <div className="space-y-1">
                {ACCESS_LEVELS.map((lv, i) => (
                  <div key={lv.label} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ background: CONTOUR_COLORS[i] }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {lv.label}
                      <span className="font-mono opacity-70"> ≥ {lv.min}</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                공원 유형·면적 기반 서비스 반경에 읍면동 평가점수를 가중해 중첩한 영향
                지수입니다. 평가가 좋은 지역의 공원일수록 넓은 범위에 영향을 줍니다.
              </p>
            </div>
          )}

          {showEmdLegend && (
            <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <h3
                className="text-xs font-mono tracking-wider uppercase mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                읍면동 종합점수
              </h3>
              <div
                className="h-2 rounded-sm mb-1"
                style={{
                  background: `linear-gradient(to right, ${EMD_SCORE_STOPS.map(([, c]) => c).join(', ')})`,
                }}
              />
              <div
                className="flex justify-between text-xs font-mono"
                style={{ color: 'var(--text-muted)' }}
              >
                <span>{EMD_SCORE_STOPS[0][0]}점</span>
                <span>{EMD_SCORE_STOPS[EMD_SCORE_STOPS.length - 1][0]}점</span>
              </div>
            </div>
          )}

          {/* 시군 순위표 */}
          <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <h3
              className="text-xs font-mono tracking-wider uppercase mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              시군 평가 순위
            </h3>
            <ol className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
              {SIGUN_PARK_SCORES.map((s, i) => (
                <li key={s.code}>
                  <button
                    onClick={() => flyToSigun(s.lng, s.lat)}
                    className="w-full flex items-center gap-2 px-1.5 py-1 rounded text-left transition-colors hover:bg-[var(--surface)]"
                  >
                    <span
                      className="text-xs font-mono w-5 text-right flex-shrink-0"
                      style={{ color: i < 3 ? '#1bbfa8' : 'var(--text-muted)' }}
                    >
                      {i + 1}
                    </span>
                    <span className="flex-1 text-xs truncate" style={{ color: 'var(--text)' }}>
                      {s.name}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {s.score.toFixed(1)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              공원 서비스 종합평가 점수(0~100). 행을 누르면 해당 시군으로 이동합니다.
            </p>
          </div>

          <div className="text-xs leading-relaxed space-y-1" style={{ color: 'var(--text-muted)' }}>
            <p>
              <span style={{ color: '#1bbfa8' }}>LIVE</span> 공공 API 수신 ·{' '}
              <span style={{ color: '#4A9E6B' }}>통계</span> 기준일 고정 공식 통계
            </p>
            <p>
              <span style={{ color: '#C45C4A' }}>분석</span> EarthPaper 자체 모델 ·{' '}
              <span style={{ color: '#4A9EC4' }}>영상</span> 위성 래스터
            </p>
          </div>

          <GyeonggiSourcePanel />
        </div>
      </aside>

      {/* 지도 하단 크레딧 */}
      <div
        className="absolute bottom-0 right-0 z-10 max-w-full md:max-w-[60%] px-3 py-1.5 text-xs font-mono leading-relaxed text-right pointer-events-none"
        style={{
          color: 'var(--text-muted)',
          background: 'linear-gradient(to top, rgba(14,14,16,0.85), rgba(14,14,16,0))',
        }}
      >
        출처: {GYEONGGI_SOURCE_PROVIDERS.join(' · ')} · 상세는 좌측 패널
      </div>

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
