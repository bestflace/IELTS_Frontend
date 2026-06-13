"use client";

import { useState } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/common/Button";
import { unhideComment } from "@/lib/api/comments.api";
import { getErrorMessage } from "@/lib/api/client";

type Props = {
  commentId: string;
  onDone?: () => void;
  onError?: (message: string) => void;
};

export function UnhideCommentButton({ commentId, onDone, onError }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      await unhideComment(commentId);
      onDone?.();
    } catch (err) {
      onError?.(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
    >
      <Eye className="h-4 w-4" />
      {loading ? "Đang hiện..." : "Hiện"}
    </Button>
  );
}
