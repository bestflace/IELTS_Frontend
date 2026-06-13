"use client";

import { Badge } from "@/components/common/Badge";
import type { PublishStatus } from "@/types";

type Props = {
  status?: PublishStatus;
};

export function getBlogStatusText(status?: PublishStatus) {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "ARCHIVED") return "Lưu trữ";
  return "Bản nháp";
}

export function BlogStatusBadge({ status }: Props) {
  if (status === "PUBLISHED") {
    return <Badge tone="success">Đã xuất bản</Badge>;
  }

  if (status === "ARCHIVED") {
    return <Badge tone="brown">Lưu trữ</Badge>;
  }

  return <Badge tone="warning">Bản nháp</Badge>;
}
