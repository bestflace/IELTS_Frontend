"use client";

import { MessageSquareText, UserRound } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/common/Card";

type Reviewer = {
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

type Props = {
  summary?: string | null;
  actionItems?: unknown;
  reviewedBy?: Reviewer | null;
  reviewedAt?: string | null;
};

function normalizeActionItems(value: unknown) {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);

  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function formatDate(value?: string | null) {
  if (!value) return "";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function TeacherFeedbackPanel({
  summary,
  actionItems,
  reviewedBy,
  reviewedAt,
}: Props) {
  const items = normalizeActionItems(actionItems);
  const reviewerName = reviewedBy?.fullName || reviewedBy?.email || "";

  return (
    <Card className="rounded-[28px] border border-line bg-surface">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primarySoft">
            <MessageSquareText className="h-5 w-5 text-moss" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-sage">
              Teacher feedback
            </p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-ink">
              Nhận xét của giáo viên
            </h2>
            {reviewerName ? (
              <p className="mt-1 text-sm text-neutralText">
                Chấm bởi {reviewerName}
                {reviewedAt ? ` • ${formatDate(reviewedAt)}` : ""}
              </p>
            ) : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-line bg-paper p-5">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-neutralText">
            Tổng quan
          </p>

          <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-ink">
            {summary || "Chưa có nhận xét tổng quan."}
          </p>
        </div>

        {items.length ? (
          <div className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-neutralText">
              Việc nên cải thiện
            </p>

            <ul className="mt-3 space-y-3">
              {items.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-3 text-sm leading-7 text-ink"
                >
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primarySoft text-xs font-bold text-moss">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {!reviewerName ? (
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-paper p-4 text-sm text-neutralText">
            <UserRound className="h-4 w-4 text-moss" />
            Thông tin giáo viên chấm sẽ hiển thị khi backend trả dữ liệu người
            chấm.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
