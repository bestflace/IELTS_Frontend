"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Modal } from "@/components/common/Modal";
import type { BackendRole, User, UserStatus } from "@/types";
import { displayName } from "@/types";

type Props = {
  open: boolean;
  user: User | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fullName?: string;
    role: BackendRole;
    status: UserStatus;
  }) => void;
};

export function EditUserModal({
  open,
  user,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<BackendRole>("USER");
  const [status, setStatus] = useState<UserStatus>("ACTIVE");

  useEffect(() => {
    if (!user) return;

    setFullName(displayName(user) === user.email ? "" : displayName(user));
    setRole(user.role || "USER");
    setStatus(user.status || "ACTIVE");
  }, [user]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    onSubmit({
      fullName: fullName.trim() || undefined,
      role,
      status,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Chỉnh sửa người dùng">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-950">Họ tên</span>
          <Input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Nhập họ tên người dùng"
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-950">Email</span>
          <Input value={user?.email || ""} readOnly className="opacity-70" />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-slate-950">
              Vai trò
            </span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as BackendRole)}
              className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="USER">Học viên</option>
              <option value="TEACHER">Giáo viên</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-semibold text-slate-950">
              Trạng thái
            </span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as UserStatus)}
              className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="BLOCKED">Đã khóa</option>
              <option value="PENDING">Chờ xác thực</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
