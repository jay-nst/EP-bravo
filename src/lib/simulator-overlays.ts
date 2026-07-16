import type mapboxgl from 'mapbox-gl';

type Platform = 'warden' | 'predict' | 'citadel' | 'northpaper';

const PREFIX = 'sim-ov';

function sid(p: Platform, n: string) { return `${PREFIX}-${p}-${n}`; }

function bbox(poly: GeoJSON.Polygon): [number, number, number, number] {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of poly.coordinates[0]) {
    if (x < x0) x0 = x; if (y < y0) y0 = y;
    if (x > x1) x1 = x; if (y > y1) y1 = y;
  }
  return [x0, y0, x1, y1];
}

function pip(pt: [number, number], poly: GeoJSON.Polygon): boolean {
  const [px, py] = pt;
  const ring = poly.coordinates[0];
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
}

function rng(seed: number) {
  let s = Math.max(1, Math.abs(Math.round(seed)));
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function denseGrid(poly: GeoJSON.Polygon, density: number, rand: () => number): GeoJSON.Feature[] {
  const [x0, y0, x1, y1] = bbox(poly);
  const dLng = x1 - x0, dLat = y1 - y0;
  const features: GeoJSON.Feature[] = [];
  let att = 0;
  while (features.length < density && att < density * 40) {
    const lng = x0 + rand() * dLng;
    const lat = y0 + rand() * dLat;
    if (pip([lng, lat], poly)) {
      const weight = rand();
      features.push({
        type: 'Feature',
        properties: { w: weight },
        geometry: { type: 'Point', coordinates: [lng, lat] },
      });
    }
    att++;
  }
  return features;
}

function hotspots(poly: GeoJSON.Polygon, n: number, rand: () => number): GeoJSON.Feature[] {
  const [x0, y0, x1, y1] = bbox(poly);
  const dLng = x1 - x0, dLat = y1 - y0;
  const features: GeoJSON.Feature[] = [];
  let att = 0;
  while (features.length < n && att < n * 50) {
    const lng = x0 + rand() * dLng;
    const lat = y0 + rand() * dLat;
    if (pip([lng, lat], poly)) {
      features.push({
        type: 'Feature',
        properties: { w: 0.7 + rand() * 0.3 },
        geometry: { type: 'Point', coordinates: [lng, lat] },
      });
    }
    att++;
  }
  return features;
}

function addSrc(map: mapboxgl.Map, id: string, fc: GeoJSON.FeatureCollection) {
  if (map.getSource(id)) (map.getSource(id) as mapboxgl.GeoJSONSource).setData(fc);
  else map.addSource(id, { type: 'geojson', data: fc });
}

function addLyr(map: mapboxgl.Map, spec: Record<string, unknown>) {
  if (!map.getLayer(spec.id as string)) map.addLayer(spec as mapboxgl.LayerSpecification);
}

function fc(features: GeoJSON.Feature[]): GeoJSON.FeatureCollection {
  return { type: 'FeatureCollection', features };
}

function feat(geometry: GeoJSON.Geometry, properties: Record<string, unknown> = {}): GeoJSON.Feature {
  return { type: 'Feature', properties, geometry };
}

// Heatmap radius scales with AOI size
function heatRadius(poly: GeoJSON.Polygon): number {
  const [x0, y0, x1, y1] = bbox(poly);
  const diagDeg = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
  if (diagDeg > 0.5) return 30;
  if (diagDeg > 0.1) return 40;
  return 55;
}

// ── Remove all overlays for a platform ──
export function removeSimulatorOverlay(map: mapboxgl.Map, platform: Platform): void {
  const style = map.getStyle();
  if (!style) return;
  const pfx = `${PREFIX}-${platform}`;
  const layers = (style.layers || []).filter(l => l.id.startsWith(pfx)).map(l => l.id);
  for (const id of layers) map.removeLayer(id);
  for (const id of Object.keys(style.sources || {})) {
    if (id.startsWith(pfx)) map.removeSource(id);
  }
}

// ── Warden: NDVI-like continuous surface (green→yellow→brown) + deforestation hotspots ──
export function addWardenOverlay(
  map: mapboxgl.Map, poly: GeoJSON.Polygon,
  result: { deforestationPct: number; riskPlots: number; plotsAnalyzed: number },
) {
  const p: Platform = 'warden';
  const rand = rng(result.riskPlots * 137 + result.plotsAnalyzed * 41);
  const r = heatRadius(poly);

  // AOI boundary outline
  addSrc(map, sid(p, 'boundary'), fc([feat(poly)]));
  addLyr(map, { id: sid(p, 'boundary-line'), type: 'line', source: sid(p, 'boundary'),
    paint: { 'line-color': '#6B8A5E', 'line-width': 2, 'line-opacity': 0.8 } });

  // Forest health heatmap — green base surface
  const baseGrid = denseGrid(poly, 120, rand);
  addSrc(map, sid(p, 'forest-heat'), fc(baseGrid));
  addLyr(map, { id: sid(p, 'forest-heatmap'), type: 'heatmap', source: sid(p, 'forest-heat'),
    paint: {
      'heatmap-weight': ['get', 'w'],
      'heatmap-intensity': 0.6,
      'heatmap-radius': r,
      'heatmap-opacity': 0.45,
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.15, 'rgba(34,120,60,0.3)',
        0.4, 'rgba(107,138,94,0.5)',
        0.65, 'rgba(180,170,80,0.6)',
        0.85, 'rgba(170,120,50,0.7)',
        1, 'rgba(140,80,30,0.8)',
      ],
    },
  });

  // Deforestation hotspots — red heat clusters
  const defPts = hotspots(poly, 4 + Math.floor(rand() * 4), rand);
  addSrc(map, sid(p, 'defor-heat'), fc(defPts));
  addLyr(map, { id: sid(p, 'defor-heatmap'), type: 'heatmap', source: sid(p, 'defor-heat'),
    paint: {
      'heatmap-weight': ['get', 'w'],
      'heatmap-intensity': 0.9,
      'heatmap-radius': r * 0.7,
      'heatmap-opacity': 0.55,
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.2, 'rgba(196,92,74,0.2)',
        0.5, 'rgba(196,92,74,0.5)',
        0.8, 'rgba(220,70,50,0.7)',
        1, 'rgba(200,50,30,0.85)',
      ],
    },
  });

  // Small alert dots at deforestation hotspots
  addLyr(map, { id: sid(p, 'defor-dot'), type: 'circle', source: sid(p, 'defor-heat'),
    paint: { 'circle-radius': 3, 'circle-color': '#C45C4A',
      'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(14,14,16,0.5)' } });
}

