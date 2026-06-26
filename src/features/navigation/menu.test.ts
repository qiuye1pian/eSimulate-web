import { describe, expect, it } from 'vitest';
import { getOpenMenuKeys } from './menu';

describe('getOpenMenuKeys', () => {
  it('opens the model menu for a direct model route visit', () => {
    expect(getOpenMenuKeys('/model/thermal-power-unit')).toEqual(['model']);
  });
});
