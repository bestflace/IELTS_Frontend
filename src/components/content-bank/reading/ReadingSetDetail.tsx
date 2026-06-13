"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Eye, RefreshCw, Send } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { ReadingPassageEditor } from "@/components/content-bank/reading/ReadingPassageEditor";
import { ReadingQuestionManager } from "@/components/content-bank/reading/ReadingQuestionManager";
import {
  getAdminReading,
  publishReading,
  unpublishReading,
} from "@/lib/api/reading.api";
import { getErrorMessage } from "@/lib/api/client";
import { getAdminTests } from "@/lib/api/tests.api";
import type { PublishStatus, ReadingSet } from "@/types";

type Props = {
  setId: string;
};

function statusTone(status?: PublishStatus) {
  if (status === "PUBLISHED") return "success";
  if (status === "ARCHIVED") return "danger";
  return "warning";
}

function formatDate(value?: string) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function extractArray(response: unknown): any[] {
  if (Array.isArray(response)) return response;

  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as { data?: unknown }).data)
  ) {
    return (response as { data: any[] }).data;
  }

  if (
    response &&
    typeof response === "object" &&
    Array.isArray((response as { items?: unknown }).items)
  ) {
    return (response as { items: any[] }).items;
  }

  return [];
}

function getDirectPreviewTestId(readingSet: any) {
  return (
    readingSet?.testId ||
    readingSet?.test_id ||
    readingSet?.test?.id ||
    readingSet?.tests?.[0]?.id ||
    readingSet?.availableTests?.[0]?.id ||
    readingSet?.available_tests?.[0]?.id ||
    null
  );
}

function testUsesReadingSet(test: any, readingSetId: string) {
  const sections = Array.isArray(test?.sections) ? test.sections : [];

  return sections.some((section: any) => {
    return (
      section?.readingSetId === readingSetId ||
      section?.reading_set_id === readingSetId ||
      section?.readingSet?.id === readingSetId ||
      section?.reading_set?.id === readingSetId ||
      section?.contentId === readingSetId ||
      section?.content_id === readingSetId
    );
  });
}

export function ReadingSetDetail({ setId }: Props) {
  const [readingSet, setReadingSet] = useState<ReadingSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewTestId, setPreviewTestId] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminReading(setId);
      setReadingSet(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!readingSet?.id) {
      setPreviewTestId(null);
      return;
    }

    const readingSetId = readingSet.id;
    const directPreviewTestId = getDirectPreviewTestId(readingSet);

    if (directPreviewTestId) {
      setPreviewTestId(directPreviewTestId);
      return;
    }

    let cancelled = false;

    async function findPreviewTest() {
      setPreviewLoading(true);

      try {
        const response = await getAdminTests({ limit: 100 });
        const tests = extractArray(response);
        const matchedTest = tests.find((test) =>
          testUsesReadingSet(test, readingSetId),
        );

        if (!cancelled) {
          setPreviewTestId(matchedTest?.id || null);
        }
      } catch {
        if (!cancelled) {
          setPreviewTestId(null);
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    }

    findPreviewTest();

    return () => {
      cancelled = true;
    };
  }, [readingSet]);

  const handleTogglePublish = async () => {
    if (!readingSet) return;

    setActionLoading(true);
    setError("");

    try {
      if (readingSet.status === "PUBLISHED") {
        await unpublishReading(readingSet.id);
      } else {
        await publishReading(readingSet.id);
      }

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải Reading Set..." />;
  }

  if (error && !readingSet) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!readingSet) {
    return (
      <EmptyState
        title="Không tìm thấy Reading Set"
        description="Bài đọc có thể đã bị xóa hoặc ID không hợp lệ."
        action={
          <Link href="/admin/reading-sets">
            <Button variant="outline">Quay lại ngân hàng Reading</Button>
          </Link>
        }
      />
    );
  }

  const isPublished = readingSet.status === "PUBLISHED";
  const questionCount = readingSet.questions?.length || 0;
  const canPublish =
    Boolean(readingSet.passageText || readingSet.passageHtml) &&
    questionCount > 0;

  return (
    <div>
      <PageHeader
        eyebrow="Admin / Reading Bank"
        title={readingSet.title}
        description="Quản lý passage, câu hỏi, đáp án và trạng thái xuất bản của Reading Set."
        actions={
          <>
            <Link href="/admin/reading-sets">
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

          <ReadingPassageEditor
            readingSet={readingSet}
            onSaved={setReadingSet}
            onReload={loadData}
          />

          <ReadingQuestionManager
            readingSetId={readingSet.id}
            questions={readingSet.questions || []}
            isPublished={isPublished}
            onChanged={loadData}
          />
        </main>

        <aside className="grid min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Reading overview
              </p>
              <h2 className="mt-1 font-serif text-xl font-black text-slate-950">
                Thông tin bài đọc
              </h2>
            </CardHeader>

            <CardContent className="min-w-0 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone={statusTone(readingSet.status)}>
                  {readingSet.status || "DRAFT"}
                </Badge>

                {readingSet.level ? (
                  <Badge tone="brown">Band {readingSet.level}</Badge>
                ) : null}

                <Badge tone="sage">{questionCount} câu hỏi</Badge>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                  Reading Set ID
                </p>
                <p className="mt-2 break-all font-mono text-xs text-slate-950">
                  {readingSet.id}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                  Cập nhật lần cuối
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {formatDate(readingSet.updatedAt || readingSet.createdAt)}
                </p>
              </div>

              {readingSet.tags?.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-950">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {readingSet.tags.map((tag) => (
                      <Badge key={tag.id} tone="sage">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl">
                <BookOpen className="h-4 w-4 text-cyan-700" />
              </div>

              <div className="min-w-0">
                <h3 className="font-serif text-xl font-black text-slate-950">
                  Điều kiện xuất bản
                </h3>

                <div className="mt-3 space-y-3 text-sm text-slate-500">
                  <div className="rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-3">
                    <p className="font-black text-slate-950">1. Có passage</p>
                    <p className="mt-1 text-xs">
                      {readingSet.passageText || readingSet.passageHtml
                        ? "Đã có nội dung bài đọc."
                        : "Chưa có passage."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-3">
                    <p className="font-black text-slate-950">2. Có câu hỏi</p>
                    <p className="mt-1 text-xs">
                      Hiện có {questionCount} câu hỏi.
                    </p>
                  </div>

                  <div className="rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-3">
                    <p className="font-black text-slate-950">
                      3. Đáp án rõ ràng
                    </p>
                    <p className="mt-1 text-xs">
                      Mỗi câu hỏi cần có đáp án để learner được chấm điểm.
                    </p>
                  </div>
                </div>

                {!isPublished && !canPublish ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                    Chưa thể xuất bản. Hãy nhập passage và thêm ít nhất một câu
                    hỏi.
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          <Card className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <h3 className="font-serif text-xl font-black text-slate-950">
              Xem nhanh
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Mở màn hình preview admin của đề đang sử dụng Reading Set này.
              Preview dùng được cả khi đề chưa xuất bản.
            </p>

            {previewTestId ? (
              <Link href={`/admin/tests/${previewTestId}/preview`}>
                <Button variant="outline" className="mt-4 w-full justify-start">
                  <Eye className="h-4 w-4" />
                  Xem preview đề
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                className="mt-4 w-full justify-start"
                disabled
              >
                <Eye className="h-4 w-4" />
                {previewLoading ? "Đang tìm đề..." : "Chưa gắn vào đề nào"}
              </Button>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
