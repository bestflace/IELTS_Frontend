"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, CheckCircle2, Info, Save, Shuffle } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { ErrorState } from "@/components/common/States";
import { RandomBuildPreview } from "@/components/tests/RandomBuildPreview";
import { getTags } from "@/lib/api/tags.api";
import { getErrorMessage } from "@/lib/api/client";
import { randomBuild } from "@/lib/api/tests.api";
import type { Tag, TestType } from "@/types";

type Props = {
  submitLabel?: string;
  icon?: ReactNode;
};

type SkillKey = "reading" | "listening" | "writing" | "speaking";

const TEST_TYPES: Array<{
  label: string;
  value: TestType;
  description: string;
}> = [
  {
    label: "Full test",
    value: "FULL",
    description: "Tự chọn đủ Reading, Listening, Writing và Speaking.",
  },
  {
    label: "Reading",
    value: "READING",
    description: "Chỉ tạo đề luyện Reading.",
  },
  {
    label: "Listening",
    value: "LISTENING",
    description: "Chỉ tạo đề luyện Listening.",
  },
  {
    label: "Writing",
    value: "WRITING",
    description: "Chỉ tạo đề luyện Writing.",
  },
  {
    label: "Speaking",
    value: "SPEAKING",
    description: "Chỉ tạo đề luyện Speaking.",
  },
];

const LEVELS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9];

const SKILL_RULES: Array<{
  key: SkillKey;
  label: string;
  description: string;
}> = [
  {
    key: "listening",
    label: "Listening",
    description: "Lấy 1 listening set đã xuất bản.",
  },
  {
    key: "reading",
    label: "Reading",
    description: "Lấy 1 reading set đã xuất bản.",
  },
  {
    key: "writing",
    label: "Writing",
    description: "Lấy 1 writing task đã xuất bản.",
  },
  {
    key: "speaking",
    label: "Speaking",
    description: "Lấy 1 speaking set đã xuất bản.",
  },
];

function getEnabledSkills(type: TestType): SkillKey[] {
  if (type === "FULL") return ["listening", "reading", "writing", "speaking"];
  if (type === "READING") return ["reading"];
  if (type === "LISTENING") return ["listening"];
  if (type === "WRITING") return ["writing"];
  return ["speaking"];
}

function buildSkillRules({
  enabledSkills,
  level,
  selectedTagIds,
  useExactLevel,
  useTags,
}: {
  enabledSkills: SkillKey[];
  level: string;
  selectedTagIds: string[];
  useExactLevel: boolean;
  useTags: boolean;
}) {
  const rules: Record<string, unknown> = {};

  enabledSkills.forEach((skill) => {
    rules[skill] = {
      ...(useExactLevel && level
        ? {
            levelMin: Number(level),
            levelMax: Number(level),
          }
        : {}),
      ...(useTags && selectedTagIds.length
        ? {
            tagIds: selectedTagIds,
          }
        : {}),
    };
  });

  return rules;
}

