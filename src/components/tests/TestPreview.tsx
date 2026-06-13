"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Headphones,
  Mic,
  PenLine,
  RefreshCw,
  Send,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getAdminTest, publishTest, unpublishTest } from "@/lib/api/tests.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Test, TestSection } from "@/types";

type Props = {
  testId: string;
};

type SectionType =
  | "READING_SET"
  | "LISTENING_SET"
  | "WRITING_TASK"
  | "SPEAKING_SET";

type SectionSourceItem = {
  id: string;
  title?: string | null;
  topic?: string | null;
  taskNo?: number | null;
  level?: number | null;
  status?: string | null;
};

type SectionSource = {
  type: SectionType | string;
  item: SectionSourceItem | null;
};

type TestSectionWithSource = TestSection & {
  sectionType: SectionType;
  source?: SectionSource | null;
};

type TestWithSections = Test & {
  sections?: TestSectionWithSource[];
};

const SECTION_META: Record<
  SectionType,
  {
    label: string;
    icon: typeof BookOpen;
    tone: "sage" | "brown" | "warning" | "success" | "default";
    description: string;
  }
> = {
  LISTENING_SET: {
    label: "Listening",
    icon: Headphones,
    tone: "sage",
    description: "Phần nghe được lấy từ Listening Bank.",
  },
  READING_SET: {
    label: "Reading",
    icon: BookOpen,
    tone: "brown",
    description: "Phần đọc được lấy từ Reading Bank.",
  },
  WRITING_TASK: {
    label: "Writing",
    icon: PenLine,
    tone: "warning",
    description: "Phần viết được lấy từ Writing Bank.",
  },
  SPEAKING_SET: {
    label: "Speaking",
    icon: Mic,
    tone: "success",
    description: "Phần nói được lấy từ Speaking Bank.",
  },
};

function getSectionMeta(sectionType: string) {
  return (
    SECTION_META[sectionType as SectionType] || {
      label: sectionType,
      icon: FileText,
      tone: "default" as const,
      description: "Section trong cấu trúc đề thi.",
    }
  );
}

