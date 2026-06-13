"use client";

import { Lock, Unlock } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import type { User, UserStatus } from "@/types";
import { displayName } from "@/types";

type Props = {
  open: boolean;
  user: User | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (status: UserStatus) => void;
};

export function ChangeStatusModal({
  open,
  user,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  const isBlocked = user?.status === "BLOCKED";
  const nextStatus: UserStatus = isBlocked ? "ACTIVE" : "BLOCKED";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isBlocked ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
    >
      <div className="space-y-4">
        <p className="text-sm leading-6 text-slate-500">
          {isBlocked
            ? "Người dùng sẽ có thể đăng nhập và sử dụng hệ thống trở lại."
            : "Người dùng sẽ không thể đăng nhập hoặc tiếp tục sử dụng tài khoản này."}
        </p>

        {user ? (
          <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
            <p className="font-semibold text-slate-950">{displayName(user)}</p>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>

          <Button
            variant={isBlocked ? "primary" : "danger"}
            onClick={() => onConfirm(nextStatus)}
            disabled={loading}
          >
            {isBlocked ? (
              <Unlock className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {loading
              ? "Đang xử lý..."
              : isBlocked
                ? "Mở khóa"
                : "Khóa tài khoản"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
