import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FilterBar({
  children,
  className,
  ...props
}: {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <div
      className={cn(
        "rounded-[26px] border border-cyan-100 bg-white/80 p-4 text-sm text-slate-600 shadow-[0_16px_45px_rgba(14,165,233,0.08)] backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
