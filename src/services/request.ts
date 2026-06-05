import axios, { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';
import type { ApiResponse } from '@/types/api';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const apiPrefix = import.meta.env.VITE_API_PREFIX || '/api';

export const request = axios.create({
  baseURL: `${apiBaseUrl}${apiPrefix}`,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function assertApiSuccess<T>(response: ApiResponse<T>) {
  if (response.code !== 200) {
    throw new Error(response.message || response.msg || '接口请求失败');
  }
  return response;
}

export async function post<TResponse, TRequest = unknown>(
  url: string,
  data?: TRequest,
  config?: AxiosRequestConfig,
) {
  const response = await request.post<ApiResponse<TResponse>>(url, data, config);
  return assertApiSuccess(response.data);
}

export async function get<TResponse>(url: string, config?: AxiosRequestConfig) {
  const response = await request.get<ApiResponse<TResponse>>(url, config);
  return assertApiSuccess(response.data);
}

export async function downloadBlob(url: string, data?: unknown, config?: AxiosRequestConfig) {
  const response = await request.post<Blob>(url, data, {
    ...config,
    responseType: 'blob',
  });
  return response.data;
}
