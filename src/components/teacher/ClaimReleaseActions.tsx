"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  LockKeyhole,
  UnlockKeyhole,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { claimSubmission, releaseSubmission } from "@/lib/api/teacher.api";

type Props = {
  submissionId?: string;
  id?: string;
  status?: string | null;
  onChanged?: () => void;
};

function getSafeSubmissionId(props: Props) {
  return props.submissionId || props.id || "";
}

function isValidId(value: string) {
  return Boolean(value && value !== "undefined" && value !== "null");
}

function getStatusLabel(status?: string | null) {
  if (status === "PENDING") return "Chờ chấm";
  if (status === "CLAIMED") return "Đang giữ";
  if (status === "REVIEWED") return "Đã chấm";
  return "Không rõ trạng thái";
}

export function ClaimReleaseActions(props: Props) {
  const submissionId = getSafeSubmissionId(props);
  const status = props.status;
  const onChanged = props.onChanged;

  const [loading, setLoading] = useState<"claim" | "release" | null>(null);

  const invalidId = !isValidId(submissionId);
  const reviewed = status === "REVIEWED";
  const claimed = status === "CLAIMED";
  const pending = status === "PENDING";

  async function handleClaim() {
    if (invalidId) {
      toast.error("Không tìm thấy mã bài làm. Vui lòng tải lại trang.");
      return;
    }

    setLoading("claim");

    try {
      await claimSubmission(submissionId);
      toast.success("Đã nhận giữ bài làm.");
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể giữ bài.");
    } finally {
      setLoading(null);
    }
  }

  async function handleRelease() {
    if (invalidId) {
      toast.error("Không tìm thấy mã bài làm. Vui lòng tải lại trang.");
      return;
    }

    setLoading("release");

    try {
      await releaseSubmission(submissionId);
      toast.success("Đã trả bài về danh sách chờ chấm.");
      onChanged?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể trả bài.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <CardContent className="p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl"
        />

        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
            Trạng thái bài làm
          </p>

          <div className="mt-3 rounded-[26px] border border-cyan-100 bg-cyan-50/70 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-100 bg-white/80 text-cyan-700 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm text-slate-500">Hiện tại</p>
                <p className="font-black text-slate-950">
                  {getStatusLabel(status)}
                </p>
              </div>
            </div>
          </div>

          {invalidId ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">
              Không tìm thấy mã bài làm. Kiểm tra lại route hoặc dữ liệu truyền
              vào component.
            </div>
          ) : null}

          <div className="mt-5 grid gap-3">
            <Button
              type="button"
              onClick={handleClaim}
              disabled={invalidId || reviewed || claimed || loading !== null}
              className="w-full"
            >
              {loading === "claim" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LockKeyhole className="h-4 w-4" />
              )}
              {loading === "claim" ? "Đang giữ bài..." : "Giữ bài để chấm"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleRelease}
              disabled={invalidId || reviewed || pending || loading !== null}
              className="w-full"
            >
              {loading === "release" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UnlockKeyhole className="h-4 w-4" />
              )}
              {loading === "release"
                ? "Đang trả bài..."
                : "Trả bài về danh sách"}
            </Button>
          </div>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Giáo viên nên giữ bài trước khi chấm để tránh nhiều người cùng chấm
            một bài.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
