"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import type { BackendRole, User } from "@/types";
import { displayName } from "@/types";

type Props = {
  open: boolean;
  user: User | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (role: BackendRole) => void;
};

export function ChangeRoleModal({
  open,
  user,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  const [role, setRole] = useState<BackendRole>("USER");

  useEffect(() => {
    if (user?.role) setRole(user.role);
  }, [user]);

  return (
    <Modal open={open} onClose={onClose} title="Cập nhật vai trò">
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-500">
          Bạn đang thay đổi vai trò của{" "}
          <span className="font-semibold text-slate-950">
            {user ? displayName(user) : "người dùng"}
          </span>
          .
        </p>

        <label className="space-y-2 block">
          <span className="text-sm font-semibold text-slate-950">
            Vai trò mới
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

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={() => onConfirm(role)} disabled={loading}>
            <ShieldCheck className="h-4 w-4" />
            {loading ? "Đang lưu..." : "Cập nhật"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
