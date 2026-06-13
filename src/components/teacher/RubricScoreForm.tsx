"use client";

import type { ComponentType } from "react";
import { Minus, Plus, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";

export type RubricCriterion = {
  key: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
};

type Props<T extends Record<string, number>> = {
  title: string;
  description: string;
  criteria: RubricCriterion[];
  values: T;
  onChange: (key: keyof T, value: number) => void;
};

function clampBand(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(9, Math.max(0, value));
}

function normalizeBand(value: number) {
  return Math.round(clampBand(value) * 2) / 2;
}

export function calculateOverallBand(values: Record<string, number>) {
  const scores = Object.values(values).filter((value) =>
    Number.isFinite(value),
  );

  if (!scores.length) return 0;

  const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
  return normalizeBand(average);
}

export function RubricScoreForm<T extends Record<string, number>>({
  title,
  description,
  criteria,
  values,
  onChange,
}: Props<T>) {
  const overallBand = calculateOverallBand(values);

  const updateValue = (key: keyof T, nextValue: number) => {
    onChange(key, normalizeBand(nextValue));
  };

  return (
    <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" />
              Band criteria
            </p>

            <h2 className="mt-4 font-serif text-3xl font-black text-slate-950">
              {title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          <div className="rounded-[26px] border border-cyan-100 bg-white/80 px-6 py-5 text-center shadow-sm backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[.18em] text-slate-400">
              Điểm tổng hợp
            </p>

            <p className="mt-1 font-serif text-5xl font-black text-slate-950">
              {overallBand ? overallBand.toFixed(1) : "—"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 p-5">
        {criteria.map((criterion) => {
          const Icon = criterion.icon;
          const value = values[criterion.key as keyof T] ?? 0;
          const percent = Math.max(0, Math.min(100, (value / 9) * 100));

          return (
            <div
              key={criterion.key}
              className="rounded-[30px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_18px_50px_rgba(14,165,233,0.12)]"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-start gap-3">
                  {Icon ? (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                  ) : null}

                  <div>
                    <h3 className="font-black text-slate-950">
                      {criterion.title}
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {criterion.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateValue(criterion.key as keyof T, value - 0.5)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-100 bg-white/85 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <Input
                    type="number"
                    min={0}
                    max={9}
                    step={0.5}
                    value={value}
                    onChange={(event) =>
                      updateValue(
                        criterion.key as keyof T,
                        Number(event.target.value),
                      )
                    }
                    className="h-10 w-20 text-center font-black"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      updateValue(criterion.key as keyof T, value + 0.5)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-100 bg-white/85 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_70px] md:items-center">
                <div className="relative h-3 overflow-hidden rounded-full bg-cyan-100">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_8px_20px_rgba(14,165,233,0.30)]"
                    style={{ width: `${percent}%` }}
                  />

                  <input
                    type="range"
                    min={0}
                    max={9}
                    step={0.5}
                    value={value}
                    onChange={(event) =>
                      updateValue(
                        criterion.key as keyof T,
                        Number(event.target.value),
                      )
                    }
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>

                <div className="rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-center text-sm font-black text-cyan-700">
                  {value ? value.toFixed(1) : "—"}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
