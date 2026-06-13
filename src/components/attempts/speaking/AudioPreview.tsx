"use client";

type Props = {
  audioUrl?: string | null;
};

export function AudioPreview({ audioUrl }: Props) {
  if (!audioUrl) return null;

  return (
    <div className="rounded-[26px] border border-cyan-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
      <p className="mb-2 text-sm font-semibold text-slate-950">
        Nghe lại bản ghi
      </p>
      <audio controls src={audioUrl} className="w-full" />
    </div>
  );
}
