"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  MessageCircleReply,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldAlert,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { CommentForm } from "@/components/comments/CommentForm";
import { getErrorMessage } from "@/lib/api/client";
import {
  createAttemptComment,
  getAdminComments,
  hideComment,
  unhideComment,
} from "@/lib/api/comments.api";

type CommentStatus = "ACTIVE" | "HIDDEN" | "DELETED" | string;

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

type CommentAuthor = {
  id?: string;
  fullName?: string | null;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
};

type CommentRow = {
  id: string;
  content?: string | null;
  body?: string | null;
  status?: CommentStatus;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  attemptId?: string;
  attempt_id?: string;
  parentId?: string | null;
  parent_id?: string | null;
  user?: CommentAuthor | null;
  author?: CommentAuthor | null;
  attempt?: {
    id?: string;
    testId?: string;
    test_id?: string;
    test?: {
      id?: string;
      title?: string | null;
      type?: string | null;
    } | null;
    tests?: {
      id?: string;
      title?: string | null;
      type?: string | null;
    } | null;
  } | null;
  attempts?: {
    id?: string;
    test_id?: string;
    tests?: {
      id?: string;
      title?: string | null;
      type?: string | null;
    } | null;
  } | null;
};

function extractItems(response: any): CommentRow[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function getAuthor(comment: CommentRow) {
  return comment.user || comment.author || null;
}

function getAuthorName(comment: CommentRow) {
  const user = getAuthor(comment);

  return user?.fullName || user?.full_name || user?.email || "Người dùng";
}

function getAuthorRole(comment: CommentRow) {
  const role = getAuthor(comment)?.role;

  if (role === "ADMIN") return "Quản trị viên";
  if (role === "TEACHER") return "Giáo viên";
  if (role === "USER" || role === "LEARNER") return "Học viên";

  return "Người dùng";
}

function getContent(comment: CommentRow) {
  return comment.content || comment.body || "";
}

function getAttemptId(comment: CommentRow) {
  return (
    comment.attemptId ||
    comment.attempt_id ||
    comment.attempt?.id ||
    comment.attempts?.id ||
    ""
  );
}

function getTestTitle(comment: CommentRow) {
  return (
    comment.attempt?.test?.title ||
    comment.attempt?.tests?.title ||
    comment.attempts?.tests?.title ||
    "Bài làm IELTS"
  );
}

function getStatusText(status?: string) {
  if (status === "HIDDEN") return "Đã ẩn";
  if (status === "DELETED") return "Đã xóa";
  return "Đang hiển thị";
}

function getStatusClass(status?: string) {
  if (status === "HIDDEN") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "DELETED") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-cyan-50 text-cyan-700 border-cyan-100";
}

