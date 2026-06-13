"use client";

import { useMemo, useRef } from "react";
import { BookOpen } from "lucide-react";

import { AnnotationToolbar } from "@/components/attempts/AnnotationToolbar";
import { Badge } from "@/components/common/Badge";

type Props = {
  title?: string | null;
  passageHtml?: string | null;
  passageText?: string | null;
  passageNo?: number;
  attemptId?: string;
};

export function extractPassageHtml(
  html?: string | null,
  passageNo?: number,
): string {
  if (!html) return "";
  if (!passageNo) return html;

  const pattern = new RegExp(
    `<section[^>]*data-passage=["']${passageNo}["'][^>]*>([\\s\\S]*?)<\\/section>`,
    "i",
  );

  const match = html.match(pattern);
  return match?.[1] || html;
}

function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function htmlToReadableText(html: string) {
  if (!html) return "";

  if (typeof document === "undefined") {
    return normalizeText(html.replace(/<[^>]+>/g, " "));
  }

  const root = document.createElement("div");
  root.innerHTML = html;

  root.querySelectorAll("script, style, noscript").forEach((node) => {
    node.remove();
  });

  root.querySelectorAll("br").forEach((node) => {
    node.replaceWith(document.createTextNode("\n"));
  });

  root
    .querySelectorAll("p, div, section, article, h1, h2, h3, h4, li")
    .forEach((node) => {
      node.appendChild(document.createTextNode("\n\n"));
    });

  return normalizeText(root.textContent || "");
}

function splitParagraphs(text: string) {
  return normalizeText(text)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function ReadingPassage({
  title,
  passageHtml,
  passageText,
  passageNo,
  attemptId,
}: Props) {
  const articleRef = useRef<HTMLElement | null>(null);

  const readableText = useMemo(() => {
    if (passageText?.trim()) {
      return normalizeText(passageText);
    }

    const html = extractPassageHtml(passageHtml, passageNo);
    return htmlToReadableText(html);
  }, [passageHtml, passageText, passageNo]);

  const paragraphs = useMemo(
    () => splitParagraphs(readableText),
    [readableText],
  );

  const annotationKey = `reading-clean:${attemptId || "preview"}:passage:${
    passageNo || 1
  }`;

  return (
    <div className="h-full overflow-y-auto px-9 py-8">
      <div className="mx-auto max-w-4xl">
        <Badge tone="sage">Academic Reading</Badge>

        <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-slate-950">
          {title || `Reading Passage ${passageNo || ""}`}
        </h1>

        <p className="mt-4 italic leading-7 text-slate-500">
          Read the passage and answer the questions. Bạn có thể bôi trực tiếp
          đoạn chữ trong bài đọc để highlight hoặc thêm note.
        </p>

        {paragraphs.length ? (
          <article
            ref={articleRef}
            className="mt-8 select-text text-[17px] leading-9 text-slate-950"
          >
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="mb-6">
                {paragraph}
              </p>
            ))}
          </article>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-cyan-100 bg-white/90 p-6 text-center">
            <BookOpen className="mx-auto h-9 w-9 text-slate-500" />
            <p className="mt-3 font-serif text-xl font-bold text-slate-950">
              Chưa có nội dung passage
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Reading Set này chưa có passage_text hoặc passage_html hợp lệ.
            </p>
          </div>
        )}

        {attemptId && paragraphs.length ? (
          <AnnotationToolbar
            storageKey={annotationKey}
            targetRef={articleRef}
            title="Note bài đọc"
          />
        ) : null}
      </div>
    </div>
  );
}
