"use client";

import { PageHeader } from "@/components/common/PageHeader";
import { SubmissionTable } from "@/components/teacher/SubmissionTable";

export default function TeacherSubmissionsPage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Teacher / Reviews"
        title="Bài chờ chấm"
        description="Theo dõi bài Writing và Speaking của học viên, nhận bài, chấm điểm và gửi nhận xét."
      />

      <SubmissionTable />
    </div>
  );
}
