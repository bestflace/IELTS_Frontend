"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  FileWarning,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import {
  getImportErrors,
  retryImportJob,
  type ImportErrorResult,
} from "@/lib/api/imports.api";

type NormalizedImportError = {
  row: string;
  sheet: string;
  field: string;
  message: string;
  value: string;
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

function normalizeErrorItem(item: unknown): NormalizedImportError {
  if (typeof item === "string") {
    return {
      row: "—",
      sheet: detectSheetFromMessage(item),
      field: "—",
      message: item,
      value: "—",
    };
  }

  if (item && typeof item === "object") {
    const data = item as Record<string, unknown>;

    return {
      row: formatValue(data.row),
      sheet: formatValue(data.sheet),
      field: formatValue(data.field),
      message:
        formatValue(data.message) !== "—"
          ? formatValue(data.message)
          : formatValue(data.raw) !== "—"
            ? formatValue(data.raw)
            : "Không rõ lỗi.",
      value: formatValue(data.value ?? data.raw),
    };
  }

  return {
    row: "—",
    sheet: "—",
    field: "—",
    message: "Không rõ lỗi.",
    value: "—",
  };
}

function detectSheetFromMessage(message: string) {
  const match = message.match(/^([a-zA-Z0-9_]+)\s+sheet/i);
  return match?.[1] || "—";
}

function getStatusText(status?: string) {
  if (status === "DONE") return "Hoàn tất";
  if (status === "ERROR") return "Có lỗi";
  if (status === "PROCESSING") return "Đang xử lý";
  return "Đang chờ";
}

function getStatusClass(status?: string) {
  if (status === "DONE") return "border-line bg-primarySoft text-moss";
  if (status === "ERROR") return "border-red-200 bg-red-50 text-red-700";
  if (status === "PROCESSING")
    return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-line bg-paper text-neutralText";
}

function getFixSuggestion(message?: string) {
  const text = String(message || "").toLowerCase();

  if (text.includes("reading_set sheet is empty")) {
    return 'File Reading phải có sheet tên chính xác là "reading_set" và sheet này cần có ít nhất 1 dòng dữ liệu với cột id, title.';
  }

  if (text.includes("listening_set sheet is empty")) {
    return 'File Listening phải có sheet tên chính xác là "listening_set" và sheet này cần có ít nhất 1 dòng dữ liệu với cột id, title.';
  }

  if (text.includes("writing_task sheet is empty")) {
    return 'File Writing phải có sheet tên chính xác là "writing_task" và sheet này cần có ít nhất 1 dòng dữ liệu với cột id, title, prompt_text.';
  }

  if (text.includes("speaking_set sheet is empty")) {
    return 'File Speaking phải có sheet tên chính xác là "speaking_set" và nên có thêm các sheet parts, prompts, items.';
  }

  if (text.includes("test sheet is empty")) {
    return 'File Test phải có sheet tên chính xác là "test" và sheet này cần có ít nhất 1 dòng dữ liệu với cột id, title, type.';
  }

  if (text.includes("requires id and title")) {
    return "Kiểm tra lại các cột bắt buộc id và title trong sheet chính. Header cột phải viết đúng chữ thường.";
  }

  if (text.includes("requires id, title, prompt_text")) {
    return "Kiểm tra lại sheet writing_task. Các cột bắt buộc là id, title, prompt_text.";
  }

  if (text.includes("invalid question_type")) {
    return "question_type không hợp lệ. Hãy dùng đúng enum như MULTIPLE_CHOICE, SHORT_ANSWER, SUMMARY_COMPLETION...";
  }

  if (text.includes("unknown part_key")) {
    return "part_key trong sheet prompts/items không khớp với part_key hoặc prompt_key đã khai báo ở sheet trước.";
  }

  return "Kiểm tra lại tên sheet, tên cột và các cột bắt buộc theo hướng dẫn mẫu file của loại import.";
}

const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export default function ImportErrorsPage() {
  const params = useParams();
  const jobId = String(params.jobId || "");

  const [result, setResult] = useState<ImportErrorResult | null>(null);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!jobId) {
      setError("Không tìm thấy mã import job.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getImportErrors(jobId);
      setResult(response);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const normalizedErrors = useMemo(() => {
    return (result?.errors || []).map(normalizeErrorItem);
  }, [result]);

  const mainErrorMessage =
    result?.errorMessage ||
    result?.error_message ||
    normalizedErrors[0]?.message ||
    "";

  const filteredErrors = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) return normalizedErrors;

    return normalizedErrors.filter((item) =>
      `${item.row} ${item.sheet} ${item.field} ${item.message} ${item.value}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [normalizedErrors, keyword]);

  const handleRetry = async () => {
    if (!jobId) return;

    setRetrying(true);
    setError("");

    try {
      await retryImportJob(jobId);

      for (let index = 0; index < 5; index += 1) {
        await sleep(1500);
        await loadData();
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải lỗi import..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Link href={`/admin/imports/${jobId}`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Quay lại chi tiết
          </Button>
        </Link>

        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </Button>

        <Button onClick={handleRetry} disabled={retrying}>
          <RotateCcw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Đang xử lý lại..." : "Xử lý lại"}
        </Button>
      </div>

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <section className="overflow-hidden rounded-[32px] border border-line bg-surface shadow-sm">
        <div className="grid gap-6 p-7 lg:grid-cols-[1fr_320px] lg:p-9">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.24em] text-sage">
              Kiểm tra file import
            </p>

            <h1 className="mt-3 break-all font-serif text-4xl font-bold leading-tight text-ink md:text-5xl">
              Lỗi import
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-8 text-neutralText">
              Kiểm tra lỗi do worker trả về. Phần quan trọng nhất là tên sheet,
              header cột và dữ liệu bắt buộc trong file Excel.
            </p>
          </div>

          <div className="rounded-[28px] border border-line bg-paper p-5">
            <FileWarning className="h-6 w-6 text-moss" />

            <p className="mt-4 text-xs font-bold uppercase tracking-[.18em] text-neutralText">
              Tổng lỗi
            </p>

            <p className="mt-2 font-serif text-4xl font-bold text-ink">
              {normalizedErrors.length || (mainErrorMessage ? 1 : 0)}
            </p>

            <span
              className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(
                result?.status,
              )}`}
            >
              {getStatusText(result?.status)}
            </span>
          </div>
        </div>
      </section>

      {mainErrorMessage ? (
        <Card className="rounded-[28px] border border-red-200 bg-red-50">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 text-red-700" />
              <div>
                <h2 className="font-serif text-2xl font-bold text-red-800">
                  Thông báo lỗi tổng
                </h2>
                <p className="mt-2 text-sm leading-7 text-red-700">
                  {mainErrorMessage}
                </p>

                <div className="mt-4 rounded-2xl border border-red-200 bg-white/60 p-4">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-red-700">
                    Gợi ý sửa
                  </p>
                  <p className="mt-2 text-sm leading-7 text-red-800">
                    {getFixSuggestion(mainErrorMessage)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-[28px] border border-line bg-surface">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-sage">
                Error rows
              </p>

              <h2 className="mt-1 font-serif text-2xl font-bold text-ink">
                Danh sách lỗi
              </h2>

              <p className="mt-4 max-w-3xl text-base leading-8 text-neutralText">
                Kiểm tra các lỗi trong file import. Hãy chú ý tên sheet, tên cột
                và những dữ liệu bắt buộc trong file Excel.
              </p>
            </div>

            <div className="relative w-full lg:w-[420px]">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutralText" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="pl-9"
                placeholder="Tìm lỗi import..."
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredErrors.length ? (
            <div className="overflow-hidden rounded-2xl border border-line">
              <table className="w-full min-w-[920px] border-collapse bg-surface text-sm">
                <thead className="bg-cream/70 text-left">
                  <tr className="border-b border-line">
                    <th className="px-4 py-3 font-semibold text-ink">Dòng</th>
                    <th className="px-4 py-3 font-semibold text-ink">Sheet</th>
                    <th className="px-4 py-3 font-semibold text-ink">Field</th>
                    <th className="px-4 py-3 font-semibold text-ink">
                      Nội dung lỗi
                    </th>
                    <th className="px-4 py-3 font-semibold text-ink">
                      Giá trị
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredErrors.map((item, index) => (
                    <tr
                      key={`${item.sheet}-${item.field}-${item.row}-${index}`}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-4 py-4 align-top font-semibold text-ink">
                        {item.row}
                      </td>

                      <td className="px-4 py-4 align-top text-neutralText">
                        {item.sheet}
                      </td>

                      <td className="px-4 py-4 align-top text-neutralText">
                        {item.field}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="max-w-[420px] text-sm leading-6 text-red-700">
                          {item.message}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <code className="block max-w-[280px] truncate rounded-lg bg-paper px-2 py-1 text-xs text-ink">
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
              title="Không có lỗi chi tiết"
              description="Worker chưa trả về danh sách lỗi theo dòng. Hãy xem phần thông báo lỗi tổng phía trên."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
