"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  LockKeyhole,
  Mic,
  PenLine,
  Play,
  ShieldCheck,
  Sparkles,
  TimerReset,
  UserRoundCheck,
  Waves,
  type LucideIcon,
} from "lucide-react";

import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAuthStore } from "@/store/auth.store";

type PublicDetailKind = "reading" | "listening" | "writing" | "speaking";

type AvailableTest = {
  testId: string;
  testTitle: string;
  testType: string;
  testLevel?: number | null;
  testDescription?: string | null;
  publishedAt?: string | null;
  sectionId: string;
  partLabel?: string | null;
  sortOrder: number;
  timeLimitSec?: number | null;
};

type PublicDetailData = {
  id: string;
  title?: string | null;
  topic?: string | null;
  level?: number | null;
  status?: string | null;
  taskNo?: number | null;
  questionCount?: number | null;
  partCount?: number | null;
  testSectionCount?: number | null;
  tags?: Array<{ id?: string; name?: string | null; slug?: string | null }>;
  availableTests?: AvailableTest[];
};

type PublicDetailPageProps = {
  kind: PublicDetailKind;
  id: string;
  backHref: string;
  query: () => Promise<unknown>;
};

type KindConfig = {
  label: string;
  eyebrow: string;
  icon: LucideIcon;
  description: string;
  previewTitle: string;
  accent: string;
};

const KIND_CONFIG: Record<PublicDetailKind, KindConfig> = {
  reading: {
    label: "Reading",
    eyebrow: "IELTS Academic Reading",
    icon: BookOpen,
    description:
      "Xem cấu trúc bài đọc và mở đúng đề thi đã xuất bản sau khi đăng nhập.",
    previewTitle: "Reading passage & answer sheet",
    accent: "from-[#1599DE] via-[#46CFE1] to-[#54DDD1]",
  },
  listening: {
    label: "Listening",
    eyebrow: "IELTS Academic Listening",
    icon: Headphones,
    description:
      "Xem trước bố cục phòng nghe. Audio và câu hỏi chỉ mở trong phiên thi của học viên.",
    previewTitle: "Listening player & questions",
    accent: "from-[#0CB8B5] via-[#46DACD] to-[#58BDEB]",
  },
  writing: {
    label: "Writing",
    eyebrow: "IELTS Academic Writing",
    icon: PenLine,
    description:
      "Xem trước không gian làm bài. Đề bài và trình soạn thảo chỉ mở sau khi đăng nhập.",
    previewTitle: "Writing prompt & editor",
    accent: "from-[#4D6DDD] via-[#4DA7E8] to-[#48D4D0]",
  },
  speaking: {
    label: "Speaking",
    eyebrow: "IELTS Speaking Practice",
    icon: Mic,
    description:
      "Xem trước giao diện ghi âm. Câu hỏi và bộ đếm thời gian chỉ mở trong phiên luyện nói.",
    previewTitle: "Speaking prompts & recorder",
    accent: "from-[#11B89D] via-[#49D4C5] to-[#4CAFEA]",
  },
};

function extractDetail(payload: unknown): PublicDetailData | null {
  if (!payload || typeof payload !== "object") return null;

  const envelope = payload as {
    data?: unknown;
  };

  if (envelope.data && typeof envelope.data === "object") {
    return envelope.data as PublicDetailData;
  }

  return payload as PublicDetailData;
}

function formatMinutes(seconds?: number | null) {
  if (!seconds || seconds <= 0) return "Theo cấu hình đề";
  return `${Math.max(1, Math.round(seconds / 60))} phút`;
}

function statusLabel(status?: string | null) {
  return status === "PUBLISHED" ? "Đã xuất bản" : "Công khai";
}

function testTypeLabel(type?: string | null) {
  const labels: Record<string, string> = {
    READING: "Reading",
    LISTENING: "Listening",
    WRITING: "Writing",
    SPEAKING: "Speaking",
    FULL: "Full Test",
  };

  return labels[type || ""] || type || "IELTS Test";
}

function MockLines({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-3 rounded-full bg-gradient-to-r from-[#CFE6EF] via-[#E2F2F7] to-[#D4EAF2]"
          style={{ width: `${88 - ((index * 13) % 28)}%` }}
        />
      ))}
    </div>
  );
}

