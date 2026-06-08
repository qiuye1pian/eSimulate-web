import { describe, expect, it } from 'vitest';
import { normalizeModelPage } from './model-config';

describe('normalizeModelPage', () => {
  it('normalizes the old model page content shape', () => {
    expect(normalizeModelPage({
      page: 1,
      size: 10,
      total: 1,
      content: [{ id: 1, modelName: 'WT-1000' }],
    })).toEqual({
      page: 1,
      size: 10,
      total: 1,
      list: [{ id: 1, modelName: 'WT-1000' }],
    });
  });
});
