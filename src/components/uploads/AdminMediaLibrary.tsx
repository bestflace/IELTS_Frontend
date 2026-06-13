"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  Image as ImageIcon,
  RefreshCw,
  Search,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/common/Input";
import { LoadingState } from "@/components/common/LoadingState";
import { Pagination } from "@/components/common/Pagination";
import { getErrorMessage } from "@/lib/api/client";
import {
  listUploadedFiles,
  type UploadedFile,
  type UploadedFilePurpose,
  type UploadFolder,
  type UploadKind,
} from "@/lib/api/uploads.api";
import { AudioUploader } from "./AudioUploader";
import { DeleteUploadedFileButton } from "./DeleteUploadedFileButton";
import { ImageUploader } from "./ImageUploader";

type FilterState = {
  page: number;
  limit: number;
  search: string;
  kind: UploadKind | "";
  purpose: UploadedFilePurpose | "";
  folder: UploadFolder | "";
};

const purposeOptions: Array<{
  value: UploadedFilePurpose | "";
  label: string;
}> = [
  { value: "", label: "Tất cả mục đích" },
  { value: "LISTENING_AUDIO", label: "Listening audio" },
  { value: "SPEAKING_AUDIO", label: "Speaking audio" },
  { value: "WRITING_IMAGE", label: "Writing image" },
  { value: "BLOG_IMAGE", label: "Blog image" },
  { value: "IMPORT_EXCEL", label: "Import Excel" },
  { value: "AVATAR", label: "Avatar" },
  { value: "OTHER", label: "Khác / Reading image" },
];

const kindOptions: Array<{ value: UploadKind | ""; label: string }> = [
  { value: "", label: "Tất cả loại file" },
  { value: "image", label: "Ảnh" },
  { value: "audio", label: "Audio" },
  { value: "document", label: "Tài liệu" },
  { value: "other", label: "Khác" },
];

const folderOptions: Array<{ value: UploadFolder | ""; label: string }> = [
  { value: "", label: "Tất cả thư mục" },
  { value: "listening-audio", label: "listening-audio" },
  { value: "speaking-audio", label: "speaking-audio" },
  { value: "reading-images", label: "reading-images" },
  { value: "writing-images", label: "writing-images" },
  { value: "images", label: "images" },
  { value: "blogs", label: "blogs" },
  { value: "imports", label: "imports" },
  { value: "avatars", label: "avatars" },
];

