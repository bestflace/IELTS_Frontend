"use client";

import { ChangePasswordForm } from "@/components/profile/ChangePasswordForm";
import { PageHeader } from "@/components/common/PageHeader";

export default function AdminChangePasswordPage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Security"
        title="Đổi mật khẩu"
        description="Cập nhật mật khẩu đăng nhập cho tài khoản quản trị viên."
      />

      <ChangePasswordForm
        backHref="/admin/profile"
        backLabel="Quay lại hồ sơ"
        accountLabel="tài khoản quản trị viên"
      />
    </div>
  );
}
