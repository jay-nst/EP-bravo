export type TempestEventType =
  | 'earthquake'
  | 'flood'
  | 'wildfire'
  | 'typhoon'
  | 'landslide'
  | 'volcanic';

export type TempestSeverity = 'critical' | 'high' | 'moderate' | 'low';

export interface TempestFeatureProperties {
  id: string;
  event_type: TempestEventType;
  severity: TempestSeverity;
  title: string;
  description: string;
  affected_area_km2: number;
  affected_population: number | null;
  timestamp: string;
  source: string;
  location_name: string;
  country_code: string;
  satellite_image_id: string | null;
}

export interface TempestFeature {
  type: 'Feature';
  geometry: GeoJSON.Geometry;
  properties: TempestFeatureProperties;
}

export interface TempestFeatureCollection {
  type: 'FeatureCollection';
  features: TempestFeature[];
}

export interface TempestLaneCard {
  id: string;
  title: string;
  summary: string;
  event_type: TempestEventType;
  severity: TempestSeverity;
  location_name: string;
  timestamp: string;
  thumbnail_url: string | null;
  has_satellite_imagery: boolean;
}
