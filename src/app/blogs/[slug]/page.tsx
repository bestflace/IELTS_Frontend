"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Newspaper,
  Quote,
  UserRound,
} from "lucide-react";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { BlogPublicHeader } from "@/components/blogs/BlogPublicHeader";
import { getBlogBySlug, getBlogs } from "@/lib/api/blogs.api";
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
  return blog.author?.fullName || blog.author?.email || "IELTSBF Editorial";
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    const key = `${index}-${part.slice(0, 8)}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-black text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={key} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
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

    return <span key={key}>{part}</span>;
  });
}

function renderMarkdownLite(content: string) {
  const lines = content.split("\n");

  return lines.map((line, index) => {
    const key = `${index}-${line.slice(0, 20)}`;
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return <div key={key} className="h-3" />;
    }

    const imageMatch = trimmedLine.match(/^!\[(.*?)\]\((.*?)\)$/);

    if (imageMatch) {
      const alt = imageMatch[1] || "Ảnh minh họa";
      const src = imageMatch[2];

      return (
        <figure
          key={key}
          className="my-8 overflow-hidden rounded-[28px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 shadow-[0_16px_45px_rgba(14,165,233,0.08)]"
        >
          <img
            src={src}
            alt={alt}
            className="mx-auto max-h-[560px] w-full object-contain"
          />

          <figcaption className="border-t border-cyan-100 bg-white/70 px-4 py-3 text-center text-xs font-semibold text-slate-500">
            {alt}
          </figcaption>
        </figure>
      );
    }

    if (trimmedLine.startsWith("# ")) {
      return (
        <h2
          key={key}
          className="mt-10 scroll-mt-24 font-serif text-3xl font-black leading-tight text-slate-950 md:text-4xl"
        >
          {trimmedLine.replace(/^#\s+/, "")}
        </h2>
      );
    }

    if (trimmedLine.startsWith("## ")) {
      return (
        <h3
          key={key}
          className="mt-8 scroll-mt-24 font-serif text-2xl font-black leading-tight text-slate-950 md:text-3xl"
        >
          {trimmedLine.replace(/^##\s+/, "")}
        </h3>
      );
    }

    if (trimmedLine.startsWith("> ")) {
      return (
        <blockquote
          key={key}
          className="my-8 overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6 shadow-[0_16px_45px_rgba(14,165,233,0.08)]"
        >
          <div className="flex gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Quote className="h-5 w-5" />
            </span>
            <p className="font-serif text-lg italic leading-8 text-slate-800">
              {renderInline(trimmedLine.replace(/^>\s+/, ""))}
            </p>
          </div>
        </blockquote>
      );
    }

    if (trimmedLine.startsWith("- ")) {
      return (
        <li
          key={key}
          className="ml-6 list-disc pl-2 text-base leading-8 text-slate-700 marker:text-cyan-500"
        >
          {renderInline(trimmedLine.replace(/^-\s+/, ""))}
        </li>
      );
    }

    if (/^\d+\.\s/.test(trimmedLine)) {
      return (
        <li
          key={key}
          className="ml-6 list-decimal pl-2 text-base leading-8 text-slate-700 marker:text-cyan-500"
        >
          {renderInline(trimmedLine.replace(/^\d+\.\s/, ""))}
        </li>
      );
    }

    return (
      <p key={key} className="text-base leading-8 text-slate-700">
        {renderInline(trimmedLine)}
      </p>
    );
  });
}

function BlogTag({ name }: { name: string }) {
  return (
    <Badge
      tone="sage"
      className="border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 text-sky-700 shadow-[0_8px_20px_rgba(14,165,233,0.10)]"
    >
      {name}
    </Badge>
  );
}

export default function PublicBlogDetailPage() {
  const params = useParams();
  const slug = String(params.slug);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [blogData, blogList] = await Promise.all([
        getBlogBySlug(slug),
        getBlogs({ status: "PUBLISHED", limit: 6 }),
      ]);

      setBlog(blogData);
      setRelatedBlogs(
        (blogList.data || []).filter((item) => item.slug !== slug).slice(0, 3),
      );
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
      <>
        <BlogPublicHeader />
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 px-5 py-10">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <LoadingState label="Đang tải bài viết..." />
          </div>
        </main>
      </>
    );
  }

  if (error && !blog) {
    return (
      <>
        <BlogPublicHeader />
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 px-5 py-10">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <ErrorState message={error} onRetry={loadData} />
          </div>
        </main>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <BlogPublicHeader />
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 px-5 py-10">
          <div className="mx-auto max-w-5xl rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <EmptyState
              title="Không tìm thấy bài viết"
              description="Bài viết có thể đã bị gỡ xuất bản hoặc đường dẫn không hợp lệ."
              action={
                <Link href="/blogs">
                  <Button variant="outline">Quay lại Blog</Button>
                </Link>
              }
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <BlogPublicHeader />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-28 top-0 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-[520px] h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"
        />

        <article className="relative mx-auto max-w-6xl px-5 py-8">
          <div className="mb-6">
            <Link href="/blogs">
              <Button
                variant="outline"
                className="rounded-2xl border-cyan-200 bg-white/80 text-sky-700 shadow-sm backdrop-blur hover:border-cyan-300 hover:bg-cyan-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại Blog
              </Button>
            </Link>
          </div>

          <header className="overflow-hidden rounded-[36px] border border-white/70 bg-white/82 shadow-[0_28px_90px_rgba(14,165,233,0.14)] backdrop-blur-2xl">
            <div className="relative mx-auto max-w-4xl px-7 py-10 text-center md:px-10 md:py-12">
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl"
              />

              <div className="relative">
                {blog.tags?.length ? (
                  <div className="flex flex-wrap justify-center gap-2">
                    {blog.tags.slice(0, 4).map((tag) => (
                      <BlogTag key={tag.id} name={tag.name} />
                    ))}
                  </div>
                ) : null}

                <h1 className="mt-6 font-serif text-4xl font-black leading-tight text-slate-950 md:text-6xl">
                  {blog.title}
                </h1>

                {blog.excerpt ? (
                  <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
                    {blog.excerpt}
                  </p>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/75 px-4 py-2">
                    <UserRound className="h-4 w-4 text-blue-500" />
                    {getAuthorName(blog)}
                  </span>

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
                </div>
              </div>
            </div>

            <div className="relative max-h-[560px] overflow-hidden border-t border-cyan-100 bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100">
              {blog.coverImageUrl ? (
                <img
                  src={blog.coverImageUrl}
                  alt={blog.title}
                  className="max-h-[560px] w-full object-cover"
                />
              ) : (
                <div className="flex h-96 items-center justify-center">
                  <Newspaper className="h-16 w-16 text-sky-600/60" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/25 to-transparent" />
            </div>
          </header>

          <Card className="mx-auto mt-9 max-w-4xl rounded-[36px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <CardContent className="p-7 md:p-10">
              <section className="space-y-5">
                {renderedContent || (
                  <p className="text-base leading-8 text-slate-600">
                    Bài viết chưa có nội dung.
                  </p>
                )}
              </section>
            </CardContent>
          </Card>
        </article>

        {relatedBlogs.length ? (
          <section className="relative mx-auto mt-10 max-w-6xl border-t border-white/70 px-5 py-12">
            <div className="mb-7 flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl font-black text-slate-950">
                Bài viết liên quan
              </h2>

              <Link
                href="/blogs"
                className="inline-flex items-center gap-2 text-sm font-black text-sky-700 transition hover:text-cyan-600"
              >
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedBlogs.map((item) => (
                <Link
                  key={item.id}
                  href={`/blogs/${item.slug}`}
                  className="group"
                >
                  <Card className="h-full overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_26px_80px_rgba(14,165,233,0.18)]">
                    <div className="h-40 overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-100">
                      {item.coverImageUrl ? (
                        <img
                          src={item.coverImageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Newspaper className="h-10 w-10 text-sky-600/60" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-5">
                      {item.tags?.[0] ? (
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-700">
                          {item.tags[0].name}
                        </p>
                      ) : null}

                      <h3 className="mt-2 line-clamp-2 font-serif text-xl font-black leading-tight text-slate-950 transition group-hover:text-sky-700">
                        {item.title}
                      </h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <PublicFooter />
    </>
  );
}
