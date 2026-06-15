"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { WritingReviewPanel } from "@/components/grading/WritingReviewPanel";
import { SpeakingReviewPanel } from "@/components/grading/SpeakingReviewPanel";
import { DiscussionPanel } from "@/components/comments/DiscussionPanel";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Headphones,
  Loader2,
  MessageSquareText,
  Mic,
  PenLine,
  RefreshCcw,
  X,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { getAttemptReview } from "@/lib/api/attempts.api";

type ReviewPayload = {
  attempt?: {
    id: string;
    mode?: string;
    partLabel?: string | null;
    status?: string;
    startedAt?: string;
    submittedAt?: string | null;
    gradedAt?: string | null;
  };
  snapshot?: {
    test?: {
      id: string;
      title?: string;
      type?: string;
      level?: number | null;
    };
    sections?: ReviewSection[];
  };
  savedAnswers?: SavedAnswer[];
  questionAnswers?: SavedAnswer[];
  writingResponses?: any[];
  speakingResponses?: any[];
  scores?: any;
  feedback?: any;
  [key: string]: unknown;
};

type ReviewSection = {
  id: string;
  sectionType:
    | "READING_SET"
    | "LISTENING_SET"
    | "WRITING_TASK"
    | "SPEAKING_SET";
  partLabel?: string | null;
  sortOrder?: number;
  readingSet?: {
    id: string;
    title?: string;
    passageHtml?: string | null;
    passageText?: string | null;
    questions?: ReviewQuestion[];
  } | null;
  listeningSet?: {
    id: string;
    title?: string;
    audioUrl?: string | null;
    transcriptText?: string | null;
    questions?: ReviewQuestion[];
  } | null;
  writingTask?: {
    id: string;
    title?: string;
    taskNo?: number;
    promptText?: string | null;
  } | null;
  speakingSet?: {
    id: string;
    topic?: string | null;
    parts?: any[];
  } | null;
};

type ReviewQuestion = {
  id: string;
  qNo?: number;
  questionType?: string;
  promptText?: string;
  instructionText?: string | null;
  optionsJson?: string[] | null;
  correctAnswerJson?: unknown;
  explanation?: string | null;
  points?: number;
  sortOrder?: number;
};

