"use client";

import { FormEvent, useMemo, useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { ErrorState } from "@/components/common/States";
import type { Question } from "@/types";
import type { ListeningQuestionInput } from "@/lib/api/listening.api";

type Props = {
  initialData?: Question | null;
  nextSortOrder?: number;
  onSubmit: (payload: ListeningQuestionInput) => Promise<void>;
  onCancel: () => void;
};

const QUESTION_TYPES = [
  { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
  { label: "Short Answer", value: "SHORT_ANSWER" },
  { label: "True / False / Not Given", value: "TRUE_FALSE_NOT_GIVEN" },
  { label: "Matching", value: "MATCHING" },
  { label: "Fill Blank", value: "FILL_BLANK" },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringifyJson(value: unknown, fallback = "") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return fallback;
  }
}

function parseJsonField(value: string, fieldName: string) {
  if (!value.trim()) return null;

  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${fieldName} phải là JSON hợp lệ.`);
  }
}

function splitAnswerText(value: string) {
  return value
    .split(/[,|;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractAnswerValues(value: unknown): string[] {
  if (value === null || value === undefined || value === "") return [];

  if (Array.isArray(value)) {
    return value
      .flatMap(extractAnswerValues)
      .map(String)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (isRecord(value)) {
    if ("values" in value) return extractAnswerValues(value.values);
    if ("answers" in value) return extractAnswerValues(value.answers);
    if ("value" in value) return extractAnswerValues(value.value);
    if ("answer" in value) return extractAnswerValues(value.answer);
    return [];
  }

  return [String(value).trim()].filter(Boolean);
}

function inferMultipleChoice(optionsJson: unknown, correctAnswerJson: unknown) {
  if (isRecord(optionsJson)) {
    if (optionsJson.multiple === true || optionsJson.multi === true)
      return true;
    if (Number(optionsJson.maxSelections ?? 0) > 1) return true;
  }

  return extractAnswerValues(correctAnswerJson).length > 1;
}

function parseCorrectAnswerField(
  value: string,
  questionType: string,
  allowMultipleAnswers: boolean,
) {
  const trimmed = value.trim();

  if (!trimmed) return null;

  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    if (questionType === "MULTIPLE_CHOICE") {
      const values = splitAnswerText(trimmed);
      return allowMultipleAnswers ? values : (values[0] ?? trimmed);
    }

    return trimmed;
  }

  if (questionType === "MULTIPLE_CHOICE") {
    const values = extractAnswerValues(parsed);

    if (allowMultipleAnswers) {
      if (values.length < 2) {
        throw new Error(
          'Câu nhiều đáp án cần ít nhất 2 đáp án đúng, ví dụ: A,C hoặc ["A","C"].',
        );
      }

      return values;
    }

    if (values.length > 1) {
      throw new Error(
        "Bạn đang nhập nhiều đáp án. Hãy bật mục 'Cho phép chọn nhiều đáp án'.",
      );
    }
  }

  return parsed;
}

function normalizeMultipleChoiceOptions(
  optionsJson: unknown,
  allowMultipleAnswers: boolean,
  correctAnswerJson: unknown,
) {
  if (!allowMultipleAnswers) {
    return optionsJson;
  }

  const answerCount = extractAnswerValues(correctAnswerJson).length;
  const maxSelections = Math.max(answerCount, 2);

  if (Array.isArray(optionsJson)) {
    return {
      multiple: true,
      minSelections: answerCount,
      maxSelections,
      items: optionsJson,
    };
  }

  if (isRecord(optionsJson)) {
    return {
      ...optionsJson,
      multiple: true,
      minSelections:
        Number(optionsJson.minSelections ?? 0) > 0
          ? Number(optionsJson.minSelections)
          : answerCount,
      maxSelections:
        Number(optionsJson.maxSelections ?? 0) > 0
          ? Number(optionsJson.maxSelections)
          : maxSelections,
    };
  }

  return {
    multiple: true,
    minSelections: answerCount,
    maxSelections,
    items: [],
  };
}

const SECTION_LABELS = ["Part 1", "Part 2", "Part 3", "Part 4"];

export function ListeningQuestionForm({
  initialData,
  nextSortOrder = 1,
  onSubmit,
  onCancel,
}: Props) {
  const isEdit = Boolean(initialData?.id);

  const [sectionLabel, setSectionLabel] = useState(
    String((initialData as any)?.sectionLabel || "Part 1"),
  );
  const [qNo, setQNo] = useState(String(initialData?.qNo || nextSortOrder));
  const [questionType, setQuestionType] = useState(
    String(initialData?.questionType || "SHORT_ANSWER"),
  );
  const [instructionText, setInstructionText] = useState(
    initialData?.instructionText || "",
  );
  const [promptText, setPromptText] = useState(initialData?.promptText || "");
  const [optionsJson, setOptionsJson] = useState(
    stringifyJson(initialData?.optionsJson),
  );
  const [correctAnswerJson, setCorrectAnswerJson] = useState(
    stringifyJson(initialData?.correctAnswerJson, ""),
  );
  const [allowMultipleAnswers, setAllowMultipleAnswers] = useState(
    inferMultipleChoice(
      initialData?.optionsJson,
      initialData?.correctAnswerJson,
    ),
  );
  const [explanation, setExplanation] = useState(
    initialData?.explanation || "",
  );
  const [points, setPoints] = useState(String(initialData?.points || 1));
  const [sortOrder, setSortOrder] = useState(
    String(initialData?.sortOrder || nextSortOrder),
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const helperText = useMemo(() => {
    if (questionType === "MULTIPLE_CHOICE") {
      return allowMultipleAnswers
        ? 'Câu nhiều đáp án: Correct Answer có thể nhập A,C hoặc ["A","C"]. Khi lưu, optionsJson sẽ tự thêm multiple: true để màn hình làm bài render checkbox.'
        : 'Câu một đáp án: Correct Answer có thể nhập A hoặc "A" hoặc ["A"]. Options JSON ví dụ: [{"label":"A","text":"Option A"}].';
    }

    if (questionType === "TRUE_FALSE_NOT_GIVEN") {
      return 'Correct answer ví dụ: "TRUE", "FALSE" hoặc "NOT_GIVEN". Có thể nhập TRUE dạng text thường, frontend sẽ tự lưu.';
    }

    if (questionType === "FILL_BLANK") {
      return "Correct answer nên nhập dạng text hoặc JSON. Lưu ý: array hiện được backend hiểu là nhiều giá trị bắt buộc, không phải nhiều đáp án thay thế.";
    }

    return 'Correct answer có thể nhập text thường hoặc JSON hợp lệ, ví dụ: answer hoặc ["answer"].';
  }, [allowMultipleAnswers, questionType]);

  const validate = () => {
    const numericQNo = Number(qNo);
    const numericSortOrder = Number(sortOrder);
    const numericPoints = Number(points);

    if (!sectionLabel.trim()) return "Vui lòng chọn part/section của câu hỏi.";
    if (!numericQNo || numericQNo < 1) return "Số câu hỏi phải lớn hơn 0.";
    if (!questionType) return "Vui lòng chọn loại câu hỏi.";
    if (!promptText.trim()) return "Vui lòng nhập nội dung câu hỏi.";
    if (questionType === "MULTIPLE_CHOICE" && !optionsJson.trim()) {
      return "Vui lòng nhập options cho câu Multiple Choice.";
    }
    if (!correctAnswerJson.trim()) return "Vui lòng nhập đáp án đúng.";
    if (!numericPoints || numericPoints < 0)
      return "Điểm câu hỏi phải lớn hơn 0.";
    if (!numericSortOrder || numericSortOrder < 1)
      return "Thứ tự câu hỏi phải lớn hơn 0.";

    return "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError("");

    try {
      const parsedAnswer = parseCorrectAnswerField(
        correctAnswerJson,
        questionType,
        questionType === "MULTIPLE_CHOICE" && allowMultipleAnswers,
      );
      const parsedOptions = parseJsonField(optionsJson, "Options JSON");
      const normalizedOptions =
        questionType === "MULTIPLE_CHOICE"
          ? normalizeMultipleChoiceOptions(
              parsedOptions,
              allowMultipleAnswers,
              parsedAnswer,
            )
          : parsedOptions;

      const payload: ListeningQuestionInput = {
        sectionLabel: sectionLabel.trim(),
        qNo: Number(qNo),
        questionType,
        promptText: promptText.trim(),
        instructionText: instructionText.trim() || null,
        optionsJson: normalizedOptions,
        correctAnswerJson: parsedAnswer,
        explanation: explanation.trim() || null,
        points: Number(points),
        sortOrder: Number(sortOrder),
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu câu hỏi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <ErrorState message={error} /> : null}

      <div className="grid gap-3 md:grid-cols-5">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-black text-slate-950">Part</span>
          <select
            value={sectionLabel}
            onChange={(event) => setSectionLabel(event.target.value)}
            className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            {SECTION_LABELS.map((part) => (
              <option key={part} value={part}>
                {part}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-black text-slate-950">Số câu</span>
          <Input
            type="number"
            min={1}
            value={qNo}
            onChange={(event) => setQNo(event.target.value)}
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-black text-slate-950">
            Loại câu hỏi
          </span>
          <select
            value={questionType}
            onChange={(event) => setQuestionType(event.target.value)}
            className="h-11 w-full rounded-xl border border-cyan-100 bg-white/80 px-3 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-black text-slate-950">Thứ tự</span>
          <Input
            type="number"
            min={1}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
          />
        </label>
      </div>

      <label className="space-y-2 block">
        <span className="text-sm font-black text-slate-950">Hướng dẫn</span>
        <Input
          value={instructionText}
          onChange={(event) => setInstructionText(event.target.value)}
          placeholder="Ví dụ: Write ONE WORD ONLY for each answer."
        />
      </label>

      {questionType === "MULTIPLE_CHOICE" ? (
        <label className="flex items-start gap-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3 text-sm text-slate-950">
          <input
            type="checkbox"
            checked={allowMultipleAnswers}
            onChange={(event) => setAllowMultipleAnswers(event.target.checked)}
            className="mt-1 h-4 w-4"
          />
          <span>
            <span className="font-semibold">Cho phép chọn nhiều đáp án</span>
            <br />
            <span className="text-slate-500">
              Dùng cho IELTS dạng Choose TWO/THREE letters. Không cần thêm
              question type mới hay sửa database.
            </span>
          </span>
        </label>
      ) : null}

      <label className="space-y-2 block">
        <span className="text-sm font-black text-slate-950">
          Nội dung câu hỏi
        </span>
        <Textarea
          value={promptText}
          onChange={(event) => setPromptText(event.target.value)}
          className="min-h-24"
          placeholder="Nhập nội dung câu hỏi hoặc vị trí câu hỏi trong audio..."
        />
      </label>

      <div className="grid gap-3 lg:grid-cols-2">
        <label className="space-y-2 block">
          <span className="text-sm font-black text-slate-950">
            Options JSON
          </span>
          <Textarea
            value={optionsJson}
            onChange={(event) => setOptionsJson(event.target.value)}
            className="min-h-32 font-mono text-xs"
            placeholder='[{"label":"A","text":"Option A"},{"label":"B","text":"Option B"}]'
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-sm font-black text-slate-950">
            Correct Answer
          </span>
          <Textarea
            value={correctAnswerJson}
            onChange={(event) => setCorrectAnswerJson(event.target.value)}
            className="min-h-32 font-mono text-xs"
            placeholder={
              questionType === "MULTIPLE_CHOICE" && allowMultipleAnswers
                ? 'A,C hoặc ["A","C"]'
                : 'A hoặc "answer" hoặc ["answer"]'
            }
          />
        </label>
      </div>

      <p className="rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-3 text-xs leading-5 text-slate-500">
        {helperText}
      </p>

      <div className="grid gap-3 md:grid-cols-[160px_1fr]">
        <label className="space-y-2">
          <span className="text-sm font-black text-slate-950">Điểm</span>
          <Input
            type="number"
            min={0}
            step="0.5"
            value={points}
            onChange={(event) => setPoints(event.target.value)}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-black text-slate-950">
            Giải thích đáp án
          </span>
          <Input
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            placeholder="Giải thích ngắn nếu cần..."
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-cyan-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>

        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : isEdit ? "Lưu câu hỏi" : "Thêm câu hỏi"}
        </Button>
      </div>
    </form>
  );
}
