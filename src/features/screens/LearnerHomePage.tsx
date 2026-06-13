"use client";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock3,
  Headphones,
  Mic,
  PenLine,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { PageHeader } from "@/components/common/PageHeader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getLearnerOverview } from "@/lib/api/reports.api";
import { getMyAttempts } from "@/lib/api/attempts.api";
import { safeArray, formatDate } from "@/lib/utils";
import type { Attempt } from "@/types";
const skillCards = [
  ["Reading", "/reading-sets", BookOpen, "Passage, T/F/NG, matching headings"],
  ["Listening", "/listening-sets", Headphones, "Audio + notes + answer map"],
  ["Writing", "/writing-tasks", PenLine, "Task 1/2 editor and rubric"],
  ["Speaking", "/speaking-sets", Mic, "Part 1–3 recorder practice"],
];
export function LearnerHomePage() {
  const attempts = useApiQuery(() => getMyAttempts({ limit: 5 }), []);
  const recent = safeArray<Attempt>(attempts.data?.data || attempts.data);
  return (
    <div>
      <PageHeader
        eyebrow="Study dashboard"
        title="Không gian luyện thi của bạn"
        description="Chọn đề, tiếp tục attempt đang làm dở, xem feedback và theo dõi tiến bộ từng kỹ năng."
        actions={
          <Link href="/learner/tests">
            <Button>
              Luyện đề ngay <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <Clock3 className="h-5 w-5 text-sky-600" />
          <p className="mt-4 text-sm text-slate-500">Đang làm</p>
          <p className=" text-3xl font-bold">
            {recent.filter((a) => a.status === "IN_PROGRESS").length}
          </p>
        </Card>
        <Card className="p-5">
          <TrendingUp className="h-5 w-5 text-sky-600" />
          <p className="mt-4 text-sm text-slate-500">Đã nộp gần đây</p>
          <p className=" text-3xl font-bold">{recent.length}</p>
        </Card>
        <Card className="p-5">
          <BarChart3 className="h-5 w-5 text-sky-600" />
          <p className="mt-4 text-sm text-slate-500">Band mục tiêu</p>
          <p className=" text-3xl font-bold">7.0+</p>
        </Card>
        <Card className="bg-gradient-to-br from-white/75 via-cyan-50/70 to-blue-50/60 p-5">
          <p className="text-xs uppercase tracking-[.2em] text-cyan-600">
            Today focus
          </p>
          <p className="mt-3  text-2xl font-bold">
            Reading passage + Writing Task 2
          </p>
        </Card>
      </section>
      <section className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className=" text-2xl font-bold">Luyện theo kỹ năng</h2>
            <Link
              href="/learner/tests"
              className="text-sm font-semibold text-sky-600"
            >
              Xem tất cả đề
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {skillCards.map(([name, href, Icon, desc]) => (
              <Link
                key={name as string}
                href={href as string}
                className="group rounded-2xl border border-sky-100/70 bg-white/45 p-4 transition hover:border-cyan-300 hover:bg-cyan-50/50"
              >
                <Icon className="h-5 w-5 text-sky-600" />
                <h3 className="mt-3  text-xl font-bold">{name as string}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {desc as string}
                </p>
              </Link>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className=" text-2xl font-bold">Attempt gần đây</h2>
            <Badge tone="sage">autosave</Badge>
          </div>
          <div className="space-y-3">
            {attempts.loading &&
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-sky-50"
                />
              ))}
            {!attempts.loading && recent.length === 0 && (
              <p className="rounded-xl border border-sky-100/70 bg-white/45 p-4 text-sm text-slate-500">
                Bạn chưa có attempt nào. Hãy bắt đầu bằng một đề ngắn.
              </p>
            )}
            {recent.map((a) => (
              <Link
                key={a.id}
                href={`/learner/attempts/${a.id}`}
                className="block rounded-xl border border-sky-100/70 bg-white/45 p-4 hover:border-cyan-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {a.test?.title || a.mode || "IELTS Practice"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatDate(a.startedAt)}
                    </p>
                  </div>
                  <Badge
                    tone={
                      a.status === "GRADED"
                        ? "success"
                        : a.status === "ERROR"
                          ? "danger"
                          : "default"
                    }
                  >
                    {a.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
