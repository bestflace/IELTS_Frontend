"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  History,
  ListChecks,
  Loader2,
  Mic,
  PenLine,
  Play,
  RefreshCcw,
  Sparkles,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { createAttempt, getMyAttempts } from "@/lib/api/attempts.api";
import { getTest } from "@/lib/api/tests.api";
import type { Attempt, Test, TestSection, TestType } from "@/types";

type TimeMode = "STANDARD" | "CUSTOM";

type TimeRule = {
  standardMin: number;
  minMin: number;
  maxMin: number;
  stepMin: number;
  presets: number[];
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

function getTimeRule(type?: TestType | string): TimeRule {
  if (type === "SPEAKING") {
    return {
      standardMin: 15,
      minMin: 5,
      maxMin: 15,
      stepMin: 1,
      presets: [5, 10, 12, 15],
    };
  }

  if (type === "LISTENING") {
    return {
      standardMin: 30,
      minMin: 10,
      maxMin: 40,
      stepMin: 5,
      presets: [10, 20, 30, 40],
    };
  }

  if (type === "READING" || type === "WRITING") {
    return {
      standardMin: 60,
      minMin: 10,
      maxMin: 60,
      stepMin: 5,
      presets: [20, 40, 60],
    };
  }

  if (type === "FULL") {
    return {
      standardMin: 165,
      minMin: 30,
      maxMin: 180,
      stepMin: 5,
      presets: [60, 90, 120, 165, 180],
    };
  }

  return {
    standardMin: 60,
    minMin: 10,
    maxMin: 60,
    stepMin: 5,
    presets: [20, 40, 60],
  };
}

function clampTimeByRule(value: number, rule: TimeRule) {
  if (!Number.isFinite(value)) return rule.standardMin;
  return Math.min(rule.maxMin, Math.max(rule.minMin, value));
}

function testTypeLabel(type?: string) {
  const map: Record<string, string> = {
    READING: "Reading",
    LISTENING: "Listening",
    WRITING: "Writing",
    SPEAKING: "Speaking",
    FULL: "Full Test",
  };

  return type ? map[type] || type : "IELTS";
}

function sectionTypeLabel(type?: string) {
  const map: Record<string, string> = {
    READING_SET: "Reading",
    LISTENING_SET: "Listening",
    WRITING_TASK: "Writing",
    SPEAKING_SET: "Speaking",
  };

  return type ? map[type] || type : "Section";
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
  if (status === "GRADED") return "success" as const;
  if (status === "IN_PROGRESS") return "sage" as const;
  if (status === "ERROR" || status === "EXPIRED") return "danger" as const;
  return "warning" as const;
}

function typeIcon(type?: string) {
  if (type === "LISTENING") return Headphones;
  if (type === "WRITING") return PenLine;
  if (type === "SPEAKING") return Mic;
  if (type === "FULL") return FileText;
  return BookOpen;
}

function sectionTitle(section: TestSection, index: number) {
  return (
    section.partLabel ||
    `Phần ${index + 1} · ${sectionTypeLabel(section.sectionType)}`
  );
}

function formatTime(seconds?: number | null) {
  if (!seconds) return "Theo đề";
  const minutes = Math.round(seconds / 60);
  return `${minutes} phút`;
}

function countLabel(test?: Test | null) {
  const sectionCount = test?.sections?.length || 0;

  if (test?.type === "WRITING") return `${sectionCount || 2} task`;
  if (test?.type === "SPEAKING") return `${sectionCount || 3} part`;
  if (test?.type === "FULL") return `${sectionCount} phần`;
  if (test?.type === "LISTENING") return `${sectionCount || 4} section`;
  return `${sectionCount || 3} passage`;
}

function formatDate(value?: string | null) {
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

function getLatestAttempt(attempts: Attempt[]) {
  return [...attempts].sort((a, b) => {
    const dateA = new Date(
      a.startedAt ||
        a.started_at ||
        a.submittedAt ||
        a.submitted_at ||
        a.createdAt ||
        a.created_at ||
        0,
    ).getTime();

    const dateB = new Date(
      b.startedAt ||
        b.started_at ||
        b.submittedAt ||
        b.submitted_at ||
        b.createdAt ||
        b.created_at ||
        0,
    ).getTime();

    return dateB - dateA;
  })[0];
}

function getAttemptAction(attempt?: Attempt) {
  if (!attempt) return null;

  if (attempt.status === "IN_PROGRESS") {
    return {
      label: "Tiếp tục bài thi",
      href: `/learner/attempts/${attempt.id}/session`,
    };
  }

  if (attempt.status === "SUBMITTED" || attempt.status === "GRADING") {
    return {
      label: "Xem trạng thái chấm",
      href: `/learner/attempts/${attempt.id}/status`,
    };
  }

  if (attempt.status === "GRADED") {
    return {
      label: "Xem kết quả",
      href: `/learner/attempts/${attempt.id}/result`,
    };
  }

  return {
    label: "Xem chi tiết bài làm",
    href: `/learner/attempts/${attempt.id}`,
  };
}

function getAttemptDate(attempt?: Attempt) {
  if (!attempt) return undefined;

  return (
    attempt.startedAt ||
    attempt.started_at ||
    attempt.submittedAt ||
    attempt.submitted_at ||
    attempt.createdAt ||
    attempt.created_at
  );
}

export function LearnerTestDetailPage({
  testId,
  initialSectionId,
}: {
  testId: string;
  initialSectionId?: string;
}) {
  const router = useRouter();

  const [test, setTest] = useState<Test | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [testLoading, setTestLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [error, setError] = useState("");

  const latestAttempt = getLatestAttempt(attempts);
  const latestAction = getAttemptAction(latestAttempt);
  const sections = test?.sections || [];
  const TypeIcon = typeIcon(test?.type);
  const timeRule = useMemo(() => getTimeRule(test?.type), [test?.type]);

  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    initialSectionId || "FULL",
  );
  const [timeMode, setTimeMode] = useState<TimeMode>("STANDARD");
  const [customMinutes, setCustomMinutes] = useState<number>(60);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  async function loadDetail() {
    setError("");
    setTestLoading(true);
    setAttemptsLoading(true);

    try {
      const [testPayload, attemptsPayload] = await Promise.all([
        getTest(testId),
        getMyAttempts({ limit: 50 }),
      ]);

      const loadedTest = testPayload as Test;
      const loadedAttempts = unwrapItems<Attempt>(attemptsPayload).filter(
        (attempt) =>
          attempt.testId === testId ||
          (attempt as any).test_id === testId ||
          attempt.test?.id === testId,
      );

      setTest(loadedTest);
      setAttempts(loadedAttempts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải đề thi");
    } finally {
      setTestLoading(false);
      setAttemptsLoading(false);
    }
  }

  useEffect(() => {
    void loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  useEffect(() => {
    if (!test || !initialSectionId) return;

    const exists = (test.sections || []).some(
      (section) => section.id === initialSectionId,
    );

    setSelectedSectionId(exists ? initialSectionId : "FULL");
  }, [initialSectionId, test]);

  const selectedSection = useMemo(() => {
    if (selectedSectionId === "FULL") return undefined;

    return sections.find((section, index) => {
      const id = section.id || `section-${index}`;
      return id === selectedSectionId;
    });
  }, [selectedSectionId, sections]);

  const selectedMinutes = useMemo(() => {
    if (timeMode === "STANDARD") {
      const sectionMin = selectedSection?.timeLimitSec
        ? Math.round(selectedSection.timeLimitSec / 60)
        : undefined;

      return clampTimeByRule(sectionMin || timeRule.standardMin, timeRule);
    }

    return clampTimeByRule(customMinutes, timeRule);
  }, [timeMode, customMinutes, selectedSection?.timeLimitSec, timeRule]);

  const computedTimeLimitSec = selectedMinutes * 60;

  function handleOpenConfirm() {
    const safeMinutes = clampTimeByRule(selectedMinutes, timeRule);

    if (safeMinutes !== selectedMinutes) {
      toast.error(
        `Thời gian ${testTypeLabel(test?.type)} chỉ được chọn từ ${timeRule.minMin} đến ${timeRule.maxMin} phút.`,
      );
      return;
    }

    setConfirmOpen(true);
  }

  async function startAttempt() {
    if (!test) return;

    const safeMinutes = clampTimeByRule(selectedMinutes, timeRule);

    if (safeMinutes !== selectedMinutes) {
      toast.error(
        `Thời gian ${testTypeLabel(test.type)} chỉ được chọn từ ${timeRule.minMin} đến ${timeRule.maxMin} phút.`,
      );
      return;
    }

    const timeLimitSec = safeMinutes * 60;

    if (!Number.isFinite(timeLimitSec) || timeLimitSec <= 0) {
      toast.error("Thời gian làm bài không hợp lệ.");
      return;
    }

    setStarting(true);

    try {
      const attempt = await createAttempt({
        testId: test.id,
        mode: test.type,
        partLabel: selectedSection?.partLabel || null,
        timeLimitSec,
      });

      toast.success("Đã tạo bài làm. Đồng hồ sẽ bắt đầu trong phòng thi.");
      router.push(`/learner/attempts/${attempt.id}/session`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể bắt đầu bài làm",
      );
    } finally {
      setStarting(false);
    }
  }

  if (testLoading) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[36px] border border-white/70 bg-white/80 p-8 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-cyan-700" />
          <p className="mt-3 text-sm font-bold text-slate-500">
            Đang tải chi tiết đề...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[36px] border border-rose-100 bg-rose-50/70 p-8 text-center">
        <div>
          <RefreshCcw className="mx-auto h-10 w-10 text-rose-600" />
          <h1 className="mt-4 font-serif text-3xl font-black text-slate-950">
            Không thể tải đề thi
          </h1>
          <p className="mt-2 text-sm text-rose-600">{error}</p>
          <Button className="mt-6" onClick={loadDetail}>
            Tải lại
          </Button>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[36px] border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center">
        <div>
          <BookOpen className="mx-auto h-10 w-10 text-cyan-700" />
          <h1 className="mt-4 font-serif text-3xl font-black text-slate-950">
            Không tìm thấy đề thi
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Đề thi có thể đã bị ẩn hoặc không còn tồn tại.
          </p>
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

      <Link
        href="/learner/tests"
        className="relative inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/80 px-4 py-2 text-sm font-black text-slate-500 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Trở về thư viện đề
      </Link>

      <section className="relative overflow-hidden rounded-[38px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <div className="relative grid gap-0 lg:grid-cols-[1fr_380px]">
          <div className="bg-[linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:32px_32px] p-7 md:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="sage" className="gap-1">
                <TypeIcon className="h-4 w-4" />
                {testTypeLabel(test.type)}
              </Badge>

              <Badge>
                {test.level ? `Level ${test.level}` : "Mọi trình độ"}
              </Badge>

              <Badge tone={test.status === "PUBLISHED" ? "success" : "warning"}>
                {test.status === "PUBLISHED" ? "Đã xuất bản" : test.status}
              </Badge>
            </div>

            <h1 className="mt-6 max-w-3xl font-serif text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              {test.title}
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              {test.description ||
                "Xem cấu trúc đề, lịch sử làm bài và bắt đầu luyện tập trong giao diện mô phỏng phòng thi IELTS."}
            </p>

            {latestAttempt ? (
              <div className="mt-7 rounded-[28px] border border-cyan-100 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-serif text-xl font-black text-slate-950">
                      Bài làm gần nhất của bạn
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(getAttemptDate(latestAttempt))} ·{" "}
                      {attemptStatusLabel(latestAttempt.status)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {latestAction ? (
                      <Link href={latestAction.href}>
                        <Button variant="secondary" size="sm">
                          {latestAction.label}
                        </Button>
                      </Link>
                    ) : null}

                    {latestAttempt.status === "GRADED" ? (
                      <Link
                        href={`/learner/attempts/${latestAttempt.id}/review`}
                      >
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
                    ) : null}

                    <Button size="sm" onClick={handleOpenConfirm}>
                      Làm lại đề
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="relative overflow-hidden border-t border-cyan-100 bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-7 text-white lg:border-l lg:border-t-0 md:p-10">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl"
            />

            <p className="relative text-xs font-black uppercase tracking-[.24em] text-cyan-100">
              Tổng quan đề thi
            </p>

            <div className="relative mt-6 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Thời gian chuẩn",
                  value: `${timeRule.standardMin} phút`,
                  icon: Clock,
                },
                {
                  label: "Cấu trúc",
                  value: countLabel(test),
                  icon: ListChecks,
                },
                {
                  label: "Phần thi",
                  value: sections.length || "—",
                  icon: FileText,
                },
                {
                  label: "Lần đã làm",
                  value: attempts.length,
                  icon: History,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/20 bg-white/15 p-4 shadow-[0_18px_40px_rgba(8,47,73,0.16)] backdrop-blur-xl"
                  >
                    <Icon className="mb-3 h-5 w-5 text-cyan-50/80" />
                    <p className="font-serif text-2xl font-black">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-cyan-50/80">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <Button
              className="relative mt-7 w-full bg-white text-cyan-700 hover:bg-cyan-50"
              onClick={handleOpenConfirm}
            >
              {latestAttempt ? "Làm lại đề" : "Bắt đầu làm bài"}
              <Play className="h-4 w-4" />
            </Button>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_390px]">
        <div className="space-y-6">
          <div className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="border-b border-cyan-100/80 px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
                Nội dung đề thi
              </p>
              <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
                Cấu trúc các phần
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Các phần dưới đây được render từ cấu trúc đề do admin tạo.
              </p>
            </div>

            <div className="space-y-3 p-5">
              {sections.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-cyan-700" />
                  <h3 className="mt-4 font-serif text-2xl font-black text-slate-950">
                    Đề chưa có section
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Admin cần thêm section trước khi học viên có thể luyện tập.
                  </p>
                </div>
              ) : (
                sections.map((section, index) => (
                  <div
                    key={section.id || index}
                    className="rounded-[28px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl"
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 font-serif text-lg font-black text-white shadow-[0_14px_30px_rgba(14,165,233,0.22)]">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-2xl font-black text-slate-950">
                            {sectionTitle(section, index)}
                          </h3>
                          <Badge>{sectionTypeLabel(section.sectionType)}</Badge>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-500">
                          Thời gian: {formatTime(section.timeLimitSec)} · Thứ
                          tự: {section.sortOrder ?? index + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="border-b border-cyan-100/80 px-6 py-5">
              <h2 className="font-serif text-3xl font-black text-slate-950">
                Hướng dẫn làm bài
              </h2>
            </div>

            <div className="p-6">
              <ul className="space-y-4 text-sm leading-7 text-slate-600">
                {[
                  "Đọc kỹ yêu cầu từng câu hỏi trước khi trả lời.",
                  "Hệ thống sẽ tự động lưu câu trả lời trong quá trình làm bài.",
                  "Sau khi nộp bài, bạn không thể chỉnh sửa câu trả lời.",
                  "Với Writing/Speaking, kết quả có thể cần thời gian chấm AI hoặc giáo viên.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="border-b border-cyan-100/80 px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
                Tùy chọn luyện tập
              </p>
              <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
                Thiết lập bài làm
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Bạn có thể luyện cả đề hoặc chọn một phần riêng.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Chọn phần
                </p>

                <div className="grid gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSectionId("FULL")}
                    className={
                      selectedSectionId === "FULL"
                        ? "rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-left text-sm font-black text-cyan-700 shadow-sm"
                        : "rounded-2xl border border-cyan-100 bg-white/75 px-4 py-3 text-left text-sm font-bold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50"
                    }
                  >
                    Làm cả đề
                  </button>

                  {sections.map((section, index) => {
                    const id = section.id || `section-${index}`;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setSelectedSectionId(id)}
                        className={
                          selectedSectionId === id
                            ? "rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-left text-sm font-black text-cyan-700 shadow-sm"
                            : "rounded-2xl border border-cyan-100 bg-white/75 px-4 py-3 text-left text-sm font-bold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50"
                        }
                      >
                        {sectionTitle(section, index)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-cyan-100 bg-white/75 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Thời gian làm bài
                    </p>
                    <h3 className="mt-2 font-serif text-2xl font-black text-slate-950">
                      Chọn thời lượng
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {test.type === "SPEAKING"
                        ? "Speaking giới hạn tối đa 15 phút để đúng format IELTS."
                        : `Thời gian được giới hạn từ ${timeRule.minMin} đến ${timeRule.maxMin} phút.`}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-3xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">
                      Đang chọn
                    </p>
                    <p className="mt-1 font-serif text-4xl font-black text-cyan-700">
                      {selectedMinutes}
                    </p>
                    <p className="text-xs font-bold text-cyan-700">phút</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  <button
                    type="button"
                    onClick={() => setTimeMode("STANDARD")}
                    className={
                      timeMode === "STANDARD"
                        ? "rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-left text-sm font-black text-cyan-700"
                        : "rounded-2xl border border-cyan-100 bg-white/75 px-4 py-3 text-left text-sm font-bold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50"
                    }
                  >
                    <p className="font-black text-slate-950">Thời gian chuẩn</p>
                    <p className="mt-1 text-sm">
                      {timeRule.standardMin} phút theo kỹ năng đề thi.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTimeMode("CUSTOM");
                      setCustomMinutes((current) =>
                        clampTimeByRule(current, timeRule),
                      );
                    }}
                    className={
                      timeMode === "CUSTOM"
                        ? "rounded-2xl border border-cyan-300 bg-cyan-50 px-4 py-3 text-left text-sm font-black text-cyan-700"
                        : "rounded-2xl border border-cyan-100 bg-white/75 px-4 py-3 text-left text-sm font-bold text-slate-600 transition hover:border-cyan-300 hover:bg-cyan-50"
                    }
                  >
                    <p className="font-black text-slate-950">
                      Tùy chỉnh thời gian
                    </p>
                    <p className="mt-1 text-sm">
                      Kéo thanh để chọn thời gian hợp lệ.
                    </p>
                  </button>
                </div>

                {timeMode === "CUSTOM" ? (
                  <div className="mt-6 rounded-2xl border border-cyan-100 bg-white/80 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-bold text-slate-500">
                        {timeRule.minMin} phút
                      </span>

                      <span className="font-serif text-3xl font-black text-cyan-700">
                        {customMinutes} phút
                      </span>

                      <span className="text-sm font-bold text-slate-500">
                        {timeRule.maxMin} phút
                      </span>
                    </div>

                    <input
                      type="range"
                      min={timeRule.minMin}
                      max={timeRule.maxMin}
                      step={timeRule.stepMin}
                      value={clampTimeByRule(customMinutes, timeRule)}
                      onChange={(event) =>
                        setCustomMinutes(
                          clampTimeByRule(Number(event.target.value), timeRule),
                        )
                      }
                      className="mt-4 w-full accent-cyan-600"
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                      {timeRule.presets.map((minute) => (
                        <button
                          key={minute}
                          type="button"
                          onClick={() => setCustomMinutes(minute)}
                          className={
                            customMinutes === minute
                              ? "rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-700"
                              : "rounded-xl border border-cyan-100 bg-white/80 px-3 py-2 text-sm font-bold text-slate-500 transition hover:border-cyan-300 hover:bg-cyan-50"
                          }
                        >
                          {minute} phút
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm leading-6 text-slate-600">
                  Hệ thống sẽ gửi{" "}
                  <span className="font-black text-slate-950">
                    {computedTimeLimitSec} giây
                  </span>{" "}
                  cho backend. Đồng hồ bắt đầu chạy khi vào phòng thi.
                </div>
              </div>

              <Button className="w-full" onClick={handleOpenConfirm}>
                {latestAttempt ? "Làm lại đề" : "Bắt đầu làm bài"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="border-b border-cyan-100/80 px-6 py-5">
              <h2 className="font-serif text-3xl font-black text-slate-950">
                Kết quả gần đây
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Các lần làm gần nhất của bạn với đề này.
              </p>
            </div>

            <div className="space-y-3 p-5">
              {attemptsLoading ? (
                <div className="rounded-[26px] border border-cyan-100 bg-cyan-50/50 p-7 text-center">
                  <Loader2 className="mx-auto h-7 w-7 animate-spin text-cyan-700" />
                  <p className="mt-3 text-sm font-bold text-slate-500">
                    Đang tải lịch sử...
                  </p>
                </div>
              ) : null}

              {!attemptsLoading && attempts.length === 0 ? (
                <div className="rounded-[26px] border border-dashed border-cyan-200 bg-cyan-50/60 p-7 text-center">
                  <History className="mx-auto h-9 w-9 text-cyan-700" />
                  <p className="mt-4 font-serif text-xl font-black text-slate-950">
                    Chưa có lần làm nào
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Bắt đầu làm bài để xem kết quả tại đây.
                  </p>
                </div>
              ) : null}

              {!attemptsLoading &&
                attempts.slice(0, 3).map((attempt, index) => (
                  <div
                    key={attempt.id}
                    className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-serif text-lg font-black text-slate-950">
                          Lần {attempts.length - index}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {formatDate(getAttemptDate(attempt))}
                        </p>
                      </div>

                      <Badge tone={attemptStatusTone(attempt.status)}>
                        {attemptStatusLabel(attempt.status)}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {attempt.status === "GRADED" ? (
                        <>
                          <Link href={`/learner/attempts/${attempt.id}/result`}>
                            <Button size="sm" variant="secondary">
                              Kết quả
                            </Button>
                          </Link>
                          <Link href={`/learner/attempts/${attempt.id}/review`}>
                            <Button size="sm" variant="outline">
                              Review
                            </Button>
                          </Link>
                        </>
                      ) : attempt.status === "IN_PROGRESS" ? (
                        <Link href={`/learner/attempts/${attempt.id}/session`}>
                          <Button size="sm" variant="secondary">
                            Tiếp tục
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/learner/attempts/${attempt.id}/status`}>
                          <Button size="sm" variant="secondary">
                            Trạng thái
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </section>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[34px] border border-white/70 bg-white/95 p-6 shadow-[0_30px_90px_rgba(14,165,233,0.18)] backdrop-blur-2xl">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
                <Timer className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-serif text-3xl font-black text-slate-950">
                  Bắt đầu làm bài?
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Bạn sẽ bắt đầu luyện{" "}
                  <span className="font-black text-slate-950">
                    {test.title}
                  </span>
                  . Đồng hồ sẽ chạy ngay khi vào phòng thi.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm">
              <div className="flex justify-between gap-4 py-1">
                <span className="text-slate-500">Phần luyện</span>
                <span className="font-black text-slate-950">
                  {selectedSection
                    ? selectedSection.partLabel || "Một phần riêng"
                    : "Cả đề"}
                </span>
              </div>

              <div className="flex justify-between gap-4 py-1">
                <span className="text-slate-500">Thời gian</span>
                <span className="font-black text-slate-950">
                  {selectedMinutes} phút
                </span>
              </div>

              <div className="flex justify-between gap-4 py-1">
                <span className="text-slate-500">Kỹ năng</span>
                <span className="font-black text-slate-950">
                  {testTypeLabel(test.type)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={starting}
              >
                Hủy
              </Button>

              <Button onClick={startAttempt} disabled={starting}>
                {starting ? "Đang tạo bài làm..." : "Bắt đầu làm bài"}
                {!starting && <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
