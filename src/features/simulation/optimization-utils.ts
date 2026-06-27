import type { ApiRecord } from '@/types/api';
import type { OptimizationModelDimensionDto, OptimizationRequest } from '@/types/domain';
import {
  getQuantityKey,
  getRecordId,
  simulationEnvironmentDefinitions,
  simulationLoadDefinitions,
  simulationModelDefinitions,
  type SimulationModelKey,
  type SimulationSelectionState,
} from './simulation-utils';

export interface OptimizationParameters {
  particleCount: number;
  maxIterations: number;
  inertiaWeightStart: number;
  inertiaWeightEnd: number;
  c1Start: number;
  c1End: number;
  c2Start: number;
  c2End: number;
  maxCurtailmentRate: number;
  minRenewableEnergyShare: number;
}

export interface OptimizationBound {
  lowerBound?: number;
  upperBound?: number;
}

export type OptimizationBoundsState = Record<string, OptimizationBound | undefined>;

export interface OptimizationColumn {
  key: string;
  title: string;
}

export interface OptimizationTable {
  columns: OptimizationColumn[];
  rows: ApiRecord[];
}

export const defaultOptimizationParameters: OptimizationParameters = {
  particleCount: 4,
  maxIterations: 20,
  inertiaWeightStart: 1.4,
  inertiaWeightEnd: 0.8,
  c1Start: 2.5,
  c1End: 0.5,
  c2Start: 1.5,
  c2End: 0.75,
  maxCurtailmentRate: 50,
  minRenewableEnergyShare: 50,
};

export function buildOptimizationRequest(
  state: SimulationSelectionState,
  bounds: OptimizationBoundsState,
  parameters: OptimizationParameters,
): OptimizationRequest {
  const loadDtoList = simulationLoadDefinitions.flatMap((definition) =>
    (state.loads[definition.key] ?? []).flatMap((record) => {
      const id = getRecordId(record);
      return id === undefined ? [] : [{ id, loadTypeEnum: definition.dtoType }];
    }));

  const environmentDtoList = simulationEnvironmentDefinitions.flatMap((definition) =>
    (state.environments[definition.key] ?? []).flatMap((record) => {
      const id = getRecordId(record);
      return id === undefined ? [] : [{ id, environmentTypeEnum: definition.dtoType }];
    }));

  const modelDimensionDtoList = simulationModelDefinitions.flatMap<OptimizationModelDimensionDto>((definition) =>
    (state.models[definition.key] ?? []).flatMap((record) => {
      const id = getRecordId(record);
      if (id === undefined) {
        return [];
      }
      const dto: OptimizationModelDimensionDto = { id, modelTypeEnum: definition.dtoType };
      if (definition.requiresQuantity) {
        const bound = bounds[getQuantityKey(definition.key as SimulationModelKey, id)];
        dto.lowerBound = bound?.lowerBound ?? 1;
        dto.upperBound = bound?.upperBound ?? 50;
      }
      return [dto];
    }));

  return {
    environmentDtoList,
    loadDtoList,
    modelDimensionDtoList,
    ...parameters,
  };
}

export function normalizeOptimizationResult(data: ApiRecord): OptimizationTable {
  const titles = Array.isArray(data.positionTitle) ? data.positionTitle.map(String) : [];
  const details = Array.isArray(data.taskDetailList) ? data.taskDetailList as ApiRecord[] : [];
  const constraintIndex = titles.findIndex(title => title === '约束');
  const columns: OptimizationColumn[] = [
    { key: 'index', title: '序号' },
    ...titles.map((title, index) => ({ key: `field-${index}`, title })),
    { key: 'fitnessValue', title: '适应度' },
  ];
  const rows = details.map((detail, rowIndex) => {
    const values = Array.isArray(detail.positionAndValue) ? detail.positionAndValue : [];
    const row: ApiRecord = {
      key: rowIndex + 1,
      index: rowIndex + 1,
      fitnessValue: detail.fitnessValue,
    };
    titles.forEach((_, index) => {
      row[`field-${index}`] = values[index];
    });
    if (constraintIndex >= 0) {
      row.constraintMessage = String(values[constraintIndex + 1] ?? '');
    }
    return row;
  });

  return { columns, rows };
}
