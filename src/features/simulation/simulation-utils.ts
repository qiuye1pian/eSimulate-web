import type { EnvironmentEndpoint } from '@/services/environment';
import type { ModelEndpoint } from '@/services/model-config';
import type { ApiRecord } from '@/types/api';
import type {
  EnvironmentDto,
  EnvironmentTypeEnum,
  LoadDto,
  LoadTypeEnum,
  ModelTypeEnum,
  SimulationModelDto,
  SimulationRequest,
} from '@/types/domain';

export type SimulationLoadKey = 'electric-load' | 'thermal-load';
export type SimulationEnvironmentKey = 'wind' | 'water-flow' | 'sunlight' | 'temperature';
export type SimulationModelKey =
  | 'wind-power'
  | 'solar-power'
  | 'hydropower'
  | 'battery'
  | 'solar-thermal'
  | 'gas-boiler'
  | 'thermal-storage'
  | 'grid-pricing'
  | 'cogeneration'
  | 'thermal-power-unit'
  | 'pumped-storage';

export interface SimulationLoadDefinition {
  key: SimulationLoadKey;
  title: string;
  endpoint: EnvironmentEndpoint;
  dtoType: LoadTypeEnum;
  searchField: 'schemeName' | 'modelName';
}

export interface SimulationEnvironmentDefinition {
  key: SimulationEnvironmentKey;
  title: string;
  endpoint: EnvironmentEndpoint;
  dtoType: EnvironmentTypeEnum;
  searchField: 'schemeName' | 'modelName';
}

export interface SimulationModelDefinition {
  key: SimulationModelKey;
  title: string;
  endpoint: ModelEndpoint | EnvironmentEndpoint;
  dtoType: ModelTypeEnum;
  searchField: 'schemeName' | 'modelName';
  requiresQuantity: boolean;
}

export interface SimulationSelectionState {
  loads: Partial<Record<SimulationLoadKey, ApiRecord[]>>;
  environments: Partial<Record<SimulationEnvironmentKey, ApiRecord[]>>;
  models: Partial<Record<SimulationModelKey, ApiRecord[]>>;
  quantities: Record<string, number | undefined>;
}

export interface SimulationIndicator {
  indicationName?: string;
  description?: string;
  indication?: number;
  [key: string]: unknown;
}

export interface SimulationPieIndicator {
  indicationName: string;
  label: string;
  partOne: string;
  partTwo: string;
  partOneValue: number;
  partTwoValue: number;
}

export interface NormalizedSimulationResult {
  resultType?: string;
  message?: string;
  statIndicators: SimulationIndicator[];
  pieIndicators: SimulationPieIndicator[];
  electricStackedChart?: unknown;
  thermalStackedChart?: unknown;
}

export const simulationLoadDefinitions: SimulationLoadDefinition[] = [
  {
    key: 'electric-load',
    title: '电负荷',
    endpoint: 'load/electric-load-schemes',
    dtoType: 'ElectricLoad',
    searchField: 'schemeName',
  },
  {
    key: 'thermal-load',
    title: '热负荷',
    endpoint: 'load/thermal-load-schemes',
    dtoType: 'ThermalLoad',
    searchField: 'schemeName',
  },
];

export const simulationModelDefinitions: SimulationModelDefinition[] = [
  {
    key: 'wind-power',
    title: '风电',
    endpoint: 'model/wind-power',
    dtoType: 'WindPower',
    searchField: 'modelName',
    requiresQuantity: true,
  },
  {
    key: 'solar-power',
    title: '光伏',
    endpoint: 'model/solar-power',
    dtoType: 'SolarPower',
    searchField: 'modelName',
    requiresQuantity: true,
  },
  {
    key: 'hydropower',
    title: '小水电',
    endpoint: 'model/hydro_power_plant',
    dtoType: 'HydroPower',
    searchField: 'modelName',
    requiresQuantity: true,
  },
  {
    key: 'battery',
    title: '电储能',
    endpoint: 'model/battery',
    dtoType: 'Battery',
    searchField: 'modelName',
    requiresQuantity: true,
  },
  {
    key: 'solar-thermal',
    title: '太阳能集热',
    endpoint: 'model/thermal-power',
    dtoType: 'ThermalPower',
    searchField: 'modelName',
    requiresQuantity: true,
  },
  {
    key: 'gas-boiler',
    title: '燃气锅炉',
    endpoint: 'model/gas-boiler',
    dtoType: 'GasBoiler',
    searchField: 'modelName',
    requiresQuantity: true,
  },
  {
    key: 'thermal-storage',
    title: '热储能',
    endpoint: 'model/thermal-saver',
    dtoType: 'ThermalSaver',
    searchField: 'modelName',
    requiresQuantity: true,
  },
  {
    key: 'grid-pricing',
    title: '电网电价',
    endpoint: 'model/grid',
    dtoType: 'Grid',
    searchField: 'modelName',
    requiresQuantity: false,
  },
  {
    key: 'cogeneration',
    title: '热电联产',
    endpoint: 'model/cogeneration',
    dtoType: 'Cogeneration',
    searchField: 'modelName',
    requiresQuantity: true,
  },
  {
    key: 'thermal-power-unit',
    title: '火电机组',
    endpoint: 'model/thermal-power-unit',
    dtoType: 'ThermalPowerUnit',
    searchField: 'modelName',
    requiresQuantity: true,
  },
  {
    key: 'pumped-storage',
    title: '抽水蓄能',
    endpoint: 'model/pumped-storage',
    dtoType: 'PumpedStorage',
    searchField: 'modelName',
    requiresQuantity: true,
  },
];

