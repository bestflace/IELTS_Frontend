"use client";

import { AudioLines, MessageCircle, SpellCheck, Waves } from "lucide-react";

import { BandScoreCard } from "@/components/grading/BandScoreCard";
import { RubricScoreView } from "@/components/grading/RubricScoreView";
import { TeacherFeedbackPanel } from "@/components/grading/TeacherFeedbackPanel";

type Props = {
  review?: any;
};

function getCriteria(review: any) {
  return review?.criteriaJson || review?.criteria_json || {};
}

export function SpeakingReviewPanel({ review }: Props) {
  if (!review) return null;

  const criteria = getCriteria(review);

  return (
    <div className="space-y-5">
      <BandScoreCard
        label="Speaking Band"
        value={review.overallBand ?? review.overall_band}
        description="Điểm Speaking được tổng hợp từ 4 tiêu chí chấm IELTS Speaking."
      />

      <RubricScoreView
        title="Chi tiết điểm Speaking"
        description="Mỗi tiêu chí được chấm theo thang điểm IELTS và tổng hợp thành Speaking Band."
        items={[
          {
            key: "fluencyCoherence",
            title: "Fluency and Coherence",
            description:
              "Độ trôi chảy, khả năng duy trì câu trả lời và liên kết ý.",
            score: criteria.fluencyCoherence,
            icon: Waves,
          },
          {
            key: "lexicalResource",
            title: "Lexical Resource",
            description:
              "Sự đa dạng, chính xác và phù hợp của từ vựng khi nói.",
            score: criteria.lexicalResource,
            icon: MessageCircle,
          },
          {
            key: "grammaticalRangeAccuracy",
            title: "Grammatical Range and Accuracy",
            description:
              "Độ đa dạng và chính xác của cấu trúc ngữ pháp trong bài nói.",
            score: criteria.grammaticalRangeAccuracy,
            icon: SpellCheck,
          },
          {
            key: "pronunciation",
            title: "Pronunciation",
            description:
              "Độ rõ ràng của phát âm, trọng âm, ngữ điệu và mức độ dễ hiểu.",
            score: criteria.pronunciation,
            icon: AudioLines,
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
