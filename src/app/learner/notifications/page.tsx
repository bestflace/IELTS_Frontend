"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { NotificationList } from "@/components/notifications/NotificationList";

export default function LearnerNotificationsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Learner / Notifications"
        title="Thông báo"
        description="Xem các bài đã được chấm, phản hồi mới và cập nhật dành cho học viên."
      />

      <NotificationList />
    </div>
  );
}
