"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FilePenLine,
  Headphones,
  MessageSquareText,
  PenLine,
  RefreshCw,
  Sparkles,
  Star,
  Timer,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import { getTeacherDashboard } from "@/lib/api/teacher.api";

type TeacherDashboardData = {
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
  writingWaiting?: number;
  writingReviewed?: number;

  speakingPending?: number;
  speakingWaiting?: number;
  speakingReviewed?: number;

  todayReviewed?: number;
  thisWeekReviewed?: number;

  recentSubmissions?: TeacherSubmissionPreview[];
  latestSubmissions?: TeacherSubmissionPreview[];
  submissions?: TeacherSubmissionPreview[];
};

type TeacherSubmissionPreview = {
  id?: string;
  submissionId?: string;
  attemptId?: string;
  studentName?: string;
  student?: {
    fullName?: string | null;
    email?: string | null;
  } | null;
  testTitle?: string;
  test?: {
    title?: string | null;
  } | null;
  skill?: "WRITING" | "SPEAKING" | string;
  status?: string;
  submittedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
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

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function pickNumber(
  data: TeacherDashboardData | null,
  keys: Array<keyof TeacherDashboardData>,
) {
  if (!data) return 0;

  for (const key of keys) {
    const value = data[key];

    if (value !== undefined && value !== null) {
      return toNumber(value);
    }
  }

  return 0;
}

function getRecentSubmissions(data: TeacherDashboardData | null) {
  if (!data) return [];

  return (
    data.recentSubmissions ||
    data.latestSubmissions ||
    data.submissions ||
    []
  ).slice(0, 5);
}

function getStudentName(item: TeacherSubmissionPreview) {
  return (
    item.studentName ||
    item.student?.fullName ||
    item.student?.email ||
    "Học viên"
  );
}

function getTestTitle(item: TeacherSubmissionPreview) {
  return item.testTitle || item.test?.title || "Bài làm IELTS";
}

function getSkillText(skill?: string) {
  if (skill === "WRITING") return "Writing";
  if (skill === "SPEAKING") return "Speaking";
  return "Bài làm";
}

function getStatusText(status?: string) {
  if (status === "PENDING") return "Chờ chấm";
  if (status === "CLAIMED") return "Đang giữ";
  if (status === "REVIEWED") return "Đã chấm";
  return "Cần xem";
}

function getSubmissionHref(item: TeacherSubmissionPreview) {
  const id = item.id || item.submissionId || item.attemptId;

  if (!id) return "/teacher/submissions";

  return `/teacher/submissions/${id}`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <CardContent className="p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50/70">
          <Icon className="h-5 w-5 text-cyan-700" />
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-slate-500">
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

function SkillProgressCard({
  icon: Icon,
  title,
  description,
  pending,
  reviewed,
  href,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  pending: number;
  reviewed: number;
  href: string;
}) {
  const total = pending + reviewed;
  const width = total ? Math.min(100, (pending / total) * 100) : 0;

  return (
    <Link href={href}>
      <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50">
            <Icon className="h-5 w-5 text-cyan-700" />
          </div>

          <div className="flex-1">
            <p className="font-semibold text-slate-950">{title}</p>
            <p className="text-sm leading-6 text-slate-500">{description}</p>
          </div>

          <p className="font-serif text-3xl font-bold text-slate-950">
            {formatNumber(pending)}
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-cyan-50">
          <div
            className="h-full rounded-full bg-moss"
            style={{ width: `${width}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{formatNumber(reviewed)} bài đã chấm</span>
          <span>Xem chi tiết</span>
        </div>
      </div>
    </Link>
  );
}

export function TeacherDashboardCards() {
  const [dashboard, setDashboard] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTeacherDashboard();
      setDashboard((data || {}) as TeacherDashboardData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingCount = pickNumber(dashboard, [
    "pendingCount",
    "pendingSubmissions",
    "waitingReviews",
    "totalPending",
  ]);

  const claimedCount = pickNumber(dashboard, [
    "claimedCount",
    "claimedSubmissions",
    "inProgress",
    "totalClaimed",
  ]);

  const reviewedCount = pickNumber(dashboard, [
    "reviewedCount",
    "reviewedSubmissions",
    "completedReviews",
    "totalReviewed",
  ]);

  const writingPending = pickNumber(dashboard, [
    "writingPending",
    "writingWaiting",
  ]);

  const speakingPending = pickNumber(dashboard, [
    "speakingPending",
    "speakingWaiting",
  ]);

  const writingReviewed = pickNumber(dashboard, ["writingReviewed"]);
  const speakingReviewed = pickNumber(dashboard, ["speakingReviewed"]);

  const averageBand = dashboard?.averageBand ?? dashboard?.averageScore ?? null;

  const recentSubmissions = useMemo(
    () => getRecentSubmissions(dashboard),
    [dashboard],
  );

  if (loading) {
    return <LoadingState label="Đang tải bảng điều khiển giáo viên..." />;
  }

  if (error && !dashboard) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div className="grid gap-6 p-7 lg:grid-cols-[1fr_360px] lg:p-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.24em] text-cyan-700">
              Teacher workspace
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Bảng điều khiển giáo viên
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500">
              Theo dõi bài làm cần chấm, tiếp tục các bài đang giữ và gửi nhận
              xét rõ ràng để học viên biết mình cần cải thiện ở đâu.
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

            <h2 className="mt-5 font-serif text-2xl font-bold text-slate-950">
              Việc nên ưu tiên
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Hãy hoàn tất các bài đang giữ trước khi nhận thêm bài mới. Cách
              này giúp học viên nhận phản hồi đúng lúc và tránh bỏ sót bài làm.
            </p>

            <div className="mt-5 rounded-2xl border border-cyan-100 bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">
                Đang giữ
              </p>
              <p className="mt-2 font-serif text-3xl font-bold text-slate-950">
                {formatNumber(claimedCount)} bài
              </p>
            </div>
          </div>
        </div>
      </section>

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Clock3}
          label="Chờ chấm"
          value={formatNumber(pendingCount)}
          description="Các bài học viên đã nộp và đang chờ giáo viên nhận xét."
        />

        <StatCard
          icon={Timer}
          label="Đang giữ"
          value={formatNumber(claimedCount)}
          description="Các bài giáo viên đã nhận và cần hoàn tất phần chấm."
        />

        <StatCard
          icon={CheckCircle2}
          label="Đã chấm"
          value={formatNumber(reviewedCount)}
          description="Số bài đã được gửi điểm và nhận xét cho học viên."
        />

        <StatCard
          icon={Star}
          label="Điểm trung bình"
          value={formatBand(averageBand)}
          description="Mức điểm trung bình của các bài đã được giáo viên chấm."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
                  Recent work
                </p>
                <h2 className="mt-1 font-serif text-2xl font-bold text-slate-950">
                  Bài làm mới cần theo dõi
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Những bài gần đây nhất để giáo viên có thể xem nhanh và tiếp
                  tục xử lý.
                </p>
              </div>

              <Link href="/teacher/submissions">
                <Button variant="outline">
                  Xem tất cả
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>

          <CardContent>
            {recentSubmissions.length ? (
              <div className="space-y-3">
                {recentSubmissions.map((item, index) => (
                  <Link
                    key={
                      item.id || item.submissionId || item.attemptId || index
                    }
                    href={getSubmissionHref(item)}
                    className="block"
                  >
                    <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 transition hover:bg-cyan-50/80">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                              {getSkillText(item.skill)}
                            </span>
                            <span className="rounded-full border border-cyan-100 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-500">
                              {getStatusText(item.status)}
                            </span>
                          </div>

                          <h3 className="mt-3 font-semibold text-slate-950">
                            {getTestTitle(item)}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            Học viên: {getStudentName(item)}
                          </p>
                        </div>

                        <div className="text-sm text-slate-500 md:text-right">
                          <p>Gửi lúc</p>
                          <p className="mt-1 font-semibold text-slate-950">
                            {formatDate(
                              item.submittedAt ||
                                item.updatedAt ||
                                item.createdAt,
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title="Chưa có bài làm mới"
                description="Khi học viên nộp bài Writing hoặc Speaking, danh sách gần đây sẽ hiển thị tại đây."
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
              Skill focus
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-slate-950">
              Bài cần xử lý theo kỹ năng
            </h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <SkillProgressCard
              icon={BookOpenCheck}
              title="Writing"
              description="Bài viết cần nhận xét"
              pending={writingPending}
              reviewed={writingReviewed}
              href="/teacher/submissions?skill=WRITING"
            />

            <SkillProgressCard
              icon={Headphones}
              title="Speaking"
              description="Bài nói cần nhận xét"
              pending={speakingPending}
              reviewed={speakingReviewed}
              href="/teacher/submissions?skill=SPEAKING"
            />

            <Link href="/teacher/submissions">
              <Button variant="outline" className="w-full">
                Mở danh sách bài làm
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl lg:col-span-2">
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
              Review guide
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-slate-950">
              Quy trình chấm bài gợi ý
            </h2>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                <p className="font-serif text-3xl font-bold text-cyan-700">1</p>
                <h3 className="mt-3 font-semibold text-slate-950">Nhận bài</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Chọn bài phù hợp trong danh sách và nhận chấm để bắt đầu xử
                  lý.
                </p>
              </div>

              <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                <p className="font-serif text-3xl font-bold text-cyan-700">2</p>
                <h3 className="mt-3 font-semibold text-slate-950">
                  Xem bài làm
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Đọc bài viết, nghe bài nói và xem nội dung đề trước khi cho
                  điểm.
                </p>
              </div>

              <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                <p className="font-serif text-3xl font-bold text-cyan-700">3</p>
                <h3 className="mt-3 font-semibold text-slate-950">
                  Gửi nhận xét
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Gửi điểm và góp ý cụ thể để học viên biết bước tiếp theo cần
                  cải thiện.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[26px] border border-cyan-500 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <MessageSquareText className="h-8 w-8" />

            <h2 className="mt-5 font-serif text-2xl font-bold">Lời nhắc nhỏ</h2>

            <p className="mt-3 text-sm leading-7 text-white/80">
              Một nhận xét tốt không chỉ cho điểm, mà còn chỉ ra điểm mạnh, lỗi
              cần sửa và cách học viên có thể làm tốt hơn ở lần sau.
            </p>

            <Link href="/teacher/submissions">
              <button className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-cyan-700">
                Bắt đầu chấm bài
                <PenLine className="h-4 w-4" />
              </button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
