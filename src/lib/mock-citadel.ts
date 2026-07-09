import type {
  CitadelFeatureCollection,
  CitadelLaneCard,
} from '@/types/citadel';

export const CITADEL_GEOJSON: CitadelFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [129.05, 35.85],
            [129.25, 35.85],
            [129.25, 35.95],
            [129.05, 35.95],
            [129.05, 35.85],
          ],
        ],
      },
      properties: {
        id: 'citadel-001',
        event_type: 'earthquake',
        severity: 'high',
        title: '경주 규모 4.3 지진 영향 분석',
        description:
          'SpaceEye-T 25cm 영상으로 분석한 경주 지진 영향 범위. 건물 피해 14건, 도로 균열 3건 탐지.',
        affected_area_km2: 42.5,
        affected_population: 12400,
        timestamp: '2026-06-28T14:22:00Z',
        source: 'KMA + SpaceEye-T',
        location_name: '경상북도 경주시',
        country_code: 'KR',
        satellite_image_id: 'se-t-20260628-kr-gyeongju',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [126.8, 34.7],
            [127.1, 34.7],
            [127.1, 34.9],
            [126.8, 34.9],
            [126.8, 34.7],
          ],
        ],
      },
      properties: {
        id: 'citadel-002',
        event_type: 'flood',
        severity: 'critical',
        title: '전남 집중호우 침수 피해 모니터링',
        description:
          '72시간 누적 강수량 340mm. 하천 범람으로 농경지 860ha 침수. 위성 변화탐지로 침수 범위 추적 중.',
        affected_area_km2: 186.3,
        affected_population: 34200,
        timestamp: '2026-07-01T06:00:00Z',
        source: 'KMA + Sentinel-2 + SpaceEye-T',
        location_name: '전라남도 순천시',
        country_code: 'KR',
        satellite_image_id: 'se-t-20260701-kr-suncheon',
      },
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.75, 35.68],
      },
      properties: {
        id: 'citadel-003',
        event_type: 'typhoon',
        severity: 'moderate',
        title: '태풍 GAEMI 진로 및 영향 예측',
        description:
          '태풍 GAEMI 예상 진로 분석. 현재 오키나와 남동쪽 400km. 48시간 내 한반도 영향 가능성 평가.',
        affected_area_km2: 0,
        affected_population: null,
        timestamp: '2026-07-02T00:00:00Z',
        source: 'JMA + JTWC',
        location_name: 'Western Pacific',
        country_code: 'JP',
        satellite_image_id: null,
      },
    },
  ],
};

export const CITADEL_LANE_CARDS: CitadelLaneCard[] = [
  {
    id: 'citadel-card-001',
    title: '전남 집중호우 침수 피해 모니터링',
    summary:
      '72시간 340mm 집중호우. 농경지 860ha 침수, 위성 변화탐지로 실시간 추적.',
    event_type: 'flood',
    severity: 'critical',
    location_name: '전라남도 순천시',
    timestamp: '2026-07-01T06:00:00Z',
    thumbnail_url: '/images/placeholder-flood.jpg',
    has_satellite_imagery: true,
  },
  {
    id: 'citadel-card-002',
    title: '경주 규모 4.3 지진 영향 분석',
    summary:
      'SpaceEye-T 25cm 영상 기반 건물 피해 14건, 도로 균열 3건 탐지.',
    event_type: 'earthquake',
    severity: 'high',
    location_name: '경상북도 경주시',
    timestamp: '2026-06-28T14:22:00Z',
    thumbnail_url: '/images/placeholder-earthquake.jpg',
    has_satellite_imagery: true,
  },
];
