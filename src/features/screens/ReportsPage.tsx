"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Loader2,
  Mic,
  PenLine,
  RefreshCw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { AttemptsAnalyticsTable } from "@/components/reports/AttemptsAnalyticsTable";
import { BandDistributionChart } from "@/components/reports/BandDistributionChart";
import { OverviewCards } from "@/components/reports/OverviewCards";
import { ReportTabs } from "@/components/reports/ReportTabs";
import { SkillBreakdownChart } from "@/components/reports/SkillBreakdownChart";
import { TimelineChart } from "@/components/reports/TimelineChart";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { getMyAttempts } from "@/lib/api/attempts.api";
import { getErrorMessage } from "@/lib/api/client";
import { getLearnerOverview } from "@/lib/api/reports.api";

type AttemptRow = Record<string, any>;

type OverviewPayload = {
  totalAttempts?: number;
  total_attempts?: number;
  completedAttempts?: number;
  completed_attempts?: number;
  gradedAttempts?: number;
  graded_attempts?: number;
  averageBand?: number;
  average_band?: number;
  bestBand?: number;
  best_band?: number;
  studyStreak?: number;
  study_streak?: number;
  totalPracticeMinutes?: number;
  total_practice_minutes?: number;
  lastPracticeAt?: string | null;
  last_practice_at?: string | null;
};

type SkillKey = "READING" | "LISTENING" | "WRITING" | "SPEAKING";

const skillMeta: Record<
  SkillKey,
  {
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    soft: string;
    text: string;
  }
> = {
  READING: {
    label: "Reading",
    shortLabel: "R",
    icon: BookOpen,
    gradient: "from-cyan-500 to-sky-500",
    soft: "bg-cyan-50 text-cyan-700 border-cyan-100",
    text: "text-cyan-700",
  },
  LISTENING: {
    label: "Listening",
    shortLabel: "L",
    icon: Headphones,
    gradient: "from-sky-500 to-blue-500",
    soft: "bg-sky-50 text-sky-700 border-sky-100",
    text: "text-sky-700",
  },
  WRITING: {
    label: "Writing",
    shortLabel: "W",
    icon: PenLine,
    gradient: "from-blue-500 to-indigo-500",
    soft: "bg-blue-50 text-blue-700 border-blue-100",
    text: "text-blue-700",
  },
  SPEAKING: {
    label: "Speaking",
    shortLabel: "S",
    icon: Mic,
    gradient: "from-teal-500 to-cyan-500",
    soft: "bg-teal-50 text-teal-700 border-teal-100",
    text: "text-teal-700",
  },
};

function extractItems(payload: unknown): AttemptRow[] {
  if (Array.isArray(payload)) return payload;

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, any>;

    if (Array.isArray(record.items)) return record.items;
    if (Array.isArray(record.data)) return record.data;

    if (record.data && typeof record.data === "object") {
      if (Array.isArray(record.data.items)) return record.data.items;
      if (Array.isArray(record.data.data)) return record.data.data;
    }
  }

  return [];
}

