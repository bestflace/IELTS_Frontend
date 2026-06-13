"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";

export default function TeacherChangePasswordPage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Teacher / Security"
        title="Đổi mật khẩu"
        description="Cập nhật mật khẩu đăng nhập để bảo vệ tài khoản giáo viên."
      />

      <ChangePasswordForm
        backHref="/teacher/profile"
        backLabel="Quay lại hồ sơ"
        accountLabel="tài khoản giáo viên"
      />
    </div>
  );
}
