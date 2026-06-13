"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Mic,
  Plus,
  RefreshCw,
  Save,
  Send,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Modal, ConfirmDialog } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { Textarea } from "@/components/common/Textarea";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { SpeakingSetForm } from "@/components/content-bank/speaking/SpeakingSetForm";
import {
  addPromptItem,
  addSpeakingPart,
  addSpeakingPrompt,
  deletePromptItem,
  deleteSpeakingPart,
  deleteSpeakingPrompt,
  getAdminSpeaking,
  publishSpeaking,
  unpublishSpeaking,
} from "@/lib/api/speaking.api";
import { getErrorMessage } from "@/lib/api/client";
import type {
  SpeakingPart,
  SpeakingPartModel,
  SpeakingPrompt,
  SpeakingSet,
} from "@/types";

type Props = {
  setId: string;
};

function partLabel(partType?: string) {
  if (partType === "PART_1") return "Part 1";
  if (partType === "PART_2") return "Part 2";
  if (partType === "PART_3") return "Part 3";
  return partType || "Part";
}

function PromptForm({
  partId,
  nextSortOrder,
  onDone,
}: {
  partId: string;
  nextSortOrder: number;
  onDone: () => void;
}) {
  const [promptType, setPromptType] = useState("QUESTION");
  const [content, setContent] = useState("");
  const [preparationSec, setPreparationSec] = useState("");
  const [speakingSec, setSpeakingSec] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Vui lòng nhập nội dung prompt.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await addSpeakingPrompt(partId, {
        promptType,
        content: content.trim(),
        preparationSec: preparationSec ? Number(preparationSec) : null,
        speakingSec: speakingSec ? Number(speakingSec) : null,
        sortOrder: nextSortOrder,
      });

      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <ErrorState message={error} /> : null}

      <label className="space-y-2 block">
        <span className="text-sm font-black text-slate-950">Loại prompt</span>
        <select
          value={promptType}
          onChange={(event) => setPromptType(event.target.value)}
          className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="QUESTION">Question</option>
          <option value="CUE_CARD">Cue card</option>
          <option value="FOLLOW_UP">Follow-up</option>
        </select>
      </label>

      <label className="space-y-2 block">
        <span className="text-sm font-black text-slate-950">Nội dung</span>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-32"
          placeholder="Nhập câu hỏi hoặc cue card..."
        />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-black text-slate-950">
            Chuẩn bị, giây
          </span>
          <Input
            type="number"
            min={0}
            value={preparationSec}
            onChange={(event) => setPreparationSec(event.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-black text-slate-950">
            Trả lời, giây
          </span>
          <Input
            type="number"
            min={0}
            value={speakingSec}
            onChange={(event) => setSpeakingSec(event.target.value)}
          />
        </label>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : "Thêm prompt"}
        </Button>
      </div>
    </form>
  );
}

function PromptItemForm({
  promptId,
  nextSortOrder,
  onDone,
}: {
  promptId: string;
  nextSortOrder: number;
  onDone: () => void;
}) {
  const [itemText, setItemText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!itemText.trim()) {
      setError("Vui lòng nhập nội dung gợi ý.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await addPromptItem(promptId, {
        itemText: itemText.trim(),
        sortOrder: nextSortOrder,
      });

      onDone();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <ErrorState message={error} /> : null}

      <label className="space-y-2 block">
        <span className="text-sm font-black text-slate-950">
          Gợi ý / bullet
        </span>
        <Textarea
          value={itemText}
          onChange={(event) => setItemText(event.target.value)}
          className="min-h-24"
          placeholder="Ví dụ: what the book is about"
        />
      </label>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : "Thêm gợi ý"}
        </Button>
      </div>
    </form>
  );
}

