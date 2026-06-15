"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpenCheck,
  FileText,
  MessageCircle,
  Newspaper,
  ShieldCheck,
} from "lucide-react";

import { markNotificationRead } from "@/lib/api/notifications.api";
import type { Notification } from "@/types";

type NotificationLike = Notification & {
  is_read?: boolean;
  readAt?: string | null;
  read_at?: string | null;
  created_at?: string;
  dataJson?: any;
  data_json?: any;
};

type Props = {
  notification: NotificationLike;
  onChanged?: (notificationId: string) => void;
};

function isRead(notification: NotificationLike) {
  return Boolean(
    notification.isRead ??
    notification.is_read ??
    notification.readAt ??
    notification.read_at,
  );
}

function getMessage(notification: NotificationLike) {
  return notification.message || notification.body || "";
}

function getData(notification: NotificationLike) {
  return notification.dataJson || notification.data_json || {};
}

function getTypeLabel(type?: string) {
  if (type === "TEACHER_REVIEW_DONE") return "Bài đã chấm";
  if (type === "BLOG_PUBLISHED") return "Bài viết mới";
  if (type === "AI_GRADING_DONE") return "AI đã chấm";
  if (type === "TEST_PUBLISHED") return "Đề thi mới";
  if (type === "COMMENT_CREATED" || type === "COMMENT_REPLY")
    return "Bình luận";
  return "Thông báo";
}

function getIcon(type?: string) {
  if (type === "TEACHER_REVIEW_DONE") return BookOpenCheck;
  if (type === "BLOG_PUBLISHED") return Newspaper;
  if (type === "AI_GRADING_DONE") return ShieldCheck;
  if (type === "TEST_PUBLISHED") return FileText;
  if (type === "COMMENT_CREATED" || type === "COMMENT_REPLY")
    return MessageCircle;
  return Bell;
}

function formatDate(value?: string) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getNotificationHref(notification: NotificationLike) {
  const data = getData(notification);
  const isCommentNotification =
    notification.type === "COMMENT_CREATED" ||
    notification.type === "COMMENT_REPLY" ||
    data?.kind === "ATTEMPT_COMMENT" ||
    data?.kind === "ATTEMPT_COMMENT_REPLY" ||
    String(notification.title || "")
      .toLowerCase()
      .includes("bình luận") ||
    String(notification.message || notification.body || "")
      .toLowerCase()
      .includes("bình luận");

  if (data?.submissionId) {
    return isCommentNotification
      ? `/teacher/submissions/${data.submissionId}#discussion`
      : `/teacher/submissions/${data.submissionId}`;
  }

  if (data?.attemptId) {
    if (data?.kind === "ATTEMPT_COMMENT") {
      return "";
    }

    return isCommentNotification
      ? `/learner/attempts/${data.attemptId}/review#discussion`
      : `/learner/attempts/${data.attemptId}/review`;
  }

  if (data?.blogSlug) {
    return `/blogs/${data.blogSlug}`;
  }

  if (data?.testId) {
    return `/learner/tests/${data.testId}`;
  }

  return "";
}

export function NotificationItem({ notification, onChanged }: Props) {
  const router = useRouter();

  const read = isRead(notification);
  const Icon = getIcon(notification.type);
  const href = getNotificationHref(notification);

  const handleClick = async () => {
    if (!read) {
      await markNotificationRead(notification.id);
      onChanged?.(notification.id);
    }

    if (href) {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "group relative w-full overflow-hidden rounded-[28px] border p-5 text-left shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(14,165,233,0.14)]",
        read
          ? "border-cyan-100 bg-white/75"
          : "border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50",
      ].join(" ")}
    >
      {!read ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl"
        />
      ) : null}

      <div className="relative flex gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-sm">
          <Icon className="h-5 w-5" />
          {!read ? (
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 ring-2 ring-white" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                {getTypeLabel(notification.type)}
              </p>

              <h3 className="mt-1 font-serif text-xl font-black text-slate-950">
                {notification.title || "Thông báo mới"}
              </h3>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              {formatDate(notification.createdAt || notification.created_at)}
            </span>
          </div>

          {getMessage(notification) ? (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
              {getMessage(notification)}
            </p>
          ) : null}

          {href ? (
            <p className="mt-3 text-sm font-black text-cyan-700 transition group-hover:translate-x-1">
              Xem chi tiết →
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
