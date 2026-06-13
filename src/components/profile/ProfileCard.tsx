"use client";

import { Mail, ShieldCheck, UserRound } from "lucide-react";

import { Card, CardContent } from "@/components/common/Card";
import type { User } from "@/types";
import { displayName } from "@/types";

function getAvatar(user?: User | null) {
  return user?.avatarUrl || user?.avatar_url || "";
}

function roleText(role?: string) {
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "TEACHER") return "Giáo viên";
  return "Học viên";
}

export function ProfileCard({ user }: { user: User }) {
  const name = displayName(user);
  const avatar = getAvatar(user);

  return (
    <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <CardContent className="relative p-6">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div className="relative flex flex-col items-center text-center">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-[0_18px_45px_rgba(14,165,233,0.18)]"
            />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-cyan-500 to-blue-600 text-4xl font-black text-white shadow-[0_18px_45px_rgba(14,165,233,0.22)]">
              {name.slice(0, 1).toUpperCase()}
            </div>
          )}

          <h2 className="mt-5 font-serif text-2xl font-black text-slate-950">
            {name}
          </h2>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Mail className="h-4 w-4" />
            {user.email}
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/70 px-4 py-2 text-sm font-bold text-cyan-700">
            <ShieldCheck className="h-4 w-4" />
            {roleText(user.role)}
          </div>

          <div className="mt-6 grid w-full gap-3">
            <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl text-left">
              <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                Loại tài khoản
              </p>
              <p className="mt-2 text-sm font-bold text-slate-950">
                {roleText(user.role)}
              </p>
            </div>

            <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl text-left">
              <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                Trạng thái
              </p>
              <p className="mt-2 text-sm font-bold text-slate-950">
                {user.status === "BLOCKED"
                  ? "Đã khóa"
                  : user.status === "PENDING"
                    ? "Chờ xác thực"
                    : "Đang hoạt động"}
              </p>
            </div>
          </div>

          <UserRound className="mt-6 h-8 w-8 text-cyan-500/30" />
        </div>
      </CardContent>
    </Card>
  );
}
