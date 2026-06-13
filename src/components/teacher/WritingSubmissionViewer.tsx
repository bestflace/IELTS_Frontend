"use client";

import { FileText, Image as ImageIcon, UserRound, PenLine } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/common/Card";

type Props = {
  submission: any;
};

type WritingTaskView = {
  id?: string;
  title?: string;
  taskNo?: number;
  promptText?: string;
  chartUrl?: string;
  imageUrl?: string;
};

type WritingResponseView = {
  id?: string;
  writingTaskId?: string;
  responseText?: string;
  wordCount?: number;
  savedAt?: string;
  updatedAt?: string;
};

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStudentName(submission: any) {
  return (
    submission?.learner?.fullName ||
    submission?.learner?.full_name ||
    submission?.learner?.email ||
    submission?.student?.fullName ||
    submission?.student?.full_name ||
    submission?.student?.email ||
    submission?.studentName ||
    "Học viên"
  );
}

function getTestTitle(submission: any) {
  return (
    submission?.test?.title ||
    submission?.testTitle ||
    submission?.title ||
    "Bài làm IELTS"
  );
}

function getWritingResponses(submission: any): WritingResponseView[] {
  const responses =
    submission?.writingResponses ||
    submission?.attempt?.writingResponses ||
    submission?.attempt_writing_responses ||
    [];

  if (!Array.isArray(responses)) return [];

  return responses.map((item: any) => ({
    id: item.id,
    writingTaskId:
      item.writingTaskId || item.writing_task_id || item.taskId || item.task_id,
    responseText:
      item.responseText ||
      item.response_text ||
      item.answerText ||
      item.answer_text ||
      "",
    wordCount:
      typeof item.wordCount === "number"
        ? item.wordCount
        : typeof item.word_count === "number"
          ? item.word_count
          : undefined,
    savedAt: item.savedAt || item.saved_at,
    updatedAt: item.updatedAt || item.updated_at,
  }));
}

function normalizeWritingTask(item: any): WritingTaskView | null {
  if (!isObject(item)) return null;

  const promptText =
    item.promptText ||
    item.prompt_text ||
    item.question ||
    item.content ||
    item.description;

  const hasWritingShape =
    promptText ||
    item.chartUrl ||
    item.chart_url ||
    item.imageUrl ||
    item.image_url ||
    item.taskNo ||
    item.task_no;

  if (!hasWritingShape) return null;

  return {
    id: item.id || item.writingTaskId || item.writing_task_id,
    title: item.title || item.name,
    taskNo:
      typeof item.taskNo === "number"
        ? item.taskNo
        : typeof item.task_no === "number"
          ? item.task_no
          : undefined,
    promptText,
    chartUrl: item.chartUrl || item.chart_url || "",
    imageUrl: item.imageUrl || item.image_url || "",
  };
}

function collectWritingTasksFromSnapshot(snapshot: any): WritingTaskView[] {
  const result: WritingTaskView[] = [];
  const seen = new Set<string>();

  function pushTask(raw: any) {
    const task = normalizeWritingTask(raw);
    if (!task) return;

    const key = task.id || `${task.title}-${task.promptText}`;
    if (seen.has(key)) return;

    seen.add(key);
    result.push(task);
  }

  function walk(value: any) {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (!isObject(value)) return;

    if (value.writingTask) pushTask(value.writingTask);
    if (value.writing_task) pushTask(value.writing_task);

    if (
      value.sectionType === "WRITING_TASK" ||
      value.section_type === "WRITING_TASK"
    ) {
      pushTask(value);
    }

    Object.values(value).forEach(walk);
  }

  walk(snapshot);
  return result;
}

