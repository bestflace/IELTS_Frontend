"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Headphones,
  History,
  Layers,
  Mic,
  PenLine,
  Plus,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { Badge } from "@/components/common/Badge";
import { DataTable } from "@/components/common/DataTable";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAuthStore } from "@/store/auth.store";
import { displayName, type Test, type TestType, type Attempt } from "@/types";
import { safeArray, formatDate } from "@/lib/utils";
import { getTests } from "@/lib/api/tests.api";
import { getAttemptResult, getMyAttempts } from "@/lib/api/attempts.api";
import { getLearnerOverview } from "@/lib/api/reports.api";

type TestTab = "ALL" | TestType;
const tabs: { key: TestTab; label: string; icon: any }[] = [
  { key: "ALL", label: "Tất cả", icon: FileText },
  { key: "LISTENING", label: "Listening", icon: Headphones },
  { key: "READING", label: "Reading", icon: BookOpen },
  { key: "SPEAKING", label: "Speaking", icon: Mic },
  { key: "WRITING", label: "Writing", icon: PenLine },
];

function SkillIcon({ type }: { type?: string }) {
  const Icon =
    type === "LISTENING"
      ? Headphones
      : type === "SPEAKING"
        ? Mic
        : type === "WRITING"
          ? PenLine
          : BookOpen;
  return <Icon className="h-4 w-4" />;
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

function attemptStatusLabel(status?: string) {
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

function attemptStatusTone(status?: string) {
  if (status === "GRADED") return "success";
  if (status === "ERROR" || status === "EXPIRED") return "danger";
  if (status === "IN_PROGRESS") return "sage";
  return "warning";
}

const mockClasses = [
  {
    title: "IELTS Intensive Writing",
    teacher: "GV: Thầy Minh Quân",
    place: "Phòng A302",
    status: "Đang diễn ra",
  },
  {
    title: "Speaking Masterclass",
    teacher: "GV: Ms. Sarah",
    place: "Online",
    status: "Bắt đầu lúc 19:30",
  },
];

const todaySchedule = [
  {
    time: "14:00",
    title: "IELTS Writing Task 2",
    note: "Luyện outline và viết body paragraph.",
  },
  {
    time: "19:30",
    title: "Speaking Part 1 & 2",
    note: "Ghi âm câu trả lời và tự review.",
  },
];
export function LearnerVietnameseHome() {
  const user = useAuthStore((s) => s.user);

  const { data: testsData, loading: testsLoading } = useApiQuery(
    () => getTests({ limit: 6 }),
    [],
  );

  const { data: attemptsData, loading: attemptsLoading } = useApiQuery(
    () => getMyAttempts({ limit: 5 }),
    [],
  );

  const { data: overview } = useApiQuery(getLearnerOverview, []);

  const tests = safeArray<Test>(testsData);
  const attempts = safeArray<Attempt>(attemptsData);
  const obj =
    (overview && typeof overview === "object"
      ? (overview as Record<string, any>)
      : {}) || {};

  const completedCount =
    obj.completedTests ?? attempts.filter((a) => a.status === "GRADED").length;
  const bands = attempts
    .map((attempt) =>
      Number(
        (attempt as any).overallBand ??
          (attempt as any).bandScore ??
          (attempt as any).score ??
          (attempt as any).result?.overallBand,
      ),
    )
    .filter((value) => Number.isFinite(value));

  const averageBand =
    obj.averageBand ??
    obj.average_band ??
    (bands.length
      ? bands.reduce((sum, value) => sum + value, 0) / bands.length
      : null);
  const bestBand =
    obj.bestBand ?? obj.best_band ?? (bands.length ? Math.max(...bands) : null);

  const inProgressCount = attempts.filter(
    (a) => a.status === "IN_PROGRESS",
  ).length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
          <div className="bg-[linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:32px_32px] p-7 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[.24em] text-cyan-700">
              Bảng điều khiển học viên
            </p>

            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Xin chào, {displayName(user)}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Sẵn sàng cho buổi luyện tập hôm nay? Bạn có thể làm đề công khai,
              xem lịch học, theo dõi lớp học và kiểm tra tiến độ cá nhân tại
              đây.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/learner/tests">
                <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]">
                  Luyện đề ngay
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/learner/schedule">
                <Button variant="outline">Lịch học của tôi</Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-7 text-white md:p-10">
            <p className="text-xs uppercase tracking-[.22em] opacity-80">
              Tổng quan cá nhân
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/20 bg-white/15 p-4 shadow-[0_18px_40px_rgba(8,47,73,0.16)] backdrop-blur-xl">
                <p className="text-3xl font-bold">
                  {attempts.length || obj.totalAttempts || "—"}
                </p>
                <p className="text-sm opacity-80">Bài đã làm</p>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/15 p-4 shadow-[0_18px_40px_rgba(8,47,73,0.16)] backdrop-blur-xl">
                <p className="text-3xl font-bold">{completedCount}</p>
                <p className="text-sm opacity-80">Đã hoàn thành</p>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/15 p-4 shadow-[0_18px_40px_rgba(8,47,73,0.16)] backdrop-blur-xl">
                <p className="text-3xl font-bold">{inProgressCount}</p>
                <p className="text-sm opacity-80">Đang làm</p>
              </div>

              <div className="rounded-3xl border border-white/20 bg-white/15 p-4 shadow-[0_18px_40px_rgba(8,47,73,0.16)] backdrop-blur-xl">
                <p className="text-3xl font-bold">
                  {averageBand === null || averageBand === undefined
                    ? "—"
                    : Number(averageBand).toFixed(1).replace(".0", "")}
                </p>
                <p className="text-sm opacity-80">Band trung bình</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <div className="space-y-5">
          <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold">
                  Đề thi công khai gợi ý
                </h2>
                <p className="text-sm text-slate-500">
                  Các đề đã được xuất bản để học viên luyện tập.
                </p>
              </div>

              <Link
                href="/learner/tests"
                className="text-sm font-semibold text-cyan-700 hover:underline"
              >
                Xem tất cả
              </Link>
            </CardHeader>

            <CardContent>
              {testsLoading && <LoadingState />}

              {!testsLoading && tests.length === 0 && (
                <EmptyState
                  title="Chưa có đề công khai"
                  description="Khi admin xuất bản đề, đề sẽ hiển thị tại đây."
                />
              )}

              {!testsLoading && tests.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {tests.map((test) => (
                    <TestCard key={test.id} test={test} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold">Lớp của tôi</h2>
                <p className="text-sm text-slate-500">
                  UI mock để demo. Backend lớp học sẽ phát triển ở giai đoạn
                  sau.
                </p>
              </div>

              <Link
                href="/learner/classes"
                className="text-sm font-semibold text-cyan-700 hover:underline"
              >
                Xem lớp học
              </Link>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {mockClasses.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                        <GraduationCap className="h-5 w-5" />
                      </div>

                      <div>
                        <h3 className="font-serif text-lg font-bold text-slate-950">
                          {item.title}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.teacher} · {item.place}
                        </p>
                        <Badge className="mt-3" tone="success">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <CardHeader>
              <h2 className="font-serif text-2xl font-bold">
                Lịch học hôm nay
              </h2>
              <p className="text-sm text-slate-500">
                Lịch mock để demo giao diện thời khóa biểu cá nhân.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {todaySchedule.map((item) => (
                <div
                  key={`${item.time}-${item.title}`}
                  className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl"
                >
                  <div className="flex gap-4">
                    <div className="w-14 shrink-0 text-sm font-semibold text-cyan-700">
                      {item.time}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.note}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <Link href="/learner/schedule">
                <Button variant="outline" className="w-full">
                  Quản lý lịch học
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <CardHeader>
              <h2 className="font-serif text-2xl font-bold">
                Hoạt động gần đây
              </h2>
              <p className="text-sm text-slate-500">
                Dựa trên lịch sử bài làm của bạn.
              </p>
            </CardHeader>

            <CardContent className="space-y-3">
              {attemptsLoading && <LoadingState />}

              {!attemptsLoading && attempts.length === 0 && (
                <EmptyState
                  title="Chưa có hoạt động"
                  description="Khi bạn bắt đầu làm đề, hoạt động sẽ hiển thị ở đây."
                />
              )}

              {!attemptsLoading &&
                attempts.map((attempt) => (
                  <Link
                    key={attempt.id}
                    href={`/learner/attempts/${attempt.id}`}
                    className="block rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50/70"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {attempt.test?.title ||
                            attempt.testId ||
                            "Đề thi IELTS"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(attempt.startedAt)}
                        </p>
                      </div>

                      <Badge tone={attemptStatusTone(attempt.status) as any}>
                        {attemptStatusLabel(attempt.status)}
                      </Badge>
                    </div>
                  </Link>
                ))}

              <Link href="/learner/attempts">
                <Button variant="secondary" className="w-full">
                  Xem toàn bộ lịch sử
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

function TestCard({ test }: { test: Test }) {
  return (
    <Link
      href={`/learner/tests/${test.id}`}
      className="group rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50/80 hover:shadow-[0_18px_50px_rgba(14,165,233,0.14)]"
    >
      <div className="mb-3 flex items-center justify-between">
        <Badge tone="sage" className="gap-1">
          <SkillIcon type={test.type} /> {test.type}
        </Badge>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {bandLabel(test.level)}
        </span>
      </div>
      <h3 className="font-serif text-xl font-bold leading-tight text-slate-950 group-hover:text-cyan-700">
        {test.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
        {test.description || "Đề luyện thi IELTS đã được xuất bản."}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{testCountLabel(test)}</span>
        <span>Vào chi tiết →</span>
      </div>
    </Link>
  );
}

export function LearnerTestsVietnamesePage() {
  const [tab, setTab] = useState<TestTab>("ALL");
  const [search, setSearch] = useState("");
  const { data, loading, error } = useApiQuery(
    () => getTests(tab === "ALL" ? {} : { type: tab }),
    [tab],
  );
  const tests = safeArray<Test>(data).filter((t) =>
    t.title?.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div>
      <PageHeader
        eyebrow="Đề thi"
        title="Thư viện đề luyện IELTS"
        description="Chọn kỹ năng hoặc xem tất cả đề đã được admin xuất bản. Nhấn vào đề để xem chi tiết, làm bài và xem lại kết quả."
      />
      <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-cyan-100 bg-white/90 p-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${tab === key ? "bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 text-white" : "text-slate-500 hover:bg-muted hover:text-slate-950"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
      <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Danh sách đề</h2>
            <p className="text-sm text-slate-500">
              Chọn một đề đã xuất bản để xem chi tiết, bắt đầu làm bài hoặc xem
              lại kết quả.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              className="pl-9"
              placeholder="Tìm đề thi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}
          {!loading && !error && tests.length === 0 && (
            <EmptyState title="Chưa có đề phù hợp" />
          )}
          {!loading && !error && tests.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tests.map((t) => (
                <TestCard key={t.id} test={t} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function LearnerSchedulePage() {
  const days = [
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
    "Chủ nhật",
  ];
  const slots = ["Sáng", "Chiều", "Tối"];
  return (
    <div>
      <PageHeader
        eyebrow="Lịch học"
        title="Lịch học của tôi"
        description="Tạo, sửa, xóa lịch học cá nhân theo dạng thời khóa biểu. Hiện tại là UI mock để demo; backend sẽ phát triển sau."
        actions={
          <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]">
            <Plus className="h-4 w-4" />
            Tạo lịch học
          </Button>
        }
      />
      <Card className="mb-5">
        <CardHeader>
          <h2 className="font-serif text-2xl font-bold">Tạo nhanh lịch học</h2>
          <p className="text-sm text-slate-500">
            Form demo để thể hiện luồng tạo lịch học cá nhân.
          </p>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-5">
          <Input placeholder="Tên buổi học" />
          <Input placeholder="Kỹ năng" />
          <Input placeholder="Thứ trong tuần" />
          <Input placeholder="Khung giờ" />
          <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]">
            Lưu lịch
          </Button>
        </CardContent>
      </Card>
      <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardHeader>
          <h2 className="font-serif text-2xl font-bold">
            Thời khóa biểu luyện IELTS
          </h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-cyan-100">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-muted text-left text-slate-500">
                <tr>
                  <th className="p-3">Buổi</th>
                  {days.map((d) => (
                    <th key={d} className="p-3">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white/90">
                {slots.map((slot) => (
                  <tr key={slot}>
                    <td className="p-3 font-semibold text-slate-950">{slot}</td>
                    {days.map((d) => (
                      <td key={d} className="p-2">
                        <button className="min-h-20 w-full rounded-xl border border-dashed border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-3 text-left text-xs text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50">
                          <p className="font-semibold text-slate-950">
                            + Thêm buổi học
                          </p>
                          <p className="mt-1">Kỹ năng, giờ học, ghi chú</p>
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LearnerProfileVietnamesePage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <PageHeader
        eyebrow="Trang cá nhân"
        title="Hồ sơ học viên"
        description="Cập nhật avatar, bio, số điện thoại, mật khẩu và xem lịch sử làm bài."
      />
      <div className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
        <Card className="bg-[linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:32px_32px]">
          <CardContent className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 text-3xl font-bold text-white">
              {displayName(user).charAt(0).toUpperCase()}
            </div>
            <h2 className="mt-4 font-serif text-2xl font-bold">
              {displayName(user)}
            </h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <Button className="mt-5" variant="outline">
              Đổi avatar
            </Button>
          </CardContent>
        </Card>
        <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardHeader>
            <h2 className="font-serif text-2xl font-bold">Thông tin cá nhân</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Họ và tên" defaultValue={displayName(user)} />
              <Input placeholder="Số điện thoại" />
            </div>
            <Textarea placeholder="Bio ngắn về mục tiêu IELTS của bạn..." />
            <div className="grid gap-4 md:grid-cols-2">
              <Input type="password" placeholder="Mật khẩu hiện tại" />
              <Input type="password" placeholder="Mật khẩu mới" />
            </div>
            <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]">
              Lưu thay đổi
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <LearnerAttemptHistory />
      </div>
    </div>
  );
}

function unwrapAttemptResultPayload(payload: unknown) {
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

function pickFirstValue(...values: unknown[]) {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return null;
}

function pickNumberValue(...values: unknown[]) {
  const value = pickFirstValue(...values);

  if (value === null) return null;

  const numeric = Number(value);

  return Number.isFinite(numeric) ? numeric : null;
}

function formatScoreValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  const numeric = Number(value);

  if (Number.isFinite(numeric)) {
    return numeric.toFixed(1).replace(".0", "");
  }

  return String(value);
}

function formatBandScoreValue(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  const numeric = Number(value);

  if (Number.isFinite(numeric)) {
    return numeric.toFixed(1);
  }

  return String(value);
}

function getCachedResultForAttempt(
  attempt: Attempt,
  cache: Record<string, Record<string, any>>,
) {
  return cache[attempt.id] || {};
}

function normalizeAttemptStatus(status?: string | null) {
  return String(status || "").toUpperCase();
}

function getResultSummaryObject(...sources: any[]) {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    const summary =
      source.resultSummary ||
      source.result_summary ||
      source.summary ||
      source.result?.resultSummary ||
      source.result?.result_summary ||
      source.result?.summary ||
      source.objective?.resultSummary ||
      source.objective?.result_summary ||
      source.objective?.summary;

    if (summary && typeof summary === "object") {
      return summary;
    }
  }

  return {};
}

function getObjectiveObject(...sources: any[]) {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    const objective =
      source.objective ||
      source.result?.objective ||
      source.score?.objective ||
      source.scores?.objective;

    if (objective && typeof objective === "object") {
      return objective;
    }
  }

  return {};
}

function getAttemptSkillForResult(attempt: Attempt) {
  const raw = [
    attempt.mode,
    attempt.test?.type,
    (attempt as any).testType,
    (attempt as any).test_type,
    (attempt as any).skill,
    (attempt as any).sectionType,
    (attempt as any).section_type,
    (attempt as any).partLabel,
    (attempt as any).part_label,
    (attempt as any).part?.type,
    (attempt as any).section?.type,
  ]
    .filter(Boolean)
    .map((value) => String(value).toUpperCase())
    .join(" ");

  if (raw.includes("READING")) return "READING";
  if (raw.includes("LISTENING")) return "LISTENING";
  if (raw.includes("WRITING")) return "WRITING";
  if (raw.includes("SPEAKING")) return "SPEAKING";

  return "";
}

function isObjectiveAttempt(attempt: Attempt) {
  const skill = getAttemptSkillForResult(attempt);

  return skill === "READING" || skill === "LISTENING";
}

function getAttemptResultDisplay(
  attempt: Attempt,
  cache: Record<string, Record<string, any>>,
) {
  const score = getAttemptScoreText(attempt, cache);
  const correctText = getAttemptCorrectText(attempt, cache);
  const objective = isObjectiveAttempt(attempt);

  if (objective && correctText) {
    return {
      main: correctText,
      helper: score !== null ? score : "Số câu đúng",
      loading: false,
      empty: false,
    };
  }

  if (score !== null) {
    return {
      main: score,
      helper: correctText || "Điểm tổng quan",
      loading: false,
      empty: false,
    };
  }

  if (correctText) {
    return {
      main: correctText,
      helper: "Số câu đúng",
      loading: false,
      empty: false,
    };
  }

  if (
    normalizeAttemptStatus(attempt.status) === "GRADED" &&
    needsResultHydration(attempt, cache)
  ) {
    return {
      main: "Đang tải điểm...",
      helper: "",
      loading: true,
      empty: false,
    };
  }

  if (normalizeAttemptStatus(attempt.status) === "GRADED") {
    return {
      main: "Đã chấm",
      helper: "Xem kết quả để xem chi tiết",
      loading: false,
      empty: false,
    };
  }

  if (normalizeAttemptStatus(attempt.status) === "IN_PROGRESS") {
    return {
      main: "Đang làm",
      helper: "",
      loading: false,
      empty: true,
    };
  }

  if (
    normalizeAttemptStatus(attempt.status) === "SUBMITTED" ||
    normalizeAttemptStatus(attempt.status) === "GRADING"
  ) {
    return {
      main: "Đang chấm",
      helper: "",
      loading: false,
      empty: true,
    };
  }

  return {
    main: "Chưa có điểm",
    helper: "",
    loading: false,
    empty: true,
  };
}

function getAttemptScoreText(
  attempt: Attempt,
  cache: Record<string, Record<string, any>>,
) {
  const result = getCachedResultForAttempt(attempt, cache);
  const resultSummary = getResultSummaryObject(attempt, result);
  const objective = getObjectiveObject(attempt, result);

  const score = pickFirstValue(
    (attempt as any).overallBand,
    (attempt as any).overall_band,
    (attempt as any).bandScore,
    (attempt as any).band_score,
    (attempt as any).score,
    (attempt as any).rawScore,
    (attempt as any).raw_score,
    (attempt as any).result?.overallBand,
    (attempt as any).result?.overall_band,
    (attempt as any).result?.bandScore,
    (attempt as any).result?.band_score,
    (attempt as any).result?.score,
    (attempt as any).result?.rawScore,
    (attempt as any).result?.raw_score,
    (attempt as any).resultSummary?.bandEstimate,
    (attempt as any).resultSummary?.overallBand,
    (attempt as any).resultSummary?.overall_band,
    (attempt as any).resultSummary?.bandScore,
    (attempt as any).resultSummary?.band_score,
    (attempt as any).resultSummary?.rawScore,
    (attempt as any).resultSummary?.raw_score,
    (attempt as any).resultSummary?.score,
    (attempt as any).result_summary?.bandEstimate,
    (attempt as any).result_summary?.band_estimate,
    (attempt as any).result_summary?.overallBand,
    (attempt as any).result_summary?.overall_band,
    (attempt as any).result_summary?.bandScore,
    (attempt as any).result_summary?.band_score,
    (attempt as any).result_summary?.rawScore,
    (attempt as any).result_summary?.raw_score,
    (attempt as any).result_summary?.score,
    result.overallBand,
    result.overall_band,
    result.bandScore,
    result.band_score,
    result.score,
    result.rawScore,
    result.raw_score,
    result.result?.overallBand,
    result.result?.overall_band,
    result.result?.bandScore,
    result.result?.band_score,
    result.result?.score,
    result.result?.rawScore,
    result.result?.raw_score,
    result.score?.overallBand,
    result.score?.bandScore,
    result.score?.rawScore,
    result.scores?.overallBand,
    result.scores?.bandScore,
    result.scores?.rawScore,
    objective.overallBand,
    objective.overall_band,
    objective.bandScore,
    objective.band_score,
    objective.rawScore,
    objective.raw_score,
    objective.score,
    resultSummary.bandEstimate,
    resultSummary.band_estimate,
    resultSummary.overallBand,
    resultSummary.overall_band,
    resultSummary.bandScore,
    resultSummary.band_score,
    resultSummary.rawScore,
    resultSummary.raw_score,
    resultSummary.score,
  );

  return formatBandScoreValue(score);
}

function getAttemptCorrectText(
  attempt: Attempt,
  cache: Record<string, Record<string, any>>,
) {
  const result = getCachedResultForAttempt(attempt, cache);
  const resultSummary = getResultSummaryObject(attempt, result);
  const objective = getObjectiveObject(attempt, result);

  const correct = pickNumberValue(
    (attempt as any).correctCount,
    (attempt as any).correct_count,
    (attempt as any).totalCorrect,
    (attempt as any).total_correct,
    (attempt as any).result?.correctCount,
    (attempt as any).result?.correct_count,
    (attempt as any).result?.totalCorrect,
    (attempt as any).result?.total_correct,
    (attempt as any).resultSummary?.correctCount,
    (attempt as any).resultSummary?.correct_count,
    (attempt as any).resultSummary?.totalCorrect,
    (attempt as any).resultSummary?.total_correct,
    (attempt as any).result_summary?.correctCount,
    (attempt as any).result_summary?.correct_count,
    (attempt as any).result_summary?.totalCorrect,
    (attempt as any).result_summary?.total_correct,
    result.correctCount,
    result.correct_count,
    result.totalCorrect,
    result.total_correct,
    result.result?.correctCount,
    result.result?.correct_count,
    result.result?.totalCorrect,
    result.result?.total_correct,
    objective.correctCount,
    objective.correct_count,
    objective.totalCorrect,
    objective.total_correct,
    resultSummary.correctCount,
    resultSummary.correct_count,
    resultSummary.totalCorrect,
    resultSummary.total_correct,
  );

  const total = pickNumberValue(
    (attempt as any).questionCount,
    (attempt as any).question_count,
    (attempt as any).totalQuestions,
    (attempt as any).total_questions,
    (attempt as any).result?.questionCount,
    (attempt as any).result?.question_count,
    (attempt as any).result?.totalQuestions,
    (attempt as any).result?.total_questions,
    (attempt as any).resultSummary?.totalCount,
    (attempt as any).resultSummary?.total_count,
    (attempt as any).resultSummary?.questionCount,
    (attempt as any).resultSummary?.question_count,
    (attempt as any).resultSummary?.totalQuestions,
    (attempt as any).resultSummary?.total_questions,
    (attempt as any).result_summary?.totalCount,
    (attempt as any).result_summary?.total_count,
    (attempt as any).result_summary?.questionCount,
    (attempt as any).result_summary?.question_count,
    (attempt as any).result_summary?.totalQuestions,
    (attempt as any).result_summary?.total_questions,
    result.questionCount,
    result.question_count,
    result.totalQuestions,
    result.total_questions,
    result.result?.questionCount,
    result.result?.question_count,
    result.result?.totalQuestions,
    result.result?.total_questions,
    objective.questionCount,
    objective.question_count,
    objective.totalQuestions,
    objective.total_questions,
    resultSummary.totalCount,
    resultSummary.total_count,
    resultSummary.questionCount,
    resultSummary.question_count,
    resultSummary.totalQuestions,
    resultSummary.total_questions,
  );

  if (correct === null || total === null || total <= 0) return null;

  return `${correct}/${total} câu đúng`;
}

function needsResultHydration(
  attempt: Attempt,
  cache: Record<string, Record<string, any>>,
) {
  if (normalizeAttemptStatus(attempt.status) !== "GRADED") return false;

  const score = getAttemptScoreText(attempt, cache);
  const correctText = getAttemptCorrectText(attempt, cache);

  if (score !== null || correctText) return false;

  return !cache[attempt.id];
}

export function LearnerAttemptHistory() {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [resultCache, setResultCache] = useState<
    Record<string, Record<string, any>>
  >({});

  const { data, loading, error } = useApiQuery(
    () =>
      getMyAttempts({
        limit: 50,
        mode: mode === "ALL" ? undefined : (mode as any),
        status: status === "ALL" ? undefined : (status as any),
      }),
    [mode, status],
  );

  const attempts = useMemo(() => safeArray<Attempt>(data), [data]);

  useEffect(() => {
    const targets = attempts
      .filter((attempt) => needsResultHydration(attempt, resultCache))
      .slice(0, 20);

    if (!targets.length) return;

    let mounted = true;

    async function hydrateResults() {
      const settled = await Promise.allSettled(
        targets.map(async (attempt) => {
          const result = await getAttemptResult(attempt.id);
          return [attempt.id, unwrapAttemptResultPayload(result)] as const;
        }),
      );

      if (!mounted) return;

      setResultCache((current) => {
        const next = { ...current };

        settled.forEach((item) => {
          if (item.status === "fulfilled") {
            const [attemptId, result] = item.value;
            next[attemptId] = result;
          }
        });

        return next;
      });
    }

    hydrateResults();

    return () => {
      mounted = false;
    };
  }, [attempts, resultCache]);

  const filtered = attempts.filter((attempt) => {
    const testTitle =
      attempt.test?.title || (attempt as any).testTitle || attempt.testId || "";

    return testTitle.toLowerCase().includes(search.toLowerCase());
  });

  function getAttemptTitle(attempt: Attempt) {
    return (
      attempt.test?.title ||
      (attempt as any).testTitle ||
      attempt.testId ||
      "Bài làm IELTS"
    );
  }

  function getAttemptMode(attempt: Attempt) {
    const value = attempt.mode || (attempt as any).test?.type || "IELTS";

    const map: Record<string, string> = {
      READING: "Reading",
      LISTENING: "Listening",
      WRITING: "Writing",
      SPEAKING: "Speaking",
      FULL: "Full Test",
    };

    return map[value] || value;
  }

  function getAttemptStatusLabel(value?: string) {
    const map: Record<string, string> = {
      IN_PROGRESS: "Đang làm",
      SUBMITTED: "Đã nộp",
      GRADING: "Đang chấm",
      GRADED: "Đã chấm",
      ERROR: "Lỗi",
      EXPIRED: "Hết hạn",
    };

    return value ? map[value] || value : "Chưa rõ";
  }

  function getAttemptStatusTone(value?: string) {
    if (value === "GRADED") return "success";
    if (value === "IN_PROGRESS") return "sage";
    if (value === "ERROR" || value === "EXPIRED") return "danger";
    return "warning";
  }

  function getAttemptDate(attempt: Attempt) {
    return (
      attempt.submittedAt ||
      attempt.startedAt ||
      (attempt as any).createdAt ||
      (attempt as any).updatedAt
    );
  }

  function renderPrimaryAction(attempt: Attempt) {
    if (normalizeAttemptStatus(attempt.status) === "IN_PROGRESS") {
      return (
        <Link href={`/learner/attempts/${attempt.id}/session`}>
          <Button size="sm">Tiếp tục</Button>
        </Link>
      );
    }

    if (
      normalizeAttemptStatus(attempt.status) === "SUBMITTED" ||
      normalizeAttemptStatus(attempt.status) === "GRADING"
    ) {
      return (
        <Link href={`/learner/attempts/${attempt.id}/status`}>
          <Button size="sm" variant="secondary">
            Xem trạng thái
          </Button>
        </Link>
      );
    }

    if (normalizeAttemptStatus(attempt.status) === "GRADED") {
      return (
        <Link href={`/learner/attempts/${attempt.id}/result`}>
          <Button size="sm">Xem kết quả</Button>
        </Link>
      );
    }

    if (attempt.status === "ERROR") {
      return (
        <Link href={`/learner/attempts/${attempt.id}/status`}>
          <Button size="sm" variant="secondary">
            Xem lỗi
          </Button>
        </Link>
      );
    }

    return (
      <Link href={`/learner/attempts/${attempt.id}`}>
        <Button size="sm" variant="secondary">
          Chi tiết
        </Button>
      </Link>
    );
  }

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardContent className="p-6">
          <EmptyState
            title="Không thể tải lịch sử làm bài"
            description={error}
          />
          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => {
                setSearch("");
                setMode("ALL");
                setStatus("ALL");
              }}
            >
              Đặt lại bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_220px_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              className="pl-10"
              placeholder="Tìm theo tên đề thi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="rounded-xl border border-cyan-100 bg-white/90 px-3 py-2 text-sm outline-none focus:border-cyan-300"
          >
            <option value="ALL">Tất cả kỹ năng</option>
            <option value="READING">Reading</option>
            <option value="LISTENING">Listening</option>
            <option value="WRITING">Writing</option>
            <option value="SPEAKING">Speaking</option>
            <option value="FULL">Full Test</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-cyan-100 bg-white/90 px-3 py-2 text-sm outline-none focus:border-cyan-300"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="IN_PROGRESS">Đang làm</option>
            <option value="SUBMITTED">Đã nộp</option>
            <option value="GRADING">Đang chấm</option>
            <option value="GRADED">Đã chấm</option>
            <option value="ERROR">Lỗi</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>

          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setMode("ALL");
              setStatus("ALL");
            }}
          >
            Xóa bộ lọc
          </Button>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-8">
            <EmptyState
              title="Chưa có bài làm"
              description="Khi bạn bắt đầu luyện đề, lịch sử bài làm sẽ hiển thị tại đây."
            />
            <div className="mt-4 flex justify-center">
              <Link href="/learner/tests">
                <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]">
                  Đi đến thư viện đề
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((attempt) => {
            const resultDisplay = getAttemptResultDisplay(attempt, resultCache);

            return (
              <Card key={attempt.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="sage">{getAttemptMode(attempt)}</Badge>

                        <Badge
                          tone={getAttemptStatusTone(attempt.status) as any}
                        >
                          {getAttemptStatusLabel(attempt.status)}
                        </Badge>

                        <span className="text-xs text-slate-500">
                          {formatDate(getAttemptDate(attempt))}
                        </span>
                      </div>

                      <h3 className="mt-4 font-serif text-2xl font-bold leading-tight text-slate-950">
                        {getAttemptTitle(attempt)}
                      </h3>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                        {(attempt as any).partLabel ||
                        (attempt as any).part_label ? (
                          <span>
                            Phần luyện:{" "}
                            {(attempt as any).partLabel ||
                              (attempt as any).part_label}
                          </span>
                        ) : null}

                        {(attempt as any).timeLimitSec ||
                        (attempt as any).time_limit_sec ? (
                          <span>
                            Thời gian:{" "}
                            {Math.round(
                              Number(
                                (attempt as any).timeLimitSec ||
                                  (attempt as any).time_limit_sec,
                              ) / 60,
                            )}{" "}
                            phút
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="border-t border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-5 lg:border-l lg:border-t-0">
                      <div className="flex h-full flex-col justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">
                            Kết quả
                          </p>

                          {resultDisplay.empty ? (
                            <p className="mt-2 text-sm font-semibold text-slate-500">
                              {resultDisplay.main}
                            </p>
                          ) : resultDisplay.loading ? (
                            <p className="mt-2 text-sm font-semibold text-slate-500">
                              {resultDisplay.main}
                            </p>
                          ) : (
                            <>
                              <p className="mt-2 text-xl font-black text-cyan-700">
                                {resultDisplay.main}
                              </p>

                              {resultDisplay.helper ? (
                                <p className="mt-1 text-xs font-semibold text-slate-500">
                                  {resultDisplay.helper}
                                </p>
                              ) : null}
                            </>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {renderPrimaryAction(attempt)}

                          {normalizeAttemptStatus(attempt.status) ===
                          "GRADED" ? (
                            <Link
                              href={`/learner/attempts/${attempt.id}/review`}
                            >
                              <Button size="sm" variant="outline">
                                Review
                              </Button>
                            </Link>
                          ) : null}

                          <Link href={`/learner/attempts/${attempt.id}`}>
                            <Button size="sm" variant="ghost">
                              Chi tiết
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LearnerComingSoon({
  title,
  description,
  icon: Icon = Sparkles,
}: {
  title: string;
  description?: string;
  icon?: any;
}) {
  return (
    <div>
      <PageHeader
        title={title}
        description={
          description || "Chức năng này sẽ phát triển thêm ở giai đoạn sau."
        }
      />
      <Card className="bg-[linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:32px_32px] flex min-h-[360px] items-center justify-center p-10 text-center">
        <div>
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-100 bg-white/90">
            <Icon className="h-7 w-7 text-cyan-700" />
          </div>
          <h2 className="font-serif text-3xl font-bold">Sẽ phát triển thêm</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            {description ||
              "UI đã đặt đúng vị trí để demo flow học viên theo kiểu Study4."}
          </p>
        </div>
      </Card>
    </div>
  );
}
