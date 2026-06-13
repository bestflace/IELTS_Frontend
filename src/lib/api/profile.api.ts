import { api } from './client';
import type { User } from '@/types';
export const getProfile = () => api.get<User>('/users/me/profile');
export const updateProfile = (data:{fullName?:string; avatarUrl?:string|null}) => api.patch<User>('/users/me/profile', data);
export const changePassword = (data:{currentPassword:string; newPassword:string}) => api.patch('/users/me/password', data);
