"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FileText, Star } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";

type Props = {
  title: string;
  status?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
  durationText?: string;
  overallBand?: number | string | null;
  correctCount?: number | null;
  totalCount?: number | null;
  reviewHref?: string;
};

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

function statusText(status?: string | null) {
  if (status === "GRADED") return "Đã chấm";
  if (status === "GRADING") return "Đang chấm";
  if (status === "SUBMITTED") return "Đã nộp";
  if (status === "EXPIRED") return "Hết giờ";
  return "Đang xử lý";
}

export function ResultSummaryCard({
  title,
  status,
  submittedAt,
  gradedAt,
  durationText = "—",
  overallBand,
  correctCount,
  totalCount,
  reviewHref,
}: Props) {
  const hasBand =
    overallBand !== null && overallBand !== undefined && overallBand !== "";
  const hasCorrect = correctCount !== null && correctCount !== undefined;

  return (
    <Card className="overflow-hidden rounded-[32px] border border-line bg-surface">
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-[360px_1fr]">
          <aside className="flex min-h-[320px] flex-col items-center justify-center bg-moss p-8 text-center text-white">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-white/25">
              <p className="font-serif text-4xl font-bold">
                {hasBand
                  ? Number(overallBand).toFixed(1)
                  : hasCorrect
                    ? correctCount
                    : "—"}
              </p>
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[.22em] text-white/80">
              {hasBand ? "Overall Band" : "Số câu đúng"}
            </p>
          </aside>

          <main className="paper-texture p-7 md:p-10">
            <Badge tone="sage">{statusText(status)}</Badge>

            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-ink md:text-5xl">
              {title}
            </h1>

            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-line bg-paper p-4">
                <CheckCircle2 className="h-5 w-5 text-moss" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[.18em] text-sage">
                  Trạng thái
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {statusText(status)}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-4">
                <Clock3 className="h-5 w-5 text-moss" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[.18em] text-sage">
                  Thời gian nộp
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {formatDate(submittedAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-4">
                <Star className="h-5 w-5 text-moss" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[.18em] text-sage">
                  Thời gian chấm
                </p>
                <p className="mt-2 font-semibold text-ink">
                  {formatDate(gradedAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-paper p-4">
                <FileText className="h-5 w-5 text-moss" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[.18em] text-sage">
                  Thời gian làm
                </p>
                <p className="mt-2 font-semibold text-ink">{durationText}</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {reviewHref ? (
                <Link href={reviewHref}>
                  <Button>
                    Review chi tiết
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : null}
            </div>
          </main>
        </div>
      </CardContent>
    </Card>
  );
}
