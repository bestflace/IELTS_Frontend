"use client";

type QuestionLike = {
  id?: string;
  qNo?: number;
  q_no?: number;
  questionType?: string;
  question_type?: string;
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

function getCurrentValue(value: unknown) {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    const obj = value as { value?: unknown; answer?: unknown };
    return String(obj.value ?? obj.answer ?? "");
  }

  return String(value);
}

function getChoices(type?: string) {
  if (type === "YES_NO_NOT_GIVEN") return ["YES", "NO", "NOT GIVEN"];
  return ["TRUE", "FALSE", "NOT GIVEN"];
}

export function TrueFalseNotGivenQuestion({
  question,
  value,
  answerJson,
  disabled = false,
  onChange,
  onAnswerChange,
}: Props) {
  const qNo = question?.qNo ?? question?.q_no;
  const type = question?.questionType ?? question?.question_type;
  const prompt = question?.promptText ?? question?.prompt_text ?? "";
  const instruction =
    question?.instructionText ?? question?.instruction_text ?? "";
  const currentValue = getCurrentValue(value ?? answerJson);
  const choices = getChoices(type);

  const emitChange = (nextAnswer: string) => {
    onChange?.(nextAnswer);
    onAnswerChange?.(nextAnswer);
  };

  return (
    <div className="space-y-4">
      {instruction ? (
        <p className="text-sm font-semibold leading-6 text-slate-950">
          {instruction}
        </p>
      ) : null}

      <p className="text-base font-semibold leading-7 text-slate-950">
        {qNo ? `${qNo}. ` : ""}
        {prompt || "Choose the correct answer."}
      </p>

      <div className="grid gap-2 sm:grid-cols-3">
        {choices.map((choice) => {
          const active = currentValue === choice;

          return (
            <button
              key={choice}
              type="button"
              disabled={disabled}
              onClick={() => emitChange(choice)}
              className={[
                "rounded-2xl border px-3 py-2 text-sm font-semibold transition",
                active
                  ? "border-cyan-400 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                  : "border-cyan-100 bg-white/90 text-slate-950 hover:border-cyan-300",
                disabled ? "cursor-not-allowed opacity-60" : "",
              ].join(" ")}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}
