"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { ReadingSetForm } from "@/components/content-bank/reading/ReadingSetForm";

export default function AdminNewReadingSetPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Reading Bank"
        title="Tạo Reading Set"
        description="Tạo passage mới cho ngân hàng Reading. Sau khi lưu, bạn có thể thêm câu hỏi và xuất bản."
        actions={
          <Link href="/admin/reading-sets">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <ReadingSetForm mode="create" />
    </div>
  );
}
