"use client";

import { useCallback, useEffect, useState } from "react";

import { ErrorState, LoadingState } from "@/components/common/States";
import { ClaimReleaseActions } from "@/components/teacher/ClaimReleaseActions";
import { SpeakingReviewForm } from "@/components/teacher/SpeakingReviewForm";
import { SpeakingSubmissionViewer } from "@/components/teacher/SpeakingSubmissionViewer";
import { SubmissionDetailHeader } from "@/components/teacher/SubmissionDetailHeader";
import { getErrorMessage } from "@/lib/api/client";
import { getTeacherSubmission } from "@/lib/api/teacher.api";

export default function SpeakingReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const submissionId = params.id;

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
    return <LoadingState label="Đang tải bài Speaking..." />;
  }

  if (error || !submission) {
    return (
      <ErrorState
        message={error || "Không tìm thấy bài Speaking."}
        onRetry={loadSubmission}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SubmissionDetailHeader
        submission={submission}
        title="Chấm bài Speaking"
        description="Nghe file ghi âm của học viên, xem transcript nếu có, nhập điểm theo 4 tiêu chí và gửi nhận xét."
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <SpeakingSubmissionViewer submission={submission} />

        <aside className="space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
          <ClaimReleaseActions
            submissionId={submissionId}
            status={submission.status}
            onChanged={loadSubmission}
          />

          <SpeakingReviewForm
            submissionId={submissionId}
            submission={submission}
            onSubmitted={loadSubmission}
          />
        </aside>
      </div>
    </div>
  );
}
