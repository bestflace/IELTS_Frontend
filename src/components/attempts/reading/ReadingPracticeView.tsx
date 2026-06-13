"use client";

import { useRef } from "react";

import { AnnotationToolbar } from "@/components/attempts/AnnotationToolbar";
import { QuestionRenderer } from "@/components/attempts/question/QuestionRenderer";
import { ReadingPassage } from "@/components/attempts/reading/ReadingPassage";

type Question = {
  id: string;
  qNo?: number;
  questionType: string;
  promptText?: string;
  instructionText?: string;
  optionsJson?: unknown;
  options_json?: unknown;
  points?: number;
  sortOrder?: number;
};

type Props = {
  attemptId?: string;
  title?: string | null;
  passageHtml?: string | null;
  passageText?: string | null;
  passageNo: number;
  questions: Question[];
  answers: Record<string, unknown>;
  readonly?: boolean;
  activeQuestionId?: string | null;
  onAnswerChange: (question: Question, value: unknown) => void;
  onQuestionFocus: (questionId: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
};

function getQuestionRangeLabel(questions: Question[]) {
  const first = questions[0]?.qNo;
  const last = questions[questions.length - 1]?.qNo;

  if (!first || !last) return "";
  if (first === last) return `${first}`;

  return `${first}–${last}`;
}

export function ReadingPracticeView({
  attemptId,
  title,
  passageHtml,
  passageText,
  passageNo,
  questions,
  answers,
  readonly = false,
  activeQuestionId,
  onAnswerChange,
  onQuestionFocus,
  questionRefs,
}: Props) {
  const questionPanelRef = useRef<HTMLDivElement | null>(null);
  const questionRangeLabel = getQuestionRangeLabel(questions);

  return (
    <main className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(460px,0.92fr)] bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <section className="min-h-0 border-r border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/70">
        <ReadingPassage
          title={title}
          passageHtml={passageHtml}
          passageText={passageText}
          passageNo={passageNo}
          attemptId={attemptId}
        />
      </section>

      <section className="min-h-0 bg-white/65 backdrop-blur-xl">
        <div className="h-full overflow-y-auto px-8 py-8">
          <div ref={questionPanelRef} className="mx-auto max-w-3xl space-y-5">
            <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                Reading Passage {passageNo}
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold text-slate-950">
                Questions {questionRangeLabel}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Câu trả lời được lưu tự động. Bạn có thể bôi text trong câu hỏi
                để highlight hoặc thêm note.
              </p>
            </div>

            {questions.map((question) => {
              const active = activeQuestionId === question.id;

              return (
                <div
                  key={question.id}
                  ref={(node) => {
                    questionRefs.current[question.id] = node;
                  }}
                  onClick={() => onQuestionFocus(question.id)}
                  className={[
                    "rounded-[30px] border bg-white/82 p-5 shadow-[0_18px_55px_rgba(14,165,233,0.08)] backdrop-blur-2xl transition hover:-translate-y-0.5",
                    active
                      ? "border-cyan-400 ring-4 ring-cyan-100/80"
                      : "border-white/70 hover:border-cyan-200",
                  ].join(" ")}
                >
                  <QuestionRenderer
                    question={question}
                    value={answers[question.id]}
                    disabled={readonly}
                    onChange={(value) => onAnswerChange(question, value)}
                  />
                </div>
              );
            })}

            <AnnotationToolbar
              storageKey={`reading:${attemptId || "preview"}:passage:${
                passageNo || 1
              }:questions`}
              targetRef={questionPanelRef}
              title="Note câu hỏi"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
