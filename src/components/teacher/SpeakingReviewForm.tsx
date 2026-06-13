"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AudioLines,
  MessageCircle,
  Send,
  SpellCheck,
  Waves,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Textarea } from "@/components/common/Textarea";
import { ErrorState } from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import { submitSpeakingReview } from "@/lib/api/teacher.api";
import {
  calculateOverallBand,
  RubricScoreForm,
  type RubricCriterion,
} from "@/components/teacher/RubricScoreForm";
import { SubmitReviewDialog } from "@/components/teacher/SubmitReviewDialog";

type SpeakingScores = {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRangeAccuracy: number;
  pronunciation: number;
};

type Props = {
  submissionId: string;
  submission?: any;
  onSubmitted?: () => void;
};

const speakingCriteria: RubricCriterion[] = [
  {
    key: "fluencyCoherence",
    title: "Fluency and Coherence",
    description:
      "Độ trôi chảy, khả năng duy trì câu trả lời, liên kết ý và phát triển câu trả lời tự nhiên.",
    icon: Waves,
  },
  {
    key: "lexicalResource",
    title: "Lexical Resource",
    description:
      "Sự đa dạng, chính xác và phù hợp của từ vựng khi diễn đạt ý trong bài nói.",
    icon: MessageCircle,
  },
  {
    key: "grammaticalRangeAccuracy",
    title: "Grammatical Range and Accuracy",
    description:
      "Độ đa dạng và chính xác của cấu trúc câu, thì, mệnh đề và lỗi ngữ pháp trong khi nói.",
    icon: SpellCheck,
  },
  {
    key: "pronunciation",
    title: "Pronunciation",
    description:
      "Độ rõ ràng của phát âm, trọng âm, ngữ điệu và mức độ dễ hiểu của bài nói.",
    icon: AudioLines,
  },
];
function getExistingReview(submission: any) {
  return (
    submission?.review ||
    submission?.teacherReview ||
    submission?.speakingReview ||
    submission?.grading ||
    submission?.teacherFeedback ||
    null
  );
}

function getReviewValue(review: any, keys: string[], fallback = 0) {
  const criteria = review?.criteriaJson || review?.criteria_json || {};

  for (const key of keys) {
    const value = review?.[key] ?? criteria?.[key];

    if (value !== undefined && value !== null) {
      const number = Number(value);
      return Number.isFinite(number) ? number : fallback;
    }
  }

  return fallback;
}

function getReviewSummary(review: any) {
  return (
    review?.summary ||
    review?.comment ||
    review?.feedback ||
    review?.teacherComment ||
    ""
  );
}

