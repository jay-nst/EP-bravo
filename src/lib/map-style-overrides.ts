import type mapboxgl from 'mapbox-gl';
import type { ExpressionSpecification } from 'mapbox-gl';

const DEM_SOURCE_ID = 'mapbox-dem';

interface StylePalette {
  accent: string;
  accentDim: string;
  accentFaint: string;
  roadColor: string;
  roadColorMajor: string;
  pathColor: string;
  railColor: string;
  waterColor: string;
  waterDark: string;
  parkColor: string;
  buildingColor: string;
  buildingOutline: string;
  landColor: string;
  labelHalo: string;
  labelText: string;
  /**
   * Per-class tint for the `landuse` layer. Classes observed in the Korean
   * extent: residential, wood, park, agriculture, grass, airport, scrub, rock.
   * Omit to paint the whole layer flat with parkColor (the dark behavior).
   */
  landcover?: {
    wood: string;
    scrub: string;
    grass: string;
    snow: string;
    rock: string;
    agriculture: string;
    residential: string;
    park: string;
  };
  /** Terrain relief shading. Omit to leave the base style's hillshade untouched. */
  hillshade?: { shadow: string; highlight: string; accent: string; exaggeration: number };
  /** Label halo thickness in px. Omit to keep the base style's halo. */
  labelHaloWidth?: number;
}

/**
 * Zoom floor for terrain shading. Below this the DEM tiles cost real bandwidth and
 * GPU time while relief is too small to read, so skip them entirely on wide views.
 */
const HILLSHADE_MIN_ZOOM = 9;

const DARK_PALETTE: StylePalette = {
  accent: '#1bbfa8',
  accentDim: '#0f7a6d',
  accentFaint: '#0a4d44',
  roadColor: '#3d3520',
  roadColorMajor: '#544828',
  pathColor: '#2a2518',
  railColor: '#1a1a1d',
  waterColor: '#111318',
  waterDark: '#0e1014',
  parkColor: '#111311',
  buildingColor: '#131315',
  buildingOutline: '#1a1a1d',
  landColor: '#0e0e10',
  labelHalo: '#0e0e10',
  labelText: '#5a5a5e',
};

// Light counterpart. Deliberately NOT derived from the warm `:root.light` tokens
// in globals.css — a warm cast (R>G>B) across land, buildings and halos reads as a
// yellow tint over the whole map. Neutrals here are held at R≈G≈B or a touch cool,
// and the vegetation greens are pulled off the yellow-green axis.
//
// Roads read brighter than land, mirroring the dark palette's contrast direction.
// Accents are desaturated well below the brand mint — at full strength the admin
// boundaries overpower everything else on a pale basemap.
const LIGHT_PALETTE: StylePalette = {
  accent: '#57a49f',
  accentDim: '#68a5a2',
  accentFaint: '#8ab6b6',
  // Land sits a step below white so roads separate from it. Matching the UI
  // background exactly left roads and land indistinguishable.
  roadColor: '#fcfcfd',
  roadColorMajor: '#ffffff',
  pathColor: '#d5d5d7',
  railColor: '#c4c4c7',
  waterColor: '#c3d2da',
  waterDark: '#b3c4ce',
  parkColor: '#d5e5dc',
  buildingColor: '#e0e0e3',
  buildingOutline: '#c8c8cb',
  landColor: '#ebebec',
  labelHalo: '#f5f5f6',
  labelText: '#45454a',
  // Vegetation is biased blue-green (B > R), not the sage/olive a balanced green
  // gives. Sage is technically neutral on R-B but reads drab once it covers most
  // of the landmass, which is what makes the map look yellowed.
  landcover: {
    wood: '#b2d3c2',
    scrub: '#c6dfd0',
    grass: '#d5e7dc',
    snow: '#ecf0f0',
    rock: '#d7d7d9',
    agriculture: '#dee6e2',
    residential: '#e5e5e7',
    park: '#c9e2d4',
  },
  // Hillshade covers the whole viewport, so an opaque highlight washes the
  // landcover tint out from underneath. Keep shadow only and let terrain
  // darken the greens rather than replace them. The shadow is a cool grey so it
  // does not reintroduce warmth over the vegetation.
  hillshade: {
    shadow: 'rgba(86, 94, 102, 0.36)',
    highlight: 'rgba(255, 255, 255, 0)',
    accent: 'rgba(104, 112, 120, 0.12)',
    exaggeration: 0.6,
  },
  labelHaloWidth: 1.2,
};

