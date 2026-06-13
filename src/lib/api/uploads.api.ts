import { api } from "./client";

export type UploadFolder =
  | "speaking-audio"
  | "listening-audio"
  | "imports"
  | "images"
  | "reading-images"
  | "writing-images"
  | "avatars"
  | "blogs";

export type UploadedFilePurpose =
  | "AVATAR"
  | "SPEAKING_AUDIO"
  | "LISTENING_AUDIO"
  | "WRITING_IMAGE"
  | "BLOG_IMAGE"
  | "IMPORT_EXCEL"
  | "OTHER";

export type UploadedFileStatus = "PENDING" | "COMPLETED" | "DELETED";

export type UploadKind = "image" | "audio" | "document" | "other";

export type UploadedFile = {
  id: string;
  uploadedBy?: string | null;
  purpose: UploadedFilePurpose;
  status: UploadedFileStatus;
  bucket?: string | null;
  fileKey: string;
  fileUrl: string;
  originalName?: string | null;
  contentType?: string | null;
  sizeBytes?: number | null;
  eTag?: string | null;
  metadataJson?: Record<string, unknown>;
  provider?: string | null;
  resourceType?: string | null;
  folder?: UploadFolder | string | null;
  kind?: UploadKind | string | null;
  completedAt?: string | null;
  deletedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  uploader?: {
    id: string;
    fullName?: string | null;
    email?: string | null;
  } | null;

  // Backward-compatible fields used by older upload components.
  file_url?: string;
  file_key?: string;
  url?: string;
  publicId?: string;
  public_id?: string;
};

export type CloudinaryUploadResponse = UploadedFile & {
  folder: UploadFolder;
  fileKey: string;
  fileUrl: string;
  contentType: string;
  size: number;
  provider: "cloudinary";
  resourceType: "image" | "video" | "raw" | string;
  originalFilename: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  [key: string]: unknown;
};

export type UploadListParams = {
  page?: number;
  limit?: number;
  purpose?: UploadedFilePurpose | "";
  status?: UploadedFileStatus | "";
  kind?: UploadKind | "";
  folder?: UploadFolder | "";
  search?: string;
};

export const uploadToCloudinary = async ({
  file,
  folder,
  purpose,
}: {
  file: File;
  folder: UploadFolder;
  purpose?: UploadedFilePurpose;
}) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  if (purpose) {
    formData.append("purpose", purpose);
  }

  return api.post<CloudinaryUploadResponse>("/uploads/cloudinary", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const listUploadedFiles = async (params: UploadListParams = {}) => {
  const { data, meta } = await api.getWithMeta<UploadedFile[]>(
    "/admin/uploads",
    {
      params: Object.fromEntries(
        Object.entries(params).filter(
          ([, value]) => value !== undefined && value !== "",
        ),
      ),
    },
  );

  return {
    items: data,
    meta: meta as PaginationMeta | undefined,
  };
};

export const getUploadedFile = async (id: string) => {
  return api.get<UploadedFile>(`/admin/uploads/${id}`);
};

export const deleteUploadedFile = async ({
  fileKey,
  fileUrl,
}: {
  fileKey?: string;
  fileUrl?: string;
}) => {
  return api.delete<{ success: boolean; fileKey?: string; fileUrl?: string }>(
    "/uploads",
    {
      data: {
        fileKey,
        fileUrl,
      },
    },
  );
};
