"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { WritingTaskForm } from "@/components/content-bank/writing/WritingTaskForm";

export default function AdminNewWritingTaskPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Writing Bank"
        title="Tạo Writing Task"
        description="Tạo đề Writing Task 1 hoặc Task 2. Sau khi lưu, bạn có thể kiểm tra và xuất bản."
        actions={
          <Link href="/admin/writing-tasks">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <WritingTaskForm mode="create" />
    </div>
  );
}
