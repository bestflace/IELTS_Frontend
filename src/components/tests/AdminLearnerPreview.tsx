"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Loader2,
  Mic,
  PenLine,
  RotateCcw,
} from "lucide-react";

import { QuestionRenderer } from "@/components/attempts/question/QuestionRenderer";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { api, getErrorMessage } from "@/lib/api/client";
import { getAdminTest } from "@/lib/api/tests.api";

type SectionType =
  | "LISTENING_SET"
  | "READING_SET"
  | "WRITING_TASK"
  | "SPEAKING_SET";

type QuestionLike = {
  id?: string;
  qNo?: number | null;
  q_no?: number | null;
  sortOrder?: number | null;
  sort_order?: number | null;
  questionType?: string | null;
  question_type?: string | null;
  promptText?: string | null;
  prompt_text?: string | null;
  instructionText?: string | null;
  instruction_text?: string | null;
  optionsJson?: unknown;
  options_json?: unknown;
  points?: number | null;
};

type SpeakingPromptItemLike = {
  id?: string;
  text?: string | null;
  itemText?: string | null;
  item_text?: string | null;
  sortOrder?: number | null;
  sort_order?: number | null;
};

type SpeakingPromptLike = {
  id?: string;
  promptText?: string | null;
  prompt_text?: string | null;
  cueCardText?: string | null;
  cue_card_text?: string | null;
  content?: string | null;
  sortOrder?: number | null;
  sort_order?: number | null;
  items?: SpeakingPromptItemLike[];
};

type SpeakingPartLike = {
  id?: string;
  partNo?: number | null;
  part_no?: number | null;
  partType?: string | null;
  part_type?: string | null;
  title?: string | null;
  instructions?: string | null;
  description?: string | null;
  sortOrder?: number | null;
  sort_order?: number | null;
  prompts?: SpeakingPromptLike[];
};

type SourceItem = {
  id: string;
  title?: string | null;
  topic?: string | null;
  taskNo?: number | null;
  task_no?: number | null;
  status?: string | null;
  level?: number | null;

  audioUrl?: string | null;
  audio_url?: string | null;
  transcriptText?: string | null;
  transcript_text?: string | null;

  passageHtml?: string | null;
  passage_html?: string | null;
  passageText?: string | null;
  passage_text?: string | null;

  promptText?: string | null;
  prompt_text?: string | null;
  chartUrl?: string | null;
  chart_url?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;

  questions?: QuestionLike[];
  parts?: SpeakingPartLike[];
};

type TestSectionLike = {
  id: string;
  sectionType: SectionType;
  section_type?: SectionType;
  sortOrder?: number | null;
  sort_order?: number | null;
  timeLimitSec?: number | null;
  time_limit_sec?: number | null;
  partLabel?: string | null;
  part_label?: string | null;

  readingSetId?: string | null;
  reading_set_id?: string | null;
  listeningSetId?: string | null;
  listening_set_id?: string | null;
  writingTaskId?: string | null;
  writing_task_id?: string | null;
  speakingSetId?: string | null;
  speaking_set_id?: string | null;

  source?: {
    type?: string;
    item?: SourceItem | null;
  } | null;
};

type TestLike = {
  id: string;
  title: string;
  type?: string | null;
  status?: string | null;
  level?: number | null;
  sections?: TestSectionLike[];
};

type Props = {
  testId: string;
};

const SECTION_META: Record<
  SectionType,
  {
    label: string;
    icon: typeof BookOpen;
    description: string;
  }
> = {
  LISTENING_SET: {
    label: "Listening",
    icon: Headphones,
    description: "Listen to the audio and answer the questions.",
  },
  READING_SET: {
    label: "Reading",
    icon: BookOpen,
    description: "Read the passage and answer the questions.",
  },
  WRITING_TASK: {
    label: "Writing",
    icon: PenLine,
    description: "Write your response to the task.",
  },
  SPEAKING_SET: {
    label: "Speaking",
    icon: Mic,
    description: "Answer the speaking prompts.",
  },
};

function sortSections(sections: TestSectionLike[]) {
  return [...sections].sort(
    (a, b) =>
      (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0),
  );
}

