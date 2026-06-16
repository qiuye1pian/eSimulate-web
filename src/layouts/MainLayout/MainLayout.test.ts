import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'index.tsx'), 'utf8');

describe('MainLayout responsive navigation', () => {
  it('collapses the side navigation on narrow screens', () => {
    expect(source).toContain('breakpoint="lg"');
    expect(source).toContain('collapsedWidth={0}');
  });
});
