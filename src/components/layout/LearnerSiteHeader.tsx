"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  Home,
  Layers,
  Newspaper,
} from "lucide-react";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";

const nav = [
  ["/learner/dashboard", "Trang chủ", Home],
  ["/learner/tests", "Đề thi", FileText],
  ["/blogs", "Blog", Newspaper],
  ["/learner/flashcards", "Flashcard", Layers],
  ["/learner/classes", "Lớp học", GraduationCap],
  ["/learner/reports", "Tiến độ", BarChart3],
] as const;

export function LearnerSiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-cyan-100/70 bg-white/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link
          href="/learner/dashboard"
          className="group flex items-center gap-3"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-[0_12px_28px_rgba(14,165,233,0.12)] transition group-hover:-translate-y-0.5">
            <BookOpen className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-serif text-xl font-black leading-none text-slate-950">
              IELTSBF
            </span>
            <span className="block text-[10px] font-black uppercase tracking-[.22em] text-cyan-700">
              Cổng học tập
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/80 bg-white/80 p-1 text-sm shadow-[0_14px_35px_rgba(14,165,233,0.10)] backdrop-blur-xl lg:flex">
          {nav.map(([href, label, Icon]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700",
                  active &&
                    "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_12px_28px_rgba(14,165,233,0.26)] hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <NotificationBell />
          <UserMenu />
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-t border-cyan-100/70 px-5 py-2 lg:hidden">
        {nav.map(([href, label, Icon]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700",
                active &&
                  "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
