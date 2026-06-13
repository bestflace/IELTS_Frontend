"use client";

import { Loader2, Send } from "lucide-react";

import { Button } from "@/components/common/Button";

type Props = {
  open: boolean;
  submitting?: boolean;
  answeredTotal?: number;
  totalQuestions?: number;
  remainingLabel?: string;
  saveStateLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
};

export function SubmitAttemptDialog({
  open,
  submitting = false,
  answeredTotal = 0,
  totalQuestions = 0,
  remainingLabel = "--:--",
  saveStateLabel = "Đã lưu",
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-[0_30px_100px_rgba(15,23,42,0.22)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.25)]">
            <Send className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-serif text-3xl font-black text-slate-950">
              Nộp bài?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sau khi nộp bài, bạn sẽ không thể chỉnh sửa câu trả lời. Hệ thống
              sẽ chuyển bài sang trạng thái chấm điểm.
            </p>
          </div>
        </div>

        <div className="relative mt-5 rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/80 p-4 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Tổng câu đã trả lời</span>
            <span className="font-black text-slate-950">
              {answeredTotal}/{totalQuestions}
            </span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500">Thời gian còn lại</span>
            <span className="font-black text-slate-950">{remainingLabel}</span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500">Trạng thái lưu</span>
            <span className="font-black text-slate-950">{saveStateLabel}</span>
          </div>
        </div>

        <div className="relative mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="rounded-2xl border-cyan-200 bg-white/80 text-sky-700 hover:border-cyan-300 hover:bg-cyan-50"
          >
            Quay lại làm bài
          </Button>

          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang nộp...
              </>
            ) : (
              <>
                Nộp bài
                <Send className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
