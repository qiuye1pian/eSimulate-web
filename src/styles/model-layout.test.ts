import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'global.css'), 'utf8');

describe('model workspace layout styles', () => {
  it('keeps formula visual panels compact instead of using chart height', () => {
    expect(source).toContain('.model-workspace__main--formula');
    expect(source).toContain('grid-template-rows: auto auto;');
    expect(source).toContain('.model-workspace__formula');
    expect(source).toContain('min-height: 0;');
  });
});
