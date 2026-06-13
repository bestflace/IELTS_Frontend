"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { ErrorState } from "@/components/common/States";
import { updateReading } from "@/lib/api/reading.api";
import { getErrorMessage } from "@/lib/api/client";
import type { ReadingSet } from "@/types";

type Props = {
  readingSet: ReadingSet;
  onSaved?: (readingSet: ReadingSet) => void;
  onReload?: () => void;
};

const LEVELS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export function ReadingPassageEditor({ readingSet, onSaved, onReload }: Props) {
  const [title, setTitle] = useState(readingSet.title || "");
  const [level, setLevel] = useState(
    readingSet.level === null || readingSet.level === undefined
      ? ""
      : String(readingSet.level),
  );
  const [passageText, setPassageText] = useState(readingSet.passageText || "");
  const [passageHtml, setPassageHtml] = useState(readingSet.passageHtml || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(readingSet.title || "");
    setLevel(
      readingSet.level === null || readingSet.level === undefined
        ? ""
        : String(readingSet.level),
    );
    setPassageText(readingSet.passageText || "");
    setPassageHtml(readingSet.passageHtml || "");
  }, [readingSet]);

  const validate = () => {
    if (!title.trim()) return "Vui lòng nhập tên bài đọc.";
    if (!level) return "Vui lòng chọn band mục tiêu.";

    const numericLevel = Number(level);
    if (Number.isNaN(numericLevel) || numericLevel < 0 || numericLevel > 9) {
      return "Band mục tiêu phải nằm trong khoảng 0 đến 9.";
    }

    if (!passageText.trim() && !passageHtml.trim()) {
      return "Vui lòng nhập passage text hoặc passage HTML.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated = await updateReading(readingSet.id, {
        title: title.trim(),
        level: Number(level),
        passageText: passageText.trim() || null,
        passageHtml: passageHtml.trim() || null,
      });

      onSaved?.(updated);
      onReload?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const isPublished = readingSet.status === "PUBLISHED";

  return (
    <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Passage editor
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
              Nội dung bài đọc
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Cập nhật tên bài đọc, band mục tiêu và nội dung passage.
            </p>
          </div>

          {isPublished ? (
            <Badge tone="success">PUBLISHED</Badge>
          ) : (
            <Badge tone="warning">DRAFT</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error ? <ErrorState message={error} /> : null}

          {isPublished ? (
            <div className="rounded-2xl border border-cyan-100 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
              Reading Set này đang được xuất bản. Nếu backend không cho sửa nội
              dung đã publish, hãy gỡ xuất bản trước khi chỉnh sửa.
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-[1fr_180px]">
            <label className="space-y-2">
              <span className="text-sm font-black text-slate-950">
                Tên bài đọc
              </span>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: The History of Tea"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-black text-slate-950">Band</span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Chọn band</option>
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-black text-slate-950">
              Passage text
            </span>
            <Textarea
              value={passageText}
              onChange={(event) => setPassageText(event.target.value)}
              className="min-h-[260px]"
              placeholder="Nhập nội dung passage dạng plain text..."
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-black text-slate-950">
              Passage HTML
            </span>
            <Textarea
              value={passageHtml}
              onChange={(event) => setPassageHtml(event.target.value)}
              className="min-h-[160px] font-mono text-xs"
              placeholder="<p>Nhập passage dạng HTML nếu cần...</p>"
            />
            <p className="text-xs text-slate-500">
              Nếu không cần định dạng HTML, chỉ nhập Passage text là đủ.
            </p>
          </label>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu nội dung bài đọc"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
