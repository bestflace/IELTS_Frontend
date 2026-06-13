"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { getAttemptDetail } from "@/lib/api/attempts.api";
import type { Attempt } from "@/types";

function getTargetHref(attempt: Attempt, attemptId: string) {
  const status = attempt.status;

  if (status === "IN_PROGRESS") {
    return `/learner/attempts/${attemptId}/session`;
  }

  if (status === "SUBMITTED" || status === "GRADING") {
    return `/learner/attempts/${attemptId}/status`;
  }

  if (status === "GRADED") {
    return `/learner/attempts/${attemptId}/result`;
  }

  if (status === "ERROR" || status === "EXPIRED") {
    return `/learner/attempts/${attemptId}/status`;
  }

  return `/learner/attempts/${attemptId}/status`;
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    IN_PROGRESS: "Đang làm",
    SUBMITTED: "Đã nộp",
    GRADING: "Đang chấm",
    GRADED: "Đã chấm",
    ERROR: "Lỗi",
    EXPIRED: "Hết hạn",
  };

  return status ? map[status] || status : "Chưa rõ";
}

function statusTone(status?: string) {
  if (status === "GRADED") return "success" as const;
  if (status === "ERROR" || status === "EXPIRED") return "danger" as const;
  if (status === "SUBMITTED" || status === "GRADING") return "warning" as const;
  return "sage" as const;
}

function getAttemptTitle(attempt?: Attempt | null) {
  return (
    (attempt as any)?.test?.title ||
    (attempt as any)?.testTitle ||
    (attempt as any)?.test_title ||
    attempt?.testId ||
    "Bài làm IELTS"
  );
}

export default function Page({
  params,
}: {
  params: {
    attemptId: string;
  };
}) {
  const router = useRouter();
  const attemptId = params.attemptId;

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");

  async function loadAttempt() {
    setLoading(true);
    setError("");

    try {
      const data = await getAttemptDetail(attemptId);
      setAttempt(data);

      const target = getTargetHref(data, attemptId);
      setRedirecting(true);
      router.replace(target);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải thông tin bài làm",
      );
      setRedirecting(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  if (loading || redirecting) {
    return (
      <div className="relative mx-auto grid min-h-[70vh] max-w-5xl place-items-center overflow-hidden px-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-8 text-center shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-[0_18px_45px_rgba(14,165,233,0.16)]">
            {redirecting ? (
              <ArrowRight className="h-7 w-7 animate-pulse" />
            ) : (
              <Loader2 className="h-7 w-7 animate-spin" />
            )}
          </div>

          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
            <Sparkles className="h-3.5 w-3.5" />
            Đang kiểm tra
          </p>

          <h1 className="mt-4 font-serif text-3xl font-black text-slate-950 md:text-4xl">
            Đang mở bài làm
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
            Hệ thống đang kiểm tra trạng thái và chuyển bạn đến màn hình phù
            hợp.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative mx-auto grid min-h-[70vh] max-w-5xl place-items-center overflow-hidden px-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-rose-300/20 blur-3xl"
        />

        <Card className="relative max-w-lg overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-7 text-center shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-rose-100 bg-rose-50 text-rose-600">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <h1 className="mt-5 font-serif text-3xl font-black text-slate-950">
            Không thể mở bài làm
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">{error}</p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/learner/attempts">
              <Button
                variant="outline"
                className="rounded-2xl border-cyan-200 bg-white/80 text-sky-700 hover:border-cyan-300 hover:bg-cyan-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại lịch sử
              </Button>
            </Link>

            <Button
              onClick={loadAttempt}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]"
            >
              <RefreshCcw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative mx-auto grid min-h-[70vh] max-w-5xl place-items-center overflow-hidden px-5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <Card className="relative max-w-lg overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-7 text-center shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan-100 bg-cyan-50 text-cyan-700">
          <FileText className="h-8 w-8" />
        </div>

        <h1 className="mt-5 font-serif text-3xl font-black text-slate-950">
          {getAttemptTitle(attempt)}
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          Trạng thái hiện tại:
        </p>

        <div className="mt-3">
          <Badge tone={statusTone(attempt?.status)}>
            {statusLabel(attempt?.status)}
          </Badge>
        </div>

        {attempt ? (
          <Link href={getTargetHref(attempt, attemptId)}>
            <Button className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]">
              <CheckCircle2 className="h-4 w-4" />
              Mở bài làm
            </Button>
          </Link>
        ) : null}
      </Card>
    </div>
  );
}
