import { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/common/Button";

export function EmptyState({
  title = "Không có dữ liệu",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[30px] border border-dashed border-cyan-200 bg-cyan-50/60 px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-100 bg-white/80 text-cyan-700 shadow-sm">
        <Inbox className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-serif text-xl font-black text-slate-950">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function LoadingState({
  label = "Đang tải dữ liệu...",
}: {
  label?: string;
}) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[30px] border border-cyan-100 bg-white/75 px-6 py-10 text-center shadow-sm backdrop-blur-xl">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <p className="text-sm font-bold">{label}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  message = "Đã xảy ra lỗi",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[30px] border border-rose-100 bg-rose-50/70 px-6 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-rose-100 bg-white/80 text-rose-600">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-serif text-xl font-black text-slate-950">
        Không thể tải dữ liệu
      </h3>
      <p className="mt-2 max-w-xl text-sm leading-6 text-rose-600">{message}</p>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          className="mt-5"
          onClick={onRetry}
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </Button>
      ) : null}
    </div>
  );
}
