'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type mapboxgl from 'mapbox-gl';
import AoiPanel from '@/components/map/AoiPanel';
import LayerPanel from '@/components/core/LayerPanel';
import type { OverlayLayer } from '@/components/core/LayerPanel';
import { SEVERITY_COLORS } from '@/components/core/LayerPanel';
import { CITADEL_GEOJSON } from '@/lib/mock-citadel';
import type { SatelliteType } from '@/types/database';
import type { CitadelSeverity } from '@/types/citadel';
import { createClient } from '@/lib/supabase/client';
import { requestTossPayment } from '@/lib/toss/widget';
import { trackEvent } from '@/lib/analytics';
import type { PublicLayerId } from '@/types/public-data';
import { MAP_STYLES } from '@/components/map/EarthMap';
import type { MapStyleId } from '@/components/map/EarthMap';
import { LayerAnimationController, LAYER_ANIMATION_MAP } from '@/lib/layer-animations';

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

interface AoiSelection {
  polygon: GeoJSON.Polygon;
  areaKm2: number;
  price: number;
  satellite: SatelliteType;
  validationError: string | null;
}

const AIR_QUALITY_COLORS: Record<string, string> = {
  good: '#4CAF50',
  moderate: '#FFC107',
  unhealthy: '#FF9800',
  very_unhealthy: '#F44336',
  hazardous: '#9C27B0',
};

const SKY_COLORS: Record<string, string> = {
  clear: '#FFD54F',
  partly_cloudy: '#90CAF9',
  cloudy: '#78909C',
  overcast: '#546E7A',
};

const SKY_LABELS: Record<string, string> = {
  clear: '맑음',
  partly_cloudy: '구름조금',
  cloudy: '구름많음',
  overcast: '흐림',
};

const WILDFIRE_STATUS_COLORS: Record<string, string> = {
  active: '#FF3D00',
  contained: '#FF9100',
  extinguished: '#66BB6A',
};

const WILDFIRE_STATUS_LABELS: Record<string, string> = {
  active: '진화중',
  contained: '진화거의완료',
  extinguished: '진화완료',
};

const INITIAL_LAYERS: OverlayLayer[] = [
  {
    id: 'citadel',
    label: 'Citadel',
    color: '#C45C4A',
    enabled: true,
    featureCount: CITADEL_GEOJSON.features.length,
  },
  {
    id: 'air-quality',
    label: '대기오염',
    color: '#FFC107',
    enabled: false,
    featureCount: 0,
  },
  {
    id: 'aws-weather',
    label: 'AWS 기상',
    color: '#29B6F6',
    enabled: false,
    featureCount: 0,
  },
  {
    id: 'traffic',
    label: '도로 소통',
    color: '#EF5350',
    enabled: false,
    featureCount: 0,
  },
  {
    id: 'weather-forecast',
    label: '단기예보',
    color: '#64B5F6',
    enabled: false,
    featureCount: 0,
  },
  {
    id: 'wildfire',
    label: '산불',
    color: '#FF6D00',
    enabled: false,
    featureCount: 0,
  },
  {
    id: 'earthquake',
    label: '지진',
    color: '#D32F2F',
    enabled: false,
    featureCount: 0,
  },
  {
    id: 'buildings-3d',
    label: '3D 건물',
    color: '#8A8680',
    enabled: false,
    featureCount: 0,
  },
  {
    id: 'predict',
    label: 'Predict',
    color: '#4A9EC4',
    enabled: false,
    featureCount: 0,
    comingSoon: true,
  },
  {
    id: 'warden',
    label: 'Warden',
    color: '#6B8A5E',
    enabled: false,
    featureCount: 0,
    comingSoon: true,
  },
  {
    id: 'nexus',
    label: 'Nexus',
    color: '#C8923A',
    enabled: false,
    featureCount: 0,
    comingSoon: true,
  },
];

const CITADEL_SOURCE_ID = 'citadel-overlay';
const CITADEL_FILL_LAYER = 'citadel-overlay-fill';
const CITADEL_OUTLINE_LAYER = 'citadel-overlay-outline';
const CITADEL_POINT_LAYER = 'citadel-overlay-point';
const CITADEL_LABEL_LAYER = 'citadel-overlay-label';

const PUBLIC_LAYER_IDS: Record<PublicLayerId, { source: string; layers: string[] }> = {
  'air-quality': {
    source: 'public-air-quality',
    layers: ['air-quality-heatmap', 'air-quality-pulse', 'air-quality-circle', 'air-quality-label'],
  },
  'aws-weather': {
    source: 'public-aws-weather',
    layers: ['aws-weather-circle', 'aws-weather-label'],
  },
  'traffic': {
    source: 'public-traffic',
    layers: ['traffic-glow', 'traffic-line'],
  },
  'weather-forecast': {
    source: 'public-weather-forecast',
    layers: ['weather-temp-heatmap', 'weather-precip-ring', 'weather-forecast-circle', 'weather-forecast-label'],
  },
  'wildfire': {
    source: 'public-wildfire',
    layers: ['wildfire-glow', 'wildfire-circle', 'wildfire-label'],
  },
  'earthquake': {
    source: 'public-earthquake',
    layers: ['earthquake-ripple-3', 'earthquake-ripple-2', 'earthquake-ripple-1', 'earthquake-circle', 'earthquake-label'],
  },
  'buildings-3d': { source: '', layers: ['buildings-3d-extrusion'] },
};

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

