"use client";

import { ChangeEvent, ReactNode, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileUp,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { getErrorMessage } from "@/lib/api/client";
import {
  uploadToCloudinary,
  type UploadedFile,
  type UploadedFilePurpose,
  type UploadFolder,
} from "@/lib/api/uploads.api";
import { UploadProgress } from "./UploadProgress";

export type { UploadedFile } from "@/lib/api/uploads.api";

export type FileUploaderProps = {
  folder?: UploadFolder;
  purpose?: UploadedFilePurpose;
  accept?: string;
  label?: string;
  description?: string;
  buttonLabel?: string;
  disabled?: boolean;
  children?: ReactNode;
  compact?: boolean;
  onUploaded?: (uploaded: UploadedFile) => void;
  onError?: (message: string) => void;
};

function formatFileSize(size?: number | null) {
  if (!size) return "—";

  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getIcon(accept: string) {
  if (accept.includes("audio")) return FileAudio;
  if (accept.includes("image")) return FileImage;
  if (accept.includes("xls") || accept.includes("csv")) return FileSpreadsheet;
  return FileUp;
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

export function FileUploader({
  folder = "imports",
  purpose,
  accept = ".xlsx,.xls,.csv",
  label = "Upload file",
  description = "Chọn file từ máy để upload lên hệ thống.",
  buttonLabel = "Chọn file",
  disabled = false,
  children,
  compact = false,
  onUploaded,
  onError,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState("");
  const [copied, setCopied] = useState(false);

  const Icon = getIcon(accept);

  const handlePickFile = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadedFile(null);
    setLocalError("");
    setCopied(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleCopy = async () => {
    if (!uploadedFile?.fileUrl) return;
    await copyText(uploadedFile.fileUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadedFile(null);
    setLocalError("");
    setCopied(false);
    setUploading(true);

    try {
      const uploaded = await uploadToCloudinary({
        file,
        folder,
        purpose,
      });

      if (!uploaded.fileUrl) {
        throw new Error("Upload thành công nhưng không nhận được fileUrl.");
      }

      setUploadedFile(uploaded);
      onUploaded?.(uploaded);
    } catch (err) {
      const message = getErrorMessage(err);
      setLocalError(message);
      onError?.(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="h-full overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_24px_80px_rgba(14,165,233,0.14)]">
      <CardContent
        className={
          compact ? "flex h-full flex-col p-5" : "flex h-full flex-col p-6"
        }
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleChange}
          disabled={disabled || uploading}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-sm">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-black leading-snug text-slate-950 xl:text-xl">
                {label}
              </h3>
              <p className="mt-1 max-w-[34rem] text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={handlePickFile}
            disabled={disabled || uploading}
            className="shrink-0 whitespace-nowrap"
          >
            <UploadCloud className="h-4 w-4" />
            {uploading ? "Đang upload..." : buttonLabel}
          </Button>
        </div>

        <div className="mt-5 flex flex-1 flex-col gap-3">
          {selectedFile ? (
            <div className="rounded-2xl border border-cyan-100 bg-white/80 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">
                    {selectedFile.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  disabled={uploading}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-100 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Xóa file đã chọn"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-cyan-100 bg-white/80/50 px-4 py-5 text-sm text-slate-500">
              Chưa chọn file. Bấm{" "}
              <span className="font-semibold text-slate-950">
                {buttonLabel}
              </span>{" "}
              để upload.
            </div>
          )}

          {uploading ? <UploadProgress /> : null}

          {uploadedFile?.fileUrl ? (
            <div className="rounded-2xl border border-moss/20 bg-cyan-50 px-4 py-3">
              <div className="flex items-start gap-2 text-sm font-semibold text-cyan-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Upload thành công</span>
              </div>

              <div className="mt-3 rounded-xl border border-moss/15 bg-white/80 px-3 py-2">
                <p className="truncate text-xs text-slate-500">
                  {uploadedFile.fileUrl}
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Đã copy" : "Copy URL"}
                </Button>
                <a href={uploadedFile.fileUrl} target="_blank" rel="noreferrer">
                  <Button type="button" variant="outline" size="sm">
                    Mở file
                  </Button>
                </a>
              </div>
            </div>
          ) : null}

          {localError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {localError}
            </div>
          ) : null}

          {children ? <div className="mt-auto">{children}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
