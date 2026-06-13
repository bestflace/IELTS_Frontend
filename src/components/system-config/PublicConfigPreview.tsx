"use client";

import { Clock3, Eye, Flag } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/common/Card";
import type { SystemConfig } from "@/lib/api/system-config.api";
import { formatMinutes } from "@/components/system-config/TimingConfigSection";

type Props = {
  config: SystemConfig;
};

export function PublicConfigPreview({ config }: Props) {
  const enabledCount = Object.values(config.featureFlags || {}).filter(
    Boolean,
  ).length;
  const totalCount = Object.values(config.featureFlags || {}).length;

  return (
    <Card className="rounded-[26px] border border-line bg-surface">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-paper">
            <Eye className="h-5 w-5 text-moss" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-sage">
              Public preview
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ink">
              Tóm tắt cấu hình hiện tại
            </h2>
            <p className="mt-1 text-sm leading-6 text-neutralText">
              Xem nhanh các tham số chính đang áp dụng cho hệ thống.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-line bg-paper p-5">
            <Clock3 className="h-5 w-5 text-moss" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-neutralText">
              Full Test
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-ink">
              {formatMinutes(config.fullTestDefaultSec)}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5">
            <Clock3 className="h-5 w-5 text-moss" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-neutralText">
              Writing
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-ink">
              {formatMinutes(config.writingDefaultSec)}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5">
            <Clock3 className="h-5 w-5 text-moss" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-neutralText">
              Speaking
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-ink">
              {formatMinutes(config.speakingDefaultSec)}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-5">
            <Flag className="h-5 w-5 text-moss" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-neutralText">
              Tính năng bật
            </p>
            <p className="mt-2 font-serif text-2xl font-bold text-ink">
              {enabledCount}/{totalCount}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
