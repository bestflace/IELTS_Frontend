"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ErrorState, LoadingState } from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import { getNotifications } from "@/lib/api/notifications.api";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { NotificationEmptyState } from "@/components/notifications/NotificationEmptyState";
import { NotificationItem } from "@/components/notifications/NotificationItem";

type FilterType = "ALL" | "UNREAD";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

function extractItems(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function isRead(notification: any) {
  return Boolean(
    notification?.isRead ||
    notification?.is_read ||
    notification?.readAt ||
    notification?.read_at,
  );
}

export function NotificationList() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getNotifications({
        limit: 100,
      });

      setItems(extractItems(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unreadCount = useMemo(
    () => items.filter((item) => !isRead(item)).length,
    [items],
  );

  const visibleItems = useMemo(() => {
    if (filter === "UNREAD") {
      return items.filter((item) => !isRead(item));
    }

    return items;
  }, [items, filter]);

  useEffect(() => {
    setPage(1);
  }, [filter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = visibleItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  const markLocalRead = useCallback((notificationId: string) => {
    const now = new Date().toISOString();

    setItems((current) =>
      current.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              isRead: true,
              is_read: true,
              readAt: now,
              read_at: now,
            }
          : item,
      ),
    );
  }, []);

  const markAllLocalRead = useCallback(() => {
    const now = new Date().toISOString();

    setItems((current) =>
      current.map((item) => ({
        ...item,
        isRead: true,
        is_read: true,
        readAt: now,
        read_at: now,
      })),
    );
  }, []);

  if (loading) {
    return <LoadingState label="Đang tải thông báo..." />;
  }

  return (
    <div className="space-y-5">
      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
        />

        <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Notification center
              </p>

              <h2 className="mt-1 font-serif text-3xl font-black text-slate-950">
                Trung tâm thông báo
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Theo dõi bài đã chấm, bình luận mới và các cập nhật quan trọng
                từ hệ thống.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={filter === "ALL" ? "primary" : "outline"}
                onClick={() => setFilter("ALL")}
              >
                <Bell className="h-4 w-4" />
                Tất cả
              </Button>

              <Button
                type="button"
                variant={filter === "UNREAD" ? "primary" : "outline"}
                onClick={() => setFilter("UNREAD")}
              >
                Chưa đọc ({unreadCount})
              </Button>

              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number(event.target.value) as typeof pageSize)
                }
                className="h-11 rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} / trang
                  </option>
                ))}
              </select>

              <Button type="button" variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4" />
                Làm mới
              </Button>

              <MarkAllReadButton onDone={markAllLocalRead} onError={setError} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          {visibleItems.length ? (
            <>
              <div className="space-y-3">
                {paginatedItems.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onChanged={markLocalRead}
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Hiển thị{" "}
                  <strong className="text-slate-950">
                    {(safePage - 1) * pageSize + 1}
                  </strong>
                  –
                  <strong className="text-slate-950">
                    {Math.min(visibleItems.length, safePage * pageSize)}
                  </strong>{" "}
                  trong{" "}
                  <strong className="text-slate-950">
                    {visibleItems.length}
                  </strong>{" "}
                  thông báo
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
            <NotificationEmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
