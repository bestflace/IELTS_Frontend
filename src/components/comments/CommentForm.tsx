"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Textarea } from "@/components/common/Textarea";

type Props = {
  placeholder?: string;
  submitLabel?: string;
  initialValue?: string;
  loading?: boolean;
  onSubmit: (content: string) => Promise<void> | void;
};

export function CommentForm({
  placeholder = "Viết câu hỏi hoặc phản hồi của bạn...",
  submitLabel = "Gửi bình luận",
  initialValue = "",
  loading = false,
  onSubmit,
}: Props) {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    await onSubmit(trimmed);
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="min-h-28"
        placeholder={placeholder}
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !content.trim()}>
          <Send className="h-4 w-4" />
          {loading ? "Đang gửi..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
