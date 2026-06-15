"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Layers,
  Loader2,
  Mic,
  PenLine,
  RefreshCcw,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from "lucide-react";

import { getMyAttempts } from "@/lib/api/attempts.api";
import { getLearnerOverview } from "@/lib/api/reports.api";
import { getTests } from "@/lib/api/tests.api";
import { useAuthStore } from "@/store/auth.store";
import { displayName, type Attempt, type Test, type TestType } from "@/types";

type DashboardState = {
  tests: Test[];
  attempts: Attempt[];
  overview: Record<string, any>;
};

function unwrapItems<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

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

function unwrapObject(payload: unknown) {
  if (!payload || typeof payload !== "object") return {};
  const record = payload as Record<string, any>;

  if (
    record.data &&
    typeof record.data === "object" &&
    !Array.isArray(record.data)
  ) {
    return record.data as Record<string, any>;
  }

  return record;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
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

function statusClassName(status?: string) {
  if (status === "GRADED")
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "IN_PROGRESS")
    return "border-cyan-100 bg-cyan-50 text-cyan-700";
  if (status === "ERROR" || status === "EXPIRED")
    return "border-rose-100 bg-rose-50 text-rose-700";
  return "border-amber-100 bg-amber-50 text-amber-700";
}

function testTypeLabel(type?: string) {
  const map: Record<string, string> = {
    FULL: "Full Test",
    READING: "Reading",
    LISTENING: "Listening",
    WRITING: "Writing",
    SPEAKING: "Speaking",
  };

  return type ? map[type] || type : "IELTS";
}

function skillIcon(type?: string) {
  if (type === "LISTENING") return Headphones;
  if (type === "WRITING") return PenLine;
  if (type === "SPEAKING") return Mic;
  if (type === "FULL") return FileText;
  return BookOpen;
}
function getSectionCount(test: Test) {
  return test.sections?.length || 0;
}

function testCountLabel(test: Test) {
  const count = getSectionCount(test);

  if (test.type === "WRITING") return `${count || 2} task`;
  if (test.type === "SPEAKING") return `${count || 3} part`;
  if (test.type === "LISTENING") return `${count || 4} section`;
  if (test.type === "READING") return `${count || 3} passage`;
  if (test.type === "FULL") return count ? `${count} phần` : "Full test";

  return count ? `${count} phần` : "Theo cấu trúc đề";
}

function bandLabel(level?: number | string | null) {
  if (level === null || level === undefined || level === "") {
    return "Mọi band";
  }

  return `Band ${level}`;
}