const landuseExpr = (palette: StylePalette) => {
  const lc = palette.landcover;
  if (!lc) return palette.parkColor;
  return [
    'match', ['get', 'class'],
    'wood', lc.wood,
    'scrub', lc.scrub,
    'grass', lc.grass,
    'snow', lc.snow,
    'rock', lc.rock,
    'agriculture', lc.agriculture,
    'residential', lc.residential,
    'park', lc.park,
    palette.parkColor,
  ];
};

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

const roadFillExpr = (palette: StylePalette) => [
  'match', ['get', 'class'],
  'motorway', palette.roadColorMajor,
  'trunk', palette.roadColorMajor,
  'primary', palette.roadColorMajor,
  palette.roadColor,
];

/** Localized name fields published by Mapbox Streets v8, keyed by ISO 639-1. */
const NAME_FIELD_BY_LANG: Record<string, string> = {
  ar: 'name_ar',
  de: 'name_de',
  en: 'name_en',
  es: 'name_es',
  fr: 'name_fr',
  it: 'name_it',
  ja: 'name_ja',
  ko: 'name_ko',
  pt: 'name_pt',
  ru: 'name_ru',
  vi: 'name_vi',
};

/**
 * Pick the `name_*` field matching the viewer's language, walking their full
 * preference list. Returns `name_en` when nothing matches — Mapbox has no field
 * for that language, so asking for it would yield blank labels.
 *
 * Exported for tests; prefer {@link applyLocalizedLabels} in app code.
 */
export function resolveNameField(forceLang?: string): string {
  const tags = forceLang
    ? [forceLang]
    : typeof navigator === 'undefined'
      ? []
      : navigator.languages?.length
        ? [...navigator.languages]
        : [navigator.language];

  for (const tag of tags) {
    if (!tag) continue;
    const lower = tag.toLowerCase();
    const base = lower.split('-')[0];

    // Chinese splits by script, not language, and the tag carries the region.
    if (base === 'zh') {
      return /-(tw|hk|mo|hant)\b/.test(lower) ? 'name_zh-Hant' : 'name_zh-Hans';
    }
    const field = NAME_FIELD_BY_LANG[base];
    if (field) return field;
  }
  return 'name_en';
}

/**
 * Swap label text to the viewer's language across every symbol layer. Runs for
 * all basemaps, not just the recolored ones — the classic Mapbox styles ship
 * `name_en` hardcoded.
 *
 * Coverage of the localized fields is best for major places, so always fall back
 * to English and then the local-script name.
 *
 * Pass `forceLang` to pin a language regardless of the browser (e.g. 'ko').
 */
export function applyLocalizedLabels(map: mapboxgl.Map, forceLang?: string) {
  const style = map.getStyle();
  if (!style?.layers) return;

  const field = resolveNameField(forceLang);
  const textField: ExpressionSpecification =
    field === 'name_en'
      ? ['coalesce', ['get', 'name_en'], ['get', 'name']]
      : ['coalesce', ['get', field], ['get', 'name_en'], ['get', 'name']];

  for (const layer of style.layers) {
    if (layer.type !== 'symbol' || !layer.id.includes('label')) continue;
    try {
      map.setLayoutProperty(layer.id, 'text-field', textField);
    } catch { /* skip */ }
  }
}

/** Force Korean labels regardless of the viewer's language. */
export function applyKoreanLabels(map: mapboxgl.Map) {
  applyLocalizedLabels(map, 'ko');
}

export function applyDarkStyleOverrides(map: mapboxgl.Map) {
  applyStyleOverrides(map, DARK_PALETTE);
}

export function applyLightStyleOverrides(map: mapboxgl.Map) {
  applyStyleOverrides(map, LIGHT_PALETTE);
}

