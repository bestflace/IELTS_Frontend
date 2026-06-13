import { Clock3 } from "lucide-react";

type Props = {
  remainingSeconds?: number | null;
  totalSeconds?: number | null;
  compact?: boolean;
};

function formatSeconds(value?: number | null) {
  if (value === null || value === undefined || value < 0) return "00:00";

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const seconds = value % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function getTone(remaining?: number | null, total?: number | null) {
  if (remaining === null || remaining === undefined) return "normal";
  if (remaining <= 120) return "danger";
  if (remaining <= 600) return "warning";
  if (total && remaining / total <= 0.15) return "warning";
  return "normal";
}

export function AttemptTimer({
  remainingSeconds,
  totalSeconds,
  compact = false,
}: Props) {
  const tone = getTone(remainingSeconds, totalSeconds);

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-2xl border font-mono font-black tabular-nums shadow-sm backdrop-blur-xl",
        compact ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-xl",
        tone === "normal" ? "border-cyan-100 bg-white/80 text-slate-950" : "",
        tone === "warning" ? "border-amber-200 bg-amber-50 text-amber-700" : "",
        tone === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : "",
      ].join(" ")}
    >
      <Clock3 className="h-5 w-5" />
      {formatSeconds(remainingSeconds)}
    </span>
  );
}
