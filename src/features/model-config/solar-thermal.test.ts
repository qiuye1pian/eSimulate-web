import { describe, expect, it } from 'vitest';
import {
  buildSolarThermalSavePayload,
  solarThermalDefinition,
  validateSolarThermalParameters,
} from './solar-thermal';

const values = {
  modelName: 'CSP-1',
  conversionEfficiency: 0.75,
  collectorArea: 500,
  carbonEmissionFactor: 0,
  cost: 0.04,
  purchaseCost: 300000,
};

describe('solar thermal model definition', () => {
  it('uses the legacy thermal-power endpoint', () => {
    expect(solarThermalDefinition.endpoint).toBe('model/thermal-power');
    expect(solarThermalDefinition.title).toBe('太阳能集热');
  });

  it('maps editable values to the legacy save DTO', () => {
    expect(buildSolarThermalSavePayload(13, values)).toEqual({
      id: 13,
      modelName: 'CSP-1',
      etaSF: 0.75,
      SSF: 500,
      carbonEmissionFactor: 0,
      cost: 0.04,
      purchaseCost: 300000,
    });
  });

  it('validates conversion efficiency and collector area', () => {
    expect(validateSolarThermalParameters(values)).toBeUndefined();
    expect(validateSolarThermalParameters({ ...values, conversionEfficiency: 1.2 })).toBe('光热转换效率必须在 0 到 1 之间');
    expect(validateSolarThermalParameters({ ...values, collectorArea: 0 })).toBe('太阳集热器采光面积必须大于 0');
  });

  it('uses short placeholders for editable numeric inputs', () => {
    const fields = Object.fromEntries(solarThermalDefinition.fields.map(field => [field.key, field]));

    expect(fields.conversionEfficiency.step).toBe(0.01);
    expect(fields.conversionEfficiency.control).toBe('slider-number');
    expect(fields.conversionEfficiency.placeholder).toBe('0.75');
    expect(fields.collectorArea.placeholder).toBe('500');
    expect(fields.cost.placeholder).toBe('0.040');
    expect(fields.purchaseCost.placeholder).toBe('300000');
  });

  it('maps backend records into form values with defaults', () => {
    expect(solarThermalDefinition.mapRecordToValues({
      modelName: 'CSP-A',
      etaSF: 0.8,
      SSF: 600,
      carbonEmissionFactor: 1,
      cost: 2,
      purchaseCost: 3,
    })).toEqual({
      modelName: 'CSP-A',
      conversionEfficiency: 0.8,
      collectorArea: 600,
      carbonEmissionFactor: 1,
      cost: 2,
      purchaseCost: 3,
    });
  });
});