function getWritingTasks(submission: any): WritingTaskView[] {
  const directTasks =
    submission?.writingTasks ||
    submission?.writing_tasks ||
    submission?.tasks ||
    [];

  if (Array.isArray(directTasks) && directTasks.length) {
    return directTasks
      .map(normalizeWritingTask)
      .filter(Boolean) as WritingTaskView[];
  }

  if (submission?.writingTask || submission?.writing_task || submission?.task) {
    const single = normalizeWritingTask(
      submission.writingTask || submission.writing_task || submission.task,
    );

    if (single) return [single];
  }

  return collectWritingTasksFromSnapshot(
    submission?.snapshot ||
      submission?.attemptSnapshot ||
      submission?.attempt_snapshot ||
      submission?.attempt?.snapshot,
  );
}

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function formatTaskTitle(task: WritingTaskView, index: number) {
  if (task.title) return task.title;
  if (task.taskNo) return `Writing Task ${task.taskNo}`;
  return `Writing Task ${index + 1}`;
}

function findResponseForTask(
  task: WritingTaskView,
  responses: WritingResponseView[],
  index: number,
) {
  if (task.id) {
    const matched = responses.find(
      (item) => item.writingTaskId && item.writingTaskId === task.id,
    );

    if (matched) return matched;
  }

  return responses[index] || null;
}

function buildItems(submission: any) {
  const tasks = getWritingTasks(submission);
  const responses = getWritingResponses(submission);

  if (tasks.length) {
    return tasks.map((task, index) => ({
      task,
      response: findResponseForTask(task, responses, index),
    }));
  }

  if (responses.length) {
    return responses.map((response, index) => ({
      task: {
        title: `Writing response ${index + 1}`,
        promptText:
          "Không tìm thấy đề bài trong snapshot, nhưng hệ thống vẫn có bài viết của học viên.",
      } as WritingTaskView,
      response,
    }));
  }

  return [
    {
      task: {
        title: "Writing Task",
        promptText:
          submission?.promptText ||
          submission?.question ||
          "Chưa có nội dung đề bài.",
      } as WritingTaskView,
      response: {
        responseText:
          submission?.answerText ||
          submission?.content ||
          "Học viên chưa có nội dung bài viết.",
      } as WritingResponseView,
    },
  ];
}

export function WritingSubmissionViewer({ submission }: Props) {
  const items = buildItems(submission);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <PenLine className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
                  Writing submission
                </p>
                <h2 className="mt-1 font-serif text-3xl font-bold text-slate-950">
                  Bài viết của học viên
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {getStudentName(submission)} · {getTestTitle(submission)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm text-slate-500">
              Tổng số phần Writing:{" "}
              <span className="font-bold text-slate-950">{items.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {items.map(({ task, response }, index) => {
        const answerText =
          response?.responseText || "Học viên chưa có nội dung bài viết.";
        const imageUrl = task.chartUrl || task.imageUrl || "";
        const wordCount =
          typeof response?.wordCount === "number"
            ? response.wordCount
            : countWords(answerText);

        return (
          <div
            key={task.id || response?.id || index}
            className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
          >
            <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
                      Đề bài
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold text-slate-950">
                      {formatTaskTitle(task, index)}
                    </h3>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {imageUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-cyan-100 bg-cyan-50/70 p-3">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <ImageIcon className="h-4 w-4 text-cyan-700" />
                      Hình ảnh / biểu đồ đi kèm
                    </div>

                    <img
                      src={imageUrl}
                      alt="Hình minh họa đề Writing"
                      className="mx-auto max-h-[360px] w-full rounded-xl object-contain"
                    />
                  </div>
                ) : null}

                <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                  <p className="whitespace-pre-wrap text-base leading-8 text-slate-950">
                    {task.promptText || "Chưa có nội dung đề bài."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
                      Bài làm
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-bold text-slate-950">
                      Câu trả lời của học viên
                    </h3>
                  </div>

                  <div className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
                    {wordCount} từ
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="max-h-[620px] overflow-y-auto rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                  <p className="whitespace-pre-wrap text-base leading-8 text-slate-950">
                    {answerText}
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 rounded-2xl border border-cyan-100 bg-white/80 p-4 text-sm text-slate-500">
                  <UserRound className="h-4 w-4 text-cyan-700" />
                  Hãy đối chiếu bài viết với đề bài trước khi nhập điểm từng
                  tiêu chí.
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
