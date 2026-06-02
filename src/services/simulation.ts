import { post } from './request';
import type {
  OptimizationRequest,
  OptimizationTask,
  OptimizationTaskState,
  SimulationRequest,
} from '@/types/domain';
import type { ApiRecord } from '@/types/api';

export function simulate(data: SimulationRequest) {
  return post<ApiRecord, SimulationRequest>('/simulate/simulator/do', data);
}

export function optimize(data: OptimizationRequest) {
  return post<OptimizationTask, OptimizationRequest>('/optimize/pso/do', data);
}

export function cancelOptimizationTask(taskId: string) {
  return post<ApiRecord>('/optimize/pso/cancelTask', { taskId });
}

export function getOptimizationTaskState(taskId: string) {
  return post<OptimizationTaskState>('/optimize/pso/getTaskState', { taskId });
}

export function getOptimizationResult(taskId: string) {
  return post<ApiRecord>('/optimize/pso/getResult', { taskId });
}
