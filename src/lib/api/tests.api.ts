import { api } from "./client";
import type {
  PublishStatus,
  QueryParams,
  Test,
  TestSection,
  TestSectionType,
  TestType,
} from "@/types";

export type CreateTestInput = {
  type: TestType;
  title: string;
  level?: number | null;
  description?: string | null;
  tagIds?: string[];
};

export type UpdateTestInput = Partial<{
  title: string;
  level: number | null;
  description: string | null;
  tagIds: string[];
}>;

export type CreateTestSectionInput = {
  sectionType: TestSectionType;
  sortOrder?: number;
  timeLimitSec?: number | null;
  partLabel?: string | null;
  readingSetId?: string;
  listeningSetId?: string;
  writingTaskId?: string;
  speakingSetId?: string;
};

export type UpdateTestSectionInput = Partial<{
  sectionType: TestSectionType;
  sortOrder: number;
  timeLimitSec: number | null;
  partLabel: string | null;
  readingSetId: string;
  listeningSetId: string;
  writingTaskId: string;
  speakingSetId: string;
}>;

export type ReplaceSectionsInput = {
  sections: Array<CreateTestSectionInput | TestSection>;
};

export type PreviewBuildInput = CreateTestInput & {
  sections: CreateTestSectionInput[];
};

export type RandomBuildInput = CreateTestInput & {
  publishNow?: boolean;
  rules?: {
    reading?: {
      levelMin?: number;
      levelMax?: number;
      tagIds?: string[];
    };
    listening?: {
      levelMin?: number;
      levelMax?: number;
      tagIds?: string[];
    };
    writing?: {
      levelMin?: number;
      levelMax?: number;
      tagIds?: string[];
    };
    speaking?: {
      levelMin?: number;
      levelMax?: number;
      tagIds?: string[];
    };
    avoidUsedIds?: string[];
  };
};

const SOURCE_ID_KEYS = [
  "readingSetId",
  "listeningSetId",
  "writingTaskId",
  "speakingSetId",
] as const;

function cleanSectionPayload<T extends Record<string, unknown>>(payload: T): T {
  const cleaned = { ...payload };

  for (const key of SOURCE_ID_KEYS) {
    const value = cleaned[key];

    if (value === "" || value === null || value === undefined) {
      delete cleaned[key];
    }
  }

  return cleaned;
}

function cleanSectionsInput(data: ReplaceSectionsInput): ReplaceSectionsInput {
  return {
    sections: data.sections.map((section) =>
      cleanSectionPayload(section as Record<string, unknown>),
    ) as ReplaceSectionsInput["sections"],
  };
}

export const getTests = (params?: QueryParams) =>
  api.getWithMeta<Test[]>("/tests", { params });

export const getTest = (id: string) => api.get<Test>(`/tests/${id}`);

export const getAdminTests = (params?: QueryParams) =>
  api.getWithMeta<Test[]>("/admin/tests", { params });

export const createTest = (data: CreateTestInput) =>
  api.post<Test>("/admin/tests", data);

export const getAdminTest = (id: string) => api.get<Test>(`/admin/tests/${id}`);

export const updateTest = (id: string, data: UpdateTestInput) =>
  api.patch<Test>(`/admin/tests/${id}`, data);

export const deleteTest = (id: string) => api.delete(`/admin/tests/${id}`);

export const replaceSections = (id: string, data: ReplaceSectionsInput) =>
  api.put<Test>(`/admin/tests/${id}/sections`, cleanSectionsInput(data));

export const addSection = (id: string, data: CreateTestSectionInput) =>
  api.post<TestSection>(
    `/admin/tests/${id}/sections`,
    cleanSectionPayload(data),
  );

export const updateSection = (
  sectionId: string,
  data: UpdateTestSectionInput,
) =>
  api.patch<TestSection>(
    `/admin/test-sections/${sectionId}`,
    cleanSectionPayload(data),
  );

export const deleteSection = (sectionId: string) =>
  api.delete(`/admin/test-sections/${sectionId}`);

export const publishTest = (id: string) =>
  api.post<Test>(`/admin/tests/${id}/publish`);

export const unpublishTest = (id: string) =>
  api.post<Test>(`/admin/tests/${id}/unpublish`);

export const previewBuild = (data: PreviewBuildInput) =>
  api.post<Test>("/admin/tests/preview-build", {
    ...data,
    sections: data.sections.map((section) => cleanSectionPayload(section)),
  });

export const randomBuild = (data: RandomBuildInput) =>
  api.post<Test>("/admin/tests/random-build", data);

export const rerollSection = (sectionId: string, data?: unknown) =>
  api.post<TestSection>(`/admin/test-sections/${sectionId}/reroll`, data);

export const statusLabel = (status?: PublishStatus) => status || "DRAFT";
