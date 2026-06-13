"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Textarea } from "@/components/common/Textarea";
import { ErrorState } from "@/components/common/States";
import { createSpeaking, updateSpeaking } from "@/lib/api/speaking.api";
import { getTags } from "@/lib/api/tags.api";
import { getErrorMessage } from "@/lib/api/client";
import type { SpeakingSet, Tag } from "@/types";

type Props = {
  mode: "create" | "edit";
  initialData?: SpeakingSet;
  onSaved?: (set: SpeakingSet) => void;
};

const LEVELS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export function SpeakingSetForm({ mode, initialData, onSaved }: Props) {
  const router = useRouter();

  const [topic, setTopic] = useState(
    initialData?.topic || initialData?.title || "",
  );
  const [level, setLevel] = useState(
    initialData?.level === null || initialData?.level === undefined
      ? ""
      : String(initialData.level),
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
    if (!topic.trim()) return "Vui lòng nhập topic Speaking.";
    if (!level) return "Vui lòng chọn band mục tiêu.";

    const numericLevel = Number(level);
    if (Number.isNaN(numericLevel) || numericLevel < 0 || numericLevel > 9) {
      return "Band mục tiêu phải nằm trong khoảng 0 đến 9.";
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

    const payload = {
      topic: topic.trim(),
      level: Number(level),
      tagIds: selectedTagIds,
    };

    try {
      if (mode === "create") {
        const created = await createSpeaking(payload);
        router.push(`/admin/speaking-sets/${created.id}`);
        return;
      }

      if (!initialData?.id) {
        throw new Error("Không tìm thấy Speaking Set để cập nhật.");
      }

      const updated = await updateSpeaking(initialData.id, payload);
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
                Speaking Set
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                {mode === "create"
                  ? "Tạo topic Speaking mới"
                  : "Thông tin Speaking Set"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Speaking Set gồm topic, band mục tiêu, tags, parts và prompts.
              </p>
            </div>

            <Badge
              tone={initialData?.status === "PUBLISHED" ? "success" : "warning"}
            >
              {initialData?.status === "PUBLISHED" ? "Đã xuất bản" : "Bản nháp"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {error ? <ErrorState message={error} /> : null}

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-slate-950">Topic</span>
            <Textarea
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="min-h-24"
              placeholder="Ví dụ: Describe a book you have recently read"
            />
          </label>

          <label className="space-y-2 block">
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
              <p className="font-semibold text-slate-950">
                1. Có topic rõ ràng
              </p>
              <p className="mt-1 text-xs">
                Topic cần đủ rõ để phân nhóm câu hỏi.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <p className="font-semibold text-slate-950">2. Có parts</p>
              <p className="mt-1 text-xs">
                Sau khi tạo, thêm Part 1, Part 2, Part 3.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <p className="font-semibold text-slate-950">3. Có prompts</p>
              <p className="mt-1 text-xs">
                Mỗi part nên có câu hỏi hoặc cue card phù hợp.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-serif text-xl font-bold text-slate-950">
            Hành động
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Lưu topic trước, sau đó vào trang chi tiết để thêm parts và prompts.
          </p>

          <Button type="submit" disabled={saving} className="mt-5 w-full">
            <Save className="h-4 w-4" />
            {saving
              ? "Đang lưu..."
              : mode === "create"
                ? "Tạo Speaking Set"
                : "Lưu thay đổi"}
          </Button>
        </Card>
      </aside>
    </form>
  );
}
