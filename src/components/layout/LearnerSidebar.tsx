import {
  BarChart3,
  Bell,
  FileText,
  History,
  Home,
  UserRound,
} from "lucide-react";
import { Sidebar } from "./Sidebar";

const items = [
  {
    href: "/learner/dashboard",
    label: "Trang chủ",
    icon: <Home className="h-4 w-4" />,
    match: ["/learner"],
  },
  {
    href: "/learner/tests",
    label: "Đề thi",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    href: "/learner/attempts",
    label: "Lịch sử làm bài",
    icon: <History className="h-4 w-4" />,
  },
  {
    href: "/learner/reports",
    label: "Tiến độ",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    href: "/learner/notifications",
    label: "Thông báo",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    href: "/learner/profile",
    label: "Hồ sơ",
    icon: <UserRound className="h-4 w-4" />,
  },
];

export function LearnerSidebar() {
  return (
    <Sidebar
      brand="Learner"
      homeHref="/learner/dashboard"
      footerName="IELTSBF Learner"
      footerRole="Ocean study workspace"
      items={items}
    />
  );
}
