"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ConfirmDialog, Modal } from "@/components/common/Modal";
import { EmptyState, ErrorState } from "@/components/common/States";
import { ReadingQuestionForm } from "@/components/content-bank/reading/ReadingQuestionForm";
import {
  addReadingQuestion,
  deleteReadingQuestion,
  updateReadingQuestion,
} from "@/lib/api/reading.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Question } from "@/types";
import type { QuestionInput } from "@/lib/api/reading.api";

type Props = {
  readingSetId: string;
  questions: Question[];
  isPublished?: boolean;
  onChanged?: () => void;
};

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

function stringifyJson(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function sortQuestions(questions: Question[]) {
  return [...questions].sort(
    (a, b) => (a.sortOrder || a.qNo || 0) - (b.sortOrder || b.qNo || 0),
  );
}

export function ReadingQuestionManager({
  readingSetId,
  questions,
  isPublished = false,
  onChanged,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [error, setError] = useState("");

  const sortedQuestions = useMemo(() => sortQuestions(questions), [questions]);
  const nextSortOrder = sortedQuestions.length + 1;
  const totalPages = Math.max(1, Math.ceil(sortedQuestions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedQuestions = sortedQuestions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  const openCreateForm = () => {
    setEditingQuestion(null);
    setFormOpen(true);
    setError("");
  };

  const openEditForm = (question: Question) => {
    setEditingQuestion(question);
    setFormOpen(true);
    setError("");
  };

  const handleSubmit = async (payload: QuestionInput) => {
    setActionLoading(true);
    setError("");

    try {
      if (editingQuestion?.id) {
        await updateReadingQuestion(editingQuestion.id, payload);
      } else {
        await addReadingQuestion(readingSetId, payload);
      }

      setFormOpen(false);
      setEditingQuestion(null);
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    setActionLoading(true);
    setError("");

    try {
      await deleteReadingQuestion(deleteTarget.id);
      setDeleteTarget(null);
      onChanged?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Question manager
            </p>
            <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
              Câu hỏi Reading
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Quản lý câu hỏi, lựa chọn, đáp án đúng và thứ tự hiển thị.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value) as typeof pageSize);
                setPage(1);
              }}
              className="h-10 rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-bold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / trang
                </option>
              ))}
            </select>

            <Button onClick={openCreateForm} disabled={isPublished}>
              <Plus className="h-4 w-4" />
              Thêm câu hỏi
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? <ErrorState message={error} /> : null}

        {isPublished ? (
          <div className="rounded-2xl border border-cyan-100 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
            Reading Set này đang được xuất bản. Nếu backend không cho sửa câu
            hỏi đã publish, hãy gỡ xuất bản trước khi chỉnh sửa.
          </div>
        ) : null}

        {sortedQuestions.length ? (
          <>
            <div className="overflow-hidden rounded-2xl border border-cyan-100">
              <table className="w-full min-w-[900px] border-collapse bg-white/80 text-sm">
                <thead className="bg-cyan-50/80 text-left">
                  <tr className="border-b border-cyan-100">
                    <th className="px-4 py-3 font-black text-slate-950">Câu</th>
                    <th className="px-4 py-3 font-black text-slate-950">
                      Loại
                    </th>
                    <th className="px-4 py-3 font-black text-slate-950">
                      Nội dung
                    </th>
                    <th className="px-4 py-3 font-black text-slate-950">
                      Đáp án
                    </th>
                    <th className="px-4 py-3 font-black text-slate-950">
                      Điểm
                    </th>
                    <th className="px-4 py-3 text-right font-black text-slate-950">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedQuestions.map((question, index) => (
                    <tr
                      key={question.id || index}
                      className="border-b border-cyan-100 last:border-b-0"
                    >
                      <td className="px-4 py-4 align-top">
                        <Badge tone="sage">Q{question.qNo || index + 1}</Badge>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <Badge tone="brown">
                          {String(question.questionType || "—")}
                        </Badge>
                      </td>

                      <td className="px-4 py-4 align-top">
                        {question.instructionText ? (
                          <p className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-cyan-700">
                            {question.instructionText}
                          </p>
                        ) : null}

                        <p className="line-clamp-3 max-w-xl text-sm leading-6 text-slate-950">
                          {question.promptText || "Chưa có nội dung câu hỏi."}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Sort order: {question.sortOrder || index + 1}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <code className="line-clamp-3 block max-w-[260px] rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-2 text-xs text-slate-500">
                          {stringifyJson(question.correctAnswerJson)}
                        </code>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span className="font-black text-slate-950">
                          {question.points ?? 1}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditForm(question)}
                            disabled={isPublished}
                          >
                            <Edit3 className="h-4 w-4" />
                            Sửa
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDeleteTarget(question)}
                            disabled={isPublished}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedQuestions.length > pageSize ? (
              <div className="mt-4 flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Hiển thị{" "}
                  <strong className="text-slate-950">
                    {(safePage - 1) * pageSize + 1}
                  </strong>
                  –
                  <strong className="text-slate-950">
                    {Math.min(sortedQuestions.length, safePage * pageSize)}
                  </strong>{" "}
                  trong{" "}
                  <strong className="text-slate-950">
                    {sortedQuestions.length}
                  </strong>{" "}
                  câu hỏi
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>

                  <span className="rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700">
                    {safePage}/{totalPages}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="Chưa có câu hỏi"
            description="Thêm câu hỏi để Reading Set có thể được xuất bản và sử dụng trong đề thi."
            action={
              <Button onClick={openCreateForm} disabled={isPublished}>
                <Plus className="h-4 w-4" />
                Thêm câu hỏi đầu tiên
              </Button>
            }
          />
        )}
      </CardContent>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingQuestion(null);
        }}
        title={editingQuestion ? "Sửa câu hỏi Reading" : "Thêm câu hỏi Reading"}
      >
        <ReadingQuestionForm
          initialData={editingQuestion}
          nextSortOrder={nextSortOrder}
          onSubmit={handleSubmit}
          onCancel={() => {
            setFormOpen(false);
            setEditingQuestion(null);
          }}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa câu hỏi?"
        description="Câu hỏi này sẽ bị xóa khỏi Reading Set. Thao tác này không xóa passage."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
