"use client";

import { Mail, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/common/Card";
import type { User } from "@/types";
import { displayName } from "@/types";
import { UserRoleBadge } from "@/components/users/UserRoleBadge";
import { UserStatusBadge } from "@/components/users/UserStatusBadge";

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
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function UserDetailCard({ user }: { user: User }) {
  const name = displayName(user);
  const avatar = getAvatar(user);

  return (
    <Card className="rounded-[24px] border border-cyan-100 bg-white/80">
      <CardContent className="p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-24 w-24 rounded-full border border-cyan-100 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50 text-4xl font-bold text-cyan-700">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h2 className="font-serif text-3xl font-black text-slate-950">
              {name}
            </h2>

            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              <Mail className="h-4 w-4" />
              {user.email}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Loại tài khoản
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {user.role === "ADMIN"
                    ? "Quản trị viên hệ thống"
                    : user.role === "TEACHER"
                      ? "Giáo viên chấm bài"
                      : "Học viên luyện thi"}
                </p>
              </div>

              <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                  Ngày tạo tài khoản
                </p>
                <p className="mt-2 text-sm text-slate-950">
                  {formatDate(user.createdAt || user.created_at)}
                </p>
              </div>
            </div>
          </div>

          <UserRound className="hidden h-10 w-10 text-slate-500/40 md:block" />
        </div>
      </CardContent>
    </Card>
  );
}
