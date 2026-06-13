"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Headphones,
  Mic,
  PenLine,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { useApiQuery } from "@/hooks/useApiQuery";

export type PublicCatalogKind =
  | "reading"
  | "listening"
  | "writing"
  | "speaking";

type CatalogTag = {
  id?: string;
  name?: string | null;
  slug?: string | null;
};

type CatalogItem = {
  id?: string;
  title?: string | null;
  topic?: string | null;
  description?: string | null;
  level?: number | null;
  status?: string | null;
  taskNo?: 1 | 2 | null;
  promptText?: string | null;
  passageText?: string | null;
  passageHtml?: string | null;
  transcriptText?: string | null;
  audioUrl?: string | null;
  hasAudio?: boolean;
  hasVisual?: boolean;
  questionCount?: number | null;
  partCount?: number | null;
  questions?: unknown[] | null;
  parts?: unknown[] | null;
  tags?: CatalogTag[] | null;
};

type PublicCatalogPageProps = {
  kind: PublicCatalogKind;
  title: string;
  description: string;
  query: () => Promise<unknown>;
  basePath: string;
};

type KindConfig = {
  label: string;
  eyebrow: string;
  icon: LucideIcon;
  iconClassName: string;
  iconSurfaceClassName: string;
  accentBarClassName: string;
  badgeClassName: string;
  fallbackDescription: string;
};

const KIND_CONFIG: Record<PublicCatalogKind, KindConfig> = {
  reading: {
    label: "Reading",
    eyebrow: "IELTS Academic Reading",
    icon: BookOpen,
    iconClassName: "text-[#0878C7]",
    iconSurfaceClassName:
      "border-[#BDE8F7] bg-gradient-to-br from-[#E8FAFF] to-[#EAF2FF]",
    accentBarClassName: "from-[#1599DE] via-[#48CFE3] to-[#57E2D7]",
    badgeClassName: "border-[#C4EAF6] bg-[#ECFAFF] text-[#0871AC]",
    fallbackDescription:
      "Luyện đọc học thuật với passage và hệ thống câu hỏi theo chuẩn IELTS.",
  },
  listening: {
    label: "Listening",
    eyebrow: "IELTS Academic Listening",
    icon: Headphones,
    iconClassName: "text-[#009EAE]",
    iconSurfaceClassName:
      "border-[#B9ECEB] bg-gradient-to-br from-[#E7FFFD] to-[#EAF8FF]",
    accentBarClassName: "from-[#0BB7B5] via-[#4DDCCF] to-[#58BDEB]",
    badgeClassName: "border-[#BCECE9] bg-[#ECFFFD] text-[#07878D]",
    fallbackDescription:
      "Luyện nghe với audio, transcript và câu hỏi theo từng phần của bài thi.",
  },
  writing: {
    label: "Writing",
    eyebrow: "IELTS Academic Writing",
    icon: PenLine,
    iconClassName: "text-[#476AD8]",
    iconSurfaceClassName:
      "border-[#D3DDFB] bg-gradient-to-br from-[#F0F3FF] to-[#EAFBFF]",
    accentBarClassName: "from-[#4E6EDD] via-[#4DA8E9] to-[#49D6D1]",
    badgeClassName: "border-[#D4DDFB] bg-[#F2F4FF] text-[#405DB7]",
    fallbackDescription:
      "Luyện Writing Task 1 và Task 2 với đề bài rõ ràng, đúng cấu trúc IELTS.",
  },
  speaking: {
    label: "Speaking",
    eyebrow: "IELTS Speaking Practice",
    icon: Mic,
    iconClassName: "text-[#0A9B8F]",
    iconSurfaceClassName:
      "border-[#BEEBE2] bg-gradient-to-br from-[#EBFFF9] to-[#EAF7FF]",
    accentBarClassName: "from-[#10B89D] via-[#4DD6C7] to-[#4CAFEA]",
    badgeClassName: "border-[#C3ECE4] bg-[#EFFFFA] text-[#087F75]",
    fallbackDescription:
      "Luyện Speaking Part 1–3 theo chủ đề, cue card và câu hỏi mở rộng.",
  },
};

