"use client";

import type { ComponentType } from "react";
import { CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/common/Card";

export type RubricViewItem = {
  key: string;
  title: string;
  description?: string;
  score?: number | string | null;
  icon?: ComponentType<{ className?: string }>;
};

function toScore(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return null;

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export function RubricScoreView({
  title = "Điểm theo tiêu chí",
  description = "Chi tiết điểm từng tiêu chí do giáo viên chấm.",
  items,
}: {
  title?: string;
  description?: string;
  items: RubricViewItem[];
}) {
  return (
    <Card className="rounded-[34px] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <CardHeader>
        <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
          Rubric
        </p>
        <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon || CheckCircle2;
          const score = toScore(item.score);
          const width =
            score === null ? 0 : Math.max(0, Math.min(100, (score / 9) * 100));

          return (
            <div
              key={item.key}
              className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-black text-slate-950">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="w-full rounded-2xl border border-cyan-100 bg-cyan-50/40 px-5 py-3 text-center md:w-24">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">
                    Điểm
                  </p>
                  <p className="mt-1 font-serif text-3xl font-black text-slate-950">
                    {score === null ? "—" : score.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
