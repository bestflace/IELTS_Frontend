"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  authOnly?: boolean;
};

const navItems: NavItem[] = [
  {
    href: "/learner/dashboard",
    label: "Trang chủ",
    icon: Home,
    authOnly: true,
  },
  {
    href: "/learner/tests",
    label: "Đề thi",
    icon: FileText,
    authOnly: true,
  },
  {
    href: "/blogs",
    label: "Blog",
    icon: Newspaper,
  },
  {
    href: "/learner/flashcards",
    label: "Flashcard",
    icon: Layers,
    authOnly: true,
  },
  {
    href: "/learner/classes",
    label: "Lớp học",
    icon: GraduationCap,
    authOnly: true,
  },
  {
    href: "/learner/reports",
    label: "Tiến độ",
    icon: BarChart3,
    authOnly: true,
  },
];

function getStoredToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("ieltsbf_access_token") ||
    localStorage.getItem("ieltsbf.token")
  );
}

export function BlogPublicHeader() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getStoredToken()));
  }, []);

  const homeHref = isLoggedIn ? "/learner/dashboard" : "/";
  const visibleNavItems = navItems.map((item) => {
    if (item.label === "Trang chủ") {
      return {
        ...item,
        href: homeHref,
        authOnly: false,
      };
    }

    return item;
  });

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 shadow-[0_12px_40px_rgba(14,165,233,0.08)] backdrop-blur-2xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-3">
        <Link href={homeHref} className="group flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-[0_12px_28px_rgba(14,165,233,0.14)] transition group-hover:-translate-y-0.5">
            <BookOpen className="h-5 w-5 text-sky-700" />
          </span>

          <span>
            <span className="block font-serif text-xl font-black leading-none text-slate-950">
              IELTSBF
            </span>
            <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-cyan-700">
              Cổng học tập
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/70 p-1 text-sm shadow-[0_12px_28px_rgba(14,165,233,0.10)] backdrop-blur-xl lg:flex">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.href === "/blogs" && pathname.startsWith("/blogs")) ||
              (item.href === "/blogs" && pathname.startsWith("/learner/blogs"));

            const href =
              item.authOnly && !isLoggedIn ? "/auth/login" : item.href;

            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 font-semibold text-slate-500 transition duration-300 hover:bg-cyan-50 hover:text-cyan-700",
                  active &&
                    "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_10px_24px_rgba(14,165,233,0.28)] hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full border border-cyan-200 bg-white/80 px-5 py-2 text-sm font-bold text-sky-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-t border-white/60 px-5 py-2 lg:hidden">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.href === "/blogs" && pathname.startsWith("/blogs")) ||
            (item.href === "/blogs" && pathname.startsWith("/learner/blogs"));

          const href = item.authOnly && !isLoggedIn ? "/auth/login" : item.href;

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold text-slate-500 transition",
                active
                  ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                  : "hover:border-cyan-100 hover:bg-cyan-50 hover:text-cyan-700",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
