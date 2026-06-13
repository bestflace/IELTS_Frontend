"use client";

import Link from "next/link";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { ListeningSetTable } from "@/components/content-bank/listening/ListeningSetTable";
import { ContentBankTabs } from "@/components/content-bank/ContentBankTabs";
export default function AdminListeningSetsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Content Bank"
        title="Ngân hàng Listening"
        description="Quản lý audio, transcript, câu hỏi và trạng thái xuất bản cho phần Listening."
        actions={
          <>
            <Link href="/admin/imports?type=LISTENING_SET">
              <Button variant="outline">
                <FileUp className="h-4 w-4" />
                Import CSV
              </Button>
            </Link>

            <Link href="/admin/listening-sets/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo Listening Set
              </Button>
            </Link>
          </>
        }
      />
      <ContentBankTabs />
      <ListeningSetTable />
    </div>
  );
}
