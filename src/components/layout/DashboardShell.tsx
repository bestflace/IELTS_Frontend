"use client";

import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { Topbar } from "./Topbar";

export type NavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  match?: string[];
};

export function DashboardShell({
  children,
  nav,
  title,
}: {
  children: ReactNode;
  nav: ReactNode;
  title: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-cyan-100/70 bg-white/90 shadow-[0_20px_70px_rgba(14,165,233,0.08)] backdrop-blur-2xl lg:block">
        {nav}
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="h-full w-72 border-r border-cyan-100 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,0.20)] backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {nav}
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <Topbar
          title={title}
          left={
            <button
              className="rounded-2xl border border-cyan-100 bg-white/80 p-2 text-cyan-700 shadow-sm lg:hidden"
              onClick={() => setOpen(true)}
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
          }
        />
        <main className="mx-auto max-w-7xl p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
