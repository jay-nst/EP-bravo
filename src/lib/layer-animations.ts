import type mapboxgl from 'mapbox-gl';

export type AnimationId = 'earthquake' | 'wildfire' | 'traffic' | 'weather-precip' | 'air-quality';

export class LayerAnimationController {
  private map: mapboxgl.Map | null = null;
  private rafId: number | null = null;
  private activeAnimations = new Set<AnimationId>();
  private lastFrameTime = 0;
  private readonly FRAME_INTERVAL = 33;

  attach(map: mapboxgl.Map) {
    this.map = map;
  }

  start(id: AnimationId) {
    this.activeAnimations.add(id);
    if (!this.rafId) this.tick();
  }

  stop(id: AnimationId) {
    this.activeAnimations.delete(id);
    if (this.activeAnimations.size === 0 && this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  dispose() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.activeAnimations.clear();
    this.map = null;
  }

  private tick = () => {
    this.rafId = requestAnimationFrame(this.tick);
    const now = performance.now();
    if (now - this.lastFrameTime < this.FRAME_INTERVAL) return;
    this.lastFrameTime = now;
    if (!this.map) return;

    const t = now / 1000;
    for (const id of this.activeAnimations) {
      switch (id) {
        case 'earthquake': this.animateEarthquake(t); break;
        case 'wildfire': this.animateWildfire(t); break;
        case 'traffic': this.animateTraffic(t); break;
        case 'weather-precip': this.animateWeatherPrecip(t); break;
        case 'air-quality': this.animateAirQuality(t); break;
      }
    }
  };

  private animateEarthquake(t: number) {
    const map = this.map!;
    const cycle = 2.5;

    for (let i = 0; i < 3; i++) {
      const layerId = `earthquake-ripple-${i + 1}`;
      if (!map.getLayer(layerId)) continue;

      const phase = ((t / cycle) + (i / 3)) % 1;
      const scale = 1 + phase * 2.5;
      const opacity = 0.3 * (1 - phase);

      map.setPaintProperty(layerId, 'circle-radius', [
        'interpolate', ['linear'], ['get', 'magnitude'],
        2.0, 6 * scale, 3.0, 10 * scale, 4.0, 16 * scale, 5.0, 24 * scale,
      ] as mapboxgl.Expression);
      map.setPaintProperty(layerId, 'circle-opacity', opacity);
    }
  }

  private animateWildfire(t: number) {
    const map = this.map!;
    if (!map.getLayer('wildfire-glow')) return;

    const pulse = Math.sin(t * 3) * 0.5 + 0.5;
    const expand = 8 + pulse * 14;

    map.setPaintProperty('wildfire-glow', 'circle-radius', [
      'case',
      ['==', ['get', 'status'], 'active'],
      ['interpolate', ['linear'], ['get', 'affectedArea'],
        5, 10 + expand, 50, 18 + expand, 100, 26 + expand, 200, 34 + expand,
      ],
      ['interpolate', ['linear'], ['get', 'affectedArea'],
        5, 10, 50, 16, 100, 24, 200, 32,
      ],
    ] as mapboxgl.Expression);
    map.setPaintProperty('wildfire-glow', 'circle-opacity', [
      'case',
      ['==', ['get', 'status'], 'active'],
      0.1 + pulse * 0.15,
      0.06,
    ] as mapboxgl.Expression);
  }

  private animateTraffic(t: number) {
    const map = this.map!;
    if (!map.getLayer('traffic-glow')) return;

    const pulse = Math.sin(t * 4) * 0.5 + 0.5;

    map.setPaintProperty('traffic-glow', 'line-width', [
      'interpolate', ['linear'], ['zoom'],
      10, ['match', ['get', 'congestion'], 'congested', 5 + pulse * 4, 'slow', 4 + pulse * 2, 3],
      14, ['match', ['get', 'congestion'], 'congested', 10 + pulse * 6, 'slow', 8 + pulse * 3, 6],
    ] as mapboxgl.Expression);
    map.setPaintProperty('traffic-glow', 'line-opacity', [
      'match', ['get', 'congestion'],
      'congested', 0.15 + pulse * 0.15,
      'slow', 0.1 + pulse * 0.05,
      'smooth', 0.06,
      0.06,
    ] as mapboxgl.Expression);
  }

  private animateWeatherPrecip(t: number) {
    const map = this.map!;
    if (!map.getLayer('weather-precip-ring')) return;

    const pulse = Math.sin(t * 2.5) * 0.5 + 0.5;
    const ringRadius = 14 + pulse * 10;

    map.setPaintProperty('weather-precip-ring', 'circle-radius', [
      'interpolate', ['linear'], ['zoom'],
      5, ringRadius * 0.6, 10, ringRadius, 14, ringRadius * 1.5,
    ] as mapboxgl.Expression);
    map.setPaintProperty('weather-precip-ring', 'circle-opacity', 0.15 + (1 - pulse) * 0.2);
  }

  private animateAirQuality(t: number) {
    const map = this.map!;
    if (!map.getLayer('air-quality-pulse')) return;

    const pulse = Math.sin(t * 2) * 0.5 + 0.5;
    const expand = pulse * 6;

    map.setPaintProperty('air-quality-pulse', 'circle-radius', [
      'interpolate', ['linear'], ['zoom'],
      8, 8 + expand, 14, 16 + expand,
    ] as mapboxgl.Expression);
    map.setPaintProperty('air-quality-pulse', 'circle-opacity', [
      'match', ['get', 'grade'],
      'unhealthy', 0.15 + pulse * 0.1,
      'very_unhealthy', 0.2 + pulse * 0.15,
      'hazardous', 0.25 + pulse * 0.2,
      0,
    ] as mapboxgl.Expression);
  }
}

export const LAYER_ANIMATION_MAP: Partial<Record<string, AnimationId>> = {
  'earthquake': 'earthquake',
  'wildfire': 'wildfire',
  'traffic': 'traffic',
  'weather-forecast': 'weather-precip',
  'air-quality': 'air-quality',
};
