import { api } from "./client";
import type { QueryParams, TeacherSubmission } from "@/types";

export type TeacherSubmissionSkill = "WRITING" | "SPEAKING";
export type TeacherSubmissionStatus = "PENDING" | "CLAIMED" | "REVIEWED";

export type TeacherSubmissionQuery = QueryParams & {
  skill?: TeacherSubmissionSkill;
  status?: TeacherSubmissionStatus;
  search?: string;
  mine?: boolean;
};

function assertValidSubmissionId(id: string) {
  if (!id || id === "undefined" || id === "null") {
    throw new Error("Thiếu mã bài làm. Vui lòng tải lại trang.");
  }
}

export const getTeacherSubmissions = (params?: TeacherSubmissionQuery) =>
  api.getWithMeta<TeacherSubmission[]>("/teacher/submissions", { params });

export const getTeacherSubmission = (id: string) => {
  assertValidSubmissionId(id);
  return api.get<any>(`/teacher/submissions/${id}`);
};

export const claimSubmission = (id: string) => {
  assertValidSubmissionId(id);
  return api.post(`/teacher/submissions/${id}/claim`);
};

export const releaseSubmission = (id: string) => {
  assertValidSubmissionId(id);
  return api.post(`/teacher/submissions/${id}/release`);
};

export type WritingReviewInput = {
  overallBand: number;
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRangeAccuracy: number;
  summary: string;
  actionItems?: string[];
};

export const submitWritingReview = (id: string, data: WritingReviewInput) => {
  assertValidSubmissionId(id);
  return api.post(`/teacher/submissions/${id}/writing-review`, data);
};

export type SpeakingReviewInput = {
  overallBand: number;
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRangeAccuracy: number;
  pronunciation: number;
  summary: string;
  actionItems?: string[];
};

export const submitSpeakingReview = (id: string, data: SpeakingReviewInput) => {
  assertValidSubmissionId(id);
  return api.post(`/teacher/submissions/${id}/speaking-review`, data);
};

export const getTeacherDashboard = () => api.get("/teacher/dashboard");