function sortQuestions(questions: QuestionLike[]) {
  return [...questions].sort((a, b) => getQuestionNo(a) - getQuestionNo(b));
}

function formatMinutes(seconds?: number | null) {
  if (!seconds) return "Không giới hạn";
  return `${Math.round(seconds / 60)} phút`;
}

function getSectionType(section: TestSectionLike): SectionType {
  return section.sectionType || section.section_type || "READING_SET";
}

function getSectionLabel(section: TestSectionLike) {
  const type = getSectionType(section);
  return section.partLabel || section.part_label || SECTION_META[type].label;
}

function getTimeLimit(section: TestSectionLike) {
  return section.timeLimitSec ?? section.time_limit_sec ?? null;
}

function getSourceId(section: TestSectionLike) {
  const type = getSectionType(section);

  if (type === "LISTENING_SET") {
    return section.listeningSetId || section.listening_set_id || null;
  }

  if (type === "READING_SET") {
    return section.readingSetId || section.reading_set_id || null;
  }

  if (type === "WRITING_TASK") {
    return section.writingTaskId || section.writing_task_id || null;
  }

  if (type === "SPEAKING_SET") {
    return section.speakingSetId || section.speaking_set_id || null;
  }

  return null;
}

function getSourceCacheKey(section: TestSectionLike) {
  const sourceId = getSourceId(section);
  return sourceId ? `${getSectionType(section)}:${sourceId}` : "";
}

function getDetailUrl(section: TestSectionLike) {
  const sourceId = getSourceId(section);
  const type = getSectionType(section);

  if (!sourceId) return null;

  if (type === "LISTENING_SET") return `/admin/listening-sets/${sourceId}`;
  if (type === "READING_SET") return `/admin/reading-sets/${sourceId}`;
  if (type === "WRITING_TASK") return `/admin/writing-tasks/${sourceId}`;
  if (type === "SPEAKING_SET") return `/admin/speaking-sets/${sourceId}`;

  return null;
}

function getSourceTitle(source: SourceItem | null) {
  if (!source) return "Chưa có nội dung";
  if (source.title) return source.title;
  if (source.topic) return source.topic;
  if (source.taskNo || source.task_no) {
    return `Writing Task ${source.taskNo || source.task_no}`;
  }
  return source.id;
}

function getFullSource(
  section: TestSectionLike,
  sourceDetails: Record<string, SourceItem | null>,
) {
  const key = getSourceCacheKey(section);
  return sourceDetails[key] || section.source?.item || null;
}

function getAudioUrl(source: SourceItem | null) {
  return source?.audioUrl || source?.audio_url || "";
}

function getTranscript(source: SourceItem | null) {
  return source?.transcriptText || source?.transcript_text || "";
}

function getPassageHtml(source: SourceItem | null) {
  return source?.passageHtml || source?.passage_html || "";
}

function getPassageText(source: SourceItem | null) {
  return source?.passageText || source?.passage_text || "";
}

function getWritingPrompt(source: SourceItem | null) {
  return source?.promptText || source?.prompt_text || "";
}

function getChartUrl(source: SourceItem | null) {
  return (
    source?.chartUrl ||
    source?.chart_url ||
    source?.imageUrl ||
    source?.image_url ||
    ""
  );
}

function getQuestionId(question: QuestionLike, index: number) {
  return question.id || `question-${getQuestionNo(question) || index + 1}`;
}

function getQuestionNo(question: QuestionLike) {
  return (
    question.qNo ??
    question.q_no ??
    question.sortOrder ??
    question.sort_order ??
    0
  );
}

function getQuestionPrompt(question: QuestionLike) {
  return question.promptText || question.prompt_text || "";
}

function getQuestionInstruction(question: QuestionLike) {
  return question.instructionText || question.instruction_text || "";
}

function getQuestionType(question: QuestionLike) {
  return question.questionType || question.question_type || "";
}

function getQuestionOptions(question: QuestionLike) {
  return question.optionsJson ?? question.options_json ?? null;
}

function hasAnswer(value: unknown) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return String(value).trim() !== "";
}

