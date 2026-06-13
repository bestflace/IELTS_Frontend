"use client";

import { useState } from "react";
import { EyeOff } from "lucide-react";

import { Button } from "@/components/common/Button";
import { hideComment } from "@/lib/api/comments.api";
import { getErrorMessage } from "@/lib/api/client";

type Props = {
  commentId: string;
  onDone?: () => void;
  onError?: (message: string) => void;
};

export function HideCommentButton({ commentId, onDone, onError }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      await hideComment(commentId);
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
      <EyeOff className="h-4 w-4" />
      Ẩn
    </Button>
  );
}
