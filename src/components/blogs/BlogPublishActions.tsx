"use client";

import { Save, Send } from "lucide-react";
import { Button } from "@/components/common/Button";

type Props = {
  saving?: boolean;
  publishing?: boolean;
  onSaveDraft: () => void;
  onPublish: () => void;
};

export function BlogPublishActions({
  saving = false,
  publishing = false,
  onSaveDraft,
  onPublish,
}: Props) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={saving || publishing}
        onClick={onSaveDraft}
      >
        <Save className="h-4 w-4" />
        {saving ? "Đang lưu..." : "Save Draft"}
      </Button>

      <Button type="button" disabled={saving || publishing} onClick={onPublish}>
        <Send className="h-4 w-4" />
        {publishing ? "Đang publish..." : "Publish"}
      </Button>
    </div>
  );
}
