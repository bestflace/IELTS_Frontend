"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { ErrorState } from "@/components/common/States";
import { createTest, updateTest } from "@/lib/api/tests.api";
import { getTags } from "@/lib/api/tags.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Tag, Test, TestType } from "@/types";

type Props = {
  mode: "create" | "edit";
  initialData?: Test;
  submitLabel?: string;
  icon?: ReactNode;
  onSaved?: (test: Test) => void;
};

const TEST_TYPES: Array<{
  label: string;
  value: TestType;
  description: string;
}> = [
  {
    label: "Full test",
    value: "FULL",
    description: "Đề đầy đủ nhiều kỹ năng.",
  },
  {
    label: "Reading",
    value: "READING",
    description: "Chỉ gồm phần Reading.",
  },
  {
    label: "Listening",
    value: "LISTENING",
    description: "Chỉ gồm phần Listening.",
  },
  {
    label: "Writing",
    value: "WRITING",
    description: "Chỉ gồm phần Writing.",
  },
  {
    label: "Speaking",
    value: "SPEAKING",
    description: "Chỉ gồm phần Speaking.",
  },
];

const LEVELS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

export function TestMetadataForm({
  mode,
  initialData,
  submitLabel = "Lưu thay đổi",
  icon,
  onSaved,
}: Props) {
  const router = useRouter();

  const [testId, setTestId] = useState(initialData?.id || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState<TestType>(initialData?.type || "FULL");
  const [level, setLevel] = useState<string>(
    initialData?.level === null || initialData?.level === undefined
      ? ""
      : String(initialData.level),
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((tag) => tag.id) || [],
  );

  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedType = useMemo(
    () => TEST_TYPES.find((item) => item.value === type),
    [type],
  );

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
    if (!title.trim()) return "Vui lòng nhập tên đề thi.";
    if (title.trim().length < 3) return "Tên đề thi cần tối thiểu 3 ký tự.";
    if (!type) return "Vui lòng chọn loại đề thi.";

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
      title: title.trim(),
      type,
      level: level ? Number(level) : null,
      description: description.trim() || null,
      tagIds: selectedTagIds,
    };

    try {
      if (mode === "create") {
        const created = await createTest(payload);
        router.push(`/admin/tests/${created.id}/sections`);
        return;
      }

      if (!initialData?.id) {
        throw new Error("Không tìm thấy test id để cập nhật.");
      }

      const updated = await updateTest(initialData.id, {
        title: payload.title,
        level: payload.level,
        description: payload.description,
        tagIds: payload.tagIds,
      });

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
      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Test metadata
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                Thông tin cơ bản
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Đây là bước tạo bản nháp. Sau khi lưu, bạn sẽ chọn từng section
                từ ngân hàng đề.
              </p>
            </div>

            <Badge tone="sage">
              {mode === "create" ? "DRAFT" : initialData?.status || "DRAFT"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {error ? <ErrorState message={error} /> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-950">
                Tên đề thi
              </span>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Cambridge IELTS 18 - Test 1"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">
                Loại đề
              </span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as TestType)}
                disabled={mode === "edit"}
                className="h-11 w-full rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-sage/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {TEST_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {selectedType?.description}
              </p>
            </label>

            {/* <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-950">Tên đề thi</span>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Cambridge IELTS 18 - Test 1"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">Loại đề</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as TestType)}
                disabled={mode === "edit"}
                className="h-11 w-full rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-sage/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {TEST_TYPES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {selectedType?.description}
              </p>
            </label> */}

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-950">
                Band mục tiêu
              </span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="h-11 w-full rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-sage/30"
              >
                <option value="">Chưa chọn</option>
                {LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-950">
                Mô tả
              </span>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-32"
                placeholder="Mô tả ngắn về mục tiêu, độ khó, bộ đề hoặc ghi chú nội bộ..."
              />
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-slate-950">
                Thẻ phân loại
              </span>
              <p className="mt-1 text-xs text-slate-500">
                Tags được lấy từ endpoint /tags. Không nhập tự do để tránh lệch
                dữ liệu backend.
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
                Chưa có tag. Bạn có thể tạo tag ở màn Admin / Tags.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card className="p-5">
          <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
            Manual flow
          </p>
          <h3 className="mt-2 font-serif text-xl font-bold text-slate-950">
            Luồng tạo đề thủ công
          </h3>

          <div className="mt-4 space-y-3 text-sm text-slate-500">
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <span className="font-semibold text-slate-950">
                1. Lưu metadata
              </span>
              <p className="mt-1">
                Tạo test draft bằng endpoint POST /admin/tests.
              </p>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <span className="font-semibold text-slate-950">
                2. Chọn section
              </span>
              <p className="mt-1">Thêm từng phần thi từ ngân hàng đề đã có.</p>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
              <span className="font-semibold text-slate-950">
                3. Preview & publish
              </span>
              <p className="mt-1">Kiểm tra cấu trúc rồi xuất bản khi hợp lệ.</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-serif text-xl font-bold text-slate-950">
            Hành động
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Màn này chỉ tạo bản nháp. Reroll ngẫu nhiên được tách riêng sang
            Random Build.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <Button type="submit" disabled={saving} className="w-full">
              {icon || <Save className="h-4 w-4" />}
              {saving ? "Đang lưu..." : submitLabel}
            </Button>
          </div>
        </Card>
      </aside>
    </form>
  );
}
