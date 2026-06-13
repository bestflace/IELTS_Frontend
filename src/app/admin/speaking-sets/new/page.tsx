"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { SpeakingSetForm } from "@/components/content-bank/speaking/SpeakingSetForm";

export default function AdminNewSpeakingSetPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Speaking Bank"
        title="Tạo Speaking Set"
        description="Tạo topic mới cho ngân hàng Speaking. Sau khi lưu, bạn có thể thêm parts và prompts."
        actions={
          <Link href="/admin/speaking-sets">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>
        }
      />

      <SpeakingSetForm mode="create" />
    </div>
  );
}
