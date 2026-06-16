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

interface LegacyModelPage {
  page?: number;
  size?: number;
  total?: number;
  content?: ApiRecord[];
  list?: ApiRecord[];
  records?: ApiRecord[];
}

export function normalizeModelPage(data: LegacyModelPage): PageResult<ApiRecord> {
  return {
    page: data.page,
    size: data.size,
    total: data.total ?? 0,
    list: data.content ?? data.list ?? data.records ?? [],
  };
}

export async function getModelList(endpoint: ModelEndpoint, data: ModelListQuery) {
  const response = await post<LegacyModelPage, ModelListQuery>(`/${endpoint}/getListByPage`, data);
  return {
    ...response,
    data: normalizeModelPage(response.data),
  };
}

export function addModel<TRequest extends object>(endpoint: ModelEndpoint, data: TRequest) {
  return post<ApiRecord, TRequest>(`/${endpoint}/add`, data);
}

export function deleteModel(endpoint: ModelEndpoint, id: number | string) {
  return post<ApiRecord>(`/${endpoint}/delete`, { id });
}

export function showModelGraph<TRequest extends object>(endpoint: ModelEndpoint, data: TRequest) {
  return post<ApiRecord, TRequest>(`/${endpoint}/show-graph`, data);
}

export function calculateHydroEta(data: ApiRecord) {
  return post<ApiRecord, ApiRecord>('/model/hydro_power_plant/calculate_eta', data);
}

export function calculateHydroHead(data: ApiRecord) {
  return post<ApiRecord, ApiRecord>('/model/hydro_power_plant/calculate_head', data);
}
