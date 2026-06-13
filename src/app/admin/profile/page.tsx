"use client";

import { EditProfileForm } from "@/components/profile/EditProfileForm";
import { PageHeader } from "@/components/common/PageHeader";

export default function AdminProfilePage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Profile"
        title="Hồ sơ quản trị viên"
        description="Quản lý thông tin cá nhân và ảnh đại diện của tài khoản đang đăng nhập."
      />

      <EditProfileForm />
    </div>
  );
}