type SavedAnswer = {
  questionId: string;
  qNo?: number;
  answerJson?: unknown;
  isCorrect?: boolean | null;
  score?: number | null;
  pointsAwarded?: number | null;
  correctAnswerJson?: unknown;
  explanation?: string | null;
};
type TeacherReviewItem = {
  skill: string;
  review: any;
};
function formatDateTime(value?: string | null) {
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

function statusLabel(status?: string) {
  const map: Record<string, string> = {
    IN_PROGRESS: "Đang làm",
    SUBMITTED: "Đã nộp",
    GRADING: "Đang chấm",
    GRADED: "Đã chấm",
    ERROR: "Lỗi",
    EXPIRED: "Hết hạn",
  };

  return status ? map[status] || status : "Chưa rõ";
}

function sectionLabel(section?: ReviewSection, index = 0) {
  if (!section) return "Phần thi";
  if (section.partLabel) return section.partLabel;

  const map: Record<string, string> = {
    READING_SET: "Reading",
    LISTENING_SET: "Listening",
    WRITING_TASK: "Writing",
    SPEAKING_SET: "Speaking",
  };

  return `${map[section.sectionType] || "Phần"} ${index + 1}`;
}

function sectionIcon(sectionType?: string) {
  if (sectionType === "LISTENING_SET") return Headphones;
  if (sectionType === "WRITING_TASK") return PenLine;
  if (sectionType === "SPEAKING_SET") return Mic;
  return BookOpen;
}

function getSectionTitle(section?: ReviewSection) {
  if (!section) return "Phần thi";

  return (
    section.readingSet?.title ||
    section.listeningSet?.title ||
    section.writingTask?.title ||
    section.speakingSet?.topic ||
    section.partLabel ||
    "Phần thi"
  );
}

function getQuestions(section?: ReviewSection): ReviewQuestion[] {
  if (!section) return [];

  if (section.sectionType === "READING_SET") {
    return section.readingSet?.questions || [];
  }

  if (section.sectionType === "LISTENING_SET") {
    return section.listeningSet?.questions || [];
  }

  return [];
}

function answerToText(value: unknown) {
  if (value === null || value === undefined || value === "")
    return "Chưa trả lời";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return value.join(", ");
  return JSON.stringify(value);
}

function normalizeAnswer(value: unknown) {
  return answerToText(value).trim().toLowerCase();
}

function isAnswerCorrect(question: ReviewQuestion, answer?: SavedAnswer) {
  if (answer?.isCorrect !== undefined && answer?.isCorrect !== null) {
    return answer.isCorrect;
  }

  const correct = answer?.correctAnswerJson ?? question.correctAnswerJson;
  const user = answer?.answerJson;

  if (
    correct === undefined ||
    correct === null ||
    user === undefined ||
    user === null ||
    user === ""
  ) {
    return null;
  }

  return normalizeAnswer(correct) === normalizeAnswer(user);
}

function getAnswerMap(payload?: ReviewPayload | null) {
  const answers = payload?.savedAnswers || payload?.questionAnswers || [];
  const map: Record<string, SavedAnswer> = {};

  answers.forEach((answer) => {
    map[answer.questionId] = answer;
  });

  return map;
}

function getQuestionStatus(question: ReviewQuestion, answer?: SavedAnswer) {
  if (
    !answer ||
    answer.answerJson === undefined ||
    answer.answerJson === null ||
    answer.answerJson === ""
  ) {
    return "blank";
  }

  const correct = isAnswerCorrect(question, answer);

  if (correct === true) return "correct";
  if (correct === false) return "wrong";

  return "answered";
}

function getStatusClass(status: string) {
  if (status === "correct")
    return "border-emerald-300 bg-emerald-50 text-emerald-700";
  if (status === "wrong") return "border-rose-200 bg-rose-50 text-rose-600";
  if (status === "answered")
    return "border-amber-200 bg-amber-50 text-amber-600";
  return "border-slate-200 bg-slate-50 text-slate-500";
}

function getStatusText(status: string) {
  if (status === "correct") return "Đúng";
  if (status === "wrong") return "Sai";
  if (status === "answered") return "Đã trả lời";
  return "Chưa trả lời";
}

function optionToText(option: unknown): string {
  if (option === null || option === undefined) return "";

  if (
    typeof option === "string" ||
    typeof option === "number" ||
    typeof option === "boolean"
  ) {
    return String(option);
  }

  if (Array.isArray(option)) {
    return option.map(optionToText).filter(Boolean).join(", ");
  }

  if (typeof option === "object") {
    const record = option as Record<string, unknown>;

    const preferred =
      record.label ??
      record.text ??
      record.content ??
      record.title ??
      record.option ??
      record.answer ??
      record.value ??
      record.key ??
      record.id ??
      record.code;

    if (preferred !== undefined && preferred !== null) {
      return optionToText(preferred);
    }

    try {
      return JSON.stringify(option);
    } catch {
      return String(option);
    }
  }

  return String(option);
}

function parseOptionLabel(option: unknown): { value: string; label: string } {
  if (option && typeof option === "object" && !Array.isArray(option)) {
    const record = option as Record<string, unknown>;

    const value = optionToText(
      record.value ?? record.key ?? record.id ?? record.code ?? record.label,
    ).trim();

    const label = optionToText(
      record.label ??
        record.text ??
        record.content ??
        record.title ??
        record.option ??
        record.answer ??
        record.value ??
        record.key ??
        record.id,
    ).trim();

    const safeLabel = label || value || "Lựa chọn";
    const safeValue = value || safeLabel;

    return { value: safeValue, label: safeLabel };
  }

  const label = optionToText(option).trim();
  const match = label.match(/^([A-D])\.\s*(.*)$/);

  if (!match) return { value: label, label };

  return { value: match[1], label };
}
function normalizeTeacherReview(item: any): TeacherReviewItem | null {
  const skill =
    item?.skill ||
    item?.sectionType ||
    item?.section_type ||
    item?.partLabel ||
    item?.part_label ||
    "";

  const review =
    item?.review ||
    item?.teacherReview ||
    item?.teacher_reviews ||
    item?.teacher_reviews?.[0] ||
    null;

  if (!review) return null;

  return {
    skill,
    review: {
      ...review,
      skill: review.skill || skill,
    },
  };
}

function getTeacherReviewItems(payload?: ReviewPayload | null) {
  const directReviews = Array.isArray((payload as any)?.teacherReviews)
    ? (payload as any).teacherReviews.map((review: any) => ({
        skill: review.skill || "",
        review,
      }))
    : [];

  const submissions = Array.isArray((payload as any)?.teacherSubmissions)
    ? (payload as any).teacherSubmissions
    : Array.isArray((payload as any)?.teacher_submissions)
      ? (payload as any).teacher_submissions
      : [];

  const fromSubmissions = submissions
    .map(normalizeTeacherReview)
    .filter(Boolean) as TeacherReviewItem[];

  const attemptSubmissions = Array.isArray(
    (payload as any)?.attempt?.teacherSubmissions,
  )
    ? (payload as any).attempt.teacherSubmissions
    : Array.isArray((payload as any)?.attempt?.teacher_submissions)
      ? (payload as any).attempt.teacher_submissions
      : [];

  const fromAttempt = attemptSubmissions
    .map(normalizeTeacherReview)
    .filter(Boolean) as TeacherReviewItem[];

  return [...directReviews, ...fromSubmissions, ...fromAttempt].filter(
    (item) => item.review,
  );
}

function getTeacherReviewForSection(
  teacherReviews: TeacherReviewItem[],
  section?: ReviewSection,
) {
  if (!section) return null;

  const skill =
    section.sectionType === "WRITING_TASK"
      ? "WRITING"
      : section.sectionType === "SPEAKING_SET"
        ? "SPEAKING"
        : "";

  if (!skill) return null;

  return teacherReviews.find((item) => item.skill === skill)?.review || null;
}
export default function Page({
  params,
}: {
  params: {
    attemptId: string;
  };
}) {
  const attemptId = params.attemptId;

  const [review, setReview] = useState<ReviewPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<{
    question: ReviewQuestion;
    section: ReviewSection;
    answer?: SavedAnswer;
  } | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const data = await getAttemptReview(attemptId);
      setReview(data || {});
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải review bài làm",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [attemptId]);

  useEffect(() => {
    if (loading || window.location.hash !== "#discussion") return;

    const timer = window.setTimeout(() => {
      document
        .getElementById("discussion")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [loading]);

  const sections = review?.snapshot?.sections || [];
  const activeSection = sections[activeSectionIndex] || sections[0];
  const questions = getQuestions(activeSection);
  const answerMap = useMemo(() => getAnswerMap(review), [review]);
  const teacherReviews = useMemo(() => getTeacherReviewItems(review), [review]);
  const activeTeacherReview = getTeacherReviewForSection(
    teacherReviews,
    activeSection,
  );
  const allQuestions = useMemo(() => {
    return sections.flatMap((section) =>
      getQuestions(section).map((question) => ({
        section,
        question,
        answer: answerMap[question.id],
        status: getQuestionStatus(question, answerMap[question.id]),
      })),
    );
  }, [sections, answerMap]);

  const correctCount = allQuestions.filter(
    (item) => item.status === "correct",
  ).length;
  const wrongCount = allQuestions.filter(
    (item) => item.status === "wrong",
  ).length;
  const blankCount = allQuestions.filter(
    (item) => item.status === "blank",
  ).length;
  const answeredCount = allQuestions.length - blankCount;

  const title =
    review?.snapshot?.test?.title ||
    review?.attempt?.id ||
    "Review bài làm IELTS";

  if (loading) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-5">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-cyan-700" />
          <p className="mt-3 text-sm text-slate-500">
            Đang tải review bài làm...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-5">
        <Card className="max-w-lg p-6 text-center">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-600" />
          <h1 className="mt-4 font-serif text-3xl font-bold text-slate-950">
            Không thể tải review
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link href="/learner/attempts">
              <Button variant="outline">Quay lại lịch sử</Button>
            </Link>
            <Button onClick={loadData}>
              <RefreshCcw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl space-y-7 px-5 py-8 md:py-12">
      <Link
        href="/learner/attempts"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cyan-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại lịch sử làm bài
      </Link>

      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          <div className="bg-gradient-to-br from-white via-cyan-50/40 to-blue-50/60 p-7 md:p-10">
            <Badge tone="sage">Review chi tiết</Badge>

            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Xem lại từng câu trả lời, đối chiếu đáp án đúng và đọc giải thích
              chi tiết.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">
                  Trạng thái
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {statusLabel(review?.attempt?.status)}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">
                  Thời gian nộp
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {formatDateTime(review?.attempt?.submittedAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">
                  Phần luyện
                </p>
                <p className="mt-2 font-semibold text-slate-950">
                  {review?.attempt?.partLabel || review?.attempt?.mode || "—"}
                </p>
              </div>
            </div>
          </div>

          <aside className="border-t border-cyan-100 bg-cyan-600 p-7 text-white lg:border-l lg:border-t-0 md:p-10">
            <p className="text-xs uppercase tracking-[.24em] text-white/70">
              Tổng quan câu hỏi
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-3xl font-bold">{allQuestions.length}</p>
                <p className="text-sm text-white/70">Tổng câu</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-3xl font-bold">{answeredCount}</p>
                <p className="text-sm text-white/70">Đã trả lời</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-3xl font-bold">{correctCount}</p>
                <p className="text-sm text-white/70">Đúng</p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-3xl font-bold">{wrongCount}</p>
                <p className="text-sm text-white/70">Sai</p>
              </div>
            </div>

            <Link href={`/learner/attempts/${attemptId}/result`}>
              <Button variant="secondary" className="mt-6 w-full">
                Xem kết quả tổng quan
              </Button>
            </Link>
          </aside>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <h2 className="font-serif text-2xl font-bold text-slate-950">
              Phần thi
            </h2>
          </CardHeader>

          <CardContent className="space-y-2">
            {sections.length === 0 ? (
              <p className="text-sm text-slate-500">
                Không có section để review.
              </p>
            ) : (
              sections.map((section, index) => {
                const Icon = sectionIcon(section.sectionType);
                const active = activeSectionIndex === index;

                return (
                  <button
                    key={section.id || index}
                    type="button"
                    onClick={() => setActiveSectionIndex(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                        : "border-cyan-100 bg-cyan-50/60 text-slate-500 hover:border-cyan-300/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <p className="font-semibold">
                          {sectionLabel(section, index)}
                        </p>
                        <p className="mt-1 text-xs">
                          {getSectionTitle(section)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-3xl font-bold text-slate-950">
                  Chi tiết câu trả lời
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Click vào từng câu để xem đáp án, bài làm và giải thích.
                </p>
              </div>

              <Badge tone="sage">
                {sectionLabel(activeSection, activeSectionIndex)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            {questions.length === 0 ? (
              activeTeacherReview ? (
                activeSection?.sectionType === "SPEAKING_SET" ? (
                  <SpeakingReviewPanel review={activeTeacherReview} />
                ) : (
                  <WritingReviewPanel review={activeTeacherReview} />
                )
              ) : (
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-6 text-center">
                  <FileText className="mx-auto h-9 w-9 text-slate-500" />
                  <p className="mt-3 font-semibold text-slate-950">
                    Section này chưa có câu hỏi objective
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Nếu đây là Writing/Speaking, điểm và nhận xét giáo viên sẽ
                    hiển thị sau khi bài được chấm.
                  </p>
                </div>
              )
            ) : (
              <div className="grid gap-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
                {questions.map((question) => {
                  const answer = answerMap[question.id];
                  const status = getQuestionStatus(question, answer);

                  return (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() =>
                        setSelectedQuestion({
                          question,
                          section: activeSection,
                          answer,
                        })
                      }
                      className={`flex h-14 items-center justify-center rounded-xl border font-semibold transition hover:scale-[1.02] ${getStatusClass(status)}`}
                    >
                      {question.qNo}
                    </button>
                  );
                })}
              </div>
            )}

            {questions.length > 0 ? (
              <div className="mt-8 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-emerald-300 bg-emerald-50" />
                    <span className="text-sm font-semibold text-slate-950">
                      Trả lời đúng
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-rose-200 bg-rose-50" />
                    <span className="text-sm font-semibold text-slate-950">
                      Trả lời sai
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-amber-200 bg-amber-50" />
                    <span className="text-sm font-semibold text-slate-950">
                      Đã trả lời
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded border border-cyan-100 bg-slate-100" />
                    <span className="text-sm font-semibold text-slate-950">
                      Chưa trả lời
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
      {teacherReviews.length > 0 ? (
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
              Teacher review
            </p>
            <h2 className="mt-1 font-serif text-3xl font-bold text-slate-950">
              Tổng hợp nhận xét giáo viên
            </h2>
          </div>

          {teacherReviews.map((item, index) =>
            item.skill === "SPEAKING" ? (
              <SpeakingReviewPanel
                key={`${item.skill}-${item.review.id || index}`}
                review={item.review}
              />
            ) : (
              <WritingReviewPanel
                key={`${item.skill}-${item.review.id || index}`}
                review={item.review}
              />
            ),
          )}
        </section>
      ) : null}
      <section id="discussion" className="scroll-mt-28">
        <DiscussionPanel
          attemptId={attemptId}
          title="Trao đổi về bài làm"
          description="Nếu còn thắc mắc về điểm, đáp án hoặc nhận xét, bạn có thể gửi câu hỏi cho giáo viên tại đây."
        />
      </section>
      {selectedQuestion ? (
        <QuestionDetailModal
          question={selectedQuestion.question}
          answer={selectedQuestion.answer}
          section={selectedQuestion.section}
          onClose={() => setSelectedQuestion(null)}
        />
      ) : null}
    </div>
  );
}

function QuestionDetailModal({
  question,
  answer,
  section,
  onClose,
}: {
  question: ReviewQuestion;
  answer?: SavedAnswer;
  section: ReviewSection;
  onClose: () => void;
}) {
  const status = getQuestionStatus(question, answer);
  const correctAnswer = answer?.correctAnswerJson ?? question.correctAnswerJson;
  const explanation = answer?.explanation || question.explanation;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-[2rem] border border-cyan-100 bg-white/90 shadow-[0_24px_80px_rgba(14,165,233,0.12)]">
        <div className="flex items-center justify-between border-b border-cyan-100 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-950">
              Q{question.qNo}
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-950">
              Chi tiết câu hỏi
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-96px)] overflow-y-auto p-6">
          <Badge tone="sage">{sectionLabel(section)}</Badge>

          {question.instructionText ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-[.16em] text-cyan-700">
              {question.instructionText}
            </p>
          ) : null}

          <p className="mt-3 text-xl leading-8 text-slate-950">
            {question.promptText || "Câu hỏi chưa có nội dung."}
          </p>

          {Array.isArray(question.optionsJson) &&
          question.optionsJson.length > 0 ? (
            <div className="mt-6 space-y-3">
              {question.optionsJson.map((option, optionIndex) => {
                const parsed = parseOptionLabel(option);
                const optionText = optionToText(option);
                const isUser =
                  normalizeAnswer(answer?.answerJson) ===
                    normalizeAnswer(parsed.value) ||
                  normalizeAnswer(answer?.answerJson) ===
                    normalizeAnswer(parsed.label) ||
                  normalizeAnswer(answer?.answerJson) ===
                    normalizeAnswer(optionText);

                const isCorrect =
                  normalizeAnswer(correctAnswer) ===
                    normalizeAnswer(parsed.value) ||
                  normalizeAnswer(correctAnswer) ===
                    normalizeAnswer(parsed.label) ||
                  normalizeAnswer(correctAnswer) ===
                    normalizeAnswer(optionText);

                return (
                  <div
                    key={`${parsed.value || parsed.label || "option"}-${optionIndex}`}
                    className={`rounded-2xl border p-4 ${
                      isCorrect
                        ? "border-cyan-300 bg-cyan-50"
                        : isUser
                          ? "border-rose-200 bg-rose-50"
                          : "border-cyan-100 bg-cyan-50/60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 className="mt-1 h-5 w-5 text-cyan-700" />
                      ) : isUser ? (
                        <XCircle className="mt-1 h-5 w-5 text-rose-600" />
                      ) : (
                        <span className="mt-1 h-5 w-5 rounded-full border border-cyan-100" />
                      )}

                      <div>
                        <p className="text-sm leading-7 text-slate-950">
                          {parsed.label}
                        </p>
                        {isUser ? (
                          <p className="mt-1 text-xs font-semibold text-rose-600">
                            Câu trả lời của bạn
                          </p>
                        ) : null}
                        {isCorrect ? (
                          <p className="mt-1 text-xs font-semibold text-cyan-700">
                            Đáp án đúng
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-700">
                  Câu trả lời của bạn
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {answerToText(answer?.answerJson)}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-700">
                  Đáp án đúng
                </p>
                <p className="mt-2 text-lg font-semibold text-cyan-700">
                  {answerToText(correctAnswer)}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-cyan-700" />
              <h3 className="font-serif text-2xl font-bold text-slate-950">
                Giải thích chi tiết
              </h3>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {explanation || "Chưa có giải thích cho câu hỏi này."}
            </p>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose} variant="secondary">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
