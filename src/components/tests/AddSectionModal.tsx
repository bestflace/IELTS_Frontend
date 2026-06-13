"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Headphones,
  Mic,
  PenLine,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import { getAdminListeningList } from "@/lib/api/listening.api";
import { getAdminReadingList } from "@/lib/api/reading.api";
import { getAdminSpeakingList } from "@/lib/api/speaking.api";
import { getAdminWritingList } from "@/lib/api/writing.api";
import type { CreateTestSectionInput } from "@/lib/api/tests.api";
import type {
  ListeningSet,
  ReadingSet,
  SpeakingSet,
  TestSectionType,
  WritingTask,
} from "@/types";

type BankItem = {
  id: string;
  title: string;
  subtitle?: string;
  level?: number | null;
  status?: string | null;
  taskNo?: number | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  testId: string;
  nextSortOrder: number;
  onSubmit: (payload: CreateTestSectionInput) => Promise<void>;
};

const SECTION_OPTIONS: Array<{
  type: TestSectionType;
  label: string;
  description: string;
  icon: typeof BookOpen;
  defaultTimeLimitSec: number;
  partLabel: string;
  searchPlaceholder: string;
}> = [
  {
    type: "LISTENING_SET",
    label: "Listening",
    description: "Chọn Listening Set đã có audio và câu hỏi.",
    icon: Headphones,
    defaultTimeLimitSec: 1800,
    partLabel: "Listening",
    searchPlaceholder: "Tìm listening set...",
  },
  {
    type: "READING_SET",
    label: "Reading",
    description: "Chọn Reading Set đã có passage và câu hỏi.",
    icon: BookOpen,
    defaultTimeLimitSec: 3600,
    partLabel: "Reading",
    searchPlaceholder: "Tìm reading set...",
  },
  {
    type: "WRITING_TASK",
    label: "Writing",
    description: "Có thể chọn Task 1, Task 2 hoặc chọn cả hai.",
    icon: PenLine,
    defaultTimeLimitSec: 3600,
    partLabel: "Writing",
    searchPlaceholder: "Tìm writing task...",
  },
  {
    type: "SPEAKING_SET",
    label: "Speaking",
    description: "Chọn Speaking Set gồm Part 1, Part 2, Part 3.",
    icon: Mic,
    defaultTimeLimitSec: 900,
    partLabel: "Speaking",
    searchPlaceholder: "Tìm speaking set...",
  },
];

function getOption(type: TestSectionType) {
  return (
    SECTION_OPTIONS.find((item) => item.type === type) || SECTION_OPTIONS[0]
  );
}

function unwrapItems<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[];

  if (response && typeof response === "object") {
    const obj = response as {
      data?: unknown;
      items?: unknown;
    };

    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];

    if (obj.data && typeof obj.data === "object") {
      const dataObj = obj.data as {
        data?: unknown;
        items?: unknown;
      };

      if (Array.isArray(dataObj.data)) return dataObj.data as T[];
      if (Array.isArray(dataObj.items)) return dataObj.items as T[];
    }
  }

  return [];
}

function mapReading(items: ReadingSet[]): BankItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title || item.id,
    subtitle: item.passageText
      ? `${item.passageText.slice(0, 100)}...`
      : item.passageHtml
        ? "Đã có passage"
        : "Reading passage",
    level: item.level,
    status: item.status,
  }));
}

function mapListening(items: ListeningSet[]): BankItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title || item.id,
    subtitle: item.audioUrl ? "Đã có audio" : "Chưa có audio URL",
    level: item.level,
    status: item.status,
  }));
}

function mapWriting(items: WritingTask[]): BankItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title || item.id,
    subtitle: item.taskNo ? `Writing Task ${item.taskNo}` : "Writing task",
    level: item.level,
    status: item.status,
    taskNo: item.taskNo,
  }));
}

function mapSpeaking(items: SpeakingSet[]): BankItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title || item.topic || item.id,
    subtitle: item.parts?.length
      ? `${item.parts.length} parts`
      : "Speaking set",
    level: item.level,
    status: item.status,
  }));
}

function statusTone(status?: string | null) {
  if (status === "PUBLISHED") return "success";
  if (status === "ARCHIVED") return "danger";
  return "warning";
}

function getWritingTaskNo(item: BankItem) {
  if (item.taskNo === 1 || item.taskNo === 2) return item.taskNo;

  const text = `${item.title} ${item.subtitle || ""}`.toLowerCase();

  if (text.includes("task 2")) return 2;
  return 1;
}

function getWritingTimeLimitSec(taskNo: number) {
  return taskNo === 1 ? 1200 : 2400;
}

function getWritingPartLabel(taskNo: number) {
  return taskNo === 1 ? "Writing Task 1" : "Writing Task 2";
}