export default function CorePage() {
  const [satellite, setSatellite] = useState<SatelliteType>('observer');
  const [aoi, setAoi] = useState<AoiSelection | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [catalogItemId, setCatalogItemId] = useState<string | null>(null);
  const [layers, setLayers] = useState<OverlayLayer[]>(INITIAL_LAYERS);
  const [sidebarTab, setSidebarTab] = useState<'layers' | 'purchase'>('layers');
  const [mapStyleId, setMapStyleId] = useState<MapStyleId>('dark');
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const animRef = useRef<LayerAnimationController | null>(null);
  const layerDataCache = useRef<Record<string, GeoJSON.FeatureCollection>>({});
  const layerEnabledRef = useRef<Record<string, boolean>>({ citadel: true });
  const supabase = useMemo(() => createClient(), []);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email);
    });
    return () => { animRef.current?.dispose(); };
  }, [supabase]);

  const handleAoiChange = useCallback((newAoi: AoiSelection | null) => {
    setAoi(newAoi);
    if (newAoi) setSidebarTab('purchase');
  }, []);

  const handleCatalogSelect = useCallback((itemId: string) => {
    setCatalogItemId(itemId);
  }, []);

  const addPublicDataLayers = useCallback((map: mapboxgl.Map) => {
    map.addSource(PUBLIC_LAYER_IDS['air-quality'].source, { type: 'geojson', data: EMPTY_FC });
    map.addSource(PUBLIC_LAYER_IDS['aws-weather'].source, { type: 'geojson', data: EMPTY_FC });
    map.addSource(PUBLIC_LAYER_IDS['traffic'].source, { type: 'geojson', data: EMPTY_FC });
    map.addSource(PUBLIC_LAYER_IDS['weather-forecast'].source, { type: 'geojson', data: EMPTY_FC });
    map.addSource(PUBLIC_LAYER_IDS['wildfire'].source, { type: 'geojson', data: EMPTY_FC });
    map.addSource(PUBLIC_LAYER_IDS['earthquake'].source, { type: 'geojson', data: EMPTY_FC });

    map.addLayer({
      id: 'air-quality-heatmap',
      type: 'heatmap',
      source: PUBLIC_LAYER_IDS['air-quality'].source,
      layout: { visibility: 'none' },
      maxzoom: 16,
      paint: {
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'pm25'], 0, 0, 25, 0.4, 50, 0.8, 80, 1],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 10, 1, 14, 1.8],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 5, 20, 10, 40, 14, 60, 16, 80],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.1, 'rgba(76,175,80,0.3)',
          0.25, 'rgba(76,175,80,0.6)',
          0.4, 'rgba(255,193,7,0.65)',
          0.55, 'rgba(255,152,0,0.7)',
          0.7, 'rgba(244,67,54,0.75)',
          0.85, 'rgba(156,39,176,0.8)',
          1, 'rgba(120,0,160,0.85)',
        ],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0.75, 10, 0.65, 14, 0.5, 16, 0.35],
      },
    });

    map.addLayer({
      id: 'air-quality-pulse',
      type: 'circle',
      source: PUBLIC_LAYER_IDS['air-quality'].source,
      layout: { visibility: 'none' },
      minzoom: 8,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 10, 14, 18],
        'circle-color': [
          'match', ['get', 'grade'],
          'unhealthy', AIR_QUALITY_COLORS.unhealthy,
          'very_unhealthy', AIR_QUALITY_COLORS.very_unhealthy,
          'hazardous', AIR_QUALITY_COLORS.hazardous,
          'rgba(0,0,0,0)',
        ],
        'circle-blur': 1,
        'circle-opacity': 0,
      },
    });

    map.addLayer({
      id: 'air-quality-circle',
      type: 'circle',
      source: PUBLIC_LAYER_IDS['air-quality'].source,
      layout: { visibility: 'none' },
      minzoom: 8,
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 5, 14, 12],
        'circle-color': [
          'match', ['get', 'grade'],
          'good', AIR_QUALITY_COLORS.good,
          'moderate', AIR_QUALITY_COLORS.moderate,
          'unhealthy', AIR_QUALITY_COLORS.unhealthy,
          'very_unhealthy', AIR_QUALITY_COLORS.very_unhealthy,
          'hazardous', AIR_QUALITY_COLORS.hazardous,
          AIR_QUALITY_COLORS.moderate,
        ],
        'circle-stroke-width': 1.5,
        'circle-stroke-color': 'rgba(14,14,16,0.7)',
        'circle-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0, 10, 0.9],
      },
    });

    map.addLayer({
      id: 'air-quality-label',
      type: 'symbol',
      source: PUBLIC_LAYER_IDS['air-quality'].source,
      layout: {
        visibility: 'none',
        'text-field': ['concat', ['to-string', ['get', 'pm25']], ' ㎍'],
        'text-size': 10,
        'text-offset': [0, 1.6],
        'text-anchor': 'top',
      },
      minzoom: 10,
      paint: {
        'text-color': '#E8E4DF',
        'text-halo-color': 'rgba(14,14,16,0.8)',
        'text-halo-width': 1,
      },
    });

    map.addLayer({
      id: 'aws-weather-circle',
      type: 'circle',
      source: PUBLIC_LAYER_IDS['aws-weather'].source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 4, 10, 8, 14, 14],
        'circle-color': '#29B6F6',
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(14,14,16,0.7)',
      },
    });

    map.addLayer({
      id: 'aws-weather-label',
      type: 'symbol',
      source: PUBLIC_LAYER_IDS['aws-weather'].source,
      layout: {
        visibility: 'none',
        'text-field': ['concat', ['to-string', ['get', 'temp']], '°'],
        'text-size': 11,
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
      },
      minzoom: 7,
      paint: {
        'text-color': '#E8E4DF',
        'text-halo-color': 'rgba(14,14,16,0.8)',
        'text-halo-width': 1,
      },
    });

    map.addLayer({
      id: 'traffic-glow',
      type: 'line',
      source: PUBLIC_LAYER_IDS['traffic'].source,
      layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': [
          'match', ['get', 'congestion'],
          'congested', '#EF5350',
          'slow', '#FFA726',
          'smooth', '#66BB6A',
          '#8A8680',
        ],
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 6, 14, 12],
        'line-opacity': 0.12,
        'line-blur': 4,
      },
    });

    map.addLayer({
      id: 'traffic-line',
      type: 'line',
      source: PUBLIC_LAYER_IDS['traffic'].source,
      layout: { visibility: 'none', 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': [
          'match', ['get', 'congestion'],
          'smooth', '#66BB6A',
          'slow', '#FFA726',
          'congested', '#EF5350',
          '#8A8680',
        ],
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 14, 5],
        'line-opacity': 0.8,
      },
    });

    // Weather forecast layers
    map.addLayer({
      id: 'weather-temp-heatmap',
      type: 'heatmap',
      source: PUBLIC_LAYER_IDS['weather-forecast'].source,
      layout: { visibility: 'none' },
      maxzoom: 12,
      paint: {
        'heatmap-weight': [
          'interpolate', ['linear'], ['get', 'temperature'],
          -10, 0, 0, 0.3, 15, 0.5, 25, 0.8, 35, 1,
        ],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 5, 0.6, 10, 1],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, 'rgba(33,102,172,0.4)',
          0.4, 'rgba(103,169,207,0.5)',
          0.6, 'rgba(253,219,199,0.5)',
          0.8, 'rgba(239,138,98,0.6)',
          1, 'rgba(178,24,43,0.7)',
        ],
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 5, 30, 10, 50],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.6, 12, 0],
      },
    });

    map.addLayer({
      id: 'weather-precip-ring',
      type: 'circle',
      source: PUBLIC_LAYER_IDS['weather-forecast'].source,
      layout: { visibility: 'none' },
      filter: ['>', ['get', 'precipitation'], 0],
      paint: {
        'circle-radius': 14,
        'circle-color': 'rgba(0,0,0,0)',
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#42A5F5',
        'circle-stroke-opacity': 0,
      },
    });

    map.addLayer({
      id: 'weather-forecast-circle',
      type: 'circle',
      source: PUBLIC_LAYER_IDS['weather-forecast'].source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 6, 10, 10, 14, 16],
        'circle-color': [
          'match', ['get', 'sky'],
          'clear', SKY_COLORS.clear,
          'partly_cloudy', SKY_COLORS.partly_cloudy,
          'cloudy', SKY_COLORS.cloudy,
          'overcast', SKY_COLORS.overcast,
          SKY_COLORS.partly_cloudy,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(14,14,16,0.7)',
        'circle-opacity': 0.85,
      },
    });

    map.addLayer({
      id: 'weather-forecast-label',
      type: 'symbol',
      source: PUBLIC_LAYER_IDS['weather-forecast'].source,
      layout: {
        visibility: 'none',
        'text-field': ['concat', ['to-string', ['get', 'temperature']], '°'],
        'text-size': 11,
        'text-font': ['DIN Pro Bold', 'Arial Unicode MS Regular'],
        'text-offset': [0, 0],
        'text-anchor': 'center',
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#0E0E10',
        'text-halo-color': 'rgba(255,255,255,0.3)',
        'text-halo-width': 0.5,
      },
    });

    // Wildfire layers
    map.addLayer({
      id: 'wildfire-glow',
      type: 'circle',
      source: PUBLIC_LAYER_IDS['wildfire'].source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': [
          'case',
          ['==', ['get', 'status'], 'active'],
          ['interpolate', ['linear'], ['get', 'affectedArea'],
            5, 18, 50, 28, 100, 38, 200, 48,
          ],
          ['interpolate', ['linear'], ['get', 'affectedArea'],
            5, 10, 50, 16, 100, 24, 200, 32,
          ],
        ],
        'circle-color': [
          'match', ['get', 'status'],
          'active', '#FF3D00',
          'contained', '#FF9100',
          'extinguished', '#66BB6A',
          '#FF3D00',
        ],
        'circle-blur': 1,
        'circle-opacity': [
          'case',
          ['==', ['get', 'status'], 'active'], 0.2,
          0.06,
        ],
      },
    });

    map.addLayer({
      id: 'wildfire-circle',
      type: 'circle',
      source: PUBLIC_LAYER_IDS['wildfire'].source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': [
          'interpolate', ['linear'],
          ['get', 'affectedArea'],
          5, 6,
          50, 12,
          100, 18,
          200, 24,
        ],
        'circle-color': [
          'match', ['get', 'status'],
          'active', WILDFIRE_STATUS_COLORS.active,
          'contained', WILDFIRE_STATUS_COLORS.contained,
          'extinguished', WILDFIRE_STATUS_COLORS.extinguished,
          WILDFIRE_STATUS_COLORS.active,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(14,14,16,0.7)',
        'circle-opacity': [
          'match', ['get', 'status'],
          'active', 0.9,
          'contained', 0.7,
          'extinguished', 0.5,
          0.7,
        ],
      },
    });

    map.addLayer({
      id: 'wildfire-label',
      type: 'symbol',
      source: PUBLIC_LAYER_IDS['wildfire'].source,
      layout: {
        visibility: 'none',
        'text-field': ['get', 'name'],
        'text-size': 10,
        'text-offset': [0, 2.0],
        'text-anchor': 'top',
        'text-max-width': 10,
      },
      minzoom: 7,
      paint: {
        'text-color': '#E8E4DF',
        'text-halo-color': 'rgba(14,14,16,0.8)',
        'text-halo-width': 1,
      },
    });

    // Earthquake layers — ripple rings (animated)
    for (let i = 3; i >= 1; i--) {
      map.addLayer({
        id: `earthquake-ripple-${i}`,
        type: 'circle',
        source: PUBLIC_LAYER_IDS['earthquake'].source,
        layout: { visibility: 'none' },
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['get', 'magnitude'],
            2.0, 6, 3.0, 10, 4.0, 16, 5.0, 24,
          ],
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': [
            'interpolate', ['linear'], ['get', 'magnitude'],
            2.0, '#FFD54F', 3.0, '#FF9800', 4.0, '#F44336', 5.0, '#B71C1C',
          ],
          'circle-opacity': 0,
        },
      });
    }

    map.addLayer({
      id: 'earthquake-circle',
      type: 'circle',
      source: PUBLIC_LAYER_IDS['earthquake'].source,
      layout: { visibility: 'none' },
      paint: {
        'circle-radius': [
          'interpolate', ['linear'],
          ['get', 'magnitude'],
          2.0, 6,
          3.0, 10,
          4.0, 16,
          5.0, 24,
        ],
        'circle-color': [
          'interpolate', ['linear'],
          ['get', 'magnitude'],
          2.0, '#FFD54F',
          3.0, '#FF9800',
          4.0, '#F44336',
          5.0, '#B71C1C',
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(14,14,16,0.7)',
        'circle-opacity': 0.8,
      },
    });

    map.addLayer({
      id: 'earthquake-label',
      type: 'symbol',
      source: PUBLIC_LAYER_IDS['earthquake'].source,
      layout: {
        visibility: 'none',
        'text-field': ['concat', 'M', ['to-string', ['get', 'magnitude']]],
        'text-size': 11,
        'text-font': ['DIN Pro Bold', 'Arial Unicode MS Regular'],
        'text-offset': [0, 0],
        'text-anchor': 'center',
        'text-allow-overlap': true,
      },
      paint: {
        'text-color': '#FFFFFF',
        'text-halo-color': 'rgba(14,14,16,0.6)',
        'text-halo-width': 1,
      },
    });

    if (map.getSource('composite')) {
      map.addLayer({
        id: 'buildings-3d-extrusion',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        layout: { visibility: 'none' },
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#1a1a1f',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.7,
          'fill-extrusion-vertical-gradient': true,
        },
      });
    }

    const createPublicPopup = async (map: mapboxgl.Map, e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }, type: 'air' | 'aws') => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      const props = feature.properties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

      const popupEl = document.createElement('div');
      popupEl.style.cssText = 'max-width:240px;font-family:var(--font-pretendard),sans-serif;';

      if (type === 'air') {
        const gradeColor = AIR_QUALITY_COLORS[props.grade] ?? AIR_QUALITY_COLORS.moderate;
        const gradeLabel: Record<string, string> = { good: '좋음', moderate: '보통', unhealthy: '나쁨', very_unhealthy: '매우나쁨', hazardous: '위험' };
        popupEl.innerHTML = `
          <div style="padding:8px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${gradeColor}"></span>
              <span style="font-size:13px;font-weight:600;color:#E8E4DF;">${props.name}</span>
            </div>
            <div style="font-size:11px;color:#8A8680;line-height:1.8;">
              <span style="color:${gradeColor};font-weight:500;">${gradeLabel[props.grade] ?? props.grade}</span><br/>
              PM2.5 <b style="color:#E8E4DF">${props.pm25 ?? '-'}</b> ㎍/㎥ · PM10 <b style="color:#E8E4DF">${props.pm10 ?? '-'}</b> ㎍/㎥
            </div>
          </div>
        `;
      } else {
        popupEl.innerHTML = `
          <div style="padding:8px;">
            <p style="font-size:13px;font-weight:600;color:#E8E4DF;margin:0 0 6px;">${props.name}</p>
            <div style="font-size:11px;color:#8A8680;line-height:1.8;font-family:'IBM Plex Mono',monospace;">
              🌡️ ${props.temp ?? '-'}°C · 💧 ${props.humidity ?? '-'}%<br/>
              💨 ${props.windSpeed ?? '-'} m/s · 🌧️ ${props.rainfall1h ?? '0'} mm
            </div>
          </div>
        `;
      }

      const mapboxgl = await import('mapbox-gl');
      new mapboxgl.Popup({ closeButton: true, maxWidth: '260px', className: 'ep-popup' })
        .setLngLat(coords)
        .setDOMContent(popupEl)
        .addTo(map);
    };

    map.on('click', 'air-quality-circle', (e) => createPublicPopup(map, e, 'air'));
    map.on('click', 'aws-weather-circle', (e) => createPublicPopup(map, e, 'aws'));

    map.on('click', 'weather-forecast-circle', async (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      const props = feature.properties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      const skyColor = SKY_COLORS[props.sky] ?? SKY_COLORS.partly_cloudy;
      const skyLabel = SKY_LABELS[props.sky] ?? props.sky;
      const precipLabel = props.precipitation === 'none' ? '' : props.precipitation === 'rain' ? '비' : props.precipitation === 'snow' ? '눈' : props.precipitation === 'rain_snow' ? '비/눈' : '소나기';

      const popupEl = document.createElement('div');
      popupEl.style.cssText = 'max-width:240px;font-family:var(--font-pretendard),sans-serif;';
      popupEl.innerHTML = `
        <div style="padding:8px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${skyColor}"></span>
            <span style="font-size:13px;font-weight:600;color:#E8E4DF;">${props.name}</span>
          </div>
          <div style="font-size:11px;color:#8A8680;line-height:1.8;">
            <span style="color:${skyColor};font-weight:500;">${skyLabel}</span>${precipLabel ? ` · ${precipLabel}` : ''}<br/>
            🌡️ <b style="color:#E8E4DF">${props.temperature ?? '-'}°C</b> · 💧 ${props.humidity ?? '-'}%<br/>
            💨 ${props.windSpeed ?? '-'} m/s${props.precipAmount > 0 ? ` · 🌧️ ${props.precipAmount} mm` : ''}
          </div>
        </div>
      `;

      const mapboxgl = await import('mapbox-gl');
      new mapboxgl.Popup({ closeButton: true, maxWidth: '260px', className: 'ep-popup' })
        .setLngLat(coords).setDOMContent(popupEl).addTo(map);
    });

    map.on('click', 'wildfire-circle', async (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      const props = feature.properties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      const statusColor = WILDFIRE_STATUS_COLORS[props.status] ?? WILDFIRE_STATUS_COLORS.active;
      const statusLabel = WILDFIRE_STATUS_LABELS[props.status] ?? props.status;

      const popupEl = document.createElement('div');
      popupEl.style.cssText = 'max-width:260px;font-family:var(--font-pretendard),sans-serif;';
      popupEl.innerHTML = `
        <div style="padding:8px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${statusColor}"></span>
            <span style="font-size:11px;font-weight:500;color:${statusColor};">${statusLabel}</span>
          </div>
          <p style="font-size:13px;font-weight:600;color:#E8E4DF;margin:0 0 4px;">${props.name}</p>
          <p style="font-size:11px;color:#8A8680;margin:0 0 6px;line-height:1.5;">${props.description ?? ''}</p>
          <div style="font-size:11px;color:#8A8680;font-family:'IBM Plex Mono',monospace;">
            피해면적 ${props.affectedArea} ha · ${props.startedAt?.slice(0, 10) ?? ''}
          </div>
        </div>
      `;

      const mapboxgl = await import('mapbox-gl');
      new mapboxgl.Popup({ closeButton: true, maxWidth: '280px', className: 'ep-popup' })
        .setLngLat(coords).setDOMContent(popupEl).addTo(map);
    });

    map.on('click', 'earthquake-circle', async (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      const props = feature.properties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

      const popupEl = document.createElement('div');
      popupEl.style.cssText = 'max-width:260px;font-family:var(--font-pretendard),sans-serif;';
      popupEl.innerHTML = `
        <div style="padding:8px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#D32F2F"></span>
            <span style="font-size:11px;font-weight:500;color:#EF5350;">규모 ${props.magnitude} · 진도 ${props.maxIntensity}</span>
          </div>
          <p style="font-size:13px;font-weight:600;color:#E8E4DF;margin:0 0 4px;">${props.location}</p>
          <div style="font-size:11px;color:#8A8680;font-family:'IBM Plex Mono',monospace;line-height:1.8;">
            깊이 ${props.depth} km<br/>
            ${props.occurredAt?.replace('T', ' ') ?? ''}
          </div>
        </div>
      `;

      const mapboxgl = await import('mapbox-gl');
      new mapboxgl.Popup({ closeButton: true, maxWidth: '280px', className: 'ep-popup' })
        .setLngLat(coords).setDOMContent(popupEl).addTo(map);
    });

    (['air-quality-circle', 'aws-weather-circle', 'weather-forecast-circle', 'wildfire-circle', 'earthquake-circle'] as const).forEach((layerId) => {
      map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = ''; });
    });
  }, []);

  const fetchPublicLayerData = useCallback(async (layerId: PublicLayerId) => {
    const endpoint = `/api/layers/${layerId}`;
    try {
      const res = await fetch(endpoint);
      if (!res.ok) return null;
      const geojson = await res.json() as GeoJSON.FeatureCollection;
      return geojson;
    } catch {
      return null;
    }
  }, []);

  const addCitadelOverlay = useCallback((map: mapboxgl.Map) => {
    const polygons: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: CITADEL_GEOJSON.features.filter(
        (f) => f.geometry.type === 'Polygon',
      ),
    };

    const points: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: CITADEL_GEOJSON.features.map((f) => {
        if (f.geometry.type === 'Point') return f as GeoJSON.Feature;
        const coords = (f.geometry as GeoJSON.Polygon).coordinates[0];
        const center = coords.reduce(
          (acc, c) => [acc[0] + c[0] / coords.length, acc[1] + c[1] / coords.length],
          [0, 0],
        );
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: center },
          properties: f.properties,
        } as GeoJSON.Feature;
      }),
    };

    map.addSource(CITADEL_SOURCE_ID, { type: 'geojson', data: polygons });
    map.addSource(`${CITADEL_SOURCE_ID}-points`, { type: 'geojson', data: points });

    map.addLayer({
      id: CITADEL_FILL_LAYER,
      type: 'fill',
      source: CITADEL_SOURCE_ID,
      paint: {
        'fill-color': [
          'match',
          ['get', 'severity'],
          'critical', SEVERITY_COLORS.critical,
          'high', SEVERITY_COLORS.high,
          'moderate', SEVERITY_COLORS.moderate,
          'low', SEVERITY_COLORS.low,
          SEVERITY_COLORS.moderate,
        ],
        'fill-opacity': 0.15,
      },
    });

    map.addLayer({
      id: CITADEL_OUTLINE_LAYER,
      type: 'line',
      source: CITADEL_SOURCE_ID,
      paint: {
        'line-color': [
          'match',
          ['get', 'severity'],
          'critical', SEVERITY_COLORS.critical,
          'high', SEVERITY_COLORS.high,
          'moderate', SEVERITY_COLORS.moderate,
          'low', SEVERITY_COLORS.low,
          SEVERITY_COLORS.moderate,
        ],
        'line-width': 1.5,
        'line-opacity': 0.6,
      },
    });

    map.addLayer({
      id: CITADEL_POINT_LAYER,
      type: 'circle',
      source: `${CITADEL_SOURCE_ID}-points`,
      paint: {
        'circle-radius': 6,
        'circle-color': [
          'match',
          ['get', 'severity'],
          'critical', SEVERITY_COLORS.critical,
          'high', SEVERITY_COLORS.high,
          'moderate', SEVERITY_COLORS.moderate,
          'low', SEVERITY_COLORS.low,
          SEVERITY_COLORS.moderate,
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': 'rgba(14,14,16,0.6)',
      },
    });

    map.addLayer({
      id: CITADEL_LABEL_LAYER,
      type: 'symbol',
      source: `${CITADEL_SOURCE_ID}-points`,
      layout: {
        'text-field': ['get', 'title'],
        'text-size': 11,
        'text-offset': [0, 1.5],
        'text-anchor': 'top',
        'text-max-width': 14,
      },
      paint: {
        'text-color': '#E8E4DF',
        'text-halo-color': 'rgba(14,14,16,0.8)',
        'text-halo-width': 1,
      },
    });

    map.on('click', CITADEL_POINT_LAYER, async (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      const props = feature.properties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

      const popupEl = document.createElement('div');
      popupEl.style.cssText = 'max-width:260px;font-family:var(--font-pretendard),sans-serif;';
      const sevColor = SEVERITY_COLORS[props.severity as CitadelSeverity] ?? SEVERITY_COLORS.moderate;
      popupEl.innerHTML = `
        <div style="padding:8px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${sevColor}"></span>
            <span style="font-size:11px;font-weight:500;color:#E8E4DF;">${props.severity} · ${props.event_type}</span>
          </div>
          <p style="font-size:13px;font-weight:600;color:#E8E4DF;margin:0 0 4px;">${props.title}</p>
          <p style="font-size:11px;color:#8A8680;margin:0 0 6px;line-height:1.5;">${props.description ?? ''}</p>
          <div style="font-size:11px;color:#8A8680;font-family:'IBM Plex Mono',monospace;">
            ${props.location_name} · ${props.source ?? ''}
          </div>
        </div>
      `;

      const mapboxgl = await import('mapbox-gl');
      new mapboxgl.Popup({
        closeButton: true,
        maxWidth: '280px',
        className: 'ep-popup',
      })
        .setLngLat(coords)
        .setDOMContent(popupEl)
        .addTo(map);
    });

    map.on('mouseenter', CITADEL_POINT_LAYER, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', CITADEL_POINT_LAYER, () => {
      map.getCanvas().style.cursor = '';
    });
  }, []);

  const handleMapReady = useCallback(
    (map: mapboxgl.Map) => {
      mapRef.current = map;
      addCitadelOverlay(map);
      addPublicDataLayers(map);

      if (!animRef.current) {
        animRef.current = new LayerAnimationController();
      }
      animRef.current.attach(map);

      setLayers((prev) => {
        prev.forEach((l) => {
          if (l.id === 'citadel' && !l.enabled) {
            [CITADEL_FILL_LAYER, CITADEL_OUTLINE_LAYER, CITADEL_POINT_LAYER, CITADEL_LABEL_LAYER].forEach((id) => {
              if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
            });
          }
          const pubConfig = PUBLIC_LAYER_IDS[l.id as PublicLayerId];
          if (pubConfig && l.enabled) {
            fetchPublicLayerData(l.id as PublicLayerId).then((geojson) => {
              if (!geojson || !pubConfig.source) return;
              const source = map.getSource(pubConfig.source) as mapboxgl.GeoJSONSource | undefined;
              if (source) source.setData(geojson);
              pubConfig.layers.forEach((layerId) => {
                if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'visibility', 'visible');
              });
              const animId = LAYER_ANIMATION_MAP[l.id];
              if (animId && animRef.current) animRef.current.start(animId);
            });
          }
        });
        return prev;
      });
    },
    [addCitadelOverlay, addPublicDataLayers, fetchPublicLayerData],
  );

  const handleLayerToggle = useCallback(
    async (layerId: string) => {
      const wasEnabled = layerEnabledRef.current[layerId] ?? false;
      const turning_on = !wasEnabled;
      layerEnabledRef.current[layerId] = turning_on;

      trackEvent('layer_toggle', layerId, { enabled: turning_on });

      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? { ...l, enabled: turning_on } : l)),
      );

      if (layerId === 'citadel' && mapRef.current) {
        const map = mapRef.current;
        const newVisibility = turning_on ? 'visible' : 'none';

        [CITADEL_FILL_LAYER, CITADEL_OUTLINE_LAYER, CITADEL_POINT_LAYER, CITADEL_LABEL_LAYER].forEach(
          (id) => {
            if (map.getLayer(id)) {
              map.setLayoutProperty(id, 'visibility', newVisibility);
            }
          },
        );
      }

      const publicLayerConfig = PUBLIC_LAYER_IDS[layerId as PublicLayerId];
      if (publicLayerConfig && mapRef.current) {
        const map = mapRef.current;

        if (turning_on && !layerDataCache.current[layerId]) {
          const geojson = await fetchPublicLayerData(layerId as PublicLayerId);
          if (geojson) {
            layerDataCache.current[layerId] = geojson;
            if (publicLayerConfig.source) {
              const source = map.getSource(publicLayerConfig.source) as mapboxgl.GeoJSONSource | undefined;
              if (source) {
                source.setData(geojson);
                setLayers((prev) =>
                  prev.map((l) => l.id === layerId ? { ...l, featureCount: geojson.features.length } : l),
                );
              }
            }
          }
        }

        publicLayerConfig.layers.forEach((mapLayerId) => {
          if (map.getLayer(mapLayerId)) {
            map.setLayoutProperty(mapLayerId, 'visibility', turning_on ? 'visible' : 'none');
          }
        });

        const animId = LAYER_ANIMATION_MAP[layerId];
        if (animId && animRef.current) {
          if (turning_on) {
            animRef.current.start(animId);
          } else {
            animRef.current.stop(animId);
          }
        }
      }
    },
    [fetchPublicLayerData],
  );

  const handlePurchase = useCallback(async () => {
    if (!aoi || aoi.validationError || !catalogItemId) return;
    setPurchasing(true);

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogItemId,
          aoi: aoi.polygon,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || '주문 생성 실패');
        setPurchasing(false);
        return;
      }

      const { orderId, amount, orderName } = await res.json();
      await requestTossPayment({
        orderId,
        amount,
        orderName,
        customerEmail: userEmail,
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes('canceled')) {
        // User cancelled payment
      } else {
        alert('결제 처리 중 오류가 발생했습니다');
      }
      setPurchasing(false);
    }
  }, [aoi, catalogItemId, supabase]);

  return (
    <div className="flex" style={{ height: 'calc(100vh - var(--header-height))' }}>
      {/* Map */}
      <div className="flex-1 relative">
        <EarthMap
          onAoiChange={handleAoiChange}
          satellite={satellite}
          onCatalogSelect={handleCatalogSelect}
          onMapReady={handleMapReady}
          mapStyleId={mapStyleId}
        />

        {/* Map style switcher */}
        <div
          className="absolute bottom-4 right-4 flex gap-1 p-1 rounded-lg z-10"
          style={{
            background: 'rgba(14,14,16,0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
          }}
        >
          {(Object.entries(MAP_STYLES) as [MapStyleId, typeof MAP_STYLES[MapStyleId]][]).map(([id, style]) => (
            <button
              key={id}
              onClick={() => {
                setMapStyleId(id);
                trackEvent('map_style_change', id, {});
              }}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                background: mapStyleId === id ? 'var(--surface-elevated)' : 'transparent',
                color: mapStyleId === id ? 'var(--text)' : 'var(--text-muted)',
                border: mapStyleId === id ? '1px solid var(--border)' : '1px solid transparent',
              }}
              title={style.label}
            >
              <span className="mr-1">{style.icon}</span>
              {style.label}
            </button>
          ))}
        </div>

        {/* Active layers indicator */}
        <div
          className="absolute top-3 left-14 flex gap-1.5 z-10"
        >
          {layers
            .filter((l) => l.enabled && !l.comingSoon)
            .map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs"
                style={{
                  background: 'rgba(14,14,16,0.85)',
                  backdropFilter: 'blur(8px)',
                  color: 'var(--text)',
                  border: `1px solid ${l.color}33`,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: l.color }}
                />
                {l.label}
                <span style={{ color: 'var(--text-muted)' }}>
                  {l.featureCount}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Sidebar */}
      <div
        className="w-80 flex flex-col border-l"
        style={{
          background: 'rgba(14,14,16,0.95)',
          backdropFilter: 'blur(12px)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setSidebarTab('layers')}
            className="flex-1 py-3 text-sm font-medium transition-colors"
            style={{
              color: sidebarTab === 'layers' ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: sidebarTab === 'layers' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            레이어
          </button>
          <button
            onClick={() => setSidebarTab('purchase')}
            className="flex-1 py-3 text-sm font-medium transition-colors"
            style={{
              color: sidebarTab === 'purchase' ? 'var(--text)' : 'var(--text-muted)',
              borderBottom: sidebarTab === 'purchase' ? '2px solid var(--accent)' : '2px solid transparent',
            }}
          >
            영상 구매
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4">
          {sidebarTab === 'layers' ? (
            <div className="space-y-6">
              <LayerPanel layers={layers} onToggle={handleLayerToggle} />

              {/* Legend */}
              <div>
                <h3
                  className="text-xs font-mono tracking-wider uppercase mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Severity
                </h3>
                <div className="space-y-1">
                  {(['critical', 'high', 'moderate', 'low'] as const).map((sev) => (
                    <div key={sev} className="flex items-center gap-2 px-2.5 py-1">
                      <span
                        className="w-2 h-2 rounded-sm"
                        style={{ background: SEVERITY_COLORS[sev] }}
                      />
                      <span
                        className="text-xs capitalize"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {sev}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Air Quality Legend */}
              {layers.find((l) => l.id === 'air-quality')?.enabled && (
                <div>
                  <h3
                    className="text-xs font-mono tracking-wider uppercase mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    대기질 등급
                  </h3>
                  <div className="space-y-1">
                    {([
                      ['good', '좋음'],
                      ['moderate', '보통'],
                      ['unhealthy', '나쁨'],
                      ['very_unhealthy', '매우나쁨'],
                      ['hazardous', '위험'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2 px-2.5 py-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: AIR_QUALITY_COLORS[key] }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weather Forecast Legend */}
              {layers.find((l) => l.id === 'weather-forecast')?.enabled && (
                <div>
                  <h3
                    className="text-xs font-mono tracking-wider uppercase mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    하늘 상태
                  </h3>
                  <div className="space-y-1">
                    {([
                      ['clear', '맑음'],
                      ['partly_cloudy', '구름조금'],
                      ['cloudy', '구름많음'],
                      ['overcast', '흐림'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2 px-2.5 py-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: SKY_COLORS[key] }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wildfire Legend */}
              {layers.find((l) => l.id === 'wildfire')?.enabled && (
                <div>
                  <h3
                    className="text-xs font-mono tracking-wider uppercase mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    산불 상태
                  </h3>
                  <div className="space-y-1">
                    {([
                      ['active', '진화중'],
                      ['contained', '진화거의완료'],
                      ['extinguished', '진화완료'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-2 px-2.5 py-1">
                        <span
                          className="w-2 h-2 rounded-sm"
                          style={{ background: WILDFIRE_STATUS_COLORS[key] }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Earthquake Legend */}
              {layers.find((l) => l.id === 'earthquake')?.enabled && (
                <div>
                  <h3
                    className="text-xs font-mono tracking-wider uppercase mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    지진 규모
                  </h3>
                  <div className="space-y-1">
                    {([
                      [2.0, '#FFD54F', '2.0+'],
                      [3.0, '#FF9800', '3.0+'],
                      [4.0, '#F44336', '4.0+'],
                      [5.0, '#B71C1C', '5.0+'],
                    ] as const).map(([mag, color, label]) => (
                      <div key={mag} className="flex items-center gap-2 px-2.5 py-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: color }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Citadel Events list */}
              {layers.find((l) => l.id === 'citadel')?.enabled && (
                <div>
                  <h3
                    className="text-xs font-mono tracking-wider uppercase mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Active Events
                  </h3>
                  <div className="space-y-2">
                    {CITADEL_GEOJSON.features.map((f) => {
                      const sev = f.properties.severity as CitadelSeverity;
                      return (
                        <button
                          key={f.properties.id}
                          onClick={() => {
                            if (!mapRef.current) return;
                            const geom = f.geometry;
                            if (geom.type === 'Point') {
                              mapRef.current.flyTo({
                                center: geom.coordinates as [number, number],
                                zoom: 8,
                              });
                            } else if (geom.type === 'Polygon') {
                              const coords = (geom as GeoJSON.Polygon).coordinates[0];
                              const center = coords.reduce(
                                (acc, c) => [acc[0] + c[0] / coords.length, acc[1] + c[1] / coords.length],
                                [0, 0],
                              );
                              mapRef.current.flyTo({
                                center: center as [number, number],
                                zoom: 10,
                              });
                            }
                          }}
                          className="w-full text-left p-2.5 rounded-md transition-colors"
                          style={{ background: 'var(--surface)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--surface-elevated)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'var(--surface)';
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: SEVERITY_COLORS[sev] }}
                            />
                            <span
                              className="text-xs font-mono"
                              style={{ color: SEVERITY_COLORS[sev] }}
                            >
                              {f.properties.severity} &middot; {f.properties.event_type}
                            </span>
                          </div>
                          <p
                            className="text-sm font-medium line-clamp-1"
                            style={{ color: 'var(--text)' }}
                          >
                            {f.properties.title}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {f.properties.location_name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <AoiPanel
                aoi={aoi}
                satellite={satellite}
                onSatelliteChange={setSatellite}
                onPurchase={handlePurchase}
                purchasing={purchasing}
                hasCatalogItem={!!catalogItemId}
                bare
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
