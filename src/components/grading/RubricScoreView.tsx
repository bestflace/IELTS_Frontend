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

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
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
    <Card className="rounded-[28px] border border-line bg-surface">
      <CardHeader>
        <p className="text-xs font-bold uppercase tracking-[.22em] text-sage">
          Rubric
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-neutralText">{description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon || CheckCircle2;
          const score = toScore(item.score);
          const width = score ? Math.min(100, (score / 9) * 100) : 0;

          return (
            <div
              key={item.key}
              className="rounded-2xl border border-line bg-paper p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="flex flex-1 items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primarySoft">
                    <Icon className="h-5 w-5 text-moss" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    {item.description ? (
                      <p className="mt-1 text-sm leading-6 text-neutralText">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-surface px-5 py-3 text-center">
                  <p className="text-xs font-bold uppercase tracking-[.16em] text-neutralText">
                    Điểm
                  </p>
                  <p className="mt-1 font-serif text-2xl font-bold text-ink">
                    {score === null ? "—" : score.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream">
                <div
                  className="h-full rounded-full bg-moss"
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
