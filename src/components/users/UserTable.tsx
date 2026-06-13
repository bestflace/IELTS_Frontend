"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Lock,
  RefreshCw,
  ShieldCheck,
  Unlock,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import {
  getUsers,
  updateUser,
  updateUserRole,
  updateUserStatus,
} from "@/lib/api/users.api";
import type { BackendRole, User, UserStatus } from "@/types";
import { displayName } from "@/types";
import { UserFilterBar } from "@/components/users/UserFilterBar";
import { UserRoleBadge } from "@/components/users/UserRoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";
import { ChangeRoleModal } from "@/components/users/ChangeRoleModal";
import { ChangeStatusModal } from "@/components/users/ChangeStatusModal";
import { EditUserModal } from "@/components/users/EditUserModal";
import { UserDetailCard } from "@/components/users/UserDetailCard";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

function getAvatar(user: User) {
  return user.avatarUrl || user.avatar_url || "";
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getRoleDescription(role?: string) {
  if (role === "ADMIN") return "Tài khoản quản trị";
  if (role === "TEACHER") return "Tài khoản giáo viên";
  return "Tài khoản học viên";
}

export function UserTable() {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<"" | BackendRole>("");
  const [status, setStatus] = useState<"" | UserStatus>("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);

  const [detailTarget, setDetailTarget] = useState<User | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [statusTarget, setStatusTarget] = useState<User | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getUsers({
        search: keyword.trim() || undefined,
        role: role || undefined,
        status: status || undefined,
        limit: 100,
      });

      setItems(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [keyword, role, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const counts = useMemo(() => {
    return {
      total: items.length,
      learners: items.filter((item) => item.role === "USER").length,
      teachers: items.filter((item) => item.role === "TEACHER").length,
      admins: items.filter((item) => item.role === "ADMIN").length,
      active: items.filter((item) => item.status === "ACTIVE").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return items.filter((user) => {
      const matchKeyword = normalized
        ? `${displayName(user)} ${user.email}`
            .toLowerCase()
            .includes(normalized)
        : true;

      const matchRole = role ? user.role === role : true;
      const matchStatus = status ? user.status === status : true;

      return matchKeyword && matchRole && matchStatus;
    });
  }, [items, keyword, role, status]);

  useEffect(() => {
    setPage(1);
  }, [keyword, role, status, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  const handleChangeRole = async (nextRole: BackendRole) => {
    if (!roleTarget) return;

    setActionLoading(true);
    setError("");

    try {
      await updateUserRole(roleTarget.id, { role: nextRole });
      setRoleTarget(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (nextStatus: UserStatus) => {
    if (!statusTarget) return;

    setActionLoading(true);
    setError("");

    try {
      await updateUserStatus(statusTarget.id, { status: nextStatus });
      setStatusTarget(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (data: {
    fullName?: string;
    role: BackendRole;
    status: UserStatus;
  }) => {
    if (!editTarget) return;

    setActionLoading(true);
    setError("");

    try {
      await updateUser(editTarget.id, data);
      setEditTarget(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải danh sách người dùng..." />;
  }

  if (error && !items.length) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-5">
      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Tổng người dùng",
            value: counts.total,
          },
          {
            label: "Học viên",
            value: counts.learners,
          },
          {
            label: "Giáo viên",
            value: counts.teachers,
          },
          {
            label: "Đang hoạt động",
            value: counts.active,
          },
        ].map((card) => (
          <Card
            key={card.label}
            className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl"
          >
            <CardContent className="p-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl"
              />

              <p className="relative text-xs font-black uppercase tracking-[.18em] text-slate-400">
                {card.label}
              </p>

              <p className="relative mt-2 font-serif text-4xl font-black text-slate-950">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <CardHeader className="bg-gradient-to-r from-white/80 via-cyan-50/60 to-blue-50/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                User manager
              </p>

              <h2 className="mt-1 font-serif text-3xl font-black text-slate-950">
                Danh sách người dùng
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Tìm kiếm, lọc vai trò, cập nhật trạng thái và phân quyền tài
                khoản.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={loadData}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
            <UserFilterBar
              keyword={keyword}
              role={role}
              status={status}
              onKeywordChange={setKeyword}
              onRoleChange={setRole}
              onStatusChange={setStatus}
            />

            <select
              value={pageSize}
              onChange={(event) =>
                setPageSize(Number(event.target.value) as typeof pageSize)
              }
              className="h-11 rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / trang
                </option>
              ))}
            </select>
          </div>

          {filteredItems.length ? (
            <>
              <div className="overflow-x-auto rounded-[28px] border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl">
                <table className="w-full min-w-[1050px] border-collapse text-sm">
                  <thead className="bg-cyan-50/80 text-left">
                    <tr className="border-b border-cyan-100">
                      <th className="px-4 py-4 text-xs font-black uppercase tracking-[.14em] text-slate-500">
                        Người dùng
                      </th>

                      <th className="px-4 py-4 text-xs font-black uppercase tracking-[.14em] text-slate-500">
                        Email
                      </th>

                      <th className="px-4 py-4 text-xs font-black uppercase tracking-[.14em] text-slate-500">
                        Vai trò
                      </th>

                      <th className="px-4 py-4 text-xs font-black uppercase tracking-[.14em] text-slate-500">
                        Trạng thái
                      </th>

                      <th className="px-4 py-4 text-xs font-black uppercase tracking-[.14em] text-slate-500">
                        Ngày tạo
                      </th>

                      <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-[.14em] text-slate-500">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-cyan-100">
                    {paginatedItems.map((user) => {
                      const avatar = getAvatar(user);
                      const name = displayName(user);

                      return (
                        <tr
                          key={user.id}
                          className="transition hover:bg-cyan-50/55"
                        >
                          <td className="px-4 py-4 align-top">
                            <div className="flex items-center gap-3">
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt={name}
                                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-cyan-100"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-sm">
                                  {name.slice(0, 1).toUpperCase()}
                                </div>
                              )}

                              <div>
                                <p className="font-black text-slate-950">
                                  {name}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {getRoleDescription(user.role)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 align-top text-slate-950">
                            {user.email}
                          </td>

                          <td className="px-4 py-4 align-top">
                            <UserRoleBadge role={user.role} />
                          </td>

                          <td className="px-4 py-4 align-top">
                            <UserStatusBadge status={user.status} />
                          </td>

                          <td className="px-4 py-4 align-top text-sm text-slate-500">
                            {formatDate(user.createdAt || user.created_at)}
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDetailTarget(user)}
                              >
                                <Eye className="h-4 w-4" />
                                Chi tiết
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditTarget(user)}
                                disabled={actionLoading}
                              >
                                <Edit3 className="h-4 w-4" />
                                Sửa
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setRoleTarget(user)}
                                disabled={actionLoading}
                              >
                                <ShieldCheck className="h-4 w-4" />
                                Quyền
                              </Button>

                              <Button
                                size="sm"
                                variant={
                                  user.status === "BLOCKED"
                                    ? "outline"
                                    : "danger"
                                }
                                onClick={() => setStatusTarget(user)}
                                disabled={actionLoading}
                              >
                                {user.status === "BLOCKED" ? (
                                  <Unlock className="h-4 w-4" />
                                ) : (
                                  <Lock className="h-4 w-4" />
                                )}
                                {user.status === "BLOCKED" ? "Mở khóa" : "Khóa"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Hiển thị{" "}
                  <strong className="text-slate-950">
                    {(safePage - 1) * pageSize + 1}
                  </strong>
                  –
                  <strong className="text-slate-950">
                    {Math.min(filteredItems.length, safePage * pageSize)}
                  </strong>{" "}
                  trong{" "}
                  <strong className="text-slate-950">
                    {filteredItems.length}
                  </strong>{" "}
                  người dùng
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>

                  <span className="rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700">
                    {safePage}/{totalPages}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="Không tìm thấy người dùng"
              description="Thử đổi từ khóa, vai trò hoặc trạng thái lọc."
            />
          )}
        </CardContent>
      </Card>

      <ChangeRoleModal
        open={Boolean(roleTarget)}
        user={roleTarget}
        loading={actionLoading}
        onClose={() => setRoleTarget(null)}
        onConfirm={handleChangeRole}
      />

      <ChangeStatusModal
        open={Boolean(statusTarget)}
        user={statusTarget}
        loading={actionLoading}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleChangeStatus}
      />

      <EditUserModal
        open={Boolean(editTarget)}
        user={editTarget}
        loading={actionLoading}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditUser}
      />

      {detailTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[30px] border border-white/70 bg-white/95 p-5 shadow-[0_30px_90px_rgba(14,165,233,0.18)] backdrop-blur-2xl">
            <div className="mb-4 flex justify-end">
              <Button variant="outline" onClick={() => setDetailTarget(null)}>
                Đóng
              </Button>
            </div>

            <UserDetailCard user={detailTarget} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
