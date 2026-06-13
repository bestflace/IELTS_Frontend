"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/common/Button";
import { retryImportJob, type ImportJob } from "@/lib/api/imports.api";
import { getErrorMessage } from "@/lib/api/client";

type Props = {
  job: ImportJob;
  size?: "sm" | "md";
  onRetried?: (job: ImportJob) => void;
  onError?: (message: string) => void;
};

export function RetryImportDialog({
  job,
  size = "sm",
  onRetried,
  onError,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn chạy lại import job ${job.id}?`,
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const retried = await retryImportJob(job.id);
      onRetried?.(retried);
    } catch (err) {
      onError?.(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size={size} disabled={loading} onClick={handleRetry}>
      <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Đang retry" : "Retry"}
    </Button>
  );
}
