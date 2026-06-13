"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpenCheck,
  FilePenLine,
  Headphones,
  MessageSquareText,
  Star,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ErrorState, LoadingState } from "@/components/common/States";
import { DiscussionPanel } from "@/components/comments/DiscussionPanel";
import { WritingReviewPanel } from "@/components/grading/WritingReviewPanel";
import { SpeakingReviewPanel } from "@/components/grading/SpeakingReviewPanel";
import { SubmissionStatusBadge } from "@/components/teacher/SubmissionStatusBadge";
import { WritingSubmissionViewer } from "@/components/teacher/WritingSubmissionViewer";
import { SpeakingSubmissionViewer } from "@/components/teacher/SpeakingSubmissionViewer";
import { getErrorMessage } from "@/lib/api/client";
import { getTeacherSubmission } from "@/lib/api/teacher.api";

function getStudentName(submission: any) {
  return (
    submission?.student?.fullName ||
    submission?.student?.full_name ||
    submission?.student?.email ||
    submission?.user?.fullName ||
    submission?.user?.full_name ||
    submission?.user?.email ||
    submission?.attempt?.user?.fullName ||
    submission?.attempt?.user?.full_name ||
    submission?.attempt?.user?.email ||
    submission?.attempts?.users?.full_name ||
    submission?.attempts?.users?.email ||
    "Học viên"
  );
}

function getTestTitle(submission: any) {
  return (
    submission?.test?.title ||
    submission?.attempt?.test?.title ||
    submission?.attempts?.tests?.title ||
    submission?.testTitle ||
    "Bài làm IELTS"
  );
}

function getSkill(submission: any) {
  return submission?.skill || submission?.test?.type || "";
}

function getSkillText(skill?: string) {
  if (skill === "WRITING") return "Writing";
  if (skill === "SPEAKING") return "Speaking";
  return "Bài làm";
}

function getAttemptId(submission: any) {
  return (
    submission?.attemptId ||
    submission?.attempt_id ||
    submission?.attempt?.id ||
    submission?.attempts?.id ||
    ""
  );
}

function getReview(submission: any) {
  return (
    submission?.review ||
    submission?.teacherReview ||
    submission?.teacher_reviews ||
    null
  );
}

function getReviewerName(review: any) {
  return (
    review?.reviewedBy?.fullName ||
    review?.reviewedBy?.email ||
    review?.users?.full_name ||
    review?.users?.email ||
    ""
  );
}

function getOverallBand(review: any) {
  const value = review?.overallBand ?? review?.overall_band;
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "—";

  return number.toFixed(1);
}

function formatDate(value?: string | null) {
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

export default function AdminSubmissionDetailPage() {
  const params = useParams();
  const submissionId = String(params.submissionId);

  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTeacherSubmission(submissionId);
      setSubmission(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const skill = getSkill(submission);
  const attemptId = getAttemptId(submission);
  const review = getReview(submission);

  const submittedAt = useMemo(() => {
    return (
      submission?.submittedAt ||
      submission?.submitted_at ||
      submission?.createdAt ||
      submission?.created_at ||
      null
    );
  }, [submission]);

  const reviewedAt = useMemo(() => {
    return (
      submission?.reviewedAt ||
      submission?.reviewed_at ||
      review?.updatedAt ||
      review?.updated_at ||
      review?.createdAt ||
      review?.created_at ||
      null
    );
  }, [submission, review]);

  if (loading) {
    return <LoadingState label="Đang tải chi tiết bài làm..." />;
  }

  if (error && !submission) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/comments">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Quay lại quản lý bình luận
          </Button>
        </Link>
      </div>

      <section className="overflow-hidden rounded-[32px] border border-cyan-100 bg-white/80 shadow-sm">
        <div className="grid gap-6 p-7 xl:grid-cols-[1fr_380px] xl:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-700">
              Admin / Submission detail
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              {getTestTitle(submission)}
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-500">
              Admin có thể xem nội dung bài làm, điểm chấm, phản hồi giáo viên
              và quản lý phần trao đổi dưới bài làm này.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <SubmissionStatusBadge status={submission?.status} />

              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/70 px-3 py-1 text-xs font-semibold text-cyan-700">
                {skill === "SPEAKING" ? (
                  <Headphones className="h-3.5 w-3.5" />
                ) : (
                  <FilePenLine className="h-3.5 w-3.5" />
                )}
                {getSkillText(skill)}
              </span>
            </div>
          </div>

          <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/70 p-5">
            <div className="grid gap-3">
              <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <UserRound className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                      Học viên
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {getStudentName(submission)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                      Band
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {getOverallBand(review)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4">
                <div className="flex items-center gap-3">
                  <BookOpenCheck className="h-5 w-5 text-cyan-700" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                      Giáo viên chấm
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {getReviewerName(review) || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                    Thời gian nộp
                  </p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {formatDate(submittedAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                    Thời gian chấm
                  </p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {formatDate(reviewedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <main className="space-y-6">
          {skill === "SPEAKING" ? (
            <SpeakingSubmissionViewer submission={submission} />
          ) : (
            <WritingSubmissionViewer submission={submission} />
          )}

          {review ? (
            skill === "SPEAKING" ? (
              <SpeakingReviewPanel review={review} />
            ) : (
              <WritingReviewPanel review={review} />
            )
          ) : (
            <Card className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
              <CardHeader>
                <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                  Teacher review
                </p>
                <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                  Chưa có điểm chấm
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Bài làm này chưa có phần chấm chi tiết từ giáo viên.
                </p>
              </CardHeader>
            </Card>
          )}
        </main>

        <aside className="space-y-5">
          <Card className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <CardContent className="p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50">
                <MessageSquareText className="h-6 w-6 text-cyan-700" />
              </div>

              <h2 className="mt-4 font-serif text-2xl font-black text-slate-950">
                Quản lý trao đổi
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                Phần bình luận bên dưới giúp admin theo dõi câu hỏi của học
                viên, phản hồi nếu cần và ẩn các nội dung không phù hợp.
              </p>

              {attemptId ? (
                <p className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-xs font-semibold text-slate-500">
                  Attempt: {attemptId}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </section>

      {attemptId ? (
        <DiscussionPanel
          attemptId={attemptId}
          canModerate
          title="Trao đổi dưới bài làm"
          description="Admin có thể xem, trả lời, ẩn hoặc bỏ ẩn bình luận trong bài làm này."
        />
      ) : (
        <Card className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <CardContent className="p-6 text-sm text-slate-500">
            Không tìm thấy mã attempt để tải phần bình luận.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
