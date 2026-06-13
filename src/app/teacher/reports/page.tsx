"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FilePenLine,
  Headphones,
  RefreshCw,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Waves,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import {
  getTeacherDashboard,
  getTeacherSubmissions,
} from "@/lib/api/teacher.api";

type SubmissionItem = {
  id?: string;
  skill?: "WRITING" | "SPEAKING" | string;
  status?: string;
  claimedBy?: string | null;
  claimed_by?: string | null;
  reviewedAt?: string | null;
  reviewed_at?: string | null;
  submittedAt?: string | null;
  submitted_at?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
  review?: {
    overallBand?: number | string | null;
    overall_band?: number | string | null;
    updatedAt?: string | null;
    updated_at?: string | null;
    createdAt?: string | null;
    created_at?: string | null;
  } | null;
  teacherReview?: {
    overallBand?: number | string | null;
    overall_band?: number | string | null;
  } | null;
  teacher_reviews?: {
    overallBand?: number | string | null;
    overall_band?: number | string | null;
  } | null;
};

type TeacherDashboard = {
  pendingCount?: number;
  pendingSubmissions?: number;
  waitingReviews?: number;
  totalPending?: number;

  claimedCount?: number;
  claimedSubmissions?: number;
  inProgress?: number;
  totalClaimed?: number;

  reviewedCount?: number;
  reviewedSubmissions?: number;
  completedReviews?: number;
  totalReviewed?: number;

  averageBand?: number;
  averageScore?: number;

  writingPending?: number;
  speakingPending?: number;
  writingReviewed?: number;
  speakingReviewed?: number;

  todayReviewed?: number;
  thisWeekReviewed?: number;
};

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value: unknown) {
  return new Intl.NumberFormat("vi-VN").format(toNumber(value));
}

function formatBand(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "—";
  return number.toFixed(1);
}

function pickDashboardNumber(
  source: TeacherDashboard | null,
  keys: Array<keyof TeacherDashboard>,
) {
  if (!source) return 0;

  for (const key of keys) {
    const value = source[key];

    if (value !== undefined && value !== null) {
      return toNumber(value);
    }
  }

  return 0;
}

function extractItems(response: any): SubmissionItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function getReviewDate(item: SubmissionItem) {
  return (
    item.reviewedAt ||
    item.reviewed_at ||
    item.review?.updatedAt ||
    item.review?.updated_at ||
    item.review?.createdAt ||
    item.review?.created_at ||
    item.updatedAt ||
    item.updated_at ||
    null
  );
}

