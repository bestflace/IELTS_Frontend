"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  Loader2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications.api";

type NotificationItem = {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  content?: string;
  type?: string;
  isRead?: boolean;
  is_read?: boolean;
  readAt?: string | null;
  read_at?: string | null;
  createdAt?: string;
  created_at?: string;
};

function notificationMessage(item: NotificationItem) {
  return (
    item.message ||
    item.body ||
    item.content ||
    "Bạn có một thông báo mới từ IELTSBF."
  );
}

function notificationTitle(item: NotificationItem) {
  return item.title || "Thông báo";
}

function notificationRead(item: NotificationItem) {
  return Boolean(item.isRead || item.is_read || item.readAt || item.read_at);
}

function getTypeLabel(type?: string) {
  if (type === "TEACHER_REVIEW_DONE") return "Bài đã chấm";
  if (type === "AI_GRADING_DONE") return "AI đã chấm";
  if (type === "TEST_PUBLISHED") return "Đề thi mới";
  if (type === "BLOG_PUBLISHED") return "Bài viết mới";
  if (type === "COMMENT_CREATED" || type === "COMMENT_REPLY") {
    return "Bình luận";
  }

  return "Thông báo";
}

function formatDate(value?: string) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function extractItems(data: unknown): NotificationItem[] {
  if (Array.isArray(data)) return data as NotificationItem[];

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (Array.isArray(record.items)) {
      return record.items as NotificationItem[];
    }

    if (Array.isArray(record.data)) {
      return record.data as NotificationItem[];
    }

    if (
      record.data &&
      typeof record.data === "object" &&
      Array.isArray((record.data as Record<string, unknown>).items)
    ) {
      return (record.data as Record<string, unknown>)
        .items as NotificationItem[];
    }
  }

  return [];
}

function extractUnreadCount(data: unknown) {
  if (typeof data === "number") return data;

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    return Number(record.unreadCount || record.count || 0);
  }

  return 0;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  async function loadUnreadCount() {
    try {
      const data = await getUnreadCount();
      setUnread(extractUnreadCount(data));
    } catch {
      setUnread(0);
    }
  }

  async function loadNotifications() {
    setLoading(true);

    try {
      const data = await getNotifications({ limit: 6 } as any);
      setItems(extractItems(data));
    } finally {
      setLoading(false);
    }
  }

  async function openPopover() {
    const next = !open;
    setOpen(next);

    if (next) {
      await Promise.all([loadUnreadCount(), loadNotifications()]);
    }
  }

  async function readOne(id: string) {
    try {
      await markNotificationRead(id);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                isRead: true,
                is_read: true,
                readAt: new Date().toISOString(),
                read_at: new Date().toISOString(),
              }
            : item,
        ),
      );

      setUnread((value) => Math.max(0, value - 1));
    } catch {
      // Giữ im lặng để không làm phiền học viên.
    }
  }

  async function readAll() {
    try {
      await markAllNotificationsRead();

      const now = new Date().toISOString();

      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          is_read: true,
          readAt: now,
          read_at: now,
        })),
      );

      setUnread(0);
    } catch {
      // Giữ im lặng để không làm phiền học viên.
    }
  }

  useEffect(() => {
    loadUnreadCount();
  }, []);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={openPopover}
        className="relative grid h-11 w-11 place-items-center rounded-full border border-cyan-100 bg-white/85 text-sky-700 shadow-[0_12px_30px_rgba(14,165,233,0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 hover:shadow-[0_18px_38px_rgba(14,165,233,0.22)]"
        aria-label="Thông báo"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />

        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-1 text-[10px] font-black text-white shadow-lg shadow-cyan-500/30 ring-2 ring-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[120] w-[min(calc(100vw-1.5rem),420px)] overflow-hidden rounded-[28px] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-8 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl"
          />

          <div className="relative border-b border-sky-100/80 bg-gradient-to-r from-cyan-50/95 via-white/95 to-blue-50/95 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  Notification center
                </p>

                <h3 className="mt-1 font-serif text-2xl font-black text-slate-950">
                  Thông báo
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Cập nhật về lớp học, bài chấm và bình luận.
                </p>
              </div>

              <button
                type="button"
                onClick={readAll}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-100 bg-white/80 px-3 py-2 text-xs font-bold text-sky-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:opacity-50"
                disabled={!items.length}
              >
                <CheckCheck className="h-4 w-4" />
                Đọc tất cả
              </button>
            </div>
          </div>

          <div className="relative max-h-[420px] overflow-y-auto px-3 py-3">
            {loading ? (
              <div className="flex items-center justify-center gap-3 rounded-3xl border border-sky-100 bg-sky-50/80 px-4 py-8 text-sm font-semibold text-sky-700">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải thông báo...
              </div>
            ) : null}

            {!loading && items.length === 0 ? (
              <div className="rounded-3xl border border-sky-100 bg-sky-50/70 p-4">
                <EmptyState
                  title="Chưa có thông báo"
                  description="Thông báo về lớp học, bài đã chấm hoặc bình luận sẽ hiển thị tại đây."
                />
              </div>
            ) : null}

            {!loading
              ? items.map((item) => {
                  const read = notificationRead(item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => readOne(item.id)}
                      className={`group mb-2 w-full rounded-3xl border p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(14,165,233,0.12)] ${
                        read
                          ? "border-sky-100 bg-white/80"
                          : "border-cyan-200 bg-gradient-to-r from-cyan-50/95 to-blue-50/95"
                      }`}
                    >
                      <div className="flex gap-3">
                        <span
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full shadow-sm ${
                            read
                              ? "bg-slate-200"
                              : "bg-cyan-500 shadow-cyan-400/60"
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-600">
                              {getTypeLabel(item.type)}
                            </p>

                            <span className="shrink-0 text-[11px] font-semibold text-slate-400">
                              {formatDate(item.createdAt || item.created_at)}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-1 font-bold text-slate-900">
                            {notificationTitle(item)}
                          </p>

                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                            {notificationMessage(item)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              : null}
          </div>

          <div className="relative border-t border-sky-100 bg-white/95 p-3">
            <Link href="/learner/notifications" onClick={() => setOpen(false)}>
              <Button
                variant="outline"
                className="h-11 w-full justify-center rounded-2xl border-cyan-200 bg-white/80 font-bold text-sky-700 shadow-sm hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
              >
                Xem tất cả thông báo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
