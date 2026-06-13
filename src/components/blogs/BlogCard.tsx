"use client";

import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";

import { Card, CardContent } from "@/components/common/Card";
import type { Blog } from "@/types";

type Props = {
  blog: Blog;
  hrefBase?: string;
};

export function BlogCard({ blog, hrefBase = "/blogs" }: Props) {
  const href = blog.slug ? `${hrefBase}/${blog.slug}` : "#";

  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-[30px] border border-white/70 bg-white/82 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_26px_80px_rgba(14,165,233,0.18)]">
        <div className="relative h-48 overflow-hidden">
          {blog.coverImageUrl ? (
            <img
              src={blog.coverImageUrl}
              alt={blog.title}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100">
              <Newspaper className="h-12 w-12 text-sky-600/70" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/30 to-transparent" />
        </div>

        <CardContent className="p-5">
          <h3 className="line-clamp-2 font-serif text-2xl font-black leading-tight text-slate-950 transition group-hover:text-sky-700">
            {blog.title}
          </h3>

          {blog.excerpt ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
              {blog.excerpt}
            </p>
          ) : null}

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-sky-700 transition group-hover:gap-3 group-hover:text-cyan-600">
            Đọc bài viết
            <ArrowRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
