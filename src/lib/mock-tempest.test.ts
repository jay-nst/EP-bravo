import { describe, it, expect } from 'vitest';
import { TEMPEST_GEOJSON, TEMPEST_LANE_CARDS } from './mock-tempest';

describe('TEMPEST_GEOJSON', () => {
  it('is a valid FeatureCollection', () => {
    expect(TEMPEST_GEOJSON.type).toBe('FeatureCollection');
    expect(TEMPEST_GEOJSON.features.length).toBeGreaterThan(0);
  });

  it('all features have required properties', () => {
    for (const feature of TEMPEST_GEOJSON.features) {
      expect(feature.type).toBe('Feature');
      expect(feature.properties.id).toBeTruthy();
      expect(feature.properties.event_type).toBeTruthy();
      expect(feature.properties.severity).toBeTruthy();
      expect(feature.properties.title).toBeTruthy();
      expect(feature.properties.timestamp).toBeTruthy();
      expect(feature.properties.location_name).toBeTruthy();
    }
  });

  it('severity values are valid', () => {
    const validSeverities = ['critical', 'high', 'moderate', 'low'];
    for (const feature of TEMPEST_GEOJSON.features) {
      expect(validSeverities).toContain(feature.properties.severity);
    }
  });

  it('event_type values are valid', () => {
    const validTypes = ['earthquake', 'flood', 'wildfire', 'typhoon', 'landslide', 'volcanic'];
    for (const feature of TEMPEST_GEOJSON.features) {
      expect(validTypes).toContain(feature.properties.event_type);
    }
  });

  it('timestamps are valid ISO 8601', () => {
    for (const feature of TEMPEST_GEOJSON.features) {
      const date = new Date(feature.properties.timestamp);
      expect(date.getTime()).not.toBeNaN();
    }
  });

  it('features have unique IDs', () => {
    const ids = TEMPEST_GEOJSON.features.map((f) => f.properties.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('TEMPEST_LANE_CARDS', () => {
  it('has at least 1 card', () => {
    expect(TEMPEST_LANE_CARDS.length).toBeGreaterThan(0);
  });

  it('all cards have required fields', () => {
    for (const card of TEMPEST_LANE_CARDS) {
      expect(card.id).toBeTruthy();
      expect(card.title).toBeTruthy();
      expect(card.summary).toBeTruthy();
      expect(card.event_type).toBeTruthy();
      expect(card.severity).toBeTruthy();
      expect(card.location_name).toBeTruthy();
    }
  });

  it('cards have unique IDs', () => {
    const ids = TEMPEST_LANE_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
