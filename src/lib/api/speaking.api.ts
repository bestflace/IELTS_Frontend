import { api } from "./client";
import type {
  PublishStatus,
  QueryParams,
  SpeakingPart,
  SpeakingSet,
} from "@/types";
export type SpeakingInput = {
  topic: string;
  level: number;
  status?: PublishStatus;
  tagIds?: string[];
};
export const getPublicSpeakingList = (params?: QueryParams) =>
  api.getWithMeta<SpeakingSet[]>("/speaking-sets", { params });
export const getPublicSpeakingDetail = (id: string) =>
  api.get<SpeakingSet>(`/speaking-sets/${id}`);
export const getAdminSpeakingList = (params?: QueryParams) =>
  api.getWithMeta<SpeakingSet[]>("/admin/speaking-sets", { params });
export const createSpeaking = (data: SpeakingInput) =>
  api.post<SpeakingSet>("/admin/speaking-sets", data);
export const getAdminSpeaking = (id: string) =>
  api.get<SpeakingSet>(`/admin/speaking-sets/${id}`);
export const updateSpeaking = (id: string, data: Partial<SpeakingInput>) =>
  api.patch<SpeakingSet>(`/admin/speaking-sets/${id}`, data);
export const deleteSpeaking = (id: string) =>
  api.delete(`/admin/speaking-sets/${id}`);
export const publishSpeaking = (id: string) =>
  api.post(`/admin/speaking-sets/${id}/publish`);
export const unpublishSpeaking = (id: string) =>
  api.post(`/admin/speaking-sets/${id}/unpublish`);
export const addSpeakingPart = (
  id: string,
  data: {
    partType: SpeakingPart;
    title?: string | null;
    description?: string | null;
    sortOrder: number;
  },
) => api.post(`/admin/speaking-sets/${id}/parts`, data);
export const updateSpeakingPart = (partId: string, data: unknown) =>
  api.patch(`/admin/speaking-parts/${partId}`, data);
export const deleteSpeakingPart = (partId: string) =>
  api.delete(`/admin/speaking-parts/${partId}`);
export const addSpeakingPrompt = (
  partId: string,
  data: {
    promptType: string;
    content: string;
    preparationSec?: number | null;
    speakingSec?: number | null;
    sortOrder: number;
  },
) => api.post(`/admin/speaking-parts/${partId}/prompts`, data);
export const updateSpeakingPrompt = (promptId: string, data: unknown) =>
  api.patch(`/admin/speaking-prompts/${promptId}`, data);
export const deleteSpeakingPrompt = (promptId: string) =>
  api.delete(`/admin/speaking-prompts/${promptId}`);
export const addPromptItem = (
  promptId: string,
  data: { itemText: string; sortOrder: number },
) => api.post(`/admin/speaking-prompts/${promptId}/items`, data);
export const updatePromptItem = (itemId: string, data: unknown) =>
  api.patch(`/admin/speaking-prompt-items/${itemId}`, data);
export const deletePromptItem = (itemId: string) =>
  api.delete(`/admin/speaking-prompt-items/${itemId}`);