function LockedExamCanvas({
  kind,
  title,
}: {
  kind: PublicDetailKind;
  title: string;
}) {
  if (kind === "listening") {
    return (
      <div className="grid min-h-[520px] gap-5 lg:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-[24px] border border-[#D7EAF2] bg-white p-5">
          <div className="flex items-center gap-4 rounded-2xl border border-[#D9ECF4] bg-[#F4FBFE] p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0AAEB4] text-white">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-[#D4EAF1]">
                <div className="h-2 w-1/3 rounded-full bg-[#36C9C5]" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-[#5B7C8F]">
                <span>00:00</span>
                <span>Audio IELTS</span>
              </div>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-[#DDECF2] p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1584B7]">
              Section 1
            </p>
            <h3 className="mt-2 text-lg font-bold text-[#083D62]">{title}</h3>
            <div className="mt-5">
              <MockLines count={10} />
            </div>
          </div>
        </section>
        <MockQuestionPanel />
      </div>
    );
  }

  if (kind === "writing") {
    return (
      <div className="grid min-h-[520px] gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <section className="rounded-[24px] border border-[#D7EAF2] bg-white p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#4D69CF]">
            Writing task
          </p>
          <h3 className="mt-3 text-xl font-bold text-[#083D62]">{title}</h3>
          <div className="mt-6 rounded-2xl border border-[#DDECF2] bg-[#F6FBFE] p-5">
            <MockLines count={11} />
          </div>
          <div className="mt-5 flex h-40 items-center justify-center rounded-2xl border border-dashed border-[#C9E2EC] bg-gradient-to-br from-[#F0F9FD] to-[#EAF7FB]">
            <FileText className="h-12 w-12 text-[#79A9BF]" />
          </div>
        </section>
        <section className="rounded-[24px] border border-[#D7EAF2] bg-white p-5">
          <div className="flex items-center justify-between border-b border-[#E1EEF3] pb-4">
            <span className="font-bold text-[#083D62]">Bài viết của bạn</span>
            <span className="rounded-full bg-[#EEF7FB] px-3 py-1 text-xs font-semibold text-[#5F7D8F]">
              0 từ
            </span>
          </div>
          <div className="mt-5 h-[390px] rounded-2xl border border-[#D9E9F0] bg-[#FCFEFF] p-5">
            <MockLines count={14} />
          </div>
        </section>
      </div>
    );
  }

  if (kind === "speaking") {
    return (
      <div className="min-h-[520px] rounded-[24px] border border-[#D7EAF2] bg-white p-6">
        <div className="flex flex-wrap gap-2">
          {["Part 1", "Part 2", "Part 3"].map((part, index) => (
            <span
              key={part}
              className={`rounded-full px-4 py-2 text-sm font-bold ${
                index === 0
                  ? "bg-[#0EAA9D] text-white"
                  : "border border-[#D7E9EF] bg-[#F8FCFE] text-[#5E7B8C]"
              }`}
            >
              {part}
            </span>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-2xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#28C8B2] to-[#3A9FDD] text-white shadow-[0_16px_40px_rgba(25,167,177,.25)]">
            <Mic className="h-8 w-8" />
          </div>
          <h3 className="mt-6 text-2xl font-bold text-[#083D62]">{title}</h3>
          <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-[#DCECF2] bg-[#F7FCFE] p-6 text-left">
            <MockLines count={8} />
          </div>
          <div className="mt-7 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#587A8C]">
              <Clock3 className="h-4 w-4" />
              00:00
            </div>
            <div className="h-14 w-14 rounded-full border-[5px] border-[#CDE8EE] bg-[#F6FCFD]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-[520px] gap-5 lg:grid-cols-[1.08fr_.92fr]">
      <section className="rounded-[24px] border border-[#D7EAF2] bg-white p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1584B7]">
          Reading passage
        </p>
        <h3 className="mt-3 text-xl font-bold text-[#083D62]">{title}</h3>
        <div className="mt-6">
          <MockLines count={22} />
        </div>
      </section>
      <MockQuestionPanel />
    </div>
  );
}

function MockQuestionPanel() {
  return (
    <section className="rounded-[24px] border border-[#D7EAF2] bg-white p-5">
      <div className="flex items-center justify-between border-b border-[#E1EEF3] pb-4">
        <span className="font-bold text-[#083D62]">Questions</span>
        <span className="text-xs font-semibold text-[#658394]">1 / 40</span>
      </div>
      <div className="mt-5 space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[#DCEBF1] bg-[#FBFEFF] p-4"
          >
            <div className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6F6FA] text-xs font-bold text-[#1683A9]">
                {index + 1}
              </span>
              <div className="flex-1">
                <MockLines count={2} />
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="h-9 rounded-xl border border-[#DCEAF0] bg-white" />
                  <div className="h-9 rounded-xl border border-[#DCEAF0] bg-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PublicDetailPage({
  kind,
  id,
  backHref,
  query,
}: PublicDetailPageProps) {
  const pathname = usePathname();
  const { data: rawData, loading, error } = useApiQuery(query, [id]);
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const appRole = useAuthStore((state) => state.appRole);

  const data = useMemo(() => extractDetail(rawData), [rawData]);
  const config = KIND_CONFIG[kind];
  const Icon = config.icon;

  const availableTests = useMemo(
    () => (Array.isArray(data?.availableTests) ? data.availableTests : []),
    [data?.availableTests],
  );

  const [selectedSectionId, setSelectedSectionId] = useState("");

  useEffect(() => {
    if (availableTests.length === 0) {
      setSelectedSectionId("");
      return;
    }

    const currentStillExists = availableTests.some(
      (item) => item.sectionId === selectedSectionId,
    );

    if (!currentStillExists) {
      setSelectedSectionId(availableTests[0].sectionId);
    }
  }, [availableTests, selectedSectionId]);

  const selectedTest =
    availableTests.find((item) => item.sectionId === selectedSectionId) ||
    availableTests[0];

  const title =
    data?.title?.trim() || data?.topic?.trim() || "Nội dung luyện tập IELTS";

  const loginHref = `/auth/login?next=${encodeURIComponent(pathname)}`;
  const registerHref = `/auth/register?next=${encodeURIComponent(pathname)}`;

  const learnerHref = selectedTest
    ? `/learner/tests/${encodeURIComponent(
        selectedTest.testId,
      )}?sectionId=${encodeURIComponent(selectedTest.sectionId)}`
    : null;

  const countLabel =
    kind === "speaking"
      ? `${data?.partCount ?? 0} phần`
      : kind === "writing"
        ? data?.taskNo
          ? `Writing Task ${data.taskNo}`
          : "Writing task"
        : `${data?.questionCount ?? 0} câu hỏi`;

  return (
    <div className="ocean-landing min-h-screen bg-[#F5FCFF] text-[#063B65]">
      <PublicHeader />

      <main>
        <section className="ocean-hero relative isolate overflow-hidden border-b border-[#D7EDF6]">
          <div
            className="ocean-sparkle-layer pointer-events-none absolute inset-0 opacity-70"
            aria-hidden="true"
          />
          <div className="ocean-orb ocean-orb-one" aria-hidden="true" />
          <div className="ocean-orb ocean-orb-two" aria-hidden="true" />

          <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 lg:pb-24 lg:pt-16">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/60 px-4 py-2 text-sm font-bold text-[#176F9E] shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại thư viện
            </Link>

            <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0877B5] shadow-sm backdrop-blur-xl">
                  <Sparkles className="h-4 w-4 text-[#09AAA8]" />
                  {config.eyebrow}
                </div>

                <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.04em] text-[#063B65] sm:text-5xl lg:text-6xl">
                  {title}
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-8 text-[#4E7489] sm:text-lg">
                  {config.description}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <span className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-[#166F9D] backdrop-blur-xl">
                    {statusLabel(data?.status)}
                  </span>
                  <span className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-[#166F9D] backdrop-blur-xl">
                    {typeof data?.level === "number"
                      ? `Band ${data.level}`
                      : "Mọi trình độ"}
                  </span>
                  <span className="rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-bold text-[#166F9D] backdrop-blur-xl">
                    {countLabel}
                  </span>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/80 bg-white/64 p-5 shadow-[0_24px_65px_rgba(20,115,169,.13)] backdrop-blur-2xl">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${config.accent} text-white shadow-lg`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.18em] text-[#1681AD]">
                  Đề thi khả dụng
                </p>
                <p className="mt-2 text-3xl font-black text-[#063B65]">
                  {availableTests.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#5A7D8F]">
                  Chỉ các đề đã xuất bản và có chứa nội dung này mới được hiển
                  thị.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-7xl px-5 py-10 lg:py-14">
          {loading ? (
            <div className="h-[620px] animate-pulse rounded-[32px] border border-[#D8EDF5] bg-white/70" />
          ) : error ? (
            <div className="rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm">
              <p className="font-bold text-red-700">Không thể tải nội dung</p>
              <p className="mt-2 text-sm text-red-600">{error}</p>
            </div>
          ) : !data ? (
            <div className="rounded-[28px] border border-[#D8EDF5] bg-white p-10 text-center">
              Không tìm thấy nội dung công khai.
            </div>
          ) : (
            <div className="grid gap-7 xl:grid-cols-[1fr_340px]">
              <div className="relative overflow-hidden rounded-[32px] border border-[#CFE7F1] bg-white/78 p-3 shadow-[0_28px_80px_rgba(19,100,151,.11)] backdrop-blur-xl sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1680AD]">
                      Phòng thi mô phỏng
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#063B65]">
                      {config.previewTitle}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[#D5EAF2] bg-[#F7FCFE] px-3 py-2 text-xs font-bold text-[#55798C]">
                    <ShieldCheck className="h-4 w-4 text-[#0AA59F]" />
                    Nội dung thật đã được bảo vệ
                  </div>
                </div>

                <div
                  className="pointer-events-none select-none blur-[1.6px] saturate-[.75]"
                  aria-hidden="true"
                >
                  <LockedExamCanvas kind={kind} title={title} />
                </div>

                <div className="absolute inset-3 flex items-center justify-center rounded-[26px] bg-gradient-to-b from-white/5 via-white/30 to-white/55 p-5 sm:inset-5">
                  <div className="w-full max-w-lg rounded-[28px] border border-white/90 bg-white/84 p-6 text-center shadow-[0_24px_80px_rgba(13,92,140,.20)] backdrop-blur-2xl sm:p-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16BFC1] to-[#278DD5] text-white shadow-[0_16px_38px_rgba(20,157,188,.28)]">
                      <LockKeyhole className="h-7 w-7" />
                    </div>

                    {!hydrated ? (
                      <>
                        <h3 className="mt-5 text-2xl font-black text-[#063B65]">
                          Đang kiểm tra phiên đăng nhập
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#5A7D8F]">
                          Vui lòng chờ trong giây lát.
                        </p>
                      </>
                    ) : !user ? (
                      <>
                        <h3 className="mt-5 text-2xl font-black text-[#063B65]">
                          Đăng nhập để bắt đầu làm bài
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#5A7D8F]">
                          Đăng nhập giúp hệ thống tạo phiên thi, lưu tiến độ và
                          trả kết quả đúng cho tài khoản của bạn.
                        </p>
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                          <Link
                            href={loginHref}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0CB7B7] to-[#258ED6] px-5 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(20,151,184,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(20,151,184,.32)]"
                          >
                            Đăng nhập để làm bài
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                          <Link
                            href={registerHref}
                            className="inline-flex items-center justify-center rounded-2xl border border-[#BFDDE9] bg-white px-5 py-3 text-sm font-extrabold text-[#116E9D] transition hover:-translate-y-0.5 hover:bg-[#F2FBFE]"
                          >
                            Đăng ký miễn phí
                          </Link>
                        </div>
                      </>
                    ) : appRole !== "LEARNER" ? (
                      <>
                        <h3 className="mt-5 text-2xl font-black text-[#063B65]">
                          Chỉ tài khoản học viên được làm bài
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#5A7D8F]">
                          Bạn đang đăng nhập bằng vai trò{" "}
                          <strong>
                            {appRole === "TEACHER"
                              ? "Giáo viên"
                              : "Quản trị viên"}
                          </strong>
                          . Hãy sử dụng tài khoản học viên để tạo phiên thi.
                        </p>
                      </>
                    ) : availableTests.length === 0 ? (
                      <>
                        <h3 className="mt-5 text-2xl font-black text-[#063B65]">
                          Chưa có đề thi khả dụng
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#5A7D8F]">
                          Nội dung này đã được công khai nhưng chưa nằm trong
                          một đề thi đã xuất bản.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="mt-5 text-2xl font-black text-[#063B65]">
                          Bạn đã sẵn sàng luyện tập
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-[#5A7D8F]">
                          Chọn đề bên cạnh rồi mở trang thiết lập thời gian và
                          bắt đầu phiên thi.
                        </p>
                        {learnerHref ? (
                          <Link
                            href={learnerHref}
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0CB7B7] to-[#258ED6] px-6 py-3 text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(20,151,184,.25)] transition hover:-translate-y-0.5"
                          >
                            Mở đề thi
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-[28px] border border-[#D3EAF3] bg-white/82 p-5 shadow-[0_20px_60px_rgba(23,104,153,.09)] backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F8FB] text-[#0B9DA2]">
                      <Waves className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1680AD]">
                        Thông tin nhanh
                      </p>
                      <h3 className="font-black text-[#063B65]">
                        {config.label}
                      </h3>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-4 text-sm">
                    <div className="flex justify-between gap-4 border-b border-[#E4F0F4] pb-3">
                      <dt className="text-[#648294]">Trình độ</dt>
                      <dd className="font-bold text-[#123F5C]">
                        {typeof data.level === "number"
                          ? `Band ${data.level}`
                          : "Mọi trình độ"}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#E4F0F4] pb-3">
                      <dt className="text-[#648294]">Cấu trúc</dt>
                      <dd className="font-bold text-[#123F5C]">{countLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#648294]">Trạng thái</dt>
                      <dd className="font-bold text-[#0A928C]">
                        {statusLabel(data.status)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-[28px] border border-[#D3EAF3] bg-white/82 p-5 shadow-[0_20px_60px_rgba(23,104,153,.09)] backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#2878C1]">
                      <TimerReset className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1680AD]">
                        Chọn đề thi
                      </p>
                      <h3 className="font-black text-[#063B65]">
                        {availableTests.length > 0
                          ? `${availableTests.length} lựa chọn`
                          : "Chưa có đề"}
                      </h3>
                    </div>
                  </div>

                  {availableTests.length > 0 ? (
                    <div className="mt-5 space-y-3">
                      {availableTests.map((item) => {
                        const active = item.sectionId === selectedSectionId;

                        return (
                          <button
                            key={`${item.testId}-${item.sectionId}`}
                            type="button"
                            onClick={() => setSelectedSectionId(item.sectionId)}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                              active
                                ? "border-[#40BFC6] bg-[#EDFCFC] shadow-[0_10px_28px_rgba(25,162,172,.11)]"
                                : "border-[#DCECF2] bg-[#FBFEFF] hover:border-[#A8D8E4] hover:bg-[#F5FCFE]"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                  active
                                    ? "border-[#19AAA7] bg-[#19AAA7] text-white"
                                    : "border-[#BFD8E2] bg-white text-transparent"
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block font-bold text-[#123F5C]">
                                  {item.testTitle}
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-[#648294]">
                                  {testTypeLabel(item.testType)}
                                  {item.partLabel ? ` · ${item.partLabel}` : ""}
                                  {` · ${formatMinutes(item.timeLimitSec)}`}
                                </span>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-5 rounded-2xl border border-dashed border-[#CFE3EB] bg-[#F8FCFE] p-4 text-sm leading-6 text-[#678494]">
                      Admin cần thêm nội dung này vào một test và publish test
                      trước khi học viên có thể làm bài.
                    </p>
                  )}
                </div>

                <div className="rounded-[28px] border border-[#CFE8F0] bg-gradient-to-br from-[#EAFBFD] to-[#EDF6FF] p-5">
                  <div className="flex items-start gap-3">
                    <UserRoundCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#0B9C99]" />
                    <p className="text-sm leading-6 text-[#4F7588]">
                      Phòng thi thật chỉ lấy nội dung từ snapshot của attempt.
                      Guest không nhận passage, audio, prompt hoặc câu hỏi thật
                      qua API public.
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
