"use client";

import Link from "next/link";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { ReadingSetTable } from "@/components/content-bank/reading/ReadingSetTable";
import { ContentBankTabs } from "@/components/content-bank/ContentBankTabs";
export default function AdminReadingSetsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Content Bank"
        title="Ngân hàng Reading"
        description="Quản lý bài đọc, passage, câu hỏi và trạng thái xuất bản cho phần Reading."
        actions={
          <>
            <Link href="/admin/imports?type=READING_SET">
              <Button variant="outline">
                <FileUp className="h-4 w-4" />
                Import CSV
              </Button>
            </Link>

            <Link href="/admin/reading-sets/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo Reading Set
              </Button>
            </Link>
          </>
        }
      />
      <ContentBankTabs />
      <ReadingSetTable />
    </div>
  );
}
