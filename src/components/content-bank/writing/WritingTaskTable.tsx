"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  RefreshCw,
  Search,
  Send,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ConfirmDialog } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import {
  deleteWriting,
  getAdminWritingList,
  publishWriting,
  unpublishWriting,
} from "@/lib/api/writing.api";
import { getErrorMessage } from "@/lib/api/client";
import type { PublishStatus, WritingTask } from "@/types";

const statusOptions: Array<{ label: string; value: "" | PublishStatus }> = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Bản nháp", value: "DRAFT" },
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Lưu trữ", value: "ARCHIVED" },
];

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

function statusText(status?: PublishStatus) {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "ARCHIVED") return "Lưu trữ";
  return "Bản nháp";
}

function formatDate(value?: string) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function WritingTaskTable() {
  const [items, setItems] = useState<WritingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"" | PublishStatus>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [deleteTarget, setDeleteTarget] = useState<WritingTask | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getAdminWritingList({
        search: keyword.trim() || undefined,
        status: status || undefined,
      });

      setItems(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [keyword, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return items.filter((item) => {
      const matchKeyword = normalizedKeyword
        ? `${item.title} ${item.promptText || ""}`
            .toLowerCase()
            .includes(normalizedKeyword)
        : true;

      const matchStatus = status ? item.status === status : true;

      return matchKeyword && matchStatus;
    });
  }, [items, keyword, status]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  const handlePublish = async (item: WritingTask) => {
    setActionLoading(true);
    setError("");

    try {
      if (item.status === "PUBLISHED") {
        await unpublishWriting(item.id);
      } else {
        await publishWriting(item.id);
      }

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setActionLoading(true);
    setError("");

    try {
      await deleteWriting(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải ngân hàng Writing..." />;
  }

  if (error && !items.length) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-5">
      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Writing Bank
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                Danh sách Writing Task
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chỉ những Writing Task đã xuất bản mới được chọn khi tạo đề thi.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={loadData}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="pl-9"
                placeholder="Tìm theo tên task hoặc prompt..."
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "" | PublishStatus)
              }
              className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            >
              {statusOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={pageSize}
              onChange={(event) =>
                setPageSize(Number(event.target.value) as typeof pageSize)
              }
              className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / trang
                </option>
              ))}
            </select>
          </div>

          {filteredItems.length ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-cyan-100">
                <table className="w-full min-w-[900px] border-collapse bg-white/80 text-sm">
                  <thead className="bg-cyan-50/80 text-left">
                    <tr className="border-b border-cyan-100">
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Writing Task
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Task
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Band
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Media
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Cập nhật
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-950">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedItems.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-cyan-100 last:border-b-0"
                      >
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-slate-950">
                            {item.title}
                          </p>
                          {item.promptText ? (
                            <p className="mt-1 line-clamp-2 max-w-xl text-xs leading-5 text-slate-500">
                              {item.promptText}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4 align-top text-sm text-slate-950">
                          Task {item.taskNo || "—"}
                        </td>

                        <td className="px-4 py-4 align-top text-sm text-slate-950">
                          {item.level ?? "—"}
                        </td>

                        <td className="px-4 py-4 align-top text-sm text-slate-950">
                          {statusText(item.status)}
                        </td>

                        <td className="px-4 py-4 align-top text-sm text-slate-950">
                          {item.chartUrl || item.imageUrl
                            ? "Có media"
                            : "Không có"}
                        </td>

                        <td className="px-4 py-4 align-top text-xs text-slate-500">
                          {formatDate(item.updatedAt || item.createdAt)}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/writing-tasks/${item.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                                Chi tiết
                              </Button>
                            </Link>

                            <Button
                              size="sm"
                              variant={
                                item.status === "PUBLISHED"
                                  ? "secondary"
                                  : "outline"
                              }
                              onClick={() => handlePublish(item)}
                              disabled={actionLoading}
                            >
                              <Send className="h-4 w-4" />
                              {item.status === "PUBLISHED" ? "Gỡ" : "Publish"}
                            </Button>

                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setDeleteTarget(item)}
                              disabled={
                                actionLoading || item.status === "PUBLISHED"
                              }
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

              <div className="mt-5 flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Hiển thị{" "}
                  <strong className="text-slate-950">
                    {(safePage - 1) * pageSize + 1}
                  </strong>
                  –
                  <strong className="text-slate-950">
                    {Math.min(filteredItems.length, safePage * pageSize)}
                  </strong>{" "}
                  trong{" "}
                  <strong className="text-slate-950">
                    {filteredItems.length}
                  </strong>{" "}
                  Writing Task
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
          ) : (
            <EmptyState
              title="Chưa có Writing Task"
              description="Tạo task đầu tiên hoặc import CSV để xây dựng ngân hàng Writing."
              action={
                <Link href="/admin/writing-tasks/new">
                  <Button>Tạo Writing Task</Button>
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa Writing Task?"
        description="Writing Task này sẽ bị xóa khỏi ngân hàng đề. Không nên xóa nếu nội dung đã được dùng trong đề thi."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