function formatFileSize(size?: number | null) {
  if (!size) return "—";
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getKindIcon(file: UploadedFile) {
  const contentType = file.contentType || "";
  if (contentType.startsWith("image/")) return FileImage;
  if (contentType.startsWith("audio/")) return FileAudio;
  if (file.purpose === "IMPORT_EXCEL") return FileSpreadsheet;
  return ImageIcon;
}

function getPurposeLabel(purpose: string) {
  return (
    purposeOptions.find((item) => item.value === purpose)?.label || purpose
  );
}

function getPurposeTone(purpose: UploadedFilePurpose) {
  if (purpose.includes("AUDIO")) return "sage";
  if (purpose.includes("IMAGE")) return "success";
  if (purpose === "IMPORT_EXCEL") return "brown";
  return "default";
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function MediaPreview({ file }: { file: UploadedFile }) {
  const contentType = file.contentType || "";

  if (contentType.startsWith("image/")) {
    return (
      <a
        href={file.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-2xl border border-cyan-100 bg-white/75"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.fileUrl}
          alt={file.originalName || file.fileKey}
          className="h-44 w-full object-cover transition duration-300 hover:scale-[1.03]"
        />
      </a>
    );
  }

  if (contentType.startsWith("audio/")) {
    return (
      <div className="flex h-44 flex-col justify-between rounded-2xl border border-cyan-100 bg-white/75 p-4">
        <div className="flex items-center gap-3 text-cyan-700">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50">
            <FileAudio className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">
              Audio file
            </p>
            <p className="text-xs text-slate-500">Có thể nghe thử trực tiếp</p>
          </div>
        </div>
        <audio controls className="w-full">
          <source src={file.fileUrl} type={contentType} />
        </audio>
      </div>
    );
  }

  const Icon = getKindIcon(file);

  return (
    <a
      href={file.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="flex h-44 flex-col items-center justify-center rounded-2xl border border-cyan-100 bg-white/75 text-slate-500 transition hover:border-cyan-300 hover:text-cyan-700"
    >
      <Icon className="h-10 w-10" />
      <span className="mt-3 text-sm font-semibold">Mở file</span>
    </a>
  );
}

function MediaCard({
  file,
  onDeleted,
  onCopied,
}: {
  file: UploadedFile;
  onDeleted: () => void;
  onCopied: (url: string) => void;
}) {
  const Icon = getKindIcon(file);

  const handleCopy = async () => {
    await copyText(file.fileUrl);
    onCopied(file.fileUrl);
  };

  return (
    <Card className="overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl shadow-none transition hover:border-cyan-300 hover:shadow-[0_24px_80px_rgba(14,165,233,0.12)]">
      <CardContent className="space-y-4 p-4">
        <MediaPreview file={file} />

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">
                {file.originalName || file.fileKey}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">
                {file.fileKey}
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Icon className="h-5 w-5" />
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge tone={getPurposeTone(file.purpose)}>
              {getPurposeLabel(file.purpose)}
            </Badge>
            {file.folder ? <Badge tone="default">{file.folder}</Badge> : null}
            {file.provider ? (
              <Badge tone="default">{file.provider}</Badge>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-cyan-100 bg-white/75 px-3 py-3 text-xs text-slate-500">
            <div className="min-w-0">
              <span className="block font-semibold text-slate-950">
                Dung lượng
              </span>
              {formatFileSize(file.sizeBytes)}
            </div>
            <div className="min-w-0">
              <span className="block font-semibold text-slate-950">
                Ngày upload
              </span>
              {formatDate(file.createdAt || file.completedAt)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-100 bg-white/75 px-3 py-2">
          <p className="truncate text-xs text-slate-500" title={file.fileUrl}>
            {file.fileUrl}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
            Copy URL
          </Button>
          <a href={file.fileUrl} target="_blank" rel="noreferrer">
            <Button type="button" variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
              Mở
            </Button>
          </a>
          <DeleteUploadedFileButton
            fileKey={file.fileKey}
            fileUrl={file.fileUrl}
            onDeleted={onDeleted}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SelectField({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-moss focus:ring-2 focus:ring-sage/20"
      >
        {options.map((option) => (
          <option key={option.value || label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminMediaLibrary() {
  const [filters, setFilters] = useState<FilterState>({
    page: 1,
    limit: 12,
    search: "",
    kind: "",
    purpose: "",
    folder: "",
  });
  const [items, setItems] = useState<UploadedFile[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedUrl, setCopiedUrl] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const query = useMemo(
    () => ({
      page: filters.page,
      limit: filters.limit,
      search: filters.search.trim() || undefined,
      kind: filters.kind || undefined,
      purpose: filters.purpose || undefined,
      folder: filters.folder || undefined,
    }),
    [filters],
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await listUploadedFiles(query);
      setItems(result.items || []);
      setTotal(result.meta?.total || result.items.length || 0);
      setTotalPages(result.meta?.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  const refresh = () => setRefreshKey((value) => value + 1);

  const handleFilterChange = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: key === "page" ? Number(value) : 1,
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl shadow-[0_24px_80px_rgba(14,165,233,0.12)]">
        <CardHeader className="border-b border-cyan-100 bg-cyan-50/60 px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-700">
                ADMIN / UPLOADS
              </p>
              <h1 className="mt-2 font-serif text-3xl font-black text-slate-950">
                Thư viện media
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Upload ảnh/audio lên Cloudinary, sau đó copy URL để dán vào
                Excel import,
                <span className="font-semibold text-slate-950">
                  {" "}
                  passage_html
                </span>
                ,
                <span className="font-semibold text-slate-950">
                  {" "}
                  chart_url
                </span>{" "}
                hoặc
                <span className="font-semibold text-slate-950"> audio_url</span>
                .
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={refresh}
              disabled={loading}
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <AudioUploader
              compact
              folder="listening-audio"
              purpose="LISTENING_AUDIO"
              label="Listening audio"
              description="Upload file .mp3/.m4a rồi copy URL dán vào cột audio_url của Excel Listening."
              onUploaded={refresh}
            />
            <ImageUploader
              compact
              folder="writing-images"
              purpose="WRITING_IMAGE"
              label="Writing image/chart"
              description="Dùng cho biểu đồ, bảng, quy trình hoặc bản đồ ở chart_url/image_url của Writing Task."
              onUploaded={refresh}
            />
            <ImageUploader
              compact
              folder="reading-images"
              purpose="OTHER"
              label="Reading image"
              description="Upload ảnh passage/map, copy URL rồi chèn vào thẻ img trong passage_html Reading."
              onUploaded={refresh}
            />
          </div>

          {copiedUrl ? (
            <div className="flex items-start gap-3 rounded-2xl border border-moss/20 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold">Đã copy URL</p>
                <p className="mt-1 truncate text-xs" title={copiedUrl}>
                  {copiedUrl}
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl shadow-[0_24px_80px_rgba(14,165,233,0.12)]">
        <CardHeader className="border-b border-cyan-100 bg-cyan-50/60 px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-black text-slate-950">
                Danh sách file đã upload
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Lọc, preview, copy URL hoặc xóa file không còn dùng.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-3 py-1.5 text-sm text-slate-500">
              <UploadCloud className="h-4 w-4 text-cyan-700" />
              <span>{total} file</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-6">
          <div className="grid gap-3 xl:grid-cols-[1.4fr_0.9fr_0.9fr_0.9fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={filters.search}
                placeholder="Tìm theo tên file, URL, content type..."
                className="pl-9"
                onChange={(event) =>
                  handleFilterChange("search", event.target.value)
                }
              />
            </div>

            <SelectField
              label="Loại file"
              value={filters.kind}
              options={kindOptions}
              onChange={(value) =>
                handleFilterChange("kind", value as UploadKind | "")
              }
            />
            <SelectField
              label="Mục đích"
              value={filters.purpose}
              options={purposeOptions}
              onChange={(value) =>
                handleFilterChange("purpose", value as UploadedFilePurpose | "")
              }
            />
            <SelectField
              label="Thư mục"
              value={filters.folder}
              options={folderOptions}
              onChange={(value) =>
                handleFilterChange("folder", value as UploadFolder | "")
              }
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          ) : null}

          {loading ? (
            <LoadingState label="Đang tải thư viện media..." />
          ) : items.length ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {items.map((file) => (
                  <MediaCard
                    key={file.id || file.fileKey || file.fileUrl}
                    file={file}
                    onDeleted={refresh}
                    onCopied={setCopiedUrl}
                  />
                ))}
              </div>

              <Pagination
                page={filters.page}
                limit={filters.limit}
                total={total}
                totalPages={totalPages}
                onPageChange={(page) => handleFilterChange("page", page)}
              />
            </>
          ) : (
            <EmptyState
              title="Chưa có file upload"
              description="Upload ảnh hoặc audio ở phía trên. Sau khi upload thành công, file sẽ xuất hiện trong thư viện để copy URL."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
