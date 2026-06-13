"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  RotateCcw,
  UserRound,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ErrorState, LoadingState } from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import {
  getImportJob,
  retryImportJob,
  type ImportJob,
} from "@/lib/api/imports.api";

function getStatusText(status?: string) {
  if (status === "DONE") return "Hoàn tất";
  if (status === "ERROR") return "Có lỗi";
  if (status === "PROCESSING") return "Đang xử lý";
  return "Đang chờ";
}

function getStatusClass(status?: string) {
  if (status === "DONE") return "border-cyan-100 bg-cyan-50 text-cyan-700";
  if (status === "ERROR") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "PROCESSING")
    return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-cyan-100 bg-cyan-50/70 text-slate-500";
}

function getStatusIcon(status?: string) {
  if (status === "DONE") return CheckCircle2;
  if (status === "ERROR") return XCircle;
  if (status === "PROCESSING") return Loader2;
  return Clock3;
}

function getTypeText(type?: string) {
  if (type === "READING_SET") return "Reading Set";
  if (type === "LISTENING_SET") return "Listening Set";
  if (type === "WRITING_TASK") return "Writing Task";
  if (type === "SPEAKING_SET") return "Speaking Set";
  if (type === "TEST") return "Test";
  return type || "—";
}

function getFileUrl(job?: ImportJob | null) {
  return job?.fileUrl || job?.file_url || "";
}

function getResultJson(job?: ImportJob | null) {
  return job?.resultJson ?? job?.result_json ?? null;
}

function getErrorMessageFromJob(job?: ImportJob | null) {
  return job?.errorMessage || job?.error_message || "";
}

function getCreatedDate(job?: ImportJob | null) {
  return job?.createdAt || job?.created_at || job?.updatedAt || job?.updated_at;
}

function getStartedDate(job?: ImportJob | null) {
  return job?.startedAt || job?.started_at || null;
}

function getFinishedDate(job?: ImportJob | null) {
  return job?.finishedAt || job?.finished_at || null;
}

function getUploaderName(job?: ImportJob | null) {
  return (
    job?.uploader?.fullName ||
    job?.uploader?.full_name ||
    job?.uploader?.email ||
    job?.uploadedBy ||
    job?.uploaded_by ||
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

function readResultNumber(result: any, keys: string[]) {
  for (const key of keys) {
    const value = result?.[key];

    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return "—";
}

function JsonPreview({ value }: { value: unknown }) {
  if (!value) {
    return (
      <p className="text-sm leading-6 text-slate-500">
        Worker chưa ghi kết quả xử lý cho job này.
      </p>
    );
  }

  return (
    <pre className="max-h-[360px] overflow-auto rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-4 text-xs leading-6 text-slate-950">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function ImportJobDetailPage() {
  const params = useParams();
  const jobId = String(params.jobId || "");

  const [job, setJob] = useState<ImportJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");
  const sleep = (ms: number) =>
    new Promise((resolve) => window.setTimeout(resolve, ms));
  const loadData = useCallback(async () => {
    if (!jobId) {
      setError("Không tìm thấy mã import job.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getImportJob(jobId);
      setJob(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resultJson = useMemo(() => getResultJson(job) as any, [job]);
  const StatusIcon = getStatusIcon(job?.status);
  const fileUrl = getFileUrl(job);

  const handleRetry = async () => {
    if (!jobId) return;

    setRetrying(true);
    setError("");

    try {
      const retried = await retryImportJob(jobId);
      setJob(retried);

      for (let index = 0; index < 5; index += 1) {
        await sleep(1500);
        const latest = await getImportJob(jobId);
        setJob(latest);

        if (latest.status === "DONE" || latest.status === "ERROR") {
          break;
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRetrying(false);
    }
  };

  if (error && !job) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/imports">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>

        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>

        {job?.status === "ERROR" ? (
          <Button onClick={handleRetry} disabled={retrying}>
            <RotateCcw className="h-4 w-4" />
            {retrying ? "Đang retry..." : "Retry job"}
          </Button>
        ) : null}
      </div>

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div className="relative grid gap-6 p-7 xl:grid-cols-[1fr_380px] xl:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-700">
              Import job detail
            </p>

            <h1 className="mt-3 break-all font-serif text-3xl font-black leading-tight text-slate-950 md:text-5xl">
              Job {job?.id}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-500">
              Theo dõi tiến trình xử lý file import. Worker sẽ đọc file và ghi
              kết quả vào hệ thống.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${getStatusClass(
                  job?.status,
                )}`}
              >
                <StatusIcon
                  className={`h-4 w-4 ${
                    job?.status === "PROCESSING" ? "animate-spin" : ""
                  }`}
                />
                {getStatusText(job?.status)}
              </span>

              <span className="rounded-full border border-cyan-100 bg-cyan-50/70 px-4 py-2 text-sm font-bold text-cyan-700">
                {getTypeText(job?.type)}
              </span>
            </div>
          </div>

          <div className="rounded-[30px] border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-5">
            <div className="grid gap-3">
              <div className="rounded-2xl border border-cyan-100 bg-white/80 shadow-sm backdrop-blur-xl p-4">
                <div className="flex items-center gap-3">
                  <UserRound className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                      Người tạo
                    </p>
                    <p className="mt-1 font-black text-slate-950">
                      {getUploaderName(job)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/80 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Thời gian tạo
                </p>
                <p className="mt-1 font-black text-slate-950">
                  {formatDate(getCreatedDate(job))}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/80 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Bắt đầu xử lý
                </p>
                <p className="mt-1 font-black text-slate-950">
                  {formatDate(getStartedDate(job))}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/80 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Hoàn tất
                </p>
                <p className="mt-1 font-black text-slate-950">
                  {formatDate(getFinishedDate(job))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <CheckCircle2 className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Thành công
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {readResultNumber(resultJson, [
                "successCount",
                "success_count",
                "createdCount",
                "created_count",
                "insertedCount",
                "inserted_count",
              ])}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <XCircle className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Lỗi
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {readResultNumber(resultJson, [
                "failedCount",
                "failed_count",
                "errorCount",
                "error_count",
              ])}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <FileSpreadsheet className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              File import
            </p>
            {fileUrl ? (
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex max-w-full items-center gap-2 truncate text-sm font-bold text-cyan-700 underline-offset-4 hover:underline"
              >
                Mở file nguồn
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Chưa có file URL</p>
            )}
          </CardContent>
        </Card>
      </section>

      {getErrorMessageFromJob(job) ? (
        <Card className="rounded-[28px] border border-rose-200 bg-rose-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-rose-700" />
              <div>
                <h2 className="font-serif text-2xl font-black text-rose-800">
                  Worker báo lỗi
                </h2>
                <p className="mt-2 text-sm leading-7 text-rose-700">
                  {getErrorMessageFromJob(job)}
                </p>

                <Link href={`/admin/imports/${jobId}/errors`}>
                  <Button className="mt-4" variant="outline">
                    Xem chi tiết lỗi
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardHeader>
          <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
            Worker result
          </p>
          <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
            Kết quả xử lý
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Dữ liệu này được đọc từ resultJson/result_json của import job.
          </p>
        </CardHeader>

        <CardContent>
          <JsonPreview value={resultJson} />
        </CardContent>
      </Card>
    </div>
  );
}
