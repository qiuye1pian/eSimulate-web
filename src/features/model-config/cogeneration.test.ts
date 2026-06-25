import { describe, expect, it } from 'vitest';
import {
  buildCogenerationSavePayload,
  cogenerationDefinition,
  validateCogenerationParameters,
} from './cogeneration';

const values = {
  modelName: 'CHP-1',
  minHeatPower: 50,
  maxHeatPower: 200,
  rampUpRate: 10,
  rampDownRate: 10,
  electricEfficiency: 0.35,
  heatLossRate: 0.05,
  cop: 0.8,
  flueGasRecoveryRate: 0.6,
  costA: 0,
  costB: 0,
  costC: 0,
  gasLowHeatValue: 9.7,
  carbonEmissionFactor: 0,
  cost: 0.1,
  purchaseCost: 8000000,
};

describe('cogeneration model definition', () => {
  it('uses the legacy cogeneration endpoint', () => {
    expect(cogenerationDefinition.endpoint).toBe('model/cogeneration');
    expect(cogenerationDefinition.title).toBe('热电联产');
  });

  it('maps editable values to the legacy save DTO', () => {
    expect(buildCogenerationSavePayload(31, values)).toEqual({
      id: 31,
      modelName: 'CHP-1',
      PMin: 50,
      PMax: 200,
      rampUpRate: 10,
      rampDownRate: 10,
      etaElectric: 0.35,
      etaLoss: 0.05,
      COP: 0.8,
      flueGasRecoveryRate: 0.6,
      a: 0,
      b: 0,
      c: 0,
      cv: 9.7,
      carbonEmissionFactor: 0,
      cost: 0.1,
      purchaseCost: 8000000,
    });
  });

  it('validates power ordering, efficiency sum, and ramp rates', () => {
    expect(validateCogenerationParameters(values)).toBeUndefined();
    expect(validateCogenerationParameters({ ...values, maxHeatPower: 40 })).toBe('最大供热功率必须大于或等于最小供热功率');
    expect(validateCogenerationParameters({ ...values, electricEfficiency: 0.8, heatLossRate: 0.3 })).toBe('发电效率和散热损失率之和必须小于或等于 1');
    expect(validateCogenerationParameters({ ...values, rampDownRate: 0 })).toBe('爬坡功率必须大于或等于 1');
  });

  it('keeps legacy slider controls and precision', () => {
    const fields = Object.fromEntries(cogenerationDefinition.fields.map(field => [field.key, field]));

    expect(fields.electricEfficiency.control).toBe('slider-number');
    expect(fields.heatLossRate.control).toBe('slider-number');
    expect(fields.cop.control).toBe('slider-number');
    expect(fields.cop.min).toBe(1);
    expect(fields.cop.max).toBe(3);
    expect(fields.cop.step).toBe(0.01);
    expect(fields.cop.defaultValue).toBe(1.2);
    expect(fields.flueGasRecoveryRate.control).toBe('slider-number');
    expect(fields.costA.control).toBe('slider-number');
    expect(fields.costB.control).toBe('slider-number');
    expect(fields.costC.control).toBe('slider-number');
    expect(fields.electricEfficiency.step).toBe(0.01);
    expect(fields.costB.max).toBe(50);
    expect(fields.costC.max).toBe(100);
    expect(fields.purchaseCost.max).toBe(99_999_999_999);
  });

  it('maps backend records into form values with defaults', () => {
    expect(cogenerationDefinition.mapRecordToValues({
      modelName: 'CHP-A',
      PMin: 1,
      PMax: 2,
      rampUpRate: 3,
      rampDownRate: 4,
      etaElectric: 0.5,
      etaLoss: 0.1,
      COP: 6,
      flueGasRecoveryRate: 0.7,
      a: 8,
      b: 9,
      c: 10,
      cv: 11,
      carbonEmissionFactor: 12,
      cost: 13,
      purchaseCost: 14,
    })).toEqual({
      modelName: 'CHP-A',
      minHeatPower: 1,
      maxHeatPower: 2,
      rampUpRate: 3,
      rampDownRate: 4,
      electricEfficiency: 0.5,
      heatLossRate: 0.1,
      cop: 6,
      flueGasRecoveryRate: 0.7,
      costA: 8,
      costB: 9,
      costC: 10,
      gasLowHeatValue: 11,
      carbonEmissionFactor: 12,
      cost: 13,
      purchaseCost: 14,
    });
  });
});
