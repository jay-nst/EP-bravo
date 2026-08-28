#!/usr/bin/env node
/**
 * Bake the runtime light-mode map overrides into a standalone Mapbox style JSON,
 * so the same design can be uploaded to a Mapbox account and reused outside this
 * app (other websites, mobile SDKs, Static Images API).
 *
 * The color transforms here MIRROR src/lib/map-style-overrides.ts (LIGHT_PALETTE).
 * If you change colors there, re-run this and re-upload.
 *
 * Labels deliberately DIVERGE from the app: the app switches to the viewer's
 * language at runtime, while this static style bakes in English. See TEXT_FIELD.
 *
 * Usage:
 *   node --env-file=.env.local scripts/gen-mapbox-style.js earthpaper-light.style.json
 *
 * Reads NEXT_PUBLIC_MAPBOX_TOKEN (a public pk. token is enough — read only).
 */

const fs = require('fs');

const BASE_STYLE = 'mapbox/light-v11';
const DEM_SOURCE_ID = 'mapbox-dem';
const HILLSHADE_MIN_ZOOM = 9;

/**
 * DEM resolution ceiling. Terrain tiles are the single heaviest thing this style
 * pulls — ~80-110 KB each at 512px, and every one costs a PNG decode plus an
 * offscreen prerender pass before it can be drawn. Measured over Seoul they are
 * 31-35% of a fresh screen's bytes.
 *
 * Capping at 12 means z13+ reuses (overzooms) z12 tiles instead of requesting new
 * ones. Measured at z14 over Seoul: 8 DEM tiles per screen down to 2. Against the
 * light palette (shadow at 0.36 alpha, transparent highlight) the coarser relief
 * is barely distinguishable — verified side by side over Seoul and Seoraksan.
 *
 * !! THE MAPBOX STYLES API DOES NOT PERSIST THIS. !!
 * Uploading strips `maxzoom` from any source declared with a `mapbox://` url —
 * only `tileSize` survives — so a consumer of the hosted style gets the tileset's
 * native maxzoom (14). Declaring the source with an explicit `tiles` array would
 * keep it, but the API rejects that: "sources[N].url: Expected a valid Mapbox
 * tileset url". So this constant only takes effect where the source is built at
 * runtime, i.e. src/lib/map-style-overrides.ts. It is kept here so both files
 * describe the same design.
 *
 * A consumer of the hosted style that wants the cap has to set it themselves,
 * and it must be re-applied after the source metadata lands — loading the
 * TileJSON runs `Object.assign(source, tileJSON)`, which puts maxzoom back to 14:
 *
 *   map.on('sourcedata', e => {
 *     if (e.sourceId === 'mapbox-dem' && e.sourceDataType === 'metadata') {
 *       const s = map.getSource('mapbox-dem');
 *       if (s && s.maxzoom !== 12) s.maxzoom = 12;
 *     }
 *   });
 */
const DEM_MAX_ZOOM = 12;

/**
 * Zoom floor for the admin-2 boundary. Its line-opacity ramp is 0 until z5, so
 * anything below that tessellates dashed geometry nobody can see.
 */
const ADMIN2_MIN_ZOOM = 5;

const PALETTE = {
  accent: '#57a49f',
  accentDim: '#68a5a2',
  accentFaint: '#8ab6b6',
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
  labelHaloWidth: 1.2,
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
  hillshade: {
    shadow: 'rgba(86, 94, 102, 0.36)',
    highlight: 'rgba(255, 255, 255, 0)',
    accent: 'rgba(104, 112, 120, 0.12)',
    exaggeration: 0.6,
  },
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

const roadFillExpr = () => [
  'match', ['get', 'class'],
  'motorway', PALETTE.roadColorMajor,
  'trunk', PALETTE.roadColorMajor,
  'primary', PALETTE.roadColorMajor,
  PALETTE.roadColor,
];

const landuseExpr = () => {
  const lc = PALETTE.landcover;
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
    PALETTE.parkColor,
  ];
};

/**
 * A style JSON is static — it cannot read navigator.language the way the app does
 * (see applyLocalizedLabels in src/lib/map-style-overrides.ts). English is the safe
 * default for a style reused on sites whose audience we do not control.
 *
 * A consumer that wants another language overrides `text-field` after load, e.g.
 *   map.setLayoutProperty(id, 'text-field',
 *     ['coalesce', ['get','name_ko'], ['get','name_en'], ['get','name']]);
 */
const TEXT_FIELD = [
  'coalesce',
  ['get', 'name_en'],
  ['get', 'name'],
];

function setPaint(layer, prop, val) {
  layer.paint = layer.paint || {};
  layer.paint[prop] = val;
}

