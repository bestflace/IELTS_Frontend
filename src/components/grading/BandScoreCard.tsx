"use client";

import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/common/Card";

type Props = {
  label?: string;
  value?: number | string | null;
  description?: string;
};

function formatBand(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "—";

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : String(value);
}

export function BandScoreCard({
  label = "Overall Band",
  value,
  description = "Điểm tổng hợp từ phần chấm của giáo viên.",
}: Props) {
  return (
    <Card className="overflow-hidden rounded-[34px] border border-white/70 bg-white/85 shadow-[0_28px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[220px_1fr]">
          <div className="relative flex min-h-[220px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 p-6 text-white">
            <div
              aria-hidden="true"
              className="absolute -left-14 -top-14 h-44 w-44 rounded-full bg-white/20 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-blue-300/30 blur-3xl"
            />

            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-white/25 bg-white/10 shadow-inner">
              <p className="font-serif text-4xl font-black">
                {formatBand(value)}
              </p>
            </div>
            <p className="relative mt-4 text-xs font-black uppercase tracking-[.22em] text-white/80">
              Band
            </p>
          </div>

          <div className="relative overflow-hidden p-8">
            <div
              aria-hidden="true"
              className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl"
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
              <Star className="h-5 w-5" />
            </div>

            <p className="relative mt-5 text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              {label}
            </p>
            <h2 className="relative mt-2 font-serif text-3xl font-black text-slate-950">
              Điểm giáo viên chấm
            </h2>
            <p className="relative mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
