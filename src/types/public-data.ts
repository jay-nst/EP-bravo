export interface PublicDataStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface AirQualityReading extends PublicDataStation {
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
  no2: number | null;
  co: number | null;
  so2: number | null;
  grade: 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';
  dataTime: string;
}

export interface AwsObservation extends PublicDataStation {
  temp: number | null;
  humidity: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  rainfall1h: number | null;
  pressure: number | null;
  observedAt: string;
}

export interface TrafficLink {
  linkId: string;
  speed: number;
  travelTime: number;
  congestion: 'smooth' | 'slow' | 'congested';
  coordinates: [number, number][];
}

export interface WeatherForecast extends PublicDataStation {
  temperature: number | null;
  sky: 'clear' | 'partly_cloudy' | 'cloudy' | 'overcast';
  precipitation: 'none' | 'rain' | 'rain_snow' | 'snow' | 'shower';
  precipAmount: number | null;
  humidity: number | null;
  windSpeed: number | null;
  forecastTime: string;
}

export interface WildfireReport {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'contained' | 'extinguished';
  affectedArea: number;
  startedAt: string;
  description: string;
}

export interface EarthquakeEvent {
  id: string;
  lat: number;
  lng: number;
  magnitude: number;
  depth: number;
  location: string;
  occurredAt: string;
  maxIntensity: number;
}

export type PublicLayerId =
  | 'air-quality'
  | 'aws-weather'
  | 'traffic'
  | 'buildings-3d'
  | 'weather-forecast'
  | 'wildfire'
  | 'earthquake';
