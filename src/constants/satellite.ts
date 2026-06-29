import type { SatelliteType } from '@/types/database';

export const SATELLITE_CONFIG: Record<
  SatelliteType,
  {
    name: string;
    resolution: string;
    supersolution: string;
    pricePerKm2: number;
    minAreaKm2: number;
  }
> = {
  observer: {
    name: 'Observer',
    resolution: '1.5m',
    supersolution: '1m',
    pricePerKm2: 7,
    minAreaKm2: 1,
  },
  'spaceeye-t': {
    name: 'SpaceEye-T',
    resolution: '25cm',
    supersolution: '8.3cm',
    pricePerKm2: 15,
    minAreaKm2: 25,
  },
};

export const EARTH_TASKING_PRICE_PER_KM2 = 12;

export const CHAT_LIMITS: Record<string, number> = {
  free: 1000,
  pro: 20000,
  annual: 20000,
};
