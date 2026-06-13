"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  Mail,
  Newspaper,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { BlogPublicHeader } from "@/components/blogs/BlogPublicHeader";
import { getBlogs } from "@/lib/api/blogs.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Blog } from "@/types";

type BlogTag = NonNullable<Blog["tags"]>[number];

function getBlogDate(blog: Blog) {
  return blog.publishedAt || blog.updatedAt || blog.createdAt;
}

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

function getReadingTime(content?: string | null) {
  if (!content) return "1 phút đọc";

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));

  return `${minutes} phút đọc`;
}

function getExcerpt(blog: Blog) {
  if (blog.excerpt) return blog.excerpt;

  return (
    blog.contentMarkdown
      ?.replace(/[#>*_\-[\]()`]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 150) ||
    "Khám phá thêm kiến thức và kinh nghiệm luyện thi IELTS."
  );
}

function uniqueTags(blogs: Blog[]) {
  const map = new Map<string, BlogTag>();

  blogs.forEach((blog) => {
    blog.tags?.forEach((tag) => {
      if (!map.has(tag.id)) {
        map.set(tag.id, tag);
      }
    });
  });

  return Array.from(map.values());
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
        <Newspaper className="relative h-12 w-12 text-sky-600/70" />
      </div>
    </div>
  );
}

function TagPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_26px_rgba(14,165,233,0.24)]"
          : "rounded-full border border-white/70 bg-white/80 px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm backdrop-blur transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
      }
    >
      {label}
    </button>
  );
}

function BlogTagBadge({ tag }: { tag: BlogTag }) {
  return (
    <Badge
      tone="sage"
      className="border-cyan-200 bg-gradient-to-r from-cyan-50 to-sky-50 text-sky-700 shadow-[0_8px_20px_rgba(14,165,233,0.10)]"
    >
      {tag.name}
    </Badge>
  );
}

