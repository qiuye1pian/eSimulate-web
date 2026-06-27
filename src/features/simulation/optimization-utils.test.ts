import { describe, expect, it } from 'vitest';
import {
  buildOptimizationRequest,
  defaultOptimizationParameters,
  normalizeOptimizationResult,
  type OptimizationBoundsState,
  type OptimizationParameters,
} from './optimization-utils';
import type { SimulationSelectionState } from './simulation-utils';

describe('optimization request builder', () => {
  it('maps selections and model bounds to the PSO request DTO', () => {
    const selection: SimulationSelectionState = {
      loads: {
        'electric-load': [{ id: 1, schemeName: '电负荷 A' }],
        'thermal-load': [{ id: 2, schemeName: '热负荷 A' }],
      },
      environments: {
        wind: [{ id: 3, schemeName: '风力 A' }],
        'water-flow': [{ id: 4, schemeName: '水流 A' }],
        sunlight: [{ id: 5, schemeName: '光照 A' }],
        temperature: [{ id: 6, schemeName: '温度 A' }],
      },
      models: {
        'wind-power': [{ id: 7, modelName: '风机 A' }],
        'solar-power': [{ id: 8, modelName: '光伏 A' }],
        'grid-pricing': [{ id: 9, modelName: '电价 A' }],
      },
      quantities: {},
    };
    const bounds: OptimizationBoundsState = {
      'wind-power:7': { lowerBound: 2, upperBound: 20 },
      'solar-power:8': { lowerBound: 3, upperBound: 30 },
    };
    const parameters: OptimizationParameters = {
      ...defaultOptimizationParameters,
      particleCount: 8,
      maxIterations: 60,
    };

    expect(buildOptimizationRequest(selection, bounds, parameters)).toEqual({
      loadDtoList: [
        { id: 1, loadTypeEnum: 'ElectricLoad' },
        { id: 2, loadTypeEnum: 'ThermalLoad' },
      ],
      environmentDtoList: [
        { id: 3, environmentTypeEnum: 'WindSpeed' },
        { id: 4, environmentTypeEnum: 'WaterSpeed' },
        { id: 5, environmentTypeEnum: 'Sunlight' },
        { id: 6, environmentTypeEnum: 'Temperature' },
      ],
      modelDimensionDtoList: [
        { id: 7, modelTypeEnum: 'WindPower', lowerBound: 2, upperBound: 20 },
        { id: 8, modelTypeEnum: 'SolarPower', lowerBound: 3, upperBound: 30 },
        { id: 9, modelTypeEnum: 'Grid' },
      ],
      particleCount: 8,
      maxIterations: 60,
      inertiaWeightStart: 1.4,
      inertiaWeightEnd: 0.8,
      c1Start: 2.5,
      c1End: 0.5,
      c2Start: 1.5,
      c2End: 0.75,
      maxCurtailmentRate: 50,
      minRenewableEnergyShare: 50,
    });
  });

  it('defaults missing bounds to the legacy range', () => {
    const request = buildOptimizationRequest({
      loads: {},
      environments: {},
      models: { battery: [{ id: 'b1', modelName: '电储能 A' }] },
      quantities: {},
    }, {}, defaultOptimizationParameters);

    expect(request.modelDimensionDtoList).toEqual([
      { id: 'b1', modelTypeEnum: 'Battery', lowerBound: 1, upperBound: 50 },
    ]);
  });
});

describe('optimization result normalizer', () => {
  it('builds stable table columns and rows from backend position titles', () => {
    expect(normalizeOptimizationResult({
      positionTitle: ['风电', '约束', '约束信息'],
      taskDetailList: [
        { positionAndValue: [3, false, '不满足约束'], fitnessValue: 100 },
        { positionAndValue: [2, true, ''], fitnessValue: 80 },
      ],
    })).toEqual({
      columns: [
        { key: 'index', title: '序号' },
        { key: 'field-0', title: '风电' },
        { key: 'field-1', title: '约束' },
        { key: 'field-2', title: '约束信息' },
        { key: 'fitnessValue', title: '适应度' },
      ],
      rows: [
        {
          key: 1,
          index: 1,
          'field-0': 3,
          'field-1': false,
          'field-2': '不满足约束',
          constraintMessage: '不满足约束',
          fitnessValue: 100,
        },
        {
          key: 2,
          index: 2,
          'field-0': 2,
          'field-1': true,
          'field-2': '',
          constraintMessage: '',
          fitnessValue: 80,
        },
      ],
    });
  });

  it('finds the constraint message next to the constraint column even when its position changes', () => {
    const result = normalizeOptimizationResult({
      positionTitle: ['风电', '光伏', '约束', '约束信息'],
      taskDetailList: [
        { positionAndValue: [3, 4, false, '弃风弃光率超过50.00%'], fitnessValue: 100 },
      ],
    });

    expect(result.rows[0].constraintMessage).toBe('弃风弃光率超过50.00%');
  });
});
