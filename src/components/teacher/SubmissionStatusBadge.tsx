"use client";

import { Badge } from "@/components/common/Badge";

type Props = {
  status?: string | null;
};

export function getSubmissionStatusText(status?: string | null) {
  if (status === "PENDING") return "Chờ chấm";
  if (status === "CLAIMED") return "Đang giữ";
  if (status === "REVIEWED") return "Đã chấm";
  if (status === "RELEASED") return "Đã trả lại";
  return "Chưa rõ";
}

export function SubmissionStatusBadge({ status }: Props) {
  if (status === "PENDING") {
    return <Badge tone="warning">Chờ chấm</Badge>;
  }

  if (status === "CLAIMED") {
    return <Badge tone="sage">Đang giữ</Badge>;
  }

  if (status === "REVIEWED") {
    return <Badge tone="success">Đã chấm</Badge>;
  }

  if (status === "RELEASED") {
    return <Badge tone="brown">Đã trả lại</Badge>;
  }

  return <Badge tone="brown">Chưa rõ</Badge>;
}