export function SpeakingSetDetail({ setId }: Props) {
  const [speakingSet, setSpeakingSet] = useState<SpeakingSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [partModalOpen, setPartModalOpen] = useState(false);
  const [partType, setPartType] = useState<SpeakingPart>("PART_1");
  const [partTitle, setPartTitle] = useState("");
  const [partDescription, setPartDescription] = useState("");

  const [promptTargetPart, setPromptTargetPart] =
    useState<SpeakingPartModel | null>(null);
  const [itemTargetPrompt, setItemTargetPrompt] =
    useState<SpeakingPrompt | null>(null);
  const [deletePartTarget, setDeletePartTarget] =
    useState<SpeakingPartModel | null>(null);
  const [deletePromptTarget, setDeletePromptTarget] =
    useState<SpeakingPrompt | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<{
    id: string;
    itemText: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminSpeaking(setId);
      setSpeakingSet(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePublish = async () => {
    if (!speakingSet) return;

    setActionLoading(true);
    setError("");

    try {
      if (speakingSet.status === "PUBLISHED") {
        await unpublishSpeaking(speakingSet.id);
      } else {
        await publishSpeaking(speakingSet.id);
      }

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddPart = async (event: FormEvent) => {
    event.preventDefault();

    if (!speakingSet) return;

    setActionLoading(true);
    setError("");

    try {
      await addSpeakingPart(speakingSet.id, {
        partType,
        title: partTitle.trim() || null,
        description: partDescription.trim() || null,
        sortOrder: (speakingSet.parts?.length || 0) + 1,
      });

      setPartModalOpen(false);
      setPartTitle("");
      setPartDescription("");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePart = async () => {
    if (!deletePartTarget) return;

    setActionLoading(true);

    try {
      await deleteSpeakingPart(deletePartTarget.id);
      setDeletePartTarget(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePrompt = async () => {
    if (!deletePromptTarget) return;

    setActionLoading(true);

    try {
      await deleteSpeakingPrompt(deletePromptTarget.id);
      setDeletePromptTarget(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteItemTarget) return;

    setActionLoading(true);

    try {
      await deletePromptItem(deleteItemTarget.id);
      setDeleteItemTarget(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState label="Đang tải Speaking Set..." />;

  if (error && !speakingSet) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!speakingSet) {
    return (
      <EmptyState
        title="Không tìm thấy Speaking Set"
        description="Set có thể đã bị xóa hoặc ID không hợp lệ."
        action={
          <Link href="/admin/speaking-sets">
            <Button variant="outline">Quay lại ngân hàng Speaking</Button>
          </Link>
        }
      />
    );
  }

  const isPublished = speakingSet.status === "PUBLISHED";
  const parts = [...(speakingSet.parts || [])].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
  );
  const canPublish = Boolean(speakingSet.topic && parts.length > 0);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />
      <PageHeader
        eyebrow="Admin / Speaking Bank"
        title={speakingSet.topic || speakingSet.title || "Speaking Set"}
        description="Quản lý topic, parts, prompts, cue card và trạng thái xuất bản của Speaking Set."
        actions={
          <>
            <Link href="/admin/speaking-sets">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={loadData}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>

            <Button
              onClick={handleTogglePublish}
              disabled={actionLoading || (!isPublished && !canPublish)}
              variant={isPublished ? "secondary" : "primary"}
            >
              <Send className="h-4 w-4" />
              {isPublished ? "Gỡ xuất bản" : "Xuất bản"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <main className="min-w-0 space-y-5">
          {error ? <ErrorState message={error} onRetry={loadData} /> : null}

          <SpeakingSetForm
            mode="edit"
            initialData={speakingSet}
            onSaved={setSpeakingSet}
          />

          <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                    Speaking parts
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                    Parts & Prompts
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Thêm Part 1, Part 2, Part 3 và các câu hỏi/cue card tương
                    ứng.
                  </p>
                </div>

                <Button
                  onClick={() => setPartModalOpen(true)}
                  disabled={isPublished}
                >
                  <Plus className="h-4 w-4" />
                  Thêm part
                </Button>
              </div>
            </CardHeader>

            <CardContent className="min-w-0 space-y-4">
              {isPublished ? (
                <div className="rounded-2xl border border-cyan-100 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
                  Speaking Set này đang được xuất bản. Hãy gỡ xuất bản trước khi
                  chỉnh sửa parts hoặc prompts.
                </div>
              ) : null}

              {parts.length ? (
                parts.map((part) => {
                  const prompts = [...(part.prompts || [])].sort(
                    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
                  );

                  return (
                    <div
                      key={part.id}
                      className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                            {partLabel(part.partType)}
                          </p>
                          <h3 className="mt-1 font-serif text-xl font-black text-slate-950">
                            {part.title || partLabel(part.partType)}
                          </h3>
                          {part.description ? (
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              {part.description}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPublished}
                            onClick={() => setPromptTargetPart(part)}
                          >
                            <Plus className="h-4 w-4" />
                            Prompt
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            disabled={isPublished}
                            onClick={() => setDeletePartTarget(part)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {prompts.length ? (
                          prompts.map((prompt) => (
                            <div
                              key={prompt.id}
                              className="rounded-2xl border border-cyan-100 bg-white/80 shadow-sm backdrop-blur-xl p-4"
                            >
                              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div>
                                  <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                                    {prompt.promptType}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-slate-950">
                                    {prompt.content}
                                  </p>

                                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                                    {prompt.preparationSec ? (
                                      <span>
                                        Chuẩn bị: {prompt.preparationSec}s
                                      </span>
                                    ) : null}
                                    {prompt.speakingSec ? (
                                      <span>
                                        Trả lời: {prompt.speakingSec}s
                                      </span>
                                    ) : null}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={isPublished}
                                    onClick={() => setItemTargetPrompt(prompt)}
                                  >
                                    <Plus className="h-4 w-4" />
                                    Gợi ý
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="danger"
                                    disabled={isPublished}
                                    onClick={() =>
                                      setDeletePromptTarget(prompt)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {prompt.items?.length ? (
                                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-500">
                                  {prompt.items
                                    .slice()
                                    .sort(
                                      (a, b) =>
                                        (a.sortOrder || 0) - (b.sortOrder || 0),
                                    )
                                    .map((item) => (
                                      <li key={item.id} className="group">
                                        <span>{item.itemText}</span>
                                        {!isPublished ? (
                                          <button
                                            type="button"
                                            className="ml-3 text-xs text-rose-600 opacity-70 hover:opacity-100"
                                            onClick={() =>
                                              setDeleteItemTarget(item)
                                            }
                                          >
                                            Xóa
                                          </button>
                                        ) : null}
                                      </li>
                                    ))}
                                </ul>
                              ) : null}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-cyan-100 bg-cyan-50/70 p-4 text-sm text-slate-500">
                            Part này chưa có prompt.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  title="Chưa có part"
                  description="Thêm Part 1, Part 2 hoặc Part 3 để hoàn thiện Speaking Set."
                  action={
                    <Button
                      onClick={() => setPartModalOpen(true)}
                      disabled={isPublished}
                    >
                      <Plus className="h-4 w-4" />
                      Thêm part đầu tiên
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </main>

        <aside className="grid min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          <Card className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl">
                <Mic className="h-4 w-4 text-cyan-700" />
              </div>

              <div className="min-w-0">
                <h3 className="font-serif text-xl font-black text-slate-950">
                  Điều kiện xuất bản
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Speaking Set cần có topic và ít nhất một part trước khi xuất
                  bản.
                </p>

                <div className="mt-4 space-y-3 text-sm text-slate-500">
                  <div className="rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-3">
                    <p className="font-black text-slate-950">Topic</p>
                    <p className="mt-1 text-xs">
                      {speakingSet.topic ? "Đã có topic." : "Chưa có topic."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-3">
                    <p className="font-black text-slate-950">Parts</p>
                    <p className="mt-1 text-xs">Hiện có {parts.length} part.</p>
                  </div>
                </div>

                {!isPublished && !canPublish ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                    Chưa thể xuất bản. Hãy nhập topic và thêm ít nhất một part.
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        </aside>
      </div>

      <Modal
        open={partModalOpen}
        onClose={() => setPartModalOpen(false)}
        title="Thêm Speaking Part"
      >
        <form onSubmit={handleAddPart} className="space-y-4">
          <label className="space-y-2 block">
            <span className="text-sm font-black text-slate-950">Part</span>
            <select
              value={partType}
              onChange={(event) =>
                setPartType(event.target.value as SpeakingPart)
              }
              className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="PART_1">Part 1</option>
              <option value="PART_2">Part 2</option>
              <option value="PART_3">Part 3</option>
            </select>
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-black text-slate-950">Tiêu đề</span>
            <Input
              value={partTitle}
              onChange={(event) => setPartTitle(event.target.value)}
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-black text-slate-950">Mô tả</span>
            <Textarea
              value={partDescription}
              onChange={(event) => setPartDescription(event.target.value)}
            />
          </label>

          <div className="flex justify-end">
            <Button type="submit" disabled={actionLoading}>
              <Save className="h-4 w-4" />
              Thêm part
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(promptTargetPart)}
        onClose={() => setPromptTargetPart(null)}
        title="Thêm prompt"
      >
        {promptTargetPart ? (
          <PromptForm
            partId={promptTargetPart.id}
            nextSortOrder={(promptTargetPart.prompts?.length || 0) + 1}
            onDone={async () => {
              setPromptTargetPart(null);
              await loadData();
            }}
          />
        ) : null}
      </Modal>

      <Modal
        open={Boolean(itemTargetPrompt)}
        onClose={() => setItemTargetPrompt(null)}
        title="Thêm gợi ý cho cue card"
      >
        {itemTargetPrompt ? (
          <PromptItemForm
            promptId={itemTargetPrompt.id}
            nextSortOrder={(itemTargetPrompt.items?.length || 0) + 1}
            onDone={async () => {
              setItemTargetPrompt(null);
              await loadData();
            }}
          />
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deletePartTarget)}
        title="Xóa part?"
        description="Part này và các prompt bên trong sẽ bị xóa khỏi Speaking Set."
        onCancel={() => setDeletePartTarget(null)}
        onConfirm={handleDeletePart}
      />

      <ConfirmDialog
        open={Boolean(deletePromptTarget)}
        title="Xóa prompt?"
        description="Prompt này sẽ bị xóa khỏi part hiện tại."
        onCancel={() => setDeletePromptTarget(null)}
        onConfirm={handleDeletePrompt}
      />

      <ConfirmDialog
        open={Boolean(deleteItemTarget)}
        title="Xóa gợi ý?"
        description="Gợi ý này sẽ bị xóa khỏi cue card."
        onCancel={() => setDeleteItemTarget(null)}
        onConfirm={handleDeleteItem}
      />
    </div>
  );
}
