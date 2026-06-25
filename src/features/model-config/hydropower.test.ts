import { describe, expect, it } from 'vitest';
import {
  buildHydropowerEtaPayload,
  buildHydropowerHeadPayload,
  buildHydropowerSavePayload,
  hydropowerDefinition,
  validateHydropowerParameters,
} from './hydropower';

const values = {
  modelName: 'Hydro-1',
  totalEfficiency: 0.84,
  turbineEfficiency: 0.9,
  generatorEfficiency: 0.95,
  transmissionEfficiency: 0.98,
  head: 10,
  upstreamElevation: 100,
  downstreamElevation: 90,
  upstreamVelocity: 2,
  downstreamVelocity: 1,
  upstreamDensity: 1000,
  downstreamDensity: 1000,
  specificWeight: 9810,
  gravity: 9.81,
  carbonEmissionFactor: 0,
  cost: 0.03,
  purchaseCost: 200000,
};

describe('hydropower model definition', () => {
  it('uses the legacy hydropower endpoint and readonly derived fields', () => {
    expect(hydropowerDefinition.endpoint).toBe('model/hydro_power_plant');
    expect(hydropowerDefinition.fields.find(field => field.key === 'totalEfficiency')?.readOnly).toBe(true);
    expect(hydropowerDefinition.fields.find(field => field.key === 'head')?.readOnly).toBe(true);
  });

  it('keeps the legacy hydropower formulas with field focus mapping', () => {
    expect(hydropowerDefinition.formula?.title).toBe('小水电机组配置');
    expect(hydropowerDefinition.formula?.rows.map(row => row.tokens.map(token => token.text).join(''))).toEqual([
      'Pₕ=η×A×H',
      'η=η1×η2×η3',
      'H=(z1+ρ1/ρg+v1²/2g)-(z2+ρ2/ρg+v2²/2g)',
    ]);
    expect(hydropowerDefinition.formula?.rows.flatMap(row => row.tokens).find(token => token.text === 'η1')?.fieldKey)
      .toBe('turbineEfficiency');
    expect(hydropowerDefinition.formula?.rows.flatMap(row => row.tokens).find(token => token.text === 'z1')?.fieldKey)
      .toBe('upstreamElevation');
  });

  it('maps editable values to the legacy save DTO', () => {
    expect(buildHydropowerSavePayload(5, values)).toEqual({
      id: 5,
      modelName: 'Hydro-1',
      eta1: 0.9,
      eta2: 0.95,
      eta3: 0.98,
      z1: 100,
      z2: 90,
      v1: 2,
      v2: 1,
      p1: 1000,
      p2: 1000,
      pg: 9810,
      g: 9.81,
      carbonEmissionFactor: 0,
      cost: 0.03,
      purchaseCost: 200000,
    });
  });

  it('builds calculation payloads for efficiency and head', () => {
    expect(buildHydropowerEtaPayload(values)).toEqual({ eta1: 0.9, eta2: 0.95, eta3: 0.98 });
    expect(buildHydropowerHeadPayload(values)).toEqual({
      z1: 100,
      z2: 90,
      v1: 2,
      v2: 1,
      p1: 1000,
      p2: 1000,
      pg: 9810,
      g: 9.81,
    });
  });

  it('validates efficiencies and divisors', () => {
    expect(validateHydropowerParameters(values)).toBeUndefined();
    expect(validateHydropowerParameters({ ...values, turbineEfficiency: 1.1 })).toBe('效率参数必须在 0 到 1 之间');
    expect(validateHydropowerParameters({ ...values, gravity: 0 })).toBe('重力加速度和 ρg 必须大于 0');
  });

  it('uses short placeholders for editable numeric inputs', () => {
    const fields = Object.fromEntries(hydropowerDefinition.fields.map(field => [field.key, field]));

    expect(fields.turbineEfficiency.step).toBe(0.01);
    expect(fields.generatorEfficiency.step).toBe(0.01);
    expect(fields.transmissionEfficiency.step).toBe(0.01);
    expect(fields.turbineEfficiency.placeholder).toBe('0.90');
    expect(fields.generatorEfficiency.placeholder).toBe('0.95');
    expect(fields.transmissionEfficiency.placeholder).toBe('0.98');
    expect(fields.turbineEfficiency.control).toBe('slider-number');
    expect(fields.generatorEfficiency.control).toBe('slider-number');
    expect(fields.transmissionEfficiency.control).toBe('slider-number');
    expect(fields.upstreamElevation.placeholder).toBe('100');
    expect(fields.downstreamElevation.placeholder).toBe('90');
    expect(fields.upstreamVelocity.placeholder).toBe('2');
    expect(fields.downstreamVelocity.placeholder).toBe('1');
    expect(fields.upstreamDensity.columnStart).toBe(1);
    expect(fields.upstreamVelocity.columnStart).toBe(1);
    expect(fields.gravity.max).toBe(10);
    expect(fields.cost.placeholder).toBe('0.030');
    expect(fields.purchaseCost.placeholder).toBe('200000');
  });

  it('orders head-related fields by formula groups', () => {
    expect(hydropowerDefinition.fields.map(field => field.key)).toEqual([
      'totalEfficiency',
      'turbineEfficiency',
      'generatorEfficiency',
      'transmissionEfficiency',
      'head',
      'upstreamElevation',
      'downstreamElevation',
      'upstreamDensity',
      'downstreamDensity',
      'specificWeight',
      'gravity',
      'upstreamVelocity',
      'downstreamVelocity',
      'carbonEmissionFactor',
      'cost',
      'purchaseCost',
    ]);
  });
});
