"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Download,
  GraduationCap,
  PieChart,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  Users,
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
import { getErrorMessage } from "@/lib/api/client";
import {
  getAdminAttempts,
  getAdminOverview,
  getAdminTests,
  getAdminUsers,
  getBandsDistribution,
  getTeacherGrading,
  type AdminAttemptReportItem,
  type AdminOverviewReport,
  type AdminTestReportItem,
  type AdminUserReportItem,
  type BandDistributionItem,
  type TeacherGradingReportItem,
} from "@/lib/api/reports.api";

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("vi-VN").format(toNumber(value));
}

function formatPercent(value?: number | null) {
  return `${toNumber(value).toFixed(0)}%`;
}

function formatBand(value?: number | null) {
  if (value === null || value === undefined) return "—";
  return toNumber(value).toFixed(1);
}

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function getMonthLabel(
  item: AdminAttemptReportItem | AdminUserReportItem,
  index: number,
) {
  return item.label || item.month || item.date || `Tháng ${index + 1}`;
}

function getAttemptValue(item: AdminAttemptReportItem) {
  return (
    item.count ??
    item.total ??
    item.attempts ??
    item.completed ??
    item.submitted ??
    0
  );
}

function getUserValue(item: AdminUserReportItem) {
  return item.count ?? item.total ?? item.users ?? item.learners ?? 0;
}

function exportCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header] ?? "";
          const text = String(value).replaceAll('"', '""');
          return `"${text}"`;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
}) {
  return (
    <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50/70">
            <Icon className="h-5 w-5 text-cyan-700" />
          </div>

          {change ? (
            <span className="rounded-xl bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">
              {change}
            </span>
          ) : null}
        </div>

        <p className="mt-5 text-xs font-black uppercase tracking-[.18em] text-slate-500">
          {label}
        </p>
        <p className="mt-2 font-serif text-3xl font-black text-slate-950">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function BarChartBlock({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl font-black text-slate-950">
            {title}
          </h2>
          <span className="rounded-xl bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[.14em] text-cyan-700">
            6 tháng
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex h-[250px] items-end gap-4 border-t border-cyan-100 pt-6">
          {data.map((item, index) => {
            const height = Math.max(12, (item.value / max) * 190);

            return (
              <div
                key={`${item.label}-${index}`}
                className="flex flex-1 flex-col items-center gap-3"
              >
                <div
                  className="w-full max-w-[70px] rounded-t-xl bg-gradient-to-t from-cyan-500 to-blue-600"
                  style={{
                    height,
                    opacity: 0.35 + index * 0.08,
                  }}
                  title={`${item.label}: ${item.value}`}
                />
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function DonutChartBlock({
  title,
  data,
}: {
  title: string;
  data: Array<{ label: string; value: number }>;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const first = data[0]?.value || 0;
  const firstPercent = total ? Math.round((first / total) * 100) : 0;

  return (
    <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <CardHeader>
        <h2 className="font-serif text-2xl font-black text-slate-950">
          {title}
        </h2>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-center">
          <div
            className="relative h-44 w-44 rounded-full"
            style={{
              background: `conic-gradient(var(--color-primary, #40583f) 0 ${firstPercent}%, #c77f6b ${firstPercent}% 60%, #8a6b3f 60% 78%, #7d857a 78% 100%)`,
            }}
          >
            <div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white/80">
              <p className="font-serif text-3xl font-black text-slate-950">
                100%
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">
                Tổng thể
              </p>
            </div>
          </div>

          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            {data.map((item, index) => (
              <div
                key={`${item.label}-${index}`}
                className="flex items-center gap-2 text-sm text-slate-950"
              >
                <span
                  className="h-3 w-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                  style={{ opacity: 0.45 + index * 0.12 }}
                />
                <span>{item.label}</span>
                <span className="ml-auto text-slate-500">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminReportsPage() {
  const [overview, setOverview] = useState<AdminOverviewReport | null>(null);
  const [attempts, setAttempts] = useState<AdminAttemptReportItem[]>([]);
  const [tests, setTests] = useState<AdminTestReportItem[]>([]);
  const [users, setUsers] = useState<AdminUserReportItem[]>([]);
  const [teacherGrading, setTeacherGrading] = useState<
    TeacherGradingReportItem[]
  >([]);
  const [bands, setBands] = useState<BandDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        overviewData,
        attemptsData,
        testsData,
        usersData,
        teacherGradingData,
        bandsData,
      ] = await Promise.all([
        getAdminOverview(),
        getAdminAttempts(),
        getAdminTests(),
        getAdminUsers(),
        getTeacherGrading(),
        getBandsDistribution(),
      ]);

      setOverview(overviewData || {});
      setAttempts(safeArray<AdminAttemptReportItem>(attemptsData));
      setTests(safeArray<AdminTestReportItem>(testsData));
      setUsers(safeArray<AdminUserReportItem>(usersData));
      setTeacherGrading(
        safeArray<TeacherGradingReportItem>(teacherGradingData),
      );
      setBands(safeArray<BandDistributionItem>(bandsData));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const userGrowthData = useMemo(() => {
    return users
      .slice(0, 6)
      .map((item, index) => ({
        label: getMonthLabel(item, index),
        value: getUserValue(item),
      }))
      .slice(-6);
  }, [users]);

  const attemptDistribution = useMemo(() => {
    const grouped = new Map<string, number>();

    attempts.forEach((item) => {
      const label = item.skill || item.testType || item.status || "Khác";
      grouped.set(label, (grouped.get(label) || 0) + getAttemptValue(item));
    });

    return Array.from(grouped.entries())
      .map(([label, value]) => ({
        label,
        value,
      }))
      .slice(0, 4);
  }, [attempts]);

  const filteredTeachers = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) return teacherGrading;

    return teacherGrading.filter((item) =>
      `${item.teacherName || ""} ${item.fullName || ""} ${item.email || ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [teacherGrading, keyword]);

  const filteredTests = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) return tests;

    return tests.filter((item) =>
      `${item.title || ""} ${item.type || ""} ${item.status || ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [tests, keyword]);

  const bandRows = useMemo(() => {
    return bands;
  }, [bands]);

  if (loading) {
    return <LoadingState label="Đang tải báo cáo..." />;
  }

  if (error && !overview) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Reports"
        title="Báo cáo & Thống kê"
        description="Theo dõi hiệu suất, hoạt động học tập, đề thi và dữ liệu chấm bài của hệ thống."
        actions={
          <>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>

            <Button
              onClick={() =>
                exportCsv("ieltsbf-report.csv", [
                  {
                    totalUsers:
                      overview?.totalUsers ?? overview?.totalLearners ?? 0,
                    totalTests: overview?.totalTests ?? 0,
                    totalAttempts: overview?.totalAttempts ?? 0,
                    completedAttempts: overview?.completedAttempts ?? 0,
                    averageBand: overview?.averageBand ?? 0,
                  },
                ])
              }
            >
              <Download className="h-4 w-4" />
              Xuất báo cáo
            </Button>
          </>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Tổng học viên"
          value={formatNumber(
            overview?.totalUsers ?? overview?.totalLearners ?? 0,
          )}
          change={
            overview?.usersGrowth ? `+${overview.usersGrowth}%` : undefined
          }
        />

        <MetricCard
          icon={CheckCircle2}
          label="Lượt thi hoàn thành"
          value={formatNumber(
            overview?.completedAttempts ?? overview?.gradedAttempts ?? 0,
          )}
          change={
            overview?.attemptsGrowth
              ? `+${overview.attemptsGrowth}%`
              : undefined
          }
        />

        <MetricCard
          icon={Target}
          label="Tỷ lệ hoàn thành"
          value={formatPercent(
            overview?.completionRate ?? overview?.passRate ?? 0,
          )}
        />

        <MetricCard
          icon={BookOpen}
          label="Tổng đề thi"
          value={formatNumber(overview?.totalTests ?? 0)}
          change={
            overview?.testsGrowth ? `+${overview.testsGrowth}%` : undefined
          }
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        {userGrowthData.length ? (
          <BarChartBlock title="Tăng trưởng người dùng" data={userGrowthData} />
        ) : (
          <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <CardContent className="p-6">
              <EmptyState
                title="Chưa có dữ liệu tăng trưởng"
                description="Chưa có dữ liệu thống kê người dùng theo thời gian."
              />
            </CardContent>
          </Card>
        )}

        {attemptDistribution.length ? (
          <DonutChartBlock title="Phân bổ kỹ năng" data={attemptDistribution} />
        ) : (
          <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <CardContent className="p-6">
              <EmptyState
                title="Chưa có dữ liệu kỹ năng"
                description="Chưa ghi nhận lượt làm bài theo kỹ năng."
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                  Teacher grading
                </p>
                <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                  Hiệu suất giáo viên
                </h2>
              </div>

              <div className="relative w-full lg:w-[280px]">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="pl-9"
                  placeholder="Tìm giáo viên, đề thi..."
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredTeachers.length ? (
              <div className="overflow-hidden rounded-2xl border border-cyan-100">
                <table className="w-full min-w-[760px] border-collapse bg-white/80 text-sm">
                  <thead className="bg-cyan-50/70 text-left">
                    <tr className="border-b border-cyan-100">
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Tên giáo viên
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Đã chấm
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Đang giữ
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Điểm TB
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTeachers.map((teacher, index) => {
                      const name =
                        teacher.teacherName ||
                        teacher.fullName ||
                        teacher.email ||
                        `Giáo viên ${index + 1}`;

                      return (
                        <tr
                          key={teacher.teacherId || teacher.email || index}
                          className="border-b border-cyan-100 last:border-b-0"
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50 text-xs font-bold text-cyan-700">
                                {name.slice(0, 1).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-950">
                                  {name}
                                </p>
                                {teacher.email ? (
                                  <p className="text-xs text-slate-500">
                                    {teacher.email}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top font-semibold text-amber-700">
                            {formatNumber(teacher.reviewed ?? 0)} bài
                          </td>

                          <td className="px-4 py-4 align-top text-slate-950">
                            {formatNumber(
                              teacher.claimed ?? teacher.pending ?? 0,
                            )}{" "}
                            bài
                          </td>

                          <td className="px-4 py-4 align-top text-slate-950">
                            {formatBand(
                              teacher.averageScore ?? teacher.averageBand,
                            )}
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className="rounded-xl bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                              {teacher.status || "Đang hoạt động"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Chưa có dữ liệu giáo viên"
                description="Hệ thống chưa ghi nhận dữ liệu chấm bài của giáo viên."
              />
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardHeader>
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Bands
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
              Phân bổ band điểm
            </h2>
          </CardHeader>

          <CardContent>
            {bandRows.length ? (
              <div className="space-y-4">
                {bandRows.map((item, index) => {
                  const label =
                    item.label ||
                    `Band ${item.band ?? item.score ?? index + 1}`;
                  const value = item.count ?? item.total ?? 0;
                  const max = Math.max(
                    ...bandRows.map((row) => row.count ?? row.total ?? 0),
                    1,
                  );
                  const width = Math.max(8, (value / max) * 100);

                  return (
                    <div key={`${label}-${index}`}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-950">
                          {label}
                        </span>
                        <span className="text-slate-500">{value}</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-cyan-50">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                title="Chưa có dữ liệu band điểm"
                description="Chưa có dữ liệu phân bổ band điểm."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Test performance
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                Hiệu suất đề thi
              </h2>
            </div>

            <Button
              variant="outline"
              onClick={() =>
                exportCsv(
                  "ieltsbf-tests-report.csv",
                  filteredTests.map((item) => ({
                    title: item.title,
                    type: item.type,
                    status: item.status,
                    attempts: item.attempts,
                    completedAttempts: item.completedAttempts,
                    averageBand: item.averageBand,
                  })),
                )
              }
            >
              <Download className="h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {filteredTests.length ? (
            <div className="overflow-hidden rounded-2xl border border-cyan-100">
              <table className="w-full min-w-[900px] border-collapse bg-white/80 text-sm">
                <thead className="bg-cyan-50/70 text-left">
                  <tr className="border-b border-cyan-100">
                    <th className="px-4 py-3 font-semibold text-slate-950">
                      Tên đề
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-950">
                      Loại
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-950">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-950">
                      Lượt làm
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-950">
                      Hoàn thành
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-950">
                      Band TB
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTests.map((test, index) => (
                    <tr
                      key={test.id || index}
                      className="border-b border-cyan-100 last:border-b-0"
                    >
                      <td className="px-4 py-4 align-top font-semibold text-slate-950">
                        {test.title || `Đề thi ${index + 1}`}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-950">
                        {test.type || "—"}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-950">
                        {test.status || "—"}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-950">
                        {formatNumber(test.attempts ?? 0)}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-950">
                        {formatNumber(test.completedAttempts ?? 0)}
                      </td>
                      <td className="px-4 py-4 align-top text-slate-950">
                        {formatBand(test.averageBand)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Chưa có dữ liệu đề thi"
              description="Hệ thống chưa ghi nhận lượt làm đề hoặc thống kê đề thi."
            />
          )}
        </CardContent>
      </Card>

      <div className="mt-16 border-t border-cyan-100 py-8 text-xs uppercase tracking-[.2em] text-slate-500">
        © 2026 IELTSBF Admin Panel. All rights reserved.
      </div>
    </div>
  );
}
