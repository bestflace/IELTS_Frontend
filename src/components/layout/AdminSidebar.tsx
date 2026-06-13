"use client";

import {
  BarChart3,
  Bell,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  UsersRound,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Images } from "lucide-react";
export function AdminSidebar() {
  return (
    <Sidebar
      brand="Quản trị viên"
      homeHref="/admin/dashboard"
      profileHref="/admin/profile"
      footerName="Quản trị viên"
      footerRole="Không gian quản trị"
      items={[
        {
          href: "/admin/dashboard",
          label: "Bảng điều khiển",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          href: "/admin/users",
          label: "Người dùng",
          icon: <UsersRound className="h-4 w-4" />,
          match: ["/admin/users"],
        },
        {
          href: "/admin/tests",
          label: "Đề thi",
          icon: <FileText className="h-4 w-4" />,
          match: ["/admin/tests"],
        },
        {
          href: "/admin/content-bank",
          label: "Ngân hàng nội dung",
          icon: <FolderKanban className="h-4 w-4" />,
          match: [
            "/admin/content-bank",
            "/admin/reading-sets",
            "/admin/listening-sets",
            "/admin/writing-tasks",
            "/admin/speaking-sets",
          ],
        },
        {
          href: "/admin/imports",
          label: "Import",
          icon: <FileSpreadsheet className="h-4 w-4" />,
          match: ["/admin/imports"],
        },
        {
          href: "/admin/uploads",
          label: "Thư viện media",
          icon: <Images className="h-4 w-4" />,
          match: ["/admin/uploads"],
        },
        {
          href: "/admin/submissions",
          label: "Bài nộp",
          icon: <FileText className="h-4 w-4" />,
          match: ["/admin/submissions"],
        },
        {
          href: "/admin/comments",
          label: "Bình luận",
          icon: <MessageSquareText className="h-4 w-4" />,
        },
        {
          href: "/admin/reports",
          label: "Báo cáo",
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          href: "/admin/notifications",
          label: "Thông báo",
          icon: <Bell className="h-4 w-4" />,
        },
        {
          href: "/admin/profile",
          label: "Cài đặt",
          icon: <Settings className="h-4 w-4" />,
          match: ["/admin/profile", "/admin/change-password"],
        },
      ]}
    />
  );
}
