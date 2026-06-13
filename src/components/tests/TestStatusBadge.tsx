import { Badge } from "@/components/common/Badge";
import type { PublishStatus } from "@/types";

type Props = {
  status?: PublishStatus | string | null;
};

function getTone(status?: string | null) {
  if (status === "PUBLISHED") return "success";
  if (status === "ARCHIVED") return "danger";
  return "warning";
}

function getLabel(status?: string | null) {
  if (status === "PUBLISHED") return "Đã xuất bản";
  if (status === "ARCHIVED") return "Đã lưu trữ";
  return "Bản nháp";
}

export function TestStatusBadge({ status }: Props) {
  return <Badge tone={getTone(status)}>{getLabel(status)}</Badge>;
}
