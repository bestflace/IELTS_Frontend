"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
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
        "rounded-[30px] border border-white/70 bg-white/80 p-5 text-sm shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
