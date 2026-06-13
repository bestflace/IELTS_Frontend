"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  History,
  LogOut,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/store/auth.store";
import { displayName } from "@/types";

export function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const name = displayName(user);
  const initial = name?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative z-[9999]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-white/95 px-2 py-1.5 text-sm text-slate-800 shadow-[0_12px_30px_rgba(14,165,233,0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 hover:shadow-[0_18px_38px_rgba(14,165,233,0.20)]"
        aria-label="Mở menu người dùng"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-xs font-black text-white shadow-lg shadow-cyan-500/25 ring-2 ring-white">
          {initial}
        </span>

        <span className="hidden max-w-28 truncate font-bold sm:block">
          {name}
        </span>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition duration-300 ${
            open ? "rotate-180 text-cyan-600" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-[9999] w-[min(calc(100vw-1.5rem),310px)] overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.22)] ring-1 ring-cyan-100/70 backdrop-blur-2xl">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl"
          />

          <div className="relative border-b border-sky-100 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white shadow-lg shadow-cyan-500/25">
                {initial}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-950">
                  {name}
                </p>
                <p className="truncate text-xs font-medium text-slate-500">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <div className="relative space-y-1 bg-white/95 p-2 text-sm">
            <Link
              className="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-slate-600 transition hover:bg-cyan-50 hover:text-sky-700"
              href="/learner/schedule"
              onClick={() => setOpen(false)}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <CalendarDays className="h-4 w-4" />
              </span>
              Lịch học của tôi
            </Link>

            <Link
              className="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-slate-600 transition hover:bg-cyan-50 hover:text-sky-700"
              href="/learner/profile"
              onClick={() => setOpen(false)}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <UserRound className="h-4 w-4" />
              </span>
              Trang cá nhân
            </Link>

            <Link
              className="flex items-center gap-3 rounded-2xl px-3 py-3 font-bold text-slate-600 transition hover:bg-cyan-50 hover:text-sky-700"
              href="/learner/attempts"
              onClick={() => setOpen(false)}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-50 text-sky-600">
                <History className="h-4 w-4" />
              </span>
              Lịch sử làm bài
            </Link>

            <div className="my-2 h-px bg-gradient-to-r from-transparent via-sky-100 to-transparent" />

            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left font-bold text-rose-600 transition hover:bg-rose-50"
              onClick={async () => {
                setOpen(false);
                await logout();
                router.push("/auth/login");
              }}
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-600">
                <LogOut className="h-4 w-4" />
              </span>
              Đăng xuất
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
