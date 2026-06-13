"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileText,
  Flag,
  Headphones,
  Loader2,
  Mic,
  Send,
} from "lucide-react";
import { toast } from "sonner";

import { AttemptHeader } from "@/components/attempts/AttemptHeader";
import { AttemptLayout } from "@/components/attempts/AttemptLayout";
import { QuestionNavigator } from "@/components/attempts/QuestionNavigator";
import {
  SectionNavigator,
  type AttemptSkill,
} from "@/components/attempts/SectionNavigator";
import { SubmitAttemptDialog } from "@/components/attempts/SubmitAttemptDialog";
import { ListeningPracticeView } from "@/components/attempts/listening/ListeningPracticeView";
import { ReadingPracticeView } from "@/components/attempts/reading/ReadingPracticeView";
import { SpeakingPracticeView } from "@/components/attempts/speaking/SpeakingPracticeView";
import { WritingPracticeView } from "@/components/attempts/writing/WritingPracticeView";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import {
  getAttemptSession,
  saveWritingResponses,
  submitAttempt,
  updateOneQuestionAnswer,
} from "@/lib/api/attempts.api";

type SaveState = "idle" | "saving" | "saved" | "error";

type AttemptSessionResponse = {
  attempt: {
    id: string;
    testId: string;
    mode: "READING" | "LISTENING" | "WRITING" | "SPEAKING" | "FULL";
    partLabel?: string | null;
    status:
      | "IN_PROGRESS"
      | "SUBMITTED"
      | "GRADING"
      | "GRADED"
      | "ERROR"
      | "EXPIRED";
    timeLimitSec?: number | null;
    remainingTimeSec?: number | null;
  };
  snapshot: {
    test?: {
      id: string;
      type?: string | null;
      title: string;
      level?: number | null;
      description?: string | null;
    };
    sections?: AttemptSection[];
  };
  savedAnswers?: SavedAnswer[];
  writingResponses?: WritingResponse[];
  speakingResponses?: SpeakingResponse[];
};

type AttemptSection = {
  id: string;
  partLabel?: string | null;
  sortOrder?: number | null;
  sectionType:
    | "READING_SET"
    | "LISTENING_SET"
    | "WRITING_TASK"
    | "SPEAKING_SET";
  timeLimitSec?: number | null;
  readingSet?: ReadingSet | null;
  listeningSet?: ListeningSet | null;
  writingTask?: WritingTask | null;
  speakingSet?: SpeakingSet | null;
};

type ReadingSet = {
  id: string;
  title: string;
  passageHtml?: string | null;
  passageText?: string | null;
  questions?: Question[];
};

type ListeningSet = {
  id: string;
  title: string;
  audioUrl?: string | null;
  transcriptText?: string | null;
  questions?: Question[];
};

type WritingTask = {
  id: string;
  title?: string | null;
  taskNo?: 1 | 2 | number | null;
  promptText?: string | null;
  chartUrl?: string | null;
  imageUrl?: string | null;
};

type SpeakingSet = {
  id: string;
  topic?: string | null;
  title?: string | null;
  parts?: SpeakingPart[];
  prompts?: SpeakingPrompt[];
};

type SpeakingPart = {
  id?: string;
  partNo?: number | null;
  partNumber?: number | null;
  title?: string | null;
  instructionText?: string | null;
  instructions?: string | null;
  prompts?: SpeakingPrompt[];
};

type SpeakingPrompt = {
  id?: string;
  partNo?: number | null;
  partNumber?: number | null;
  promptText?: string | null;
  cueCardText?: string | null;
  questionText?: string | null;
};

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

type SavedAnswer = {
  questionId: string;
  qNo?: number | null;
  answerJson?: unknown;
};

