import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Mic,
  PenLine,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";

type AttemptRow = Record<string, any>;

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

function getAttemptDate(attempt: AttemptRow) {
  return (
    attempt.gradedAt ||
    attempt.graded_at ||
    attempt.submittedAt ||
    attempt.submitted_at ||
    attempt.startedAt ||
    attempt.started_at ||
    attempt.createdAt ||
    attempt.created_at ||
    attempt.updatedAt ||
    attempt.updated_at ||
    null
  );
}

function getAttemptTitle(attempt: AttemptRow) {
  return (
    attempt.test?.title ||
    attempt.testTitle ||
    attempt.test_title ||
    attempt.title ||
    "Bài luyện IELTS"
  );
}

function getSkill(attempt: AttemptRow) {
  return String(
    attempt.mode ||
      attempt.test?.type ||
      attempt.skill ||
      attempt.partLabel ||
      attempt.part_label ||
      "FULL",
  ).toUpperCase();
}

function getSkillMeta(skill: string) {
  if (skill.includes("READING")) {
    return {
      label: "Reading",
      icon: BookOpen,
      className: "border-cyan-100 bg-cyan-50 text-cyan-700",
    };
  }

  if (skill.includes("LISTENING")) {
    return {
      label: "Listening",
      icon: Headphones,
      className: "border-sky-100 bg-sky-50 text-sky-700",
    };
  }

  if (skill.includes("WRITING")) {
    return {
      label: "Writing",
      icon: PenLine,
      className: "border-blue-100 bg-blue-50 text-blue-700",
    };
  }

  if (skill.includes("SPEAKING")) {
    return {
      label: "Speaking",
      icon: Mic,
      className: "border-teal-100 bg-teal-50 text-teal-700",
    };
  }

  return {
    label: "Full test",
    icon: FileText,
    className: "border-slate-100 bg-slate-50 text-slate-700",
  };
}

function getBand(attempt: AttemptRow) {
  const candidates = [
    attempt.overallBand,
    attempt.overall_band,
    attempt.bandScore,
    attempt.band_score,
    attempt.score,
    attempt.result?.overallBand,
    attempt.result?.overall_band,
    attempt.results?.overallBand,
    attempt.results?.overall_band,
    attempt.attemptResult?.overallBand,
    attempt.attempt_result?.overall_band,
  ];

  for (const candidate of candidates) {
    const value = Number(candidate);
    if (Number.isFinite(value)) {
      return value.toFixed(1).replace(".0", "");
    }
  }

  return "—";
}

function getStatusLabel(status?: string) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "IN_PROGRESS") return "Đang làm";
  if (normalized === "SUBMITTED") return "Đã nộp";
  if (normalized === "GRADING") return "Đang chấm";
  if (normalized === "GRADED") return "Đã chấm";
  if (normalized === "EXPIRED") return "Hết giờ";
  if (normalized === "ERROR") return "Lỗi";

  return status || "Không rõ";
}

function getStatusTone(status?: string) {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "GRADED") return "success";
  if (normalized === "GRADING" || normalized === "SUBMITTED") return "warning";
  if (normalized === "ERROR" || normalized === "EXPIRED") return "danger";

  return "sage";
}

export function AttemptsAnalyticsTable({
  attempts = [],
  children,
}: {
  attempts?: AttemptRow[];
  children?: React.ReactNode;
}) {
  return (
    <Card className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/82 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/18 blur-3xl"
      />

      <CardContent className="relative p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
              Recent attempts
            </p>
            <h2 className="mt-2 font-serif text-2xl font-black text-slate-950">
              Bài làm gần đây
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Theo dõi trạng thái và điểm số của các lần luyện gần nhất.
            </p>
          </div>

          <Link href="/learner/attempts">
            <Button
              variant="outline"
              className="rounded-2xl border-cyan-200 bg-white/80 text-sky-700 shadow-sm hover:border-cyan-300 hover:bg-cyan-50"
            >
              Xem lịch sử
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {attempts.length ? (
          <div className="mt-6 overflow-hidden rounded-[26px] border border-cyan-100">
            <div className="hidden grid-cols-[1.5fr_.75fr_.75fr_.75fr_.8fr] border-b border-cyan-100 bg-cyan-50/70 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500 md:grid">
              <span>Bài làm</span>
              <span>Kỹ năng</span>
              <span>Trạng thái</span>
              <span>Band</span>
              <span>Thời gian</span>
            </div>

            <div className="divide-y divide-cyan-100 bg-white/70">
              {attempts.map((attempt) => {
                const skill = getSkillMeta(getSkill(attempt));
                const Icon = skill.icon;

                return (
                  <Link
                    key={attempt.id}
                    href={`/learner/attempts/${attempt.id}`}
                    className="grid gap-4 px-5 py-4 transition hover:bg-cyan-50/70 md:grid-cols-[1.5fr_.75fr_.75fr_.75fr_.8fr] md:items-center"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {getAttemptTitle(attempt)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        ID: {attempt.id}
                      </p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black ${skill.className}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {skill.label}
                      </span>
                    </div>

                    <div>
                      <Badge tone={getStatusTone(attempt.status) as any}>
                        {getStatusLabel(attempt.status)}
                      </Badge>
                    </div>

                    <div className="font-serif text-2xl font-black text-sky-700">
                      {getBand(attempt)}
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <Clock3 className="h-4 w-4 text-cyan-500" />
                      {formatDate(getAttemptDate(attempt))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-[26px] border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-cyan-600" />
            <h3 className="mt-4 font-serif text-2xl font-black text-slate-950">
              Chưa có bài làm
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Khi bạn bắt đầu luyện đề, lịch sử sẽ hiển thị tại đây.
            </p>
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
