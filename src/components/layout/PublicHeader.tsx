"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  ["/learner/tests", "Đề thi online"],
  ["/reading-sets", "Reading"],
  ["/listening-sets", "Listening"],
  ["/writing-tasks", "Writing"],
  ["/speaking-sets", "Speaking"],
  ["/blogs", "Bài viết"],
] as const;

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="ocean-public-header sticky top-0 z-50 border-b border-[#D5EDF6]/80 bg-white/75 backdrop-blur-2xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="IELTSBF - Trang chủ"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D0EAF5] bg-white/80 shadow-[0_10px_28px_rgba(24,108,166,0.12)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_34px_rgba(24,108,166,0.18)]">
            <Image
              src="/images/ieltsbf-mark.png"
              alt=""
              width={42}
              height={42}
              className="h-9 w-9 object-contain"
              priority
            />
          </span>
          <span>
            <span className="block text-[1.22rem] font-extrabold leading-none tracking-[-0.025em] text-[#07477A]">
              IELTS<span className="text-[#08A8A8]">BF</span>
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] text-[#6F8DA1]">
              Learn · Practice · Improve
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[#D7ECF5] bg-white/70 p-1.5 text-sm shadow-[0_10px_32px_rgba(31,111,164,0.07)] lg:flex">
          {nav.map(([href, label]) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-3.5 py-2 font-semibold text-[#58768C] transition duration-200 hover:bg-[#EDF9FD] hover:text-[#0875B4] xl:px-4",
                  active &&
                    "bg-gradient-to-r from-[#E2F8FA] to-[#E7F1FF] text-[#076BAA] shadow-sm",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="hidden min-h-10 items-center justify-center rounded-xl px-4 text-sm font-bold text-[#116A9E] transition hover:bg-[#ECF8FC] sm:inline-flex"
          >
            Đăng nhập
          </Link>
          <Link
            href="/auth/register"
            className="ocean-primary-button hidden min-h-10 items-center justify-center rounded-xl px-4 text-sm font-bold text-white sm:inline-flex"
          >
            Đăng ký
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#CFE8F3] bg-white/75 text-[#0875B4] shadow-sm transition hover:bg-[#EFFAFF] lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            aria-expanded={mobileOpen}
            aria-controls="public-mobile-menu"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          id="public-mobile-menu"
          className="border-t border-[#D8EDF6] bg-white/95 px-5 pb-5 pt-3 shadow-[0_20px_50px_rgba(26,102,151,0.10)] backdrop-blur-2xl lg:hidden"
        >
          <nav className="mx-auto grid max-w-7xl gap-1">
            {nav.map(([href, label]) => {
              const active =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-xl px-4 py-3 text-sm font-semibold text-[#56758B] transition hover:bg-[#EEF9FD] hover:text-[#0875B4]",
                    active &&
                      "bg-gradient-to-r from-[#E2F8FA] to-[#E8F1FF] text-[#076BAA]",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mx-auto mt-3 grid max-w-7xl grid-cols-2 gap-3 sm:hidden">
            <Link
              href="/auth/login"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#CCE7F2] bg-white text-sm font-bold text-[#0D6C9E]"
            >
              Đăng nhập
            </Link>
            <Link
              href="/auth/register"
              className="ocean-primary-button inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-bold text-white"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
