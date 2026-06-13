"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  RefreshCcw,
  Sparkles,
  UserCheck,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { getAttemptDetail, getGradingStatus } from "@/lib/api/attempts.api";
import type { Attempt } from "@/types";

type GradingStepStatus = "done" | "active" | "waiting" | "error";

type StatusPayload = {
  status?: string;
  attemptStatus?: string;
  objectiveStatus?: string;
  aiStatus?: string;
  teacherStatus?: string;
  asrStatus?: string;
  message?: string;
  errorMessage?: string;
  isObjectiveGraded?: boolean;
  isAiGraded?: boolean;
  isTeacherReviewed?: boolean;
  completedAt?: string | null;
  updatedAt?: string | null;
  resultReady?: boolean;
  reviewReady?: boolean;
  [key: string]: unknown;
};

function normalizeStatus(status?: string) {
  return (status || "").toUpperCase();
}

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    IN_PROGRESS: "Đang làm",
    SUBMITTED: "Đã nộp",
    GRADING: "Đang chấm",
    GRADED: "Đã chấm",
    ERROR: "Lỗi chấm bài",
    EXPIRED: "Hết hạn",
    PENDING: "Đang chờ",
    DONE: "Hoàn tất",
    COMPLETED: "Hoàn tất",
    FAILED: "Thất bại",
  };

  const key = normalizeStatus(status);
  return map[key] || status || "Chưa rõ";
}

function statusTone(status?: string) {
  const key = normalizeStatus(status);

  if (key === "GRADED" || key === "DONE" || key === "COMPLETED")
    return "success" as const;
  if (key === "ERROR" || key === "FAILED" || key === "EXPIRED")
    return "danger" as const;
  if (key === "GRADING" || key === "SUBMITTED" || key === "PENDING")
    return "warning" as const;
  return "sage" as const;
}

