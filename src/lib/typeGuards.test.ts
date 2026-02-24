import { describe, expect, it } from 'vitest';
import {
  isRecord,
  isNumber,
  isCoordinateArray,
  isUsgsFeature,
  parseUsgsFeatures,
  isFeature,
} from './typeGuards';

describe('typeGuards', () => {
  it('isRecord detects objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord('nope')).toBe(false);
  });

  it('isNumber accepts finite numbers only', () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber(-3.2)).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber(Infinity)).toBe(false);
    expect(isNumber('1')).toBe(false);
  });

  it('isCoordinateArray validates coordinate tuples', () => {
    expect(isCoordinateArray([100, 13, 5])).toBe(true);
    expect(isCoordinateArray([100, 13])).toBe(false);
    expect(isCoordinateArray([100, '13', 5])).toBe(false);
  });

  it('isUsgsFeature validates feature structure', () => {
    const feature = {
      id: 'eq1',
      properties: { mag: 4.2, time: 123456, place: 'Somewhere', url: 'http://x' },
      geometry: { coordinates: [120.5, 14.2, 10] },
    };

    expect(isUsgsFeature(feature)).toBe(true);
    expect(isUsgsFeature({ ...feature, id: 123 })).toBe(false);
    expect(isUsgsFeature({ ...feature, properties: { ...feature.properties, time: 'x' } })).toBe(false);
    expect(isUsgsFeature({ ...feature, geometry: { coordinates: [120.5, 14.2] } })).toBe(false);
    expect(isUsgsFeature({ ...feature, properties: { ...feature.properties, mag: 'x' } })).toBe(false);
  });

  it('parseUsgsFeatures filters invalid items', () => {
    const valid = {
      id: 'eq1',
      properties: { mag: 2.1, time: 100 },
      geometry: { coordinates: [1, 2, 3] },
    };
    const invalid = { id: 2 };

    const result = parseUsgsFeatures({ features: [valid, invalid] });
    expect(result.features.length).toBe(1);
    expect(result.hasInvalid).toBe(true);
  });

  it('parseUsgsFeatures returns empty on invalid payload', () => {
    const result = parseUsgsFeatures({ nope: true });
    expect(result.features).toEqual([]);
    expect(result.hasInvalid).toBe(true);
  });

  it('isFeature matches GeoJSON feature shape', () => {
    expect(isFeature({ type: 'Feature' })).toBe(true);
    expect(isFeature({ type: 'FeatureCollection' })).toBe(false);
  });
});
