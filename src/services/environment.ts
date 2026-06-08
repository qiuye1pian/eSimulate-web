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

interface LegacyResourcePage {
  page?: number;
  size?: number;
  total?: number;
  content?: ApiRecord[];
  list?: ApiRecord[];
  records?: ApiRecord[];
}

export function normalizeResourcePage(data: LegacyResourcePage): PageResult<ApiRecord> {
  return {
    page: data.page,
    size: data.size,
    total: data.total ?? 0,
    list: data.content ?? data.list ?? data.records ?? [],
  };
}

export async function getResourceList(endpoint: EnvironmentEndpoint, data: ResourceListQuery) {
  const response = await post<LegacyResourcePage, ResourceListQuery>(`/${endpoint}/getListByPage`, data);
  return {
    ...response,
    data: normalizeResourcePage(response.data),
  };
}

export function deleteResource(endpoint: EnvironmentEndpoint, id: number | string) {
  return post<ApiRecord>(`/${endpoint}/delete`, { id });
}

export function uploadResourceScheme(endpoint: EnvironmentEndpoint, data: FormData) {
  return post<ApiRecord, FormData>(`/${endpoint}/uploadScheme`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function addGridPricing<TRequest extends object>(data: TRequest) {
  return post<ApiRecord, TRequest>('/model/grid/add', data);
}

export function downloadResource(endpoint: EnvironmentEndpoint, id: number | string) {
  return downloadBlob(`/${endpoint}/download`, { id });
}

export function getResourceValues(endpoint: EnvironmentEndpoint, id: number | string) {
  return post<ApiRecord>(`/${endpoint}/getLoadValues`, { id });
}
