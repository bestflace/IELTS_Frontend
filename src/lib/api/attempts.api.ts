import { api } from "./client";
import type {
  Attempt,
  AttemptStatus,
  QueryParams,
  SpeakingPart,
  TestType,
} from "@/types";

export const createAttempt = (data: {
  testId: string;
  mode: TestType;
  partLabel?: string | null;
  timeLimitSec?: number;
}) => api.post<Attempt>("/attempts", data);

export const getMyAttempts = (
  params?: QueryParams & {
    mode?: TestType;
    status?: AttemptStatus;
  },
) => api.getWithMeta<Attempt[]>("/attempts", { params });

export const getAttemptDetail = (id: string) =>
  api.get<Attempt>(`/attempts/${id}`);

export const getAttemptSession = (id: string) =>
  api.get<any>(`/attempts/${id}/session`);

export type SaveQuestionAnswersInput = {
  answers: {
    questionId: string;
    qNo?: number;
    answerJson: unknown;
    isFlagged?: boolean;
    isFinal?: boolean;
  }[];
};

export const saveQuestionAnswers = (
  id: string,
  data: SaveQuestionAnswersInput,
) => api.put(`/attempts/${id}/question-answers`, data);

export type UpdateQuestionAnswerInput = {
  qNo?: number;
  answerJson?: unknown;
  isFlagged?: boolean;
  isFinal?: boolean;
};

export const updateOneQuestionAnswer = (
  id: string,
  questionId: string,
  data: UpdateQuestionAnswerInput,
) => api.patch(`/attempts/${id}/question-answers/${questionId}`, data);

export type SaveWritingResponsesInput = {
  responses: {
    writingTaskId: string;
    responseText: string;
  }[];
};

export const saveWritingResponses = (
  id: string,
  data: SaveWritingResponsesInput,
) => api.put(`/attempts/${id}/writing-responses`, data);

export type SpeakingResponseInput = {
  speakingPart: "PART_1" | "PART_2" | "PART_3" | SpeakingPart;
  audioUrl?: string;
  audioFileKey?: string;
  audioMimeType?: string;
  audioSizeBytes?: number;
  transcriptText?: string;
  responseText?: string;
};

export type SaveSpeakingResponsesInput = {
  responses: SpeakingResponseInput[];
};

export const saveSpeakingResponses = (
  id: string,
  data: SaveSpeakingResponsesInput,
) => api.put(`/attempts/${id}/speaking-responses`, data);

export const updateOneSpeakingResponse = (
  id: string,
  speakingPart: "PART_1" | "PART_2" | "PART_3" | SpeakingPart,
  data: Partial<SpeakingResponseInput>,
) => api.patch(`/attempts/${id}/speaking-responses/${speakingPart}`, data);

export const submitAttempt = (
  id: string,
  data: {
    force?: boolean;
  } = {},
) => api.post(`/attempts/${id}/submit`, data);

export const expireAttempt = (id: string) => api.post(`/attempts/${id}/expire`);

export const getAttemptResult = (id: string) =>
  api.get<any>(`/attempts/${id}/result`);

export const getAttemptReview = (id: string) =>
  api.get<any>(`/attempts/${id}/review`);

export const getGradingStatus = (id: string) =>
  api.get<any>(`/attempts/${id}/grading-status`);