function recolor(layer) {
  const id = layer.id;

  if (id === 'admin-1-boundary') {
    setPaint(layer, 'line-color', PALETTE.accentDim);
    setPaint(layer, 'line-opacity', 0.8);
  } else if (id === 'admin-1-boundary-bg') {
    setPaint(layer, 'line-color', PALETTE.accentFaint);
    setPaint(layer, 'line-opacity', 0.4);
  } else if (id === 'admin-0-boundary' || id === 'admin-0-boundary-disputed') {
    setPaint(layer, 'line-color', PALETTE.accent);
    setPaint(layer, 'line-opacity', 0.6);
  } else if (id === 'admin-0-boundary-bg') {
    setPaint(layer, 'line-color', PALETTE.accentDim);
    setPaint(layer, 'line-opacity', 0.3);
  } else if (id === 'hillshade') {
    setPaint(layer, 'hillshade-shadow-color', PALETTE.hillshade.shadow);
    setPaint(layer, 'hillshade-highlight-color', PALETTE.hillshade.highlight);
    setPaint(layer, 'hillshade-accent-color', PALETTE.hillshade.accent);
    setPaint(layer, 'hillshade-exaggeration', PALETTE.hillshade.exaggeration);
  } else if (ROAD_LAYER_IDS.has(id)) {
    setPaint(layer, 'line-color', roadFillExpr());
    setPaint(layer, 'line-opacity', 1);
  } else if (PATH_LAYER_IDS.has(id)) {
    setPaint(layer, 'line-color', PALETTE.pathColor);
    setPaint(layer, 'line-opacity', 0.5);
  } else if (id === 'road-rail' || id === 'bridge-rail') {
    setPaint(layer, 'line-color', PALETTE.railColor);
  } else if (id === 'water' || id === 'water-shadow') {
    setPaint(layer, 'fill-color', PALETTE.waterColor);
  } else if (id.includes('waterway') && layer.type === 'line') {
    // Guard on type: `waterway-label` is a symbol layer and must fall through to
    // the label branch below, not receive line-color.
    setPaint(layer, 'line-color', PALETTE.waterDark);
  } else if (id === 'building') {
    setPaint(layer, 'fill-color', PALETTE.buildingColor);
    setPaint(layer, 'fill-outline-color', PALETTE.buildingOutline);
  } else if (id === 'land') {
    // `land` ships as a background layer in the classic styles, and background
    // layers take background-color — fill-color there is a hard validation error.
    setPaint(
      layer,
      layer.type === 'background' ? 'background-color' : 'fill-color',
      PALETTE.landColor
    );
  } else if ((id === 'landcover' || id.includes('landuse')) && layer.type === 'fill') {
    setPaint(layer, 'fill-color', landuseExpr());
  } else if (id.includes('park') && layer.type === 'fill') {
    setPaint(layer, 'fill-color', PALETTE.parkColor);
  } else if (layer.type === 'symbol' && id.includes('label')) {
    setPaint(layer, 'text-halo-color', PALETTE.labelHalo);
    setPaint(layer, 'text-color', PALETTE.labelText);
    setPaint(layer, 'text-halo-width', PALETTE.labelHaloWidth);
    setPaint(layer, 'text-halo-blur', 0.4);
    layer.layout = layer.layout || {};
    layer.layout['text-field'] = TEXT_FIELD;
  }
}

function hillshadeLayer() {
  return {
    id: 'hillshade-custom',
    type: 'hillshade',
    source: DEM_SOURCE_ID,
    minzoom: HILLSHADE_MIN_ZOOM,
    paint: {
      'hillshade-shadow-color': PALETTE.hillshade.shadow,
      'hillshade-highlight-color': PALETTE.hillshade.highlight,
      'hillshade-accent-color': PALETTE.hillshade.accent,
      'hillshade-exaggeration': PALETTE.hillshade.exaggeration,
    },
  };
}

function admin2Layer(compositeSourceId) {
  return {
    id: 'admin-2-boundary-custom',
    type: 'line',
    source: compositeSourceId,
    'source-layer': 'admin',
    minzoom: ADMIN2_MIN_ZOOM,
    filter: [
      'all',
      ['==', ['get', 'admin_level'], 2],
      ['==', ['get', 'maritime'], 'false'],
    ],
    layout: { 'line-join': 'round' },
    paint: {
      'line-color': PALETTE.accentFaint,
      'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.4, 10, 1, 14, 1.5],
      'line-opacity': ['interpolate', ['linear'], ['zoom'], 5, 0, 7, 0.5, 12, 0.7],
      'line-dasharray': [4, 2],
    },
  };
}

/**
 * Drop tilesets from a bundled `mapbox://a,b,c` source that no layer reads from.
 *
 * light-v11 bundles mapbox-streets-v8 with mapbox-terrain-v2 and
 * mapbox-bathymetry-v2, but none of its layers reference the terrain
 * (contour/hillshade/landcover) or bathymetry (depth) source-layers — the base
 * style never draws them, and neither do the layers added here. Every tile still
 * ships that data: measured over Seoul it is +34% bytes at z6, +25% at z9, +12%
 * at z12, all of it downloaded, parsed by the worker, and thrown away.
 *
 * Membership is read from each tileset's TileJSON rather than hardcoded, so this
 * stays correct if Mapbox re-bundles the base style or a future layer here starts
 * using contour data.
 */
