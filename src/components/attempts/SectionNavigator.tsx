"use client";

import { BookOpen, FileText, Headphones, Mic } from "lucide-react";

export type AttemptSkill = "LISTENING" | "READING" | "WRITING" | "SPEAKING";

export type SectionNavItem = {
  skill: AttemptSkill;
  label: string;
  active?: boolean;
  answeredLabel?: string;
  disabled?: boolean;
};

type Props = {
  items: SectionNavItem[];
  onSelect?: (skill: AttemptSkill) => void;
};

const ICONS = {
  LISTENING: Headphones,
  READING: BookOpen,
  WRITING: FileText,
  SPEAKING: Mic,
};

export function SectionNavigator({ items, onSelect }: Props) {
  if (!items.length) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 overflow-x-auto border-b border-cyan-100 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-xl">
      {items.map((item) => {
        const Icon = ICONS[item.skill];

        return (
          <button
            key={item.skill}
            type="button"
            disabled={item.disabled}
            onClick={() => onSelect?.(item.skill)}
            className={[
              "inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition duration-300",
              item.active
                ? "border-cyan-400 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_12px_28px_rgba(14,165,233,0.24)]"
                : "border-cyan-100 bg-white/80 text-slate-600 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700",
              item.disabled ? "cursor-not-allowed opacity-50" : "",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
            {item.label}

            {item.answeredLabel ? (
              <span
                className={[
                  "rounded-full px-2 py-0.5 text-xs",
                  item.active
                    ? "bg-white/15 text-white"
                    : "bg-cyan-50 text-cyan-700",
                ].join(" ")}
              >
                {item.answeredLabel}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