function buildPayload(params: {
  sectionType: TestSectionType;
  selectedItemId: string;
  sortOrder: number;
  timeLimitSec: number;
  partLabel: string;
  fallbackPartLabel: string;
}): CreateTestSectionInput {
  const payload: CreateTestSectionInput = {
    sectionType: params.sectionType,
    sortOrder: params.sortOrder,
    timeLimitSec: params.timeLimitSec,
    partLabel: params.partLabel.trim() || params.fallbackPartLabel,
  };

  if (params.sectionType === "LISTENING_SET") {
    payload.listeningSetId = params.selectedItemId;
  }

  if (params.sectionType === "READING_SET") {
    payload.readingSetId = params.selectedItemId;
  }

  if (params.sectionType === "WRITING_TASK") {
    payload.writingTaskId = params.selectedItemId;
  }

  if (params.sectionType === "SPEAKING_SET") {
    payload.speakingSetId = params.selectedItemId;
  }

  return payload;
}

export function AddSectionModal({
  open,
  onClose,
  testId,
  nextSortOrder,
  onSubmit,
}: Props) {
  const [sectionType, setSectionType] =
    useState<TestSectionType>("LISTENING_SET");

  const [items, setItems] = useState<BankItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [timeLimitSec, setTimeLimitSec] = useState(1800);
  const [partLabel, setPartLabel] = useState("Listening");
  const [keyword, setKeyword] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const option = getOption(sectionType);
  const isWriting = sectionType === "WRITING_TASK";

  const selectedItems = useMemo(
    () =>
      selectedItemIds
        .map((id) => items.find((item) => item.id === id))
        .filter(Boolean) as BankItem[],
    [items, selectedItemIds],
  );

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) return items;

    return items.filter((item) =>
      `${item.title} ${item.subtitle || ""} ${item.id}`
        .toLowerCase()
        .includes(normalizedKeyword),
    );
  }, [items, keyword]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, saving]);

  useEffect(() => {
    if (!open) return;

    setSelectedItemIds([]);
    setKeyword("");
    setError("");
    setTimeLimitSec(option.defaultTimeLimitSec);
    setPartLabel(option.partLabel);

    let mounted = true;

    async function loadBank() {
      setLoading(true);
      setError("");

      try {
        if (sectionType === "READING_SET") {
          const response = await getAdminReadingList({
            status: "PUBLISHED",
            limit: 100,
          });

          if (mounted) {
            setItems(mapReading(unwrapItems<ReadingSet>(response)));
          }
        }

        if (sectionType === "LISTENING_SET") {
          const response = await getAdminListeningList({
            status: "PUBLISHED",
            limit: 100,
          });

          if (mounted) {
            setItems(mapListening(unwrapItems<ListeningSet>(response)));
          }
        }

        if (sectionType === "WRITING_TASK") {
          const response = await getAdminWritingList({
            status: "PUBLISHED",
            limit: 100,
          });

          if (mounted) {
            setItems(mapWriting(unwrapItems<WritingTask>(response)));
          }
        }

        if (sectionType === "SPEAKING_SET") {
          const response = await getAdminSpeakingList({
            status: "PUBLISHED",
            limit: 100,
          });

          if (mounted) {
            setItems(mapSpeaking(unwrapItems<SpeakingSet>(response)));
          }
        }
      } catch (err) {
        if (mounted) {
          setItems([]);
          setError(getErrorMessage(err));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadBank();

    return () => {
      mounted = false;
    };
  }, [open, sectionType, option.defaultTimeLimitSec, option.partLabel]);

  if (!open) return null;

  function toggleItem(item: BankItem) {
    if (isWriting) {
      setSelectedItemIds((current) =>
        current.includes(item.id)
          ? current.filter((id) => id !== item.id)
          : [...current, item.id],
      );

      return;
    }

    setSelectedItemIds([item.id]);
  }

  const handleSubmit = async () => {
    if (!testId) {
      setError("Không tìm thấy testId.");
      return;
    }

    if (selectedItemIds.length === 0) {
      setError("Vui lòng chọn ít nhất một nội dung từ ngân hàng đề.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (isWriting) {
        const writingItems = [...selectedItems].sort(
          (a, b) => getWritingTaskNo(a) - getWritingTaskNo(b),
        );

        for (let index = 0; index < writingItems.length; index += 1) {
          const item = writingItems[index];
          const taskNo = getWritingTaskNo(item);

          const payload = buildPayload({
            sectionType,
            selectedItemId: item.id,
            sortOrder: nextSortOrder + index,
            timeLimitSec: getWritingTimeLimitSec(taskNo),
            partLabel: getWritingPartLabel(taskNo),
            fallbackPartLabel: getWritingPartLabel(taskNo),
          });

          await onSubmit(payload);
        }
      } else {
        const selectedItemId = selectedItemIds[0];

        const payload = buildPayload({
          sectionType,
          selectedItemId,
          sortOrder: nextSortOrder,
          timeLimitSec,
          partLabel,
          fallbackPartLabel: option.partLabel,
        });

        await onSubmit(payload);
      }

      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-6 backdrop-blur-sm">
      <div className="flex h-[min(760px,calc(100vh-48px))] w-full max-w-5xl flex-col overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-cyan-100 px-6 py-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-700">
              Test section
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
              Thêm phần thi từ ngân hàng
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Chọn kỹ năng, chọn nội dung đã publish, rồi thêm vào cấu trúc đề
              thi.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[360px_1fr]">
          <aside className="min-h-0 overflow-y-auto border-b border-cyan-100 bg-cyan-50/70 p-5 lg:border-b-0 lg:border-r">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {SECTION_OPTIONS.map((item) => {
                const Icon = item.icon;
                const active = item.type === sectionType;

                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setSectionType(item.type)}
                    className={
                      active
                        ? "rounded-2xl border border-cyan-300 bg-cyan-50 p-4 text-left shadow-sm"
                        : "rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50/40"
                    }
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={
                          active
                            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                            : "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-cyan-700"
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      <span className="min-w-0">
                        <span className="block font-serif text-lg font-bold text-slate-950">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-slate-500">
                          {item.description}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-4 rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl p-4">
              {isWriting ? (
                <div className="rounded-2xl bg-cyan-50 p-4">
                  <p className="text-sm font-semibold text-slate-950">
                    Cách thêm Writing
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Có thể chọn cả Task 1 và Task 2. Hệ thống sẽ tự thêm thành 2
                    section riêng: Task 1 là 20 phút, Task 2 là 40 phút.
                  </p>
                </div>
              ) : (
                <>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-950">
                      Tên hiển thị section
                    </span>
                    <Input
                      value={partLabel}
                      onChange={(event) => setPartLabel(event.target.value)}
                      placeholder="Ví dụ: Listening"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-slate-950">
                      Thời gian làm bài
                    </span>
                    <select
                      value={timeLimitSec}
                      onChange={(event) =>
                        setTimeLimitSec(Number(event.target.value))
                      }
                      className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                    >
                      <option value={900}>15 phút</option>
                      <option value={1800}>30 phút</option>
                      <option value={2400}>40 phút</option>
                      <option value={3600}>60 phút</option>
                      <option value={5400}>90 phút</option>
                    </select>
                  </label>
                </>
              )}

              <div className="rounded-2xl bg-cyan-50 p-4">
                <p className="text-sm font-semibold text-slate-950">
                  Section sẽ thêm
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Thứ tự bắt đầu: <b>{nextSortOrder}</b> · Loại:{" "}
                  <b>{option.label}</b>
                </p>
              </div>
            </div>
          </aside>

          <main className="flex min-h-0 flex-col">
            <div className="shrink-0 border-b border-cyan-100 p-5">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-950">
                  Tìm trong ngân hàng
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    className="pl-9"
                    placeholder={option.searchPlaceholder}
                  />
                </div>
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {error ? <ErrorState message={error} /> : null}

              {loading ? (
                <LoadingState label="Đang tải ngân hàng đề..." />
              ) : filteredItems.length ? (
                <div className="grid gap-3">
                  {filteredItems.map((item) => {
                    const active = selectedItemIds.includes(item.id);

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleItem(item)}
                        className={
                          active
                            ? "w-full rounded-2xl border border-cyan-300 bg-cyan-50 p-4 text-left shadow-sm ring-2 ring-cyan-100/80"
                            : "w-full rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl p-4 text-left transition hover:border-cyan-300 hover:bg-cyan-50/40"
                        }
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={
                              active
                                ? "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                                : "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-cyan-700"
                            }
                          >
                            {active ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <BookOpen className="h-5 w-5" />
                            )}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block font-serif text-lg font-bold text-slate-950">
                              {item.title}
                            </span>

                            {item.subtitle ? (
                              <span className="mt-1 line-clamp-2 block text-sm leading-6 text-slate-500">
                                {item.subtitle}
                              </span>
                            ) : null}

                            <span className="mt-2 block break-all font-mono text-xs text-slate-500">
                              {item.id}
                            </span>
                          </span>

                          <span className="flex shrink-0 flex-col items-end gap-2">
                            {item.status ? (
                              <Badge tone={statusTone(item.status)}>
                                {item.status}
                              </Badge>
                            ) : null}

                            {item.level ? (
                              <span className="text-xs font-semibold text-slate-500">
                                Band {item.level}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Không có nội dung phù hợp"
                  description="Hãy kiểm tra nội dung đã được publish trong ngân hàng đề chưa."
                />
              )}
            </div>
          </main>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-cyan-100 bg-white/80 px-6 py-4">
          <div className="min-w-0">
            {selectedItems.length ? (
              <>
                <p className="text-sm font-semibold text-slate-950">
                  Đã chọn: {selectedItems.length} nội dung
                </p>
                <p className="mt-1 truncate font-mono text-xs text-slate-500">
                  {selectedItems.map((item) => item.id).join(", ")}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                Chưa chọn nội dung từ ngân hàng đề.
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={saving}
            >
              Hủy
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={saving || selectedItemIds.length === 0}
            >
              {saving
                ? "Đang thêm..."
                : isWriting && selectedItemIds.length > 1
                  ? `Thêm ${selectedItemIds.length} section`
                  : "Thêm section"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