export default function PublicBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeTagId, setActiveTagId] = useState<string>("all");

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

  const tags = useMemo(() => uniqueTags(blogs), [blogs]);

  const filteredBlogs = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchKeyword = normalized
        ? `${blog.title} ${blog.excerpt || ""} ${blog.contentMarkdown || ""} ${
            blog.tags?.map((tag) => tag.name).join(" ") || ""
          }`
            .toLowerCase()
            .includes(normalized)
        : true;

      const matchTag =
        activeTagId === "all"
          ? true
          : blog.tags?.some((tag) => tag.id === activeTagId);

      return matchKeyword && matchTag;
    });
  }, [blogs, keyword, activeTagId]);

  const featuredBlog = filteredBlogs[0];
  const remainingBlogs = filteredBlogs.slice(1);
  const popularBlogs = blogs.slice(0, 4);

  if (loading) {
    return (
      <>
        <BlogPublicHeader />
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 px-5 py-10">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-white/70 bg-white/75 p-8 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <LoadingState label="Đang tải bài viết..." />
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
          className="pointer-events-none absolute right-0 top-[420px] h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-8 md:py-10">
          {error && !blogs.length ? (
            <div className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
              <ErrorState message={error} onRetry={loadData} />
            </div>
          ) : null}

          {!blogs.length && !error ? (
            <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
              <EmptyState
                title="Chưa có bài viết"
                description="Hiện chưa có bài viết nào được xuất bản."
              />
            </div>
          ) : null}

          {featuredBlog ? (
            <section className="group grid overflow-hidden rounded-[36px] border border-white/70 bg-white/90 shadow-[0_30px_90px_rgba(14,165,233,0.14)] backdrop-blur-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_38px_110px_rgba(14,165,233,0.20)] lg:grid-cols-[1.12fr_.88fr]">
              <Link
                href={`/blogs/${featuredBlog.slug}`}
                className="relative block h-[300px] overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-100 md:h-[360px]"
              >
                <BlogCover
                  title={featuredBlog.title}
                  coverImageUrl={featuredBlog.coverImageUrl}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
              </Link>

              <div className="relative flex min-h-[300px] flex-col justify-center p-7 md:min-h-[360px] md:p-10">
                <div
                  aria-hidden="true"
                  className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
                />
                <span className="relative w-fit rounded-full border border-cyan-200 bg-cyan-50/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
                  Featured post
                </span>

                <Link href={`/blogs/${featuredBlog.slug}`}>
                  <h1 className="relative mt-6 line-clamp-3 font-serif text-3xl font-black leading-tight text-slate-950 transition group-hover:text-sky-800 md:text-5xl">
                    {featuredBlog.title}
                  </h1>
                </Link>

                <p className="relative mt-5 line-clamp-3 text-base leading-8 text-slate-600">
                  {getExcerpt(featuredBlog)}
                </p>

                <div className="relative mt-7 flex flex-wrap items-center gap-4">
                  <Link
                    href={`/blogs/${featuredBlog.slug}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-black text-white shadow-[0_16px_36px_rgba(14,165,233,0.30)] transition hover:-translate-y-0.5 hover:gap-3 hover:shadow-[0_20px_46px_rgba(37,99,235,0.34)]"
                  >
                    Đọc bài viết
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    <Clock3 className="h-4 w-4 text-sky-500" />
                    {getReadingTime(featuredBlog.contentMarkdown)}
                  </span>
                </div>
              </div>
            </section>
          ) : null}

          <section className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <TagPill
                label="Tất cả"
                active={activeTagId === "all"}
                onClick={() => setActiveTagId("all")}
              />

              {tags.slice(0, 6).map((tag) => (
                <TagPill
                  key={tag.id}
                  label={tag.name}
                  active={activeTagId === tag.id}
                  onClick={() => setActiveTagId(tag.id)}
                />
              ))}
            </div>

            <div className="relative w-full lg:w-[340px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-500" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm bài viết..."
                className="h-14 rounded-full border-white/70 bg-white/90 pl-11 text-slate-900 shadow-[0_14px_34px_rgba(14,165,233,0.10)] backdrop-blur placeholder:text-slate-400 focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              />
            </div>
          </section>

          <section className="mt-8 grid items-start gap-7 lg:grid-cols-[1fr_360px]">
            <div className="grid items-start gap-6 md:grid-cols-2">
              {remainingBlogs.length ? (
                remainingBlogs.map((blog, index) => (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    className="group block"
                    style={{
                      animationDelay: `${Math.min(index * 60, 360)}ms`,
                    }}
                  >
                    <Card className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_26px_80px_rgba(14,165,233,0.18)]">
                      <div className="relative h-52 overflow-hidden">
                        <BlogCover
                          title={blog.title}
                          coverImageUrl={blog.coverImageUrl}
                        />

                        {blog.tags?.[0] ? (
                          <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-700 shadow-sm backdrop-blur">
                            {blog.tags[0].name}
                          </span>
                        ) : null}
                      </div>

                      <CardContent className="p-6">
                        <h2 className="line-clamp-2 font-serif text-2xl font-black leading-tight text-slate-950 transition group-hover:text-sky-700">
                          {blog.title}
                        </h2>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                          {getExcerpt(blog)}
                        </p>

                        {blog.tags?.length ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {blog.tags.slice(0, 2).map((tag) => (
                              <BlogTagBadge key={tag.id} tag={tag} />
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-6 flex items-center justify-between gap-4 text-xs font-semibold text-slate-500">
                          <span>{formatDate(getBlogDate(blog))}</span>
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5 text-sky-500" />
                            {getReadingTime(blog.contentMarkdown)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="md:col-span-2">
                  <div className="rounded-[32px] border border-white/70 bg-white/90 p-8 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
                    <EmptyState
                      title="Không tìm thấy bài viết"
                      description="Thử đổi từ khóa hoặc chọn chuyên mục khác."
                      action={
                        <Button
                          variant="outline"
                          onClick={() => {
                            setKeyword("");
                            setActiveTagId("all");
                          }}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Xóa bộ lọc
                        </Button>
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <Card className="rounded-[30px] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl">
                <CardContent className="p-6">
                  <h3 className="font-serif text-2xl font-black text-slate-950">
                    Bài viết phổ biến
                  </h3>

                  <div className="mt-5 space-y-5 border-t border-cyan-100 pt-5">
                    {popularBlogs.map((blog, index) => (
                      <Link
                        key={blog.id}
                        href={`/blogs/${blog.slug}`}
                        className="block rounded-2xl p-2 transition hover:bg-cyan-50"
                      >
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-700">
                          #{index + 1} Trending
                        </p>
                        <h4 className="mt-1 line-clamp-2 text-sm font-bold leading-6 text-slate-800">
                          {blog.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-[30px] border border-cyan-200 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_22px_70px_rgba(14,165,233,0.24)]">
                <CardContent className="relative p-6">
                  <div
                    aria-hidden="true"
                    className="absolute -right-14 -top-16 h-40 w-40 rounded-full bg-white/20 blur-2xl"
                  />
                  <Mail className="relative h-7 w-7" />
                  <h3 className="relative mt-5 font-serif text-2xl font-black">
                    Đăng ký nhận tin
                  </h3>
                  <p className="relative mt-3 text-sm leading-7 text-white/80">
                    Nhận tài liệu IELTS, bài viết mới và mẹo học mỗi tuần.
                  </p>

                  <div className="relative mt-5 space-y-3">
                    <Input
                      placeholder="Email của bạn"
                      className="border-white/25 bg-white/15 text-white placeholder:text-white/60 focus:border-white/60 focus:ring-white/20"
                    />
                    <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-sky-700 shadow-lg shadow-blue-700/10 transition hover:-translate-y-0.5">
                      Đăng ký ngay
                    </button>
                  </div>

                  <p className="relative mt-4 text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                    Không spam. Chỉ gửi nội dung hữu ích.
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[30px] border border-white/70 bg-white/90 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl">
                <CardContent className="p-6 text-center">
                  <p className="font-serif text-xl italic leading-8 text-slate-800">
                    “IELTS không chỉ là một kỳ thi, đó là cách bạn học cách diễn
                    đạt chính xác hơn.”
                  </p>
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
                    IELTSBF Notes
                  </p>
                </CardContent>
              </Card>
            </aside>
          </section>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
