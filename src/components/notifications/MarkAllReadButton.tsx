"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";

import { Button } from "@/components/common/Button";
import { getErrorMessage } from "@/lib/api/client";
import { markAllNotificationsRead } from "@/lib/api/notifications.api";

type Props = {
  onDone?: () => void;
  onError?: (message: string) => void;
};

export function MarkAllReadButton({ onDone, onError }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      await markAllNotificationsRead();
      onDone?.();
    } catch (err) {
      onError?.(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={loading}
    >
      <CheckCheck className="h-4 w-4" />
      {loading ? "Đang xử lý..." : "Đọc tất cả"}
    </Button>
  );
}
