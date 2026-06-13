"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { EmptyState } from "@/components/common/States";
import type { ImportErrorItem } from "@/lib/api/imports.api";

type NormalizedImportError = {
  row: string;
  sheet: string;
  field: string;
  message: string;
  value: string;
};

type Props = {
  errors?: ImportErrorItem[];
};

function formatValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "—";

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

function detectSheetFromMessage(message: string) {
  const match = message.match(/^([a-zA-Z0-9_]+)\s+sheet/i);
  return match?.[1] || "—";
}

function normalizeErrorItem(item: ImportErrorItem): NormalizedImportError {
  if (typeof item === "string") {
    return {
      row: "—",
      sheet: detectSheetFromMessage(item),
      field: "—",
      message: item,
      value: "—",
    };
  }

  return {
    row: formatValue(item.row),
    sheet: formatValue(item.sheet),
    field: formatValue(item.field),
    message:
      formatValue(item.message) !== "—"
        ? formatValue(item.message)
        : formatValue(item.raw) !== "—"
          ? formatValue(item.raw)
          : "Không rõ lỗi.",
    value: formatValue(item.value ?? item.raw),
  };
}

export function ImportErrorTable({ errors = [] }: Props) {
  const [keyword, setKeyword] = useState("");

  const normalizedErrors = useMemo(
    () => errors.map(normalizeErrorItem),
    [errors],
  );

  const filteredErrors = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) return normalizedErrors;

    return normalizedErrors.filter((item) =>
      `${item.row} ${item.sheet} ${item.field} ${item.message} ${item.value}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [normalizedErrors, keyword]);

  return (
    <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Chi tiết lỗi
            </p>

            <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
              Danh sách lỗi trong file
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Bảng này giúp bạn biết file đang sai ở sheet nào, cột nào hoặc
              phần dữ liệu nào cần chỉnh lại trước khi import lại.
            </p>
          </div>

          <div className="relative w-full lg:w-[420px]">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="pl-9"
              placeholder="Tìm theo sheet, cột hoặc nội dung lỗi..."
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredErrors.length ? (
          <div className="overflow-hidden rounded-2xl border border-cyan-100">
            <table className="w-full min-w-[920px] border-collapse bg-white/80 text-sm">
              <thead className="bg-cyan-50/70 text-left">
                <tr className="border-b border-cyan-100">
                  <th className="px-4 py-3 font-semibold text-slate-950">
                    Dòng
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-950">
                    Sheet
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-950">
                    Cột
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-950">
                    Nội dung lỗi
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-950">
                    Giá trị
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredErrors.map((item, index) => (
                  <tr
                    key={`${item.sheet}-${item.field}-${item.row}-${index}`}
                    className="border-b border-cyan-100 last:border-b-0"
                  >
                    <td className="px-4 py-4 align-top font-semibold text-slate-950">
                      {item.row}
                    </td>

                    <td className="px-4 py-4 align-top text-slate-500">
                      {item.sheet}
                    </td>

                    <td className="px-4 py-4 align-top text-slate-500">
                      {item.field}
                    </td>

                    <td className="px-4 py-4 align-top">
                      <p className="max-w-[420px] text-sm leading-6 text-red-700">
                        {item.message}
                      </p>
                    </td>

                    <td className="px-4 py-4 align-top">
                      <code className="block max-w-[280px] truncate rounded-lg bg-cyan-50/70 px-2 py-1 text-xs text-slate-950">
                        {item.value}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="Chưa có lỗi chi tiết"
            description="File chỉ có lỗi tổng phía trên. Hãy đọc phần gợi ý sửa để chỉnh lại file Excel rồi import lại."
          />
        )}
      </CardContent>
    </Card>
  );
}
