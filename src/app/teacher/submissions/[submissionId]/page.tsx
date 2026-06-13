"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FilePenLine, Sparkles } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { ErrorState, LoadingState } from "@/components/common/States";
import { ClaimReleaseActions } from "@/components/teacher/ClaimReleaseActions";
import { SpeakingSubmissionViewer } from "@/components/teacher/SpeakingSubmissionViewer";
import { SubmissionDetailHeader } from "@/components/teacher/SubmissionDetailHeader";
import { WritingSubmissionViewer } from "@/components/teacher/WritingSubmissionViewer";
import { getErrorMessage } from "@/lib/api/client";
import { getTeacherSubmission } from "@/lib/api/teacher.api";

export default function TeacherSubmissionDetailPage({
  params,
}: {
  params: { submissionId: string };
}) {
  const submissionId = params.submissionId;

  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmission = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTeacherSubmission(submissionId);
      setSubmission(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    loadSubmission();
  }, [loadSubmission]);

  if (loading) {
    return <LoadingState label="Đang tải bài làm..." />;
  }

  if (error || !submission) {
    return (
      <ErrorState
        message={error || "Không tìm thấy bài làm."}
        onRetry={loadSubmission}
      />
    );
  }

  const isSpeaking = submission.skill === "SPEAKING";

  const reviewHref = isSpeaking
    ? `/teacher/submissions/${submissionId}/speaking-review`
    : `/teacher/submissions/${submissionId}/writing-review`;

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <SubmissionDetailHeader
        submission={submission}
        title="Chi tiết bài làm"
        description="Xem nội dung học viên đã nộp trước khi chuyển sang màn chấm điểm."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {isSpeaking ? (
            <SpeakingSubmissionViewer submission={submission} />
          ) : (
            <WritingSubmissionViewer submission={submission} />
          )}
        </div>

        <aside className="space-y-5">
          <ClaimReleaseActions
            submissionId={submissionId}
            status={submission.status}
            onChanged={loadSubmission}
          />

          <Card className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
            <CardContent className="p-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl"
              />

              <div className="relative">
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Thao tác
                </p>

                <h2 className="mt-4 font-serif text-2xl font-black text-slate-950">
                  Chấm bài
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sau khi xem nội dung bài làm, chuyển sang màn chấm để nhập
                  điểm và nhận xét.
                </p>

                <Link href={reviewHref}>
                  <Button className="mt-5 w-full">
                    <FilePenLine className="h-4 w-4" />
                    Mở màn chấm bài
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