function getAnswerKey(section: TestSectionLike, questionId: string) {
  return `${section.id}:${questionId}`;
}

function EmptyPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[26px] border border-dashed border-cyan-200 bg-cyan-50/70 p-6 text-center">
      <FileText className="mx-auto h-9 w-9 text-slate-500" />
      <p className="mt-3 font-serif text-xl font-bold text-slate-950">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-cyan-50/70">
      <div className="rounded-3xl border border-cyan-100 bg-white/80 px-8 py-7 text-center shadow-xl">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-700" />
        <p className="mt-4 font-serif text-2xl font-black text-slate-950">
          Đang tải preview...
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Hệ thống đang lấy dữ liệu section và ngân hàng đề.
        </p>
      </div>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-cyan-50/70 p-6">
      <div className="max-w-xl rounded-3xl border border-danger/20 bg-danger/10 p-6 text-center">
        <p className="font-serif text-2xl font-black text-rose-600">
          Không thể tải preview
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-950">{message}</p>
      </div>
    </div>
  );
}

function LeftContentPanel({
  section,
  source,
}: {
  section: TestSectionLike;
  source: SourceItem | null;
}) {
  const type = getSectionType(section);
  const title = getSourceTitle(source);

  if (type === "READING_SET") {
    const passageHtml = getPassageHtml(source);
    const passageText = getPassageText(source);

    return (
      <div className="h-full overflow-y-auto px-10 py-9">
        <div className="mx-auto max-w-3xl">
          <Badge tone="sage">Academic Reading</Badge>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-slate-950">
            {title}
          </h1>

          {passageHtml ? (
            <article
              className="mt-8 max-w-none text-[17px] leading-9 text-slate-950 [&_h2]:mb-4 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-2xl [&_img]:border [&_img]:border-cyan-100 [&_p]:mb-6"
              dangerouslySetInnerHTML={{ __html: passageHtml }}
            />
          ) : passageText ? (
            <article className="mt-8 whitespace-pre-line text-[17px] leading-9 text-slate-950">
              {passageText}
            </article>
          ) : (
            <div className="mt-8">
              <EmptyPanel
                title="Chưa có nội dung passage"
                description="Reading Set này đã có câu hỏi nhưng chưa có passage_text hoặc passage_html. Nếu đề là ảnh scan, hãy upload ảnh lên Thư viện media rồi chèn thẻ img vào passage_html."
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === "LISTENING_SET") {
    const audioUrl = getAudioUrl(source);
    const transcript = getTranscript(source);

    return (
      <div className="h-full overflow-y-auto px-10 py-9">
        <div className="mx-auto max-w-3xl">
          <Badge tone="sage">IELTS Listening</Badge>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-slate-950">
            {title}
          </h1>

          <div className="mt-8 rounded-3xl border border-cyan-100 bg-white/80 p-5 shadow-sm">
            {audioUrl ? (
              <audio controls className="w-full">
                <source src={audioUrl} />
              </audio>
            ) : (
              <EmptyPanel
                title="Chưa có audio"
                description="Listening Set này chưa có audio_url. Hãy upload audio trong Thư viện media rồi dán URL vào Listening Set."
              />
            )}
          </div>

          {transcript ? (
            <div className="mt-6 rounded-3xl border border-cyan-100 bg-white/80 p-6">
              <h2 className="font-serif text-2xl font-black text-slate-950">
                Transcript
              </h2>
              <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-500">
                {transcript}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (type === "WRITING_TASK") {
    const chartUrl = getChartUrl(source);
    const prompt = getWritingPrompt(source);

    return (
      <div className="h-full overflow-y-auto px-10 py-9">
        <div className="mx-auto max-w-4xl">
          <Badge tone="brown">IELTS Writing</Badge>
          <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-slate-950">
            {title}
          </h1>

          {prompt ? (
            <p className="mt-6 whitespace-pre-line text-lg leading-9 text-slate-950">
              {prompt}
            </p>
          ) : null}

          {chartUrl ? (
            <div className="mt-8 overflow-hidden rounded-3xl border border-cyan-100 bg-white/80 p-4 shadow-sm">
              <img
                src={chartUrl}
                alt={title}
                className="max-h-[620px] w-full object-contain"
              />
            </div>
          ) : (
            <div className="mt-8">
              <EmptyPanel
                title="Chưa có ảnh/chart"
                description="Nếu đây là Writing Task 1, hãy upload ảnh chart/map/diagram lên Thư viện media rồi dán URL vào chart_url."
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  const parts = source?.parts || [];

  return (
    <div className="h-full overflow-y-auto px-10 py-9">
      <div className="mx-auto max-w-3xl">
        <Badge tone="sage">IELTS Speaking</Badge>
        <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-slate-950">
          {title}
        </h1>

        <div className="mt-8 space-y-5">
          {parts.length ? (
            parts
              .slice()
              .sort(
                (a, b) =>
                  (a.partNo ?? a.part_no ?? a.sortOrder ?? a.sort_order ?? 0) -
                  (b.partNo ?? b.part_no ?? b.sortOrder ?? b.sort_order ?? 0),
              )
              .map((part, index) => (
                <div
                  key={part.id || index}
                  className="rounded-3xl border border-cyan-100 bg-white/80 p-6 shadow-sm"
                >
                  <h2 className="font-serif text-2xl font-black text-slate-950">
                    Part {part.partNo || part.part_no || index + 1}:{" "}
                    {part.title || part.partType || part.part_type}
                  </h2>

                  {part.instructions || part.description ? (
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      {part.instructions || part.description}
                    </p>
                  ) : null}

                  <div className="mt-5 space-y-3">
                    {(part.prompts || []).map((prompt, promptIndex) => (
                      <div
                        key={prompt.id || promptIndex}
                        className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl"
                      >
                        <p className="whitespace-pre-line font-semibold leading-7 text-slate-950">
                          {prompt.promptText ||
                            prompt.prompt_text ||
                            prompt.cueCardText ||
                            prompt.cue_card_text ||
                            prompt.content ||
                            "Speaking prompt"}
                        </p>

                        {prompt.items?.length ? (
                          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-500">
                            {prompt.items.map((item, itemIndex) => (
                              <li key={item.id || itemIndex}>
                                {item.text ||
                                  item.itemText ||
                                  item.item_text ||
                                  ""}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))
          ) : (
            <EmptyPanel
              title="Chưa có speaking parts"
              description="Speaking Set này chưa có part hoặc prompt."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function QuestionsPanel({
  section,
  source,
  answers,
  onAnswerChange,
  activeQuestionId,
  setActiveQuestionId,
  questionRefs,
}: {
  section: TestSectionLike;
  source: SourceItem | null;
  answers: Record<string, unknown>;
  onAnswerChange: (questionId: string, value: unknown) => void;
  activeQuestionId?: string;
  setActiveQuestionId: (questionId: string) => void;
  questionRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}) {
  const type = getSectionType(section);

  if (type === "WRITING_TASK") {
    return (
      <div className="h-full overflow-y-auto px-8 py-9">
        <div className="mx-auto max-w-3xl rounded-3xl border border-cyan-100 bg-white/80 p-6 shadow-sm">
          <h2 className="font-serif text-3xl font-black text-slate-950">
            Your answer
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Đây là bản preview cho admin. Nội dung bạn nhập ở đây không được
            lưu.
          </p>

          <textarea
            value={String(answers[`${section.id}:writing-response`] || "")}
            onChange={(event) =>
              onAnswerChange("writing-response", event.target.value)
            }
            placeholder="Write your essay here..."
            className="mt-5 min-h-[420px] w-full resize-none rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl text-base leading-8 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
      </div>
    );
  }

  if (type === "SPEAKING_SET") {
    return (
      <div className="h-full overflow-y-auto px-8 py-9">
        <div className="mx-auto max-w-3xl rounded-3xl border border-cyan-100 bg-white/80 p-6 text-center shadow-sm">
          <Mic className="mx-auto h-10 w-10 text-cyan-700" />
          <h2 className="mt-4 font-serif text-3xl font-black text-slate-950">
            Speaking preview
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Learner thật sẽ ghi âm hoặc nhập câu trả lời ở phần Speaking. Bản
            preview này chỉ hiển thị prompt để admin kiểm tra nội dung.
          </p>
        </div>
      </div>
    );
  }

  const questions = sortQuestions(source?.questions || []);

  return (
    <div className="h-full overflow-y-auto px-8 py-9">
      <div className="mx-auto max-w-3xl space-y-5">
        {questions.length ? (
          questions.map((question, index) => {
            const questionId = getQuestionId(question, index);
            const qNo = getQuestionNo(question) || index + 1;
            const answerKey = getAnswerKey(section, questionId);
            const active = activeQuestionId === questionId;

            return (
              <div
                key={questionId}
                ref={(node) => {
                  questionRefs.current[questionId] = node;
                }}
                className={[
                  "rounded-3xl border bg-white/80 p-5 shadow-sm transition",
                  active
                    ? "border-cyan-300 ring-2 ring-cyan-100/80"
                    : "border-cyan-100",
                ].join(" ")}
                onFocus={() => setActiveQuestionId(questionId)}
                onClick={() => setActiveQuestionId(questionId)}
              >
                <QuestionRenderer
                  question={{
                    id: questionId,
                    qNo,
                    questionType: getQuestionType(question),
                    promptText: getQuestionPrompt(question),
                    instructionText: getQuestionInstruction(question),
                    optionsJson: getQuestionOptions(question),
                  }}
                  value={answers[answerKey]}
                  onChange={(value) => onAnswerChange(questionId, value)}
                />
              </div>
            );
          })
        ) : (
          <EmptyPanel
            title="Chưa có câu hỏi"
            description="API chi tiết của nội dung này chưa trả về questions. Hãy kiểm tra admin detail của Reading/Listening Set."
          />
        )}
      </div>
    </div>
  );
}

export function AdminLearnerPreview({ testId }: Props) {
  const [test, setTest] = useState<TestLike | null>(null);
  const [sourceDetails, setSourceDetails] = useState<
    Record<string, SourceItem | null>
  >({});
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeQuestionId, setActiveQuestionId] = useState("");
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadTest = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = (await getAdminTest(testId)) as TestLike;
      const sortedSections = sortSections(data.sections || []);

      const sourcePairs = await Promise.all(
        sortedSections.map(async (section) => {
          const key = getSourceCacheKey(section);
          const url = getDetailUrl(section);

          if (!key || !url) return null;

          try {
            const detail = await api.get<SourceItem>(url);
            return [key, detail] as const;
          } catch {
            return [key, section.source?.item || null] as const;
          }
        }),
      );

      const nextSourceDetails: Record<string, SourceItem | null> = {};

      for (const pair of sourcePairs) {
        if (!pair) continue;
        nextSourceDetails[pair[0]] = pair[1];
      }

      setTest(data);
      setSourceDetails(nextSourceDetails);
      setActiveSectionIndex(0);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadTest();
  }, [loadTest]);

  const sections = useMemo(
    () => sortSections(test?.sections || []),
    [test?.sections],
  );

  const activeSection = sections[activeSectionIndex] || null;
  const activeSource = activeSection
    ? getFullSource(activeSection, sourceDetails)
    : null;
  const activeSectionType = activeSection
    ? getSectionType(activeSection)
    : "READING_SET";
  const activeMeta = SECTION_META[activeSectionType];
  const ActiveIcon = activeMeta.icon;

  const activeQuestions = useMemo(
    () => sortQuestions(activeSource?.questions || []),
    [activeSource?.questions],
  );

  useEffect(() => {
    questionRefs.current = {};

    const firstQuestion = activeQuestions[0];

    if (firstQuestion) {
      setActiveQuestionId(getQuestionId(firstQuestion, 0));
    } else {
      setActiveQuestionId("");
    }
  }, [activeSectionIndex, activeQuestions]);

  const handleSelectQuestion = (questionId: string) => {
    setActiveQuestionId(questionId);

    requestAnimationFrame(() => {
      questionRefs.current[questionId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const handleAnswerChange = (questionId: string, value: unknown) => {
    if (!activeSection) return;

    const key = getAnswerKey(activeSection, questionId);

    setPreviewAnswers((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const goToPreviousSection = () => {
    setActiveSectionIndex((current) => Math.max(0, current - 1));
  };

  const goToNextSection = () => {
    setActiveSectionIndex((current) =>
      Math.min(sections.length - 1, current + 1),
    );
  };

  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error} />;

  if (!test || !activeSection) {
    return (
      <ErrorPanel message="Đề thi chưa có section. Hãy thêm section trước khi preview." />
    );
  }

  return (
    <div className="fixed inset-0 z-[999] flex flex-col bg-cyan-50/70 text-slate-950">
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-cyan-100 bg-white/80 px-8">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            href={`/admin/tests/${test.id}/sections`}
            className="inline-flex items-center gap-2 border-r border-cyan-100 pr-5 text-sm font-semibold text-slate-950 transition hover:text-cyan-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Thoát
          </Link>

          <div className="min-w-0">
            <h1 className="truncate font-serif text-2xl font-black text-cyan-700">
              {test.title}
            </h1>
            <p className="text-sm font-bold tracking-wide text-slate-500">
              {getSectionLabel(activeSection)} · Admin learner preview
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 px-4 py-2 font-mono text-lg font-bold tabular-nums text-slate-950">
            <Clock3 className="h-5 w-5 text-cyan-700" />
            {formatMinutes(getTimeLimit(activeSection))}
          </div>

          <Button type="button" disabled>
            Nộp bài
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(440px,0.92fr)]">
        <section className="min-h-0 border-r border-cyan-100 bg-cyan-50/70">
          <LeftContentPanel section={activeSection} source={activeSource} />
        </section>

        <section className="min-h-0 bg-white/80">
          <QuestionsPanel
            section={activeSection}
            source={activeSource}
            answers={previewAnswers}
            onAnswerChange={handleAnswerChange}
            activeQuestionId={activeQuestionId}
            setActiveQuestionId={setActiveQuestionId}
            questionRefs={questionRefs}
          />
        </section>
      </div>

      <footer className="flex h-[64px] shrink-0 items-center justify-between border-t border-cyan-100 bg-white/80 px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={goToPreviousSection}
            disabled={activeSectionIndex === 0}
            className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Section trước
          </button>

          <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
            {sections.map((section, index) => {
              const type = getSectionType(section);
              const meta = SECTION_META[type];
              const Icon = meta.icon;
              const active = index === activeSectionIndex;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSectionIndex(index)}
                  className={[
                    "inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition",
                    active
                      ? "border-cyan-300 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      : "border-cyan-100 bg-cyan-50/70 text-slate-950 hover:border-cyan-300",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" />
                  {getSectionLabel(section)}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={goToNextSection}
            disabled={activeSectionIndex >= sections.length - 1}
            className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:border-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Section sau
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {activeQuestions.length ? (
            <>
              <span className="text-sm font-semibold text-slate-500">
                Câu hỏi:
              </span>

              <div className="flex max-w-[520px] gap-2 overflow-x-auto">
                {activeQuestions.map((question, index) => {
                  const questionId = getQuestionId(question, index);
                  const qNo = getQuestionNo(question) || index + 1;
                  const answerKey = getAnswerKey(activeSection, questionId);
                  const answered = hasAnswer(previewAnswers[answerKey]);
                  const active = activeQuestionId === questionId;

                  return (
                    <button
                      key={questionId}
                      type="button"
                      onClick={() => handleSelectQuestion(questionId)}
                      className={[
                        "h-9 w-9 shrink-0 rounded-lg border text-sm font-bold transition",
                        active
                          ? "border-cyan-300 bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                          : answered
                            ? "border-cyan-200 bg-cyan-50 text-cyan-700"
                            : "border-cyan-100 bg-cyan-50/70 text-slate-950 hover:border-cyan-300",
                      ].join(" ")}
                    >
                      {qNo}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setPreviewAnswers({})}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:border-cyan-300"
          >
            <RotateCcw className="h-4 w-4" />
            Reset preview
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700">
            <CheckCircle2 className="h-4 w-4" />
            Không lưu bài làm
          </div>
        </div>
      </footer>
    </div>
  );
}
