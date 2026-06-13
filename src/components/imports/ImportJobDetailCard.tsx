"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileSpreadsheet,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import type { ImportJob } from "@/lib/api/imports.api";
import { ImportJobStatusBadge } from "./ImportJobStatusBadge";
import { getImportTypeText } from "./ImportTypeSelector";

type Props = {
  job: ImportJob;
};

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

    if (value !== undefined && value !== null) return value;
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
    <pre className="max-h-[360px] overflow-auto rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl text-xs leading-6 text-slate-950">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function ImportJobDetailCard({ job }: Props) {
  const resultJson = getResultJson(job) as any;
  const fileUrl = getFileUrl(job);
  const errorMessage = getErrorMessageFromJob(job);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div className="grid gap-6 p-7 xl:grid-cols-[1fr_380px] xl:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-700">
              Import job detail
            </p>

            <h1 className="mt-3 break-all font-serif text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Job {job.id}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-500">
              Theo dõi tiến trình xử lý file import. Worker sẽ đọc file và ghi
              kết quả vào hệ thống.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <ImportJobStatusBadge status={job.status} />

              <span className="rounded-full border border-cyan-100 bg-cyan-50/70 px-4 py-2 text-sm font-semibold text-cyan-700">
                {getImportTypeText(job.type)}
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/70 p-5">
            <div className="grid gap-3">
              <div className="rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl p-4">
                <div className="flex items-center gap-3">
                  <UserRound className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                      Người tạo
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {getUploaderName(job)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Thời gian tạo
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatDate(getCreatedDate(job))}
                </p>
              </div>

              <div className="rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Bắt đầu xử lý
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatDate(getStartedDate(job))}
                </p>
              </div>

              <div className="rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Hoàn tất
                </p>
                <p className="mt-1 font-semibold text-slate-950">
                  {formatDate(getFinishedDate(job))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <Card className="rounded-[24px] border border-cyan-100 bg-white/80">
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

        <Card className="rounded-[24px] border border-cyan-100 bg-white/80">
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

        <Card className="rounded-[24px] border border-cyan-100 bg-white/80">
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
                className="mt-2 inline-flex max-w-full items-center gap-2 truncate text-sm font-semibold text-cyan-700 underline-offset-4 hover:underline"
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

      {errorMessage ? (
        <Card className="rounded-[28px] border border-red-200 bg-red-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-red-700" />
              <div>
                <h2 className="font-serif text-2xl font-black text-red-800">
                  Worker báo lỗi
                </h2>
                <p className="mt-2 text-sm leading-7 text-red-700">
                  {errorMessage}
                </p>

                <Link href={`/admin/imports/${job.id}/errors`}>
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