function applyStyleOverrides(map: mapboxgl.Map, palette: StylePalette) {
  const style = map.getStyle();
  if (!style?.layers) return;

  const set = (id: string, prop: string, val: unknown) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { map.setPaintProperty(id, prop as any, val); } catch { /* skip */ }
  };

  for (const layer of style.layers) {
    const id = layer.id;

    if (id === 'admin-1-boundary') {
      set(id, 'line-color', palette.accentDim);
      set(id, 'line-opacity', 0.8);
    } else if (id === 'admin-1-boundary-bg') {
      set(id, 'line-color', palette.accentFaint);
      set(id, 'line-opacity', 0.4);
    } else if (id === 'admin-0-boundary' || id === 'admin-0-boundary-disputed') {
      set(id, 'line-color', palette.accent);
      set(id, 'line-opacity', 0.6);
    } else if (id === 'admin-0-boundary-bg') {
      set(id, 'line-color', palette.accentDim);
      set(id, 'line-opacity', 0.3);
    } else if (id === 'hillshade' && palette.hillshade) {
      set(id, 'hillshade-shadow-color', palette.hillshade.shadow);
      set(id, 'hillshade-highlight-color', palette.hillshade.highlight);
      set(id, 'hillshade-accent-color', palette.hillshade.accent);
      set(id, 'hillshade-exaggeration', palette.hillshade.exaggeration);
    } else if (ROAD_LAYER_IDS.has(id)) {
      set(id, 'line-color', roadFillExpr(palette));
      set(id, 'line-opacity', 1);
    } else if (PATH_LAYER_IDS.has(id)) {
      set(id, 'line-color', palette.pathColor);
      set(id, 'line-opacity', 0.5);
    } else if (id === 'road-rail' || id === 'bridge-rail') {
      set(id, 'line-color', palette.railColor);
    } else if (id === 'water' || id === 'water-shadow') {
      set(id, 'fill-color', palette.waterColor);
    } else if (id.includes('waterway') && layer.type === 'line') {
      // Guard on type: `waterway-label` is a symbol layer and must fall through to
      // the label branch below, not receive line-color.
      set(id, 'line-color', palette.waterDark);
    } else if (id === 'building') {
      set(id, 'fill-color', palette.buildingColor);
      set(id, 'fill-outline-color', palette.buildingOutline);
    } else if (id === 'land') {
      // `land` is a background layer in the classic styles, so it takes
      // background-color. Sending fill-color here throws and the color is lost.
      set(id, layer.type === 'background' ? 'background-color' : 'fill-color', palette.landColor);
    } else if ((id === 'landcover' || id.includes('landuse')) && layer.type === 'fill') {
      set(id, 'fill-color', landuseExpr(palette));
    } else if (id.includes('park') && layer.type === 'fill') {
      set(id, 'fill-color', palette.parkColor);
    } else if (layer.type === 'symbol' && id.includes('label')) {
      set(id, 'text-halo-color', palette.labelHalo);
      set(id, 'text-color', palette.labelText);
      if (palette.labelHaloWidth !== undefined) {
        set(id, 'text-halo-width', palette.labelHaloWidth);
        set(id, 'text-halo-blur', 0.4);
      }
    }
  }

  addHillshade(map, palette);
  addAdmin2Boundary(map, palette);
}

/**
 * Relief shading from Mapbox's terrain DEM. Added as its own source+layer rather
 * than repainting the base style's — the classic light/dark styles ship without a
 * hillshade layer, so repainting alone silently does nothing.
 */
function addHillshade(map: mapboxgl.Map, palette: StylePalette) {
  if (!palette.hillshade) return;

  if (!map.getSource(DEM_SOURCE_ID)) {
    map.addSource(DEM_SOURCE_ID, {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    });
  }

  const layerId = 'hillshade-custom';
  if (map.getLayer(layerId)) return;

  // Sit above landcover but below roads so terrain never buries the network.
  const layers = map.getStyle()?.layers ?? [];
  const before =
    layers.find(l => l.id.startsWith('road') || l.id.startsWith('tunnel'))?.id
    ?? layers.find(l => l.type === 'symbol')?.id;

  map.addLayer({
    id: layerId,
    type: 'hillshade',
    source: DEM_SOURCE_ID,
    minzoom: HILLSHADE_MIN_ZOOM,
    paint: {
      'hillshade-shadow-color': palette.hillshade.shadow,
      'hillshade-highlight-color': palette.hillshade.highlight,
      'hillshade-accent-color': palette.hillshade.accent,
      'hillshade-exaggeration': palette.hillshade.exaggeration,
    },
  }, before);
}

function addAdmin2Boundary(map: mapboxgl.Map, palette: StylePalette) {
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
      'line-color': palette.accentFaint,
      'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 10, 1, 14, 1.5],
      'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 7, 0.5, 12, 0.7],
      'line-dasharray': [4, 2],
    },
  }, firstSymbol);
}
