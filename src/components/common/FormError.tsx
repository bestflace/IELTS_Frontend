import { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function FormError({
  children,
  className,
  ...props
}: {
  children?: ReactNode;
  className?: string;
  [key: string]: unknown;
}) {
  if (!children) return null;

  return (
    <div
      className={cn(
        "inline-flex items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700",
        className,
      )}
      {...props}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
