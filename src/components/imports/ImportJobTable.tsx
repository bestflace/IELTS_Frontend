"use client";

import Link from "next/link";
import { Eye, FileSpreadsheet, Filter, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/States";
import {
  deleteImportJob,
  retryImportJob,
  type ImportJob,
} from "@/lib/api/imports.api";
import { getErrorMessage } from "@/lib/api/client";
import { ImportJobStatusBadge } from "./ImportJobStatusBadge";
import { getImportTypeText } from "./ImportTypeSelector";

type Props = {
  jobs: ImportJob[];
  actionLoadingId?: string;
  deletingId?: string;
  onActionLoadingChange?: (id: string) => void;
  onDeletingChange?: (id: string) => void;
  onJobsChange?: (jobs: ImportJob[]) => void;
  onReload?: () => Promise<void> | void;
  onError?: (message: string) => void;
};

function getFileUrl(job: ImportJob) {
  return job.fileUrl || job.file_url || "";
}

function getErrorMessageFromJob(job: ImportJob) {
  return job.errorMessage || job.error_message || "";
}

function getResultJson(job: ImportJob) {
  return job.resultJson ?? job.result_json ?? null;
}

function getCreatedDate(job: ImportJob) {
  return job.createdAt || job.created_at || job.updatedAt || job.updated_at;
}

function getFinishedDate(job: ImportJob) {
  return job.finishedAt || job.finished_at || null;
}

function getUploaderName(job: ImportJob) {
  return (
    job.uploader?.fullName ||
    job.uploader?.full_name ||
    job.uploader?.email ||
    job.uploadedBy ||
    job.uploaded_by ||
    "Quản trị viên"
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function readResultNumber(job: ImportJob, keys: string[]) {
  const result = getResultJson(job) as any;

  for (const key of keys) {
    const value = result?.[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return "—";
}

const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export function ImportJobTable({
  jobs,
  actionLoadingId = "",
  deletingId = "",
  onActionLoadingChange,
  onDeletingChange,
  onJobsChange,
  onReload,
  onError,
}: Props) {
  const handleRetry = async (jobId: string) => {
    onActionLoadingChange?.(jobId);
    onError?.("");

    try {
      await retryImportJob(jobId);

      await onReload?.();

      for (let index = 0; index < 5; index += 1) {
        await sleep(1500);
        await onReload?.();
      }
    } catch (err) {
      onError?.(getErrorMessage(err));
    } finally {
      onActionLoadingChange?.("");
    }
  };

  const handleDelete = async (job: ImportJob) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá import job ${job.id}? Hành động này chỉ nên dùng cho job lỗi hoặc job test nháp.`,
    );

    if (!confirmed) return;

    onDeletingChange?.(job.id);
    onError?.("");

    try {
      await deleteImportJob(job.id);

      onJobsChange?.(jobs.filter((item) => item.id !== job.id));
      await onReload?.();
    } catch (err) {
      onError?.(getErrorMessage(err));
    } finally {
      onDeletingChange?.("");
    }
  };

  if (!jobs.length) {
    return (
      <EmptyState
        title="Chưa có job import"
        description="Tạo import mới để upload file Excel/CSV vào ngân hàng đề."
        action={
          <Link href="/admin/imports/new">
            <Button>Tạo import mới</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => {
        const fileUrl = getFileUrl(job);
        const errorMessage = getErrorMessageFromJob(job);
        const retrying = actionLoadingId === job.id;
        const deleting = deletingId === job.id;
        const isProcessing = job.status === "PROCESSING";

        return (
          <article
            key={job.id}
            className="overflow-hidden rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl"
          >
            <div className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1.5fr)_150px_150px_150px_160px_220px] xl:items-start">
              <div className="min-w-0">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50">
                    <FileSpreadsheet className="h-5 w-5 text-cyan-700" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-all font-semibold text-slate-950">
                      Job {job.id}
                    </p>

                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block max-w-full truncate text-xs font-semibold text-cyan-700 underline-offset-4 hover:underline"
                      >
                        {fileUrl}
                      </a>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        Chưa có file URL
                      </p>
                    )}

                    {errorMessage ? (
                      <p className="mt-2 text-xs font-semibold leading-5 text-red-700">
                        {errorMessage}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-500 xl:hidden">
                  Loại
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {getImportTypeText(job.type)}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-slate-500 xl:hidden">
                  Trạng thái
                </p>
                <ImportJobStatusBadge status={job.status} />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-500 xl:hidden">
                  Kết quả
                </p>

                <div className="mt-1 grid gap-1 text-xs text-slate-500">
                  <span>
                    Thành công:{" "}
                    <strong className="text-slate-950">
                      {readResultNumber(job, [
                        "successCount",
                        "success_count",
                        "createdCount",
                        "created_count",
                        "insertedCount",
                        "inserted_count",
                      ])}
                    </strong>
                  </span>

                  <span>
                    Lỗi:{" "}
                    <strong className="text-slate-950">
                      {readResultNumber(job, [
                        "failedCount",
                        "failed_count",
                        "errorCount",
                        "error_count",
                      ])}
                    </strong>
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-500 xl:hidden">
                  Người upload
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-950">
                  {getUploaderName(job)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[.16em] text-slate-500 xl:hidden">
                  Thời gian
                </p>

                <div className="mt-1 grid gap-1 text-xs leading-5 text-slate-500">
                  <span>Tạo: {formatDate(getCreatedDate(job))}</span>
                  <span>Xong: {formatDate(getFinishedDate(job))}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-cyan-100 bg-cyan-50/60 px-5 py-4">
              <Link href={`/admin/imports/${job.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </Button>
              </Link>

              {job.status === "ERROR" ? (
                <>
                  <Link href={`/admin/imports/${job.id}/errors`}>
                    <Button size="sm" variant="outline">
                      <Filter className="h-4 w-4" />
                      Lỗi
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    disabled={retrying}
                    onClick={() => handleRetry(job.id)}
                  >
                    <RotateCcw
                      className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
                    />
                    {retrying ? "Đang xử lý" : "Retry"}
                  </Button>
                </>
              ) : null}

              <Button
                size="sm"
                variant="outline"
                disabled={deleting || isProcessing}
                onClick={() => handleDelete(job)}
              >
                <Trash2
                  className={`h-4 w-4 ${deleting ? "animate-pulse" : ""}`}
                />
                {deleting ? "Đang xoá" : "Xoá"}
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
