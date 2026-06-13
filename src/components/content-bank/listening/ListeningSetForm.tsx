"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { ErrorState } from "@/components/common/States";
import { createListening, updateListening } from "@/lib/api/listening.api";
import { getTags } from "@/lib/api/tags.api";
import { getErrorMessage } from "@/lib/api/client";
import type { ListeningSet, Tag } from "@/types";

type Props = {
  mode: "create" | "edit";
  initialData?: ListeningSet;
  onSaved?: (listeningSet: ListeningSet) => void;
};

const LEVELS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export function ListeningSetForm({ mode, initialData, onSaved }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [level, setLevel] = useState(
    initialData?.level === null || initialData?.level === undefined
      ? ""
      : String(initialData.level),
  );
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || "");
  const [audioSource, setAudioSource] = useState<"UPLOAD" | "URL" | "R2">(
    (initialData?.audioSource as "UPLOAD" | "URL" | "R2") || "URL",
  );
  const [transcriptText, setTranscriptText] = useState(
    initialData?.transcriptText || "",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((tag) => tag.id) || [],
  );

  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getTags()
      .then((data) => {
        if (mounted) setTags(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setTags([]);
      })
      .finally(() => {
        if (mounted) setLoadingTags(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  };

  const validate = () => {
    if (!title.trim()) return "Vui lòng nhập tên Listening Set.";
    if (!level) return "Vui lòng chọn band mục tiêu.";

    const numericLevel = Number(level);
    if (Number.isNaN(numericLevel) || numericLevel < 0 || numericLevel > 9) {
      return "Band mục tiêu phải nằm trong khoảng 0 đến 9.";
    }

    if (!audioUrl.trim()) return "Vui lòng nhập audio URL.";

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

    const payload = {
      title: title.trim(),
      level: Number(level),
      audioUrl: audioUrl.trim() || null,
      audioSource,
      transcriptText: transcriptText.trim() || null,
      tagIds: selectedTagIds,
    };

    try {
      if (mode === "create") {
        const created = await createListening(payload);
        router.push(`/admin/listening-sets/${created.id}`);
        return;
      }

      if (!initialData?.id) {
        throw new Error("Không tìm thấy Listening Set để cập nhật.");
      }

      const updated = await updateListening(initialData.id, payload);
      onSaved?.(updated);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5 xl:grid-cols-[1fr_360px]"
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Listening Set
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                {mode === "create" ? "Tạo bài nghe mới" : "Thông tin bài nghe"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Listening Set gồm audio, transcript, band mục tiêu, tags và danh
                sách câu hỏi.
              </p>
            </div>

            <Badge
              tone={initialData?.status === "PUBLISHED" ? "success" : "warning"}
            >
              {initialData?.status || "DRAFT"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {error ? <ErrorState message={error} /> : null}

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-slate-950">
              Tên bài nghe
            </span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Cambridge Listening Test 01"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">
                Band mục tiêu
              </span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Chọn band</option>
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">
                Nguồn audio
              </span>
              <select
                value={audioSource}
                onChange={(event) =>
                  setAudioSource(event.target.value as "UPLOAD" | "URL" | "R2")
                }
                className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="URL">URL</option>
                <option value="UPLOAD">Upload</option>
                <option value="R2">Cloudflare R2</option>
              </select>
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-slate-950">
              Audio URL
            </span>
            <Input
              value={audioUrl}
              onChange={(event) => setAudioUrl(event.target.value)}
              placeholder="https://..."
            />
          </label>

          {audioUrl ? (
            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-950">
                Nghe thử audio
              </p>
              <audio controls className="w-full">
                <source src={audioUrl} />
                Trình duyệt của bạn không hỗ trợ audio.
              </audio>
            </div>
          ) : null}

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-slate-950">
              Transcript
            </span>
            <Textarea
              value={transcriptText}
              onChange={(event) => setTranscriptText(event.target.value)}
              className="min-h-[220px]"
              placeholder="Nhập transcript nếu có..."
            />
          </label>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-slate-950">Tags</span>
              <p className="mt-1 text-xs text-slate-500">
                Tags giúp lọc nội dung khi tạo đề thủ công hoặc ngẫu nhiên.
              </p>
            </div>

            {loadingTags ? (
              <div className="rounded-xl border border-dashed border-cyan-100 bg-cyan-50/70 p-4 text-sm text-slate-500">
                Đang tải tags...
              </div>
            ) : tags.length ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const active = selectedTagIds.includes(tag.id);

                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={
                        active
                          ? "rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700"
                          : "rounded-full border border-cyan-100 bg-cyan-50/70 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-cyan-300 hover:text-slate-950"
                      }
                    >
                      {tag.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-cyan-100 bg-cyan-50/70 p-4 text-sm text-slate-500">
                Chưa có tag.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card className="p-5">
          <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
            Checklist
          </p>
          <h3 className="mt-2 font-serif text-xl font-bold text-slate-950">
            Trước khi publish
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <p className="font-semibold text-slate-950">1. Có audio</p>
              <p className="mt-1 text-xs">
                Audio cần nghe được trước khi xuất bản.
              </p>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <p className="font-semibold text-slate-950">2. Có câu hỏi</p>
              <p className="mt-1 text-xs">
                Sau khi tạo bài nghe, thêm câu hỏi ở trang chi tiết.
              </p>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <p className="font-semibold text-slate-950">3. Có đáp án</p>
              <p className="mt-1 text-xs">
                Mỗi câu hỏi cần có đáp án để chấm điểm.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-serif text-xl font-bold text-slate-950">
            Hành động
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Lưu bản nháp trước, sau đó vào trang chi tiết để quản lý câu hỏi và
            xuất bản.
          </p>

          <Button type="submit" disabled={saving} className="mt-5 w-full">
            <Save className="h-4 w-4" />
            {saving
              ? "Đang lưu..."
              : mode === "create"
                ? "Tạo Listening Set"
                : "Lưu thay đổi"}
          </Button>
        </Card>
      </aside>
    </form>
  );
}
