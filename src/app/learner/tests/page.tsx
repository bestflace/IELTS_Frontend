"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Headphones,
  Loader2,
  Mic,
  PenLine,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";

import { getTests } from "@/lib/api/tests.api";
import type { Test, TestType } from "@/types";

type TestTab = "ALL" | TestType;

const tabs: {
  key: TestTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "ALL", label: "Tất cả", icon: FileText },
  { key: "READING", label: "Reading", icon: BookOpen },
  { key: "LISTENING", label: "Listening", icon: Headphones },
  { key: "WRITING", label: "Writing", icon: PenLine },
  { key: "SPEAKING", label: "Speaking", icon: Mic },
];

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

function TestCard({ test }: { test: Test }) {
  const Icon = skillIcon(test.type);

  return (
    <Link
      href={`/learner/tests/${test.id}`}
      className="group relative overflow-hidden rounded-[30px] border border-white/80 bg-white/85 p-5 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-[0_28px_90px_rgba(14,165,233,0.18)]"
    >
      <div
        aria-hidden="true"
        className={`absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${testCardAccent(test.type)} blur-3xl transition group-hover:scale-110`}
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
  const [tab, setTab] = useState<TestTab>("ALL");
  const [search, setSearch] = useState("");
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTests() {
    setLoading(true);
    setError("");

    try {
      const payload = await getTests(
        tab === "ALL" ? { limit: 100 } : { type: tab, limit: 100 },
      );
      setTests(unwrapItems<Test>(payload));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải danh sách đề",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTests();
  }, [tab]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return tests;

    return tests.filter(
      (test) =>
        test.title?.toLowerCase().includes(q) ||
        test.description?.toLowerCase().includes(q) ||
        test.type?.toLowerCase().includes(q),
    );
  }, [tests, search]);

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

      <section className="relative overflow-hidden rounded-[38px] border border-white/70 bg-white/80 p-7 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl md:p-10">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Đề thi
            </p>

            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              Thư viện đề luyện IELTS
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Chọn kỹ năng hoặc xem tất cả đề đã được admin xuất bản. Nhấn vào
              đề để xem chi tiết, làm bài và xem lại kết quả.
            </p>
          </div>

          <div className="relative w-full lg:w-[360px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500" />
            <input
              className="h-13 w-full rounded-3xl border border-cyan-100 bg-white/90 px-4 py-4 pl-11 text-sm font-semibold text-slate-900 outline-none shadow-[0_14px_35px_rgba(14,165,233,0.08)] backdrop-blur-xl placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              placeholder="Tìm đề thi..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-[30px] border border-white/70 bg-white/80 p-2 shadow-[0_18px_60px_rgba(14,165,233,0.08)] backdrop-blur-xl">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = tab === key;

          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={
                active
                  ? "inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_28px_rgba(14,165,233,0.24)]"
                  : "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
              }
              type="button"
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <section className="rounded-[36px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <div className="flex flex-col gap-3 border-b border-cyan-100/80 px-6 py-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">
              Test library
            </p>
            <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
              Danh sách đề
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Đang hiển thị {filtered.length} đề phù hợp.
            </p>
          </div>

          <button
            onClick={loadTests}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-white/80 px-4 text-sm font-black text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
            type="button"
          >
            <RefreshCcw className="h-4 w-4" />
            Tải lại
          </button>
        </div>

        <div className="p-5 md:p-6">
          {loading ? (
            <div className="grid min-h-[260px] place-items-center rounded-[30px] border border-cyan-100 bg-cyan-50/50">
              <div className="text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-700" />
                <p className="mt-3 text-sm font-bold text-slate-500">
                  Đang tải danh sách đề...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-[30px] border border-rose-100 bg-rose-50 p-8 text-center">
              <p className="font-serif text-2xl font-black text-slate-950">
                Không thể tải danh sách đề
              </p>
              <p className="mt-2 text-sm text-rose-600">{error}</p>
            </div>
          ) : filtered.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          ) : (
            <div className="rounded-[30px] border border-dashed border-cyan-200 bg-cyan-50/60 p-8 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-cyan-700" />
              <h3 className="mt-4 font-serif text-2xl font-black text-slate-950">
                Chưa có đề phù hợp
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Thử đổi bộ lọc kỹ năng hoặc từ khóa tìm kiếm.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
