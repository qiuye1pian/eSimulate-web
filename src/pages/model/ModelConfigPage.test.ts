import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, 'ModelConfigPage.tsx'), 'utf8');

describe('ModelConfigPage model routing', () => {
  it('renders the migrated battery model with the shared editor page', () => {
    expect(source).toContain("import { batteryDefinition } from '@/features/model-config/battery'");
    expect(source).toContain("modelType === 'battery'");
    expect(source).toContain('<ModelEditorPage definition={batteryDefinition} />');
  });
});
