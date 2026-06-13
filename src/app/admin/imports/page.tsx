"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileSpreadsheet,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  XCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import {
  deleteImportJob,
  getImportJobs,
  retryImportJob,
  type ImportJob,
  type ImportStatus,
  type ImportType,
} from "@/lib/api/imports.api";
import { ImportJobTable } from "@/components/imports/ImportJobTable";
const IMPORT_TYPES: Array<{
  value: ImportType;
  label: string;
}> = [
  { value: "READING_SET", label: "Reading Set" },
  { value: "LISTENING_SET", label: "Listening Set" },
  { value: "WRITING_TASK", label: "Writing Task" },
  { value: "SPEAKING_SET", label: "Speaking Set" },
  { value: "TEST", label: "Test" },
];

const STATUS_OPTIONS: Array<{
  value: "" | ImportStatus;
  label: string;
}> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "DONE", label: "Hoàn tất" },
  { value: "ERROR", label: "Có lỗi" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

function getTypeText(type?: string) {
  return IMPORT_TYPES.find((item) => item.value === type)?.label || type || "—";
}

function getStatusText(status?: string) {
  if (status === "DONE") return "Hoàn tất";
  if (status === "ERROR") return "Có lỗi";
  if (status === "PROCESSING") return "Đang xử lý";
  return "Đang chờ";
}

function getStatusClass(status?: string) {
  if (status === "DONE") return "border-cyan-100 bg-cyan-50 text-cyan-700";
  if (status === "ERROR") return "border-red-200 bg-red-50 text-red-700";
  if (status === "PROCESSING")
    return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-cyan-100 bg-cyan-50/70 text-slate-500";
}

function getStatusIcon(status?: string) {
  if (status === "DONE") return CheckCircle2;
  if (status === "ERROR") return XCircle;
  if (status === "PROCESSING") return Loader2;
  return FileSpreadsheet;
}

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

export default function AdminImportsPage() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<"" | ImportType>("");
  const [status, setStatus] = useState<"" | ImportStatus>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getImportJobs({
        limit: 100,
        type: type || undefined,
        status: status || undefined,
      });

      setJobs(response.items || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [type, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredJobs = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return jobs.filter((job) => {
      if (!normalized) return true;

      return `${job.id} ${getTypeText(job.type)} ${getStatusText(
        job.status,
      )} ${getUploaderName(job)} ${getFileUrl(job)} ${getErrorMessageFromJob(
        job,
      )}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [jobs, keyword]);

  useEffect(() => {
    setPage(1);
  }, [keyword, type, status, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedJobs = filteredJobs.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      done: jobs.filter((job) => job.status === "DONE").length,
      processing: jobs.filter((job) => job.status === "PROCESSING").length,
      error: jobs.filter((job) => job.status === "ERROR").length,
    };
  }, [jobs]);

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Imports"
        title="Import dữ liệu ngân hàng đề"
        description="Theo dõi các file import Reading, Listening, Writing, Speaking và trạng thái xử lý của worker."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>

            <Link href="/admin/imports/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo import mới
              </Button>
            </Link>
          </div>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <FileSpreadsheet className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Tổng job
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.total}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <CheckCircle2 className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Hoàn tất
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.done}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <Loader2 className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Đang xử lý
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.processing}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <AlertTriangle className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Có lỗi
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.error}
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Import jobs
              </p>

              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                Danh sách file import
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Mỗi file import sẽ tạo một job để worker xử lý bất đồng bộ.
              </p>
            </div>

            <div className="grid w-full gap-3 xl:w-[980px] xl:grid-cols-[1fr_190px_190px_150px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="pl-9"
                  placeholder="Tìm theo mã job, loại import, người upload..."
                />
              </div>

              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as "" | ImportType)
                }
                className="h-11 rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                <option value="">Tất cả loại import</option>
                {IMPORT_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "" | ImportStatus)
                }
                className="h-11 rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item.value || "ALL"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number(event.target.value) as typeof pageSize)
                }
                className="h-11 rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} / trang
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredJobs.length ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-cyan-100">
                <ImportJobTable
                  jobs={paginatedJobs}
                  actionLoadingId={actionLoadingId}
                  deletingId={deletingId}
                  onActionLoadingChange={setActionLoadingId}
                  onDeletingChange={setDeletingId}
                  onJobsChange={setJobs}
                  onReload={loadData}
                  onError={setError}
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Hiển thị{" "}
                  <strong className="text-slate-950">
                    {(safePage - 1) * pageSize + 1}
                  </strong>
                  –
                  <strong className="text-slate-950">
                    {Math.min(filteredJobs.length, safePage * pageSize)}
                  </strong>{" "}
                  trong{" "}
                  <strong className="text-slate-950">
                    {filteredJobs.length}
                  </strong>{" "}
                  job import
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>

                  <span className="rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700">
                    {safePage}/{totalPages}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="Chưa có job import"
              description="Tạo import mới để upload file Excel/CSV vào ngân hàng đề."
              action={
                <Link href="/admin/imports/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Tạo import mới
                  </Button>
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
