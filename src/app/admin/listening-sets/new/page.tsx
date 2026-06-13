"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { ListeningSetForm } from "@/components/content-bank/listening/ListeningSetForm";

export default function AdminNewListeningSetPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Listening Bank"
        title="Tạo Listening Set"
        description="Tạo nội dung nghe mới. Sau khi lưu, bạn có thể thêm câu hỏi và xuất bản."
        actions={
          <Link href="/admin/listening-sets">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <ListeningSetForm mode="create" />
    </div>
  );
}
