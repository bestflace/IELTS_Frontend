"use client";

import { useState } from "react";
import { Eye, EyeOff, Reply } from "lucide-react";

import { Button } from "@/components/common/Button";
import { CommentActions } from "@/components/comments/CommentActions";
import { ReplyForm } from "@/components/comments/ReplyForm";
import { createAttemptComment, deleteComment } from "@/lib/api/comments.api";
import { getErrorMessage } from "@/lib/api/client";

type CommentUser = {
  id?: string;
  fullName?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
};

export type CommentModel = {
  id: string;
  content?: string | null;
  body?: string | null;
  status?: string;
  isHidden?: boolean;
  is_hidden?: boolean;
  hiddenMessage?: string | null;
  hidden_message?: string | null;
  createdAt?: string;
  created_at?: string;
  user?: CommentUser | null;
  author?: CommentUser | null;
  replies?: CommentModel[];
  children?: CommentModel[];
};

type Props = {
  attemptId: string;
  comment: CommentModel;
  level?: number;
  canModerate?: boolean;
  currentUserId?: string;
  onChanged?: () => void;
  onError?: (message: string) => void;
};

function getAuthor(comment: CommentModel) {
  return comment.user || comment.author || null;
}

function getAuthorName(comment: CommentModel) {
  const user = getAuthor(comment);

  return user?.fullName || user?.full_name || user?.email || "Người dùng";
}

function getContent(comment: CommentModel) {
  return comment.content || comment.body || "";
}

function isHidden(comment: CommentModel) {
  return Boolean(
    comment.isHidden || comment.is_hidden || comment.status === "HIDDEN",
  );
}

function getHiddenMessage(comment: CommentModel) {
  return (
    comment.hiddenMessage ||
    comment.hidden_message ||
    "Quản trị viên đã ẩn bình luận này."
  );
}

function formatDate(value?: string) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function CommentItem({
  attemptId,
  comment,
  level = 0,
  canModerate = false,
  currentUserId,
  onChanged,
  onError,
}: Props) {
  const [replying, setReplying] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  const author = getAuthor(comment);
  const canDelete = Boolean(currentUserId && author?.id === currentUserId);
  const hidden = isHidden(comment);
  const replies = comment.replies || comment.children || [];

  const shouldShowHiddenPlaceholder = hidden && !canModerate;
  const shouldShowHiddenContentForAdmin = hidden && canModerate;

  const handleReply = async (content: string) => {
    setReplyLoading(true);

    try {
      await createAttemptComment(attemptId, {
        content,
        parentId: comment.id,
      });

      setReplying(false);
      onChanged?.();
    } catch (err) {
      onError?.(getErrorMessage(err));
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      onChanged?.();
    } catch (err) {
      onError?.(getErrorMessage(err));
    }
  };

  return (
    <div className={level > 0 ? "ml-6 border-l border-cyan-100 pl-4" : ""}>
      <div
        className={`rounded-[26px] border p-5 transition ${
          shouldShowHiddenContentForAdmin
            ? "border-amber-200 bg-amber-50/40 opacity-70"
            : "border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50 text-sm font-black text-cyan-700 shadow-sm">
            {getAuthorName(comment).slice(0, 1).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black text-slate-950">
                    {getAuthorName(comment)}
                  </p>

                  {hidden ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      <EyeOff className="h-3 w-3" />
                      Đã ẩn
                    </span>
                  ) : null}
                </div>

                <p className="text-xs text-slate-500">
                  {formatDate(comment.createdAt || comment.created_at)}
                </p>
              </div>

              <CommentActions
                commentId={comment.id}
                hidden={hidden}
                canModerate={canModerate}
                canDelete={canDelete}
                onDelete={handleDelete}
                onChanged={onChanged}
                onError={onError}
              />
            </div>

            {shouldShowHiddenPlaceholder ? (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm font-semibold text-slate-500">
                <EyeOff className="h-4 w-4 text-cyan-700" />
                {getHiddenMessage(comment)}
              </div>
            ) : (
              <p
                className={`mt-3 whitespace-pre-wrap text-sm leading-7 ${
                  shouldShowHiddenContentForAdmin
                    ? "text-slate-500 line-through decoration-amber-500/60"
                    : "text-slate-950"
                }`}
              >
                {getContent(comment) || "Không có nội dung."}
              </p>
            )}

            {shouldShowHiddenContentForAdmin ? (
              <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-700">
                <Eye className="h-3.5 w-3.5" />
                Chỉ quản trị viên nhìn thấy nội dung bình luận đã ẩn.
              </p>
            ) : null}

            {!shouldShowHiddenPlaceholder ? (
              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplying((value) => !value)}
                >
                  <Reply className="h-4 w-4" />
                  Trả lời
                </Button>
              </div>
            ) : null}

            {replying ? (
              <div className="mt-4">
                <ReplyForm loading={replyLoading} onSubmit={handleReply} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {replies.length ? (
        <div className="mt-3 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              attemptId={attemptId}
              comment={reply}
              level={level + 1}
              canModerate={canModerate}
              currentUserId={currentUserId}
              onChanged={onChanged}
              onError={onError}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
