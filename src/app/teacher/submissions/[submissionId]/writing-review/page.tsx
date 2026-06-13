"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/common/Button";
import { ErrorState, LoadingState } from "@/components/common/States";
import { ClaimReleaseActions } from "@/components/teacher/ClaimReleaseActions";
import { SubmissionDetailHeader } from "@/components/teacher/SubmissionDetailHeader";
import { WritingReviewForm } from "@/components/teacher/WritingReviewForm";
import { WritingSubmissionViewer } from "@/components/teacher/WritingSubmissionViewer";
import { getErrorMessage } from "@/lib/api/client";
import { getTeacherSubmission } from "@/lib/api/teacher.api";

type PageParams = {
  submissionId?: string;
  id?: string;
};

function getRouteSubmissionId(params: PageParams) {
  return params.submissionId || params.id || "";
}

export default function WritingReviewPage({ params }: { params: PageParams }) {
  const submissionId = useMemo(() => getRouteSubmissionId(params), [params]);

  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmission = useCallback(async () => {
    if (!submissionId || submissionId === "undefined") {
      setError(
        "Không tìm thấy mã bài làm. Vui lòng quay lại danh sách và mở lại bài.",
      );
      setLoading(false);
      return;
    }

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
    return <LoadingState label="Đang tải bài Writing..." />;
  }

  if (error || !submission) {
    return (
      <div className="space-y-5">
        <Link href="/teacher/submissions">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>

        <ErrorState
          message={error || "Không tìm thấy bài Writing."}
          onRetry={loadSubmission}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SubmissionDetailHeader
        submission={submission}
        title="Chấm bài Writing"
        description="Xem đề bài, bài viết của học viên, nhập điểm theo 4 tiêu chí và gửi nhận xét."
      />

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <WritingSubmissionViewer submission={submission} />

        <aside className="space-y-5 2xl:sticky 2xl:top-24 2xl:self-start">
          <ClaimReleaseActions
            submissionId={submissionId}
            status={submission.status}
            onChanged={loadSubmission}
          />

          <WritingReviewForm
            submissionId={submissionId}
            submission={submission}
            onSubmitted={loadSubmission}
          />
        </aside>
      </div>
    </div>
  );
}
