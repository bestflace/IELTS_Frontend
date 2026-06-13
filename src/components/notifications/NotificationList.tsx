"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ErrorState, LoadingState } from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import { getNotifications } from "@/lib/api/notifications.api";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";
import { NotificationEmptyState } from "@/components/notifications/NotificationEmptyState";
import { NotificationItem } from "@/components/notifications/NotificationItem";

type FilterType = "ALL" | "UNREAD";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getNotifications({
        limit: 50,
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
            <div className="space-y-3">
              {visibleItems.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onChanged={markLocalRead}
                />
              ))}
            </div>
          ) : (
            <NotificationEmptyState />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
