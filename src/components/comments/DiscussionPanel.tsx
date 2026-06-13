"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageSquareText, RefreshCw } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ErrorState, LoadingState } from "@/components/common/States";
import { CommentForm } from "@/components/comments/CommentForm";
import { CommentList } from "@/components/comments/CommentList";
import {
  createAttemptComment,
  getAttemptComments,
} from "@/lib/api/comments.api";
import { getErrorMessage } from "@/lib/api/client";

type Props = {
  attemptId: string;
  canModerate?: boolean;
  currentUserId?: string;
  title?: string;
  description?: string;
};

function extractItems(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

export function DiscussionPanel({
  attemptId,
  canModerate = false,
  currentUserId,
  title = "Thảo luận bài làm",
  description = "Học viên có thể đặt câu hỏi về bài làm, giáo viên có thể phản hồi để giải thích rõ hơn.",
}: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAttemptComments(attemptId);
      setComments(extractItems(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleCreate = async (content: string) => {
    setSending(true);
    setError("");

    try {
      await createAttemptComment(attemptId, {
        content,
        parentId: null,
      });

      await loadComments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50">
              <MessageSquareText className="h-6 w-6 text-cyan-700" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Discussion
              </p>

              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                {title}
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>
          </div>

          <Button type="button" variant="outline" onClick={loadComments}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-5">
        {error ? <ErrorState message={error} onRetry={loadComments} /> : null}

        <CommentForm loading={sending} onSubmit={handleCreate} />

        {loading ? (
          <LoadingState label="Đang tải thảo luận..." />
        ) : (
          <CommentList
            attemptId={attemptId}
            comments={comments}
            canModerate={canModerate}
            currentUserId={currentUserId}
            onChanged={loadComments}
            onError={setError}
          />
        )}
      </CardContent>
    </Card>
  );
}
