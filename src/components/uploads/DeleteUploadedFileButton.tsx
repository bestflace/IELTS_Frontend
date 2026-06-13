"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/common/Button";
import { getErrorMessage } from "@/lib/api/client";
import { deleteUploadedFile } from "@/lib/api/uploads.api";

export function DeleteUploadedFileButton({
  fileKey,
  fileUrl,
  onDeleted,
}: {
  fileKey?: string;
  fileUrl?: string;
  onDeleted?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!fileKey && !fileUrl) return;

    const confirmed = window.confirm(
      "Bạn chắc chắn muốn xóa file này khỏi thư viện media?",
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      await deleteUploadedFile({ fileKey, fileUrl });
      onDeleted?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={handleDelete}
        disabled={loading || (!fileKey && !fileUrl)}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Xóa
      </Button>
      {error ? (
        <span className="max-w-[180px] text-xs font-semibold text-rose-700">
          {error}
        </span>
      ) : null}
    </div>
  );
}
