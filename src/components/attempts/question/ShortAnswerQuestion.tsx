"use client";

type QuestionLike = {
  id?: string;
  qNo?: number;
  q_no?: number;
  promptText?: string | null;
  prompt_text?: string | null;
  instructionText?: string | null;
  instruction_text?: string | null;
};

type Props = {
  question?: QuestionLike | null;
  value?: unknown;
  answerJson?: unknown;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (answerJson: unknown) => void;
  onAnswerChange?: (answerJson: unknown) => void;
};

function extractText(value: unknown) {
  if (value === null || value === undefined) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as { value?: unknown; answer?: unknown };
    if ("value" in obj) return extractText(obj.value);
    if ("answer" in obj) return extractText(obj.answer);
  }

  return "";
}

export function ShortAnswerQuestion({
  question,
  value,
  answerJson,
  disabled = false,
  placeholder = "Nhập câu trả lời",
  onChange,
  onAnswerChange,
}: Props) {
  const qNo = question?.qNo ?? question?.q_no;
  const prompt = question?.promptText ?? question?.prompt_text ?? "";
  const instruction =
    question?.instructionText ?? question?.instruction_text ?? "";
  const currentValue = extractText(value ?? answerJson);

  const emitChange = (nextAnswer: string) => {
    onChange?.(nextAnswer);
    onAnswerChange?.(nextAnswer);
  };

  return (
    <div className="space-y-3">
      {instruction ? (
        <p className="text-sm font-semibold leading-6 text-slate-950">
          {instruction}
        </p>
      ) : null}

      <label className="block space-y-2">
        <span className="block text-base font-semibold leading-7 text-slate-950">
          {qNo ? `${qNo}. ` : ""}
          {prompt || "Answer the question."}
        </span>

        <input
          value={currentValue}
          disabled={disabled}
          onChange={(event) => emitChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>
    </div>
  );
}