type WritingResponse = {
  writingTaskId: string;
  responseText?: string | null;
};
type SpeakingResponse = {
  speakingPart?: "PART_1" | "PART_2" | "PART_3" | string | null;
  speaking_part?: "PART_1" | "PART_2" | "PART_3" | string | null;
  audioUrl?: string | null;
  audio_url?: string | null;
};
type AttemptPart =
  | {
      id: string;
      skill: "LISTENING";
      label: string;
      shortLabel: string;
      section: AttemptSection;
      listeningSet: ListeningSet;
      partNo: number;
      questions: Question[];
    }
  | {
      id: string;
      skill: "READING";
      label: string;
      shortLabel: string;
      section: AttemptSection;
      readingSet: ReadingSet;
      passageNo: number;
      questions: Question[];
    }
  | {
      id: string;
      skill: "WRITING";
      label: string;
      shortLabel: string;
      section: AttemptSection;
      writingTask: WritingTask;
      questions: Question[];
    }
  | {
      id: string;
      skill: "SPEAKING";
      label: string;
      shortLabel: string;
      section: AttemptSection;
      speakingSet: SpeakingSet;
      speakingPart: SpeakingPart;
      partIndex: number;
      questions: Question[];
    };

const SKILL_ORDER: AttemptSkill[] = [
  "LISTENING",
  "READING",
  "WRITING",
  "SPEAKING",
];

const SKILL_LABEL: Record<AttemptSkill, string> = {
  LISTENING: "Listening",
  READING: "Reading",
  WRITING: "Writing",
  SPEAKING: "Speaking",
};

const SKILL_ICON = {
  LISTENING: Headphones,
  READING: BookOpen,
  WRITING: FileText,
  SPEAKING: Mic,
};

function formatSeconds(total?: number | null) {
  if (total === null || total === undefined || total < 0) return "00:00";

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}

function formatMode(mode?: string) {
  if (mode === "FULL") return "Full Test";
  if (mode === "LISTENING") return "Listening";
  if (mode === "READING") return "Reading";
  if (mode === "WRITING") return "Writing";
  if (mode === "SPEAKING") return "Speaking";
  return "IELTS Test";
}

function normalizeQuestions(questions?: any[]): Question[] {
  return [...(questions || [])]
    .map((question) => ({
      id: String(question.id),
      qNo:
        typeof question.qNo === "number"
          ? question.qNo
          : typeof question.q_no === "number"
            ? question.q_no
            : undefined,
      questionType:
        question.questionType || question.question_type || "SHORT_ANSWER",
      promptText: question.promptText ?? question.prompt_text ?? undefined,
      instructionText:
        question.instructionText ?? question.instruction_text ?? undefined,
      optionsJson: question.optionsJson ?? question.options_json ?? undefined,
      options_json: question.options_json ?? question.optionsJson ?? undefined,
      points: typeof question.points === "number" ? question.points : undefined,
      sortOrder:
        typeof question.sortOrder === "number"
          ? question.sortOrder
          : typeof question.sort_order === "number"
            ? question.sort_order
            : undefined,
    }))
    .sort((a, b) => (a.qNo || a.sortOrder || 0) - (b.qNo || b.sortOrder || 0));
}

function filterQuestionsByRange(
  questions: Question[],
  from: number,
  to: number,
) {
  return questions.filter((question) => {
    const no = question.qNo || question.sortOrder || 0;
    return no >= from && no <= to;
  });
}

function hasAnswer(value: unknown) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return String(value).trim() !== "";
}

function countAnswered(
  answers: Record<string, unknown>,
  questions: Question[],
) {
  return questions.filter((question) => hasAnswer(answers[question.id])).length;
}

function getInitialAnswers(savedAnswers?: SavedAnswer[]) {
  const map: Record<string, unknown> = {};

  savedAnswers?.forEach((answer) => {
    map[answer.questionId] = answer.answerJson ?? "";
  });

  return map;
}

function getWritingTaskNo(task: WritingTask, fallback: number) {
  if (task.taskNo === 1 || task.taskNo === 2) return task.taskNo;

  const raw = `${task.title || ""} ${task.promptText || ""}`.toLowerCase();

  if (raw.includes("task 2")) return 2;
  if (raw.includes("task 1")) return 1;

  return fallback;
}

