import { api } from "./client";
import type { PublishStatus, QueryParams, WritingTask } from "@/types";
export type WritingInput = {
  taskNo: 1 | 2;
  title: string;
  promptText: string;
  chartUrl?: string | null;
  imageUrl?: string | null;
  level?: number | null;
  status?: PublishStatus;
  tagIds?: string[];
};
export const getPublicWritingList = (params?: QueryParams) =>
  api.getWithMeta<WritingTask[]>("/writing-tasks", { params });
export const getPublicWritingDetail = (id: string) =>
  api.get<WritingTask>(`/writing-tasks/${id}`);
export const getAdminWritingList = (params?: QueryParams) =>
  api.getWithMeta<WritingTask[]>("/admin/writing-tasks", { params });
export const createWriting = (data: WritingInput) =>
  api.post<WritingTask>("/admin/writing-tasks", data);
export const getAdminWriting = (id: string) =>
  api.get<WritingTask>(`/admin/writing-tasks/${id}`);
export const updateWriting = (id: string, data: Partial<WritingInput>) =>
  api.patch<WritingTask>(`/admin/writing-tasks/${id}`, data);
export const deleteWriting = (id: string) =>
  api.delete(`/admin/writing-tasks/${id}`);
export const publishWriting = (id: string) =>
  api.post(`/admin/writing-tasks/${id}/publish`);
export const unpublishWriting = (id: string) =>
  api.post(`/admin/writing-tasks/${id}/unpublish`);
