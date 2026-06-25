import { assertApiSuccess, get, post, request } from './request';
import type { ApiResponse } from '@/types/api';

export interface UserRecord {
  id: number;
  username: string;
  role: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: string;
}

export function getUsers() {
  return get<UserRecord[]>('/user');
}

export function createUser(data: CreateUserRequest) {
  return post<UserRecord, CreateUserRequest>('/user', data);
}

export async function deleteUser(id: number | string) {
  const response = await request.delete<ApiResponse<null>>(`/user/${id}`);
  return assertApiSuccess(response.data);
}
