import { AlertTriangle, CheckCircle2, Loader2, Save } from "lucide-react";

export type AutosaveState = "idle" | "saving" | "saved" | "error";

type Props = {
  state?: AutosaveState;
};

export function AutosaveIndicator({ state = "idle" }: Props) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Đang lưu...
      </span>
    );
  }

  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Đã lưu
      </span>
    );
  }

  if (state === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
        <AlertTriangle className="h-3.5 w-3.5" />
        Lỗi lưu
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
      <Save className="h-3.5 w-3.5" />
      Sẵn sàng
    </span>
  );
}
