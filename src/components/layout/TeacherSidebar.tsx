"use client";

import {
  BarChart3,
  Bell,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { Sidebar } from "./Sidebar";

export function TeacherSidebar() {
  return (
    <Sidebar
      brand="Giáo viên"
      homeHref="/teacher/dashboard"
      profileHref="/teacher/profile"
      footerName="Giáo viên"
      footerRole="Không gian chấm bài"
      items={[
        {
          href: "/teacher/dashboard",
          label: "Bảng điều khiển",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          href: "/teacher/submissions",
          label: "Chấm bài",
          icon: <ClipboardCheck className="h-4 w-4" />,
          match: ["/teacher/submissions"],
        },
        {
          href: "/teacher/classes",
          label: "Quản lý lớp học",
          icon: <GraduationCap className="h-4 w-4" />,
        },
        {
          href: "/teacher/reports",
          label: "Báo cáo",
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          href: "/teacher/notifications",
          label: "Thông báo",
          icon: <Bell className="h-4 w-4" />,
        },
        {
          href: "/teacher/profile",
          label: "Cài đặt",
          icon: <Settings className="h-4 w-4" />,
          match: ["/teacher/profile", "/teacher/change-password"],
        },
      ]}
    />
  );
}
