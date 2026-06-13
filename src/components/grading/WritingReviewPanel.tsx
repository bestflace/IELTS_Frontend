"use client";

import { BookOpenCheck, Layers3, PenLine, SpellCheck } from "lucide-react";

import { BandScoreCard } from "@/components/grading/BandScoreCard";
import { RubricScoreView } from "@/components/grading/RubricScoreView";
import { TeacherFeedbackPanel } from "@/components/grading/TeacherFeedbackPanel";

type Props = {
  review?: any;
};

function getCriteria(review: any) {
  return review?.criteriaJson || review?.criteria_json || {};
}

export function WritingReviewPanel({ review }: Props) {
  if (!review) return null;

  const criteria = getCriteria(review);

  return (
    <div className="space-y-5">
      <BandScoreCard
        label="Writing Band"
        value={review.overallBand ?? review.overall_band}
        description="Điểm Writing được tổng hợp từ 4 tiêu chí chấm IELTS Writing."
      />

      <RubricScoreView
        title="Chi tiết điểm Writing"
        description="Mỗi tiêu chí được chấm theo thang điểm IELTS và tổng hợp thành Writing Band."
        items={[
          {
            key: "taskAchievement",
            title: "Task Achievement / Task Response",
            description:
              "Mức độ trả lời đúng yêu cầu đề, phát triển ý và xử lý nhiệm vụ bài viết.",
            score: criteria.taskAchievement ?? criteria.taskResponse,
            icon: BookOpenCheck,
          },
          {
            key: "coherenceCohesion",
            title: "Coherence and Cohesion",
            description:
              "Độ mạch lạc, cách tổ chức đoạn và liên kết ý trong bài viết.",
            score: criteria.coherenceCohesion,
            icon: Layers3,
          },
          {
            key: "lexicalResource",
            title: "Lexical Resource",
            description: "Sự đa dạng, chính xác và phù hợp của từ vựng.",
            score: criteria.lexicalResource,
            icon: PenLine,
          },
          {
            key: "grammaticalRangeAccuracy",
            title: "Grammatical Range and Accuracy",
            description: "Độ đa dạng và chính xác của cấu trúc ngữ pháp.",
            score: criteria.grammaticalRangeAccuracy,
            icon: SpellCheck,
          },
        ]}
      />

      <TeacherFeedbackPanel
        summary={review.summary}
        actionItems={review.actionItemsJson ?? review.action_items_json}
        reviewedBy={review.reviewedBy}
        reviewedAt={
          review.updatedAt ??
          review.updated_at ??
          review.createdAt ??
          review.created_at
        }
      />
    </div>
  );
}
