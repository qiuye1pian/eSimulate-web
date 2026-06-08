import { describe, expect, it } from 'vitest';
import { buildGridPricingPayload } from './GridPricingPage';

describe('buildGridPricingPayload', () => {
  it('builds a create payload without id', () => {
    expect(buildGridPricingPayload(null, {
      modelName: '居民电价',
      gridPrice: 0.52,
      carbonEmissionFactor: 0.58,
    })).toEqual({
      modelName: '居民电价',
      gridPrice: 0.52,
      carbonEmissionFactor: 0.58,
    });
  });

  it('keeps the selected id when saving an existing grid price', () => {
    expect(buildGridPricingPayload(8, {
      modelName: '工业电价',
      gridPrice: 0.78,
      carbonEmissionFactor: 0.61,
    })).toEqual({
      id: 8,
      modelName: '工业电价',
      gridPrice: 0.78,
      carbonEmissionFactor: 0.61,
    });
  });
});
