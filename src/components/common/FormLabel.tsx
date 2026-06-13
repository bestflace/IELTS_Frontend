import { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FormLabel({
  children,
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children?: ReactNode }) {
  return (
    <label
      className={cn("text-sm font-black text-slate-900", className)}
      {...props}
    >
      {children}
    </label>
  );
}
