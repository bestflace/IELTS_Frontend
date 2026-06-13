"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onPageChange: (page: number) => void;
}) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safePage = Math.min(Math.max(1, page || 1), safeTotalPages);
  const from = total && limit && total > 0 ? (safePage - 1) * limit + 1 : 0;
  const to = total && limit ? Math.min(total, safePage * limit) : 0;

  if (safeTotalPages <= 1 && !total) return null;

  return (
    <div className="flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div>
        {total && limit ? (
          <span>
            Hiển thị <strong className="text-slate-950">{from}</strong>–
            <strong className="text-slate-950">{to}</strong> trong{" "}
            <strong className="text-slate-950">{total}</strong> bài
          </span>
        ) : (
          <span>
            Trang <strong className="text-slate-950">{safePage}</strong> /{" "}
            <strong className="text-slate-950">{safeTotalPages}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Trước
        </Button>
        <span className="rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700">
          {safePage}/{safeTotalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= safeTotalPages}
        >
          Sau
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
