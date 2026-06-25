import { describe, expect, it } from 'vitest';
import {
  buildPumpedStorageSavePayload,
  pumpedStorageDefinition,
  validatePumpedStorageParameters,
} from './pumped-storage';

const values = {
  modelName: 'Pumped-1',
  maxPower: 1000,
  maxEnergy: 10000,
  chargeEfficiency: 0.8,
  dischargeEfficiency: 0.82,
  stateOfCharge: 5000,
  carbonEmissionFactor: 0,
  cost: 0.07,
  purchaseCost: 7000000,
};

describe('pumped storage model definition', () => {
  it('uses the legacy pumped storage endpoint', () => {
    expect(pumpedStorageDefinition.endpoint).toBe('model/pumped-storage');
    expect(pumpedStorageDefinition.title).toBe('抽水蓄能');
  });

  it('maps editable values to the legacy save DTO', () => {
    expect(buildPumpedStorageSavePayload(41, values)).toEqual({
      id: 41,
      modelName: 'Pumped-1',
      PMax: 1000,
      EMax: 10000,
      etaCh: 0.8,
      etaDis: 0.82,
      lambda: 1,
      stateOfCharge: 5000,
      carbonEmissionFactor: 0,
      cost: 0.07,
      purchaseCost: 7000000,
    });
  });

  it('validates reservoir energy and efficiencies', () => {
    expect(validatePumpedStorageParameters(values)).toBeUndefined();
    expect(validatePumpedStorageParameters({ ...values, stateOfCharge: 12000 })).toBe('上游水库最大储能容量必须大于或等于当前水库储能');
    expect(validatePumpedStorageParameters({ ...values, chargeEfficiency: 1.2 })).toBe('效率参数必须在 0 到 1 之间');
  });

  it('keeps legacy slider controls and precision', () => {
    const fields = Object.fromEntries(pumpedStorageDefinition.fields.map(field => [field.key, field]));

    expect(fields.chargeEfficiency.control).toBe('slider-number');
    expect(fields.dischargeEfficiency.control).toBe('slider-number');
    expect(fields.chargeEfficiency.step).toBe(0.01);
    expect(fields.dischargeEfficiency.step).toBe(0.01);
    expect(fields.purchaseCost.max).toBe(99_999_999_999);
  });

  it('maps backend records into form values with defaults', () => {
    expect(pumpedStorageDefinition.mapRecordToValues({
      modelName: 'Pumped-A',
      PMax: 1,
      EMax: 2,
      etaCh: 0.3,
      etaDis: 0.4,
      stateOfCharge: 5,
      carbonEmissionFactor: 6,
      cost: 7,
      purchaseCost: 8,
    })).toEqual({
      modelName: 'Pumped-A',
      maxPower: 1,
      maxEnergy: 2,
      chargeEfficiency: 0.3,
      dischargeEfficiency: 0.4,
      stateOfCharge: 5,
      carbonEmissionFactor: 6,
      cost: 7,
      purchaseCost: 8,
    });
  });
});
