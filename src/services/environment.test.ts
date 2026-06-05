import { describe, expect, it } from 'vitest';
import { normalizeResourcePage } from './environment';

describe('normalizeResourcePage', () => {
  it('normalizes the old backend page/content response shape', () => {
    const page = normalizeResourcePage({
      page: 2,
      size: 10,
      total: 23,
      content: [{ id: 1, name: '1 day e-load' }],
    });

    expect(page).toEqual({
      page: 2,
      size: 10,
      total: 23,
      list: [{ id: 1, name: '1 day e-load' }],
    });
  });

  it('keeps modern list response shape compatible', () => {
    const page = normalizeResourcePage({
      page: 1,
      size: 10,
      total: 1,
      list: [{ id: 2, name: 'wind' }],
    });

    expect(page.list).toEqual([{ id: 2, name: 'wind' }]);
  });
});
