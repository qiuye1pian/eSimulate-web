import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'SchemePage.tsx'), 'utf8');

describe('SchemePage action placement', () => {
  it('places reset in the page header while keeping the simulate action in the configuration panel', () => {
    const headerStart = source.indexOf('simulation-page__header');
    const toolbarStart = source.indexOf('simulation-configuration-toolbar');
    const quantityGridStart = source.indexOf('<div className="simulation-configuration">');
    const resetIndex = source.indexOf('重置');
    const simulateIndex = source.indexOf('开始仿真');

    expect(toolbarStart).toBeGreaterThan(headerStart);
    expect(toolbarStart).toBeLessThan(quantityGridStart);
    expect(resetIndex).toBeGreaterThan(headerStart);
    expect(resetIndex).toBeLessThan(toolbarStart);
    expect(simulateIndex).toBeGreaterThan(toolbarStart);
  });
});
