import { post } from './request';
import type { ApiRecord, PageQuery, PageResult } from '@/types/api';

export type ModelEndpoint =
  | 'model/wind-power'
  | 'model/solar-power'
  | 'model/hydro_power_plant'
  | 'model/battery'
  | 'model/thermal-power'
  | 'model/gas-boiler'
  | 'model/thermal-power-unit'
  | 'model/cogeneration'
  | 'model/pumped-storage'
  | 'model/thermal-saver';

export interface ModelListQuery extends PageQuery {
  modelName?: string;
}

export function getModelList(endpoint: ModelEndpoint, data: ModelListQuery) {
  return post<PageResult<ApiRecord>, ModelListQuery>(`/${endpoint}/getListByPage`, data);
}

export function addModel(endpoint: ModelEndpoint, data: ApiRecord) {
  return post<ApiRecord, ApiRecord>(`/${endpoint}/add`, data);
}

export function deleteModel(endpoint: ModelEndpoint, id: number | string) {
  return post<ApiRecord>(`/${endpoint}/delete`, { id });
}

export function showModelGraph(endpoint: ModelEndpoint, data: ApiRecord) {
  return post<ApiRecord, ApiRecord>(`/${endpoint}/show-graph`, data);
}

export function calculateHydroEta(data: ApiRecord) {
  return post<ApiRecord, ApiRecord>('/model/hydro_power_plant/calculate_eta', data);
}

export function calculateHydroHead(data: ApiRecord) {
  return post<ApiRecord, ApiRecord>('/model/hydro_power_plant/calculate_head', data);
}
