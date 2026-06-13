"use client";

import { FileText, ImageIcon } from "lucide-react";

import { WritingEditor } from "@/components/attempts/writing/WritingEditor";
import { Badge } from "@/components/common/Badge";

type WritingTask = {
  id: string;
  title?: string | null;
  taskNo?: 1 | 2 | number | null;
  promptText?: string | null;
  chartUrl?: string | null;
  imageUrl?: string | null;
};

type Props = {
  task?: WritingTask | null;
  value: string;
  readonly?: boolean;
  onChange: (taskId: string, value: string) => void;
};

function getTaskNo(task?: WritingTask | null) {
  return task?.taskNo === 2 ? 2 : 1;
}

function getTaskTitle(task?: WritingTask | null) {
  if (!task) return "Writing Task";
  if (task.title) return task.title;
  return `IELTS Writing Task ${getTaskNo(task)}`;
}

export function WritingPracticeView({
  task,
  value,
  readonly = false,
  onChange,
}: Props) {
  const taskNo = getTaskNo(task);
  const chartUrl = task?.chartUrl || task?.imageUrl || "";

  return (
    <main className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(520px,0.95fr)] bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <section className="min-h-0 border-r border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/70">
        <div className="h-full overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-5xl pb-8">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Badge tone="brown">Writing Task {taskNo}</Badge>

              {taskNo === 1 ? (
                <Badge tone="sage">Chart / Map / Process / Table</Badge>
              ) : (
                <Badge tone="sage">Essay</Badge>
              )}
            </div>

            <h1 className="font-serif text-4xl font-bold leading-tight text-slate-950">
              {getTaskTitle(task)}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Đọc kỹ đề bài ở bên trái, sau đó viết câu trả lời ở khung bên
              phải. Bài viết sẽ được lưu tự động.
            </p>

            <div className="mt-8 rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_20px_70px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-serif text-2xl font-bold text-slate-950">
                    Question prompt
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Đây là đề bài chính của Writing Task {taskNo}.
                  </p>
                </div>
              </div>

              <div className="rounded-[26px] border border-cyan-100 bg-white/80 p-5 shadow-sm backdrop-blur-xl">
                <p className="whitespace-pre-line text-[17px] leading-9 text-slate-950">
                  {task?.promptText || "Chưa có prompt cho Writing Task này."}
                </p>
              </div>

              {chartUrl ? (
                <div className="mt-6 overflow-hidden rounded-[26px] border border-cyan-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <ImageIcon className="h-4 w-4 text-cyan-700" />
                    Hình ảnh / biểu đồ đi kèm
                  </div>

                  <img
                    src={chartUrl}
                    alt={task?.title || "Writing task image"}
                    className="max-h-[620px] w-full rounded-xl object-contain"
                  />
                </div>
              ) : taskNo === 1 ? (
                <div className="mt-6 rounded-[26px] border border-dashed border-cyan-200 bg-cyan-50/70 p-5 text-sm leading-6 text-slate-500">
                  Task 1 thường cần chart/map/process/table. Nếu đề có ảnh, hãy
                  upload ảnh vào Thư viện media rồi gắn URL vào chart_url hoặc
                  image_url.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-0 bg-white/65 backdrop-blur-xl">
        <div className="h-full overflow-hidden px-8 py-8">
          <div className="mx-auto h-full max-w-4xl">
            <WritingEditor
              value={value}
              readonly={readonly || !task}
              taskNo={taskNo}
              onChange={(nextValue) => {
                if (!task) return;
                onChange(task.id, nextValue);
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
