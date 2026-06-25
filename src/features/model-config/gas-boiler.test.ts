import { describe, expect, it } from 'vitest';
import {
  buildGasBoilerSavePayload,
  gasBoilerDefinition,
  validateGasBoilerParameters,
} from './gas-boiler';

const values = {
  modelName: 'GasBoiler-1',
  combustionEfficiency: 0.9,
  gasEnergyDensity: 10,
  carbonEmissionFactor: 0,
  cost: 0.12,
  purchaseCost: 200000,
};

describe('gas boiler model definition', () => {
  it('uses the legacy gas boiler endpoint', () => {
    expect(gasBoilerDefinition.endpoint).toBe('model/gas-boiler');
    expect(gasBoilerDefinition.title).toBe('燃气锅炉');
  });

  it('maps editable values to the legacy save DTO', () => {
    expect(buildGasBoilerSavePayload(17, values)).toEqual({
      id: 17,
      modelName: 'GasBoiler-1',
      etaGB: 0.9,
      gasEnergyDensity: 10,
      carbonEmissionFactor: 0,
      cost: 0.12,
      purchaseCost: 200000,
    });
  });

  it('validates combustion efficiency and gas energy density', () => {
    expect(validateGasBoilerParameters(values)).toBeUndefined();
    expect(validateGasBoilerParameters({ ...values, combustionEfficiency: 1.2 })).toBe('燃烧效率必须在 0 到 1 之间');
    expect(validateGasBoilerParameters({ ...values, gasEnergyDensity: 13 })).toBe('天然气热值必须在 8 到 12 kWh/m³ 之间');
  });

  it('keeps the legacy slider precision and gas heat-value help', () => {
    const fields = Object.fromEntries(gasBoilerDefinition.fields.map(field => [field.key, field]));

    expect(fields.combustionEfficiency.control).toBe('slider-number');
    expect(fields.combustionEfficiency.step).toBe(0.01);
    expect(fields.combustionEfficiency.placeholder).toBe('0.90');
    expect(fields.gasEnergyDensity.min).toBe(8);
    expect(fields.gasEnergyDensity.max).toBe(12);
    expect(fields.gasEnergyDensity.placeholder).toBe('10.00');
    expect(fields.gasEnergyDensity.help?.rows).toHaveLength(2);
  });

  it('maps backend records into form values with defaults', () => {
    expect(gasBoilerDefinition.mapRecordToValues({
      modelName: 'GasBoiler-A',
      etaGB: 0.88,
      gasEnergyDensity: 10.3,
      carbonEmissionFactor: 1,
      cost: 2,
      purchaseCost: 3,
    })).toEqual({
      modelName: 'GasBoiler-A',
      combustionEfficiency: 0.88,
      gasEnergyDensity: 10.3,
      carbonEmissionFactor: 1,
      cost: 2,
      purchaseCost: 3,
    });
  });
});