function buildAttemptParts(sections: AttemptSection[]): AttemptPart[] {
  const sortedSections = [...sections].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
  );

  const parts: AttemptPart[] = [];
  let writingFallbackNo = 1;

  sortedSections.forEach((section) => {
    if (section.sectionType === "LISTENING_SET" && section.listeningSet) {
      const questions = normalizeQuestions(section.listeningSet.questions);

      const ranges = [
        [1, 10],
        [11, 20],
        [21, 30],
        [31, 40],
      ];

      let pushed = false;

      ranges.forEach(([from, to], index) => {
        const partQuestions = filterQuestionsByRange(questions, from, to);
        if (!partQuestions.length) return;

        pushed = true;

        parts.push({
          id: `${section.id}:listening:${index + 1}`,
          skill: "LISTENING",
          label: `Listening Part ${index + 1}`,
          shortLabel: `Part ${index + 1}`,
          section,
          listeningSet: section.listeningSet!,
          partNo: index + 1,
          questions: partQuestions,
        });
      });

      if (!pushed && questions.length) {
        parts.push({
          id: `${section.id}:listening:all`,
          skill: "LISTENING",
          label: "Listening",
          shortLabel: "Listening",
          section,
          listeningSet: section.listeningSet,
          partNo: 1,
          questions,
        });
      }
    }

    if (section.sectionType === "READING_SET" && section.readingSet) {
      const questions = normalizeQuestions(section.readingSet.questions);

      const ranges = [
        [1, 13],
        [14, 26],
        [27, 40],
      ];

      let pushed = false;

      ranges.forEach(([from, to], index) => {
        const partQuestions = filterQuestionsByRange(questions, from, to);
        if (!partQuestions.length) return;

        pushed = true;

        parts.push({
          id: `${section.id}:reading:${index + 1}`,
          skill: "READING",
          label: `Reading Passage ${index + 1}`,
          shortLabel: `Passage ${index + 1}`,
          section,
          readingSet: section.readingSet!,
          passageNo: index + 1,
          questions: partQuestions,
        });
      });

      if (!pushed && questions.length) {
        parts.push({
          id: `${section.id}:reading:all`,
          skill: "READING",
          label: "Reading Passage",
          shortLabel: "Passage",
          section,
          readingSet: section.readingSet,
          passageNo: 1,
          questions,
        });
      }
    }

    if (section.sectionType === "WRITING_TASK" && section.writingTask) {
      const taskNo = getWritingTaskNo(section.writingTask, writingFallbackNo);
      writingFallbackNo += 1;

      parts.push({
        id: `${section.id}:writing:${section.writingTask.id}`,
        skill: "WRITING",
        label: `Writing Task ${taskNo}`,
        shortLabel: `Task ${taskNo}`,
        section,
        writingTask: {
          ...section.writingTask,
          taskNo,
        },
        questions: [],
      });
    }

    if (section.sectionType === "SPEAKING_SET" && section.speakingSet) {
      const speakingSet = section.speakingSet;

      const speakingParts =
        speakingSet.parts && speakingSet.parts.length
          ? speakingSet.parts
          : [
              {
                id: `${speakingSet.id}:part:1`,
                partNo: 1,
                title: speakingSet.topic || speakingSet.title || "Speaking",
                prompts: speakingSet.prompts || [],
              },
            ];

      speakingParts.forEach((speakingPart, index) => {
        const no = speakingPart.partNo || speakingPart.partNumber || index + 1;

        parts.push({
          id: `${section.id}:speaking:${no}`,
          skill: "SPEAKING",
          label: `Speaking Part ${no}`,
          shortLabel: `Part ${no}`,
          section,
          speakingSet,
          speakingPart,
          partIndex: index,
          questions: [],
        });
      });
    }
  });

  return parts;
}

function getSaveStateLabel(state: SaveState) {
  if (state === "saving") return "Đang lưu";
  if (state === "saved") return "Đã lưu";
  if (state === "error") return "Lỗi lưu";
  return "Sẵn sàng";
}

function useDebouncedEffect(
  effect: () => void,
  deps: unknown[],
  delay: number,
) {
  useEffect(() => {
    const timer = window.setTimeout(effect, delay);
    return () => window.clearTimeout(timer);
  }, deps);
}

function EmptyAttemptState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-5">
      <Card className="max-w-lg p-6 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-600" />
        <h1 className="mt-4 font-serif text-3xl font-bold text-slate-950">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

        {onRetry ? (
          <Button className="mt-5" onClick={onRetry}>
            Thử lại
          </Button>
        ) : null}
      </Card>
    </div>
  );
}