// ── Citadel: dNBR burn severity surface (yellow→orange→red) + damage markers ──
export function addCitadelOverlay(
  map: mapboxgl.Map, poly: GeoJSON.Polygon,
  result: { affectedPct: number; damagedBuildings: number; ndviDrop: number },
) {
  const p: Platform = 'citadel';
  const rand = rng(result.damagedBuildings * 89 + result.ndviDrop * 23);
  const r = heatRadius(poly);

  // AOI boundary
  addSrc(map, sid(p, 'boundary'), fc([feat(poly)]));
  addLyr(map, { id: sid(p, 'boundary-line'), type: 'line', source: sid(p, 'boundary'),
    paint: { 'line-color': '#C45C4A', 'line-width': 2, 'line-opacity': 0.8 } });

  // Burn severity heatmap — dNBR-like gradient
  const burnGrid = denseGrid(poly, 140, rand);
  addSrc(map, sid(p, 'burn-heat'), fc(burnGrid));
  addLyr(map, { id: sid(p, 'burn-heatmap'), type: 'heatmap', source: sid(p, 'burn-heat'),
    paint: {
      'heatmap-weight': ['get', 'w'],
      'heatmap-intensity': 0.7,
      'heatmap-radius': r,
      'heatmap-opacity': 0.5,
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.1, 'rgba(200,180,60,0.2)',
        0.3, 'rgba(220,160,50,0.4)',
        0.5, 'rgba(200,120,40,0.55)',
        0.7, 'rgba(196,92,74,0.65)',
        0.9, 'rgba(180,50,30,0.75)',
        1, 'rgba(140,30,20,0.85)',
      ],
    },
  });

  // Severe burn core spots
  const severePts = hotspots(poly, 3 + Math.floor(rand() * 3), rand);
  addSrc(map, sid(p, 'severe-heat'), fc(severePts));
  addLyr(map, { id: sid(p, 'severe-heatmap'), type: 'heatmap', source: sid(p, 'severe-heat'),
    paint: {
      'heatmap-weight': ['get', 'w'],
      'heatmap-intensity': 1.0,
      'heatmap-radius': r * 0.6,
      'heatmap-opacity': 0.45,
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.3, 'rgba(196,92,74,0.3)',
        0.6, 'rgba(180,40,20,0.6)',
        1, 'rgba(120,20,10,0.8)',
      ],
    },
  });

  // Damage markers — small dots
  const dmgN = Math.min(result.damagedBuildings, 6);
  const dmgPts = hotspots(poly, dmgN, rand);
  addSrc(map, sid(p, 'dmg'), fc(dmgPts));
  addLyr(map, { id: sid(p, 'dmg-dot'), type: 'circle', source: sid(p, 'dmg'),
    paint: { 'circle-radius': 3.5, 'circle-color': '#C45C4A',
      'circle-stroke-width': 1.5, 'circle-stroke-color': 'rgba(14,14,16,0.6)' } });
}

