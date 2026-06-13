"use client";

import { UserTable } from "@/components/users/UserTable";
import { PageHeader } from "@/components/common/PageHeader";

export default function AdminUsersPage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Users"
        title="Quản lý người dùng"
        description="Quản lý tài khoản học viên, giáo viên và quản trị viên trong hệ thống IELTSBF."
      />

      <UserTable />
    </div>
  );
}
