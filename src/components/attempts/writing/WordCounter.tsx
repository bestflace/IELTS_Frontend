type Props = {
  text: string;
  minWords?: number;
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function WordCounter({ text, minWords }: Props) {
  const count = countWords(text);
  const hasTarget = typeof minWords === "number" && minWords > 0;
  const reached = hasTarget ? count >= minWords : true;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span
        className={[
          "rounded-full border px-3 py-1 font-semibold",
          reached
            ? "border-cyan-100 bg-cyan-50 text-cyan-700"
            : "border-cyan-100 bg-white/75 text-slate-500",
        ].join(" ")}
      >
        {count} từ
      </span>

      {hasTarget ? (
        <span className="text-slate-500">
          Mục tiêu IELTS: tối thiểu khoảng {minWords} từ
        </span>
      ) : null}
    </div>
  );
}
