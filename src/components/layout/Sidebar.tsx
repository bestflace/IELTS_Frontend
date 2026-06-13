"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, LogOut, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { displayName } from "@/types";
import type { NavItem } from "./DashboardShell";

type SidebarProps = {
  items: NavItem[];
  brand: string;
  homeHref?: string;
  footerName?: string;
  footerRole?: string;
  profileHref?: string;
};

function getRoleLabel(role?: string, fallback?: string) {
  if (role === "TEACHER") return "Giáo viên";
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "USER" || role === "LEARNER") return "Học viên";
  return fallback || "Tài khoản";
}

function getProfileHref(role?: string, fallback?: string) {
  if (fallback) return fallback;
  if (role === "TEACHER") return "/teacher/profile";
  if (role === "ADMIN") return "/admin/profile";
  return "/learner/profile";
}

function getAvatarUrl(user: any) {
  return (
    user?.avatarUrl ||
    user?.avatar_url ||
    user?.imageUrl ||
    user?.image_url ||
    user?.photoUrl ||
    user?.photo_url ||
    ""
  );
}

function Avatar({
  src,
  initial,
  size = "md",
}: {
  src?: string | null;
  initial: string;
  size?: "md" | "lg";
}) {
  const className =
    size === "lg" ? "h-14 w-14 rounded-[1.35rem]" : "h-11 w-11 rounded-2xl";

  if (src) {
    return (
      <span
        className={cn(
          "relative shrink-0 overflow-hidden border-2 border-white bg-cyan-50 shadow-[0_14px_34px_rgba(14,165,233,0.18)] ring-1 ring-cyan-100/80",
          className,
        )}
      >
        <img
          src={src}
          alt="Avatar"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center border-2 border-white bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 font-black text-white shadow-[0_14px_34px_rgba(14,165,233,0.22)] ring-1 ring-cyan-100/80",
        className,
        size === "lg" ? "text-xl" : "text-sm",
      )}
    >
      {initial}
    </span>
  );
}

export function Sidebar({
  items,
  brand,
  homeHref = "/",
  footerName,
  footerRole = "Không gian làm việc",
  profileHref,
}: SidebarProps) {
  const path = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const name = displayName(user);
  const initial = name?.charAt(0)?.toUpperCase() || "U";
  const avatarUrl = getAvatarUrl(user);
  const roleLabel = getRoleLabel(user?.role, brand);
  const settingsHref = getProfileHref(user?.role, profileHref);
  const bottomTitle = footerName || name;
  const bottomDescription = footerRole || "Không gian làm việc";

  const isActive = (item: NavItem) =>
    path === item.href ||
    path.startsWith(`${item.href}/`) ||
    Boolean(
      item.match?.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
      ),
    );

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-white/90 via-cyan-50/70 to-blue-50/80 text-slate-700">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-cyan-300/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-1/2 h-56 w-56 rounded-full bg-blue-300/15 blur-3xl"
      />

      <div className="relative border-b border-white/70 px-5 py-5">
        <Link
          href={settingsHref}
          className="group flex items-center gap-3 rounded-[1.65rem] p-1.5 transition duration-300 hover:-translate-y-0.5 hover:bg-white/60 hover:shadow-[0_16px_40px_rgba(14,165,233,0.10)]"
          title="Mở cài đặt tài khoản"
        >
          <Avatar src={avatarUrl} initial={initial} size="lg" />

          <span className="min-w-0">
            <span className="block truncate text-xl font-black leading-none tracking-tight text-slate-900">
              {name}
            </span>

            <span className="mt-1 inline-flex max-w-full items-center gap-1 rounded-full border border-cyan-100 bg-cyan-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[.18em] text-cyan-700">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span className="truncate">{roleLabel}</span>
            </span>
          </span>
        </Link>
      </div>

      <nav className="relative flex-1 space-y-1.5 overflow-y-auto p-3">
        {items.map((item, index) => {
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ animationDelay: `${index * 38}ms` }}
              className={cn(
                "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold transition duration-300",
                "hover:-translate-y-0.5 hover:bg-white/80 hover:text-sky-700 hover:shadow-[0_14px_32px_rgba(14,165,233,0.10)]",
                active
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_18px_38px_rgba(37,99,235,0.25)]"
                  : "text-slate-500",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition",
                  active
                    ? "bg-white/18 text-white"
                    : "bg-white/70 text-sky-600 group-hover:bg-cyan-50",
                )}
              >
                {item.icon || (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>

              <span className="truncate">{item.label}</span>

              {active ? (
                <span className="absolute right-3 h-2 w-2 rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.9)]" />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-white/70 p-4">
        <Link
          href={settingsHref}
          className="group mb-3 flex items-center gap-3 overflow-hidden rounded-[1.65rem] border border-white/75 bg-white/75 p-4 shadow-[0_16px_44px_rgba(14,165,233,0.12)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-white/90 hover:shadow-[0_22px_55px_rgba(14,165,233,0.16)]"
          title="Mở cài đặt hồ sơ"
        >
          <Avatar src={avatarUrl} initial={initial} />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-950">
              {bottomTitle}
            </p>

            <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
              {bottomDescription}
            </p>
          </div>

          <ChevronRight className="h-4 w-4 shrink-0 text-cyan-600 transition group-hover:translate-x-0.5" />
        </Link>

        <button
          type="button"
          onClick={async () => {
            await logout();
            router.push("/auth/login");
          }}
          className="flex w-full items-center gap-2 rounded-2xl border border-white/70 bg-white/75 px-3 py-2.5 text-sm font-bold text-slate-500 shadow-[0_10px_28px_rgba(14,165,233,0.08)] transition hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
