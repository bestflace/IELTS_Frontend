"use client";

import { CommentForm } from "@/components/comments/CommentForm";

type Props = {
  loading?: boolean;
  onSubmit: (content: string) => Promise<void> | void;
};

export function ReplyForm({ loading = false, onSubmit }: Props) {
  return (
    <CommentForm
      loading={loading}
      submitLabel="Gửi trả lời"
      placeholder="Viết phản hồi cho bình luận này..."
      onSubmit={onSubmit}
    />
  );
}
