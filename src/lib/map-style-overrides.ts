import type mapboxgl from 'mapbox-gl';

const ACCENT = '#1bbfa8';
const ACCENT_DIM = '#0f7a6d';
const ACCENT_FAINT = '#0a4d44';

const ROAD_COLOR = '#3d3520';
const ROAD_COLOR_MAJOR = '#544828';
const PATH_COLOR = '#2a2518';

const WATER_COLOR = '#111318';
const WATER_DARK = '#0e1014';
const PARK_COLOR = '#111311';
const BUILDING_COLOR = '#131315';
const BUILDING_OUTLINE = '#1a1a1d';
const LAND_COLOR = '#0e0e10';
const LABEL_HALO = '#0e0e10';

const ROAD_LAYER_IDS = new Set([
  'road-simple',
  'bridge-simple',
  'bridge-case-simple',
  'tunnel-simple',
]);

const PATH_LAYER_IDS = new Set([
  'road-path', 'road-path-trail', 'road-path-cycleway-piste',
  'road-steps', 'road-pedestrian',
  'bridge-path', 'bridge-path-trail', 'bridge-path-cycleway-piste',
  'bridge-steps', 'bridge-pedestrian',
  'tunnel-path', 'tunnel-path-trail', 'tunnel-path-cycleway-piste',
  'tunnel-steps', 'tunnel-pedestrian',
]);

const ROAD_FILL_EXPR = [
  'match', ['get', 'class'],
  'motorway', ROAD_COLOR_MAJOR,
  'trunk', ROAD_COLOR_MAJOR,
  'primary', ROAD_COLOR_MAJOR,
  ROAD_COLOR,
];

export function applyDarkStyleOverrides(map: mapboxgl.Map) {
  const style = map.getStyle();
  if (!style?.layers) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (id: string, prop: string, val: unknown) => {
    try { map.setPaintProperty(id, prop as any, val); } catch { /* skip */ }
  };

  for (const layer of style.layers) {
    const id = layer.id;

    if (id === 'admin-1-boundary') {
      set(id, 'line-color', ACCENT_DIM);
      set(id, 'line-opacity', 0.8);
    } else if (id === 'admin-1-boundary-bg') {
      set(id, 'line-color', ACCENT_FAINT);
      set(id, 'line-opacity', 0.4);
    } else if (id === 'admin-0-boundary' || id === 'admin-0-boundary-disputed') {
      set(id, 'line-color', ACCENT);
      set(id, 'line-opacity', 0.6);
    } else if (id === 'admin-0-boundary-bg') {
      set(id, 'line-color', ACCENT_DIM);
      set(id, 'line-opacity', 0.3);
    } else if (ROAD_LAYER_IDS.has(id)) {
      set(id, 'line-color', ROAD_FILL_EXPR);
      set(id, 'line-opacity', 1);
    } else if (PATH_LAYER_IDS.has(id)) {
      set(id, 'line-color', PATH_COLOR);
      set(id, 'line-opacity', 0.5);
    } else if (id === 'road-rail' || id === 'bridge-rail') {
      set(id, 'line-color', '#1a1a1d');
    } else if (id === 'water' || id === 'water-shadow') {
      set(id, 'fill-color', WATER_COLOR);
    } else if (id.includes('waterway')) {
      set(id, 'line-color', WATER_DARK);
    } else if (id === 'building') {
      set(id, 'fill-color', BUILDING_COLOR);
      set(id, 'fill-outline-color', BUILDING_OUTLINE);
    } else if (id === 'land' || id === 'landcover') {
      set(id, 'fill-color', LAND_COLOR);
    } else if ((id.includes('park') || id.includes('landuse')) && layer.type === 'fill') {
      set(id, 'fill-color', PARK_COLOR);
    } else if (layer.type === 'symbol' && id.includes('label')) {
      set(id, 'text-halo-color', LABEL_HALO);
      set(id, 'text-color', '#5a5a5e');
    }
  }

  addAdmin2Boundary(map);
}

function addAdmin2Boundary(map: mapboxgl.Map) {
  const layerId = 'admin-2-boundary-custom';
  if (map.getLayer(layerId)) return;

  const firstSymbol = map.getStyle()?.layers?.find(l => l.type === 'symbol')?.id;

  map.addLayer({
    id: layerId,
    type: 'line',
    source: 'composite',
    'source-layer': 'admin',
    filter: [
      'all',
      ['==', ['get', 'admin_level'], 2],
      ['==', ['get', 'maritime'], 'false'],
    ],
    layout: {
      'line-join': 'round',
    },
    paint: {
      'line-color': ACCENT_FAINT,
      'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 10, 1, 14, 1.5],
      'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 7, 0.5, 12, 0.7],
      'line-dasharray': [4, 2],
    },
  }, firstSymbol);
}
