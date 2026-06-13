"use client";

import Link from "next/link";
import { ArrowLeft, FilePlus2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { TestMetadataForm } from "@/components/tests/TestMetadataForm";

export default function AdminCreateManualTestPage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Tests"
        title="Tạo đề thi thủ công"
        description="Khởi tạo thông tin đề thi trước, sau đó chọn từng phần thi từ ngân hàng Reading, Listening, Writing và Speaking."
        actions={
          <Link href="/admin/tests">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <TestMetadataForm
        mode="create"
        submitLabel="Lưu bản nháp & tiếp tục chọn section"
        icon={<FilePlus2 className="h-4 w-4" />}
      />
    </div>
  );
}
