'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { calculateAreaKm2, calculatePrice, validateAoi } from '@/lib/geo';
import { createCircuitBreaker } from '@/lib/circuit-breaker';
import type { SatelliteType, CatalogItem } from '@/types/database';
import { applyDarkStyleOverrides, applyLightStyleOverrides, applyLocalizedLabels } from '@/lib/map-style-overrides';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface AoiSelection {
  polygon: GeoJSON.Polygon;
  areaKm2: number;
  price: number;
  satellite: SatelliteType;
  validationError: string | null;
}

export type MapStyleId = 'satellite' | 'dark' | 'night-nav' | 'light';

export const MAP_STYLES: Record<MapStyleId, { url: string; label: string; icon: string }> = {
  satellite: { url: 'mapbox://styles/mapbox/satellite-streets-v12', label: '위성', icon: '🛰️' },
  dark: { url: 'mapbox://styles/mapbox/dark-v11', label: '다크', icon: '🌑' },
  'night-nav': { url: 'mapbox://styles/mapbox/navigation-night-v1', label: '야간', icon: '🗺️' },
  light: { url: 'mapbox://styles/mapbox/light-v11', label: '라이트', icon: '☀️' },
};

/** Style switcher options. Light is Core-only — other pages stay dark-first. */
export const CORE_STYLE_IDS: MapStyleId[] = ['satellite', 'dark', 'night-nav', 'light'];
export const DEFAULT_STYLE_IDS: MapStyleId[] = ['satellite', 'dark', 'night-nav'];

interface EarthMapProps {
  onAoiChange?: (aoi: AoiSelection | null) => void;
  satellite?: SatelliteType;
  onCatalogSelect?: (itemId: string) => void;
  onMapReady?: (map: mapboxgl.Map) => void;
  mapStyleId?: MapStyleId;
  hideControls?: boolean;
  initialStyle?: MapStyleId;
  center?: [number, number];
  zoom?: number;
}

function applyStyleOverridesFor(styleId: MapStyleId, map: mapboxgl.Map) {
  applyLocalizedLabels(map);
  if (styleId === 'dark') applyDarkStyleOverrides(map);
  else if (styleId === 'light') applyLightStyleOverrides(map);
}

// Design tokens for map layers
const ACCENT = '#1bbfa8';
const ACCENT_DIM = 'rgba(27, 191, 168, 0.15)';
const ACCENT_BORDER = 'rgba(27, 191, 168, 0.6)';

