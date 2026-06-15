"use client";
import { ComingSoonVietnamese } from "@/features/screens/VietnameseDashboards";
import { GraduationCap } from "lucide-react";
export default function Page() {
  return (
    <ComingSoonVietnamese
      title="Quản lý lớp học"
      icon={GraduationCap}
      description="Cho phép tạo, sửa, xóa lớp học và thêm giáo viên phụ trách. Phần lớp học sẽ phát triển sau nên hiện tại hiển thị UI định hướng."
    />
  );
}
