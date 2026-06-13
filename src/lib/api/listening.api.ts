import { api } from "./client";
import type {
  ListeningSet,
  PublishStatus,
  QueryParams,
  Question,
} from "@/types";
export type ListeningSetInput = {
  title: string;
  transcriptText?: string | null;
  audioUrl?: string | null;
  audioSource?: "UPLOAD" | "URL" | "R2" | null;
  level: number;
  status?: PublishStatus;
  tagIds?: string[];
};
export type ListeningQuestionInput = {
  qNo: number;
  sectionLabel?: string | null;
  questionType: any;
  promptText: string;
  instructionText?: string | null;
  optionsJson?: unknown;
  correctAnswerJson: unknown;
  explanation?: string | null;
  points?: number;
  sortOrder: number;
};
export const getPublicListeningList = (params?: QueryParams) =>
  api.getWithMeta<ListeningSet[]>("/listening-sets", { params });
export const getPublicListeningDetail = (id: string) =>
  api.get<ListeningSet>(`/listening-sets/${id}`);
export const getAdminListeningList = (params?: QueryParams) =>
  api.getWithMeta<ListeningSet[]>("/admin/listening-sets", { params });
export const createListening = (data: ListeningSetInput) =>
  api.post<ListeningSet>("/admin/listening-sets", data);
export const getAdminListening = (id: string) =>
  api.get<ListeningSet>(`/admin/listening-sets/${id}`);
export const updateListening = (id: string, data: Partial<ListeningSetInput>) =>
  api.patch<ListeningSet>(`/admin/listening-sets/${id}`, data);
export const deleteListening = (id: string) =>
  api.delete(`/admin/listening-sets/${id}`);
export const publishListening = (id: string) =>
  api.post(`/admin/listening-sets/${id}/publish`);
export const unpublishListening = (id: string) =>
  api.post(`/admin/listening-sets/${id}/unpublish`);
export const addListeningQuestion = (
  id: string,
  data: ListeningQuestionInput,
) => api.post<Question>(`/admin/listening-sets/${id}/questions`, data);
export const updateListeningQuestion = (
  questionId: string,
  data: Partial<ListeningQuestionInput>,
) => api.patch<Question>(`/admin/listening-questions/${questionId}`, data);
export const deleteListeningQuestion = (questionId: string) =>
  api.delete(`/admin/listening-questions/${questionId}`);
