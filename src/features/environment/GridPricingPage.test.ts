import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildGridPricingPayload } from './GridPricingPage';

const source = readFileSync(resolve(__dirname, 'GridPricingPage.tsx'), 'utf8');

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

describe('GridPricingPage copy', () => {
  it('uses pricing scheme wording instead of model management wording', () => {
    expect(source).toContain('resource-workspace__catalog');
    expect(source).toContain('resource-workspace__main');
    expect(source).toContain('电价方案');
    expect(source).toContain('电价配置');
    expect(source).toContain('方案名称');
    expect(source).not.toContain('模型管理');
    expect(source).not.toContain('模型配置');
  });
});
