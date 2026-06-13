"use client";

import { Badge } from "@/components/common/Badge";
import type { BackendRole } from "@/types";

export function getUserRoleText(role?: BackendRole) {
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "TEACHER") return "Giáo viên";
  return "Học viên";
}

export function UserRoleBadge({ role }: { role?: BackendRole }) {
  if (role === "ADMIN") {
    return <Badge tone="brown">Quản trị viên</Badge>;
  }

  if (role === "TEACHER") {
    return <Badge tone="sage">Giáo viên</Badge>;
  }

  return <Badge tone="success">Học viên</Badge>;
}
