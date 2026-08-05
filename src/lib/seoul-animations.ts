import type mapboxgl from 'mapbox-gl';

// 서울 기후 대시보드 전용 애니메이션.
// src/lib/layer-animations.ts 의 LayerAnimationController 패턴을 그대로 따른다
// (30fps rAF 루프에서 paint 속성만 갱신).

export type SeoulAnimationId = 'air-ping' | 'cai-ping' | 'heat-breathe' | 'vulnerable-flash';

const FRAME_INTERVAL = 33;

export class SeoulAnimationController {
  private map: mapboxgl.Map | null = null;
  private rafId: number | null = null;
  private active = new Set<SeoulAnimationId>();
  private lastFrameTime = 0;

  attach(map: mapboxgl.Map) {
    this.map = map;
  }

  start(id: SeoulAnimationId) {
    this.active.add(id);
    if (!this.rafId) this.tick();
  }

  stop(id: SeoulAnimationId) {
    this.active.delete(id);
    if (this.active.size === 0 && this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  dispose() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.active.clear();
    this.map = null;
  }

  private tick = () => {
    this.rafId = requestAnimationFrame(this.tick);

    const now = performance.now();
    if (now - this.lastFrameTime < FRAME_INTERVAL) return;
    this.lastFrameTime = now;
    if (!this.map) return;

    const t = now / 1000;
    for (const id of this.active) {
      switch (id) {
        case 'air-ping': this.ping(t, 'seoul-air-ping', 6, 34); break;
        case 'cai-ping': this.ping(t, 'seoul-cai-ping', 18, 58); break;
        case 'heat-breathe': this.heatBreathe(t); break;
        case 'vulnerable-flash': this.vulnerableFlash(t); break;
      }
    }
  };

  // 관측지점에서 퍼져나가는 레이더 핑. 수신이 살아 있다는 신호.
  // 전체 주기의 70%에서 퍼짐이 끝나고 나머지 30%는 쉰다.
  // 리셋 시점에는 투명도가 이미 0이라 크기 점프가 보이지 않는다.
  private ping(t: number, layerId: string, from: number, to: number) {
    const map = this.map!;
    if (!map.getLayer(layerId)) return;

    const CYCLE = 3.5;
    const ACTIVE = 0.7;
    const raw = (t % CYCLE) / CYCLE;

    if (raw >= ACTIVE) {
      map.setPaintProperty(layerId, 'circle-radius', from);
      map.setPaintProperty(layerId, 'circle-opacity', 0);
      map.setPaintProperty(layerId, 'circle-stroke-opacity', 0);
      return;
    }

    const phase = raw / ACTIVE;
    const eased = 1 - Math.pow(1 - phase, 3);

    map.setPaintProperty(layerId, 'circle-radius', from + (to - from) * eased);
    map.setPaintProperty(layerId, 'circle-opacity', 0);
    map.setPaintProperty(layerId, 'circle-stroke-opacity', 0.45 * (1 - phase * phase));
  }

  // 열섬 레이어가 아주 천천히 밝아졌다 어두워진다.
  private heatBreathe(t: number) {
    const map = this.map!;
    if (!map.getLayer('seoul-heat-fill')) return;

    const CYCLE = 6;
    const wave = (Math.sin((t / CYCLE) * Math.PI * 2) + 1) / 2;
    map.setPaintProperty('seoul-heat-fill', 'fill-opacity', 0.46 + wave * 0.16);
  }

  // 폭염 취약지 경고선 점멸.
  private vulnerableFlash(t: number) {
    const map = this.map!;
    if (!map.getLayer('seoul-vulnerable-line')) return;

    const CYCLE = 1.6;
    const wave = (Math.sin((t / CYCLE) * Math.PI * 2) + 1) / 2;
    map.setPaintProperty('seoul-vulnerable-line', 'line-opacity', 0.45 + wave * 0.5);
    map.setPaintProperty('seoul-vulnerable-line', 'line-width', 1.6 + wave * 1.2);
  }
}
