"use client";

type MatchOption = {
  label: string;
  text: string;
};

type QuestionLike = {
  id?: string;
  qNo?: number;
  q_no?: number;
  promptText?: string | null;
  prompt_text?: string | null;
  instructionText?: string | null;
  instruction_text?: string | null;
  optionsJson?: unknown;
  options_json?: unknown;
};

type Props = {
  question?: QuestionLike | null;
  value?: unknown;
  answerJson?: unknown;
  disabled?: boolean;
  onChange?: (answerJson: unknown) => void;
  onAnswerChange?: (answerJson: unknown) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeOption(item: unknown, index: number): MatchOption {
  const fallbackLabel = String.fromCharCode(65 + index);

  if (typeof item === "string" || typeof item === "number") {
    const raw = String(item);
    const match = raw.match(/^([A-Z]|[ivx]+)[\.\)]\s*(.+)$/i);

    if (match) return { label: match[1], text: match[2] };
    return { label: fallbackLabel, text: raw };
  }

  if (isRecord(item)) {
    const label = String(item.label ?? item.value ?? fallbackLabel).trim();
    const text = String(
      item.text ?? item.content ?? item.title ?? item.label ?? item.value ?? "",
    ).trim();

    return {
      label: label || fallbackLabel,
      text: text || label || fallbackLabel,
    };
  }

  return { label: fallbackLabel, text: fallbackLabel };
}

function getOptionsJson(question?: QuestionLike | null) {
  return question?.optionsJson ?? question?.options_json ?? null;
}

function getMatchOptions(optionsJson: unknown): MatchOption[] {
  if (Array.isArray(optionsJson)) return optionsJson.map(normalizeOption);

  if (isRecord(optionsJson)) {
    const items =
      optionsJson.items ??
      optionsJson.options ??
      optionsJson.choices ??
      optionsJson.headings ??
      optionsJson.features ??
      optionsJson.people;

    if (Array.isArray(items)) return items.map(normalizeOption);
  }

  return [];
}

function extractText(value: unknown) {
  if (value === null || value === undefined) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (isRecord(value)) {
    if ("value" in value) return extractText(value.value);
    if ("answer" in value) return extractText(value.answer);
  }

  return "";
}

export function MatchingQuestion({
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
  const options = getMatchOptions(getOptionsJson(question));
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
          {prompt || "Choose the correct match."}
        </span>

        {options.length ? (
          <select
            value={currentValue}
            disabled={disabled}
            onChange={(event) => emitChange(event.target.value)}
            className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">Chọn đáp án</option>
            {options.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}. {option.text}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={currentValue}
            disabled={disabled}
            onChange={(event) => emitChange(event.target.value)}
            placeholder="Nhập chữ cái đáp án"
            className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        )}
      </label>
    </div>
  );
}
