"use client";

import { Newspaper } from "lucide-react";

import { Card, CardContent } from "@/components/common/Card";

type Props = {
  title: string;
  excerpt?: string | null;
  contentMarkdown?: string | null;
  coverImageUrl?: string | null;
};

export function BlogPreview({
  title,
  excerpt,
  contentMarkdown,
  coverImageUrl,
}: Props) {
  return (
    <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <CardContent className="space-y-5 p-6">
        <div className="overflow-hidden rounded-[26px] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={title || "Ảnh bài viết"}
              className="max-h-[280px] w-full object-cover"
            />
          ) : (
            <div className="flex h-56 items-center justify-center">
              <Newspaper className="h-12 w-12 text-sky-600/60" />
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
            Preview
          </p>

          <h1 className="mt-2 font-serif text-3xl font-black leading-tight text-slate-950">
            {title || "Chưa có tiêu đề"}
          </h1>

          {excerpt ? (
            <p className="mt-3 text-sm leading-6 text-slate-600">{excerpt}</p>
          ) : null}
        </div>

        <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/80 p-4 text-sm leading-7 text-slate-700 shadow-inner">
          {contentMarkdown || "Chưa có nội dung."}
        </pre>
      </CardContent>
    </Card>
  );
}