function getReviewBand(item: SubmissionItem) {
  const value =
    item.review?.overallBand ??
    item.review?.overall_band ??
    item.teacherReview?.overallBand ??
    item.teacherReview?.overall_band ??
    item.teacher_reviews?.overallBand ??
    item.teacher_reviews?.overall_band ??
    null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isSameDay(value?: string | null, date = new Date()) {
  if (!value) return false;

  const current = new Date(value);
  if (Number.isNaN(current.getTime())) return false;

  return (
    current.getFullYear() === date.getFullYear() &&
    current.getMonth() === date.getMonth() &&
    current.getDate() === date.getDate()
  );
}

function isWithinThisWeek(value?: string | null) {
  if (!value) return false;

  const current = new Date(value);
  if (Number.isNaN(current.getTime())) return false;

  const now = new Date();
  const start = new Date(now);
  const day = start.getDay() || 7;

  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return current >= start && current < end;
}

function groupReviewedByDate(items: SubmissionItem[]) {
  const map = new Map<string, number>();

  items.forEach((item) => {
    const dateValue = getReviewDate(item);
    if (!dateValue) return;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;

    const label = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);

    map.set(label, (map.get(label) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .slice(-8);
}

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="rounded-[24px] border border-cyan-100 bg-white/80 shadow-sm">
      <CardContent className="p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50/70">
          <Icon className="h-5 w-5 text-cyan-700" />
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-slate-500">
          {label}
        </p>

        <p className="mt-2 font-serif text-4xl font-bold text-slate-950">
          {value}
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}

function BarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  if (!data.length) {
    return (
      <EmptyState
        title="Chưa có dữ liệu báo cáo"
        description="Khi giáo viên bắt đầu chấm bài, nhịp độ xử lý sẽ được hiển thị tại đây."
      />
    );
  }

  return (
    <div className="rounded-[28px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex h-[260px] items-end gap-4 border-b border-cyan-100 pb-5">
        {data.map((item, index) => {
          const height = Math.max(14, (item.value / max) * 210);

          return (
            <div
              key={`${item.label}-${index}`}
              className="flex flex-1 flex-col items-center gap-3"
            >
              <div
                className="flex w-full max-w-[72px] items-end justify-center rounded-t-3xl bg-gradient-to-t from-cyan-500 to-blue-600 px-2 pb-2 text-xs font-black text-white shadow-[0_14px_30px_rgba(14,165,233,0.20)]"
                style={{
                  height,
                  opacity: 0.5 + index * 0.06,
                }}
              >
                {item.value}
              </div>

              <p className="max-w-[80px] truncate text-center text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SkillReportCard({
  icon: Icon,
  title,
  pending,
  reviewed,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  pending: number;
  reviewed: number;
  description: string;
}) {
  const total = pending + reviewed;
  const reviewedPercent = total ? Math.round((reviewed / total) * 100) : 0;

  return (
    <div className="rounded-[28px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50">
          <Icon className="h-5 w-5 text-cyan-700" />
        </div>

        <div className="flex-1">
          <h3 className="font-serif text-xl font-bold text-slate-950">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-cyan-100 bg-white/80 p-4">
          <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
            Chờ chấm
          </p>
          <p className="mt-2 font-serif text-2xl font-black text-slate-950">
            {formatNumber(pending)}
          </p>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-white/80 p-4">
          <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
            Đã chấm
          </p>
          <p className="mt-2 font-serif text-2xl font-black text-slate-950">
            {formatNumber(reviewed)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Tỷ lệ đã xử lý</span>
          <span>{reviewedPercent}%</span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-cyan-50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_8px_20px_rgba(14,165,233,0.25)]"
            style={{ width: `${reviewedPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function TeacherReportsPage() {
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [reviewedSubmissions, setReviewedSubmissions] = useState<
    SubmissionItem[]
  >([]);
  const [allSubmissions, setAllSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [dashboardData, reviewedResponse, allResponse] = await Promise.all([
        getTeacherDashboard(),
        getTeacherSubmissions({
          status: "REVIEWED",
          mine: true,
          limit: 100,
        }),
        getTeacherSubmissions({
          limit: 100,
        }),
      ]);
      setDashboard((dashboardData || {}) as TeacherDashboard);
      setReviewedSubmissions(extractItems(reviewedResponse));
      setAllSubmissions(extractItems(allResponse));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingCount =
    allSubmissions.filter((item) => item.status === "PENDING").length ||
    pickDashboardNumber(dashboard, [
      "pendingCount",
      "pendingSubmissions",
      "waitingReviews",
      "totalPending",
    ]);

  const claimedCount =
    allSubmissions.filter((item) => item.status === "CLAIMED").length ||
    pickDashboardNumber(dashboard, [
      "claimedCount",
      "claimedSubmissions",
      "inProgress",
      "totalClaimed",
    ]);

  const reviewedCount =
    reviewedSubmissions.length ||
    pickDashboardNumber(dashboard, [
      "reviewedCount",
      "reviewedSubmissions",
      "completedReviews",
      "totalReviewed",
    ]);

  const todayReviewed = reviewedSubmissions.filter((item) =>
    isSameDay(getReviewDate(item)),
  ).length;

  const thisWeekReviewed = reviewedSubmissions.filter((item) =>
    isWithinThisWeek(getReviewDate(item)),
  ).length;

  const writingPending = allSubmissions.filter(
    (item) => item.skill === "WRITING" && item.status !== "REVIEWED",
  ).length;

  const speakingPending = allSubmissions.filter(
    (item) => item.skill === "SPEAKING" && item.status !== "REVIEWED",
  ).length;

  const writingReviewed = reviewedSubmissions.filter(
    (item) => item.skill === "WRITING",
  ).length;

  const speakingReviewed = reviewedSubmissions.filter(
    (item) => item.skill === "SPEAKING",
  ).length;

  const averageBand = useMemo(() => {
    const scores = reviewedSubmissions
      .map(getReviewBand)
      .filter((value): value is number => value !== null);

    if (!scores.length) {
      return dashboard?.averageBand ?? dashboard?.averageScore ?? null;
    }

    return scores.reduce((sum, value) => sum + value, 0) / scores.length;
  }, [reviewedSubmissions, dashboard]);

  const chartData = useMemo(
    () => groupReviewedByDate(reviewedSubmissions),
    [reviewedSubmissions],
  );

  const bestDay = useMemo(() => {
    if (!chartData.length) return null;

    return chartData.reduce((best, item) =>
      item.value > best.value ? item : best,
    );
  }, [chartData]);

  if (loading) {
    return <LoadingState label="Đang tải báo cáo giáo viên..." />;
  }

  if (error && !dashboard && !reviewedSubmissions.length) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div className="grid gap-6 p-7 lg:grid-cols-[1fr_360px] lg:p-9">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-700">
              Teacher reports
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Báo cáo giáo viên
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500">
              Theo dõi số bài đã chấm, bài còn đang giữ và nhịp độ xử lý để giáo
              viên chủ động sắp xếp thời gian phản hồi cho học viên.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/teacher/submissions">
                <Button>
                  <FilePenLine className="h-4 w-4" />
                  Vào bài chờ chấm
                </Button>
              </Link>

              <Button variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>

          <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/70 p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50">
              <Sparkles className="h-7 w-7 text-cyan-700" />
            </div>

            <h2 className="mt-5 font-serif text-2xl font-black text-slate-950">
              Tổng quan tuần này
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Số bài đã chấm trong tuần giúp giáo viên nhìn lại nhịp độ làm việc
              và điều chỉnh lịch chấm bài hợp lý hơn.
            </p>

            <div className="mt-5 rounded-2xl border border-cyan-100 bg-white/80 p-4">
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
                Đã chấm tuần này
              </p>
              <p className="mt-2 font-serif text-3xl font-black text-slate-950">
                {formatNumber(thisWeekReviewed)} bài
              </p>
            </div>
          </div>
        </div>
      </section>

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CheckCircle2}
          label="Đã chấm"
          value={formatNumber(reviewedCount)}
          description="Tổng số bài đã được giáo viên gửi điểm và nhận xét."
        />

        <MetricCard
          icon={Timer}
          label="Đang giữ"
          value={formatNumber(claimedCount)}
          description="Các bài giáo viên đã nhận và cần hoàn tất phần chấm."
        />

        <MetricCard
          icon={Clock3}
          label="Chờ chấm"
          value={formatNumber(pendingCount)}
          description="Các bài học viên đã nộp và đang chờ được xử lý."
        />

        <MetricCard
          icon={Star}
          label="Điểm trung bình"
          value={formatBand(averageBand)}
          description="Mức điểm trung bình của các bài đã được chấm."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                  Review rhythm
                </p>
                <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                  Nhịp độ chấm bài gần đây
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Biểu đồ thể hiện số lượng bài đã được xử lý theo từng ngày.
                </p>
              </div>

              <div className="rounded-full border border-cyan-100 bg-cyan-50/70 px-4 py-2 text-sm font-bold text-cyan-700">
                Hôm nay: {formatNumber(todayReviewed)} bài
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <BarChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardHeader>
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Highlights
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
              Điểm nổi bật
            </h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-[28px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50">
                  <TrendingUp className="h-5 w-5 text-cyan-700" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                    Ngày nổi bật
                  </p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {bestDay ? bestDay.label : "—"}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {bestDay
                  ? `Có ${bestDay.value} bài được chấm trong ngày này.`
                  : "Chưa có đủ dữ liệu để xác định ngày nổi bật."}
              </p>
            </div>

            <div className="rounded-[28px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50">
                  <Waves className="h-5 w-5 text-cyan-700" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                    Bài đã chấm hôm nay
                  </p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {formatNumber(todayReviewed)} bài
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Chỉ số này được tính từ thời gian chấm thực tế của từng bài.
              </p>
            </div>

            <Link href="/teacher/submissions">
              <Button variant="outline" className="w-full">
                Xem danh sách bài làm
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardHeader>
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Skill report
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
              Phân bổ theo kỹ năng
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Theo dõi riêng Writing và Speaking để biết kỹ năng nào đang cần
              được ưu tiên.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <SkillReportCard
              icon={BookOpenCheck}
              title="Writing"
              pending={writingPending}
              reviewed={writingReviewed}
              description="Các bài viết cần đọc kỹ nội dung, bố cục, từ vựng và ngữ pháp."
            />

            <SkillReportCard
              icon={Headphones}
              title="Speaking"
              pending={speakingPending}
              reviewed={speakingReviewed}
              description="Các bài nói cần nghe ghi âm, xem transcript và đánh giá theo tiêu chí nói."
            />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-[36px] border border-cyan-200 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 text-white shadow-[0_30px_90px_rgba(14,165,233,0.22)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl"
          />
          <CardContent className="relative p-7">
            <BarChart3 className="h-9 w-9" />

            <h2 className="mt-5 font-serif text-3xl font-black">
              Gợi ý cho giáo viên
            </h2>

            <div className="mt-5 space-y-4 text-sm leading-7 text-white/80">
              <p>
                Khi số bài đang giữ tăng cao, nên ưu tiên hoàn tất các bài đã
                nhận trước khi nhận thêm bài mới.
              </p>

              <p>
                Với Writing, nhận xét nên chỉ ra rõ vấn đề về phát triển ý, liên
                kết đoạn, từ vựng và ngữ pháp.
              </p>

              <p>
                Với Speaking, học viên thường cần góp ý cụ thể về độ trôi chảy,
                cách mở rộng câu trả lời và phát âm.
              </p>
            </div>

            <Link href="/teacher/submissions">
              <button className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-cyan-700 shadow-[0_14px_35px_rgba(8,47,73,0.16)] transition hover:-translate-y-0.5">
                Tiếp tục chấm bài
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
