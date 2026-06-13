"use client";

import { Clock3, Settings2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import type { SystemConfig } from "@/lib/api/system-config.api";

export type TimingField = keyof Omit<SystemConfig, "featureFlags">;

export type SkillTimingConfig = {
  key: string;
  title: string;
  description: string;
  defaultField: TimingField;
  minField: TimingField;
  maxField: TimingField;
};

export const skillTimingConfigs: SkillTimingConfig[] = [
  {
    key: "reading",
    title: "Reading",
    description: "Thời gian mặc định và giới hạn tùy chỉnh cho bài Reading.",
    defaultField: "readingDefaultSec",
    minField: "readingCustomMinSec",
    maxField: "readingCustomMaxSec",
  },
  {
    key: "listening",
    title: "Listening",
    description: "Thời gian mặc định và giới hạn tùy chỉnh cho bài Listening.",
    defaultField: "listeningDefaultSec",
    minField: "listeningCustomMinSec",
    maxField: "listeningCustomMaxSec",
  },
  {
    key: "writing",
    title: "Writing",
    description: "Thời gian mặc định và giới hạn tùy chỉnh cho bài Writing.",
    defaultField: "writingDefaultSec",
    minField: "writingCustomMinSec",
    maxField: "writingCustomMaxSec",
  },
  {
    key: "speaking",
    title: "Speaking",
    description: "Thời gian mặc định và giới hạn tùy chỉnh cho bài Speaking.",
    defaultField: "speakingDefaultSec",
    minField: "speakingCustomMinSec",
    maxField: "speakingCustomMaxSec",
  },
  {
    key: "fullTest",
    title: "Full Test",
    description: "Thời gian mặc định và giới hạn tùy chỉnh cho đề thi đầy đủ.",
    defaultField: "fullTestDefaultSec",
    minField: "fullTestCustomMinSec",
    maxField: "fullTestCustomMaxSec",
  },
];

export function secondsToMinutes(value?: number | null) {
  if (!value) return 0;
  return Math.round(value / 60);
}

export function minutesToSeconds(value: number) {
  return Math.max(1, Math.round(value * 60));
}

export function formatMinutes(value?: number | null) {
  return `${secondsToMinutes(value)} phút`;
}

function ConfigNumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-[.16em] text-neutralText">
        {label}
      </span>

      <div className="relative">
        <Input
          type="number"
          min={1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="pr-16"
        />
        <span className="pointer-events-none absolute right-3 top-3 text-xs font-semibold text-neutralText">
          phút
        </span>
      </div>
    </label>
  );
}

type Props = {
  draft: SystemConfig;
  onChange: (field: TimingField, minutes: number) => void;
};

export function TimingConfigSection({ draft, onChange }: Props) {
  return (
    <Card className="rounded-[26px] border border-line bg-surface">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-paper">
            <Settings2 className="h-5 w-5 text-moss" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-sage">
              Timing rules
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ink">
              Thời gian làm bài
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutralText">
              Backend lưu thời gian bằng giây, giao diện hiển thị bằng phút để
              admin dễ chỉnh. Mỗi kỹ năng cần thỏa điều kiện: tối thiểu ≤ mặc
              định ≤ tối đa.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {skillTimingConfigs.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-line bg-paper p-5"
          >
            <div className="mb-4 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-neutralText">
                  {item.description}
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-primarySoft px-3 py-1 text-xs font-bold text-moss">
                <Clock3 className="h-3.5 w-3.5" />
                {formatMinutes(draft[item.defaultField])}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <ConfigNumberInput
                label="Tối thiểu"
                value={secondsToMinutes(draft[item.minField])}
                onChange={(value) => onChange(item.minField, value)}
              />

              <ConfigNumberInput
                label="Mặc định"
                value={secondsToMinutes(draft[item.defaultField])}
                onChange={(value) => onChange(item.defaultField, value)}
              />

              <ConfigNumberInput
                label="Tối đa"
                value={secondsToMinutes(draft[item.maxField])}
                onChange={(value) => onChange(item.maxField, value)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
