import { api } from "./client";
import type { QueryParams } from "@/types";
export const getAttemptComments = (id: string) =>
  api.get<any[]>(`/attempts/${id}/comments`);
export const createAttemptComment = (
  id: string,
  data: { content: string; parentId?: string | null },
) => api.post(`/attempts/${id}/comments`, data);
export const updateComment = (id: string, data: { content: string }) =>
  api.patch(`/comments/${id}`, data);
export const deleteComment = (id: string) => api.delete(`/comments/${id}`);
export const hideComment = (id: string) =>
  api.post(`/admin/comments/${id}/hide`);
export const unhideComment = (id: string) =>
  api.post(`/admin/comments/${id}/unhide`);
export const getAdminComments = (params?: QueryParams) =>
  api.getWithMeta<any[]>("/admin/comments", { params });