function formatDate(value?: string) {
  if (!value) return "—";

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
function getSubmissionId(comment: CommentRow) {
  return (
    (comment as any).submissionId ||
    (comment as any).submission_id ||
    (comment as any).submission?.id ||
    (comment as any).attempt?.teacherSubmissions?.[0]?.id ||
    (comment as any).attempt?.teacher_submissions?.[0]?.id ||
    (comment as any).attempts?.teacherSubmissions?.[0]?.id ||
    (comment as any).attempts?.teacher_submissions?.[0]?.id ||
    ""
  );
}
export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [replyingId, setReplyingId] = useState("");
  const [replyLoadingId, setReplyLoadingId] = useState("");
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getAdminComments({
        limit: 100,
        status: status || undefined,
        search: keyword.trim() || undefined,
      });

      setComments(extractItems(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [keyword, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredComments = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return comments.filter((comment) => {
      const matchesKeyword = normalized
        ? `${getAuthorName(comment)} ${getContent(comment)} ${getTestTitle(comment)}`
            .toLowerCase()
            .includes(normalized)
        : true;

      const matchesStatus = status ? comment.status === status : true;

      return matchesKeyword && matchesStatus;
    });
  }, [comments, keyword, status]);

  useEffect(() => {
    setPage(1);
  }, [keyword, status, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredComments.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedComments = filteredComments.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  const stats = useMemo(() => {
    return {
      total: comments.length,
      active: comments.filter((item) => item.status !== "HIDDEN").length,
      hidden: comments.filter((item) => item.status === "HIDDEN").length,
    };
  }, [comments]);

  const handleHide = async (commentId: string) => {
    setActionLoadingId(commentId);
    setError("");

    try {
      await hideComment(commentId);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoadingId("");
    }
  };

  const handleUnhide = async (commentId: string) => {
    setActionLoadingId(commentId);
    setError("");

    try {
      await unhideComment(commentId);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoadingId("");
    }
  };

  const handleReply = async (comment: CommentRow, content: string) => {
    const attemptId = getAttemptId(comment);

    if (!attemptId) {
      setError("Không tìm thấy bài làm để trả lời bình luận này.");
      return;
    }

    setReplyLoadingId(comment.id);
    setError("");

    try {
      await createAttemptComment(attemptId, {
        content,
        parentId: comment.id,
      });

      setReplyingId("");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setReplyLoadingId("");
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải bình luận..." />;
  }

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Comments"
        title="Quản lý bình luận"
        description="Theo dõi câu hỏi, phản hồi dưới bài làm và ẩn các bình luận không phù hợp."
        actions={
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <MessageSquareText className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Tổng bình luận
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.total}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <Eye className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Đang hiển thị
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.active}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <ShieldAlert className="h-5 w-5 text-cyan-700" />
            <p className="mt-4 text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Đã ẩn
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.hidden}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardHeader className="bg-gradient-to-r from-white/90 via-cyan-50/60 to-blue-50/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Comment manager
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                Danh sách bình luận
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Quản trị viên có thể trả lời, ẩn hoặc bỏ ẩn bình luận trong từng
                bài làm.
              </p>
            </div>

            <div className="grid w-full gap-3 lg:w-[820px] lg:grid-cols-[1fr_200px_150px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="pl-9"
                  placeholder="Tìm theo nội dung, người bình luận hoặc tên bài làm..."
                />
              </div>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Đang hiển thị</option>
                <option value="HIDDEN">Đã ẩn</option>
              </select>

              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number(event.target.value) as typeof pageSize)
                }
                className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} / trang
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredComments.length ? (
            <>
              <div className="space-y-3">
                {paginatedComments.map((comment) => {
                  const hidden = comment.status === "HIDDEN";
                  const submissionId = getSubmissionId(comment);
                  return (
                    <div
                      key={comment.id}
                      className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 ${
                        hidden
                          ? "border-amber-100 bg-amber-50/70"
                          : "border-cyan-100 bg-white/80"
                      }`}
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                                comment.status,
                              )}`}
                            >
                              {getStatusText(comment.status)}
                            </span>

                            <span className="rounded-full border border-cyan-100 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                              {getAuthorRole(comment)}
                            </span>

                            <span className="text-xs text-slate-500">
                              {formatDate(
                                comment.createdAt || comment.created_at,
                              )}
                            </span>
                          </div>

                          <h3 className="mt-3 font-semibold text-slate-950">
                            {getAuthorName(comment)}
                          </h3>

                          <p className="mt-1 text-xs font-semibold text-cyan-700">
                            {getTestTitle(comment)}
                          </p>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-500">
                            {getContent(comment) || "Không có nội dung."}
                          </p>

                          {submissionId ? (
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                              <Link href={`/admin/submissions/${submissionId}`}>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-4 w-4" />
                                  Mở bài làm
                                </Button>
                              </Link>
                            </div>
                          ) : null}

                          {replyingId === comment.id ? (
                            <div className="mt-4 rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl p-4">
                              <CommentForm
                                loading={replyLoadingId === comment.id}
                                submitLabel="Gửi phản hồi"
                                placeholder="Nhập phản hồi của quản trị viên..."
                                onSubmit={(content) =>
                                  handleReply(comment, content)
                                }
                              />
                            </div>
                          ) : null}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setReplyingId((current) =>
                                current === comment.id ? "" : comment.id,
                              )
                            }
                          >
                            <MessageCircleReply className="h-4 w-4" />
                            Trả lời
                          </Button>

                          {hidden ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoadingId === comment.id}
                              onClick={() => handleUnhide(comment.id)}
                            >
                              <Eye className="h-4 w-4" />
                              Bỏ ẩn
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={actionLoadingId === comment.id}
                              onClick={() => handleHide(comment.id)}
                            >
                              <EyeOff className="h-4 w-4" />
                              Ẩn
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Hiển thị{" "}
                  <strong className="text-slate-950">
                    {(safePage - 1) * pageSize + 1}
                  </strong>
                  –
                  <strong className="text-slate-950">
                    {Math.min(filteredComments.length, safePage * pageSize)}
                  </strong>{" "}
                  trong{" "}
                  <strong className="text-slate-950">
                    {filteredComments.length}
                  </strong>{" "}
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
            </>
          ) : (
            <EmptyState
              title="Chưa có bình luận phù hợp"
              description="Không tìm thấy bình luận nào theo bộ lọc hiện tại."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
