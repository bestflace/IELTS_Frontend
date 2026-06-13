"use client";

import Link from "next/link";
import { ArrowLeft, Shuffle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { RandomBuildForm } from "@/components/tests/RandomBuildForm";

export default function AdminRandomBuildPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Test Builder"
        title="Tạo đề thi ngẫu nhiên"
        description="Hệ thống tự chọn nội dung phù hợp từ ngân hàng đề đã xuất bản, sau đó tạo bản nháp để bạn kiểm tra, reroll và xuất bản."
        actions={
          <Link href="/admin/tests">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <RandomBuildForm
        icon={<Shuffle className="h-4 w-4" />}
        submitLabel="Tạo đề ngẫu nhiên"
      />
    </div>
  );
}
