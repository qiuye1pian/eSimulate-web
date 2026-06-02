import { downloadBlob, post } from './request';
import type { ApiRecord, PageQuery, PageResult } from '@/types/api';

export type EnvironmentEndpoint =
  | 'load/electric-load-schemes'
  | 'load/thermal-load-schemes'
  | 'model/grid'
  | 'environment/wind-speed'
  | 'environment/water-speed'
  | 'environment/sunlight'
  | 'environment/temperature'
  | 'environment/gas';

export interface ResourceListQuery extends PageQuery {
  schemeName?: string;
  modelName?: string;
}

export function getResourceList(endpoint: EnvironmentEndpoint, data: ResourceListQuery) {
  return post<PageResult<ApiRecord>, ResourceListQuery>(`/${endpoint}/getListByPage`, data);
}

export function deleteResource(endpoint: EnvironmentEndpoint, id: number | string) {
  return post<ApiRecord>(`/${endpoint}/delete`, { id });
}

export function uploadResourceScheme(endpoint: EnvironmentEndpoint, data: FormData) {
  return post<ApiRecord, FormData>(`/${endpoint}/uploadScheme`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function addGridPricing(data: ApiRecord) {
  return post<ApiRecord, ApiRecord>('/model/grid/add', data);
}

export function downloadResource(endpoint: EnvironmentEndpoint, id: number | string) {
  return downloadBlob(`/${endpoint}/download`, { id });
}

export function getResourceValues(endpoint: EnvironmentEndpoint, id: number | string) {
  return post<ApiRecord>(`/${endpoint}/getLoadValues`, { id });
}
