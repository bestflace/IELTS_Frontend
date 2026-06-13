"use client";

type ChoiceOption = {
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

function normalizeOption(item: unknown, index: number): ChoiceOption {
  const fallbackLabel = String.fromCharCode(65 + index);

  if (typeof item === "string" || typeof item === "number") {
    const raw = String(item);
    const match = raw.match(/^([A-Z])[\.\)]\s*(.+)$/);

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

function getOptionItems(optionsJson: unknown): ChoiceOption[] {
  if (Array.isArray(optionsJson)) return optionsJson.map(normalizeOption);

  if (isRecord(optionsJson)) {
    const items =
      optionsJson.items ?? optionsJson.options ?? optionsJson.choices;
    if (Array.isArray(items)) return items.map(normalizeOption);
  }

  return [];
}

function getMaxSelections(optionsJson: unknown): number | null {
  if (!isRecord(optionsJson)) return null;

  const raw = Number(
    optionsJson.maxSelections ?? optionsJson.maxSelected ?? optionsJson.limit,
  );

  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

function isMultipleChoice(optionsJson: unknown): boolean {
  if (!isRecord(optionsJson)) return false;

  return (
    optionsJson.multiple === true ||
    optionsJson.multi === true ||
    optionsJson.type === "MULTIPLE_SELECT" ||
    Number(optionsJson.maxSelections ?? 0) > 1
  );
}

function extractSelectedValues(value: unknown): string[] {
  if (value === null || value === undefined || value === "") return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (isRecord(value)) {
    if ("values" in value) return extractSelectedValues(value.values);
    if ("answers" in value) return extractSelectedValues(value.answers);
    if ("selectedOptions" in value) {
      return extractSelectedValues(value.selectedOptions);
    }
    if ("selected" in value) return extractSelectedValues(value.selected);
    if ("value" in value) return extractSelectedValues(value.value);
    if ("answer" in value) return extractSelectedValues(value.answer);
  }

  return [String(value).trim()].filter(Boolean);
}

export function MultipleChoiceQuestion({
  question,
  value,
  answerJson,
  disabled = false,
  onChange,
  onAnswerChange,
}: Props) {
  const optionsJson = getOptionsJson(question);
  const options = getOptionItems(optionsJson);
  const multiple = isMultipleChoice(optionsJson);
  const maxSelections = getMaxSelections(optionsJson);
  const selectedValues = extractSelectedValues(value ?? answerJson);
  const qNo = question?.qNo ?? question?.q_no;
  const prompt = question?.promptText ?? question?.prompt_text ?? "";
  const instruction =
    question?.instructionText ?? question?.instruction_text ?? "";

  const emitChange = (nextAnswer: unknown) => {
    onChange?.(nextAnswer);
    onAnswerChange?.(nextAnswer);
  };

  const handleSelect = (label: string) => {
    if (disabled) return;

    if (!multiple) {
      emitChange(label);
      return;
    }

    const hasSelected = selectedValues.includes(label);

    const nextValues = hasSelected
      ? selectedValues.filter((item) => item !== label)
      : [...selectedValues, label];

    if (!hasSelected && maxSelections && nextValues.length > maxSelections) {
      return;
    }

    emitChange(nextValues);
  };

  return (
    <div className="space-y-4">
      {instruction ? (
        <p className="text-sm font-semibold leading-6 text-slate-950">
          {instruction}
        </p>
      ) : null}

      {prompt ? (
        <p className="text-base font-semibold leading-7 text-slate-950">
          {qNo ? `${qNo}. ` : ""}
          {prompt}
        </p>
      ) : null}

      {multiple ? (
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-medium text-cyan-700">
          Chọn {maxSelections ? `tối đa ${maxSelections}` : "một hoặc nhiều"}{" "}
          đáp án
          {maxSelections
            ? ` · Đã chọn ${selectedValues.length}/${maxSelections}`
            : ""}
        </div>
      ) : null}

      <div className="space-y-2">
        {options.length > 0 ? (
          options.map((option) => {
            const checked = selectedValues.includes(option.label);

            return (
              <label
                key={option.label}
                className={[
                  "flex cursor-pointer items-start gap-3 rounded-2xl border px-3 py-2 text-sm leading-6 transition",
                  checked
                    ? "border-cyan-400 bg-cyan-50 text-slate-950"
                    : "border-cyan-100 bg-white/90 text-slate-950 hover:border-cyan-300",
                  disabled ? "cursor-not-allowed opacity-60" : "",
                ].join(" ")}
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  name={question?.id || "multiple-choice-question"}
                  value={option.label}
                  checked={checked}
                  disabled={disabled}
                  onChange={() => handleSelect(option.label)}
                  className="mt-1 h-4 w-4"
                />

                <span>
                  <span className="font-semibold">{option.label}.</span>{" "}
                  {option.text}
                </span>
              </label>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-cyan-200 bg-white/75 p-3 text-sm text-slate-500">
            Câu hỏi chưa có optionsJson hợp lệ.
          </p>
        )}
      </div>
    </div>
  );
}
