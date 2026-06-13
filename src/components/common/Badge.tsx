import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger" | "brown" | "sage";

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  const tones = {
    default: "border-slate-200 bg-slate-50 text-slate-600",
    success: "border-emerald-100 bg-emerald-50 text-emerald-700",
    warning: "border-amber-100 bg-amber-50 text-amber-700",
    danger: "border-rose-100 bg-rose-50 text-rose-700",
    brown: "border-orange-100 bg-orange-50 text-orange-700",
    sage: "border-cyan-100 bg-cyan-50 text-cyan-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-black",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
