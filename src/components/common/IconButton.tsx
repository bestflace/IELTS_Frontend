"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function IconButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-100 bg-white/80 text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 focus:outline-none focus:ring-4 focus:ring-cyan-100/80 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
