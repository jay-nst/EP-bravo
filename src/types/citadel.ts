export type CitadelEventType =
  | 'earthquake'
  | 'flood'
  | 'wildfire'
  | 'typhoon'
  | 'landslide'
  | 'volcanic';

export type CitadelSeverity = 'critical' | 'high' | 'moderate' | 'low';

export interface CitadelFeatureProperties {
  id: string;
  event_type: CitadelEventType;
  severity: CitadelSeverity;
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

export interface CitadelFeature {
  type: 'Feature';
  geometry: GeoJSON.Geometry;
  properties: CitadelFeatureProperties;
}

export interface CitadelFeatureCollection {
  type: 'FeatureCollection';
  features: CitadelFeature[];
}

export interface CitadelLaneCard {
  id: string;
  title: string;
  summary: string;
  event_type: CitadelEventType;
  severity: CitadelSeverity;
  location_name: string;
  timestamp: string;
  thumbnail_url: string | null;
  has_satellite_imagery: boolean;
}
