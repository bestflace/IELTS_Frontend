"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";

import { Button } from "@/components/common/Button";
import {
  CommentItem,
  type CommentModel,
} from "@/components/comments/CommentItem";

type Props = {
  attemptId: string;
  comments: CommentModel[];
  canModerate?: boolean;
  currentUserId?: string;
  pageSize?: number;
  onChanged?: () => void;
  onError?: (message: string) => void;
};

export function CommentList({
  attemptId,
  comments,
  canModerate = false,
  currentUserId,
  pageSize = 5,
  onChanged,
  onError,
}: Props) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [comments.length]);

  const totalPages = Math.max(1, Math.ceil(comments.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const visibleComments = useMemo(
    () => comments.slice((safePage - 1) * pageSize, safePage * pageSize),
    [comments, pageSize, safePage],
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  if (!comments.length) {
    return (
      <div className="rounded-[30px] border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-100 bg-white/80 text-cyan-700 shadow-sm">
          <MessageCircle className="h-7 w-7" />
        </div>

        <h3 className="mt-4 font-serif text-xl font-black text-slate-950">
          Chưa có trao đổi nào
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Học viên có thể đặt câu hỏi dưới bài làm, giáo viên có thể phản hồi
          tại đây.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleComments.map((comment) => (
        <CommentItem
          key={comment.id}
          attemptId={attemptId}
          comment={comment}
          canModerate={canModerate}
          currentUserId={currentUserId}
          onChanged={onChanged}
          onError={onError}
        />
      ))}

      {comments.length > pageSize ? (
        <div className="flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            Hiển thị{" "}
            <strong className="text-slate-950">
              {(safePage - 1) * pageSize + 1}
            </strong>
            –
            <strong className="text-slate-950">
              {Math.min(comments.length, safePage * pageSize)}
            </strong>{" "}
            trong <strong className="text-slate-950">{comments.length}</strong>{" "}
            bình luận
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Trước
            </Button>

            <span className="rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700">
              {safePage}/{totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages}
            >
              Sau
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
