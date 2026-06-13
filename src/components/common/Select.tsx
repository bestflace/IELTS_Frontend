"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Select({
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
        "rounded-2xl border border-cyan-100 bg-white/90 p-3 text-sm text-slate-700 shadow-sm backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
