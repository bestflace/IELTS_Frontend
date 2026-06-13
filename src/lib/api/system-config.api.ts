import { api } from "./client";

export type FeatureFlags = {
  enableBlog: boolean;
  enableTeacherReview: boolean;
  enableWritingAI: boolean;
  enableSpeakingASR: boolean;
  enableSpeakingAI: boolean;
  enableImports: boolean;
  enableNotifications: boolean;
};

export type SystemConfig = {
  readingDefaultSec: number;
  listeningDefaultSec: number;
  writingDefaultSec: number;
  speakingDefaultSec: number;
  fullTestDefaultSec: number;

  readingCustomMinSec: number;
  readingCustomMaxSec: number;
  listeningCustomMinSec: number;
  listeningCustomMaxSec: number;
  writingCustomMinSec: number;
  writingCustomMaxSec: number;
  speakingCustomMinSec: number;
  speakingCustomMaxSec: number;
  fullTestCustomMinSec: number;
  fullTestCustomMaxSec: number;

  featureFlags: FeatureFlags;
};

export type UpdateSystemConfigInput = Partial<
  Omit<SystemConfig, "featureFlags">
> & {
  featureFlags?: Partial<FeatureFlags>;
};

export const getPublicConfig = () =>
  api.get<Partial<SystemConfig>>("/system-config/public");

export const getAdminConfig = () =>
  api.get<SystemConfig>("/admin/system-config");

export const updateAdminConfig = (data: UpdateSystemConfigInput) =>
  api.patch<SystemConfig>("/admin/system-config", data);
