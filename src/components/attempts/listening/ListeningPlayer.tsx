"use client";

import { Headphones } from "lucide-react";

type Props = {
  audioUrl?: string | null;
  title?: string | null;
};

export function ListeningPlayer({ audioUrl, title }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_65px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-sm">
          <Headphones className="h-5 w-5" />
        </div>

        <div>
          <p className="font-serif text-xl font-bold text-slate-950">
            {title || "Listening Audio"}
          </p>
          <p className="text-sm text-slate-500">
            Nghe audio và trả lời câu hỏi bên phải.
          </p>
        </div>
      </div>

      {audioUrl ? (
        <audio controls src={audioUrl} className="w-full" />
      ) : (
        <div className="rounded-2xl border border-dashed border-cyan-100 bg-white/75 p-5 text-sm leading-6 text-slate-500">
          Chưa có audio URL.
        </div>
      )}
    </div>
  );
}
