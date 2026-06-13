import { api } from './client';
import type { QueryParams, Tag } from '@/types';
export const getTags = (params?:QueryParams) => api.get<Tag[]>('/tags', { params });
export const createTag = (data:{name:string; slug?:string}) => api.post<Tag>('/admin/tags',data);
export const updateTag = (id:string,data:{name?:string; slug?:string}) => api.patch<Tag>(`/admin/tags/${id}`,data);
export const deleteTag = (id:string) => api.delete(`/admin/tags/${id}`);
