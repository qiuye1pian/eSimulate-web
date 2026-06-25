import { describe, expect, it } from 'vitest';
import {
  buildSolarPowerGraphPayload,
  buildSolarPowerSavePayload,
  solarPowerDefinition,
  validateSolarPowerParameters,
} from './solar-power';

const values = {
  modelName: 'PV-100',
  ratedPower: 100,
  referenceTemperature: 25,
  temperatureCoefficient: -0.0045,
  referenceIrradiance: 1000,
  carbonEmissionFactor: 0,
  cost: 0.02,
  purchaseCost: 120000,
};

describe('solar power model definition', () => {
  it('uses the old solar-power endpoint and 3D graph', () => {
    expect(solarPowerDefinition.endpoint).toBe('model/solar-power');
    expect(solarPowerDefinition.graphType).toBe('solar-3d');
    expect(solarPowerDefinition.graphFields).toEqual([
      'ratedPower',
      'referenceTemperature',
      'temperatureCoefficient',
      'referenceIrradiance',
    ]);
  });

  it('maps form values to the old backend save DTO', () => {
    expect(buildSolarPowerSavePayload(11, values)).toEqual({
      id: 11,
      modelName: 'PV-100',
      ppvN: 100,
      tref: 25,
      te: -0.0045,
      gref: 1000,
      carbonEmissionFactor: 0,
      cost: 0.02,
      purchaseCost: 120000,
    });
  });

  it('maps output parameters to the old graph DTO', () => {
    expect(buildSolarPowerGraphPayload(values)).toEqual({
      ppvN: 100,
      tref: 25,
      te: -0.0045,
      gref: 1000,
    });
  });

  it('requires a negative or zero temperature coefficient and positive reference irradiance', () => {
    expect(validateSolarPowerParameters(values)).toBeUndefined();
    expect(validateSolarPowerParameters({ ...values, temperatureCoefficient: 0.1 })).toBe('环境温度系数必须小于或等于 0');
    expect(validateSolarPowerParameters({ ...values, referenceIrradiance: 0 })).toBe('标准辐照强度必须大于 0');
  });

  it('uses short placeholders for editable numeric inputs', () => {
    const fields = Object.fromEntries(solarPowerDefinition.fields.map(field => [field.key, field]));

    expect(fields.ratedPower.placeholder).toBe('100');
    expect(fields.referenceTemperature.placeholder).toBe('25');
    expect(fields.temperatureCoefficient.placeholder).toBe('-0.0045');
    expect(fields.referenceIrradiance.placeholder).toBe('1000');
    expect(fields.cost.placeholder).toBe('0.020');
    expect(fields.purchaseCost.placeholder).toBe('120000');
  });
});