function extractItems(payload: unknown): CatalogItem[] {
  if (Array.isArray(payload)) {
    return payload as CatalogItem[];
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const envelope = payload as {
    data?: unknown;
    items?: unknown;
  };

  if (Array.isArray(envelope.items)) {
    return envelope.items as CatalogItem[];
  }

  if (Array.isArray(envelope.data)) {
    return envelope.data as CatalogItem[];
  }

  if (envelope.data && typeof envelope.data === "object") {
    const nested = envelope.data as {
      data?: unknown;
      items?: unknown;
    };

    if (Array.isArray(nested.items)) {
      return nested.items as CatalogItem[];
    }

    if (Array.isArray(nested.data)) {
      return nested.data as CatalogItem[];
    }
  }

  return [];
}

function stripHtml(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getItemTitle(item: CatalogItem, index: number) {
  return (
    item.title?.trim() || item.topic?.trim() || `Bài luyện tập ${index + 1}`
  );
}

function getItemDescription(item: CatalogItem, fallbackDescription: string) {
  return (
    item.description?.trim() ||
    item.promptText?.trim() ||
    item.passageText?.trim() ||
    stripHtml(item.passageHtml) ||
    item.transcriptText?.trim() ||
    fallbackDescription
  );
}

function getLevelLabel(level?: number | null) {
  return typeof level === "number" ? `Band ${level}` : "Mọi trình độ";
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "PUBLISHED":
      return "Đã xuất bản";
    case "DRAFT":
      return "Bản nháp";
    case "ARCHIVED":
      return "Đã lưu trữ";
    default:
      return "Công khai";
  }
}

function getStructureLabel(item: CatalogItem, kind: PublicCatalogKind) {
  if (kind === "writing" && item.taskNo) {
    return `Task ${item.taskNo}`;
  }

  if (kind === "speaking") {
    if (typeof item.partCount === "number") {
      return `${item.partCount} phần luyện nói`;
    }

    if (Array.isArray(item.parts)) {
      return `${item.parts.length} phần luyện nói`;
    }
  }

  if (typeof item.questionCount === "number") {
    return `${item.questionCount} câu hỏi`;
  }

  if (Array.isArray(item.questions)) {
    return `${item.questions.length} câu hỏi`;
  }

  if (kind === "listening" && (item.hasAudio || item.audioUrl)) {
    return "Có audio trong phòng thi";
  }

  if (kind === "writing" && item.hasVisual) {
    return "Có hình minh họa trong phòng thi";
  }

  return "Nội dung chuẩn IELTS";
}

function getTagNames(item: CatalogItem) {
  if (!Array.isArray(item.tags)) return [];

  return item.tags
    .map((tag) => tag?.name?.trim())
    .filter((name): name is string => Boolean(name))
    .slice(0, 2);
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[26px] border border-[#D7EDF6] bg-white/75 shadow-[0_18px_55px_rgba(25,108,160,0.08)]"
        >
          <div className="h-1.5 animate-pulse bg-[#DDF4FA]" />
          <div className="space-y-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="h-14 w-14 animate-pulse rounded-2xl bg-[#E7F6FB]" />
              <div className="h-7 w-24 animate-pulse rounded-full bg-[#EAF6FA]" />
            </div>
            <div className="h-7 w-4/5 animate-pulse rounded-lg bg-[#E6F3F8]" />
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-[#EDF7FA]" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-[#EDF7FA]" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-[#EDF7FA]" />
            </div>
            <div className="h-12 animate-pulse rounded-2xl bg-[#E8F5FA]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PublicCatalogPage({
  kind,
  title,
  description,
  query,
  basePath,
}: PublicCatalogPageProps) {
  const { data, loading, error } = useApiQuery(query, []);
  const [keyword, setKeyword] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("ALL");

  const config = KIND_CONFIG[kind];
  const Icon = config.icon;

  const items = useMemo(() => extractItems(data), [data]);

  const availableLevels = useMemo(() => {
    return Array.from(
      new Set(
        items
          .map((item) => item.level)
          .filter((level): level is number => typeof level === "number"),
      ),
    ).sort((a, b) => a - b);
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase("vi");

    return items.filter((item, index) => {
      const titleText = getItemTitle(item, index);
      const descriptionText = getItemDescription(
        item,
        config.fallbackDescription,
      );
      const tagText = getTagNames(item).join(" ");

      const searchableText = [
        titleText,
        descriptionText,
        tagText,
        item.status,
        item.level,
        item.taskNo,
      ]
        .filter((value) => value !== undefined && value !== null)
        .join(" ")
        .toLocaleLowerCase("vi");

      const matchesKeyword = normalizedKeyword
        ? searchableText.includes(normalizedKeyword)
        : true;

      const matchesLevel =
        selectedLevel === "ALL" ? true : String(item.level) === selectedLevel;

      return matchesKeyword && matchesLevel;
    });
  }, [config.fallbackDescription, items, keyword, selectedLevel]);

  const hasActiveFilter = Boolean(keyword.trim()) || selectedLevel !== "ALL";

  const resetFilters = () => {
    setKeyword("");
    setSelectedLevel("ALL");
  };

  return (
    <div className="ocean-landing min-h-screen bg-[#F5FCFF] text-[#063B65]">
      <PublicHeader />

      <main>
        <section className="ocean-hero relative isolate overflow-hidden border-b border-[#D7EDF6]">
          <div
            className="ocean-sparkle-layer pointer-events-none absolute inset-0 opacity-75"
            aria-hidden="true"
          />
          <div className="ocean-orb ocean-orb-one" aria-hidden="true" />
          <div className="ocean-orb ocean-orb-two" aria-hidden="true" />
          <div className="ocean-orb ocean-orb-three" aria-hidden="true" />

          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-24 pt-14 lg:grid-cols-[1fr_360px] lg:items-center lg:pb-28 lg:pt-20">
            <div>
              <div className="ocean-hero-enter ocean-delay-1 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/65 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[#0877B5] shadow-[0_12px_36px_rgba(24,118,174,0.10)] backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-[#09AAA8]" />
                {config.eyebrow}
              </div>

              <h1 className="ocean-hero-enter ocean-delay-2 mt-6 max-w-4xl font-serif text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#063B65] sm:text-5xl lg:text-6xl">
                {title}
              </h1>

              <p className="ocean-hero-enter ocean-delay-3 mt-5 max-w-2xl text-base leading-8 text-[#58778D] sm:text-lg">
                {description}
              </p>

              <div className="ocean-hero-enter ocean-delay-4 mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#3F6E89]">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#09A99F]" />
                  Nội dung công khai
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#09A99F]" />
                  Phù hợp luyện tập tự do
                </span>
                <span className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#09A99F]" />
                  Cập nhật từ hệ thống IELTSBF
                </span>
              </div>
            </div>

            <div className="ocean-hero-enter ocean-delay-4 ocean-float-slow relative mx-auto w-full max-w-sm">
              <div className="ocean-glass ocean-shine relative overflow-hidden rounded-[30px] p-6 shadow-[0_28px_90px_rgba(22,113,174,0.18)]">
                <div className="flex items-center justify-between gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-[22px] border shadow-[0_14px_38px_rgba(20,112,170,0.12)] ${config.iconSurfaceClassName}`}
                  >
                    <Icon className={`h-7 w-7 ${config.iconClassName}`} />
                  </div>
                  <Waves className="h-8 w-8 text-[#53CDDB]/80" />
                </div>

                <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.2em] text-[#7290A3]">
                  Thư viện {config.label}
                </p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <p className="font-serif text-5xl font-black tracking-[-0.04em] text-[#075E99]">
                    {loading ? "…" : items.length}
                  </p>
                  <span className="pb-1 text-sm font-semibold text-[#5F7F93]">
                    nội dung đang có
                  </span>
                </div>

                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#A9DDEB] to-transparent" />

                <p className="mt-5 text-sm leading-6 text-[#5E7D91]">
                  Chọn một nội dung bên dưới để xem thông tin chi tiết trước khi
                  bắt đầu luyện tập.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-11 pb-20">
          <div className="mx-auto max-w-7xl px-5">
            <div className="ocean-glass rounded-[26px] border border-white/90 p-4 shadow-[0_24px_70px_rgba(23,102,154,0.13)] sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[1fr_250px_auto]">
                <label className="relative block">
                  <span className="sr-only">Tìm kiếm nội dung</span>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6C91A7]" />
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder={`Tìm theo tên đề, chủ đề ${config.label}...`}
                    className="h-[52px] w-full rounded-2xl border border-[#CFE7F1] bg-white/90 py-3.5 pl-12 pr-4 text-sm font-medium text-[#0A4D76] outline-none transition placeholder:text-[#8CA7B7] focus:border-[#66C9DC] focus:ring-4 focus:ring-[#7BD7E4]/15"
                  />
                </label>

                <label className="relative block">
                  <span className="sr-only">Lọc theo trình độ</span>
                  <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6C91A7]" />
                  <select
                    value={selectedLevel}
                    onChange={(event) => setSelectedLevel(event.target.value)}
                    className="h-[52px] w-full appearance-none rounded-2xl border border-[#CFE7F1] bg-white/90 py-3.5 pl-11 pr-10 text-sm font-bold text-[#315F7A] outline-none transition focus:border-[#66C9DC] focus:ring-4 focus:ring-[#7BD7E4]/15"
                  >
                    <option value="ALL">Tất cả trình độ</option>
                    {availableLevels.map((level) => (
                      <option key={level} value={String(level)}>
                        Band {level}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6C91A7]">
                    ▼
                  </span>
                </label>

                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilter}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-[#CFE7F1] bg-white/80 px-5 text-sm font-bold text-[#27739A] transition hover:border-[#9DD9E8] hover:bg-[#F0FBFF] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <RotateCcw className="h-4 w-4" />
                  Đặt lại
                </button>
              </div>
            </div>

            <div className="mb-6 mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#1590B4]">
                  Nội dung luyện tập
                </p>
                <h2 className="mt-2 font-serif text-3xl font-black tracking-[-0.025em] text-[#073F67] sm:text-4xl">
                  Chọn đề phù hợp với bạn
                </h2>
              </div>

              {!loading && !error ? (
                <p className="text-sm font-semibold text-[#6A8799]">
                  Hiển thị{" "}
                  <span className="font-extrabold text-[#0873AD]">
                    {filteredItems.length}
                  </span>{" "}
                  / {items.length} nội dung
                </p>
              ) : null}
            </div>

            {loading ? <CatalogSkeleton /> : null}

            {!loading && error ? (
              <div className="rounded-[28px] border border-[#F0CFD1] bg-white p-8 text-center shadow-[0_22px_65px_rgba(143,68,73,0.08)]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1F2] text-[#BE4E58]">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-black text-[#6D3037]">
                  Không thể tải thư viện
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#8A6266]">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0B76B7] px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(11,118,183,0.2)] transition hover:-translate-y-0.5 hover:bg-[#086AA5]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Tải lại trang
                </button>
              </div>
            ) : null}

            {!loading && !error && filteredItems.length === 0 ? (
              <div className="ocean-glass rounded-[30px] px-6 py-16 text-center shadow-[0_22px_65px_rgba(26,105,155,0.09)]">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border ${config.iconSurfaceClassName}`}
                >
                  <Search className={`h-7 w-7 ${config.iconClassName}`} />
                </div>
                <h3 className="mt-6 font-serif text-2xl font-black text-[#073F67]">
                  {items.length === 0
                    ? "Chưa có nội dung công khai"
                    : "Không tìm thấy nội dung phù hợp"}
                </h3>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#69869A]">
                  {items.length === 0
                    ? "Khi quản trị viên xuất bản nội dung, thư viện luyện tập sẽ tự động hiển thị tại đây."
                    : "Hãy thử từ khóa khác hoặc đặt lại bộ lọc trình độ để xem thêm nội dung."}
                </p>
                {hasActiveFilter ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#BEE2EE] bg-white px-5 text-sm font-bold text-[#14759E] transition hover:-translate-y-0.5 hover:bg-[#EFFAFF]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Xóa bộ lọc
                  </button>
                ) : null}
              </div>
            ) : null}

            {!loading && !error && filteredItems.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map((item, index) => {
                  const itemTitle = getItemTitle(item, index);
                  const itemDescription = getItemDescription(
                    item,
                    config.fallbackDescription,
                  );
                  const tagNames = getTagNames(item);
                  const detailHref = item.id
                    ? `${basePath}/${encodeURIComponent(item.id)}`
                    : null;

                  const card = (
                    <article className="ocean-card-lift group relative flex h-full min-h-[350px] flex-col overflow-hidden rounded-[26px] border border-[#D5EBF4] bg-white/90 shadow-[0_18px_55px_rgba(25,108,160,0.09)]">
                      <div
                        className={`h-1.5 w-full bg-gradient-to-r ${config.accentBarClassName}`}
                      />

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border shadow-[0_12px_30px_rgba(17,112,166,0.10)] transition duration-300 group-hover:-translate-y-1 group-hover:rotate-[-2deg] ${config.iconSurfaceClassName}`}
                          >
                            <Icon
                              className={`h-6 w-6 ${config.iconClassName}`}
                            />
                          </div>

                          <span
                            className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.13em] ${config.badgeClassName}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                          <span className="rounded-full border border-[#D7EAF2] bg-[#F5FBFD] px-3 py-1 text-xs font-bold text-[#52778C]">
                            {getLevelLabel(item.level)}
                          </span>
                          <span className="rounded-full border border-[#D7EAF2] bg-[#F5FBFD] px-3 py-1 text-xs font-bold text-[#52778C]">
                            {getStructureLabel(item, kind)}
                          </span>
                        </div>

                        <h3 className="mt-5 font-serif text-[1.55rem] font-black leading-[1.22] tracking-[-0.02em] text-[#073F67] transition duration-300 group-hover:text-[#087AB8]">
                          {itemTitle}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#678397]">
                          {itemDescription}
                        </p>

                        {tagNames.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {tagNames.map((tagName) => (
                              <span
                                key={tagName}
                                className="rounded-lg bg-[#EDF8FC] px-2.5 py-1 text-[11px] font-bold text-[#43809E]"
                              >
                                #{tagName}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-auto pt-6">
                          <div className="h-px bg-gradient-to-r from-[#DCECF3] via-[#BFDDEA] to-transparent" />
                          <div className="mt-5 flex items-center justify-between gap-4">
                            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#7E9AAA]">
                              IELTSBF Library
                            </span>
                            <span className="inline-flex items-center gap-2 text-sm font-extrabold text-[#0876B2] transition group-hover:gap-3 group-hover:text-[#079B9D]">
                              Xem chi tiết
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );

                  return detailHref ? (
                    <Link
                      key={item.id ?? `${itemTitle}-${index}`}
                      href={detailHref}
                      className="ocean-hero-enter block h-full rounded-[26px] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#69CFE0]/30"
                      style={{ animationDelay: `${100 + index * 70}ms` }}
                      aria-label={`Xem chi tiết ${itemTitle}`}
                    >
                      {card}
                    </Link>
                  ) : (
                    <div
                      key={`${itemTitle}-${index}`}
                      className="ocean-hero-enter h-full"
                      style={{ animationDelay: `${100 + index * 70}ms` }}
                    >
                      {card}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
