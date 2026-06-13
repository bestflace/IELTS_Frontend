"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/common/Button";
import { HideCommentButton } from "@/components/comments/HideCommentButton";
import { UnhideCommentButton } from "@/components/comments/UnhideCommentButton";

type Props = {
  commentId: string;
  hidden?: boolean;
  canModerate?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
  onChanged?: () => void;
  onError?: (message: string) => void;
};

export function CommentActions({
  commentId,
  hidden = false,
  canModerate = false,
  canDelete = false,
  onDelete,
  onChanged,
  onError,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {canModerate ? (
        hidden ? (
          <UnhideCommentButton
            commentId={commentId}
            onDone={onChanged}
            onError={onError}
          />
        ) : (
          <HideCommentButton
            commentId={commentId}
            onDone={onChanged}
            onError={onError}
          />
        )
      ) : null}

      {canDelete ? (
        <Button type="button" size="sm" variant="danger" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Xóa
        </Button>
      ) : null}
    </div>
  );
}