export const simulationEnvironmentDefinitions: SimulationEnvironmentDefinition[] = [
  {
    key: 'wind',
    title: '风力',
    endpoint: 'environment/wind-speed',
    dtoType: 'WindSpeed',
    searchField: 'schemeName',
  },
  {
    key: 'water-flow',
    title: '水流',
    endpoint: 'environment/water-speed',
    dtoType: 'WaterSpeed',
    searchField: 'schemeName',
  },
  {
    key: 'sunlight',
    title: '光照',
    endpoint: 'environment/sunlight',
    dtoType: 'Sunlight',
    searchField: 'schemeName',
  },
  {
    key: 'temperature',
    title: '温度',
    endpoint: 'environment/temperature',
    dtoType: 'Temperature',
    searchField: 'schemeName',
  },
];

export function getRecordId(record: ApiRecord) {
  return record.id as number | string | undefined;
}

export function getRecordDisplayName(record: ApiRecord) {
  return String(record.schemeName ?? record.modelName ?? record.name ?? '-');
}

export function getQuantityKey(definitionKey: SimulationModelKey, recordId: number | string) {
  return `${definitionKey}:${recordId}`;
}

export function buildSimulationRequest(state: SimulationSelectionState): SimulationRequest {
  const loadDtoList = simulationLoadDefinitions.flatMap<LoadDto>((definition) =>
    (state.loads[definition.key] ?? []).flatMap((record) => {
      const id = getRecordId(record);
      return id === undefined ? [] : [{ id, loadTypeEnum: definition.dtoType }];
    }));

  const environmentDtoList = simulationEnvironmentDefinitions.flatMap<EnvironmentDto>((definition) =>
    (state.environments[definition.key] ?? []).flatMap((record) => {
      const id = getRecordId(record);
      return id === undefined ? [] : [{ id, environmentTypeEnum: definition.dtoType }];
    }));

  const modelDtoList = simulationModelDefinitions.flatMap<SimulationModelDto>((definition) =>
    (state.models[definition.key] ?? []).flatMap((record) => {
      const id = getRecordId(record);
      if (id === undefined) {
        return [];
      }
      const dto: SimulationModelDto = { id, modelTypeEnum: definition.dtoType };
      if (definition.requiresQuantity) {
        dto.quantity = state.quantities[getQuantityKey(definition.key, id)] ?? 0;
      }
      return [dto];
    }));

  return {
    environmentDtoList,
    loadDtoList,
    modelDtoList,
  };
}

function toNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

const pieIndicatorMeta: Record<string, Omit<SimulationPieIndicator, 'partOneValue' | 'partTwoValue'>> = {
  RenewableEnergyShare: {
    indicationName: 'RenewableEnergyShare',
    label: '可再生能源占比',
    partOne: '可再生能源',
    partTwo: '不可再生能源',
  },
  CurtailmentRate: {
    indicationName: 'CurtailmentRate',
    label: '弃风弃光率',
    partOne: '弃风弃光',
    partTwo: '已用风电光电',
  },
};

export function normalizeSimulationResult(data: ApiRecord): NormalizedSimulationResult {
  const indicationList = Array.isArray(data.indicationList) ? data.indicationList as SimulationIndicator[] : [];
  const pieIndicators: SimulationPieIndicator[] = [];
  const statIndicators: SimulationIndicator[] = [];

  indicationList.forEach((indicator) => {
    const name = String(indicator.indicationName ?? '');
    const meta = pieIndicatorMeta[name];
    if (meta) {
      const value = toNumber(indicator.indication);
      pieIndicators.push({
        ...meta,
        partOneValue: value,
        partTwoValue: 100 - value,
      });
      return;
    }
    statIndicators.push(indicator);
  });

  return {
    resultType: typeof data.resultType === 'string' ? data.resultType : undefined,
    message: typeof data.message === 'string' ? data.message : undefined,
    statIndicators,
    pieIndicators,
    electricStackedChart: data.electricStackedChartDto,
    thermalStackedChart: data.thermalStackedChartDto,
  };
}