export default function EarthMap({
  onAoiChange,
  satellite = 'observer',
  onCatalogSelect,
  onMapReady,
  mapStyleId = 'satellite',
  hideControls = false,
  initialStyle,
  center: initialCenter,
  zoom: initialZoom,
}: EarthMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A dead backend takes up to ~12s to fail, so moveend-triggered searches
  // pile up in flight; the breaker + in-flight guard stop the pileup.
  const searchBreaker = useRef(
    createCircuitBreaker({ threshold: 3, cooldownMs: 60_000 })
  );
  const searchInFlight = useRef(false);
  const searchQueued = useRef(false);

  const handleDrawUpdate = useCallback(() => {
    if (!draw.current) return;

    const data = draw.current.getAll();
    if (data.features.length === 0) {
      onAoiChange?.(null);
      return;
    }

    const feature = data.features[data.features.length - 1];
    if (feature.geometry.type !== 'Polygon') return;

    const polygon = feature.geometry as GeoJSON.Polygon;
    const areaKm2 = calculateAreaKm2(polygon);
    const price = calculatePrice(areaKm2, satellite);
    const validationError = validateAoi(areaKm2, satellite);

    onAoiChange?.({
      polygon,
      areaKm2,
      price,
      satellite,
      validationError,
    });
  }, [onAoiChange, satellite]);

  const searchCatalog = useCallback(async () => {
    if (searchInFlight.current) {
      // Don't stack requests; re-run once after the current one settles.
      searchQueued.current = true;
      return;
    }

    searchInFlight.current = true;
    try {
      do {
        searchQueued.current = false;
        if (!map.current) return;
        if (!searchBreaker.current.canRequest(Date.now())) return;

        const bounds = map.current.getBounds();
        if (!bounds) return;
        const params = new URLSearchParams({
          west: bounds.getWest().toString(),
          south: bounds.getSouth().toString(),
          east: bounds.getEast().toString(),
          north: bounds.getNorth().toString(),
          satellite,
        });

        try {
          const res = await fetch(`/api/catalog/search?${params}`);
          if (!res.ok) {
            searchBreaker.current.recordFailure(Date.now());
            return;
          }
          const data = await res.json();
          searchBreaker.current.recordSuccess();
          setCatalogItems(data.items || []);

          if (data.items?.length > 0 && !selectedItemId) {
            setSelectedItemId(data.items[0].id);
            onCatalogSelect?.(data.items[0].id);
          }
        } catch {
          // Silent fail on catalog search; drop any queued re-run too —
          // moveend will retry, and the breaker caps consecutive failures.
          searchBreaker.current.recordFailure(Date.now());
          return;
        }
      } while (searchQueued.current);
    } finally {
      searchInFlight.current = false;
      searchQueued.current = false;
    }
  }, [satellite, selectedItemId, onCatalogSelect]);

  const handleMapMove = useCallback(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(searchCatalog, 500);
  }, [searchCatalog]);

  // Update catalog footprints on map
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const sourceId = 'catalog-footprints';
    const layerId = 'catalog-footprints-fill';
    const outlineId = 'catalog-footprints-outline';

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: catalogItems.map((item) => ({
        type: 'Feature',
        properties: {
          id: item.id,
          satellite: item.satellite,
          acquired_at: item.acquired_at,
          cloud_cover: item.cloud_cover,
          selected: item.id === selectedItemId,
        },
        geometry: item.bbox,
      })),
    };

    const source = map.current.getSource(sourceId) as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(geojson);
    } else {
      map.current.addSource(sourceId, { type: 'geojson', data: geojson });

      map.current.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'selected'], true],
            ACCENT,
            ACCENT_BORDER,
          ],
          'fill-opacity': [
            'case',
            ['==', ['get', 'selected'], true],
            0.2,
            0.08,
          ],
        },
      });

      map.current.addLayer({
        id: outlineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'selected'], true],
            ACCENT,
            ACCENT_BORDER,
          ],
          'line-width': [
            'case',
            ['==', ['get', 'selected'], true],
            2,
            1,
          ],
        },
      });

      map.current.on('click', layerId, (e) => {
        const feature = e.features?.[0];
        if (feature?.properties?.id) {
          setSelectedItemId(feature.properties.id);
          onCatalogSelect?.(feature.properties.id);
        }
      });

      map.current.on('mouseenter', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    }
  }, [catalogItems, selectedItemId, isLoaded, onCatalogSelect]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set');
      return;
    }

    mapboxgl.accessToken = token;

    const styleId = initialStyle ?? mapStyleId;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[styleId].url,
      center: initialCenter ?? [127.0, 37.5],
      zoom: initialZoom ?? 6,
      ...(hideControls ? { attributionControl: false, interactive: true } : {}),
    });

    if (!hideControls) {
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: 'simple_select',
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(draw.current, 'top-left');
    }

    map.current.on('load', () => {
      setIsLoaded(true);
      applyStyleOverridesFor(styleId, map.current!);
      onMapReady?.(map.current!);
    });
    if (!hideControls) {
      map.current.on('draw.create', handleDrawUpdate);
      map.current.on('draw.update', handleDrawUpdate);
      map.current.on('draw.delete', () => onAoiChange?.(null));
      map.current.on('moveend', handleMapMove);
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      map.current?.remove();
      map.current = null;
      draw.current = null;
    };
  }, [handleDrawUpdate, onAoiChange, handleMapMove, onMapReady]);

  const prevStyleRef = useRef(mapStyleId);

  useEffect(() => {
    if (!map.current || !isLoaded) return;
    if (prevStyleRef.current === mapStyleId) return;
    prevStyleRef.current = mapStyleId;

    const m = map.current;
    m.setStyle(MAP_STYLES[mapStyleId].url);
    m.once('style.load', () => {
      applyStyleOverridesFor(mapStyleId, m);
      onMapReady?.(m);
    });
  }, [mapStyleId, isLoaded, onMapReady]);

  useEffect(() => {
    if (isLoaded) searchCatalog();
  }, [isLoaded, searchCatalog]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {!isLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(14, 14, 16, 0.5)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            지도 로딩 중...
          </p>
        </div>
      )}
      {isLoaded && catalogItems.length > 0 && (
        <div
          className="absolute bottom-4 left-4 glass-panel text-xs px-3 py-1.5 rounded-full"
          style={{ color: 'var(--text)' }}
        >
          <span style={{ color: 'var(--accent)' }}>{catalogItems.length}</span>
          개 영상 검색됨
        </div>
      )}
    </div>
  );
}
