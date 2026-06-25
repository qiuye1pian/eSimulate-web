import { describe, expect, it } from 'vitest';
import {
  batteryDefinition,
  buildBatterySavePayload,
  validateBatteryParameters,
} from './battery';

const values = {
  modelName: 'Battery-1',
  capacity: 10000,
  initialEnergy: 5000,
  socMin: 0.1,
  socMax: 0.9,
  selfDischargeRate: 0.01,
  chargePower: 3000,
  dischargePower: 2500,
  chargeEfficiency: 0.95,
  dischargeEfficiency: 0.9,
  carbonEmissionFactor: 0,
  cost: 0.02,
  purchaseCost: 120000,
};

describe('battery model definition', () => {
  it('uses the legacy battery endpoint and model formula', () => {
    expect(batteryDefinition.endpoint).toBe('model/battery');
    expect(batteryDefinition.formula?.title).toBe('电储能容量更新');
    expect(batteryDefinition.formula?.rows.map(row => row.tokens.map(token => token.text).join(''))).toEqual([
      'EESS,t=(1-μ)EESS,t-1+[PESS,in,tηhch-PESS,dis,t/ηhdis]⋅Δt',
    ]);
    expect(batteryDefinition.formula?.rows[0].tokens.find(token => token.text === 'μ')?.fieldKey).toBe('selfDischargeRate');
    expect(batteryDefinition.formula?.rows[0].tokens.find(token => token.text === 'ηhch')?.fieldKey).toBe('chargeEfficiency');
  });

  it('maps editable values to the legacy battery save DTO', () => {
    expect(buildBatterySavePayload(7, values)).toEqual({
      id: 7,
      modelName: 'Battery-1',
      ct: 10000,
      EESSt: 5000,
      SOCMin: 0.1,
      SOCMax: 0.9,
      mu: 0.01,
      maxChargePower: 3000,
      maxDischargePower: 2500,
      etaHch: 0.95,
      etaHDis: 0.9,
      carbonEmissionFactor: 0,
      cost: 0.02,
      purchaseCost: 120000,
    });
  });

  it('validates SOC, efficiencies, and charge/discharge power ordering', () => {
    expect(validateBatteryParameters(values)).toBeUndefined();
    expect(validateBatteryParameters({ ...values, socMin: 0.95 })).toBe('SOC 最小值必须小于或等于 SOC 最大值');
    expect(validateBatteryParameters({ ...values, chargeEfficiency: 1.2 })).toBe('SOC、损失率和效率参数必须在 0 到 1 之间');
    expect(validateBatteryParameters({ ...values, chargePower: 2000, dischargePower: 2500 })).toBe('蓄电池充电功率必须大于或等于放电功率');
  });

  it('uses the requested decimal precision hints for ratio inputs', () => {
    const fields = Object.fromEntries(batteryDefinition.fields.map(field => [field.key, field]));

    expect(fields.socMin.step).toBe(0.001);
    expect(fields.socMin.control).toBe('slider-number');
    expect(fields.socMin.placeholder).toBe('0.001');
    expect(fields.socMax.step).toBe(0.001);
    expect(fields.socMax.control).toBe('slider-number');
    expect(fields.socMax.placeholder).toBe('0.999');
    expect(fields.selfDischargeRate.step).toBe(0.00001);
    expect(fields.selfDischargeRate.control).toBe('slider-number');
    expect(fields.selfDischargeRate.placeholder).toBe('0.00001');
    expect(fields.chargeEfficiency.step).toBe(0.001);
    expect(fields.chargeEfficiency.control).toBe('slider-number');
    expect(fields.chargeEfficiency.placeholder).toBe('0.950');
    expect(fields.dischargeEfficiency.step).toBe(0.001);
    expect(fields.dischargeEfficiency.control).toBe('slider-number');
    expect(fields.dischargeEfficiency.placeholder).toBe('0.950');
  });

  it('leaves precision hinted ratio inputs empty so placeholders are visible', () => {
    const fields = Object.fromEntries(batteryDefinition.fields.map(field => [field.key, field]));

    expect(fields.socMin.defaultValue).toBeUndefined();
    expect(fields.socMax.defaultValue).toBeUndefined();
    expect(fields.selfDischargeRate.defaultValue).toBeUndefined();
    expect(fields.chargeEfficiency.defaultValue).toBeUndefined();
    expect(fields.dischargeEfficiency.defaultValue).toBeUndefined();
  });

  it('maps backend records into form values with defaults', () => {
    expect(batteryDefinition.mapRecordToValues({
      modelName: 'Battery-A',
      ct: 1,
      EESSt: 2,
      SOCMin: 0.2,
      SOCMax: 0.8,
      mu: 0.03,
      maxChargePower: 4,
      maxDischargePower: 3,
      etaHch: 0.96,
      etaHDis: 0.91,
      carbonEmissionFactor: 5,
      cost: 6,
      purchaseCost: 7,
    })).toEqual({
      modelName: 'Battery-A',
      capacity: 1,
      initialEnergy: 2,
      socMin: 0.2,
      socMax: 0.8,
      selfDischargeRate: 0.03,
      chargePower: 4,
      dischargePower: 3,
      chargeEfficiency: 0.96,
      dischargeEfficiency: 0.91,
      carbonEmissionFactor: 5,
      cost: 6,
      purchaseCost: 7,
    });
  });
});
