"use client";

import { ReactNode } from "react";
import { RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { Input } from "@/components/common/Input";

type Props = {
  keyword?: string;
  skill?: string;
  status?: string;
  loading?: boolean;
  children?: ReactNode;
  onKeywordChange?: (value: string) => void;
  onSkillChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onRefresh?: () => void;
};

const selectClassName =
  "h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80";

export function SubmissionFilterBar({
  keyword = "",
  skill = "",
  status = "",
  loading = false,
  children,
  onKeywordChange,
  onSkillChange,
  onStatusChange,
  onRefresh,
}: Props) {
  return (
    <Card className="overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <CardContent className="p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-cyan-600" />

            <Input
              value={keyword}
              onChange={(event) => onKeywordChange?.(event.target.value)}
              className="pl-9"
              placeholder="Tìm theo học viên hoặc tên bài..."
            />
          </div>

          <select
            value={skill}
            onChange={(event) => onSkillChange?.(event.target.value)}
            className={selectClassName}
          >
            <option value="">Tất cả kỹ năng</option>
            <option value="WRITING">Writing</option>
            <option value="SPEAKING">Speaking</option>
          </select>

          <select
            value={status}
            onChange={(event) => onStatusChange?.(event.target.value)}
            className={selectClassName}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ chấm</option>
            <option value="CLAIMED">Đang giữ</option>
            <option value="REVIEWED">Đã chấm</option>
          </select>

          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Làm mới
          </Button>
        </div>

        {children ? <div className="mt-4">{children}</div> : null}
      </CardContent>
    </Card>
  );
}
