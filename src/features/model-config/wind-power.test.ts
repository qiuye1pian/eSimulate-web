import { describe, expect, it } from 'vitest';
import {
  buildWindPowerGraphPayload,
  buildWindPowerSavePayload,
  validateWindSpeedOrder,
  windPowerDefinition,
} from './wind-power';

const values = {
  modelName: 'WT-1000',
  ratedPower: 1000,
  cutInSpeed: 3,
  ratedSpeed: 12,
  cutOutSpeed: 25,
  carbonEmissionFactor: 0,
  cost: 0.1,
  purchaseCost: 5000000,
};

describe('wind power model definition', () => {
  it('uses the old wind-power endpoint', () => {
    expect(windPowerDefinition.endpoint).toBe('model/wind-power');
    expect(windPowerDefinition.graphFields).toEqual(['ratedPower', 'cutInSpeed', 'ratedSpeed', 'cutOutSpeed']);
  });

  it('maps form values to the old backend save DTO', () => {
    expect(buildWindPowerSavePayload(9, values)).toEqual({
      id: 9,
      modelName: 'WT-1000',
      P_r: 1000,
      v_in: 3,
      v_n: 12,
      v_out: 25,
      carbonEmissionFactor: 0,
      cost: 0.1,
      purchaseCost: 5000000,
    });
  });

  it('maps output parameters to the old graph DTO', () => {
    expect(buildWindPowerGraphPayload(values)).toEqual({
      P_r: 1000,
      v_in: 3,
      v_n: 12,
      v_out: 25,
    });
  });

  it('requires cut-in <= rated <= cut-out wind speed', () => {
    expect(validateWindSpeedOrder(values)).toBeUndefined();
    expect(validateWindSpeedOrder({ ...values, cutInSpeed: 13 })).toBe('切入风速必须小于或等于额定风速');
    expect(validateWindSpeedOrder({ ...values, cutOutSpeed: 11 })).toBe('切出风速必须大于或等于额定风速');
  });
});