function testCardAccent(type?: string) {
  if (type === "LISTENING") return "from-sky-400/24 via-blue-300/12 to-white";
  if (type === "WRITING") return "from-blue-400/24 via-indigo-300/12 to-white";
  if (type === "SPEAKING") return "from-teal-400/24 via-cyan-300/12 to-white";
  if (type === "READING") return "from-cyan-400/24 via-sky-300/12 to-white";
  return "from-cyan-400/24 via-blue-300/12 to-white";
}
function getAttemptDate(attempt: Attempt) {
  return (
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

function getBand(attempt: Attempt) {
  const value =
    attempt.overallBand ??
    attempt.bandScore ??
    attempt.score ??
    (attempt as any).result?.overallBand ??
    (attempt as any).result?.bandScore ??
    null;

  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }

  return Number(value);
}

function formatBand(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return Number(value).toFixed(1).replace(".0", "");
}

function buildTimeline(attempts: Attempt[]) {
  const map = new Map<string, number>();

  attempts.forEach((attempt) => {
    const raw = getAttemptDate(attempt);
    if (!raw) return;

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return;

    const label = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);

    map.set(label, (map.get(label) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .slice(-7);
}

function getAttemptAction(attempt: Attempt) {
  if (attempt.status === "IN_PROGRESS") {
    return {
      label: "Tiếp tục",
      href: `/learner/attempts/${attempt.id}/session`,
    };
  }

  if (attempt.status === "SUBMITTED" || attempt.status === "GRADING") {
    return {
      label: "Trạng thái",
      href: `/learner/attempts/${attempt.id}/status`,
    };
  }

  if (attempt.status === "GRADED") {
    return {
      label: "Kết quả",
      href: `/learner/attempts/${attempt.id}/result`,
    };
  }

  return {
    label: "Chi tiết",
    href: `/learner/attempts/${attempt.id}`,
  };
}

function TestCard({ test }: { test: Test }) {
  const Icon = skillIcon(test.type);

  return (
    <Link
      href={`/learner/tests/${test.id}`}
      className="group relative overflow-hidden rounded-[28px] border border-cyan-100 bg-white/80 p-5 shadow-[0_18px_60px_rgba(14,165,233,0.08)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_28px_80px_rgba(14,165,233,0.18)]"
    >
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/18 blur-3xl transition group-hover:bg-blue-300/24"
      />

      <div className="relative flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-cyan-700">
          <Icon className="h-4 w-4" />
          {testTypeLabel(test.type)}
        </span>

        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {bandLabel(test.level)}
        </span>
      </div>

      <h3 className="relative mt-5 line-clamp-2 font-serif text-2xl font-black leading-tight text-slate-950 transition group-hover:text-cyan-700">
        {test.title}
      </h3>

      <p className="relative mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
        {test.description || "Đề luyện thi IELTS đã được xuất bản."}
      </p>

      <div className="relative mt-5 flex items-center justify-between border-t border-cyan-100/70 pt-4 text-xs font-bold text-slate-500">
        <span>{testCountLabel(test)}</span>
        <span className="inline-flex items-center gap-1 text-cyan-700 transition group-hover:gap-2">
          Vào chi tiết
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

export default function Page() {
  const user = useAuthStore((state) => state.user);

  const [data, setData] = useState<DashboardState>({
    tests: [],
    attempts: [],
    overview: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [testsPayload, attemptsPayload, overviewPayload] =
        await Promise.all([
          getTests({ limit: 6 }),
          getMyAttempts({ limit: 100 }),
          getLearnerOverview().catch(() => ({})),
        ]);

      setData({
        tests: unwrapItems<Test>(testsPayload),
        attempts: unwrapItems<Attempt>(attemptsPayload),
        overview: unwrapObject(overviewPayload),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const attempts = data.attempts;
  const overview = data.overview;

  const completedAttempts =
    overview.completedAttempts ??
    overview.completed_attempts ??
    overview.completedTests ??
    attempts.filter((attempt) =>
      ["SUBMITTED", "GRADING", "GRADED"].includes(String(attempt.status)),
    ).length;

  const inProgressCount = attempts.filter(
    (attempt) => attempt.status === "IN_PROGRESS",
  ).length;

  const bands = attempts
    .map(getBand)
    .filter((value): value is number => value !== null);

  const averageBand =
    overview.averageBand ??
    overview.average_band ??
    (bands.length
      ? bands.reduce((sum, value) => sum + value, 0) / bands.length
      : null);

  const bestBand =
    overview.bestBand ??
    overview.best_band ??
    (bands.length ? Math.max(...bands) : null);

  const timeline = useMemo(() => buildTimeline(attempts), [attempts]);
  const maxTimeline = Math.max(...timeline.map((item) => item.value), 1);

  const recentAttempts = [...attempts]
    .sort(
      (a, b) =>
        new Date(getAttemptDate(b) || 0).getTime() -
        new Date(getAttemptDate(a) || 0).getTime(),
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="relative grid min-h-[520px] place-items-center overflow-hidden rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl"
        />
        <div className="relative text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-cyan-100 bg-cyan-50 text-cyan-700">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h1 className="mt-5 font-serif text-3xl font-black text-slate-950">
            Đang tải bảng điều khiển
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            IELTSBF đang tổng hợp dữ liệu học tập của bạn.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[520px] place-items-center rounded-[36px] border border-white/70 bg-white/80 p-8 text-center shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl">
        <div>
          <RefreshCcw className="mx-auto h-12 w-12 text-rose-600" />
          <h1 className="mt-4 font-serif text-3xl font-black text-slate-950">
            Không thể tải dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <button
            onClick={loadDashboard}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-sm font-black text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]"
            type="button"
          >
            <RefreshCcw className="h-4 w-4" />
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative space-y-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-36 -top-24 h-96 w-96 rounded-full bg-cyan-300/18 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-96 h-96 w-96 rounded-full bg-blue-300/18 blur-3xl"
      />

      <section className="relative overflow-hidden rounded-[38px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <div className="relative grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
          <div className="bg-[linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:32px_32px] p-7 md:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Bảng điều khiển học viên
            </p>

            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              Xin chào, {displayName(user)}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Sẵn sàng cho buổi luyện tập hôm nay? Bạn có thể làm đề công khai,
              xem lịch học, theo dõi lớp học và kiểm tra tiến độ cá nhân tại
              đây.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/learner/tests"
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 text-sm font-black text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] transition hover:-translate-y-0.5 hover:gap-3"
              >
                Luyện đề ngay
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/learner/reports"
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-cyan-200 bg-white/80 px-5 text-sm font-black text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
              >
                Xem tiến độ
                <BarChart3 className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-7 text-white md:p-10">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl"
            />
            <p className="relative text-xs font-black uppercase tracking-[0.24em] text-cyan-100">
              Tổng quan cá nhân
            </p>

            <div className="relative mt-6 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Tổng lượt làm",
                  value:
                    overview.totalAttempts ??
                    overview.total_attempts ??
                    attempts.length,
                },
                {
                  label: "Đã hoàn thành",
                  value: completedAttempts,
                },
                {
                  label: "Đang làm",
                  value: inProgressCount,
                },
                {
                  label: "Band tốt nhất",
                  value: formatBand(bestBand),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/20 bg-white/15 p-4 shadow-[0_18px_40px_rgba(8,47,73,0.16)] backdrop-blur-xl"
                >
                  <p className="font-serif text-4xl font-black">{item.value}</p>
                  <p className="mt-1 text-sm font-semibold text-cyan-50/90">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative mt-5 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-cyan-50/90">
                  Band trung bình
                </span>
                <span className="font-serif text-3xl font-black">
                  {formatBand(averageBand)}
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white shadow-[0_8px_20px_rgba(255,255,255,0.35)]"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, ((Number(averageBand) || 0) / 9) * 100),
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tổng lượt làm",
            value:
              overview.totalAttempts ??
              overview.total_attempts ??
              attempts.length,
            helper: "Tổng số lần bắt đầu luyện đề",
            icon: FileText,
            gradient: "from-cyan-500 to-sky-500",
          },
          {
            label: "Đã nộp bài",
            value: completedAttempts,
            helper: "Đã nộp, đang chấm hoặc đã có kết quả",
            icon: CheckCircle2,
            gradient: "from-sky-500 to-blue-500",
          },
          {
            label: "Band trung bình",
            value: formatBand(averageBand),
            helper: "Điểm trung bình từ các lượt có điểm",
            icon: Star,
            gradient: "from-blue-500 to-indigo-500",
          },
          {
            label: "Band tốt nhất",
            value: formatBand(bestBand),
            helper: "Mức band cao nhất đã ghi nhận",
            icon: TrendingUp,
            gradient: "from-teal-500 to-cyan-500",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="group relative overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_28px_90px_rgba(14,165,233,0.18)]"
            >
              <div
                aria-hidden="true"
                className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-cyan-300/18 blur-3xl"
              />
              <div className="relative">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-[0_16px_35px_rgba(14,165,233,0.25)]`}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-3 font-serif text-4xl font-black text-slate-950">
                  {item.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.helper}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <div className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-cyan-100/80 px-6 py-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
                Đề thi gợi ý
              </p>
              <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
                Luyện tập hôm nay
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Các đề đã được xuất bản để học viên luyện tập.
              </p>
            </div>
            <Link
              href="/learner/tests"
              className="inline-flex items-center gap-1 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-xs font-black text-cyan-700 transition hover:gap-2"
            >
              Xem tất cả
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            {data.tests.length ? (
              data.tests
                .slice(0, 4)
                .map((test) => <TestCard key={test.id} test={test} />)
            ) : (
              <div className="col-span-full rounded-[28px] border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-cyan-700" />
                <h3 className="mt-4 font-serif text-2xl font-black text-slate-950">
                  Chưa có đề công khai
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Khi admin xuất bản đề, đề sẽ hiển thị tại đây.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="border-b border-cyan-100/80 px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
                Practice timeline
              </p>
              <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
                Nhịp độ luyện tập
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Số lượt làm bài theo ngày, tính từ dữ liệu attempt thật.
              </p>
            </div>

            <div className="p-6">
              {timeline.length ? (
                <div className="rounded-[28px] border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/60 p-5">
                  <div className="flex h-64 items-end gap-4">
                    {timeline.map((item) => (
                      <div
                        key={item.label}
                        className="flex flex-1 flex-col items-center gap-3"
                      >
                        <div
                          className="flex w-full max-w-[72px] items-end justify-center rounded-t-3xl bg-gradient-to-t from-cyan-500 to-blue-500 text-xs font-black text-white shadow-[0_14px_30px_rgba(14,165,233,0.20)]"
                          style={{
                            height: `${Math.max(28, (item.value / maxTimeline) * 220)}px`,
                          }}
                        >
                          <span className="mb-3">{item.value}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center">
                  <BarChart3 className="mx-auto h-10 w-10 text-cyan-700" />
                  <p className="mt-4 font-serif text-2xl font-black text-slate-950">
                    Chưa có timeline
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Bắt đầu làm đề để IELTSBF vẽ nhịp độ luyện tập.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="border-b border-cyan-100/80 px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
                Hoạt động gần đây
              </p>
              <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
                Bài làm mới nhất
              </h2>
            </div>

            <div className="space-y-3 p-5">
              {recentAttempts.length ? (
                recentAttempts.map((attempt) => {
                  const action = getAttemptAction(attempt);

                  return (
                    <Link
                      key={attempt.id}
                      href={action.href}
                      className="group block rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50/70"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="line-clamp-1 font-bold text-slate-950">
                            {attempt.test?.title ||
                              attempt.testId ||
                              "Đề thi IELTS"}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {formatDate(getAttemptDate(attempt))}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-black ${statusClassName(attempt.status)}`}
                        >
                          {statusLabel(attempt.status)}
                        </span>
                      </div>

                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-black text-cyan-700 transition group-hover:gap-2">
                        {action.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rounded-[26px] border border-dashed border-cyan-200 bg-cyan-50/60 p-7 text-center">
                  <Clock3 className="mx-auto h-10 w-10 text-cyan-700" />
                  <p className="mt-4 font-serif text-xl font-black text-slate-950">
                    Chưa có hoạt động
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Khi bạn bắt đầu làm đề, hoạt động sẽ hiển thị ở đây.
                  </p>
                </div>
              )}

              <Link
                href="/learner/attempts"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-white/80 text-sm font-black text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                Xem toàn bộ lịch sử
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
