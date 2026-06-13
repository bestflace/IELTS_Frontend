"use client";

import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition duration-300 disabled:pointer-events-none disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-cyan-200/70";

  const variants = {
    primary:
      "border border-transparent bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(37,99,235,0.34)]",
    secondary:
      "border border-cyan-100 bg-cyan-50/80 text-sky-700 shadow-[0_10px_25px_rgba(14,165,233,0.08)] hover:-translate-y-0.5 hover:bg-cyan-100",
    outline:
      "border border-cyan-200/70 bg-white/75 text-sky-700 shadow-[0_10px_25px_rgba(14,165,233,0.08)] backdrop-blur hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50/80",
    ghost:
      "border border-transparent bg-transparent text-slate-600 hover:bg-cyan-50 hover:text-sky-700",
    danger:
      "border border-transparent bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_16px_35px_rgba(244,63,94,0.22)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(220,38,38,0.28)]",
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
