"use client";

import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

import { AutosaveIndicator, type AutosaveState } from "./AutosaveIndicator";
import { AttemptTimer } from "./AttemptTimer";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";

type Props = {
  title: string;
  subtitle?: string;
  backHref: string;
  remainingSeconds?: number | null;
  totalSeconds?: number | null;
  autosaveState?: AutosaveState;
  readonly?: boolean;
  readonlyLabel?: string;
  onSubmit?: () => void;
};

export function AttemptHeader({
  title,
  subtitle,
  backHref,
  remainingSeconds,
  totalSeconds,
  autosaveState = "idle",
  readonly = false,
  readonlyLabel = "Chỉ xem",
  onSubmit,
}: Props) {
  return (
    <header className="relative z-10 flex min-h-[82px] shrink-0 items-center justify-between border-b border-cyan-100 bg-white/90 px-5 shadow-[0_12px_35px_rgba(14,165,233,0.10)] backdrop-blur-2xl md:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
      />

      <div className="flex min-w-0 items-center gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-100 bg-white/80 px-3 py-2 text-sm font-bold text-sky-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Thoát
        </Link>

        <div className="min-w-0">
          <p className="truncate font-serif text-2xl font-black leading-tight text-slate-950">
            {title}
          </p>

          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            {subtitle ? <span className="truncate">{subtitle}</span> : null}
            {subtitle ? <span>·</span> : null}
            <AutosaveIndicator state={autosaveState} />
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <AttemptTimer
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
        />

        {readonly ? (
          <Badge tone="warning">{readonlyLabel}</Badge>
        ) : (
          <Button
            onClick={onSubmit}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_14px_32px_rgba(14,165,233,0.28)] hover:shadow-[0_18px_40px_rgba(37,99,235,0.34)]"
          >
            <Send className="h-4 w-4" />
            Nộp bài
          </Button>
        )}
      </div>
    </header>
  );
}
