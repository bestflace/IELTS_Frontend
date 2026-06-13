"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { NotificationList } from "@/components/notifications/NotificationList";

export default function TeacherNotificationsPage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Cập nhật hệ thống"
        title="Trung tâm thông báo"
        description="Theo dõi bài cần chấm, bình luận mới của học viên và các cập nhật quan trọng từ hệ thống."
      />

      <NotificationList />
    </div>
  );
}
