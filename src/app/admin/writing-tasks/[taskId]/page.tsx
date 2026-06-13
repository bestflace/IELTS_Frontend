"use client";

import { useParams } from "next/navigation";
import { WritingTaskDetail } from "@/components/content-bank/writing/WritingTaskDetail";

export default function AdminWritingTaskDetailPage() {
  const params = useParams();
  const taskId = String(params.taskId);

  return <WritingTaskDetail taskId={taskId} />;
}
