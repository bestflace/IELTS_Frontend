"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { SystemConfigForm } from "@/components/system-config/SystemConfigForm";

export default function AdminSystemConfigPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / System Config"
        title="Cài đặt tham số"
        description="Thiết lập thời gian làm bài, giới hạn tùy chỉnh và bật/tắt các tính năng chính của hệ thống."
      />

      <SystemConfigForm />
    </div>
  );
}
