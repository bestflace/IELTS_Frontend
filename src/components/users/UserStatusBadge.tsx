"use client";

import { Badge } from "@/components/common/Badge";
import type { UserStatus } from "@/types";

export function getUserStatusText(status?: UserStatus) {
  if (status === "ACTIVE") return "Đang hoạt động";
  if (status === "BLOCKED") return "Đã khóa";
  if (status === "PENDING") return "Chờ xác thực";
  return "Không rõ";
}

export function UserStatusBadge({ status }: { status?: UserStatus }) {
  if (status === "ACTIVE") {
    return <Badge tone="success">Đang hoạt động</Badge>;
  }

  if (status === "BLOCKED") {
    return <Badge tone="warning">Đã khóa</Badge>;
  }

  if (status === "PENDING") {
    return <Badge tone="brown">Chờ xác thực</Badge>;
  }

  return <Badge tone="brown">Không rõ</Badge>;
}
