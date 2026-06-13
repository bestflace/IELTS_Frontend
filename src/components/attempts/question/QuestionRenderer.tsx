"use client";

import { FillBlankQuestion } from "./FillBlankQuestion";
import { MatchingQuestion } from "./MatchingQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { ShortAnswerQuestion } from "./ShortAnswerQuestion";
import { TrueFalseNotGivenQuestion } from "./TrueFalseNotGivenQuestion";

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

function getQuestionType(question?: QuestionLike | null) {
  return question?.questionType ?? question?.question_type ?? "";
}

function isCompletionType(type: string) {
  return [
    "SENTENCE_COMPLETION",
    "SUMMARY_COMPLETION",
    "NOTE_COMPLETION",
    "TABLE_COMPLETION",
    "FLOWCHART_COMPLETION",
    "DIAGRAM_LABEL_COMPLETION",
    "FORM_COMPLETION",
  ].includes(type);
}

function isMatchingType(type: string) {
  return [
    "MATCHING_HEADINGS",
    "MATCHING_INFORMATION",
    "MATCHING_FEATURES",
    "MATCHING_SENTENCE_ENDINGS",
    "MAP_LABELING",
  ].includes(type);
}

export function QuestionRenderer({
  question,
  value,
  answerJson,
  disabled = false,
  onChange,
  onAnswerChange,
}: Props) {
  const emitChange = (nextAnswer: unknown) => {
    onChange?.(nextAnswer);
    onAnswerChange?.(nextAnswer);
  };

  if (!question) {
    return (
      <p className="rounded-2xl border border-dashed border-cyan-200 bg-white/75 p-3 text-sm text-slate-500">
        Không tìm thấy dữ liệu câu hỏi.
      </p>
    );
  }

  const type = getQuestionType(question);

  if (type === "MULTIPLE_CHOICE") {
    return (
      <MultipleChoiceQuestion
        question={question}
        value={value}
        answerJson={answerJson}
        disabled={disabled}
        onChange={emitChange}
      />
    );
  }

  if (type === "TRUE_FALSE_NOT_GIVEN" || type === "YES_NO_NOT_GIVEN") {
    return (
      <TrueFalseNotGivenQuestion
        question={question}
        value={value}
        answerJson={answerJson}
        disabled={disabled}
        onChange={emitChange}
      />
    );
  }

  if (isMatchingType(type)) {
    return (
      <MatchingQuestion
        question={question}
        value={value}
        answerJson={answerJson}
        disabled={disabled}
        onChange={emitChange}
      />
    );
  }

  if (isCompletionType(type)) {
    return (
      <FillBlankQuestion
        question={question}
        value={value}
        answerJson={answerJson}
        disabled={disabled}
        onChange={emitChange}
      />
    );
  }

  return (
    <ShortAnswerQuestion
      question={question}
      value={value}
      answerJson={answerJson}
      disabled={disabled}
      onChange={emitChange}
    />
  );
}
