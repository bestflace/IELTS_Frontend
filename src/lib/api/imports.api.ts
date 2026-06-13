import { api } from "./client";
import type { ApiMeta, QueryParams } from "@/types";

export type ImportType =
  | "READING_SET"
  | "LISTENING_SET"
  | "WRITING_TASK"
  | "SPEAKING_SET"
  | "TEST";

export type ImportStatus = "PENDING" | "PROCESSING" | "DONE" | "ERROR";

export type ImportJob = {
  id: string;
  type: ImportType;
  status: ImportStatus;

  fileUrl?: string | null;
  file_url?: string | null;

  uploadedBy?: string | null;
  uploaded_by?: string | null;

  requestJson?: unknown;
  request_json?: unknown;

  resultJson?: unknown;
  result_json?: unknown;

  errorMessage?: string | null;
  error_message?: string | null;

  startedAt?: string | null;
  started_at?: string | null;

  finishedAt?: string | null;
  finished_at?: string | null;

  createdAt?: string;
  created_at?: string;

  updatedAt?: string;
  updated_at?: string;

  uploader?: {
    id: string;
    fullName?: string | null;
    full_name?: string | null;
    email?: string | null;
  } | null;
};

export type ImportErrorItem =
  | string
  | {
      row?: number | string | null;
      sheet?: string | null;
      field?: string | null;
      message?: string | null;
      value?: unknown;
      raw?: unknown;
    };

export type ImportErrorResult = {
  id: string;
  status: ImportStatus;
  errorMessage?: string | null;
  error_message?: string | null;
  errors: ImportErrorItem[];
};

export type CreateImportJobInput = {
  type: ImportType;
  fileUrl: string;
};

export type ImportListParams = QueryParams & {
  type?: ImportType;
  status?: ImportStatus;
  page?: number;
  limit?: number;
};

export type ImportListResponse = {
  items: ImportJob[];
  meta?: ApiMeta;
};

function normalizeListResponse(response: any): ImportListResponse {
  return {
    items:
      response?.items ||
      response?.data?.items ||
      response?.data ||
      response ||
      [],
    meta: response?.meta || response?.data?.meta,
  };
}

function normalizeErrorsResponse(response: any): ImportErrorResult {
  const data = response?.data || response;

  return {
    id: data?.id,
    status: data?.status,
    errorMessage: data?.errorMessage || data?.error_message || null,
    error_message: data?.error_message || data?.errorMessage || null,
    errors: data?.errors || data?.data?.errors || [],
  };
}

export const createImportJob = (data: CreateImportJobInput) =>
  api.post<ImportJob>("/admin/imports", data);

export const getImportJobs = async (
  params?: ImportListParams,
): Promise<ImportListResponse> => {
  const response = await api.getWithMeta<ImportJob[]>("/admin/imports", {
    params,
  });

  return normalizeListResponse(response);
};

export const getImportJob = (id: string) =>
  api.get<ImportJob>(`/admin/imports/${id}`);

export const getImportErrors = async (id: string) => {
  const response = await api.get<ImportErrorResult>(
    `/admin/imports/${id}/errors`,
  );

  return normalizeErrorsResponse(response);
};

export const retryImportJob = (id: string) =>
  api.post<ImportJob>(`/admin/imports/${id}/retry`);

export const deleteImportJob = (id: string) =>
  api.delete<{ success: boolean }>(`/admin/imports/${id}`);