export function RandomBuildForm({
  submitLabel = "Tạo đề ngẫu nhiên",
  icon,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TestType>("FULL");
  const [level, setLevel] = useState("6.5");
  const [description, setDescription] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [useExactLevel, setUseExactLevel] = useState(true);
  const [useTags, setUseTags] = useState(true);
  const [publishNow, setPublishNow] = useState(false);

  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selectedType = useMemo(
    () => TEST_TYPES.find((item) => item.value === type),
    [type],
  );

  const enabledSkills = useMemo(() => getEnabledSkills(type), [type]);

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
    if (!type) return "Vui lòng chọn loại đề.";

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

    const rules = buildSkillRules({
      enabledSkills,
      level,
      selectedTagIds,
      useExactLevel,
      useTags,
    });

    const payload = {
      type,
      title: title.trim(),
      level: level ? Number(level) : null,
      description: description.trim() || null,
      tagIds: selectedTagIds,
      publishNow,
      rules,
    };

    try {
      const created = await randomBuild(payload);
      router.push(`/admin/tests/${created.id}/sections`);
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
      <main className="space-y-5">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                  Random builder
                </p>
                <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                  Thông tin đề thi
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Hệ thống sẽ tạo một đề ở trạng thái bản nháp từ các nội dung
                  đã xuất bản trong ngân hàng đề.
                </p>
              </div>

              <Badge tone="sage">DRAFT</Badge>
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
                  placeholder="Ví dụ: IELTS Random Full Test 01"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-950">
                  Loại đề
                </span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value as TestType)}
                  className="h-11 w-full rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-sage/30"
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

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-950">
                  Band mục tiêu
                </span>
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  className="h-11 w-full rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-sage/30"
                >
                  <option value="">Không giới hạn</option>
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
                  className="min-h-28"
                  placeholder="Mô tả ngắn về mục tiêu hoặc ghi chú cho đề được tạo ngẫu nhiên..."
                />
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-semibold text-slate-950">
                  Thẻ phân loại
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  Có thể dùng tags để ưu tiên chọn nội dung cùng chủ đề trong
                  ngân hàng đề.
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
                  Chưa có tag. Bạn vẫn có thể tạo đề ngẫu nhiên không dùng tag.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Random rules
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
              Quy tắc chọn nội dung
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Backend sẽ chỉ chọn nội dung đã xuất bản. Các điều kiện bên dưới
              giúp giới hạn nội dung theo band và tags.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
              <input
                type="checkbox"
                checked
                readOnly
                className="mt-1 h-4 w-4 accent-[var(--color-moss)]"
              />
              <div>
                <p className="font-semibold text-slate-950">
                  Chỉ chọn nội dung đã xuất bản
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Đây là quy tắc cố định từ backend, nhằm tránh chọn nhầm nội
                  dung đang soạn thảo.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
              <input
                type="checkbox"
                checked={useExactLevel}
                onChange={(event) => setUseExactLevel(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--color-moss)]"
              />
              <div>
                <p className="font-semibold text-slate-950">
                  Ưu tiên đúng band mục tiêu
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Khi bật, mỗi kỹ năng sẽ random từ nội dung có band trùng với
                  band mục tiêu.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
              <input
                type="checkbox"
                checked={useTags}
                onChange={(event) => setUseTags(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--color-moss)]"
              />
              <div>
                <p className="font-semibold text-slate-950">
                  Ưu tiên tags đã chọn
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Khi bật, hệ thống sẽ tìm nội dung có tags tương ứng với đề
                  thi.
                </p>
              </div>
            </label>

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
              <p className="text-sm font-semibold text-slate-950">
                Kỹ năng sẽ được tạo
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {SKILL_RULES.map((skill) => {
                  const active = enabledSkills.includes(skill.key);

                  return (
                    <div
                      key={skill.key}
                      className={
                        active
                          ? "rounded-xl border border-cyan-300 bg-cyan-50 p-3"
                          : "rounded-xl border border-cyan-100 bg-cyan-50/70 p-3 opacity-50"
                      }
                    >
                      <div className="flex items-center gap-2">
                        {active ? (
                          <CheckCircle2 className="h-4 w-4 text-cyan-700" />
                        ) : (
                          <Info className="h-4 w-4 text-slate-500" />
                        )}
                        <p className="text-sm font-semibold text-slate-950">
                          {skill.label}
                        </p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {active
                          ? skill.description
                          : "Không áp dụng với loại đề hiện tại."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <aside className="space-y-4">
        <RandomBuildPreview type={type} />

        <Card className="p-5">
          <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
            Action
          </p>

          <h3 className="mt-2 font-serif text-xl font-bold text-slate-950">
            Tạo bản nháp
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Sau khi tạo, bạn sẽ được chuyển sang màn quản lý cấu trúc đề để kiểm
            tra từng section, reroll phần chưa phù hợp và xuất bản.
          </p>

          <div className="mt-5 space-y-3">
            <label className="flex items-start gap-3 rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(event) => setPublishNow(event.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--color-moss)]"
              />
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  Xuất bản ngay nếu hợp lệ
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Nên tắt lựa chọn này để kiểm tra và reroll trước khi publish.
                </p>
              </div>
            </label>

            <Button type="submit" disabled={saving} className="w-full">
              {icon || <Save className="h-4 w-4" />}
              {saving ? "Đang tạo..." : submitLabel}
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50/70">
              <BookOpen className="h-4 w-4 text-cyan-700" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-slate-950">
                Ghi chú
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Nếu hệ thống báo không đủ dữ liệu, hãy giảm điều kiện band/tags
                hoặc kiểm tra ngân hàng đề đã có nội dung published hay chưa.
              </p>
            </div>
          </div>
        </Card>
      </aside>
    </form>
  );
}
