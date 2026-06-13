"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileStack,
  GraduationCap,
  Inbox,
  Loader2,
  Newspaper,
  Plus,
  RefreshCcw,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Tags,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import {
  getAdminAttempts,
  getAdminOverview,
  getAdminTests,
  getAdminUsers,
  getBandsDistribution,
  getTeacherGrading,
} from "@/lib/api/reports.api";

type DashboardData = {
  overview: any;
  attempts: any;
  tests: any;
  users: any;
  teacherGrading: any;
  bandsDistribution: any;
};

function asArray<T = any>(value: any): T[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.results)) return value.results;
  return [];
}

function pickNumber(...values: any[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (
      typeof value === "string" &&
      value.trim() &&
      !Number.isNaN(Number(value))
    ) {
      return Number(value);
    }
  }
  return null;
}

function pickText(...values: any[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return "";
}

function formatNumber(value: any) {
  const number = pickNumber(value);
  if (number === null) return "—";
  return new Intl.NumberFormat("vi-VN").format(number);
}

function formatPercent(value: any) {
  const number = pickNumber(value);
  if (number === null) return "—";
  return `${number}%`;
}

function formatDateTime(value?: string | null) {
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

function getOverviewValue(overview: any, keys: string[], fallback?: any) {
  for (const key of keys) {
    const value = overview?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return fallback;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  href,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: any;
  tone?: "default" | "warning" | "success" | "danger" | "info";
  href?: string;
}) {
  const toneClass: Record<string, string> = {
    default: "bg-primarySoft text-moss",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    info: "bg-muted text-ink",
  };

  const borderClass: Record<string, string> = {
    default: "border-line",
    warning: "border-warning/30",
    success: "border-success/30",
    danger: "border-danger/30",
    info: "border-line",
  };

  const content = (
    <Card className={`group overflow-hidden ${borderClass[tone]}`}>
      <CardContent className="relative p-5">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-moss/5 transition group-hover:scale-125" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
              {label}
            </p>

            <p className="mt-4 font-serif text-4xl font-bold leading-none text-ink">
              {value}
            </p>

            <p className="mt-3 text-sm leading-6 text-neutralText">{hint}</p>
          </div>

          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneClass[tone]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        {href ? (
          <div className="relative mt-4 flex items-center gap-1 text-xs font-semibold text-moss opacity-0 transition group-hover:opacity-100">
            Xem chi tiết
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );

  if (!href) return content;

  return <Link href={href}>{content}</Link>;
}

function MiniTrendChart({ data }: { data: any[] }) {
  const values = data.map(
    (item) =>
      pickNumber(
        item.count,
        item.total,
        item.attempts,
        item.submitted,
        item.created,
        item.value,
      ) ?? 0,
  );

  const max = Math.max(...values, 1);

  if (!data.length) {
    return (
      <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-line bg-paper">
        <div className="text-center">
          <BarChart3 className="mx-auto h-9 w-9 text-neutralText" />
          <p className="mt-3 font-semibold text-ink">Chưa có dữ liệu biểu đồ</p>
          <p className="mt-1 text-sm text-neutralText">
            Khi có attempt mới, xu hướng hoạt động sẽ hiển thị tại đây.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-72 rounded-2xl border border-line bg-paper p-5">
      <div className="flex h-full items-end gap-2">
        {data.slice(-14).map((item, index) => {
          const value = values[index] ?? 0;
          const height = Math.max(10, Math.round((value / max) * 100));

          return (
            <div
              key={index}
              className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"
            >
              <div
                className="rounded-t-xl bg-moss/80 transition hover:bg-moss"
                style={{ height: `${height}%` }}
                title={`${value}`}
              />
              <p className="truncate text-center text-[10px] text-neutralText">
                {pickText(item.date, item.day, item.label) || index + 1}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  tone = "default",
}: {
  label: string;
  value: number;
  total: number;
  tone?: "default" | "warning" | "danger" | "success";
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  const colorClass: Record<string, string> = {
    default: "bg-moss",
    warning: "bg-warning",
    danger: "bg-danger",
    success: "bg-success",
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-sm text-neutralText">
          {formatNumber(value)} / {formatNumber(total)}
        </p>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div
          className={`h-full rounded-full ${colorClass[tone]}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}

function EmptyBlock({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-paper p-5 text-center">
      <Icon className="mx-auto h-8 w-8 text-neutralText" />
      <p className="mt-3 font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-neutralText">{description}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData>({
    overview: null,
    attempts: null,
    tests: null,
    users: null,
    teacherGrading: null,
    bandsDistribution: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [
        overview,
        attempts,
        tests,
        users,
        teacherGrading,
        bandsDistribution,
      ] = await Promise.allSettled([
        getAdminOverview(),
        getAdminAttempts(),
        getAdminTests(),
        getAdminUsers(),
        getTeacherGrading(),
        getBandsDistribution(),
      ]);

      setData({
        overview: overview.status === "fulfilled" ? overview.value : null,
        attempts: attempts.status === "fulfilled" ? attempts.value : null,
        tests: tests.status === "fulfilled" ? tests.value : null,
        users: users.status === "fulfilled" ? users.value : null,
        teacherGrading:
          teacherGrading.status === "fulfilled" ? teacherGrading.value : null,
        bandsDistribution:
          bandsDistribution.status === "fulfilled"
            ? bandsDistribution.value
            : null,
      });

      const failed = [
        overview,
        attempts,
        tests,
        users,
        teacherGrading,
        bandsDistribution,
      ].filter((item) => item.status === "rejected").length;

      if (failed >= 4) {
        setError(
          "Không thể tải phần lớn dữ liệu dashboard. Vui lòng kiểm tra backend reports.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải dashboard admin",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const overview = data.overview || {};

  const attemptRows = asArray(data.attempts);
  const testRows = asArray(data.tests);
  const userRows = asArray(data.users);
  const teacherRows = asArray(data.teacherGrading);
  const bandRows = asArray(data.bandsDistribution);

  const trendRows = asArray(
    data.attempts?.timeline ||
      data.attempts?.trend ||
      data.attempts?.daily ||
      data.attempts,
  );

  const totalUsers =
    getOverviewValue(overview, ["totalUsers", "usersCount", "userCount"]) ??
    userRows.length;

  const totalTests =
    getOverviewValue(overview, ["totalTests", "testsCount", "testCount"]) ??
    testRows.length;

  const publishedTests =
    getOverviewValue(overview, ["publishedTests", "publicTests"]) ??
    testRows.filter((item) => item.status === "PUBLISHED").length;

  const draftTests =
    getOverviewValue(overview, ["draftTests"]) ??
    testRows.filter((item) => item.status === "DRAFT").length;

  const pendingReviews =
    getOverviewValue(overview, [
      "pendingReviews",
      "pendingSubmissions",
      "teacherPending",
      "pendingTeacherReviews",
    ]) ??
    teacherRows.reduce(
      (sum, item) => sum + (pickNumber(item.pending, item.pendingCount) ?? 0),
      0,
    );

  const activeAttempts =
    getOverviewValue(overview, ["activeAttempts", "inProgressAttempts"]) ??
    attemptRows.filter((item) => item.status === "IN_PROGRESS").length;

  const submittedToday =
    getOverviewValue(overview, [
      "attemptsToday",
      "todayAttempts",
      "submittedToday",
    ]) ??
    attemptRows.filter((item) => {
      const date =
        item.submittedAt ||
        item.submitted_at ||
        item.startedAt ||
        item.started_at;
      if (!date) return false;
      const d = new Date(date);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    }).length;

  const avgBand =
    getOverviewValue(overview, ["avgBandScore", "averageBand", "avgBand"]) ??
    null;

  const bankTotal =
    getOverviewValue(overview, [
      "bankItems",
      "contentItems",
      "totalBankItems",
    ]) ?? "4 kỹ năng";

  const aiPending =
    getOverviewValue(overview, [
      "aiPending",
      "pendingAiJobs",
      "pendingGradingJobs",
    ]) ?? attemptRows.filter((item) => item.status === "GRADING").length;

  const recentActivities = asArray(
    overview.recentActivities ||
      overview.activity ||
      data.attempts?.recentActivities ||
      data.tests?.recentActivities,
  );

  const quickActions = [
    {
      title: "Tạo đề thi thủ công",
      desc: "Ghép Reading, Listening, Writing, Speaking từ ngân hàng đề.",
      href: "/admin/tests/new",
      icon: BookOpenCheck,
    },
    {
      title: "Thêm Reading set",
      desc: "Tạo passage, câu hỏi và đáp án cho ngân hàng Reading.",
      href: "/admin/reading-sets",
      icon: FileStack,
    },
    {
      title: "Quản lý tag",
      desc: "Chuẩn hóa tag theo kỹ năng, level và chủ đề.",
      href: "/admin/tags",
      icon: Tags,
    },
    {
      title: "Cài đặt thời gian",
      desc: "Điều chỉnh tham số làm bài theo từng kỹ năng.",
      href: "/admin/system-config",
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="IELTSBF Admin"
        title="Bảng điều khiển quản trị"
        description="Theo dõi tình trạng hệ thống IELTSBF: đề thi, ngân hàng đề, người dùng và hoạt động chấm bài."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={loadDashboard}>
              <RefreshCcw className="h-4 w-4" />
              Làm mới
            </Button>

            <Link href="/admin/tests/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo đề thi
              </Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <Card>
          <CardContent className="grid min-h-[360px] place-items-center p-8">
            <div className="text-center">
              <Loader2 className="mx-auto h-9 w-9 animate-spin text-moss" />
              <p className="mt-3 text-sm text-neutralText">
                Đang tải dữ liệu quản trị...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!loading && error ? (
        <Card className="border-danger/30">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="flex-1">
              <h3 className="font-serif text-2xl font-bold text-ink">
                Có lỗi khi tải dashboard
              </h3>
              <p className="mt-1 text-sm leading-6 text-neutralText">{error}</p>
              <Button className="mt-4" onClick={loadDashboard}>
                <RefreshCcw className="h-4 w-4" />
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {!loading ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard
              label="Người dùng"
              value={formatNumber(totalUsers)}
              hint="Tài khoản học viên, giáo viên và admin"
              icon={Users}
              href="/admin/users"
            />

            <StatCard
              label="Đề công khai"
              value={`${formatNumber(publishedTests)}/${formatNumber(totalTests)}`}
              hint="Đề đã publish trên hệ thống"
              icon={BookOpenCheck}
              tone="success"
              href="/admin/tests"
            />

            <StatCard
              label="Ngân hàng đề"
              value={formatNumber(bankTotal)}
              hint="Kho nội dung cho 4 kỹ năng IELTS"
              icon={FileStack}
              href="/admin/reading-sets"
            />

            <StatCard
              label="Bài chờ chấm"
              value={formatNumber(pendingReviews)}
              hint="Writing/Speaking cần giáo viên xử lý"
              icon={Inbox}
              tone={Number(pendingReviews) > 0 ? "warning" : "success"}
              href="/teacher/reviews"
            />

            <StatCard
              label="Attempt hôm nay"
              value={formatNumber(submittedToday)}
              hint={`${formatNumber(activeAttempts)} bài đang làm`}
              icon={Clock3}
              tone="info"
              href="/admin/reports"
            />

            <StatCard
              label="Band trung bình"
              value={avgBand !== null ? avgBand : "—"}
              hint="Ước tính từ các bài đã chấm"
              icon={TrendingUp}
              tone="default"
              href="/admin/reports"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-ink">
                      Xu hướng hoạt động
                    </h2>
                    <p className="mt-1 text-sm text-neutralText">
                      Lượt tạo/nộp bài trong các ngày gần đây.
                    </p>
                  </div>

                  <Badge tone="sage">
                    <CalendarDays className="h-3.5 w-3.5" />
                    14 ngày gần nhất
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <MiniTrendChart data={trendRows} />
              </CardContent>
            </Card>

            <Card className="border-warning/30">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-ink">
                      Cần xử lý
                    </h2>
                    <p className="mt-1 text-sm text-neutralText">
                      Những điểm nghẽn vận hành cần admin theo dõi.
                    </p>
                  </div>

                  <Sparkles className="h-6 w-6 text-warning" />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="rounded-2xl border border-line bg-paper p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">Bài chờ giáo viên</p>
                    <Badge
                      tone={Number(pendingReviews) > 0 ? "warning" : "success"}
                    >
                      {formatNumber(pendingReviews)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-neutralText">
                    Writing/Speaking đã nộp nhưng chưa review xong.
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-paper p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">
                      AI grading đang chờ
                    </p>
                    <Badge tone={Number(aiPending) > 0 ? "warning" : "success"}>
                      {formatNumber(aiPending)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-neutralText">
                    Kiểm tra worker nếu số lượng pending tăng bất thường.
                  </p>
                </div>

                <div className="rounded-2xl border border-line bg-paper p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink">Đề còn nháp</p>
                    <Badge tone={Number(draftTests) > 0 ? "sage" : "success"}>
                      {formatNumber(draftTests)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-neutralText">
                    Có thể hoàn thiện và publish để học viên luyện tập.
                  </p>
                </div>

                <Link href="/admin/reports">
                  <Button variant="outline" className="w-full">
                    Xem báo cáo chi tiết
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
            <Card>
              <CardHeader>
                <h2 className="font-serif text-3xl font-bold text-ink">
                  Phân bố band điểm
                </h2>
                <p className="mt-1 text-sm text-neutralText">
                  Tỷ lệ kết quả đã chấm theo khoảng band.
                </p>
              </CardHeader>

              <CardContent className="space-y-5">
                {bandRows.length > 0 ? (
                  bandRows.map((item, index) => {
                    const label =
                      pickText(
                        item.label,
                        item.bandRange,
                        item.range,
                        item.name,
                      ) || `Nhóm ${index + 1}`;

                    const value =
                      pickNumber(
                        item.percent,
                        item.percentage,
                        item.value,
                        item.count,
                      ) ?? 0;

                    const total =
                      pickNumber(item.total, item.max) ??
                      (value <= 100 ? 100 : Math.max(value, 1));

                    return (
                      <ProgressRow
                        key={label}
                        label={label}
                        value={value}
                        total={total}
                        tone={
                          index === 0
                            ? "success"
                            : index >= 3
                              ? "warning"
                              : "default"
                        }
                      />
                    );
                  })
                ) : (
                  <EmptyBlock
                    icon={BarChart3}
                    title="Chưa có dữ liệu band"
                    description="Khi có bài được chấm, phân bố band sẽ hiển thị tại đây."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-3xl font-bold text-ink">
                      Tình trạng đề thi
                    </h2>
                    <p className="mt-1 text-sm text-neutralText">
                      Theo dõi số lượng đề public và đề đang nháp.
                    </p>
                  </div>

                  <Link href="/admin/tests">
                    <Button variant="outline">
                      Quản lý đề thi
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                <ProgressRow
                  label="Đề đã xuất bản"
                  value={Number(publishedTests) || 0}
                  total={Number(totalTests) || 0}
                  tone="success"
                />

                <ProgressRow
                  label="Đề đang nháp"
                  value={Number(draftTests) || 0}
                  total={Number(totalTests) || 0}
                  tone="warning"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  {["READING", "LISTENING", "WRITING", "SPEAKING"].map(
                    (type) => {
                      const count = testRows.filter(
                        (item) => item.type === type,
                      ).length;

                      const labelMap: Record<string, string> = {
                        READING: "Reading",
                        LISTENING: "Listening",
                        WRITING: "Writing",
                        SPEAKING: "Speaking",
                      };

                      return (
                        <div
                          key={type}
                          className="rounded-2xl border border-line bg-paper p-4"
                        >
                          <p className="text-xs font-bold uppercase tracking-[.18em] text-sage">
                            {labelMap[type]}
                          </p>
                          <p className="mt-2 font-serif text-3xl font-bold text-ink">
                            {formatNumber(count)}
                          </p>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <h2 className="font-serif text-3xl font-bold text-ink">
                  Hiệu suất chấm bài
                </h2>
                <p className="mt-1 text-sm text-neutralText">
                  Theo dõi khối lượng review của giáo viên.
                </p>
              </CardHeader>

              <CardContent>
                {teacherRows.length > 0 ? (
                  <div className="overflow-hidden rounded-2xl border border-line">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-paper">
                        <tr className="text-left text-xs uppercase tracking-[.14em] text-sage">
                          <th className="px-4 py-3">Giáo viên</th>
                          <th className="px-4 py-3">Chờ chấm</th>
                          <th className="px-4 py-3">Đã chấm</th>
                          <th className="px-4 py-3">SLA</th>
                        </tr>
                      </thead>

                      <tbody>
                        {teacherRows.slice(0, 6).map((item, index) => (
                          <tr
                            key={item.id || item.teacherId || index}
                            className="border-t border-line"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-full bg-primarySoft text-sm font-bold text-moss">
                                  {pickText(
                                    item.initials,
                                    item.name,
                                    item.teacherName,
                                  )
                                    .slice(0, 1)
                                    .toUpperCase() || "G"}
                                </div>
                                <div>
                                  <p className="font-semibold text-ink">
                                    {pickText(
                                      item.name,
                                      item.teacherName,
                                      item.email,
                                    ) || "Giáo viên"}
                                  </p>
                                  <p className="text-xs text-neutralText">
                                    {pickText(item.email, item.role) ||
                                      "IELTS Examiner"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-neutralText">
                              {formatNumber(
                                pickNumber(item.pending, item.pendingCount) ??
                                  0,
                              )}
                            </td>
                            <td className="px-4 py-3 text-neutralText">
                              {formatNumber(
                                pickNumber(item.reviewed, item.reviewedCount) ??
                                  0,
                              )}
                            </td>
                            <td className="px-4 py-3 text-neutralText">
                              {pickText(
                                item.avgSla,
                                item.sla,
                                item.averageSla,
                              ) || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyBlock
                    icon={GraduationCap}
                    title="Chưa có dữ liệu giáo viên"
                    description="Khi giáo viên nhận và chấm bài, hiệu suất sẽ được tổng hợp tại đây."
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-serif text-3xl font-bold text-ink">
                  Hoạt động gần đây
                </h2>
                <p className="mt-1 text-sm text-neutralText">
                  Các thay đổi mới nhất trong hệ thống.
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.slice(0, 6).map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex gap-3 rounded-2xl border border-line bg-paper p-4"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-semibold text-ink">
                          {pickText(item.title, item.name, item.action) ||
                            "Hoạt động hệ thống"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-neutralText">
                          {pickText(
                            item.description,
                            item.message,
                            item.detail,
                          ) || "Một hoạt động mới vừa được ghi nhận."}
                        </p>
                        <p className="mt-1 text-xs text-neutralText">
                          {formatDateTime(
                            item.createdAt || item.created_at || item.time,
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-3 rounded-2xl border border-line bg-paper p-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-ink">
                          Dashboard đã sẵn sàng
                        </p>
                        <p className="mt-1 text-sm leading-6 text-neutralText">
                          Các hoạt động publish đề, tạo user và chấm bài sẽ được
                          hiển thị khi backend trả log.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 rounded-2xl border border-line bg-paper p-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primarySoft text-moss">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-ink">
                          Gợi ý tiếp theo
                        </p>
                        <p className="mt-1 text-sm leading-6 text-neutralText">
                          Hoàn thiện Cài đặt tham số để đồng bộ thời gian làm
                          bài giữa frontend và backend.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <Card className="paper-texture">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-ink">
                    Truy cập nhanh
                  </h2>
                  <p className="mt-1 text-sm text-neutralText">
                    Các nghiệp vụ admin thường dùng trong quá trình vận hành.
                  </p>
                </div>

                <Button variant="outline">
                  <Download className="h-4 w-4" />
                  Xuất báo cáo
                </Button>
              </div>
            </CardHeader>

            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {quickActions.map(({ title, desc, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-2xl border border-line bg-surface p-5 transition hover:border-moss/40 hover:bg-primarySoft/60"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primarySoft text-moss">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-serif text-xl font-bold text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutralText">
                    {desc}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-moss opacity-0 transition group-hover:opacity-100">
                    Mở chức năng
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