// ── Predict: Panel detection surface (dark blue→cyan) + intrusion warning spots ──
export function addPredictOverlay(
  map: mapboxgl.Map, poly: GeoJSON.Polygon,
  result: { panelCoverage: number; intrusionZones: number; status: string },
) {
  const p: Platform = 'predict';
  const rand = rng(Math.round(result.panelCoverage * 71) + result.intrusionZones * 53);
  const r = heatRadius(poly);

  // AOI boundary
  addSrc(map, sid(p, 'boundary'), fc([feat(poly)]));
  addLyr(map, { id: sid(p, 'boundary-line'), type: 'line', source: sid(p, 'boundary'),
    paint: { 'line-color': '#4A9EC4', 'line-width': 2, 'line-opacity': 0.8 } });

  // Panel coverage heatmap — blue→cyan surface
  const panelGrid = denseGrid(poly, 130, rand);
  addSrc(map, sid(p, 'panel-heat'), fc(panelGrid));
  addLyr(map, { id: sid(p, 'panel-heatmap'), type: 'heatmap', source: sid(p, 'panel-heat'),
    paint: {
      'heatmap-weight': ['get', 'w'],
      'heatmap-intensity': 0.6,
      'heatmap-radius': r,
      'heatmap-opacity': 0.45,
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.15, 'rgba(30,80,140,0.25)',
        0.4, 'rgba(50,120,180,0.4)',
        0.65, 'rgba(74,158,196,0.55)',
        0.85, 'rgba(80,190,210,0.65)',
        1, 'rgba(100,220,230,0.75)',
      ],
    },
  });

  // Vegetation intrusion warning spots
  if (result.intrusionZones > 0) {
    const intPts = hotspots(poly, result.intrusionZones, rand);
    addSrc(map, sid(p, 'intru-heat'), fc(intPts));
    addLyr(map, { id: sid(p, 'intru-heatmap'), type: 'heatmap', source: sid(p, 'intru-heat'),
      paint: {
        'heatmap-weight': ['get', 'w'],
        'heatmap-intensity': 0.8,
        'heatmap-radius': r * 0.5,
        'heatmap-opacity': 0.5,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.3, 'rgba(200,146,58,0.3)',
          0.6, 'rgba(200,146,58,0.55)',
          1, 'rgba(220,130,40,0.75)',
        ],
      },
    });
    addLyr(map, { id: sid(p, 'intru-dot'), type: 'circle', source: sid(p, 'intru-heat'),
      paint: { 'circle-radius': 3, 'circle-color': '#C8923A',
        'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(14,14,16,0.5)' } });
  }

  // Status marker at centroid
  const [x0, y0, x1, y1] = bbox(poly);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const statusColor = result.status === 'verified' ? '#4A9E6B' : '#C8923A';
  addSrc(map, sid(p, 'status'), fc([{
    type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [cx, cy] },
  }]));
  addLyr(map, { id: sid(p, 'status-dot'), type: 'circle', source: sid(p, 'status'),
    paint: { 'circle-radius': 5, 'circle-color': statusColor,
      'circle-stroke-width': 2, 'circle-stroke-color': 'rgba(14,14,16,0.6)' } });
}