export function AttemptSessionPage({ attemptId }: { attemptId: string }) {
  const router = useRouter();

  const [session, setSession] = useState<AttemptSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);

  const [activePartIndex, setActivePartIndex] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [writingDrafts, setWritingDrafts] = useState<Record<string, string>>(
    {},
  );

  const [dirtyQuestionId, setDirtyQuestionId] = useState<string | null>(null);
  const [dirtyWritingTaskId, setDirtyWritingTaskId] = useState<string | null>(
    null,
  );

  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadSession = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const rawData = await getAttemptSession(attemptId);
      const data = rawData as AttemptSessionResponse & {
        speaking_responses?: SpeakingResponse[];
        attempt?: {
          speakingResponses?: SpeakingResponse[];
          speaking_responses?: SpeakingResponse[];
        };
      };

      const normalizedSession: AttemptSessionResponse = {
        ...data,
        speakingResponses:
          data.speakingResponses ||
          data.speaking_responses ||
          data.attempt?.speakingResponses ||
          data.attempt?.speaking_responses ||
          [],
      };

      setSession(normalizedSession);
      setAnswers(getInitialAnswers(normalizedSession.savedAnswers));

      setRemaining(
        data.attempt.remainingTimeSec ?? data.attempt.timeLimitSec ?? null,
      );

      const drafts: Record<string, string> = {};

      data.writingResponses?.forEach((response: WritingResponse) => {
        drafts[response.writingTaskId] = response.responseText || "";
      });

      setWritingDrafts(drafts);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Không thể tải phòng thi.",
      );
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (remaining === null || remaining <= 0) return;
    if (session?.attempt.status !== "IN_PROGRESS") return;

    const timer = window.setInterval(() => {
      setRemaining((current) => {
        if (current === null) return current;
        if (current <= 1) return 0;
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [remaining, session?.attempt.status]);

  const parts = useMemo(
    () => buildAttemptParts(session?.snapshot.sections || []),
    [session?.snapshot.sections],
  );

  const activePart = parts[activePartIndex] || parts[0] || null;

  const allQuestions = useMemo(
    () => parts.flatMap((part) => part.questions),
    [parts],
  );

  const questionById = useMemo(() => {
    const map = new Map<string, Question>();
    allQuestions.forEach((question) => map.set(question.id, question));
    return map;
  }, [allQuestions]);

  const activeQuestions = activePart?.questions || [];
  const readonly =
    !session || session.attempt.status !== "IN_PROGRESS" || remaining === 0;

  const answeredTotal = countAnswered(answers, allQuestions);
  const answeredInPart = countAnswered(answers, activeQuestions);

  const availableSkills = useMemo(() => {
    return SKILL_ORDER.map((skill) => {
      const skillParts = parts.filter((part) => part.skill === skill);
      const skillQuestions = skillParts.flatMap((part) => part.questions);

      return {
        skill,
        label: SKILL_LABEL[skill],
        parts: skillParts,
        answered: countAnswered(answers, skillQuestions),
        total: skillQuestions.length,
      };
    }).filter((item) => item.parts.length > 0);
  }, [parts, answers]);

  const activeSkillParts = useMemo(() => {
    if (!activePart) return [];

    return parts
      .map((part, index) => ({ part, index }))
      .filter((item) => item.part.skill === activePart.skill);
  }, [parts, activePart]);

  useEffect(() => {
    questionRefs.current = {};

    const firstQuestion = activeQuestions[0];

    setActiveQuestionId(firstQuestion?.id || null);
  }, [activePart?.id, activeQuestions]);

  useDebouncedEffect(
    () => {
      if (!dirtyQuestionId || !session || readonly) return;

      const questionId = dirtyQuestionId;
      const question = questionById.get(questionId);

      if (!question) return;

      const qNo = typeof question.qNo === "number" ? question.qNo : undefined;
      const answerJson = answers[questionId];

      async function save() {
        setSaveState("saving");

        try {
          await updateOneQuestionAnswer(attemptId, questionId, {
            qNo,
            answerJson,
            isFinal: false,
          });

          setSaveState("saved");

          setDirtyQuestionId((current) =>
            current === questionId ? null : current,
          );
        } catch {
          setSaveState("error");
        }
      }

      save();
    },
    [dirtyQuestionId, answers, attemptId, readonly, questionById, session],
    650,
  );

  useDebouncedEffect(
    () => {
      if (!dirtyWritingTaskId || !session || readonly) return;

      const writingTaskId = dirtyWritingTaskId;
      const responseText = writingDrafts[writingTaskId] || "";

      async function save() {
        setSaveState("saving");

        try {
          await saveWritingResponses(attemptId, {
            responses: [
              {
                writingTaskId,
                responseText,
              },
            ],
          });

          setSaveState("saved");

          setDirtyWritingTaskId((current) =>
            current === writingTaskId ? null : current,
          );
        } catch {
          setSaveState("error");
        }
      }

      save();
    },
    [dirtyWritingTaskId, writingDrafts, attemptId, readonly, session],
    650,
  );

  function changeAnswer(question: Question, value: unknown) {
    setAnswers((current) => ({
      ...current,
      [question.id]: value,
    }));

    setDirtyQuestionId(question.id);
    setSaveState("saving");
  }

  function changeWriting(taskId: string, value: string) {
    setWritingDrafts((current) => ({
      ...current,
      [taskId]: value,
    }));

    setDirtyWritingTaskId(taskId);
    setSaveState("saving");
  }

  function goToSkill(skill: AttemptSkill) {
    const index = parts.findIndex((part) => part.skill === skill);
    if (index >= 0) setActivePartIndex(index);
  }

  function goToPart(index: number) {
    setActivePartIndex(index);
  }

  function goPrevPart() {
    setActivePartIndex((current) => Math.max(0, current - 1));
  }

  function goNextPart() {
    setActivePartIndex((current) => Math.min(parts.length - 1, current + 1));
  }

  function selectQuestion(questionId: string) {
    setActiveQuestionId(questionId);

    requestAnimationFrame(() => {
      questionRefs.current[questionId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  async function submit() {
    setSubmitting(true);

    try {
      await submitAttempt(attemptId, { force: true });

      toast.success("Đã nộp bài. Hệ thống đang xử lý kết quả.");
      router.replace(`/learner/attempts/${attemptId}/status`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Không thể nộp bài.";

      const lower = message.toLowerCase();

      if (
        lower.includes("submitted") ||
        lower.includes("already") ||
        lower.includes("đã nộp")
      ) {
        toast.info("Bài đã được nộp trước đó.");
        router.replace(`/learner/attempts/${attemptId}/status`);
        return;
      }

      toast.error(message);
    } finally {
      setSubmitting(false);
      setSubmitOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-br from-cyan-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-cyan-700" />
          <p className="mt-3 text-sm text-slate-500">Đang tải phòng thi...</p>
        </div>
      </div>
    );
  }

  if (loadError || !session) {
    return (
      <EmptyAttemptState
        title="Không thể tải phòng thi"
        description={loadError || "Vui lòng thử lại sau."}
        onRetry={loadSession}
      />
    );
  }

  if (!activePart) {
    return (
      <EmptyAttemptState
        title="Đề chưa có nội dung"
        description="Test này chưa có section hoặc nội dung trong ngân hàng đề."
      />
    );
  }

  const testTitle = session.snapshot.test?.title || "IELTS Practice Test";
  const activeSkillIcon = SKILL_ICON[activePart.skill];
  const ActiveSkillIcon = activeSkillIcon;

  const partTabs = (
    <div className="flex h-[62px] shrink-0 items-center justify-between gap-4 border-b border-cyan-100 bg-white/90 px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 md:flex">
          <ActiveSkillIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sage">
            {SKILL_LABEL[activePart.skill]}
          </p>

          <div className="mt-1 flex min-w-0 gap-2 overflow-x-auto">
            {activeSkillParts.map(({ part, index }) => {
              const active = index === activePartIndex;
              const answered = countAnswered(answers, part.questions);
              const total = part.questions.length;

              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => goToPart(index)}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-semibold transition",
                    active
                      ? "border-cyan-300 bg-cyan-600 text-white"
                      : "border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 text-slate-950 hover:border-cyan-300",
                  ].join(" ")}
                >
                  {part.shortLabel}

                  {total > 0 ? (
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs",
                        active
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500",
                      ].join(" ")}
                    >
                      {answered}/{total}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden shrink-0 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-4 py-2 text-xs leading-5 text-slate-500 lg:block">
        <b className="text-slate-950">{activePart.label}</b>
        {activeQuestions.length ? (
          <span>
            {" "}
            · Đã trả lời {answeredInPart}/{activeQuestions.length}
          </span>
        ) : (
          <span> · Không có câu hỏi trắc nghiệm</span>
        )}
      </div>
    </div>
  );

  const footer = (
    <footer className="flex h-[70px] shrink-0 items-center justify-between gap-4 border-t border-cyan-100 bg-white/90 px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          disabled={activePartIndex === 0}
          onClick={goPrevPart}
          className="rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trước
        </button>

        <SectionNavigator
          items={availableSkills.map((item) => ({
            skill: item.skill,
            label: item.label,
            active: item.skill === activePart.skill,
            answeredLabel:
              item.total > 0
                ? `${item.answered}/${item.total}`
                : `${item.parts.length} phần`,
          }))}
          onSelect={goToSkill}
        />

        <button
          type="button"
          disabled={activePartIndex >= parts.length - 1}
          onClick={goNextPart}
          className="rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
        </button>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <QuestionNavigator
          items={activeQuestions.map((question) => ({
            id: question.id,
            number: question.qNo || question.sortOrder || "?",
            active: question.id === activeQuestionId,
            answered: hasAnswer(answers[question.id]),
          }))}
          activeId={activeQuestionId}
          onSelect={selectQuestion}
        />

        <div className="hidden items-center gap-2 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-blue-50 px-3 py-2 text-xs font-semibold text-cyan-700 xl:flex">
          <Flag className="h-4 w-4" />
          Tổng {answeredTotal}/{allQuestions.length}
        </div>
      </div>
    </footer>
  );

  const main =
    activePart.skill === "LISTENING" ? (
      <ListeningPracticeView
        attemptId={attemptId}
        title={activePart.listeningSet.title}
        audioUrl={activePart.listeningSet.audioUrl}
        transcriptText={activePart.listeningSet.transcriptText}
        partNo={activePart.partNo}
        questions={activePart.questions}
        answers={answers}
        readonly={readonly}
        activeQuestionId={activeQuestionId}
        onAnswerChange={changeAnswer}
        onQuestionFocus={setActiveQuestionId}
        questionRefs={questionRefs}
      />
    ) : activePart.skill === "READING" ? (
      <ReadingPracticeView
        attemptId={attemptId}
        title={activePart.readingSet.title}
        passageHtml={activePart.readingSet.passageHtml}
        passageText={activePart.readingSet.passageText}
        passageNo={activePart.passageNo}
        questions={activePart.questions}
        answers={answers}
        readonly={readonly}
        activeQuestionId={activeQuestionId}
        onAnswerChange={changeAnswer}
        onQuestionFocus={setActiveQuestionId}
        questionRefs={questionRefs}
      />
    ) : activePart.skill === "WRITING" ? (
      <WritingPracticeView
        task={activePart.writingTask}
        value={writingDrafts[activePart.writingTask.id] || ""}
        readonly={readonly}
        onChange={changeWriting}
      />
    ) : (
      <SpeakingPracticeView
        attemptId={attemptId}
        title={activePart.speakingSet.title || activePart.speakingSet.topic}
        part={activePart.speakingPart}
        partIndex={activePart.partIndex}
        readonly={readonly}
        speakingResponses={session?.speakingResponses || []}
        onSaved={loadSession}
      />
    );

  return (
    <>
      <AttemptLayout
        header={
          <AttemptHeader
            title={testTitle}
            subtitle={`${formatMode(session.attempt.mode)} · ${activePart.label}`}
            backHref={`/learner/attempts/${attemptId}`}
            remainingSeconds={remaining}
            totalSeconds={session.attempt.timeLimitSec}
            autosaveState={saveState}
            readonly={readonly}
            readonlyLabel={remaining === 0 ? "Hết giờ" : session.attempt.status}
            onSubmit={() => setSubmitOpen(true)}
          />
        }
        partTabs={partTabs}
        main={main}
        footer={footer}
      />

      <SubmitAttemptDialog
        open={submitOpen}
        submitting={submitting}
        answeredTotal={answeredTotal}
        totalQuestions={allQuestions.length}
        remainingLabel={formatSeconds(remaining)}
        saveStateLabel={getSaveStateLabel(saveState)}
        onClose={() => setSubmitOpen(false)}
        onSubmit={submit}
      />
    </>
  );
}
