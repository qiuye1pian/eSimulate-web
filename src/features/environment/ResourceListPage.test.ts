import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'ResourceListPage.tsx'), 'utf8');

describe('ResourceListPage', () => {
  it('keeps the legacy resource operations available in the polished workspace', () => {
    expect(source).toContain('resource-workspace__catalog');
    expect(source).toContain('resource-workspace__main');
    expect(source).toContain('uploadResourceScheme');
    expect(source).toContain('downloadResource');
    expect(source).toContain('deleteResource');
    expect(source).toContain('CurvePreview');
  });

  it('uses a list catalog instead of the old full-width table layout', () => {
    expect(source).toContain('List');
    expect(source).toContain('Pagination');
    expect(source).not.toContain('Table');
  });
});
