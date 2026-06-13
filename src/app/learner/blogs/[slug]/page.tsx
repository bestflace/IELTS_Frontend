"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Newspaper,
  Quote,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getBlogBySlug } from "@/lib/api/blogs.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Blog } from "@/types";

function formatDate(value?: string | null) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getBlogDate(blog: Blog) {
  return blog.publishedAt || blog.updatedAt || blog.createdAt;
}

function getReadingTime(content?: string | null) {
  if (!content) return "1 phút đọc";

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} phút đọc`;
}

function getAuthorName(blog: Blog) {
  return blog.author?.fullName || blog.author?.email || "IELTSBF";
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    const key = `${index}-${part.slice(0, 8)}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-black text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={key}
          className="rounded-lg border border-cyan-100 bg-cyan-50 px-1.5 py-0.5 text-sm font-semibold text-sky-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return part;
  });
}

function renderMarkdownLite(content: string) {
  const lines = content.split("\n");

  return lines.map((line, index) => {
    const key = `${index}-${line.slice(0, 12)}`;
    const trimmed = line.trim();

    if (!trimmed) {
      return <div key={key} className="h-4" />;
    }

    if (trimmed.startsWith("# ")) {
      return (
        <h2
          key={key}
          className="mt-10 scroll-mt-24 font-serif text-3xl font-black leading-tight text-slate-950 md:text-4xl"
        >
          {trimmed.replace(/^#\s+/, "")}
        </h2>
      );
    }

    if (trimmed.startsWith("## ")) {
      return (
        <h3
          key={key}
          className="mt-9 scroll-mt-24 font-serif text-2xl font-black leading-tight text-slate-950 md:text-3xl"
        >
          {trimmed.replace(/^##\s+/, "")}
        </h3>
      );
    }

    if (trimmed.startsWith("> ")) {
      return (
        <blockquote
          key={key}
          className="my-7 overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6 shadow-[0_16px_45px_rgba(14,165,233,0.08)]"
        >
          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Quote className="h-5 w-5" />
            </span>
            <p className="font-serif text-lg italic leading-8 text-slate-800">
              {renderInlineMarkdown(trimmed.replace(/^>\s+/, ""))}
            </p>
          </div>
        </blockquote>
      );
    }

    if (trimmed.startsWith("- ")) {
      return (
        <li
          key={key}
          className="ml-6 list-disc pl-2 text-base leading-8 text-slate-700 marker:text-cyan-500"
        >
          {renderInlineMarkdown(trimmed.replace(/^-\s+/, ""))}
        </li>
      );
    }

    return (
      <p key={key} className="text-base leading-8 text-slate-700">
        {renderInlineMarkdown(line)}
      </p>
    );
  });
}

export default function LearnerBlogDetailPage() {
  const params = useParams();
  const slug = String(params.slug);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getBlogBySlug(slug);
      setBlog(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderedContent = useMemo(() => {
    if (!blog?.contentMarkdown) return null;
    return renderMarkdownLite(blog.contentMarkdown);
  }, [blog?.contentMarkdown]);

  if (loading) {
    return (
      <div className="relative min-h-[60vh] overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <LoadingState label="Đang tải bài viết..." />
      </div>
    );
  }

  if (error && !blog) {
    return (
      <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <EmptyState
            title="Không tìm thấy bài viết"
            description="Bài viết có thể đã bị gỡ xuất bản hoặc đường dẫn không hợp lệ."
            action={
              <Link href="/learner/blogs">
                <Button variant="outline">Quay lại Blog</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 -top-24 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-96 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-5xl space-y-6">
        <Link href="/learner/blogs" className="inline-flex">
          <Button
            variant="outline"
            className="rounded-2xl border-cyan-200 bg-white/80 text-sky-700 shadow-sm backdrop-blur hover:border-cyan-300 hover:bg-cyan-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Blog
          </Button>
        </Link>

        <article className="space-y-6">
          <header className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_28px_90px_rgba(14,165,233,0.14)] backdrop-blur-2xl">
            <div className="relative p-7 md:p-10">
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl"
              />

              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  IELTSBF Article
                </p>

                {blog.tags?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {blog.tags.map((tag) => (
                      <Badge key={tag.id} tone="info">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                <h1 className="mt-5 font-serif text-4xl font-black leading-tight text-slate-950 md:text-6xl">
                  {blog.title}
                </h1>

                {blog.excerpt ? (
                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    {blog.excerpt}
                  </p>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
                  {formatDate(getBlogDate(blog)) ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-4 py-2">
                      <CalendarDays className="h-4 w-4 text-cyan-500" />
                      {formatDate(getBlogDate(blog))}
                    </span>
                  ) : null}

                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-4 py-2">
                    <Clock3 className="h-4 w-4 text-sky-500" />
                    {getReadingTime(blog.contentMarkdown)}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-4 py-2">
                    <UserRound className="h-4 w-4 text-blue-500" />
                    {getAuthorName(blog)}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative h-[260px] overflow-hidden border-t border-sky-100 md:h-[420px]">
              {blog.coverImageUrl ? (
                <img
                  src={blog.coverImageUrl}
                  alt={blog.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100">
                  <Newspaper className="h-16 w-16 text-sky-600/70" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/35 to-transparent" />
            </div>
          </header>

          <Card className="rounded-[36px] border border-white/70 bg-white/88 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <CardContent className="p-7 md:p-10">
              <div className="mx-auto max-w-3xl space-y-4">
                {renderedContent || (
                  <p className="text-base leading-8 text-slate-600">
                    Bài viết chưa có nội dung.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-[32px] border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-6 shadow-[0_18px_60px_rgba(14,165,233,0.10)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
                  Tiếp tục luyện tập
                </p>
                <h2 className="mt-2 font-serif text-2xl font-black text-slate-950">
                  Sẵn sàng áp dụng kiến thức vào bài thi?
                </h2>
              </div>

              <Link href="/learner/tests">
                <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.34)]">
                  Luyện đề ngay
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
