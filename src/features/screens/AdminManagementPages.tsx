"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Eye,
  FilePlus2,
  FileStack,
  Filter,
  Headphones,
  Mic,
  Newspaper,
  PenLine,
  Plus,
  RefreshCcw,
  Search,
  Tags,
  Trash2,
  Upload,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Badge } from "@/components/common/Badge";
import { DataTable } from "@/components/common/DataTable";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { safeArray, formatDate } from "@/lib/utils";
import {
  deleteTest,
  getAdminTests,
  publishTest,
  unpublishTest,
} from "@/lib/api/tests.api";
import { getAdminReadingList } from "@/lib/api/reading.api";
import { getAdminListeningList } from "@/lib/api/listening.api";
import { getAdminWritingList } from "@/lib/api/writing.api";
import { getAdminSpeakingList } from "@/lib/api/speaking.api";
import { createTag, deleteTag, getTags, updateTag } from "@/lib/api/tags.api";
import { getUsers } from "@/lib/api/users.api";
import type { BackendRole, PublishStatus, Test, TestType, User } from "@/types";

type SkillTab = "ALL" | "LISTENING" | "READING" | "SPEAKING" | "WRITING";
const testTabs: { key: SkillTab; label: string; icon: any }[] = [
  { key: "ALL", label: "Tất cả", icon: FileStack },
  { key: "LISTENING", label: "Listening", icon: Headphones },
  { key: "READING", label: "Reading", icon: BookOpen },
  { key: "SPEAKING", label: "Speaking", icon: Mic },
  { key: "WRITING", label: "Writing", icon: PenLine },
];

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

function StatusBadge({ status }: { status?: PublishStatus | string }) {
  const tone =
    status === "PUBLISHED"
      ? "success"
      : status === "ARCHIVED"
        ? "danger"
        : "warning";
  const label =
    status === "PUBLISHED"
      ? "Đã xuất bản"
      : status === "ARCHIVED"
        ? "Lưu trữ"
        : "Bản nháp";
  return <Badge tone={tone}>{label}</Badge>;
}

