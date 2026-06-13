"use client";

import { Flag } from "lucide-react";

export type QuestionNavItem = {
  id: string;
  number: number | string;
  answered?: boolean;
  active?: boolean;
  flagged?: boolean;
  disabled?: boolean;
};

type Props = {
  items: QuestionNavItem[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
};

export function QuestionNavigator({ items, activeId, onSelect }: Props) {
  if (!items.length) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-cyan-100 bg-white/70 p-2 shadow-sm backdrop-blur-xl">
      <span className="hidden px-2 text-sm font-black text-slate-500 md:inline">
        Câu hỏi
      </span>

      {items.map((item) => {
        const active = item.active || item.id === activeId;

        return (
          <button
            key={item.id}
            type="button"
            disabled={item.disabled}
            onClick={() => onSelect?.(item.id)}
            className={[
              "relative h-9 w-9 shrink-0 rounded-xl border text-sm font-black transition duration-200",
              active
                ? "border-cyan-500 bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_10px_24px_rgba(14,165,233,0.26)]"
                : "",
              !active && item.answered
                ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                : "",
              !active && !item.answered
                ? "border-slate-200 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                : "",
              item.disabled
                ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                : "",
            ].join(" ")}
          >
            {item.number}

            {item.flagged ? (
              <Flag className="absolute -right-1 -top-1 h-3 w-3 fill-amber-500 text-amber-500" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
