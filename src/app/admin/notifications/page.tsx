"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { NotificationList } from "@/components/notifications/NotificationList";

export default function AdminNotificationsPage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Notifications"
        title="Thông báo hệ thống"
        description="Theo dõi các cập nhật quan trọng, bình luận và hoạt động trong hệ thống."
      />

      <NotificationList />
    </div>
  );
}
