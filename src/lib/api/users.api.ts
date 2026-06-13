import { api } from './client';
import type { BackendRole, QueryParams, User, UserStatus } from '@/types';
export const getUsers = (params?:QueryParams) => api.getWithMeta<User[]>('/admin/users', { params });
export const getUser = (id:string) => api.get<User>(`/admin/users/${id}`);
export const updateUser = (id:string,data:{fullName?:string;role?:BackendRole;status?:UserStatus}) => api.patch<User>(`/admin/users/${id}`,data);
export const updateUserRole = (id:string,data:{role:BackendRole}) => api.patch<User>(`/admin/users/${id}/role`,data);
export const updateUserStatus = (id:string,data:{status:UserStatus}) => api.patch<User>(`/admin/users/${id}/status`,data);
