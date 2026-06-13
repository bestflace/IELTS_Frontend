import type { ComponentType } from "react";

type ReportTab = {
  key: string;
  label: string;
  active?: boolean;
  icon?: ComponentType<{ className?: string }>;
};

export function ReportTabs({
  items = [],
  children,
}: {
  items?: ReportTab[];
  children?: React.ReactNode;
}) {
  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-white/70 bg-white/80 p-3 shadow-[0_16px_45px_rgba(14,165,233,0.08)] backdrop-blur-xl">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 rounded-[28px] border border-white/70 bg-white/80 p-2 shadow-[0_16px_45px_rgba(14,165,233,0.08)] backdrop-blur-xl">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.key}
            type="button"
            className={
              item.active
                ? "inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-black text-white shadow-[0_12px_26px_rgba(14,165,233,0.24)]"
                : "inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
            }
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