function sortSections(sections: TestSectionWithSource[]) {
  return [...sections].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function formatMinutes(seconds?: number | null) {
  if (!seconds) return "Chưa đặt";
  return `${Math.round(seconds / 60)} phút`;
}

function getTestStatusTone(status?: string) {
  if (status === "PUBLISHED") return "success";
  if (status === "DRAFT") return "warning";
  return "brown";
}

function getSourceItem(section: TestSectionWithSource) {
  return section.source?.item || null;
}

function getSourceTitle(section: TestSectionWithSource) {
  const item = getSourceItem(section);

  if (!item) return "Chưa có dữ liệu nguồn";

  if (item.title) return item.title;
  if (item.topic) return item.topic;
  if (item.taskNo) return `Writing Task ${item.taskNo}`;

  return item.id;
}

function getSourceId(section: TestSectionWithSource) {
  const item = getSourceItem(section);

  if (item?.id) return item.id;
  if (section.readingSetId) return section.readingSetId;
  if (section.listeningSetId) return section.listeningSetId;
  if (section.writingTaskId) return section.writingTaskId;
  if (section.speakingSetId) return section.speakingSetId;

  return "Chưa có source id";
}

function getSourceStatus(section: TestSectionWithSource) {
  return getSourceItem(section)?.status || null;
}

function getSourceLevel(section: TestSectionWithSource) {
  return getSourceItem(section)?.level || null;
}

function hasValidSource(section: TestSectionWithSource) {
  if (section.sectionType === "READING_SET")
    return Boolean(section.readingSetId);
  if (section.sectionType === "LISTENING_SET")
    return Boolean(section.listeningSetId);
  if (section.sectionType === "WRITING_TASK")
    return Boolean(section.writingTaskId);
  if (section.sectionType === "SPEAKING_SET")
    return Boolean(section.speakingSetId);

  return false;
}

function SectionSourceSummary({
  section,
  index,
}: {
  section: TestSectionWithSource;
  index: number;
}) {
  const meta = getSectionMeta(section.sectionType);
  const Icon = meta.icon;

  const sourceItem = getSourceItem(section);
  const sourceStatus = getSourceStatus(section);
  const sourceLevel = getSourceLevel(section);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50/70">
              <Icon className="h-5 w-5 text-cyan-700" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={meta.tone}>{meta.label}</Badge>
                <span className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">
                  Section {index + 1}
                </span>
              </div>

              <h3 className="mt-2 font-serif text-2xl font-black text-slate-950">
                {section.partLabel || meta.label}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {meta.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <Badge tone="sage">
              <Clock3 className="mr-1 h-3.5 w-3.5" />
              {formatMinutes(section.timeLimitSec)}
            </Badge>

            {sourceStatus ? (
              <Badge
                tone={sourceStatus === "PUBLISHED" ? "success" : "warning"}
              >
                Source {sourceStatus}
              </Badge>
            ) : null}

            {sourceLevel ? (
              <Badge tone="brown">Band {sourceLevel}</Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
            Source summary
          </p>

          <h4 className="mt-2 font-serif text-xl font-bold text-slate-950">
            {getSourceTitle(section)}
          </h4>

          <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                Source ID
              </p>
              <p className="mt-1 break-all font-mono text-xs text-slate-950">
                {getSourceId(section)}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                Source type
              </p>
              <p className="mt-1 font-mono text-xs text-slate-950">
                {section.source?.type || section.sectionType}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                Sort order
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {section.sortOrder || index + 1}
              </p>
            </div>

            <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                Time limit
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {formatMinutes(section.timeLimitSec)}
              </p>
            </div>
          </div>

          {!sourceItem ? (
            <div className="mt-4 rounded-[26px] border border-dashed border-cyan-200 bg-cyan-50/60 p-4 text-sm leading-6 text-amber-700">
              Section này chưa có source item. Hãy quay lại màn quản lý section
              để chọn nội dung từ ngân hàng đề.
            </div>
          ) : null}

          <div className="mt-4 rounded-[26px] border border-dashed border-cyan-200 bg-cyan-50/60 p-4 text-sm leading-6 text-slate-500">
            Đây là bản xem trước cấu trúc đề thi. Màn này giúp kiểm tra thứ tự
            phần thi, thời lượng và nguồn nội dung được chọn. Để xem hoặc chỉnh
            sửa nội dung chi tiết, hãy mở phần thi trong ngân hàng đề tương ứng.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TestPreview({ testId }: Props) {
  const [test, setTest] = useState<TestWithSections | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTest = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminTest(testId);
      setTest(data as TestWithSections);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const sections = useMemo(() => {
    return sortSections(test?.sections || []);
  }, [test?.sections]);

  const totalTimeMinutes = useMemo(() => {
    const totalSeconds = sections.reduce(
      (sum, section) => sum + (section.timeLimitSec || 0),
      0,
    );

    return Math.round(totalSeconds / 60);
  }, [sections]);

  const hasMissingSource = useMemo(() => {
    return sections.some((section) => !hasValidSource(section));
  }, [sections]);

  //   const hasDraftSource = useMemo(() => {
  //     return sections.some((section) => {
  //       const status = getSourceStatus(section);
  //       return Boolean(status && status !== "PUBLISHED");
  //     });
  //   }, [sections]);

  const canPublish = Boolean(
    test?.id &&
    test.status !== "PUBLISHED" &&
    sections.length > 0 &&
    !hasMissingSource,
  );

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
    return <LoadingState label="Đang tải bản xem trước đề thi..." />;
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
            <Button variant="outline">Quay lại danh sách đề</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin / Test preview"
        title="Xem trước đề thi"
        description="Kiểm tra cấu trúc đề, source từng section và điều kiện xuất bản trước khi learner nhìn thấy đề."
        actions={
          <>
            <Link href={`/admin/tests/${test.id}/sections`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Sửa cấu trúc
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

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                    Test information
                  </p>

                  <h2 className="mt-1 font-serif text-3xl font-black text-slate-950">
                    {test.title}
                  </h2>

                  {test.description ? (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {test.description}
                    </p>
                  ) : null}

                  {test.tags?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {test.tags.map((tag) => (
                        <Badge key={tag.id} tone="sage">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Badge tone={getTestStatusTone(test.status)}>
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
                    {totalTimeMinutes}
                    <span className="ml-1 text-base text-slate-500">phút</span>
                  </p>
                </div>

                <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                    Publish status
                  </p>
                  <p className="mt-2 flex items-center gap-2 font-serif text-2xl font-black text-slate-950">
                    {test.status === "PUBLISHED" ? (
                      <CheckCircle2 className="h-5 w-5 text-cyan-700" />
                    ) : null}
                    {test.status || "DRAFT"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {sections.length ? (
            <div className="space-y-5">
              {sections.map((section, index) => (
                <SectionSourceSummary
                  key={section.id || `${section.sectionType}-${index}`}
                  section={section}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Đề thi chưa có section"
              description="Bạn cần thêm ít nhất một section trước khi preview hoặc publish."
              action={
                <Link href={`/admin/tests/${test.id}/sections`}>
                  <Button>Thêm section</Button>
                </Link>
              }
            />
          )}
        </main>

        <aside className="space-y-4">
          <Card className="p-5">
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Preview checklist
            </p>

            <h3 className="mt-2 font-serif text-xl font-bold text-slate-950">
              Điều kiện xuất bản
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                <p className="font-semibold text-slate-950">1. Có section</p>
                <p className="mt-1 text-xs text-slate-500">
                  Hiện có {sections.length} section.
                </p>
              </div>

              <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                <p className="font-semibold text-slate-950">
                  2. Source ID hợp lệ
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {hasMissingSource
                    ? "Có section thiếu source ID."
                    : "Tất cả section đã có source ID."}
                </p>
              </div>

              <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                <p className="font-semibold text-slate-950">
                  3. Thứ tự phần thi
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Kiểm tra thứ tự Listening, Reading, Writing, Speaking theo cấu
                  trúc đề mong muốn.
                </p>
              </div>

              <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
                <p className="font-semibold text-slate-950">
                  4. Nguồn nội dung
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Mỗi phần thi cần được liên kết đúng với một nội dung trong
                  ngân hàng đề.
                </p>
              </div>
            </div>

            {!canPublish && test.status !== "PUBLISHED" ? (
              <p className="mt-4 rounded-xl border border-cyan-100 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                Chưa thể xuất bản đề. Hãy thêm ít nhất một phần thi và đảm bảo
                mỗi phần thi đã được chọn nguồn nội dung.
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <h3 className="font-serif text-xl font-bold text-slate-950">
              Điều hướng
            </h3>

            <div className="mt-4 flex flex-col gap-2">
              <Link href={`/admin/tests/${test.id}/sections`}>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4" />
                  Quản lý section
                </Button>
              </Link>

              <Link href={`/admin/tests/${test.id}/learner-preview`}>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4" />
                  Xem như learner
                </Button>
              </Link>

              <Link href="/admin/tests">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4" />
                  Danh sách đề thi
                </Button>
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