function getReviewActionItems(review: any) {
  const items =
    review?.actionItems ||
    review?.actionItemsJson ||
    review?.action_items ||
    review?.action_items_json ||
    review?.suggestions;

  if (Array.isArray(items)) {
    return items.join("\n");
  }

  if (typeof items === "string") {
    return items;
  }

  return "";
}
export function SpeakingReviewForm({
  submissionId,
  submission,
  onSubmitted,
}: Props) {
  const [scores, setScores] = useState<SpeakingScores>({
    fluencyCoherence: 0,
    lexicalResource: 0,
    grammaticalRangeAccuracy: 0,
    pronunciation: 0,
  });

  const [summary, setSummary] = useState("");
  const [actionItemsText, setActionItemsText] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const review = getExistingReview(submission);

    if (!review) return;

    setScores({
      fluencyCoherence: getReviewValue(review, [
        "fluencyCoherence",
        "fluency_coherence",
      ]),
      lexicalResource: getReviewValue(review, [
        "lexicalResource",
        "lexical_resource",
      ]),
      grammaticalRangeAccuracy: getReviewValue(review, [
        "grammaticalRangeAccuracy",
        "grammatical_range_accuracy",
        "grammar",
      ]),
      pronunciation: getReviewValue(review, ["pronunciation"]),
    });

    setSummary(getReviewSummary(review));
    setActionItemsText(getReviewActionItems(review));
  }, [submission]);
  const overallBand = useMemo(() => calculateOverallBand(scores), [scores]);
  const isReviewed = submission?.status === "REVIEWED";
  const updateScore = (key: keyof SpeakingScores, value: number) => {
    setScores((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const validate = () => {
    const hasEmptyScore = Object.values(scores).some((value) => value <= 0);

    if (hasEmptyScore) {
      return "Vui lòng chấm đủ 4 tiêu chí trước khi gửi nhận xét.";
    }

    if (!summary.trim()) {
      return "Vui lòng nhập nhận xét tổng quan cho học viên.";
    }

    return "";
  };

  const buildActionItems = () => {
    return actionItemsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const handleOpenConfirm = (event: FormEvent) => {
    event.preventDefault();

    const validationMessage = validate();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError("");
    setConfirmOpen(true);
  };

  const handleSubmitReview = async () => {
    setSubmitting(true);
    setError("");

    try {
      await submitSpeakingReview(submissionId, {
        overallBand,
        fluencyCoherence: scores.fluencyCoherence,
        lexicalResource: scores.lexicalResource,
        grammaticalRangeAccuracy: scores.grammaticalRangeAccuracy,
        pronunciation: scores.pronunciation,
        summary: summary.trim(),
        actionItems: buildActionItems(),
      });

      setConfirmOpen(false);
      onSubmitted?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleOpenConfirm} className="space-y-5">
        {error ? <ErrorState message={error} /> : null}

        <RubricScoreForm<SpeakingScores>
          title="Tiêu chí chấm Speaking"
          description="Chấm từng tiêu chí bằng cách kéo thanh điểm hoặc nhập trực tiếp. Điểm tổng hợp được tính tự động từ 4 tiêu chí."
          criteria={speakingCriteria}
          values={scores}
          onChange={updateScore}
        />

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardHeader>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
              Feedback
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-slate-950">
              Nhận xét cho học viên
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Nhận xét nên tập trung vào độ trôi chảy, từ vựng, ngữ pháp và phát
              âm.
            </p>
          </CardHeader>

          <CardContent className="space-y-5">
            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-slate-950">
                Nhận xét tổng quan
              </span>
              <Textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                className="min-h-36"
                placeholder="Ví dụ: Câu trả lời khá tự nhiên, phát âm rõ, nhưng cần mở rộng ý và giảm khoảng dừng khi chuyển ý..."
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-slate-950">
                Việc học viên nên cải thiện
              </span>
              <Textarea
                value={actionItemsText}
                onChange={(event) => setActionItemsText(event.target.value)}
                className="min-h-28"
                placeholder={
                  "Mỗi dòng là một gợi ý. Ví dụ:\nLuyện mở rộng câu trả lời Part 2.\nChú ý trọng âm từ.\nDùng thêm từ nối tự nhiên."
                }
              />
            </label>

            <div className="flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.18em] text-slate-500">
                  Điểm Speaking tổng hợp
                </p>
                <p className="mt-1 font-serif text-3xl font-bold text-slate-950">
                  {overallBand ? overallBand.toFixed(1) : "—"}
                </p>
              </div>

              <Button type="submit">
                <Send className="h-4 w-4" />
                {isReviewed ? "Cập nhật nhận xét" : "Kiểm tra và gửi"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <SubmitReviewDialog
        open={confirmOpen}
        title={
          isReviewed
            ? "Cập nhật kết quả chấm Speaking?"
            : "Gửi kết quả chấm Speaking?"
        }
        description={
          isReviewed
            ? "Bài này đã được chấm trước đó. Nếu xác nhận, điểm và nhận xét mới sẽ thay thế phần chấm hiện tại."
            : "Sau khi gửi, học viên sẽ nhìn thấy điểm và nhận xét của giáo viên. Hãy kiểm tra lại điểm từng tiêu chí trước khi xác nhận."
        }
        loading={submitting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleSubmitReview}
      />
    </>
  );
}
