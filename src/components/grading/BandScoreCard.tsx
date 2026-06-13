"use client";

import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/common/Card";

type Props = {
  label?: string;
  value?: number | string | null;
  description?: string;
};

export function BandScoreCard({
  label = "Overall Band",
  value,
  description = "Điểm tổng hợp từ phần chấm của giáo viên.",
}: Props) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "—"
      : Number(value).toFixed(1);

  return (
    <Card className="overflow-hidden rounded-[28px] border border-line bg-surface">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[220px_1fr]">
          <div className="flex min-h-[220px] flex-col items-center justify-center bg-moss p-6 text-white">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-white/25">
              <p className="font-serif text-4xl font-bold">{displayValue}</p>
            </div>
            <p className="mt-4 text-xs font-bold uppercase tracking-[.22em] text-white/80">
              Band
            </p>
          </div>

          <div className="paper-texture p-6 md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primarySoft">
              <Star className="h-6 w-6 text-moss" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[.22em] text-sage">
              {label}
            </p>

            <h2 className="mt-2 font-serif text-3xl font-bold text-ink">
              Điểm giáo viên chấm
            </h2>

            <p className="mt-3 text-sm leading-7 text-neutralText">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
