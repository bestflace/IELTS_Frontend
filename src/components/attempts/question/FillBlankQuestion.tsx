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

function renderPromptWithBlank(prompt: string, input: React.ReactNode) {
  if (!prompt) return input;

  const blankPattern = /_{3,}|\.{3,}|…+/;
  const match = prompt.match(blankPattern);

  if (!match || match.index === undefined) {
    return (
      <>
        <span>{prompt}</span>
        <div className="mt-3">{input}</div>
      </>
    );
  }

  const before = prompt.slice(0, match.index);
  const after = prompt.slice(match.index + match[0].length);

  return (
    <span className="leading-8">
      {before}
      <span className="mx-2 inline-block min-w-[220px] align-middle">
        {input}
      </span>
      {after}
    </span>
  );
}

export function FillBlankQuestion({
  question,
  value,
  answerJson,
  disabled = false,
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

  const input = (
    <input
      value={currentValue}
      disabled={disabled}
      onChange={(event) => emitChange(event.target.value)}
      placeholder="Câu trả lời"
      className="h-10 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
    />
  );

  return (
    <div className="space-y-3">
      {instruction ? (
        <p className="text-sm font-semibold leading-6 text-slate-950">
          {instruction}
        </p>
      ) : null}

      <div className="text-base font-semibold leading-8 text-slate-950">
        {qNo ? <span>{qNo}. </span> : null}
        {renderPromptWithBlank(prompt || "Complete the blank.", input)}
      </div>
    </div>
  );
}
