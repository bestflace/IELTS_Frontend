"use client";

import { useRef } from "react";

import { AnnotationToolbar } from "@/components/attempts/AnnotationToolbar";
import { ListeningPlayer } from "@/components/attempts/listening/ListeningPlayer";
import { QuestionRenderer } from "@/components/attempts/question/QuestionRenderer";
import { Badge } from "@/components/common/Badge";

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
  audioUrl?: string | null;
  transcriptText?: string | null;
  partNo: number;
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

function normalizeTranscript(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function splitTranscriptParagraphs(value: string) {
  return normalizeTranscript(value)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function ListeningPracticeView({
  attemptId,
  title,
  audioUrl,
  transcriptText,
  partNo,
  questions,
  answers,
  readonly = false,
  activeQuestionId,
  onAnswerChange,
  onQuestionFocus,
  questionRefs,
}: Props) {
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const questionPanelRef = useRef<HTMLDivElement | null>(null);

  const questionRangeLabel = getQuestionRangeLabel(questions);
  const cleanTranscript = normalizeTranscript(transcriptText);
  const transcriptParagraphs = splitTranscriptParagraphs(cleanTranscript);

  return (
    <main className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(460px,0.92fr)] bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <section className="min-h-0 border-r border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/70">
        <div className="h-full overflow-y-auto px-9 py-8">
          <div className="mx-auto max-w-4xl">
            <Badge tone="sage">IELTS Listening</Badge>

            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-slate-950">
              {title || `Listening Part ${partNo}`}
            </h1>

            <p className="mt-4 leading-7 text-slate-500">
              Listening Part {partNo}. Nghe audio và trả lời nhóm câu hỏi bên
              phải. Bạn có thể bôi text trong transcript hoặc câu hỏi để
              highlight và ghi chú.
            </p>

            <div className="mt-8">
              <ListeningPlayer audioUrl={audioUrl} title={title} />
            </div>

            {transcriptParagraphs.length ? (
              <details className="mt-6 rounded-3xl border border-cyan-100 bg-white/90 p-5 shadow-[0_14px_38px_rgba(14,165,233,0.08)]">
                <summary className="cursor-pointer font-semibold text-slate-950">
                  Xem transcript
                </summary>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Bôi trực tiếp đoạn chữ trong transcript để highlight hoặc thêm
                  note.
                </p>

                <div
                  ref={transcriptRef}
                  className="mt-5 select-text text-sm leading-7 text-slate-500"
                >
                  {transcriptParagraphs.map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {attemptId ? (
                  <AnnotationToolbar
                    storageKey={`listening:${attemptId}:part:${partNo}:transcript`}
                    targetRef={transcriptRef}
                    title="Note transcript"
                  />
                ) : null}
              </details>
            ) : null}
          </div>
        </div>
      </section>

      <section className="min-h-0 bg-white/65 backdrop-blur-xl">
        <div className="h-full overflow-y-auto px-8 py-8">
          <div ref={questionPanelRef} className="mx-auto max-w-3xl space-y-5">
            <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">
                Listening Part {partNo}
              </p>

              <h2 className="mt-2 font-serif text-3xl font-bold text-slate-950">
                Questions {questionRangeLabel}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Câu trả lời được lưu tự động sau khi bạn chọn hoặc nhập. Bạn có
                thể bôi text trong câu hỏi để highlight hoặc thêm note.
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
              storageKey={`listening:${attemptId || "preview"}:part:${partNo}:questions`}
              targetRef={questionPanelRef}
              title="Note câu hỏi"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
