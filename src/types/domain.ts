export type LoadTypeEnum = 'ElectricLoad' | 'ThermalLoad';

export type EnvironmentTypeEnum = 'WindSpeed' | 'WaterSpeed' | 'Sunlight' | 'Temperature' | 'Gas';

export type ModelTypeEnum =
  | 'WindPower'
  | 'SolarPower'
  | 'HydroPower'
  | 'Battery'
  | 'ThermalPower'
  | 'GasBoiler'
  | 'ThermalSaver'
  | 'Grid'
  | 'Cogeneration'
  | 'ThermalPowerUnit'
  | 'PumpedStorage';

export interface LoadDto {
  id: number | string;
  loadTypeEnum: LoadTypeEnum;
}

export interface EnvironmentDto {
  id: number | string;
  environmentTypeEnum: EnvironmentTypeEnum;
}

export interface SimulationModelDto {
  id: number | string;
  modelTypeEnum: ModelTypeEnum;
  quantity?: number;
}

export interface OptimizationModelDimensionDto {
  id: number | string;
  modelTypeEnum: ModelTypeEnum;
  lowerBound?: number;
  upperBound?: number;
}

export interface SimulationRequest {
  environmentDtoList: EnvironmentDto[];
  loadDtoList: LoadDto[];
  modelDtoList: SimulationModelDto[];
}

export interface OptimizationRequest {
  environmentDtoList: EnvironmentDto[];
  loadDtoList: LoadDto[];
  modelDimensionDtoList: OptimizationModelDimensionDto[];
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

export interface OptimizationTask {
  taskId: string;
}

export interface OptimizationTaskState {
  taskState: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  currentIteration?: number;
  totalIterations?: number;
}
