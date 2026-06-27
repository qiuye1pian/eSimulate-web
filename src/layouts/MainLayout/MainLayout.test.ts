import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'index.tsx'), 'utf8');

describe('MainLayout responsive navigation', () => {
  it('collapses the side navigation on narrow screens', () => {
    expect(source).toContain('breakpoint="lg"');
    expect(source).toContain('collapsedWidth={0}');
  });

  it('uses the current platform name in the header', () => {
    expect(source).toContain('综合能源仿真优化平台');
  });
});
