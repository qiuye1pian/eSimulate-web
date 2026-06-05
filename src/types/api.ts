export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
  msg?: string;
}

export interface PageQuery {
  page: number;
  size: number;
}

export interface PageResult<T> {
  list: T[];
  page?: number;
  size?: number;
  total: number;
}

export interface NamedResource {
  id: number | string;
  name?: string;
  modelName?: string;
}

export type ApiRecord = Record<string, unknown>;
