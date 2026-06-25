import { describe, expect, it } from 'vitest';
import {
  buildThermalPowerUnitSavePayload,
  thermalPowerUnitDefinition,
  validateThermalPowerUnitParameters,
} from './thermal-power-unit';

const values = {
  modelName: 'Unit-1',
  maxPower: 600000,
  minPower: 200000,
  startStopCost: 239000,
  costA: 0.785,
  costB: 0.23,
  costC: 25.54,
  rampUpRate: 10000,
  rampDownRate: 10000,
  runningStatus: true,
  minStartupTime: 18,
  minShutdownTime: 18,
  carbonEmissionFactor: 0,
  cost: 0.1,
  purchaseCost: 10000000,
};

describe('thermal power unit model definition', () => {
  it('uses the legacy thermal power unit endpoint', () => {
    expect(thermalPowerUnitDefinition.endpoint).toBe('model/thermal-power-unit');
    expect(thermalPowerUnitDefinition.title).toBe('火电机组');
  });

  it('maps editable values to the legacy save DTO', () => {
    expect(buildThermalPowerUnitSavePayload(21, values)).toEqual({
      id: 21,
      modelName: 'Unit-1',
      maxPower: 600000,
      minPower: 200000,
      startStopCost: 239000,
      a: 0.785,
      b: 0.23,
      c: 25.54,
      rampUpRate: 10000,
      rampDownRate: 10000,
      runningStatus: true,
      auxiliaryRate: 5,
      emissionRate: 1,
      minStartupTime: 18,
      minShutdownTime: 18,
      carbonEmissionFactor: 0,
      cost: 0.1,
      purchaseCost: 10000000,
    });
  });

  it('validates power ordering, cost coefficients, and ramp rates', () => {
    expect(validateThermalPowerUnitParameters(values)).toBeUndefined();
    expect(validateThermalPowerUnitParameters({ ...values, minPower: 700000 })).toBe('最小发电出力必须小于或等于最大发电出力');
    expect(validateThermalPowerUnitParameters({ ...values, costB: 1.2 })).toBe('成本函数 b 必须在 0 到 1 之间');
    expect(validateThermalPowerUnitParameters({ ...values, rampUpRate: 0 })).toBe('爬坡功率必须大于或等于 1');
  });

  it('keeps the legacy controls and precision', () => {
    const fields = Object.fromEntries(thermalPowerUnitDefinition.fields.map(field => [field.key, field]));

    expect(fields.costB.control).toBe('slider-number');
    expect(fields.costA.placeholder).toBe('0.78');
    expect(fields.costB.step).toBe(0.01);
    expect(fields.runningStatus.control).toBe('switch');
    expect(fields.minStartupTime.step).toBe(1);
    expect(fields.minShutdownTime.step).toBe(1);
  });

  it('maps backend records into form values with defaults', () => {
    expect(thermalPowerUnitDefinition.mapRecordToValues({
      modelName: 'Unit-A',
      maxPower: 1,
      minPower: 2,
      startStopCost: 3,
      a: 4,
      b: 0.5,
      c: 6,
      rampUpRate: 7,
      rampDownRate: 8,
      runningStatus: true,
      minStartupTime: 9,
      minShutdownTime: 10,
      carbonEmissionFactor: 11,
      cost: 12,
      purchaseCost: 13,
    })).toEqual({
      modelName: 'Unit-A',
      maxPower: 1,
      minPower: 2,
      startStopCost: 3,
      costA: 4,
      costB: 0.5,
      costC: 6,
      rampUpRate: 7,
      rampDownRate: 8,
      runningStatus: true,
      minStartupTime: 9,
      minShutdownTime: 10,
      carbonEmissionFactor: 11,
      cost: 12,
      purchaseCost: 13,
    });
  });
});