async function pruneComposite(style, sourceId, token) {
  const source = style.sources?.[sourceId];
  const url = source?.url || '';
  if (!url.startsWith('mapbox://') || !url.includes(',')) return null;

  const used = new Set(
    style.layers
      .filter(l => l.source === sourceId && l['source-layer'])
      .map(l => l['source-layer'])
  );

  const ids = url.slice('mapbox://'.length).split(',');
  const kept = [];
  const dropped = [];

  for (const id of ids) {
    const res = await fetch(
      `https://api.mapbox.com/v4/${encodeURIComponent(id)}.json?access_token=${token}`
    );
    if (!res.ok) {
      // Unknown membership — keeping it is the safe failure, a missing
      // source-layer renders as blank geometry with no error.
      console.warn(`  note: could not read TileJSON for ${id} (${res.status}), keeping it`);
      kept.push(id);
      continue;
    }
    const tj = await res.json();
    const provides = (tj.vector_layers || []).map(v => v.id);
    (provides.some(l => used.has(l)) ? kept : dropped).push(id);
  }

  // Never prune down to nothing, whatever the TileJSON said.
  if (!kept.length || !dropped.length) return null;

  source.url = `mapbox://${kept.join(',')}`;
  return { kept, dropped };
}

/** Index of the first road/tunnel layer — hillshade goes above land, below roads. */
function insertIndexForHillshade(layers) {
  const i = layers.findIndex(
    l => l.id.startsWith('road') || l.id.startsWith('tunnel')
  );
  if (i !== -1) return i;
  const s = layers.findIndex(l => l.type === 'symbol');
  return s !== -1 ? s : layers.length;
}

async function main() {
  const out = process.argv[2] || 'earthpaper-light.style.json';
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    console.error('NEXT_PUBLIC_MAPBOX_TOKEN is not set.');
    console.error('Run with: node --env-file=.env.local scripts/gen-mapbox-style.js');
    process.exit(1);
  }

  const url = `https://api.mapbox.com/styles/v1/${BASE_STYLE}?access_token=${token}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch base style: ${res.status} ${res.statusText}`);
    if (res.status === 401) console.error('Token rejected. Check it has styles:read.');
    process.exit(1);
  }

  const style = await res.json();

  if (!Array.isArray(style.layers)) {
    console.error('Unexpected style shape: no layers array.');
    process.exit(1);
  }

  // The vector source is usually named "composite", but read it rather than assume.
  const compositeSourceId =
    Object.keys(style.sources || {}).find(
      k => (style.sources[k].url || '').includes('mapbox-streets')
    ) || 'composite';

  let labelCount = 0;
  for (const layer of style.layers) {
    recolor(layer);
    if (layer.type === 'symbol' && layer.id.includes('label')) labelCount++;
  }

  style.sources[DEM_SOURCE_ID] = {
    type: 'raster-dem',
    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
    tileSize: 512,
    maxzoom: DEM_MAX_ZOOM,
  };

  style.layers.splice(insertIndexForHillshade(style.layers), 0, hillshadeLayer());

  const firstSymbol = style.layers.findIndex(l => l.type === 'symbol');
  style.layers.splice(
    firstSymbol === -1 ? style.layers.length : firstSymbol,
    0,
    admin2Layer(compositeSourceId)
  );

  // Prune AFTER the custom layers are in place, so their source-layers count as used.
  const pruned = await pruneComposite(style, compositeSourceId, token);

  // light-v11 ships projection: globe. gl-js already falls back to mercator above
  // roughly z6, so for the city/regional zooms this style is consumed at, globe
  // only costs the wider tile coverage and the atmosphere pass on first load
  // without ever being seen. Pin mercator and drop the fog, which is globe-only.
  style.projection = { name: 'mercator' };
  delete style.fog;

  // Strip read-only/account-scoped fields — the upload endpoint assigns its own.
  for (const k of ['id', 'owner', 'created', 'modified', 'visibility', 'protected', 'draft']) {
    delete style[k];
  }
  style.name = 'EarthPaper Light';

  fs.writeFileSync(out, JSON.stringify(style, null, 2));

  console.log(`Wrote ${out}`);
  console.log(`  base:        ${BASE_STYLE}`);
  console.log(`  layers:      ${style.layers.length}`);
  console.log(`  label layers: ${labelCount} (text-field: name_en, fallback name)`);
  console.log(`  vector source: ${compositeSourceId} -> ${style.sources[compositeSourceId].url}`);
  if (pruned) console.log(`  pruned tilesets: ${pruned.dropped.join(', ')} (unreferenced)`);
  console.log(`  dem maxzoom: ${DEM_MAX_ZOOM}`);
  console.log(`  projection:  ${style.projection.name}`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
