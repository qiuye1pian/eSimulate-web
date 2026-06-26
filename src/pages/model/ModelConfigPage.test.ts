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

  it('renders the migrated solar thermal model with the shared editor page', () => {
    expect(source).toContain("import { solarThermalDefinition } from '@/features/model-config/solar-thermal'");
    expect(source).toContain("modelType === 'solar-thermal'");
    expect(source).toContain('<ModelEditorPage definition={solarThermalDefinition} />');
  });

  it('renders the migrated gas boiler model with the shared editor page', () => {
    expect(source).toContain("import { gasBoilerDefinition } from '@/features/model-config/gas-boiler'");
    expect(source).toContain("modelType === 'gas-boiler'");
    expect(source).toContain('<ModelEditorPage definition={gasBoilerDefinition} />');
  });

  it('renders the migrated thermal power unit model with the shared editor page', () => {
    expect(source).toContain("import { thermalPowerUnitDefinition } from '@/features/model-config/thermal-power-unit'");
    expect(source).toContain("modelType === 'thermal-power-unit'");
    expect(source).toContain('<ModelEditorPage definition={thermalPowerUnitDefinition} />');
  });

  it('renders the migrated cogeneration model with the shared editor page', () => {
    expect(source).toContain("import { cogenerationDefinition } from '@/features/model-config/cogeneration'");
    expect(source).toContain("modelType === 'cogeneration'");
    expect(source).toContain('<ModelEditorPage definition={cogenerationDefinition} />');
  });

  it('renders the migrated pumped storage model with the shared editor page', () => {
    expect(source).toContain("import { pumpedStorageDefinition } from '@/features/model-config/pumped-storage'");
    expect(source).toContain("modelType === 'pumped-storage'");
    expect(source).toContain('<ModelEditorPage definition={pumpedStorageDefinition} />');
  });

  it('renders the migrated thermal storage model with the shared editor page', () => {
    expect(source).toContain("import { thermalStorageDefinition } from '@/features/model-config/thermal-storage'");
    expect(source).toContain("modelType === 'thermal-storage'");
    expect(source).toContain('<ModelEditorPage definition={thermalStorageDefinition} />');
  });
});