// ── Northpaper: Change detection surface (blue→yellow→red) + thermal anomalies ──
export function addNorthpaperOverlay(
  map: mapboxgl.Map, poly: GeoJSON.Polygon,
  result: { changedZones: number; newStructures: number; thermalAnomalies: number },
) {
  const p: Platform = 'northpaper';
  const rand = rng(result.changedZones * 67 + result.newStructures * 31 + result.thermalAnomalies * 19);
  const r = heatRadius(poly);

  // Observation boundary — dashed
  addSrc(map, sid(p, 'boundary'), fc([feat(poly)]));
  addLyr(map, { id: sid(p, 'boundary-line'), type: 'line', source: sid(p, 'boundary'),
    paint: { 'line-color': '#3D5A80', 'line-width': 2, 'line-opacity': 0.7, 'line-dasharray': [4, 3] } });

  // Change detection heatmap — blue→yellow→red
  const changeGrid = denseGrid(poly, 110, rand);
  addSrc(map, sid(p, 'change-heat'), fc(changeGrid));
  addLyr(map, { id: sid(p, 'change-heatmap'), type: 'heatmap', source: sid(p, 'change-heat'),
    paint: {
      'heatmap-weight': ['get', 'w'],
      'heatmap-intensity': 0.65,
      'heatmap-radius': r,
      'heatmap-opacity': 0.45,
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.1, 'rgba(61,90,128,0.2)',
        0.3, 'rgba(80,130,170,0.35)',
        0.5, 'rgba(180,170,80,0.5)',
        0.7, 'rgba(200,146,58,0.6)',
        0.9, 'rgba(196,92,74,0.7)',
        1, 'rgba(180,50,30,0.8)',
      ],
    },
  });

  // Thermal anomaly hotspots
  if (result.thermalAnomalies > 0) {
    const thPts = hotspots(poly, result.thermalAnomalies, rand);
    addSrc(map, sid(p, 'therm-heat'), fc(thPts));
    addLyr(map, { id: sid(p, 'therm-heatmap'), type: 'heatmap', source: sid(p, 'therm-heat'),
      paint: {
        'heatmap-weight': ['get', 'w'],
        'heatmap-intensity': 1.0,
        'heatmap-radius': r * 0.5,
        'heatmap-opacity': 0.5,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(0,0,0,0)',
          0.2, 'rgba(255,87,34,0.2)',
          0.5, 'rgba(255,87,34,0.5)',
          0.8, 'rgba(255,60,20,0.7)',
          1, 'rgba(220,40,10,0.85)',
        ],
      },
    });
    addLyr(map, { id: sid(p, 'therm-dot'), type: 'circle', source: sid(p, 'therm-heat'),
      paint: { 'circle-radius': 3, 'circle-color': '#FF5722',
        'circle-stroke-width': 1, 'circle-stroke-color': 'rgba(14,14,16,0.5)' } });
  }

  // New structure markers
  if (result.newStructures > 0) {
    const nsPts = hotspots(poly, result.newStructures, rand);
    addSrc(map, sid(p, 'struct'), fc(nsPts));
    addLyr(map, { id: sid(p, 'struct-dot'), type: 'circle', source: sid(p, 'struct'),
      paint: { 'circle-radius': 3.5, 'circle-color': '#C45C4A',
        'circle-stroke-width': 1.5, 'circle-stroke-color': 'rgba(14,14,16,0.6)' } });
  }
}
