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
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ErrorState, LoadingState } from "@/components/common/States";
import { DiscussionPanel } from "@/components/comments/DiscussionPanel";
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

function pickScore(review: any, keys: string[]) {
  const sources = [
    review,
    review?.scores,
    review?.scoreJson,
    review?.score_json,
    review?.scoresJson,
    review?.scores_json,
    review?.criteria,
    review?.criteriaJson,
    review?.criteria_json,
    review?.rubric,
    review?.rubricJson,
    review?.rubric_json,
    review?.details,
    review?.detail,
  ];

  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    for (const key of keys) {
      const raw = source[key];
      const value =
        raw && typeof raw === "object"
          ? (raw.score ?? raw.band ?? raw.value ?? raw.point ?? raw.points)
          : raw;

      const number = Number(value);

      if (Number.isFinite(number) && number > 0) {
        return number;
      }
    }
  }

  return null;
}

function pickText(review: any, keys: string[]) {
  for (const key of keys) {
    const value = review?.[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function getReviewCriteria(review: any, skill?: string) {
  if (skill === "SPEAKING") {
    return [
      {
        title: "Fluency and Coherence",
        description:
          "Độ trôi chảy, mạch lạc và khả năng phát triển câu trả lời.",
        value: pickScore(review, [
          "fluencyCoherence",
          "fluency_coherence",
          "fluency",
          "fc",
        ]),
      },
      {
        title: "Lexical Resource",
        description:
          "Vốn từ, độ chính xác và sự linh hoạt trong cách diễn đạt.",
        value: pickScore(review, [
          "lexicalResource",
          "lexical_resource",
          "lexical",
          "vocabulary",
          "lr",
        ]),
      },
      {
        title: "Grammatical Range and Accuracy",
        description: "Độ đa dạng và chính xác của cấu trúc ngữ pháp.",
        value: pickScore(review, [
          "grammaticalRangeAccuracy",
          "grammatical_range_accuracy",
          "grammar",
          "grammatical",
          "gra",
        ]),
      },
      {
        title: "Pronunciation",
        description: "Phát âm, trọng âm, ngữ điệu và mức độ dễ hiểu.",
        value: pickScore(review, ["pronunciation", "pronounce", "pr"]),
      },
    ];
  }

  return [
    {
      title: "Task Achievement / Task Response",
      description:
        "Mức độ trả lời đúng yêu cầu đề, phát triển ý và xử lý nhiệm vụ.",
      value: pickScore(review, [
        "taskAchievement",
        "task_achievement",
        "taskResponse",
        "task_response",
        "ta",
        "tr",
      ]),
    },
    {
      title: "Coherence and Cohesion",
      description: "Độ mạch lạc của bài viết, cách tổ chức đoạn và liên kết ý.",
      value: pickScore(review, [
        "coherenceCohesion",
        "coherence_cohesion",
        "coherence",
        "cohesion",
        "cc",
      ]),
    },
    {
      title: "Lexical Resource",
      description:
        "Khả năng sử dụng từ vựng, độ chính xác và mức độ linh hoạt.",
      value: pickScore(review, [
        "lexicalResource",
        "lexical_resource",
        "lexical",
        "vocabulary",
        "lr",
      ]),
    },
    {
      title: "Grammatical Range and Accuracy",
      description:
        "Độ đa dạng và chính xác của cấu trúc ngữ pháp, câu phức và dấu câu.",
      value: pickScore(review, [
        "grammaticalRangeAccuracy",
        "grammatical_range_accuracy",
        "grammar",
        "grammatical",
        "gra",
      ]),
    },
  ];
}

function formatScore(value: number | null) {
  if (!value) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function AdminReviewPanel({ review, skill }: { review: any; skill?: string }) {
  const overallBand = getOverallBand(review);
  const criteria = getReviewCriteria(review, skill);
  const hasDetailedScores = criteria.some((item) => item.value);
  const feedback =
    pickText(review, [
      "overallFeedback",
      "overall_feedback",
      "feedback",
      "comment",
      "comments",
      "note",
    ]) || "Chưa có nhận xét tổng quan.";
  const strengths = pickText(review, ["strengths", "strength", "goodPoints"]);
  const improvements = pickText(review, [
    "improvements",
    "improvement",
    "weaknesses",
    "weakness",
    "suggestions",
    "suggestion",
  ]);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[36px] border border-white/70 bg-white/85 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
          <div className="relative grid min-h-[220px] place-items-center overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 p-8 text-white">
            <div
              aria-hidden="true"
              className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/20 blur-3xl"
            />
            <div className="relative text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-white/30 bg-white/15 shadow-[0_20px_70px_rgba(14,165,233,0.28)]">
                <span className="font-serif text-4xl font-black">
                  {overallBand}
                </span>
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[.28em] text-cyan-50">
                Band
              </p>
            </div>
          </div>

          <div className="p-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
              <Star className="h-7 w-7" />
            </div>

            <p className="mt-5 text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              {skill === "SPEAKING" ? "Speaking band" : "Writing band"}
            </p>
            <h2 className="mt-1 font-serif text-3xl font-black text-slate-950">
              Điểm giáo viên chấm
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Điểm được tổng hợp từ rubric IELTS và nhận xét chi tiết của giáo
              viên.
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[36px] border border-white/70 bg-white/85 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <CardHeader className="bg-gradient-to-r from-white/90 via-cyan-50/60 to-blue-50/60">
          <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
            Rubric
          </p>
          <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
            Chi tiết điểm {skill === "SPEAKING" ? "Speaking" : "Writing"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Mỗi tiêu chí được chấm theo thang điểm IELTS và tổng hợp thành band
            cuối cùng.
          </p>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          {hasDetailedScores ? (
            criteria.map((item) => {
              const width = item.value
                ? Math.min(100, (item.value / 9) * 100)
                : 0;

              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-cyan-100 bg-white/80 p-5 shadow-sm backdrop-blur-xl"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <h3 className="font-black text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-3 text-center">
                      <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                        Điểm
                      </p>
                      <p className="mt-1 font-serif text-2xl font-black text-slate-950">
                        {formatScore(item.value)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-cyan-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[28px] border border-dashed border-cyan-200 bg-cyan-50/70 p-6 text-sm leading-7 text-slate-500">
              Chưa có dữ liệu rubric chi tiết. Hệ thống chỉ hiển thị band tổng
              nếu giáo viên đã lưu điểm tổng.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[36px] border border-white/70 bg-white/85 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <CardHeader className="bg-gradient-to-r from-white/90 via-cyan-50/60 to-blue-50/60">
          <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
            Feedback
          </p>
          <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
            Nhận xét của giáo viên
          </h2>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          <div className="rounded-[28px] border border-cyan-100 bg-white/80 p-5 text-sm leading-7 text-slate-600 shadow-sm backdrop-blur-xl">
            {feedback}
          </div>

          {strengths || improvements ? (
            <div className="grid gap-4 md:grid-cols-2">
              {strengths ? (
                <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/70 p-5 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                    Điểm mạnh
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {strengths}
                  </p>
                </div>
              ) : null}

              {improvements ? (
                <div className="rounded-[28px] border border-amber-100 bg-amber-50/70 p-5 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-amber-700">
                    Cần cải thiện
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {improvements}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
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

      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/85 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div className="relative grid gap-6 p-7 xl:grid-cols-[1fr_380px] xl:p-9">
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

          <div className="rounded-[30px] border border-cyan-100 bg-cyan-50/70 p-5 shadow-sm backdrop-blur-xl">
            <div className="grid gap-3">
              <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
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

              <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
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

              <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
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
                <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                    Thời gian nộp
                  </p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {formatDate(submittedAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
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

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="space-y-6">
          {skill === "SPEAKING" ? (
            <SpeakingSubmissionViewer submission={submission} />
          ) : (
            <WritingSubmissionViewer submission={submission} />
          )}

          {review ? (
            <AdminReviewPanel review={review} skill={skill} />
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

              <p className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-xs font-semibold text-cyan-700">
                Chỉ hiển thị thông tin cần thiết cho quản trị viên.
              </p>
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
