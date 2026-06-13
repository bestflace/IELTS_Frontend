import { Loader2 } from "lucide-react";

export function UploadProgress({
  progress,
  label = "Đang upload file...",
}: {
  progress?: number | null;
  label?: string;
}) {
  const hasProgress = typeof progress === "number" && progress >= 0;
  const safeProgress = hasProgress
    ? Math.min(100, Math.max(0, progress || 0))
    : 0;

  return (
    <div className="rounded-2xl border border-cyan-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
        <span className="inline-flex min-w-0 items-center gap-2">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-cyan-700" />
          <span className="truncate">{label}</span>
        </span>
        {hasProgress ? (
          <span className="shrink-0 text-cyan-700">{safeProgress}%</span>
        ) : null}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-cyan-100">
        <div
          className={
            hasProgress
              ? "h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
              : "h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
          }
          style={hasProgress ? { width: `${safeProgress}%` } : undefined}
        />
      </div>
    </div>
  );
}
