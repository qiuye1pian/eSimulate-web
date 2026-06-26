import { describe, expect, it } from 'vitest';
import {
  buildThermalStorageSavePayload,
  thermalStorageDefinition,
  validateThermalStorageParameters,
} from './thermal-storage';

const values = {
  modelName: 'ThermalStorage-1',
  totalStorageCapacity: 10000,
  currentStorage: 5000,
  thermalLossRate: 0.01,
  chargingEfficiency: 0.9,
  dischargingEfficiency: 0.88,
  carbonEmissionFactor: 0,
  cost: 0.07,
  purchaseCost: 7000000,
};

describe('thermal storage model definition', () => {
  it('uses the legacy thermal saver endpoint', () => {
    expect(thermalStorageDefinition.endpoint).toBe('model/thermal-saver');
    expect(thermalStorageDefinition.title).toBe('热储能');
  });

  it('maps editable values to the legacy save DTO', () => {
    expect(buildThermalStorageSavePayload(51, values)).toEqual({
      id: 51,
      modelName: 'ThermalStorage-1',
      totalStorageCapacity: 10000,
      currentStorage: 5000,
      thermalLossRate: 0.01,
      chargingEfficiency: 0.9,
      dischargingEfficiency: 0.88,
      carbonEmissionFactor: 0,
      cost: 0.07,
      purchaseCost: 7000000,
    });
  });

  it('validates storage capacity and ratio parameters', () => {
    expect(validateThermalStorageParameters(values)).toBeUndefined();
    expect(validateThermalStorageParameters({ ...values, currentStorage: 12000 })).toBe('当前热储容量必须小于或等于总热储能容量');
    expect(validateThermalStorageParameters({ ...values, thermalLossRate: 1.2 })).toBe('热损失率和效率参数必须在 0 到 1 之间');
  });

  it('keeps legacy slider controls and precision', () => {
    const fields = Object.fromEntries(thermalStorageDefinition.fields.map(field => [field.key, field]));

    expect(fields.thermalLossRate.control).toBe('slider-number');
    expect(fields.chargingEfficiency.control).toBe('slider-number');
    expect(fields.dischargingEfficiency.control).toBe('slider-number');
    expect(fields.thermalLossRate.step).toBe(0.01);
    expect(fields.chargingEfficiency.step).toBe(0.01);
    expect(fields.dischargingEfficiency.step).toBe(0.01);
    expect(fields.cost.max).toBe(99_999_999);
    expect(fields.purchaseCost.max).toBe(99_999_999_999);
  });

  it('shows the legacy thermal balance formula', () => {
    const formulaText = thermalStorageDefinition.formula?.rows
      .flatMap(row => row.tokens.map(token => token.text))
      .join('');

    expect(formulaText).toContain('HHS(t)');
    expect(formulaText).toContain('QHS_ch(t)');
    expect(formulaText).toContain('QHS_dis(t)');
    expect(formulaText).toContain('/ηhdis');
  });

  it('maps backend records into form values with defaults', () => {
    expect(thermalStorageDefinition.mapRecordToValues({
      modelName: 'Thermal-A',
      totalStorageCapacity: 1,
      currentStorage: 2,
      thermalLossRate: 0.03,
      chargingEfficiency: 0.4,
      dischargingEfficiency: 0.5,
      carbonEmissionFactor: 6,
      cost: 7,
      purchaseCost: 8,
    })).toEqual({
      modelName: 'Thermal-A',
      totalStorageCapacity: 1,
      currentStorage: 2,
      thermalLossRate: 0.03,
      chargingEfficiency: 0.4,
      dischargingEfficiency: 0.5,
      carbonEmissionFactor: 6,
      cost: 7,
      purchaseCost: 8,
    });
  });
});
