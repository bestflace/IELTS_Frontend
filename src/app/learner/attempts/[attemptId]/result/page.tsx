"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Loader2,
  Mic,
  PenLine,
  RefreshCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import {
  getAttemptDetail,
  getAttemptResult,
  getAttemptReview,
} from "@/lib/api/attempts.api";
import type { Attempt } from "@/types";

type ResultSummary = {
  correctCount?: number | null;
  totalCount?: number | null;
  rawScore?: number | null;
  bandEstimate?: number | null;
  summaryJson?: any;
};

type ResultDetail = {
  id?: string;
  questionId?: string;
  qNo?: number | null;
  isCorrect?: boolean | null;
  userAnswer?: unknown;
  correctAnswer?: unknown;
  score?: number | null;
  points?: number | null;
  explanation?: string | null;
  skillKey?: string | null;
  skill_key?: string | null;
  skillLabel?: string | null;
  skill_label?: string | null;
  sectionId?: string | null;
  section_id?: string | null;
  sectionTitle?: string | null;
  section_title?: string | null;
  sectionType?: string | null;
  section_type?: string | null;
  sectionOrder?: number | null;
  section_order?: number | null;
  [key: string]: unknown;
};

type DetailGroup = {
  key: string;
  label: string;
  description: string;
  details: ResultDetail[];
};

type ResultPayload = {
  attemptId?: string;
  status?: string;
  startedAt?: string | null;
  submittedAt?: string | null;
  gradedAt?: string | null;
  expiresAt?: string | null;
  timeLimitSec?: number | null;
  resultSummary?: ResultSummary | null;
  detail?: ResultDetail[];
  teacherReviews?: any[];
  teacherSubmissions?: any[];
  attempt?: Attempt;
  test?: {
    id?: string;
    title?: string;
    type?: string;
  };
  score?: any;
  scores?: any;
  result?: any;
  summary?: any;
  objective?: any;
  writing?: any;
  speaking?: any;
  feedback?: any;
  aiFeedback?: any;
  teacherFeedback?: any;
  overallBand?: number | string | null;
  bandScore?: number | string | null;
  totalCorrect?: number | null;
  totalQuestions?: number | null;
  correctCount?: number | null;
  questionCount?: number | null;
  durationSec?: number | null;
  timeSpentSec?: number | null;
  [key: string]: unknown;
};

type ReviewAnswer = {
  questionId?: string;
  question_id?: string;
  qNo?: number | null;
  q_no?: number | null;
  answerJson?: unknown;
  answer_json?: unknown;
  userAnswer?: unknown;
  user_answer?: unknown;
  isCorrect?: boolean | null;
  is_correct?: boolean | null;
  score?: number | null;
  pointsAwarded?: number | null;
  correctAnswerJson?: unknown;
  correct_answer_json?: unknown;
  explanation?: string | null;
  [key: string]: unknown;
};

type ReviewQuestion = {
  id?: string;
  qNo?: number | null;
  q_no?: number | null;
  correctAnswerJson?: unknown;
  correct_answer_json?: unknown;
  explanation?: string | null;
  points?: number | null;
  [key: string]: unknown;
};

type ReviewSection = {
  id?: string;
  sectionType?: string;
  section_type?: string;
  sortOrder?: number | null;
  sort_order?: number | null;
  partLabel?: string | null;
  part_label?: string | null;
  readingSet?: {
    title?: string | null;
    questions?: ReviewQuestion[];
  } | null;
  reading_set?: {
    title?: string | null;
    questions?: ReviewQuestion[];
  } | null;
  listeningSet?: {
    title?: string | null;
    questions?: ReviewQuestion[];
  } | null;
  listening_set?: {
    title?: string | null;
    questions?: ReviewQuestion[];
  } | null;
  writingTask?: {
    title?: string | null;
  } | null;
  writing_task?: {
    title?: string | null;
  } | null;
  speakingSet?: {
    topic?: string | null;
  } | null;
  speaking_set?: {
    topic?: string | null;
  } | null;
  [key: string]: unknown;
};

