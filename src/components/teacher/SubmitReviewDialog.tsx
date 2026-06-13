"use client";

import { AlertTriangle, Send } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";

type Props = {
  open: boolean;
  title: string;
  description: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SubmitReviewDialog({
  open,
  title,
  description,
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-lg rounded-[30px] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(14,165,233,0.18)] backdrop-blur-2xl">
        <CardContent className="p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <h2 className="mt-5 font-serif text-2xl font-black text-slate-950">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">{description}</p>

          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Xem lại
            </Button>

            <Button type="button" onClick={onConfirm} disabled={loading}>
              <Send className="h-4 w-4" />
              {loading ? "Đang gửi..." : "Gửi nhận xét"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
