import type { SatelliteType } from '@/types/database';
import { SATELLITE_CONFIG } from '@/constants/satellite';

/**
 * Calculate the area of a GeoJSON polygon in square kilometers.
 * Uses the Shoelace formula with WGS84 approximation.
 */
export function calculateAreaKm2(polygon: GeoJSON.Polygon): number {
  const coords = polygon.coordinates[0];
  if (!coords || coords.length < 4) return 0;

  let area = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lon1, lat1] = coords[i];
    const [lon2, lat2] = coords[i + 1];
    // Spherical excess approximation
    area += toRadians(lon2 - lon1) *
      (2 + Math.sin(toRadians(lat1)) + Math.sin(toRadians(lat2)));
  }
  area = Math.abs(area * 6371 * 6371 / 2);
  return Math.round(area * 100) / 100;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate the total price for an AOI purchase.
 */
export function calculatePrice(
  areaKm2: number,
  satellite: SatelliteType,
): number {
  const config = SATELLITE_CONFIG[satellite];
  return Math.round(areaKm2 * config.pricePerKm2 * 100) / 100;
}

/**
 * Validate AOI constraints before payment.
 * Returns null if valid, or an error message if invalid.
 */
export function validateAoi(
  areaKm2: number,
  satellite: SatelliteType,
): string | null {
  const config = SATELLITE_CONFIG[satellite];

  if (areaKm2 < config.minAreaKm2) {
    return `${config.name} 최소 주문 면적은 ${config.minAreaKm2}km²입니다. 현재: ${areaKm2}km²`;
  }

  if (areaKm2 > 10000) {
    return `최대 주문 면적은 10,000km²입니다. 현재: ${areaKm2}km²`;
  }

  return null;
}
