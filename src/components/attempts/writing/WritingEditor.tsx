"use client";

import { PenLine } from "lucide-react";
import { WordCounter } from "./WordCounter";

type Props = {
  value: string;
  readonly?: boolean;
  taskNo?: number | null;
  onChange: (value: string) => void;
};

export function WritingEditor({
  value,
  readonly = false,
  taskNo,
  onChange,
}: Props) {
  const minWords = taskNo === 1 ? 150 : taskNo === 2 ? 250 : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border border-white/70 bg-white/82 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-cyan-100/80 bg-white/70 px-5 py-4 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-sm">
            <PenLine className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-serif text-2xl font-bold text-slate-950">
              Bài viết của bạn
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Nội dung sẽ được lưu tự động sau khi bạn nhập.
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/40 p-5">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={readonly}
          className="h-full min-h-0 w-full resize-none overflow-y-auto rounded-[26px] border border-cyan-100 bg-white/90 p-5 text-base leading-8 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Viết bài của bạn tại đây..."
        />
      </div>

      <div className="shrink-0 border-t border-cyan-100/80 bg-white/70 px-5 py-4 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <WordCounter text={value} minWords={minWords} />

          <span className="text-xs text-slate-500">
            Task 1 khoảng 150 từ, Task 2 khoảng 250 từ.
          </span>
        </div>
      </div>
    </div>
  );
}
