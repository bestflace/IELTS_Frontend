"use client";

import { Flag, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/common/Card";
import type { FeatureFlags } from "@/lib/api/system-config.api";

export const defaultFeatureFlags: FeatureFlags = {
  enableBlog: true,
  enableTeacherReview: true,
  enableWritingAI: true,
  enableSpeakingASR: true,
  enableSpeakingAI: true,
  enableImports: true,
  enableNotifications: true,
};

export const featureFlagItems: Array<{
  key: keyof FeatureFlags;
  title: string;
  description: string;
}> = [
  {
    key: "enableBlog",
    title: "Blog",
    description: "Cho phép hiển thị và sử dụng module blog/tin tức.",
  },
  {
    key: "enableTeacherReview",
    title: "Teacher Review",
    description: "Cho phép giáo viên nhận và chấm bài Writing/Speaking.",
  },
  {
    key: "enableWritingAI",
    title: "Writing AI",
    description: "Bật chức năng chấm hoặc hỗ trợ Writing bằng AI.",
  },
  {
    key: "enableSpeakingASR",
    title: "Speaking ASR",
    description: "Bật chức năng nhận diện giọng nói cho bài Speaking.",
  },
  {
    key: "enableSpeakingAI",
    title: "Speaking AI",
    description: "Bật chức năng đánh giá Speaking bằng AI.",
  },
  {
    key: "enableImports",
    title: "Import CSV",
    description: "Cho phép admin import dữ liệu từ file CSV.",
  },
  {
    key: "enableNotifications",
    title: "Notifications",
    description: "Bật hệ thống thông báo cho người dùng.",
  },
];

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={
        checked
          ? "relative h-7 w-12 rounded-full bg-primary transition"
          : "relative h-7 w-12 rounded-full bg-line transition"
      }
    >
      <span
        className={
          checked
            ? "absolute right-1 top-1 h-5 w-5 rounded-full bg-white transition"
            : "absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition"
        }
      />
    </button>
  );
}

type Props = {
  flags: FeatureFlags;
  onChange: (key: keyof FeatureFlags, value: boolean) => void;
};

export function FeatureFlagSection({ flags, onChange }: Props) {
  return (
    <Card className="rounded-[26px] border border-line bg-surface">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-paper">
            <Flag className="h-5 w-5 text-moss" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-sage">
              Feature flags
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ink">
              Bật/tắt tính năng
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutralText">
              Dùng để kiểm soát các module chính mà không cần thay đổi code hoặc
              database.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {featureFlagItems.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-paper p-5"
            >
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-moss" />
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                </div>

                <p className="mt-2 text-sm leading-6 text-neutralText">
                  {item.description}
                </p>
              </div>

              <ToggleSwitch
                checked={Boolean(flags[item.key])}
                onChange={(value) => onChange(item.key, value)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
