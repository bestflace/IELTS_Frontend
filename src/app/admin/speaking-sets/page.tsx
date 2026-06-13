"use client";

import Link from "next/link";
import { FileUp, Plus } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { ContentBankTabs } from "@/components/content-bank/ContentBankTabs";
import { SpeakingSetTable } from "@/components/content-bank/speaking/SpeakingSetTable";

export default function AdminSpeakingSetsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Content Bank"
        title="Ngân hàng Speaking"
        description="Quản lý topic, parts, prompts, cue card và trạng thái xuất bản cho phần Speaking."
        actions={
          <>
            <Link href="/admin/imports?type=SPEAKING_SET">
              <Button variant="outline">
                <FileUp className="h-4 w-4" />
                Import CSV
              </Button>
            </Link>

            <Link href="/admin/speaking-sets/new">
              <Button>
                <Plus className="h-4 w-4" />
                Tạo Speaking Set
              </Button>
            </Link>
          </>
        }
      />

      <ContentBankTabs />

      <SpeakingSetTable />
    </div>
  );
}
