import { BookOpenCheck } from "lucide-react";

import { Card, CardContent } from "@/components/common/Card";

type SkillItem = {
  key: string;
  label: string;
  average: number;
  displayAverage?: number | null;
  count: number;
  gradedCount: number;
  gradient?: string;
  text?: string;
};

function formatBand(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(1).replace(".0", "");
}

export function SkillBreakdownChart({
  data = [],
  children,
}: {
  data?: SkillItem[];
  children?: React.ReactNode;
}) {
  if (!data.length) {
    return (
      <Card className="rounded-[32px] border border-white/70 bg-white/82 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-xl">
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/82 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-xl">
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
              Skill balance
            </p>
            <h2 className="mt-2 font-serif text-2xl font-black text-slate-950">
              Phân bổ kỹ năng
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              So sánh band trung bình giữa 4 kỹ năng để biết phần cần ưu tiên.
            </p>
          </div>

          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
            <BookOpenCheck className="h-5 w-5" />
          </span>
        </div>

        <div className="mt-6 space-y-5">
          {data.map((item) => {
            const maxCount = Math.max(...data.map((entry) => entry.count), 1);
            const percent =
              item.displayAverage !== null && item.displayAverage !== undefined
                ? Math.max(0, Math.min(100, (item.average / 9) * 100))
                : Math.max(0, Math.min(100, (item.count / maxCount) * 100));

            return (
              <div
                key={item.key}
                className={
                  item.count > 0
                    ? "rounded-3xl border border-cyan-100/70 bg-white/70 p-4"
                    : "rounded-3xl border border-slate-100 bg-slate-50/80 p-4"
                }
              >
                <div className="mb-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-black text-slate-900">{item.label}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">
                      {item.count > 0
                        ? `${item.gradedCount} bài có điểm / ${item.count} bài luyện`
                        : "Chưa có lượt luyện kỹ năng này"}
                    </p>
                  </div>

                  <p
                    className={`font-serif text-3xl font-black ${item.text || "text-sky-700"}`}
                  >
                    {item.displayAverage !== null &&
                    item.displayAverage !== undefined
                      ? formatBand(item.displayAverage)
                      : item.count > 0
                        ? `${item.count} bài`
                        : "—"}
                  </p>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-sky-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      item.gradient || "from-cyan-500 to-blue-600"
                    } shadow-[0_8px_18px_rgba(14,165,233,0.28)] transition-all duration-700`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
