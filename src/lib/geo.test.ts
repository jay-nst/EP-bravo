import { describe, it, expect } from 'vitest';
import { calculateAreaKm2, calculatePrice, validateAoi } from './geo';

describe('calculateAreaKm2', () => {
  it('returns 0 for invalid polygon (fewer than 4 coordinates)', () => {
    const polygon: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 1]]],
    };
    expect(calculateAreaKm2(polygon)).toBe(0);
  });

  it('calculates area for a roughly 1km x 1km square near Seoul', () => {
    // ~1km x ~1km square around Seoul (37.5°N, 127°E)
    const polygon: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [[
        [127.0, 37.5],
        [127.009, 37.5],    // ~1km east
        [127.009, 37.509],  // ~1km north
        [127.0, 37.509],
        [127.0, 37.5],
      ]],
    };
    const area = calculateAreaKm2(polygon);
    // Should be roughly 1 km², allow 50% margin for approximation
    expect(area).toBeGreaterThan(0.5);
    expect(area).toBeLessThan(1.5);
  });

  it('returns positive area regardless of winding order', () => {
    const cw: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [[
        [126.9, 37.4],
        [126.9, 37.5],
        [127.0, 37.5],
        [127.0, 37.4],
        [126.9, 37.4],
      ]],
    };
    const ccw: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [[
        [126.9, 37.4],
        [127.0, 37.4],
        [127.0, 37.5],
        [126.9, 37.5],
        [126.9, 37.4],
      ]],
    };
    expect(calculateAreaKm2(cw)).toBeGreaterThan(0);
    expect(calculateAreaKm2(ccw)).toBeGreaterThan(0);
  });
});

describe('calculatePrice', () => {
  it('calculates Observer price at $7/km²', () => {
    expect(calculatePrice(10, 'observer')).toBe(70);
  });

  it('calculates SpaceEye-T price at $15/km²', () => {
    expect(calculatePrice(25, 'spaceeye-t')).toBe(375);
  });

  it('rounds to 2 decimal places', () => {
    expect(calculatePrice(3.333, 'observer')).toBe(23.33);
  });
});

describe('validateAoi', () => {
  it('returns null for valid Observer order (>= 1km²)', () => {
    expect(validateAoi(5, 'observer')).toBeNull();
  });

  it('returns null for valid SpaceEye-T order (>= 25km²)', () => {
    expect(validateAoi(30, 'spaceeye-t')).toBeNull();
  });

  it('rejects Observer order below 1km²', () => {
    const error = validateAoi(0.5, 'observer');
    expect(error).toContain('1km²');
  });

  it('rejects SpaceEye-T order below 25km²', () => {
    const error = validateAoi(10, 'spaceeye-t');
    expect(error).toContain('25km²');
  });

  it('rejects orders exceeding 10,000km²', () => {
    const error = validateAoi(15000, 'observer');
    expect(error).toContain('10,000km²');
  });
});
