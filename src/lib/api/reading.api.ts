import { api } from "./client";
import type { PublishStatus, QueryParams, Question, ReadingSet } from "@/types";
export type ReadingSetInput = {
  title: string;
  passageHtml?: string | null;
  passageText?: string | null;
  level: number;
  status?: PublishStatus;
  tagIds?: string[];
};
export type QuestionInput = {
  qNo: number;
  questionType: any;
  promptText: string;
  instructionText?: string | null;
  optionsJson?: unknown;
  correctAnswerJson: unknown;
  explanation?: string | null;
  points?: number;
  sortOrder: number;
};
export const getPublicReadingList = (params?: QueryParams) =>
  api.getWithMeta<ReadingSet[]>("/reading-sets", { params });
export const getPublicReadingDetail = (id: string) =>
  api.get<ReadingSet>(`/reading-sets/${id}`);
export const getAdminReadingList = (params?: QueryParams) =>
  api.getWithMeta<ReadingSet[]>("/admin/reading-sets", { params });
export const createReading = (data: ReadingSetInput) =>
  api.post<ReadingSet>("/admin/reading-sets", data);
export const getAdminReading = (id: string) =>
  api.get<ReadingSet>(`/admin/reading-sets/${id}`);
export const updateReading = (id: string, data: Partial<ReadingSetInput>) =>
  api.patch<ReadingSet>(`/admin/reading-sets/${id}`, data);
export const deleteReading = (id: string) =>
  api.delete(`/admin/reading-sets/${id}`);
export const publishReading = (id: string) =>
  api.post(`/admin/reading-sets/${id}/publish`);
export const unpublishReading = (id: string) =>
  api.post(`/admin/reading-sets/${id}/unpublish`);
export const addReadingQuestion = (id: string, data: QuestionInput) =>
  api.post<Question>(`/admin/reading-sets/${id}/questions`, data);
export const updateReadingQuestion = (
  questionId: string,
  data: Partial<QuestionInput>,
) => api.patch<Question>(`/admin/reading-questions/${questionId}`, data);
export const deleteReadingQuestion = (questionId: string) =>
  api.delete(`/admin/reading-questions/${questionId}`);