function extractOverview(payload: unknown): OverviewPayload {
  if (!payload || typeof payload !== "object") return {};

  const record = payload as Record<string, any>;

  if (
    record.data &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
  ) {
    return record.data;
  }

  return record;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getAttemptDate(attempt: AttemptRow) {
  return (
    attempt.gradedAt ||
    attempt.graded_at ||
    attempt.submittedAt ||
    attempt.submitted_at ||
    attempt.startedAt ||
    attempt.started_at ||
    attempt.createdAt ||
    attempt.created_at ||
    attempt.updatedAt ||
    attempt.updated_at ||
    null
  );
}

function normalizeSkill(attempt: AttemptRow): SkillKey | null {
  const raw = String(
    attempt.mode ||
      attempt.test?.type ||
      attempt.skill ||
      attempt.partLabel ||
      attempt.part_label ||
      "",
  ).toUpperCase();

  if (raw.includes("READING")) return "READING";
  if (raw.includes("LISTENING")) return "LISTENING";
  if (raw.includes("WRITING")) return "WRITING";
  if (raw.includes("SPEAKING")) return "SPEAKING";

  return null;
}

function getTeacherReviewBand(submission: any): number | null {
  if (!submission) return null;

  const reviews = [
    submission.review,
    submission.teacherReview,
    submission.teacher_review,
    ...(Array.isArray(submission.teacherReviews)
      ? submission.teacherReviews
      : []),
    ...(Array.isArray(submission.teacher_reviews)
      ? submission.teacher_reviews
      : []),
  ].filter(Boolean);

  for (const review of reviews) {
    const band =
      toNumber(review.overallBand) ??
      toNumber(review.overall_band) ??
      toNumber(review.bandScore) ??
      toNumber(review.band_score) ??
      toNumber(review.score);

    if (band !== null) return band;
  }

  return null;
}

function getAttemptBand(attempt: AttemptRow): number | null {
  const direct =
    toNumber(attempt.overallBand) ??
    toNumber(attempt.overall_band) ??
    toNumber(attempt.bandScore) ??
    toNumber(attempt.band_score) ??
    toNumber(attempt.bandEstimate) ??
    toNumber(attempt.band_estimate) ??
    toNumber(attempt.score) ??
    toNumber(attempt.rawScore) ??
    toNumber(attempt.raw_score);

  if (direct !== null) return direct;

  const resultCandidates = [
    attempt.result,
    attempt.results,
    attempt.attemptResult,
    attempt.attempt_result,
    ...(Array.isArray(attempt.attemptResults) ? attempt.attemptResults : []),
    ...(Array.isArray(attempt.attempt_results) ? attempt.attempt_results : []),
  ].filter(Boolean);

  for (const result of resultCandidates) {
    const band =
      toNumber(result.overallBand) ??
      toNumber(result.overall_band) ??
      toNumber(result.bandScore) ??
      toNumber(result.band_score) ??
      toNumber(result.bandEstimate) ??
      toNumber(result.band_estimate) ??
      toNumber(result.score) ??
      toNumber(result.rawScore) ??
      toNumber(result.raw_score);

    if (band !== null) return band;
  }

  const submissionCandidates = [
    attempt.teacherSubmission,
    attempt.teacher_submission,
    ...(Array.isArray(attempt.teacherSubmissions)
      ? attempt.teacherSubmissions
      : []),
    ...(Array.isArray(attempt.teacher_submissions)
      ? attempt.teacher_submissions
      : []),
  ].filter(Boolean);

  for (const submission of submissionCandidates) {
    const band = getTeacherReviewBand(submission);
    if (band !== null) return band;
  }

  return null;
}

function isCompleted(attempt: AttemptRow) {
  const status = String(attempt.status || "").toUpperCase();

  return ["SUBMITTED", "GRADING", "GRADED", "EXPIRED"].includes(status);
}

function isGraded(attempt: AttemptRow) {
  return (
    String(attempt.status || "").toUpperCase() === "GRADED" ||
    getAttemptBand(attempt) !== null
  );
}

function getAttemptTitle(attempt: AttemptRow) {
  return (
    attempt.test?.title ||
    attempt.testTitle ||
    attempt.test_title ||
    attempt.title ||
    "Bài luyện IELTS"
  );
}

function roundBand(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(1).replace(".0", "");
}

function minutesFromAttempt(attempt: AttemptRow) {
  const direct =
    toNumber(attempt.practiceMinutes) ??
    toNumber(attempt.practice_minutes) ??
    toNumber(attempt.durationMinutes) ??
    toNumber(attempt.duration_minutes);

  if (direct !== null) return direct;

  const started =
    attempt.startedAt ||
    attempt.started_at ||
    attempt.createdAt ||
    attempt.created_at;
  const ended =
    attempt.submittedAt ||
    attempt.submitted_at ||
    attempt.gradedAt ||
    attempt.graded_at ||
    attempt.updatedAt ||
    attempt.updated_at;

  if (!started || !ended) return 0;

  const startTime = new Date(started).getTime();
  const endTime = new Date(ended).getTime();

  if (
    !Number.isFinite(startTime) ||
    !Number.isFinite(endTime) ||
    endTime <= startTime
  ) {
    return 0;
  }

  return Math.round((endTime - startTime) / 60000);
}

function computeAverage(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildSkillData(attempts: AttemptRow[]) {
  return (Object.keys(skillMeta) as SkillKey[]).map((skill) => {
    const skillAttempts = attempts.filter(
      (attempt) => normalizeSkill(attempt) === skill,
    );
    const bands = skillAttempts
      .map(getAttemptBand)
      .filter((value): value is number => value !== null);

    const average = computeAverage(bands);

    return {
      key: skill,
      label: skillMeta[skill].label,
      shortLabel: skillMeta[skill].shortLabel,
      average: average ?? 0,
      displayAverage: average,
      count: skillAttempts.length,
      gradedCount: bands.length,
      gradient: skillMeta[skill].gradient,
      text: skillMeta[skill].text,
    };
  });
}

function buildTimelineData(attempts: AttemptRow[]) {
  return attempts
    .map((attempt) => ({
      id: attempt.id,
      date: getAttemptDate(attempt),
      skill: normalizeSkill(attempt),
      band: getAttemptBand(attempt),
      title: getAttemptTitle(attempt),
    }))
    .filter((item) => item.date && item.band !== null)
    .sort(
      (a, b) =>
        new Date(a.date as string).getTime() -
        new Date(b.date as string).getTime(),
    )
    .slice(-8)
    .map((item, index) => ({
      label: `Lần ${index + 1}`,
      date: item.date,
      band: item.band as number,
      skill: item.skill,
      title: item.title,
    }));
}

function buildBandDistribution(attempts: AttemptRow[]) {
  const bands = attempts
    .map(getAttemptBand)
    .filter((value): value is number => value !== null);

  const labels = ["<5", "5.0", "5.5", "6.0", "6.5", "7.0", "7.5", "8+"];

  const counts = labels.map((label) => ({ label, count: 0 }));

  bands.forEach((band) => {
    if (band < 5) counts[0].count += 1;
    else if (band >= 8) counts[7].count += 1;
    else {
      const rounded = Math.round(band * 2) / 2;
      const label = rounded.toFixed(1);
      const index = labels.indexOf(label);
      if (index >= 0) counts[index].count += 1;
    }
  });

  return counts;
}

export function ReportsPage({ title = "Tiến độ học tập" }: { title?: string }) {
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);
  const [overview, setOverview] = useState<OverviewPayload>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [overviewPayload, attemptsPayload] = await Promise.all([
        getLearnerOverview().catch(() => ({})),
        getMyAttempts({ limit: 100 } as any),
      ]);

      setOverview(extractOverview(overviewPayload));
      setAttempts(extractItems(attemptsPayload));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sortedAttempts = useMemo(
    () =>
      [...attempts].sort(
        (a, b) =>
          new Date(getAttemptDate(b) || 0).getTime() -
          new Date(getAttemptDate(a) || 0).getTime(),
      ),
    [attempts],
  );

  const gradedBands = useMemo(
    () =>
      attempts
        .map(getAttemptBand)
        .filter((value): value is number => value !== null),
    [attempts],
  );

  const skillData = useMemo(() => buildSkillData(attempts), [attempts]);
  const timelineData = useMemo(() => buildTimelineData(attempts), [attempts]);
  const bandDistribution = useMemo(
    () => buildBandDistribution(attempts),
    [attempts],
  );

  const totalAttempts =
    overview.totalAttempts ?? overview.total_attempts ?? attempts.length;

  const completedAttempts =
    overview.completedAttempts ??
    overview.completed_attempts ??
    attempts.filter(isCompleted).length;

  const gradedAttempts =
    overview.gradedAttempts ??
    overview.graded_attempts ??
    attempts.filter(isGraded).length;

  const averageBand =
    overview.averageBand ??
    overview.average_band ??
    computeAverage(gradedBands);

  const bestBand =
    overview.bestBand ??
    overview.best_band ??
    (gradedBands.length ? Math.max(...gradedBands) : null);

  const totalPracticeMinutes =
    overview.totalPracticeMinutes ??
    overview.total_practice_minutes ??
    attempts.reduce((sum, attempt) => sum + minutesFromAttempt(attempt), 0);

  const completionRate = totalAttempts
    ? Math.round((completedAttempts / totalAttempts) * 100)
    : 0;

  const overviewItems = [
    {
      label: "Tổng bài luyện",
      value: totalAttempts,
      suffix: "bài",
      icon: FileText,
      helper: `${completedAttempts} bài đã hoàn tất`,
      gradient: "from-cyan-500 to-sky-500",
    },
    {
      label: "Band trung bình",
      value: roundBand(averageBand),
      icon: Target,
      helper: `${gradedAttempts} bài có điểm`,
      gradient: "from-sky-500 to-blue-500",
    },
    {
      label: "Band cao nhất",
      value: roundBand(bestBand),
      icon: Trophy,
      helper: "Mốc tốt nhất hiện tại",
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      label: "Thời gian luyện",
      value: Math.round(totalPracticeMinutes),
      suffix: "phút",
      icon: Clock3,
      helper: `${completionRate}% tỉ lệ hoàn tất`,
      gradient: "from-teal-500 to-cyan-500",
    },
  ];

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div className="relative flex min-h-[360px] flex-col items-center justify-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-3xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-[0_18px_45px_rgba(14,165,233,0.16)]">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h2 className="mt-5 font-serif text-3xl font-black text-slate-950">
            Đang tải tiến độ
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            IELTSBF đang tổng hợp dữ liệu luyện tập của bạn.
          </p>
        </div>
      </div>
    );
  }

  if (error && !attempts.length) {
    return (
      <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-rose-100 bg-rose-50 text-rose-600">
            <RefreshCw className="h-7 w-7" />
          </div>
          <h2 className="mt-5 font-serif text-3xl font-black text-slate-950">
            Chưa tải được báo cáo
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>
          <Button
            onClick={loadData}
            className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]"
          >
            <RefreshCw className="h-4 w-4" />
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-cyan-300/18 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-72 h-96 w-96 rounded-full bg-blue-300/18 blur-3xl"
      />

      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/75 p-7 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl md:p-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Learner analytics
            </p>

            <h1 className="mt-5 font-serif text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              {title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Theo dõi quá trình luyện IELTS, band score, độ đều giữa 4 kỹ năng
              và các bài làm gần đây của bạn.
            </p>
          </div>

          <div className="grid min-w-[260px] gap-3 rounded-[28px] border border-cyan-100 bg-white/80 p-5 shadow-[0_18px_50px_rgba(14,165,233,0.12)]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-500">
                Tỉ lệ hoàn tất
              </span>
              <span className="text-sm font-black text-cyan-700">
                {completionRate}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-sky-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_8px_20px_rgba(14,165,233,0.30)] transition-all duration-700"
                style={{ width: `${Math.min(100, completionRate)}%` }}
              />
            </div>

            <Link
              href="/learner/tests"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-black text-white shadow-[0_14px_34px_rgba(14,165,233,0.26)] transition hover:-translate-y-0.5 hover:gap-3"
            >
              Luyện thêm đề
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <OverviewCards items={overviewItems} />

      {!attempts.length ? (
        <Card className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-8 text-center shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent>
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan-100 bg-cyan-50 text-cyan-700">
              <BarChart3 className="h-7 w-7" />
            </div>
            <h2 className="mt-5 font-serif text-3xl font-black text-slate-950">
              Chưa có dữ liệu tiến độ
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
              Hoàn thành một bài Reading, Listening, Writing hoặc Speaking để
              IELTSBF bắt đầu xây dựng báo cáo học tập cá nhân cho bạn.
            </p>
            <Link href="/learner/tests">
              <Button className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]">
                Bắt đầu luyện đề
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <ReportTabs
            items={[
              {
                key: "overview",
                label: "Tổng quan",
                icon: CheckCircle2,
                active: true,
              },
              {
                key: "skills",
                label: "Kỹ năng",
                icon: Target,
              },
              {
                key: "history",
                label: "Lịch sử",
                icon: FileText,
              },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
            <SkillBreakdownChart data={skillData} />
            <BandDistributionChart data={bandDistribution} />
          </div>

          <TimelineChart data={timelineData} />

          <AttemptsAnalyticsTable attempts={sortedAttempts.slice(0, 8)} />
        </>
      )}
    </div>
  );
}
