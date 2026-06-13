"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getBlogs } from "@/lib/api/blogs.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Blog } from "@/types";

function formatDate(value?: string | null) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "short",
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

function BlogCover({
  title,
  coverImageUrl,
  className = "",
}: {
  title: string;
  coverImageUrl?: string | null;
  className?: string;
}) {
  if (coverImageUrl) {
    return (
      <img
        src={coverImageUrl}
        alt={title}
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 ${className}`}
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-2xl" />
        <Newspaper className="relative h-14 w-14 text-sky-600/70" />
      </div>
    </div>
  );
}

export default function LearnerBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getBlogs({
        status: "PUBLISHED",
        limit: 50,
      });

      setBlogs(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredBlogs = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) return blogs;

    return blogs.filter((blog) =>
      `${blog.title} ${blog.excerpt || ""} ${blog.contentMarkdown || ""} ${
        blog.tags?.map((tag) => tag.name).join(" ") || ""
      }`
        .toLowerCase()
        .includes(normalized),
    );
  }, [blogs, keyword]);

  const featuredBlog = filteredBlogs[0];
  const remainingBlogs = filteredBlogs.slice(1);

  if (loading) {
    return (
      <div className="relative min-h-[60vh] overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <LoadingState label="Đang tải bài viết..." />
      </div>
    );
  }

  if (error && !blogs.length) {
    return (
      <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <ErrorState message={error} onRetry={loadData} />
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
        className="pointer-events-none absolute right-0 top-72 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/70 shadow-[0_30px_90px_rgba(14,165,233,0.13)] backdrop-blur-2xl">
          <div className="relative grid gap-8 p-7 md:p-10 lg:grid-cols-[1fr_400px] lg:items-end">
            <div
              aria-hidden="true"
              className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-cyan-300/25 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl"
            />

            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                IELTSBF Blog
              </p>

              <h1 className="mt-5 font-serif text-4xl font-black leading-tight text-slate-950 md:text-6xl">
                Blog học IELTS
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                Đọc bài viết, mẹo học, phân tích kỹ năng và định hướng luyện thi
                IELTS để học hiệu quả hơn mỗi ngày.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-sky-100 bg-white/70 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">
                  {blogs.length} bài viết đã xuất bản
                </span>
                <span className="rounded-full border border-cyan-100 bg-white/70 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm">
                  Tips học thuật & chiến lược band
                </span>
              </div>
            </div>

            <div className="relative rounded-[28px] border border-cyan-100 bg-white/80 p-4 shadow-[0_18px_50px_rgba(14,165,233,0.12)] backdrop-blur-xl">
              <Search className="pointer-events-none absolute left-8 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-500" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm bài viết, chủ đề, kỹ năng..."
                className="h-14 rounded-2xl border-cyan-100 bg-white/90 pl-12 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              />
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl">
            <ErrorState message={error} onRetry={loadData} />
          </div>
        ) : null}

        {!filteredBlogs.length ? (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-xl">
            <EmptyState
              title={
                keyword ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết"
              }
              description={
                keyword
                  ? "Thử đổi từ khóa khác hoặc xóa bộ lọc tìm kiếm."
                  : "Hiện chưa có bài viết nào được xuất bản."
              }
              action={
                keyword ? (
                  <Button variant="outline" onClick={() => setKeyword("")}>
                    <RefreshCw className="h-4 w-4" />
                    Xóa tìm kiếm
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="space-y-6">
            {featuredBlog ? (
              <Link
                href={`/learner/blogs/${featuredBlog.slug}`}
                className="group block"
              >
                <Card className="overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_32px_100px_rgba(14,165,233,0.20)]">
                  <div className="grid lg:grid-cols-[430px_1fr]">
                    <div className="relative min-h-[300px] overflow-hidden">
                      <BlogCover
                        title={featuredBlog.title}
                        coverImageUrl={featuredBlog.coverImageUrl}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
                      <span className="absolute left-5 top-5 rounded-full border border-white/50 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-sky-700 shadow-sm backdrop-blur">
                        Nổi bật
                      </span>
                    </div>

                    <CardContent className="relative flex flex-col justify-center p-7 md:p-10">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                        {formatDate(getBlogDate(featuredBlog)) ? (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-cyan-500" />
                            {formatDate(getBlogDate(featuredBlog))}
                          </span>
                        ) : null}

                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-4 w-4 text-sky-500" />
                          {getReadingTime(featuredBlog.contentMarkdown)}
                        </span>

                        <span>•</span>
                        <span>{getAuthorName(featuredBlog)}</span>
                      </div>

                      {featuredBlog.tags?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {featuredBlog.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag.id} tone="info">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      <h2 className="mt-4 font-serif text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                        {featuredBlog.title}
                      </h2>

                      {featuredBlog.excerpt ? (
                        <p className="mt-4 line-clamp-3 text-base leading-8 text-slate-600">
                          {featuredBlog.excerpt}
                        </p>
                      ) : null}

                      <div className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_rgba(14,165,233,0.30)] transition duration-300 group-hover:gap-3 group-hover:shadow-[0_18px_42px_rgba(37,99,235,0.35)]">
                        Đọc bài viết
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ) : null}

            {remainingBlogs.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {remainingBlogs.map((blog, index) => (
                  <Link
                    key={blog.id}
                    href={`/learner/blogs/${blog.slug}`}
                    className="group block"
                    style={{
                      animationDelay: `${Math.min(index * 70, 420)}ms`,
                    }}
                  >
                    <Card className="h-full overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_26px_80px_rgba(14,165,233,0.18)]">
                      <div className="relative h-48 overflow-hidden">
                        <BlogCover
                          title={blog.title}
                          coverImageUrl={blog.coverImageUrl}
                        />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/30 to-transparent" />
                      </div>

                      <CardContent className="flex h-full flex-col p-5">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                          {formatDate(getBlogDate(blog)) ? (
                            <span>{formatDate(getBlogDate(blog))}</span>
                          ) : null}
                          <span>•</span>
                          <span>{getReadingTime(blog.contentMarkdown)}</span>
                        </div>

                        <h3 className="mt-3 line-clamp-2 font-serif text-2xl font-black leading-tight text-slate-950 transition group-hover:text-sky-700">
                          {blog.title}
                        </h3>

                        {blog.excerpt ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                            {blog.excerpt}
                          </p>
                        ) : null}

                        {blog.tags?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {blog.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag.id} tone="info">
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition group-hover:gap-3 group-hover:text-cyan-600">
                          Xem chi tiết
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
