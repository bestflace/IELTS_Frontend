"use client";

import Link from "next/link";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { ContentBankTabs } from "@/components/content-bank/ContentBankTabs";
import { WritingTaskTable } from "@/components/content-bank/writing/WritingTaskTable";

export default function AdminWritingTasksPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Content Bank"
        title="Ngân hàng Writing"
        description="Quản lý Writing Task 1/2, prompt, biểu đồ, hình ảnh và trạng thái xuất bản."
        actions={
          <>
            <Link href="/admin/imports?type=WRITING_TASK">
              <Button variant="outline">
                <FileUp className="h-4 w-4" />
                Import CSV
              </Button>
            </Link>

            <Link href="/admin/writing-tasks/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo Writing Task
              </Button>
            </Link>
          </>
        }
      />

      <ContentBankTabs />

      <WritingTaskTable />
    </div>
  );
}
