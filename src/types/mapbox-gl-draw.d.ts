declare module '@mapbox/mapbox-gl-draw' {
  import type { Map, IControl } from 'mapbox-gl';

  interface DrawOptions {
    displayControlsDefault?: boolean;
    controls?: {
      point?: boolean;
      line_string?: boolean;
      polygon?: boolean;
      trash?: boolean;
      combine_features?: boolean;
      uncombine_features?: boolean;
    };
    defaultMode?: string;
  }

  class MapboxDraw implements IControl {
    constructor(options?: DrawOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
    getAll(): GeoJSON.FeatureCollection;
    deleteAll(): this;
    getSelectedIds(): string[];
  }

  export default MapboxDraw;
}
