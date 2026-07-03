'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import type mapboxgl from 'mapbox-gl';
import AoiPanel from '@/components/map/AoiPanel';
import LayerPanel from '@/components/core/LayerPanel';
import type { OverlayLayer } from '@/components/core/LayerPanel';
import { SEVERITY_COLORS } from '@/components/core/LayerPanel';
import { TEMPEST_GEOJSON } from '@/lib/mock-tempest';
import type { SatelliteType } from '@/types/database';
import type { TempestSeverity } from '@/types/tempest';
import { createClient } from '@/lib/supabase/client';
import { requestTossPayment } from '@/lib/toss/widget';

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

const INITIAL_LAYERS: OverlayLayer[] = [
  {
    id: 'tempest',
    label: 'Tempest',
    color: '#C45C4A',
    enabled: true,
    featureCount: TEMPEST_GEOJSON.features.length,
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

const TEMPEST_SOURCE_ID = 'tempest-overlay';
const TEMPEST_FILL_LAYER = 'tempest-overlay-fill';
const TEMPEST_OUTLINE_LAYER = 'tempest-overlay-outline';
const TEMPEST_POINT_LAYER = 'tempest-overlay-point';
const TEMPEST_LABEL_LAYER = 'tempest-overlay-label';

export default function CorePage() {
  const [satellite, setSatellite] = useState<SatelliteType>('observer');
  const [aoi, setAoi] = useState<AoiSelection | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [catalogItemId, setCatalogItemId] = useState<string | null>(null);
  const [layers, setLayers] = useState<OverlayLayer[]>(INITIAL_LAYERS);
  const [sidebarTab, setSidebarTab] = useState<'layers' | 'purchase'>('layers');
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const handleAoiChange = useCallback((newAoi: AoiSelection | null) => {
    setAoi(newAoi);
    if (newAoi) setSidebarTab('purchase');
  }, []);

  const handleCatalogSelect = useCallback((itemId: string) => {
    setCatalogItemId(itemId);
  }, []);

  const addTempestOverlay = useCallback((map: mapboxgl.Map) => {
    const polygons: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: TEMPEST_GEOJSON.features.filter(
        (f) => f.geometry.type === 'Polygon',
      ),
    };

    const points: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: TEMPEST_GEOJSON.features.map((f) => {
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

    map.addSource(TEMPEST_SOURCE_ID, { type: 'geojson', data: polygons });
    map.addSource(`${TEMPEST_SOURCE_ID}-points`, { type: 'geojson', data: points });

    map.addLayer({
      id: TEMPEST_FILL_LAYER,
      type: 'fill',
      source: TEMPEST_SOURCE_ID,
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
      id: TEMPEST_OUTLINE_LAYER,
      type: 'line',
      source: TEMPEST_SOURCE_ID,
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
      id: TEMPEST_POINT_LAYER,
      type: 'circle',
      source: `${TEMPEST_SOURCE_ID}-points`,
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
      id: TEMPEST_LABEL_LAYER,
      type: 'symbol',
      source: `${TEMPEST_SOURCE_ID}-points`,
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

    map.on('click', TEMPEST_POINT_LAYER, async (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      const props = feature.properties;
      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

      const popupEl = document.createElement('div');
      popupEl.style.cssText = 'max-width:260px;font-family:var(--font-pretendard),sans-serif;';
      const sevColor = SEVERITY_COLORS[props.severity as TempestSeverity] ?? SEVERITY_COLORS.moderate;
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

    map.on('mouseenter', TEMPEST_POINT_LAYER, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', TEMPEST_POINT_LAYER, () => {
      map.getCanvas().style.cursor = '';
    });
  }, []);

  const handleMapReady = useCallback(
    (map: mapboxgl.Map) => {
      mapRef.current = map;
      addTempestOverlay(map);
    },
    [addTempestOverlay],
  );

  const handleLayerToggle = useCallback(
    (layerId: string) => {
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? { ...l, enabled: !l.enabled } : l)),
      );

      if (layerId === 'tempest' && mapRef.current) {
        const map = mapRef.current;
        const tempestLayer = layers.find((l) => l.id === 'tempest');
        const newVisibility = tempestLayer?.enabled ? 'none' : 'visible';

        [TEMPEST_FILL_LAYER, TEMPEST_OUTLINE_LAYER, TEMPEST_POINT_LAYER, TEMPEST_LABEL_LAYER].forEach(
          (id) => {
            if (map.getLayer(id)) {
              map.setLayoutProperty(id, 'visibility', newVisibility);
            }
          },
        );
      }
    },
    [layers],
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await requestTossPayment({
        orderId,
        amount,
        orderName,
        customerEmail: user?.email || 'anonymous',
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
        />

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

              {/* Tempest Events list */}
              {layers.find((l) => l.id === 'tempest')?.enabled && (
                <div>
                  <h3
                    className="text-xs font-mono tracking-wider uppercase mb-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Active Events
                  </h3>
                  <div className="space-y-2">
                    {TEMPEST_GEOJSON.features.map((f) => {
                      const sev = f.properties.severity as TempestSeverity;
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
