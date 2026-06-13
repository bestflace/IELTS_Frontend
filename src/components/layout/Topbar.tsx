"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export function Topbar({ title, left }: { title: string; left?: ReactNode }) {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 border-b border-cyan-100/70 bg-white/80 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between px-5">
        <div className="flex items-center gap-3">
          {left}
          <h1 className="font-serif text-xl font-black text-slate-950">
            {title}
          </h1>
        </div>
        <button
          onClick={async () => {
            await logout();
            router.push("/auth/login");
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-100 bg-white/80 px-3 py-2 text-sm font-bold text-slate-500 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
          type="button"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </header>
  );
}
