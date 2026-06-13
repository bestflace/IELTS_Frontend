import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import { Button } from "@/components/common/Button";
import { AttemptStatusBadge } from "./AttemptStatusBadge";

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
  attempts: AttemptLike[];
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN");
}

export function AttemptHistoryTable({ attempts }: Props) {
  if (!attempts.length) {
    return (
      <div className="rounded-[32px] border border-dashed border-cyan-200 bg-cyan-50/70 p-8 text-center">
        <FileText className="mx-auto h-10 w-10 text-cyan-700" />
        <p className="mt-4 font-serif text-2xl font-black text-slate-950">
          Chưa có lịch sử làm bài
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Khi bạn bắt đầu làm đề, lịch sử sẽ hiển thị tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[30px] border border-cyan-100 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-cyan-100 bg-cyan-50/80 text-xs uppercase tracking-[0.16em] text-slate-500">
          <tr>
            <th className="px-5 py-4">Đề thi</th>
            <th className="px-5 py-4">Mode</th>
            <th className="px-5 py-4">Trạng thái</th>
            <th className="px-5 py-4">Bắt đầu</th>
            <th className="px-5 py-4">Nộp bài</th>
            <th className="px-5 py-4 text-right">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-cyan-100">
          {attempts.map((attempt) => (
            <tr key={attempt.id} className="transition hover:bg-cyan-50/60">
              <td className="px-5 py-4 font-bold text-slate-950">
                {attempt.test?.title || "IELTS Practice Test"}
              </td>
              <td className="px-5 py-4 text-slate-500">{attempt.mode}</td>
              <td className="px-5 py-4">
                <AttemptStatusBadge status={attempt.status} />
              </td>
              <td className="px-5 py-4 text-slate-500">
                {formatDate(attempt.startedAt)}
              </td>
              <td className="px-5 py-4 text-slate-500">
                {formatDate(attempt.submittedAt)}
              </td>
              <td className="px-5 py-4 text-right">
                <Link href={`/learner/attempts/${attempt.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-2xl border-cyan-200 bg-white/80 text-sky-700 hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    Xem
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
