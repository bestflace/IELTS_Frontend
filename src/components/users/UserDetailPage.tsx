"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit3,
  Lock,
  RefreshCw,
  ShieldCheck,
  Unlock,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { UserDetailCard } from "@/components/users/UserDetailCard";
import { EditUserModal } from "@/components/users/EditUserModal";
import { ChangeRoleModal } from "@/components/users/ChangeRoleModal";
import { ChangeStatusModal } from "@/components/users/ChangeStatusModal";
import {
  getUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from "@/lib/api/users.api";
import { getErrorMessage } from "@/lib/api/client";
import type { BackendRole, User, UserStatus } from "@/types";
import { displayName } from "@/types";

type Props = {
  userId: string;
};

export function UserDetailPage({ userId }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getUser(userId);
      setUser(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditUser = async (data: {
    fullName?: string;
    role: BackendRole;
    status: UserStatus;
  }) => {
    if (!user) return;

    setActionLoading(true);
    setError("");

    try {
      const updated = await updateUser(user.id, data);
      setUser(updated);
      setEditOpen(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (role: BackendRole) => {
    if (!user) return;

    setActionLoading(true);
    setError("");

    try {
      const updated = await updateUserRole(user.id, { role });
      setUser(updated);
      setRoleOpen(false);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (status: UserStatus) => {
    if (!user) return;

    setActionLoading(true);
    setError("");

    try {
      const updated = await updateUserStatus(user.id, { status });
      setUser(updated);
      setStatusOpen(false);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải thông tin người dùng..." />;
  }

  if (error && !user) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!user) {
    return (
      <EmptyState
        title="Không tìm thấy người dùng"
        description="Người dùng có thể đã bị xóa hoặc ID không hợp lệ."
        action={
          <Link href="/admin/users">
            <Button variant="outline">Quay lại danh sách</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin / Users"
        title="Chi tiết người dùng"
        description={displayName(user)}
        actions={
          <>
            <Link href="/admin/users">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={loadData}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>

            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              disabled={actionLoading}
            >
              <Edit3 className="h-4 w-4" />
              Sửa
            </Button>

            <Button
              variant="outline"
              onClick={() => setRoleOpen(true)}
              disabled={actionLoading}
            >
              <ShieldCheck className="h-4 w-4" />
              Đổi quyền
            </Button>

            <Button
              variant={user.status === "BLOCKED" ? "outline" : "danger"}
              onClick={() => setStatusOpen(true)}
              disabled={actionLoading}
            >
              {user.status === "BLOCKED" ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {user.status === "BLOCKED" ? "Mở khóa" : "Khóa"}
            </Button>
          </>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <UserDetailCard user={user} />

      <EditUserModal
        open={editOpen}
        user={user}
        loading={actionLoading}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEditUser}
      />

      <ChangeRoleModal
        open={roleOpen}
        user={user}
        loading={actionLoading}
        onClose={() => setRoleOpen(false)}
        onConfirm={handleChangeRole}
      />

      <ChangeStatusModal
        open={statusOpen}
        user={user}
        loading={actionLoading}
        onClose={() => setStatusOpen(false)}
        onConfirm={handleChangeStatus}
      />
    </div>
  );
}
