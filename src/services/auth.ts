import { post } from './request';
import type { ApiRecord } from '@/types/api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message?: string;
}

export function getPublicKey() {
  return post<string | { publicKey: string }>('/usercenter/getPublicKey', {});
}

export function login(data: LoginRequest) {
  return post<LoginResponse, LoginRequest>('/usercenter/login', data);
}

export function logout() {
  return post<ApiRecord>('/usercenter/logout', {});
}

export function getUserInfo() {
  return post<ApiRecord>('/usercenter/user/userInfo', {});
}

export function getUserMenu() {
  return post<{ list: ApiRecord[] }>('/usercenter/user/userMenu', {});
}
