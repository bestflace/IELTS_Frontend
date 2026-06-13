"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Eye,
  FileText,
  ListChecks,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";
import { AddSectionModal } from "@/components/tests/AddSectionModal";
import { TestSectionCard } from "@/components/tests/TestSectionCard";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ConfirmDialog } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import {
  addSection,
  deleteSection,
  getAdminTest,
  publishTest,
  unpublishTest,
  updateSection,
} from "@/lib/api/tests.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Test, TestSection } from "@/types";
import type { CreateTestSectionInput } from "@/lib/api/tests.api";

type Props = {
  testId: string;
};

const sortSections = (sections: TestSection[]) =>
  [...sections].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

const statusTone = (status?: string) => {
  if (status === "PUBLISHED") return "success";
  if (status === "ARCHIVED") return "danger";
  return "warning";
};

export function TestSectionManager({ testId }: Props) {
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TestSection | null>(null);

  const sections = useMemo(
    () => sortSections(test?.sections || []),
    [test?.sections],
  );

  const isPublished = test?.status === "PUBLISHED";
  const nextSortOrder = sections.length + 1;

  const canPublish = Boolean(test?.id && sections.length > 0 && !isPublished);

  const loadTest = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminTest(testId);
      setTest(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const handleAddSection = async (payload: CreateTestSectionInput) => {
    await addSection(testId, payload);
    await loadTest();
  };

  const handleDeleteSection = async () => {
    if (!deleteTarget?.id) return;

    setActionLoading(true);

    try {
      await deleteSection(deleteTarget.id);
      setDeleteTarget(null);
      await loadTest();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const updateSectionOrder = async (nextSections: TestSection[]) => {
    const updates = nextSections
      .map((section, index) => ({ ...section, sortOrder: index + 1 }))
      .filter((section) => section.id);

    setActionLoading(true);

    try {
      await Promise.all(
        updates.map((section) =>
          updateSection(section.id as string, { sortOrder: section.sortOrder }),
        ),
      );

      setTest((current) =>
        current
          ? {
              ...current,
              sections: updates,
            }
          : current,
      );

      await loadTest();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveUp = async (section: TestSection) => {
    const currentIndex = sections.findIndex((item) => item.id === section.id);
    if (currentIndex <= 0) return;

    const next = [...sections];
    [next[currentIndex - 1], next[currentIndex]] = [
      next[currentIndex],
      next[currentIndex - 1],
    ];

    await updateSectionOrder(next);
  };

  const handleMoveDown = async (section: TestSection) => {
    const currentIndex = sections.findIndex((item) => item.id === section.id);
    if (currentIndex < 0 || currentIndex >= sections.length - 1) return;

    const next = [...sections];
    [next[currentIndex + 1], next[currentIndex]] = [
      next[currentIndex],
      next[currentIndex + 1],
    ];

    await updateSectionOrder(next);
  };

  const handleUpdateTimeLimit = async (
    section: TestSection,
    timeLimitSec: number | null,
  ) => {
    if (!section.id) return;

    await updateSection(section.id, { timeLimitSec });
    await loadTest();
  };

  const handlePublish = async () => {
    if (!test?.id || !canPublish) return;

    setActionLoading(true);
    setError("");

    try {
      await publishTest(test.id);
      await loadTest();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!test?.id) return;

    setActionLoading(true);
    setError("");

    try {
      await unpublishTest(test.id);
      await loadTest();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải cấu trúc đề thi..." />;
  }

  if (error && !test) {
    return <ErrorState message={error} onRetry={loadTest} />;
  }

  if (!test) {
    return (
      <EmptyState
        title="Không tìm thấy đề thi"
        description="Đề thi có thể đã bị xóa hoặc testId không hợp lệ."
        action={
          <Link href="/admin/tests">
            <Button variant="outline">Quay lại danh sách đề thi</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin / Test builder"
        title="Quản lý cấu trúc đề thi"
        description="Thêm từng phần thi từ ngân hàng đề. Đây là flow tạo đề thủ công, không dùng reroll ngẫu nhiên."
        actions={
          <>
            <Link href="/admin/tests">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>

            <Link href={`/admin/tests/${test.id}/preview`}>
              <Button variant="outline">
                <Eye className="h-4 w-4" />
                Xem trước
              </Button>
            </Link>

            {test.status === "PUBLISHED" ? (
              <Button
                variant="secondary"
                onClick={handleUnpublish}
                disabled={actionLoading}
              >
                <RefreshCw className="h-4 w-4" />
                Gỡ xuất bản
              </Button>
            ) : (
              <Button
                onClick={handlePublish}
                disabled={!canPublish || actionLoading}
              >
                <Send className="h-4 w-4" />
                Xuất bản
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <main className="space-y-5">
          {error ? <ErrorState message={error} onRetry={loadTest} /> : null}
          {isPublished ? (
            <div className="rounded-2xl border border-cyan-100 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
              Đề thi này đang ở trạng thái <b>PUBLISHED</b>, nên không cho thêm,
              sửa, xóa hoặc đổi thứ tự section. Hãy bấm <b>Gỡ xuất bản</b> trước
              khi chỉnh sửa cấu trúc đề.
            </div>
          ) : null}

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                    Test draft
                  </p>
                  <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                    {test.title}
                  </h2>
                  {test.description ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {test.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge tone={statusTone(test.status)}>
                    {test.status || "DRAFT"}
                  </Badge>
                  <Badge tone="sage">{test.type}</Badge>
                  {test.level ? (
                    <Badge tone="brown">Band {test.level}</Badge>
                  ) : null}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                    Sections
                  </p>
                  <p className="mt-2 font-serif text-3xl font-black text-slate-950">
                    {sections.length}
                  </p>
                </div>

                <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                    Total time
                  </p>
                  <p className="mt-2 font-serif text-3xl font-black text-slate-950">
                    {Math.round(
                      sections.reduce(
                        (sum, section) => sum + (section.timeLimitSec || 0),
                        0,
                      ) / 60,
                    )}
                    <span className="ml-1 text-base text-slate-500">phút</span>
                  </p>
                </div>

                <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                    Test ID
                  </p>
                  <p className="mt-2 break-all font-mono text-sm text-slate-950">
                    {test.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-black text-slate-950">
                Danh sách section
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Thứ tự section sẽ được dùng khi learner bắt đầu attempt.
              </p>
            </div>

            <Button onClick={() => setAddOpen(true)} disabled={isPublished}>
              <Plus className="h-4 w-4" />
              Thêm phần thi
            </Button>
          </div>

          {sections.length ? (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <TestSectionCard
                  key={section.id || `${section.sectionType}-${index}`}
                  section={section}
                  index={index}
                  total={sections.length}
                  onDelete={isPublished ? () => {} : setDeleteTarget}
                  onMoveUp={isPublished ? async () => {} : handleMoveUp}
                  onMoveDown={isPublished ? async () => {} : handleMoveDown}
                  onUpdateTimeLimit={
                    isPublished ? async () => {} : handleUpdateTimeLimit
                  }
                  disabled={isPublished}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Đề thi chưa có section"
              description="Hãy thêm Listening, Reading, Writing hoặc Speaking từ ngân hàng đề đã publish."
              action={
                <Button onClick={() => setAddOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Thêm section đầu tiên
                </Button>
              }
            />
          )}
        </main>

        <aside className="space-y-4">
          <Card className="p-5">
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Builder checklist
            </p>
            <h3 className="mt-2 font-serif text-xl font-bold text-slate-950">
              Điều kiện xuất bản
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                <ListChecks className="mt-0.5 h-4 w-4 text-cyan-700" />
                <div>
                  <p className="font-semibold text-slate-950">
                    Có ít nhất 1 section
                  </p>
                  <p className="text-xs text-slate-500">
                    Hiện có {sections.length} section.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                <FileText className="mt-0.5 h-4 w-4 text-cyan-700" />
                <div>
                  <p className="font-semibold text-slate-950">
                    Nguồn nội dung hợp lệ
                  </p>
                  <p className="text-xs text-slate-500">
                    Mỗi section cần liên kết với một item từ ngân hàng đề.
                  </p>
                </div>
              </div>
            </div>

            {!canPublish && test.status !== "PUBLISHED" ? (
              <p className="mt-4 rounded-xl border border-warning/20 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                Chưa thể xuất bản. Hãy thêm ít nhất một section trước.
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <h3 className="font-serif text-xl font-bold text-slate-950">
              Ghi chú nghiệp vụ
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Màn này là tạo đề thủ công. Random build và reroll section nên để
              riêng ở màn Random Build để tránh lẫn flow backend.
            </p>
          </Card>
        </aside>
      </div>

      <AddSectionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        testId={test.id}
        nextSortOrder={nextSortOrder}
        onSubmit={handleAddSection}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa section?"
        description="Section này sẽ bị xóa khỏi cấu trúc đề thi. Nội dung gốc trong ngân hàng đề không bị xóa."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteSection}
      />
    </div>
  );
}
