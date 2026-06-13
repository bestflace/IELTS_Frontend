"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Headphones, Mic, PenLine } from "lucide-react";

const tabs = [
  {
    label: "Reading",
    href: "/admin/reading-sets",
    match: "/admin/reading-sets",
    icon: BookOpen,
  },
  {
    label: "Listening",
    href: "/admin/listening-sets",
    match: "/admin/listening-sets",
    icon: Headphones,
  },
  {
    label: "Writing",
    href: "/admin/writing-tasks",
    match: "/admin/writing-tasks",
    icon: PenLine,
  },
  {
    label: "Speaking",
    href: "/admin/speaking-sets",
    match: "/admin/speaking-sets",
    icon: Mic,
  },
];

export function ContentBankTabs() {
  const pathname = usePathname();

  return (
    <div className="mb-6 rounded-[24px] border border-cyan-100 bg-white/80 p-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.match);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={
                active
                  ? "inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white"
                  : "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-50"
              }
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
