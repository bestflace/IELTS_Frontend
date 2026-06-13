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
import { createWriting, updateWriting } from "@/lib/api/writing.api";
import { getTags } from "@/lib/api/tags.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Tag, WritingTask } from "@/types";

type Props = {
  mode: "create" | "edit";
  initialData?: WritingTask;
  onSaved?: (task: WritingTask) => void;
};

const LEVELS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export function WritingTaskForm({ mode, initialData, onSaved }: Props) {
  const router = useRouter();

  const [taskNo, setTaskNo] = useState<"1" | "2">(
    initialData?.taskNo ? (String(initialData.taskNo) as "1" | "2") : "2",
  );
  const [title, setTitle] = useState(initialData?.title || "");
  const [level, setLevel] = useState(
    initialData?.level === null || initialData?.level === undefined
      ? ""
      : String(initialData.level),
  );
  const [promptText, setPromptText] = useState(initialData?.promptText || "");
  const [chartUrl, setChartUrl] = useState(initialData?.chartUrl || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
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
    if (!title.trim()) return "Vui lòng nhập tên Writing Task.";
    if (!promptText.trim()) return "Vui lòng nhập prompt đề bài.";

    if (level) {
      const numericLevel = Number(level);
      if (Number.isNaN(numericLevel) || numericLevel < 0 || numericLevel > 9) {
        return "Band mục tiêu phải nằm trong khoảng 0 đến 9.";
      }
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
      taskNo: Number(taskNo) as 1 | 2,
      title: title.trim(),
      promptText: promptText.trim(),
      level: level ? Number(level) : null,
      chartUrl: chartUrl.trim() || null,
      imageUrl: imageUrl.trim() || null,
      tagIds: selectedTagIds,
    };

    try {
      if (mode === "create") {
        const created = await createWriting(payload);
        router.push(`/admin/writing-tasks/${created.id}`);
        return;
      }

      if (!initialData?.id) {
        throw new Error("Không tìm thấy Writing Task để cập nhật.");
      }

      const updated = await updateWriting(initialData.id, payload);
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
                Writing Task
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                {mode === "create"
                  ? "Tạo đề Writing mới"
                  : "Thông tin đề Writing"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Writing Task gồm loại task, prompt, band mục tiêu và media nếu
                có.
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

          <div className="grid gap-4 md:grid-cols-[180px_1fr_180px]">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">Task</span>
              <select
                value={taskNo}
                onChange={(event) => setTaskNo(event.target.value as "1" | "2")}
                className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="1">Task 1</option>
                <option value="2">Task 2</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">
                Tên đề
              </span>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Opinion Essay - Online Learning"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">Band</span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="">Không chọn</option>
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-slate-950">
              Prompt đề bài
            </span>
            <Textarea
              value={promptText}
              onChange={(event) => setPromptText(event.target.value)}
              className="min-h-[220px]"
              placeholder="Nhập đề bài Writing..."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">
                Chart URL
              </span>
              <Input
                value={chartUrl}
                onChange={(event) => setChartUrl(event.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">
                Image URL
              </span>
              <Input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
              />
            </label>
          </div>

          {chartUrl || imageUrl ? (
            <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-cyan-50/70">
              <img
                src={chartUrl || imageUrl}
                alt={title || "Writing media"}
                className="max-h-[360px] w-full object-contain"
              />
            </div>
          ) : null}

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
              <p className="font-semibold text-slate-950">1. Prompt rõ ràng</p>
              <p className="mt-1 text-xs">
                Đề bài cần đủ yêu cầu để học viên trả lời.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <p className="font-semibold text-slate-950">2. Đúng Task</p>
              <p className="mt-1 text-xs">
                Task 1 và Task 2 có tiêu chí chấm khác nhau.
              </p>
            </div>

            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <p className="font-semibold text-slate-950">3. Media nếu cần</p>
              <p className="mt-1 text-xs">
                Task 1 thường cần chart hoặc hình minh họa.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-serif text-xl font-bold text-slate-950">
            Hành động
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Lưu bản nháp trước, sau đó kiểm tra lại ở trang chi tiết và xuất
            bản.
          </p>

          <Button type="submit" disabled={saving} className="mt-5 w-full">
            <Save className="h-4 w-4" />
            {saving
              ? "Đang lưu..."
              : mode === "create"
                ? "Tạo Writing Task"
                : "Lưu thay đổi"}
          </Button>
        </Card>
      </aside>
    </form>
  );
}
