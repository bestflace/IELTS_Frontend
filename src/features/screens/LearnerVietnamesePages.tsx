"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
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
import { getMyAttempts } from "@/lib/api/attempts.api";
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
  const averageBand = obj.averageBand ?? "—";
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
                <p className="text-3xl font-bold">{averageBand}</p>
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
        <span className="text-xs text-slate-500">
          Level {test.level ?? "—"}
        </span>
      </div>
      <h3 className="font-serif text-xl font-bold leading-tight text-slate-950 group-hover:text-cyan-700">
        {test.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
        {test.description || "Đề luyện thi IELTS đã được xuất bản."}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <span>{test.sections?.length ?? 0} phần thi</span>
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

export function LearnerAttemptHistory() {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");

  const { data, loading, error } = useApiQuery(
    () =>
      getMyAttempts({
        limit: 50,
        mode: mode === "ALL" ? undefined : (mode as any),
        status: status === "ALL" ? undefined : (status as any),
      }),
    [mode, status],
  );

  const attempts = safeArray<Attempt>(data);

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

  function getScore(attempt: Attempt) {
    return (
      (attempt as any).overallBand ||
      (attempt as any).bandScore ||
      (attempt as any).score ||
      (attempt as any).result?.overallBand ||
      null
    );
  }

  function getCorrectText(attempt: Attempt) {
    const correct =
      (attempt as any).correctCount ||
      (attempt as any).totalCorrect ||
      (attempt as any).result?.correctCount;

    const total =
      (attempt as any).questionCount ||
      (attempt as any).totalQuestions ||
      (attempt as any).result?.questionCount;

    if (correct === undefined || correct === null || !total) return null;

    return `${correct}/${total} câu đúng`;
  }

  function renderPrimaryAction(attempt: Attempt) {
    if (attempt.status === "IN_PROGRESS") {
      return (
        <Link href={`/learner/attempts/${attempt.id}/session`}>
          <Button size="sm">Tiếp tục</Button>
        </Link>
      );
    }

    if (attempt.status === "SUBMITTED" || attempt.status === "GRADING") {
      return (
        <Link href={`/learner/attempts/${attempt.id}/status`}>
          <Button size="sm" variant="secondary">
            Xem trạng thái
          </Button>
        </Link>
      );
    }

    if (attempt.status === "GRADED") {
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
            const score = getScore(attempt);
            const correctText = getCorrectText(attempt);

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
                        <span>Mã bài làm: {attempt.id}</span>
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

                          {score !== null ? (
                            <p className="mt-2 font-serif text-4xl font-bold text-cyan-700">
                              {score}
                            </p>
                          ) : correctText ? (
                            <p className="mt-2 font-serif text-3xl font-bold text-cyan-700">
                              {correctText}
                            </p>
                          ) : attempt.status === "IN_PROGRESS" ? (
                            <p className="mt-2 text-sm font-semibold text-slate-500">
                              Đang làm bài
                            </p>
                          ) : attempt.status === "SUBMITTED" ||
                            attempt.status === "GRADING" ? (
                            <p className="mt-2 text-sm font-semibold text-slate-500">
                              Đang chờ kết quả
                            </p>
                          ) : (
                            <p className="mt-2 text-sm font-semibold text-slate-500">
                              Chưa có điểm
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {renderPrimaryAction(attempt)}

                          {attempt.status === "GRADED" ? (
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
                              Mở bài làm
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
