import { describe, expect, it } from 'vitest';
import {
  buildSimulationRequest,
  getRecordDisplayName,
  normalizeSimulationResult,
  simulationEnvironmentDefinitions,
  simulationLoadDefinitions,
  simulationModelDefinitions,
  type SimulationSelectionState,
} from './simulation-utils';

describe('simulation DTO builder', () => {
  it('maps selected loads, environments, and models to the legacy simulation request', () => {
    const state: SimulationSelectionState = {
      loads: {
        'electric-load': [{ id: 1, schemeName: '电负荷 A' }],
        'thermal-load': [{ id: 2, name: '热负荷 A' }],
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
        hydropower: [{ id: 9, modelName: '水电 A' }],
        battery: [{ id: 10, modelName: '电池 A' }],
        'solar-thermal': [{ id: 11, modelName: '集热 A' }],
        'gas-boiler': [{ id: 12, modelName: '锅炉 A' }],
        'thermal-storage': [{ id: 13, modelName: '热储 A' }],
        'grid-pricing': [{ id: 14, modelName: '电价 A' }],
        cogeneration: [{ id: 15, modelName: '热电 A' }],
        'thermal-power-unit': [{ id: 16, modelName: '火电 A' }],
        'pumped-storage': [{ id: 17, modelName: '抽蓄 A' }],
      },
      quantities: {
        'wind-power:7': 2,
        'solar-power:8': 3,
        'hydropower:9': 4,
        'battery:10': 5,
        'solar-thermal:11': 6,
        'gas-boiler:12': 7,
        'thermal-storage:13': 8,
        'cogeneration:15': 9,
        'thermal-power-unit:16': 10,
        'pumped-storage:17': 11,
      },
    };

    expect(buildSimulationRequest(state)).toEqual({
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
      modelDtoList: [
        { id: 7, modelTypeEnum: 'WindPower', quantity: 2 },
        { id: 8, modelTypeEnum: 'SolarPower', quantity: 3 },
        { id: 9, modelTypeEnum: 'HydroPower', quantity: 4 },
        { id: 10, modelTypeEnum: 'Battery', quantity: 5 },
        { id: 11, modelTypeEnum: 'ThermalPower', quantity: 6 },
        { id: 12, modelTypeEnum: 'GasBoiler', quantity: 7 },
        { id: 13, modelTypeEnum: 'ThermalSaver', quantity: 8 },
        { id: 14, modelTypeEnum: 'Grid' },
        { id: 15, modelTypeEnum: 'Cogeneration', quantity: 9 },
        { id: 16, modelTypeEnum: 'ThermalPowerUnit', quantity: 10 },
        { id: 17, modelTypeEnum: 'PumpedStorage', quantity: 11 },
      ],
    });
  });

  it('defaults missing model quantities to zero and resolves display names from legacy fields', () => {
    const state: SimulationSelectionState = {
      loads: {},
      environments: {},
      models: {
        'wind-power': [{ id: 'w1', modelName: '风机 A' }],
      },
      quantities: {},
    };

    expect(buildSimulationRequest(state).modelDtoList).toEqual([
      { id: 'w1', modelTypeEnum: 'WindPower', quantity: 0 },
    ]);
    expect(getRecordDisplayName({ schemeName: '方案名' })).toBe('方案名');
    expect(getRecordDisplayName({ modelName: '模型名' })).toBe('模型名');
    expect(getRecordDisplayName({ name: '名称' })).toBe('名称');
  });

  it('keeps definition order aligned with the legacy simulation page', () => {
    expect(simulationLoadDefinitions.map(item => item.key)).toEqual(['electric-load', 'thermal-load']);
    expect(simulationModelDefinitions.map(item => item.key)).toEqual([
      'wind-power',
      'solar-power',
      'hydropower',
      'battery',
      'solar-thermal',
      'gas-boiler',
      'thermal-storage',
      'grid-pricing',
      'cogeneration',
      'thermal-power-unit',
      'pumped-storage',
    ]);
    expect(simulationEnvironmentDefinitions.map(item => item.key)).toEqual(['wind', 'water-flow', 'sunlight', 'temperature']);
  });
});

describe('simulation result normalizer', () => {
  it('splits indicators for cards and pie charts while preserving stacked charts', () => {
    const result = normalizeSimulationResult({
      resultType: 'SUCCESS',
      indicationList: [
        { indicationName: 'RenewableEnergyShare', indication: 65 },
        { indicationName: 'CurtailmentRate', indication: 4.5 },
        { indicationName: 'CarbonEmission', description: '碳排放总量', indication: 100.25 },
        { indicationName: 'TotalCost', description: '年度总成本', indication: 200.5 },
      ],
      electricStackedChartDto: { series: [{ name: '风电', data: [1] }] },
      thermalStackedChartDto: { series: [{ name: '热电', data: [2] }] },
    });

    expect(result.pieIndicators).toEqual([
      {
        indicationName: 'RenewableEnergyShare',
        label: '可再生能源占比',
        partOne: '可再生能源',
        partOneValue: 65,
        partTwo: '不可再生能源',
        partTwoValue: 35,
      },
      {
        indicationName: 'CurtailmentRate',
        label: '弃风弃光率',
        partOne: '弃风弃光',
        partOneValue: 4.5,
        partTwo: '已用风电光电',
        partTwoValue: 95.5,
      },
    ]);
    expect(result.statIndicators).toEqual([
      { indicationName: 'CarbonEmission', description: '碳排放总量', indication: 100.25 },
      { indicationName: 'TotalCost', description: '年度总成本', indication: 200.5 },
    ]);
    expect(result.electricStackedChart).toEqual({ series: [{ name: '风电', data: [1] }] });
    expect(result.thermalStackedChart).toEqual({ series: [{ name: '热电', data: [2] }] });
  });
});
