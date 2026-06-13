import { Badge } from "@/components/common/Badge";

type Props = {
  status?: string | null;
};

function getStatusMeta(status?: string | null) {
  switch (status) {
    case "IN_PROGRESS":
      return { label: "Đang làm", tone: "sage" as const };
    case "SUBMITTED":
      return { label: "Đã nộp", tone: "brown" as const };
    case "GRADING":
      return { label: "Đang chấm", tone: "warning" as const };
    case "GRADED":
      return { label: "Đã chấm", tone: "success" as const };
    case "EXPIRED":
      return { label: "Hết hạn", tone: "danger" as const };
    case "ERROR":
      return { label: "Lỗi", tone: "danger" as const };
    default:
      return { label: status || "Chưa rõ", tone: "warning" as const };
  }
}

export function AttemptStatusBadge({ status }: Props) {
  const meta = getStatusMeta(status);
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}