function SkillTabs({
  active,
  onChange,
}: {
  active: SkillTab;
  onChange: (v: SkillTab) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-cyan-100 bg-white/80 p-2">
      {testTabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${active === key ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
export function AdminTestsVietnamesePage() {
  const [tab, setTab] = useState<SkillTab>("ALL");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "ALL" | "DRAFT" | "PUBLISHED" | "ARCHIVED"
  >("ALL");
  const [level, setLevel] = useState<"ALL" | string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [reloadKey, setReloadKey] = useState(0);

  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Test | null>(null);

  const queryParams = useMemo(() => {
    return {
      ...(tab !== "ALL" ? { type: tab } : {}),
      ...(status !== "ALL" ? { status } : {}),
      ...(level !== "ALL" ? { level: Number(level) } : {}),
      ...(search.trim() ? { search: search.trim() } : {}),
      limit: 50,
    };
  }, [tab, status, level, search]);

  const { data, loading, error } = useApiQuery(
    () => getAdminTests(queryParams),
    [tab, status, level, search, reloadKey],
  );

  const items = safeArray<Test>(data);

  const totalCount = items.length;
  const publishedCount = items.filter(
    (item) => item.status === "PUBLISHED",
  ).length;
  const draftCount = items.filter((item) => item.status === "DRAFT").length;
  const archivedCount = items.filter(
    (item) => item.status === "ARCHIVED",
  ).length;

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = items.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  function getErrorMessage(err: unknown) {
    const anyErr = err as any;
    return (
      anyErr?.response?.data?.message ||
      anyErr?.response?.data?.error ||
      anyErr?.message ||
      "Thao tác thất bại. Vui lòng thử lại."
    );
  }

  function typeLabel(type?: string) {
    const map: Record<string, string> = {
      FULL: "Full Test",
      READING: "Reading",
      LISTENING: "Listening",
      WRITING: "Writing",
      SPEAKING: "Speaking",
    };
    return type ? map[type] || type : "—";
  }

  function typeTone(type?: string) {
    if (type === "FULL") return "sage";
    if (type === "READING") return "success";
    if (type === "LISTENING") return "warning";
    if (type === "WRITING") return "danger";
    if (type === "SPEAKING") return "sage";
    return "sage";
  }

  function getSectionCount(test: Test) {
    return (
      test.sections?.length ??
      (test as any).sectionCount ??
      (test as any)._count?.test_sections ??
      "—"
    );
  }

  function getAttemptCount(test: Test) {
    return (test as any).attemptCount ?? (test as any)._count?.attempts ?? "—";
  }

  function getUpdatedDate(test: Test) {
    return (
      (test as any).updatedAt ||
      (test as any).updated_at ||
      (test as any).createdAt ||
      (test as any).created_at ||
      test.publishedAt
    );
  }

  async function handlePublish(test: Test) {
    setBusyId(test.id);
    setNotice("");
    setActionError("");

    try {
      await publishTest(test.id);
      setNotice(`Đã xuất bản đề “${test.title}”.`);
      setReloadKey((value) => value + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnpublish(test: Test) {
    setBusyId(test.id);
    setNotice("");
    setActionError("");

    try {
      await unpublishTest(test.id);
      setNotice(`Đã chuyển đề “${test.title}” về bản nháp.`);
      setReloadKey((value) => value + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteTest() {
    if (!deleteTarget) return;

    setBusyId(deleteTarget.id);
    setNotice("");
    setActionError("");

    try {
      await deleteTest(deleteTarget.id);
      setNotice(`Đã xóa đề “${deleteTarget.title}”.`);
      setDeleteTarget(null);
      setReloadKey((value) => value + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  function clearFilters() {
    setTab("ALL");
    setSearch("");
    setStatus("ALL");
    setLevel("ALL");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản trị / Đề thi"
        title="Quản lý đề thi"
        description="Quản lý danh sách đề luyện IELTS, trạng thái xuất bản, cấu trúc section và các thao tác preview trước khi đưa ra cho học viên."
        actions={
          <>
            <Link href="/admin/tests/random-build">
              <Button variant="outline">
                <FilePlus2 className="h-4 w-4" />
                Tạo đề ngẫu nhiên
              </Button>
            </Link>

            <Link href="/admin/tests/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo đề thủ công
              </Button>
            </Link>
          </>
        }
      />

      {notice ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
              Tổng đề thi
            </p>
            <p className="mt-3 font-serif text-5xl font-black text-slate-950">
              {totalCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Tổng số đề theo bộ lọc hiện tại.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
              Đã xuất bản
            </p>
            <p className="mt-3 font-serif text-5xl font-black text-slate-950">
              {publishedCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Học viên có thể nhìn thấy và luyện tập.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
              Bản nháp
            </p>
            <p className="mt-3 font-serif text-5xl font-black text-slate-950">
              {draftCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Đề đang chỉnh sửa, chưa publish.
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-700">
              Lưu trữ
            </p>
            <p className="mt-3 font-serif text-5xl font-black text-slate-950">
              {archivedCount}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Đề ít dùng hoặc đã ngừng khai thác.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[32px] border border-cyan-100 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.12)]">
        <CardHeader className="border-b border-cyan-100 px-6 py-5">
          <div className="space-y-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="font-serif text-3xl font-black text-slate-950">
                  Danh sách đề thi
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Hiển thị theo đúng dữ liệu backend hiện có. Bạn có thể lọc,
                  preview, publish hoặc xóa đề tại đây.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => setReloadKey((value) => value + 1)}
              >
                <RefreshCcw className="h-4 w-4" />
                Làm mới
              </Button>
            </div>

            <SkillTabs active={tab} onChange={setTab} />

            <div className="grid gap-3 xl:grid-cols-[1.2fr_170px_170px_150px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  className="pl-9"
                  placeholder="Tìm theo tên đề hoặc mô tả..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="rounded-2xl border border-cyan-100 bg-white/90 px-3 py-2 text-sm text-slate-950 outline-none focus:border-cyan-400"
              >
                <option value="ALL">Tất cả level</option>
                <option value="4">Band 4.0</option>
                <option value="5">Band 5.0</option>
                <option value="5.5">Band 5.5</option>
                <option value="6">Band 6.0</option>
                <option value="6.5">Band 6.5</option>
                <option value="7">Band 7.0</option>
                <option value="7.5">Band 7.5</option>
                <option value="8">Band 8.0</option>
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="rounded-2xl border border-cyan-100 bg-white/90 px-3 py-2 text-sm text-slate-950 outline-none focus:border-cyan-400"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="DRAFT">Bản nháp</option>
                <option value="PUBLISHED">Đã xuất bản</option>
                <option value="ARCHIVED">Lưu trữ</option>
              </select>

              <select
                value={pageSize}
                onChange={(e) =>
                  setPageSize(Number(e.target.value) as typeof pageSize)
                }
                className="rounded-2xl border border-cyan-100 bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} / trang
                  </option>
                ))}
              </select>

              <Button variant="ghost" onClick={clearFilters}>
                <Filter className="h-4 w-4" />
                Xóa lọc
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-6">
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}

          {!loading && !error && items.length === 0 ? (
            <EmptyState
              title="Chưa có đề thi phù hợp"
              description="Bạn có thể đổi bộ lọc hoặc tạo đề mới."
            />
          ) : null}

          {!loading && !error && items.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-[28px] border border-cyan-100">
                <DataTable
                  data={paginatedItems}
                  columns={[
                    {
                      header: "Tên đề thi",
                      cell: (test) => (
                        <div className="max-w-[300px]">
                          <p className="font-serif text-xl font-bold leading-7 text-slate-950">
                            {test.title}
                          </p>
                        </div>
                      ),
                    },
                    {
                      header: "Loại",
                      cell: (test) => (
                        <span className="text-sm font-semibold text-slate-950">
                          {typeLabel(test.type)}
                        </span>
                      ),
                    },
                    {
                      header: "Level",
                      cell: (test) => (
                        <span className="text-sm font-medium text-slate-950">
                          {test.level ?? "—"}
                        </span>
                      ),
                    },
                    {
                      header: "Tag",
                      cell: (test) => (
                        <span className="text-sm text-slate-500">
                          {test.tags?.length
                            ? test.tags.map((tag) => tag.name).join(", ")
                            : "—"}
                        </span>
                      ),
                    },
                    {
                      header: "Section",
                      cell: (test) => (
                        <span className="text-sm font-medium text-slate-950">
                          {getSectionCount(test)}
                        </span>
                      ),
                    },
                    {
                      header: "Attempt",
                      cell: (test) => (
                        <span className="text-sm font-medium text-slate-950">
                          {getAttemptCount(test)}
                        </span>
                      ),
                    },
                    {
                      header: "Trạng thái",
                      cell: (test) => (
                        <span
                          className={`text-sm font-semibold ${
                            test.status === "PUBLISHED"
                              ? "text-cyan-700"
                              : test.status === "DRAFT"
                                ? "text-amber-700"
                                : "text-slate-500"
                          }`}
                        >
                          {test.status === "PUBLISHED"
                            ? "Đã xuất bản"
                            : test.status === "DRAFT"
                              ? "Bản nháp"
                              : test.status || "—"}
                        </span>
                      ),
                    },
                    {
                      header: "Cập nhật",
                      cell: (test) => (
                        <span className="text-sm text-slate-950">
                          {formatDate(getUpdatedDate(test)) || "—"}
                        </span>
                      ),
                    },
                    {
                      header: "Thao tác",
                      cell: (test) => (
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/admin/tests/${test.id}/sections`}>
                            <Button size="sm" variant="outline">
                              Chi tiết
                            </Button>
                          </Link>

                          <Link href={`/admin/tests/${test.id}/preview`}>
                            <Button size="sm" variant="secondary">
                              Xem trước
                            </Button>
                          </Link>

                          {test.status === "PUBLISHED" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busyId === test.id}
                              onClick={() => handleUnpublish(test)}
                            >
                              Ẩn
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={busyId === test.id}
                              onClick={() => handlePublish(test)}
                            >
                              Xuất bản
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busyId === test.id}
                            onClick={() => setDeleteTarget(test)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </Button>
                        </div>
                      ),
                    },
                  ]}
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Hiển thị{" "}
                  <strong className="text-slate-950">
                    {(safePage - 1) * pageSize + 1}
                  </strong>
                  –
                  <strong className="text-slate-950">
                    {Math.min(items.length, safePage * pageSize)}
                  </strong>{" "}
                  trong{" "}
                  <strong className="text-slate-950">{items.length}</strong> đề
                  thi
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
            </>
          ) : null}
        </CardContent>
      </Card>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
          <div className="w-full max-w-lg rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl p-6 shadow-[0_24px_80px_rgba(14,165,233,0.12)]">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600">
              Xác nhận xóa
            </p>

            <h2 className="mt-3 font-serif text-3xl font-black text-slate-950">
              Xóa đề “{deleteTarget.title}”?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Nếu đề này đã có dữ liệu liên quan, backend có thể không cho phép
              xóa. Hãy kiểm tra trước khi xác nhận.
            </p>

            <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm text-slate-500">
              <p>
                <span className="font-semibold text-slate-950">ID:</span>{" "}
                {deleteTarget.id}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-950">Loại đề:</span>{" "}
                {typeLabel(deleteTarget.type)}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-950">
                  Trạng thái:
                </span>{" "}
                {deleteTarget.status || "DRAFT"}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={busyId === deleteTarget.id}
              >
                Hủy
              </Button>

              <Button
                variant="ghost"
                onClick={handleDeleteTest}
                disabled={busyId === deleteTarget.id}
              >
                <Trash2 className="h-4 w-4" />
                {busyId === deleteTarget.id ? "Đang xóa..." : "Xóa đề"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const bankTabs = [
  {
    href: "/admin/listening-sets",
    label: "Listening",
    icon: Headphones,
    key: "listening",
  },
  {
    href: "/admin/reading-sets",
    label: "Reading",
    icon: BookOpen,
    key: "reading",
  },
  {
    href: "/admin/speaking-sets",
    label: "Speaking",
    icon: Mic,
    key: "speaking",
  },
  {
    href: "/admin/writing-tasks",
    label: "Writing",
    icon: PenLine,
    key: "writing",
  },
];

export function AdminBankVietnamesePage({
  skill,
}: {
  skill: "reading" | "listening" | "writing" | "speaking";
}) {
  const [search, setSearch] = useState("");
  const query = useMemo<() => Promise<unknown>>(() => {
    if (skill === "listening") return getAdminListeningList;
    if (skill === "writing") return getAdminWritingList;
    if (skill === "speaking") return getAdminSpeakingList;
    return getAdminReadingList;
  }, [skill]);
  const detailBase = {
    reading: "/admin/reading-sets",
    listening: "/admin/listening-sets",
    writing: "/admin/writing-tasks",
    speaking: "/admin/speaking-sets",
  }[skill];
  const createHref = `${detailBase}/new`;
  const titleMap = {
    reading: "Ngân hàng Reading",
    listening: "Ngân hàng Listening",
    writing: "Ngân hàng Writing",
    speaking: "Ngân hàng Speaking",
  };
  const descMap = {
    reading: "Quản lý passage, câu hỏi và đáp án Reading.",
    listening: "Quản lý audio, transcript, câu hỏi và đáp án Listening.",
    writing: "Quản lý Writing Task 1/2, prompt và hình/chart.",
    speaking: "Quản lý topic, part, prompt và cue card Speaking.",
  };
  const { data, loading, error } = useApiQuery(() => query(), [skill]);
  const items = safeArray<any>(data).filter((x) =>
    (x.title || x.topic || "").toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div>
      <PageHeader
        eyebrow="Ngân hàng đề"
        title={titleMap[skill]}
        description={`${descMap[skill]} Có thể import đề và thêm từng phần đề thủ công.`}
        actions={
          <>
            <Link href="/admin/imports/new">
              <Button variant="outline">
                <Upload className="h-4 w-4" /> Import đề
              </Button>
            </Link>
            <Link href={createHref}>
              <Button>
                <Plus className="h-4 w-4" /> Thêm phần đề
              </Button>
            </Link>
          </>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-cyan-100 bg-white/80 p-2">
        {bankTabs.map(({ href, label, icon: Icon, key }) => (
          <Link
            key={key}
            href={href}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ${skill === key ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-serif text-2xl font-black">
              Danh sách nội dung
            </h2>
            <p className="text-sm text-slate-500">
              Danh sách này dùng để chọn vào đề thi khi admin tạo đề thủ công.
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              className="pl-9"
              placeholder="Tìm nội dung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}
          {!loading && !error && items.length === 0 && (
            <EmptyState
              title="Chưa có nội dung"
              description="Bạn có thể import đề hoặc thêm từng phần đề thủ công."
            />
          )}
          {!loading && !error && items.length > 0 && (
            <DataTable
              data={items}
              columns={[
                {
                  header: "Tên nội dung",
                  cell: (r) => (
                    <div>
                      <p className="font-semibold text-slate-950">
                        {r.title || r.topic || r.id}
                      </p>
                      <p className="text-xs text-slate-500">
                        Level {r.level ?? "—"} •{" "}
                        {r.questions?.length ?? r.parts?.length ?? 0} mục con
                      </p>
                    </div>
                  ),
                },
                {
                  header: "Trạng thái",
                  cell: (r) => <StatusBadge status={r.status} />,
                },
                {
                  header: "Cập nhật",
                  cell: (r) =>
                    formatDate(
                      r.updatedAt ||
                        r.updated_at ||
                        r.createdAt ||
                        r.created_at,
                    ),
                },
                {
                  header: "Thao tác",
                  cell: (r) => (
                    <div className="flex gap-2">
                      <Link href={`${detailBase}/${r.id}`}>
                        <Button size="sm" variant="outline">
                          Chi tiết
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" /> Xóa
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminTagsVietnamesePage() {
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any | null>(null);
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");

  const { data, loading, error } = useApiQuery(() => getTags(), [reloadKey]);

  const tags = safeArray<any>(data);

  const filteredItems = tags.filter((tag) => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return true;

    return `${tag.name || ""} ${tag.slug || ""}`
      .toLowerCase()
      .includes(keyword);
  });

  const latestTag = [...tags].sort((a, b) => {
    const dateA = new Date(
      a.updatedAt || a.updated_at || a.createdAt || a.created_at || 0,
    ).getTime();
    const dateB = new Date(
      b.updatedAt || b.updated_at || b.createdAt || b.created_at || 0,
    ).getTime();

    return dateB - dateA;
  })[0];

  const visibleCount = filteredItems.length;
  const totalCount = tags.length;

  function normalizeSlug(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function getErrorMessage(err: unknown) {
    const anyErr = err as any;

    return (
      anyErr?.response?.data?.message ||
      anyErr?.response?.data?.error ||
      anyErr?.message ||
      "Thao tác thất bại. Vui lòng thử lại."
    );
  }

  function openCreateModal() {
    setEditingTag(null);
    setFormName("");
    setFormSlug("");
    setNotice("");
    setActionError("");
    setModalOpen(true);
  }

  function openEditModal(tag: any) {
    setEditingTag(tag);
    setFormName(tag.name || "");
    setFormSlug(tag.slug || "");
    setNotice("");
    setActionError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingTag(null);
    setFormName("");
    setFormSlug("");
    setActionError("");
  }

  async function handleSaveTag() {
    const name = formName.trim();
    const slug = formSlug.trim();

    setNotice("");
    setActionError("");

    if (!name) {
      setActionError("Tên tag không được để trống.");
      return;
    }

    if (slug && slug !== normalizeSlug(slug)) {
      setActionError("Slug chỉ nên dùng chữ thường, số và dấu gạch ngang.");
      return;
    }

    setSaving(true);

    try {
      if (editingTag) {
        await updateTag(editingTag.id, {
          name,
          slug: slug || undefined,
        });

        setNotice("Đã cập nhật tag thành công.");
      } else {
        await createTag({
          name,
          slug: slug || undefined,
        });

        setNotice("Đã tạo tag mới thành công.");
      }

      setModalOpen(false);
      setEditingTag(null);
      setFormName("");
      setFormSlug("");
      setReloadKey((value) => value + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTag() {
    if (!deleteTarget) return;

    setDeleting(true);
    setNotice("");
    setActionError("");

    try {
      await deleteTag(deleteTarget.id);

      setNotice(`Đã xóa tag "${deleteTarget.name}" thành công.`);
      setDeleteTarget(null);
      setReloadKey((value) => value + 1);
    } catch (err) {
      setActionError(
        `${getErrorMessage(err)} Nếu tag đang được dùng trong đề thi, ngân hàng đề hoặc blog, bạn cần gỡ tag khỏi các nội dung đó trước khi xóa.`,
      );
    } finally {
      setDeleting(false);
    }
  }

  const generatedSlug = normalizeSlug(formName);

  return (
    <div>
      <PageHeader
        eyebrow="Hệ thống / Quản lý tag"
        title="Quản lý tag"
        description="Quản lý thẻ phân loại dùng cho đề thi, ngân hàng đề và bài viết học thuật. Tag giúp học viên tìm kiếm nội dung theo chủ đề, kỹ năng và cấp độ dễ hơn."
        actions={
          <Button onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Tạo tag mới
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                Tổng số tag
              </p>
              <p className="mt-3 font-serif text-4xl font-bold text-slate-950">
                {totalCount}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Tag đang có trong hệ thống.
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Tags className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                Đang hiển thị
              </p>
              <p className="mt-3 font-serif text-4xl font-bold text-slate-950">
                {visibleCount}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Kết quả theo bộ lọc/tìm kiếm hiện tại.
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
              <Search className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                Mới cập nhật
              </p>
              <p className="mt-3 truncate font-serif text-2xl font-black text-slate-950">
                {latestTag?.name || "—"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {latestTag
                  ? formatDate(
                      latestTag.updatedAt ||
                        latestTag.updated_at ||
                        latestTag.createdAt ||
                        latestTag.created_at,
                    )
                  : "Chưa có dữ liệu"}
              </p>
            </div>

            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-50 text-cyan-700">
              <FileStack className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {notice ? (
        <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      ) : null}

      {actionError ? (
        <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {actionError}
        </div>
      ) : null}

      <Card>
        <CardHeader className="border-b border-cyan-100">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-black text-slate-950">
                Danh sách tag
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tìm kiếm, tạo mới, chỉnh sửa hoặc xóa tag chưa được sử dụng.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  className="pl-9"
                  placeholder="Tìm theo tên hoặc slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                onClick={() => setReloadKey((value) => value + 1)}
              >
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}

          {!loading && !error && filteredItems.length === 0 ? (
            <EmptyState
              title={search ? "Không tìm thấy tag phù hợp" : "Chưa có tag"}
              description={
                search
                  ? "Thử đổi từ khóa tìm kiếm hoặc xóa bộ lọc hiện tại."
                  : "Bấm Tạo tag mới để thêm thẻ phân loại đầu tiên."
              }
            />
          ) : null}

          {!loading && !error && filteredItems.length > 0 ? (
            <DataTable
              data={filteredItems}
              columns={[
                {
                  header: "Tên tag",
                  cell: (tag) => (
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                      <div>
                        <p className="font-semibold text-slate-950">
                          {tag.name}
                        </p>
                        <p className="text-xs text-slate-500">ID: {tag.id}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Slug",
                  cell: (tag) => (
                    <code className="rounded-xl bg-slate-100 px-2 py-1 text-xs text-slate-950">
                      {tag.slug || "—"}
                    </code>
                  ),
                },
                {
                  header: "Ngày tạo",
                  cell: (tag) =>
                    formatDate(tag.createdAt || tag.created_at) || "—",
                },
                {
                  header: "Cập nhật",
                  cell: (tag) =>
                    formatDate(tag.updatedAt || tag.updated_at) || "—",
                },
                {
                  header: "Thao tác",
                  cell: (tag) => (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(tag)}
                      >
                        Sửa
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteTarget(tag)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_.9fr]">
        <Card>
          <CardHeader>
            <h2 className="font-serif text-2xl font-black text-slate-950">
              Quy tắc đặt tên tag
            </h2>
          </CardHeader>

          <CardContent className="space-y-4 text-sm leading-7 text-slate-500">
            <div className="rounded-2xl bg-cyan-50/70 p-4">
              <p className="font-semibold text-slate-950">
                1. Ngắn gọn và dễ hiểu
              </p>
              <p className="mt-1">
                Nên dùng các tag như Academic, General Training, Band 7.0,
                Vocabulary, Cambridge 18 để học viên dễ lọc nội dung.
              </p>
            </div>

            <div className="rounded-2xl bg-cyan-50/70 p-4">
              <p className="font-semibold text-slate-950">
                2. Không tạo tag trùng nghĩa
              </p>
              <p className="mt-1">
                Tránh tạo nhiều tag tương tự nhau như Academic, IELTS Academic,
                Acad nếu cùng một mục đích phân loại.
              </p>
            </div>

            <div className="rounded-2xl bg-cyan-50/70 p-4">
              <p className="font-semibold text-slate-950">
                3. Kiểm tra trước khi xóa
              </p>
              <p className="mt-1">
                Backend sẽ chặn xóa nếu tag đang được dùng trong đề thi, ngân
                hàng đề hoặc blog để tránh mất liên kết dữ liệu.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="paper-texture">
          <CardHeader>
            <h2 className="font-serif text-2xl font-black text-slate-950">
              Gợi ý nghiệp vụ
            </h2>
          </CardHeader>

          <CardContent className="space-y-3 text-sm leading-7 text-slate-500">
            <p>
              Tag nên được tạo trước khi admin nhập ngân hàng đề hoặc viết blog.
              Nhờ đó, mỗi Reading passage, Listening set, Writing task hoặc bài
              viết có thể được phân loại nhất quán.
            </p>

            <div className="rounded-2xl border border-cyan-100 bg-white/80 p-4">
              <p className="font-semibold text-slate-950">Ví dụ tag nên có</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  "Academic",
                  "General Training",
                  "Band 7.0",
                  "Cambridge 18",
                  "Vocabulary",
                  "Task 2",
                ].map((tag) => (
                  <Badge key={tag} tone="sage">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
          <div className="w-full max-w-xl rounded-[2rem] border border-cyan-100 bg-white/80 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.12)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-700">
                  {editingTag ? "Chỉnh sửa tag" : "Tạo tag mới"}
                </p>
                <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
                  {editingTag ? "Cập nhật tag" : "Thêm tag phân loại"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Tag sẽ được dùng để phân loại đề thi, ngân hàng đề và bài
                  viết.
                </p>
              </div>

              <Button variant="ghost" onClick={closeModal} disabled={saving}>
                Đóng
              </Button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Tên tag *
                </label>
                <Input
                  placeholder="Ví dụ: Academic"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);

                    if (!editingTag && !formSlug) {
                      setActionError("");
                    }
                  }}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Slug
                </label>
                <Input
                  placeholder={generatedSlug || "academic"}
                  value={formSlug}
                  onChange={(e) => setFormSlug(normalizeSlug(e.target.value))}
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Có thể để trống để backend tự sinh slug. Preview:{" "}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5">
                    {formSlug || generatedSlug || "—"}
                  </code>
                </p>
              </div>

              {actionError ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                  {actionError}
                </div>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={closeModal} disabled={saving}>
                Hủy
              </Button>

              <Button onClick={handleSaveTag} disabled={saving}>
                {saving
                  ? "Đang lưu..."
                  : editingTag
                    ? "Lưu thay đổi"
                    : "Tạo tag"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-cyan-100 bg-white/80 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.12)]">
            <p className="text-xs font-black uppercase tracking-[.2em] text-rose-600">
              Xác nhận xóa
            </p>

            <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
              Xóa tag “{deleteTarget.name}”?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Hành động này không thể hoàn tác. Nếu tag đang được sử dụng trong
              đề thi, ngân hàng đề hoặc blog, backend sẽ chặn thao tác xóa để
              bảo toàn dữ liệu.
            </p>

            <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm">
              <p>
                <span className="font-semibold text-slate-950">Slug:</span>{" "}
                {deleteTarget.slug || "—"}
              </p>
              <p className="mt-1">
                <span className="font-semibold text-slate-950">ID:</span>{" "}
                {deleteTarget.id}
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Hủy
              </Button>

              <Button
                variant="ghost"
                onClick={handleDeleteTag}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Đang xóa..." : "Xóa tag"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AdminUsersVietnamesePage() {
  const [search, setSearch] = useState("");
  const { data, loading, error } = useApiQuery(() => getUsers(), []);
  const items = safeArray<User>(data).filter((u) =>
    `${u.fullName || u.full_name || ""} ${u.email}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const roleLabel: Record<BackendRole, string> = {
    USER: "Học viên",
    TEACHER: "Giáo viên",
    ADMIN: "Admin",
  };
  return (
    <div>
      <PageHeader
        eyebrow="Quản lý người dùng"
        title="Tài khoản hệ thống"
        description="Quản lý tài khoản học viên, giáo viên, admin; nâng quyền và thay đổi trạng thái tài khoản."
      />
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="font-serif text-2xl font-black">
            Danh sách người dùng
          </h2>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input
              className="pl-9"
              placeholder="Tìm email hoặc tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}
          {!loading && !error && items.length === 0 && (
            <EmptyState title="Chưa có người dùng" />
          )}
          {!loading && !error && items.length > 0 && (
            <DataTable
              data={items}
              columns={[
                {
                  header: "Người dùng",
                  cell: (r) => (
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                        {(r.fullName || r.full_name || r.email)
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-950">
                          {r.fullName || r.full_name || "Chưa có tên"}
                        </p>
                        <p className="text-xs text-slate-500">{r.email}</p>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Vai trò",
                  cell: (r) => (
                    <Badge
                      tone={
                        r.role === "ADMIN"
                          ? "danger"
                          : r.role === "TEACHER"
                            ? "brown"
                            : "sage"
                      }
                    >
                      {roleLabel[r.role]}
                    </Badge>
                  ),
                },
                {
                  header: "Trạng thái",
                  cell: (r) => (
                    <Badge
                      tone={
                        r.status === "ACTIVE"
                          ? "success"
                          : r.status === "BLOCKED"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {r.status === "ACTIVE"
                        ? "Hoạt động"
                        : r.status === "BLOCKED"
                          ? "Bị khóa"
                          : "Chờ xác thực"}
                    </Badge>
                  ),
                },
                {
                  header: "Thao tác",
                  cell: (r) => (
                    <div className="flex gap-2">
                      <Link href={`/admin/users/${r.id}`}>
                        <Button size="sm" variant="outline">
                          Chi tiết
                        </Button>
                      </Link>
                      <Button size="sm" variant="secondary">
                        Nâng quyền
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminBlogsVietnamesePage() {
  return (
    <div>
      <PageHeader
        eyebrow="Quản lý blog"
        title="Bài viết IELTSBF"
        description="Thêm, sửa, xóa, tìm kiếm và xuất bản bài blog học thuật cho học viên."
        actions={
          <Link href="/admin/blogs/new">
            <Button>
              <Plus className="h-4 w-4" /> Tạo blog
            </Button>
          </Link>
        }
      />
      <Card className="paper-texture">
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-2xl border border-cyan-100 bg-white/80 p-5">
            <Newspaper className="mb-4 h-6 w-6 text-cyan-700" />
            <h2 className="font-serif text-2xl font-black">
              Không gian biên tập
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Trang này dùng backend blog hiện có. Bạn có thể tiếp tục polish
              editor markdown, preview và thao tác publish/unpublish.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-white">
            <h3 className="font-serif text-xl font-bold">Gợi ý</h3>
            <p className="mt-2 text-sm opacity-90">
              Nên dùng blog cho tips Reading, Writing sample, Speaking topic và
              thông báo lớp học.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
