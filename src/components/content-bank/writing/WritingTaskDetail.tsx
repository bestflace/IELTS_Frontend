"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, PenLine, RefreshCw, Send } from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { WritingTaskForm } from "@/components/content-bank/writing/WritingTaskForm";
import {
  getAdminWriting,
  publishWriting,
  unpublishWriting,
} from "@/lib/api/writing.api";
import { getErrorMessage } from "@/lib/api/client";
import type { PublishStatus, WritingTask } from "@/types";

type Props = {
  taskId: string;
};

function statusText(status?: PublishStatus) {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "ARCHIVED") return "Lưu trữ";
  return "Bản nháp";
}

export function WritingTaskDetail({ taskId }: Props) {
  const [task, setTask] = useState<WritingTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminWriting(taskId);
      setTask(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePublish = async () => {
    if (!task) return;

    setActionLoading(true);
    setError("");

    try {
      if (task.status === "PUBLISHED") {
        await unpublishWriting(task.id);
      } else {
        await publishWriting(task.id);
      }

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingState label="Đang tải Writing Task..." />;

  if (error && !task) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!task) {
    return (
      <EmptyState
        title="Không tìm thấy Writing Task"
        description="Task có thể đã bị xóa hoặc ID không hợp lệ."
        action={
          <Link href="/admin/writing-tasks">
            <Button variant="outline">Quay lại ngân hàng Writing</Button>
          </Link>
        }
      />
    );
  }

  const isPublished = task.status === "PUBLISHED";
  const canPublish = Boolean(task.promptText && task.title);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />
      <PageHeader
        eyebrow="Admin / Writing Bank"
        title={task.title}
        description="Quản lý prompt, media, band mục tiêu và trạng thái xuất bản của Writing Task."
        actions={
          <>
            <Link href="/admin/writing-tasks">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={loadData}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>

            <Button
              onClick={handleTogglePublish}
              disabled={actionLoading || (!isPublished && !canPublish)}
              variant={isPublished ? "secondary" : "primary"}
            >
              <Send className="h-4 w-4" />
              {isPublished ? "Gỡ xuất bản" : "Xuất bản"}
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <main className="min-w-0 space-y-5">
          {error ? <ErrorState message={error} onRetry={loadData} /> : null}

          <WritingTaskForm mode="edit" initialData={task} onSaved={setTask} />
        </main>

        <aside className="grid min-w-0 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
            <CardHeader className="relative bg-gradient-to-r from-white/85 via-cyan-50/60 to-blue-50/70">
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Writing overview
              </p>
              <h2 className="mt-1 font-serif text-xl font-black text-slate-950">
                Thông tin task
              </h2>
            </CardHeader>

            <CardContent className="min-w-0 space-y-4">
              <div className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                  Trạng thái
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {statusText(task.status)}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                  Task
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  Task {task.taskNo || "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl p-4">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">
                  Band
                </p>
                <p className="mt-2 text-sm font-black text-slate-950">
                  {task.level ?? "—"}
                </p>
              </div>

              {task.tags?.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-black text-slate-950">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag.id} tone="sage">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <div className="flex min-w-0 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl">
                <PenLine className="h-4 w-4 text-cyan-700" />
              </div>

              <div className="min-w-0">
                <h3 className="font-serif text-xl font-black text-slate-950">
                  Điều kiện xuất bản
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Writing Task cần có tên và prompt rõ ràng trước khi xuất bản.
                </p>

                {!isPublished && !canPublish ? (
                  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-700">
                    Chưa thể xuất bản. Hãy nhập đầy đủ tên task và prompt đề
                    bài.
                  </p>
                ) : null}
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
