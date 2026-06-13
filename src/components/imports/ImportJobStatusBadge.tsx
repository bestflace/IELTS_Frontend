"use client";

import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import type { ImportStatus } from "@/lib/api/imports.api";

type Props = {
  status?: ImportStatus | string | null;
};

function getStatusText(status?: string | null) {
  if (status === "DONE") return "Hoàn tất";
  if (status === "ERROR") return "Có lỗi";
  if (status === "PROCESSING") return "Đang xử lý";
  if (status === "PENDING") return "Đang chờ";

  return "Không rõ";
}

function getStatusClass(status?: string | null) {
  if (status === "DONE") return "border-cyan-100 bg-cyan-50 text-cyan-700";
  if (status === "ERROR") return "border-red-200 bg-red-50 text-red-700";
  if (status === "PROCESSING")
    return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "PENDING")
    return "border-cyan-100 bg-cyan-50/70 text-slate-500";

  return "border-cyan-100 bg-cyan-50/70 text-slate-500";
}

function getStatusIcon(status?: string | null) {
  if (status === "DONE") return CheckCircle2;
  if (status === "ERROR") return XCircle;
  if (status === "PROCESSING") return Loader2;

  return Clock3;
}

export function ImportJobStatusBadge({ status }: Props) {
  const Icon = getStatusIcon(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
        status,
      )}`}
    >
      <Icon
        className={`h-3.5 w-3.5 ${
          status === "PROCESSING" ? "animate-spin" : ""
        }`}
      />
      {getStatusText(status)}
    </span>
  );
}