function formatDateTime(value?: string | null) {
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

function buildSteps(attempt?: Attempt | null, status?: StatusPayload | null) {
  const attemptStatus = normalizeStatus(
    status?.attemptStatus || status?.status || attempt?.status,
  );

  const hasError =
    attemptStatus === "ERROR" ||
    normalizeStatus(status?.objectiveStatus) === "FAILED" ||
    normalizeStatus(status?.aiStatus) === "FAILED" ||
    normalizeStatus(status?.teacherStatus) === "FAILED";

  const isGraded =
    attemptStatus === "GRADED" ||
    status?.resultReady === true ||
    status?.isTeacherReviewed === true ||
    Boolean(status?.completedAt);

  const isSubmitted = ["SUBMITTED", "GRADING", "GRADED", "ERROR"].includes(
    attemptStatus,
  );

  const objectiveDone =
    status?.isObjectiveGraded ||
    ["DONE", "COMPLETED"].includes(normalizeStatus(status?.objectiveStatus)) ||
    isGraded;

  const aiDone =
    status?.isAiGraded ||
    ["DONE", "COMPLETED"].includes(normalizeStatus(status?.aiStatus)) ||
    isGraded;

  const teacherDone =
    status?.isTeacherReviewed ||
    ["DONE", "COMPLETED"].includes(normalizeStatus(status?.teacherStatus)) ||
    isGraded;

  const steps = [
    {
      key: "submitted",
      title: "Đã nộp bài",
      description: "Hệ thống đã nhận bài làm và khóa phần chỉnh sửa.",
      icon: FileText,
      status: isSubmitted ? "done" : "waiting",
    },
    {
      key: "objective",
      title: "Chấm câu hỏi khách quan",
      description: "Reading/Listening được đối chiếu với đáp án trong đề.",
      icon: CheckCircle2,
      status: objectiveDone
        ? "done"
        : hasError
          ? "error"
          : isSubmitted
            ? "active"
            : "waiting",
    },
    {
      key: "ai",
      title: "Phân tích AI",
      description: "Writing/Speaking được xử lý để tạo nhận xét ban đầu.",
      icon: Sparkles,
      status: aiDone
        ? "done"
        : hasError
          ? "error"
          : objectiveDone
            ? "active"
            : "waiting",
    },
    {
      key: "teacher",
      title: "Giáo viên review",
      description: "Bài cần chấm tay sẽ vào hàng đợi giáo viên.",
      icon: UserCheck,
      status: teacherDone
        ? "done"
        : hasError
          ? "error"
          : aiDone
            ? "active"
            : "waiting",
    },
  ] satisfies {
    key: string;
    title: string;
    description: string;
    icon: typeof FileText;
    status: GradingStepStatus;
  }[];

  if (isGraded) {
    return steps.map((step) => ({
      ...step,
      status: "done" as GradingStepStatus,
    }));
  }

  return steps;
}

function StepDot({ status }: { status: GradingStepStatus }) {
  if (status === "done") {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_14px_30px_rgba(14,165,233,0.22)]">
        <CheckCircle2 className="h-5 w-5" />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-full border border-rose-100 bg-rose-50 text-rose-600">
        <AlertTriangle className="h-5 w-5" />
      </div>
    );
  }

  return (
    <div className="grid h-12 w-12 place-items-center rounded-full border border-cyan-100 bg-white/80 text-slate-400">
      <Clock className="h-5 w-5" />
    </div>
  );
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
  const [gradingStatus, setGradingStatus] = useState<StatusPayload | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadData(silent = false) {
    if (silent) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const [attemptData, statusData] = await Promise.all([
        getAttemptDetail(attemptId),
        getGradingStatus(attemptId),
      ]);

      setAttempt(attemptData);
      setGradingStatus(statusData || {});
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải trạng thái chấm bài",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const attemptStatus = normalizeStatus(
    gradingStatus?.attemptStatus || gradingStatus?.status || attempt?.status,
  );

  const steps = useMemo(
    () => buildSteps(attempt, gradingStatus),
    [attempt, gradingStatus],
  );

  const isResultReady =
    attemptStatus === "GRADED" ||
    gradingStatus?.resultReady === true ||
    gradingStatus?.reviewReady === true;

  const hasError =
    attemptStatus === "ERROR" || Boolean(gradingStatus?.errorMessage);

  if (loading) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-5">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan-100 bg-cyan-50 text-cyan-700">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Đang tải trạng thái chấm bài...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-5">
        <Card className="max-w-lg rounded-[34px] border border-white/70 bg-white/80 p-7 text-center shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-600" />
          <h1 className="mt-4 font-serif text-3xl font-black text-slate-950">
            Không thể tải trạng thái
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push("/learner/attempts")}
              className="rounded-2xl border-cyan-200 bg-white/80 text-sky-700"
            >
              Quay lại lịch sử
            </Button>
            <Button
              onClick={() => loadData()}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
            >
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl space-y-7 px-5 py-8 md:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-20 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <Link
        href="/learner/attempts"
        className="relative inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-cyan-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại lịch sử làm bài
      </Link>

      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-7 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl md:p-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge tone={statusTone(attemptStatus)}>
              {statusLabel(attemptStatus)}
            </Badge>

            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              {getAttemptTitle(attempt)}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Theo dõi quá trình nộp bài, chấm khách quan, phân tích AI và
              review giáo viên.
            </p>

            {gradingStatus?.message || gradingStatus?.errorMessage ? (
              <p
                className={[
                  "mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold",
                  hasError
                    ? "border-rose-100 bg-rose-50 text-rose-700"
                    : "border-cyan-100 bg-cyan-50 text-cyan-700",
                ].join(" ")}
              >
                {gradingStatus.errorMessage || gradingStatus.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="rounded-2xl border-cyan-200 bg-white/80 text-sky-700 hover:border-cyan-300 hover:bg-cyan-50"
            >
              <RefreshCcw
                className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"}
              />
              Làm mới
            </Button>

            {isResultReady ? (
              <Link href={`/learner/attempts/${attemptId}/result`}>
                <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]">
                  Xem kết quả
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardContent className="p-6 md:p-8">
          <div className="space-y-5">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.key}
                  className="relative grid gap-4 rounded-[28px] border border-cyan-100 bg-white/75 p-5 shadow-sm md:grid-cols-[56px_1fr_auto]"
                >
                  <StepDot status={step.status} />

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-serif text-2xl font-black text-slate-950">
                        {step.title}
                      </h2>
                      <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-700">
                        Bước {index + 1}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>

                  <div className="hidden h-12 w-12 place-items-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 md:grid">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                Cập nhật
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {formatDateTime(gradingStatus?.updatedAt)}
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                Hoàn tất
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {formatDateTime(gradingStatus?.completedAt)}
              </p>
            </div>

            <div className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">
                ASR/AI
              </p>
              <p className="mt-2 font-semibold text-slate-900">
                {statusLabel(
                  gradingStatus?.asrStatus || gradingStatus?.aiStatus,
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