type ReviewPayload = {
  snapshot?: {
    sections?: ReviewSection[];
  };
  savedAnswers?: ReviewAnswer[];
  questionAnswers?: ReviewAnswer[];
  question_answers?: ReviewAnswer[];
  answers?: ReviewAnswer[];
  [key: string]: unknown;
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

function formatDuration(seconds?: number | null) {
  if (seconds === null || seconds === undefined) return "—";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h} giờ ${m} phút`;
  if (m > 0) return `${m} phút ${s} giây`;
  return `${s} giây`;
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }

  return null;
}

function pickText(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }

  return "";
}

function formatBand(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(1).replace(".0", "");
}

function statusLabel(status?: string | null) {
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

function getStatusTone(status?: string | null) {
  if (status === "GRADED") return "success" as const;
  if (status === "ERROR" || status === "EXPIRED") return "danger" as const;
  if (status === "GRADING" || status === "SUBMITTED") return "warning" as const;
  return "sage" as const;
}

const ANSWER_VALUE_KEYS = [
  "userAnswer",
  "user_answer",
  "answerJson",
  "answer_json",
  "answer",
  "answers",
  "value",
  "values",
  "selected",
  "selectedOptions",
  "selected_option",
  "selectedOptionsJson",
] as const;

const CORRECT_VALUE_KEYS = [
  "correctAnswer",
  "correct_answer",
  "correctAnswerJson",
  "correct_answer_json",
  "answerKey",
  "answer_key",
  "correct",
] as const;

function isBlankAnswer(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value))
    return value.length === 0 || value.every(isBlankAnswer);

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj);

    if (keys.length === 0) return true;

    for (const key of ANSWER_VALUE_KEYS) {
      if (key in obj) return isBlankAnswer(obj[key]);
    }
  }

  return false;
}

function pickFirstNonBlank(...values: unknown[]) {
  for (const value of values) {
    if (!isBlankAnswer(value)) return value;
  }

  return undefined;
}

function pickByKeys(source: unknown, keys: readonly string[]) {
  if (!source || typeof source !== "object") return undefined;

  const obj = source as Record<string, unknown>;

  for (const key of keys) {
    if (key in obj && !isBlankAnswer(obj[key])) {
      return obj[key];
    }
  }

  return undefined;
}

function unwrapAnswerValue(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;

  const obj = value as Record<string, unknown>;

  for (const key of ANSWER_VALUE_KEYS) {
    if (key in obj) return unwrapAnswerValue(obj[key]);
  }

  return value;
}

function getDetailUserAnswer(item: ResultDetail) {
  return unwrapAnswerValue(
    pickFirstNonBlank(
      pickByKeys(item, ANSWER_VALUE_KEYS),
      pickByKeys((item as any).answer, ANSWER_VALUE_KEYS),
      pickByKeys((item as any).savedAnswer, ANSWER_VALUE_KEYS),
      pickByKeys((item as any).saved_answer, ANSWER_VALUE_KEYS),
      pickByKeys((item as any).questionAnswer, ANSWER_VALUE_KEYS),
      pickByKeys((item as any).question_answer, ANSWER_VALUE_KEYS),
    ),
  );
}

function getDetailCorrectAnswer(item: ResultDetail) {
  return unwrapAnswerValue(
    pickFirstNonBlank(
      pickByKeys(item, CORRECT_VALUE_KEYS),
      pickByKeys((item as any).question, CORRECT_VALUE_KEYS),
      pickByKeys((item as any).answer, CORRECT_VALUE_KEYS),
      pickByKeys((item as any).savedAnswer, CORRECT_VALUE_KEYS),
      pickByKeys((item as any).saved_answer, CORRECT_VALUE_KEYS),
      pickByKeys((item as any).questionAnswer, CORRECT_VALUE_KEYS),
      pickByKeys((item as any).question_answer, CORRECT_VALUE_KEYS),
    ),
  );
}

function answerToText(value: unknown): string {
  if (isBlankAnswer(value)) return "Chưa trả lời";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return value.map(answerToText).join(", ");

  const unwrapped = unwrapAnswerValue(value);

  if (unwrapped !== value) return answerToText(unwrapped);

  return JSON.stringify(value);
}

function normalizeAnswerForCompare(value: unknown): string {
  return answerToText(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function compareAnswers(userAnswer: unknown, correctAnswer: unknown) {
  if (isBlankAnswer(userAnswer) || isBlankAnswer(correctAnswer)) return null;

  return (
    normalizeAnswerForCompare(userAnswer) ===
    normalizeAnswerForCompare(correctAnswer)
  );
}

function getDetailCorrectState(
  item: ResultDetail,
  userAnswer: unknown,
  correctAnswer: unknown,
) {
  const direct =
    item.isCorrect ??
    (item as any).is_correct ??
    (item as any).answer?.isCorrect ??
    (item as any).answer?.is_correct ??
    (item as any).savedAnswer?.isCorrect ??
    (item as any).saved_answer?.is_correct ??
    null;

  if (typeof direct === "boolean") return direct;

  return compareAnswers(userAnswer, correctAnswer);
}

function getReviewSections(payload?: ReviewPayload | null): ReviewSection[] {
  const sections =
    payload?.snapshot?.sections ||
    (payload as any)?.snapshot?.testSnapshotJson?.sections ||
    (payload as any)?.snapshot?.test_snapshot_json?.sections ||
    [];

  return Array.isArray(sections) ? sections : [];
}

function getSectionQuestions(section: ReviewSection): ReviewQuestion[] {
  const questions =
    section.readingSet?.questions ||
    section.reading_set?.questions ||
    section.listeningSet?.questions ||
    section.listening_set?.questions ||
    [];

  return Array.isArray(questions) ? questions : [];
}

function normalizeDetailSkillKey(value?: unknown) {
  const raw = String(value || "").toUpperCase();

  if (raw.includes("READING")) return "READING";
  if (raw.includes("LISTENING")) return "LISTENING";
  if (raw.includes("WRITING")) return "WRITING";
  if (raw.includes("SPEAKING")) return "SPEAKING";

  return "DETAIL";
}

function getSectionSkillKey(section?: ReviewSection | null) {
  if (!section) return "DETAIL";

  return normalizeDetailSkillKey(
    section.sectionType ||
      section.section_type ||
      (section.readingSet || section.reading_set
        ? "READING"
        : section.listeningSet || section.listening_set
          ? "LISTENING"
          : section.writingTask || section.writing_task
            ? "WRITING"
            : section.speakingSet || section.speaking_set
              ? "SPEAKING"
              : ""),
  );
}

function getSkillDisplayName(skillKey?: string | null) {
  const normalized = normalizeDetailSkillKey(skillKey);

  if (normalized === "READING") return "Reading";
  if (normalized === "LISTENING") return "Listening";
  if (normalized === "WRITING") return "Writing";
  if (normalized === "SPEAKING") return "Speaking";

  return "Chi tiết";
}

function getSectionDetailTitle(section?: ReviewSection | null, index = 0) {
  if (!section) return "Chi tiết câu trả lời";

  const skill = getSectionSkillKey(section);
  const title =
    section.readingSet?.title ||
    section.reading_set?.title ||
    section.listeningSet?.title ||
    section.listening_set?.title ||
    section.writingTask?.title ||
    section.writing_task?.title ||
    section.speakingSet?.topic ||
    section.speaking_set?.topic ||
    section.partLabel ||
    section.part_label ||
    "";

  return title || `${getSkillDisplayName(skill)} ${index + 1}`;
}

function getResultDetailSkillKey(item: ResultDetail) {
  return normalizeDetailSkillKey(
    item.skillKey ||
      item.skill_key ||
      item.skillLabel ||
      item.skill_label ||
      item.sectionType ||
      item.section_type,
  );
}

function getDetailGroupMeta(key: string) {
  if (key === "READING") {
    return {
      label: "Reading",
      description: "Các câu hỏi Reading trong bài làm",
    };
  }

  if (key === "LISTENING") {
    return {
      label: "Listening",
      description: "Các câu hỏi Listening trong bài làm",
    };
  }

  if (key === "WRITING") {
    return {
      label: "Writing",
      description: "Bài viết và nhận xét Writing",
    };
  }

  if (key === "SPEAKING") {
    return {
      label: "Speaking",
      description: "Bài nói và nhận xét Speaking",
    };
  }

  return {
    label: "Chi tiết",
    description: "Chi tiết câu trả lời",
  };
}

function groupResultDetails(details: ResultDetail[]): DetailGroup[] {
  const groups = new Map<string, ResultDetail[]>();

  details.forEach((item) => {
    const key = getResultDetailSkillKey(item);
    groups.set(key, [...(groups.get(key) || []), item]);
  });

  const order = ["READING", "LISTENING", "WRITING", "SPEAKING", "DETAIL"];

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);

      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    })
    .map(([key, groupDetails]) => {
      const meta = getDetailGroupMeta(key);

      return {
        key,
        label: meta.label,
        description: meta.description,
        details: groupDetails,
      };
    });
}

function getDetailAnsweredLabel(details: ResultDetail[]) {
  const answered = details.filter(
    (item) => !isBlankAnswer(getDetailUserAnswer(item)),
  ).length;

  return `${answered}/${details.length} đã trả lời`;
}

function getReviewAnswerMaps(payload?: ReviewPayload | null) {
  const answers =
    payload?.savedAnswers ||
    payload?.questionAnswers ||
    payload?.question_answers ||
    payload?.answers ||
    [];

  const byQuestionId = new Map<string, ReviewAnswer>();
  const byQNo = new Map<number, ReviewAnswer>();

  if (Array.isArray(answers)) {
    answers.forEach((answer) => {
      const questionId = answer.questionId || answer.question_id;
      const qNo = answer.qNo ?? answer.q_no;

      if (questionId) byQuestionId.set(String(questionId), answer);
      if (qNo !== null && qNo !== undefined) byQNo.set(Number(qNo), answer);
    });
  }

  return { byQuestionId, byQNo };
}

function buildDetailsFromReview(
  payload?: ReviewPayload | null,
): ResultDetail[] {
  const { byQuestionId, byQNo } = getReviewAnswerMaps(payload);

  return getReviewSections(payload).flatMap((section, sectionIndex) => {
    const skillKey = getSectionSkillKey(section);
    const skillLabel = getSkillDisplayName(skillKey);
    const sectionTitle = getSectionDetailTitle(section, sectionIndex);
    const sectionOrder = Number(
      section.sortOrder ?? section.sort_order ?? sectionIndex + 1,
    );

    return getSectionQuestions(section).map((question, index) => {
      const questionId = question.id ? String(question.id) : "";
      const qNo = question.qNo ?? question.q_no ?? index + 1;
      const answer =
        (questionId ? byQuestionId.get(questionId) : undefined) ||
        byQNo.get(Number(qNo));

      return {
        id: questionId || `${qNo}`,
        questionId,
        qNo: Number(qNo),
        userAnswer:
          answer?.answerJson ??
          answer?.answer_json ??
          answer?.userAnswer ??
          answer?.user_answer,
        correctAnswer:
          answer?.correctAnswerJson ??
          answer?.correct_answer_json ??
          question.correctAnswerJson ??
          question.correct_answer_json,
        isCorrect: answer?.isCorrect ?? answer?.is_correct ?? null,
        score: answer?.score ?? answer?.pointsAwarded ?? null,
        points: question.points ?? null,
        explanation: answer?.explanation ?? question.explanation ?? null,
        skillKey,
        skillLabel,
        sectionId: section.id || null,
        sectionTitle,
        sectionType: section.sectionType || section.section_type || null,
        sectionOrder,
      };
    });
  });
}

function getDetailKey(item: ResultDetail, index: number): string {
  return String(item.questionId || item.id || item.qNo || index);
}

function mergeResultAndReviewDetails(
  resultDetails: ResultDetail[],
  reviewDetails: ResultDetail[],
) {
  if (!resultDetails.length) return reviewDetails;

  const reviewByQuestionId = new Map<string, ResultDetail>();
  const reviewByQNo = new Map<number, ResultDetail>();

  reviewDetails.forEach((item) => {
    if (item.questionId) reviewByQuestionId.set(String(item.questionId), item);
    if (item.qNo !== null && item.qNo !== undefined) {
      reviewByQNo.set(Number(item.qNo), item);
    }
  });

  return resultDetails.map((item, index) => {
    const reviewItem =
      (item.questionId
        ? reviewByQuestionId.get(String(item.questionId))
        : undefined) ||
      (item.qNo !== null && item.qNo !== undefined
        ? reviewByQNo.get(Number(item.qNo))
        : undefined) ||
      reviewByQNo.get(index + 1);

    if (!reviewItem) return item;

    const userAnswer = pickFirstNonBlank(
      getDetailUserAnswer(item),
      getDetailUserAnswer(reviewItem),
    );
    const correctAnswer = pickFirstNonBlank(
      getDetailCorrectAnswer(item),
      getDetailCorrectAnswer(reviewItem),
    );

    return {
      ...reviewItem,
      ...item,
      questionId: item.questionId || reviewItem.questionId,
      qNo: item.qNo ?? reviewItem.qNo ?? index + 1,
      userAnswer,
      correctAnswer,
      isCorrect:
        item.isCorrect ??
        (item as any).is_correct ??
        reviewItem.isCorrect ??
        (reviewItem as any).is_correct ??
        null,
      explanation: item.explanation || reviewItem.explanation || null,
      skillKey:
        item.skillKey ||
        item.skill_key ||
        reviewItem.skillKey ||
        reviewItem.skill_key ||
        null,
      skillLabel:
        item.skillLabel ||
        item.skill_label ||
        reviewItem.skillLabel ||
        reviewItem.skill_label ||
        null,
      sectionId:
        item.sectionId ||
        item.section_id ||
        reviewItem.sectionId ||
        reviewItem.section_id ||
        null,
      sectionTitle:
        item.sectionTitle ||
        item.section_title ||
        reviewItem.sectionTitle ||
        reviewItem.section_title ||
        null,
      sectionType:
        item.sectionType ||
        item.section_type ||
        reviewItem.sectionType ||
        reviewItem.section_type ||
        null,
      sectionOrder:
        item.sectionOrder ??
        item.section_order ??
        reviewItem.sectionOrder ??
        reviewItem.section_order ??
        null,
    };
  });
}

function calculateDurationFromDates(
  startedAt?: string | null,
  endedAt?: string | null,
) {
  if (!startedAt || !endedAt) return null;

  const duration = Math.floor(
    (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000,
  );

  return Number.isFinite(duration) && duration >= 0 ? duration : null;
}

function getOverallBand(result?: ResultPayload | null) {
  return pickNumber(
    result?.resultSummary?.bandEstimate,
    result?.overallBand,
    result?.bandScore,
    result?.score?.overallBand,
    result?.score?.bandScore,
    result?.scores?.overallBand,
    result?.scores?.bandScore,
    result?.result?.overallBand,
    result?.result?.bandScore,
    result?.writing?.overallBand,
    result?.speaking?.overallBand,
  );
}

function getCorrectCount(result?: ResultPayload | null) {
  return pickNumber(
    result?.resultSummary?.correctCount,
    result?.totalCorrect,
    result?.correctCount,
    result?.objective?.correctCount,
    result?.objective?.totalCorrect,
    result?.score?.correctCount,
    result?.result?.correctCount,
  );
}

function getQuestionCount(result?: ResultPayload | null) {
  return pickNumber(
    result?.resultSummary?.totalCount,
    result?.totalQuestions,
    result?.questionCount,
    result?.objective?.questionCount,
    result?.objective?.totalQuestions,
    result?.score?.questionCount,
    result?.result?.questionCount,
  );
}

function getRawScore(result?: ResultPayload | null) {
  return pickNumber(
    result?.resultSummary?.rawScore,
    result?.score?.rawScore,
    result?.result?.rawScore,
  );
}

function getSummaryFeedback(result?: ResultPayload | null) {
  const summaryJson = result?.resultSummary?.summaryJson;

  return pickText(
    typeof summaryJson === "string" ? summaryJson : "",
    summaryJson?.summary,
    summaryJson?.feedback,
    result?.feedback?.summary,
    result?.aiFeedback?.summary,
    result?.teacherFeedback?.summary,
    result?.summary?.feedback,
    result?.result?.feedback,
    typeof result?.feedback === "string" ? result.feedback : "",
  );
}

function getSkillScores(result?: ResultPayload | null) {
  const scores = result?.scores || result?.score || result?.result || {};

  return [
    {
      key: "reading",
      label: "Reading",
      icon: BookOpen,
      value: pickNumber(
        scores.reading,
        scores.readingBand,
        result?.objective?.readingBand,
      ),
      detail: pickText(scores.readingDetail, result?.objective?.readingDetail),
      gradient: "from-cyan-500 to-sky-500",
    },
    {
      key: "listening",
      label: "Listening",
      icon: Headphones,
      value: pickNumber(
        scores.listening,
        scores.listeningBand,
        result?.objective?.listeningBand,
      ),
      detail: pickText(
        scores.listeningDetail,
        result?.objective?.listeningDetail,
      ),
      gradient: "from-sky-500 to-blue-500",
    },
    {
      key: "writing",
      label: "Writing",
      icon: PenLine,
      value: pickNumber(
        scores.writing,
        scores.writingBand,
        result?.writing?.overallBand,
      ),
      detail: pickText(scores.writingDetail, result?.writing?.summary),
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      key: "speaking",
      label: "Speaking",
      icon: Mic,
      value: pickNumber(
        scores.speaking,
        scores.speakingBand,
        result?.speaking?.overallBand,
      ),
      detail: pickText(scores.speakingDetail, result?.speaking?.summary),
      gradient: "from-teal-500 to-cyan-500",
    },
  ].filter((item) => item.value !== null || item.detail);
}

function getAttemptTitle(
  attempt: Attempt | null,
  result: ResultPayload | null,
) {
  return (
    (attempt as any)?.test?.title ||
    (attempt as any)?.testTitle ||
    result?.test?.title ||
    (result as any)?.testTitle ||
    attempt?.testId ||
    result?.attemptId ||
    "Bài làm IELTS"
  );
}

function getAccuracy(correct: number | null, total: number | null) {
  if (correct === null || total === null || total <= 0) return null;
  return Math.round((correct / total) * 100);
}

export default function Page({
  params,
}: {
  params: {
    attemptId: string;
  };
}) {
  const attemptId = params.attemptId;

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [result, setResult] = useState<ResultPayload | null>(null);
  const [review, setReview] = useState<ReviewPayload | null>(null);
  const [activeDetailGroupKey, setActiveDetailGroupKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [attemptData, resultData, reviewData] = await Promise.all([
        getAttemptDetail(attemptId),
        getAttemptResult(attemptId),
        getAttemptReview(attemptId).catch(() => null),
      ]);

      setAttempt(attemptData);
      setResult(resultData || {});
      setReview(reviewData || null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải kết quả bài làm",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const overallBand = useMemo(() => getOverallBand(result), [result]);
  const correctCount = useMemo(() => getCorrectCount(result), [result]);
  const questionCount = useMemo(() => getQuestionCount(result), [result]);
  const rawScore = useMemo(() => getRawScore(result), [result]);
  const skillScores = useMemo(() => getSkillScores(result), [result]);
  const resultStatus = result?.status || attempt?.status;
  const title = getAttemptTitle(attempt, result);

  const startedAt =
    result?.startedAt ||
    (attempt as any)?.startedAt ||
    (attempt as any)?.started_at ||
    result?.attempt?.startedAt ||
    null;

  const submittedAt =
    result?.submittedAt ||
    (attempt as any)?.submittedAt ||
    (attempt as any)?.submitted_at ||
    result?.attempt?.submittedAt ||
    null;

  const gradedAt =
    result?.gradedAt ||
    (attempt as any)?.gradedAt ||
    (attempt as any)?.graded_at ||
    null;

  const durationSec =
    pickNumber(
      result?.durationSec,
      result?.timeSpentSec,
      result?.summary?.durationSec,
      result?.result?.durationSec,
    ) ?? calculateDurationFromDates(startedAt, submittedAt);

  const summaryFeedback = getSummaryFeedback(result);
  const accuracy = getAccuracy(correctCount, questionCount);
  const reviewDetails = useMemo(() => buildDetailsFromReview(review), [review]);
  const details = useMemo(
    () => mergeResultAndReviewDetails(result?.detail || [], reviewDetails),
    [result, reviewDetails],
  );
  const detailGroups = useMemo(() => groupResultDetails(details), [details]);
  const activeDetailGroup =
    detailGroups.find((group) => group.key === activeDetailGroupKey) ||
    detailGroups[0] ||
    null;
  const visibleDetails = activeDetailGroup?.details || details;

  useEffect(() => {
    if (!detailGroups.length) return;

    if (!detailGroups.some((group) => group.key === activeDetailGroupKey)) {
      setActiveDetailGroupKey(detailGroups[0].key);
    }
  }, [activeDetailGroupKey, detailGroups]);

  const isReady =
    resultStatus === "GRADED" ||
    attempt?.status === "GRADED" ||
    overallBand !== null ||
    correctCount !== null ||
    Boolean(result?.resultSummary);

  if (loading) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-5">
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan-100 bg-cyan-50 text-cyan-700">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">
            Đang tải kết quả bài làm...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-5">
        <Card className="max-w-lg rounded-[34px] border border-white/70 bg-white/80 p-7 text-center shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <AlertTriangle className="mx-auto h-12 w-12 text-rose-600" />
          <h1 className="mt-4 font-serif text-3xl font-black text-slate-950">
            Không thể tải kết quả
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/learner/attempts">
              <Button variant="outline" className="rounded-2xl">
                Quay lại lịch sử
              </Button>
            </Link>
            <Button onClick={loadData} className="rounded-2xl">
              <RefreshCcw className="h-4 w-4" />
              Thử lại
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-5">
        <Card className="max-w-xl rounded-[34px] border border-white/70 bg-white/80 p-7 text-center shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <Clock className="mx-auto h-12 w-12 text-cyan-700" />
          <h1 className="mt-4 font-serif text-3xl font-black text-slate-950">
            Kết quả chưa sẵn sàng
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Bài làm đang được xử lý. Bạn có thể theo dõi tiến độ chấm bài ở
            trang trạng thái.
          </p>
          <Link href={`/learner/attempts/${attemptId}/status`}>
            <Button className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
              Xem trạng thái chấm bài
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-6xl space-y-7 px-5 py-8 md:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-20 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <Link
        href="/learner/attempts"
        className="relative inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-cyan-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại lịch sử làm bài
      </Link>

      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-7 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl md:p-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <div className="relative grid gap-7 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <Badge tone={getStatusTone(resultStatus)}>
              {statusLabel(resultStatus)}
            </Badge>

            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight text-slate-950 md:text-5xl">
              {title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Kết quả tổng hợp từ điểm khách quan, AI và review giáo viên nếu
              có.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
              <span className="rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2">
                Bắt đầu: {formatDateTime(startedAt)}
              </span>
              <span className="rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2">
                Nộp: {formatDateTime(submittedAt)}
              </span>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
                Chấm: {formatDateTime(gradedAt)}
              </span>
            </div>
          </div>

          <div className="rounded-[32px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6 text-center shadow-[0_18px_50px_rgba(14,165,233,0.12)]">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
              Overall band
            </p>
            <p className="mt-3 font-serif text-6xl font-black text-slate-950">
              {formatBand(overallBand)}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              {accuracy !== null
                ? `${accuracy}% độ chính xác`
                : "Band ước tính"}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-4">
        {[
          {
            label: "Câu đúng",
            value:
              correctCount !== null && questionCount !== null
                ? `${correctCount}/${questionCount}`
                : "—",
            icon: CheckCircle2,
            gradient: "from-cyan-500 to-sky-500",
          },
          {
            label: "Raw score",
            value: rawScore ?? "—",
            icon: Target,
            gradient: "from-sky-500 to-blue-500",
          },
          {
            label: "Thời gian",
            value: formatDuration(durationSec),
            icon: Clock,
            gradient: "from-blue-500 to-indigo-500",
          },
          {
            label: "Chi tiết",
            value: details.length,
            icon: BarChart3,
            gradient: "from-teal-500 to-cyan-500",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.label}
              className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl"
            >
              <div
                className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-2 font-serif text-3xl font-black text-slate-950">
                {item.value}
              </p>
            </Card>
          );
        })}
      </div>

      {skillScores.length ? (
        <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-6 md:p-8">
            <h2 className="font-serif text-3xl font-black text-slate-950">
              Điểm theo kỹ năng
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {skillScores.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className="rounded-[28px] border border-cyan-100 bg-white/75 p-5"
                  >
                    <div
                      className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 font-black text-slate-900">
                      {item.label}
                    </p>
                    <p className="mt-2 font-serif text-4xl font-black text-cyan-700">
                      {formatBand(item.value)}
                    </p>
                    {item.detail ? (
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {item.detail}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {summaryFeedback ? (
        <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-cyan-700" />
              <h2 className="font-serif text-3xl font-black text-slate-950">
                Nhận xét tổng quan
              </h2>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {summaryFeedback}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {details.length ? (
        <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
                  Answer detail
                </p>
                <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
                  Chi tiết câu trả lời
                </h2>
                {activeDetailGroup ? (
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Đang xem: {activeDetailGroup.label} ·{" "}
                    {activeDetailGroup.details.length} câu
                  </p>
                ) : null}
              </div>

              <Link href={`/learner/attempts/${attemptId}/review`}>
                <Button
                  variant="outline"
                  className="rounded-2xl border-cyan-200 bg-white/80 text-sky-700"
                >
                  Xem review đầy đủ
                </Button>
              </Link>
            </div>

            {detailGroups.length > 1 ? (
              <div className="mt-6 flex gap-2 overflow-x-auto rounded-[28px] border border-cyan-100 bg-cyan-50/50 p-2">
                {detailGroups.map((group) => {
                  const active = group.key === activeDetailGroup?.key;

                  return (
                    <button
                      key={group.key}
                      type="button"
                      onClick={() => setActiveDetailGroupKey(group.key)}
                      className={`min-w-[150px] rounded-2xl border px-4 py-3 text-left transition ${
                        active
                          ? "border-cyan-300 bg-white text-cyan-700 shadow-sm"
                          : "border-transparent bg-white/40 text-slate-500 hover:border-cyan-200 hover:bg-white/80"
                      }`}
                    >
                      <span className="block text-sm font-black">
                        {group.label}
                      </span>
                      <span className="mt-1 block text-xs font-semibold">
                        {getDetailAnsweredLabel(group.details)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-[26px] border border-cyan-100">
              <div className="hidden grid-cols-[80px_1fr_1fr_110px] border-b border-cyan-100 bg-cyan-50/70 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500 md:grid">
                <span>Câu</span>
                <span>Trả lời</span>
                <span>Đáp án</span>
                <span>Kết quả</span>
              </div>

              <div className="divide-y divide-cyan-100 bg-white/70">
                {visibleDetails.map((item, index) => {
                  const userAnswer = getDetailUserAnswer(item);
                  const correctAnswer = getDetailCorrectAnswer(item);
                  const unanswered = isBlankAnswer(userAnswer);
                  const correctState = getDetailCorrectState(
                    item,
                    userAnswer,
                    correctAnswer,
                  );
                  const correct = !unanswered && correctState === true;

                  return (
                    <div
                      key={getDetailKey(item, index)}
                      className="grid gap-3 px-5 py-4 md:grid-cols-[80px_1fr_1fr_110px] md:items-center"
                    >
                      <span className="font-black text-slate-900">
                        {item.qNo || index + 1}
                      </span>

                      <p className="text-sm font-semibold text-slate-600">
                        {answerToText(userAnswer)}
                      </p>

                      <p className="text-sm font-semibold text-cyan-700">
                        {answerToText(correctAnswer)}
                      </p>

                      <div>
                        {unanswered ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-black text-slate-500">
                            Chưa trả lời
                          </span>
                        ) : correct ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Đúng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700">
                            <XCircle className="h-3.5 w-3.5" />
                            Sai
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
