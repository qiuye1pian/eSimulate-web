import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'SimulationSelector.tsx'), 'utf8');

describe('SimulationSelector display text', () => {
  it('does not render record IDs as user-facing helper text', () => {
    expect(source).not.toContain('ID:');
    expect(source).not.toContain('未提供 ID');
  });
});
