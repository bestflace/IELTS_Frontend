import Link from "next/link";
import { CalendarDays, Clock3, FileText } from "lucide-react";

import { AttemptStatusBadge } from "./AttemptStatusBadge";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

type AttemptLike = {
  id: string;
  mode?: string | null;
  status?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  test?: {
    title?: string | null;
  } | null;
};

type Props = {
  attempt: AttemptLike;
};

function formatDate(value?: string | null) {
  if (!value) return "Chưa có";
  return new Date(value).toLocaleString("vi-VN");
}

export function AttemptDetailCard({ attempt }: Props) {
  return (
    <Card className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
              <FileText className="h-5 w-5" />
            </span>

            <h2 className="font-serif text-2xl font-black text-slate-950">
              {attempt.test?.title || "IELTS Practice Test"}
            </h2>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <AttemptStatusBadge status={attempt.status} />
            {attempt.mode ? (
              <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-700">
                {attempt.mode}
              </span>
            ) : null}
          </div>
        </div>

        <Link href={`/learner/attempts/${attempt.id}/session`}>
          <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]">
            Tiếp tục làm bài
          </Button>
        </Link>
      </div>

      <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-cyan-100 bg-cyan-50/70 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <CalendarDays className="h-4 w-4 text-cyan-700" />
            Bắt đầu
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {formatDate(attempt.startedAt)}
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-900">
            <Clock3 className="h-4 w-4 text-blue-700" />
            Nộp bài
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            {formatDate(attempt.submittedAt)}
          </p>
        </div>
      </div>
    </Card>
  );
}
