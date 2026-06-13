"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  Eye,
  FilePenLine,
  Headphones,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { getErrorMessage } from "@/lib/api/client";
import { getTeacherSubmissions } from "@/lib/api/teacher.api";
import { SubmissionStatusBadge } from "@/components/teacher/SubmissionStatusBadge";

type SkillFilter = "" | "WRITING" | "SPEAKING";
type StatusFilter = "" | "PENDING" | "CLAIMED" | "REVIEWED";

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

type SubmissionRow = {
  id: string;
  skill?: string;
  status?: string;
  attemptId?: string;
  attempt_id?: string;
  submittedAt?: string | null;
  submitted_at?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
  reviewedAt?: string | null;
  reviewed_at?: string | null;
  studentName?: string;
  testTitle?: string;
  student?: {
    fullName?: string | null;
    full_name?: string | null;
    email?: string | null;
  } | null;
  user?: {
    fullName?: string | null;
    full_name?: string | null;
    email?: string | null;
  } | null;
  test?: {
    title?: string | null;
    type?: string | null;
  } | null;
  attempt?: {
    id?: string;
    test?: {
      title?: string | null;
      type?: string | null;
    } | null;
    user?: {
      fullName?: string | null;
      full_name?: string | null;
      email?: string | null;
    } | null;
  } | null;
  review?: {
    overallBand?: number | string | null;
    overall_band?: number | string | null;
    reviewedBy?: {
      fullName?: string | null;
      email?: string | null;
    } | null;
  } | null;
};

function extractItems(response: any): SubmissionRow[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  return [];
}

function getStudentName(item: SubmissionRow) {
  return (
    item.studentName ||
    item.student?.fullName ||
    item.student?.full_name ||
    item.student?.email ||
    item.user?.fullName ||
    item.user?.full_name ||
    item.user?.email ||
    item.attempt?.user?.fullName ||
    item.attempt?.user?.full_name ||
    item.attempt?.user?.email ||
    "Học viên"
  );
}

function getTestTitle(item: SubmissionRow) {
  return (
    item.testTitle ||
    item.test?.title ||
    item.attempt?.test?.title ||
    "Bài làm IELTS"
  );
}

function getAttemptId(item: SubmissionRow) {
  return item.attemptId || item.attempt_id || item.attempt?.id || "";
}

function getSkillText(skill?: string) {
  if (skill === "WRITING") return "Writing";
  if (skill === "SPEAKING") return "Speaking";
  return "Bài làm";
}

function getSkillIcon(skill?: string) {
  if (skill === "SPEAKING") return Headphones;
  return FilePenLine;
}

function getOverallBand(item: SubmissionRow) {
  const value = item.review?.overallBand ?? item.review?.overall_band;
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) return "—";

  return number.toFixed(1);
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminSubmissionsPage() {
  const [items, setItems] = useState<SubmissionRow[]>([]);
  const [keyword, setKeyword] = useState("");
  const [skill, setSkill] = useState<SkillFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getTeacherSubmissions({
        limit: 100,
        skill: skill || undefined,
        status: status || undefined,
      });

      setItems(extractItems(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [skill, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return items.filter((item) => {
      if (!normalized) return true;

      return `${getStudentName(item)} ${getTestTitle(item)} ${getAttemptId(item)} ${item.skill || ""}`
        .toLowerCase()
        .includes(normalized);
    });
  }, [items, keyword]);

  useEffect(() => {
    setPage(1);
  }, [keyword, skill, status, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  const stats = useMemo(() => {
    return {
      total: items.length,
      writing: items.filter((item) => item.skill === "WRITING").length,
      speaking: items.filter((item) => item.skill === "SPEAKING").length,
      reviewed: items.filter((item) => item.status === "REVIEWED").length,
    };
  }, [items]);

  if (loading) {
    return <LoadingState label="Đang tải danh sách bài làm..." />;
  }

  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Submissions"
        title="Bài làm học viên"
        description="Xem các bài Writing/Speaking đã nộp, trạng thái chấm và trao đổi dưới từng bài làm."
        actions={
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Tổng bài làm
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.total}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Writing
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.writing}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Speaking
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.speaking}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-5">
            <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
              Đã chấm
            </p>
            <p className="mt-2 font-serif text-3xl font-black text-slate-950">
              {stats.reviewed}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Submission manager
              </p>
              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                Danh sách bài làm
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Admin có thể mở bài làm để xem nội dung, điểm chấm và phần bình
                luận.
              </p>
            </div>

            <div className="grid w-full gap-3 xl:w-[960px] xl:grid-cols-[1fr_180px_180px_150px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  className="pl-9"
                  placeholder="Tìm theo học viên, bài thi hoặc mã attempt..."
                />
              </div>

              <select
                value={skill}
                onChange={(event) =>
                  setSkill(event.target.value as SkillFilter)
                }
                className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                <option value="">Tất cả kỹ năng</option>
                <option value="WRITING">Writing</option>
                <option value="SPEAKING">Speaking</option>
              </select>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as StatusFilter)
                }
                className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ chấm</option>
                <option value="CLAIMED">Đang giữ</option>
                <option value="REVIEWED">Đã chấm</option>
              </select>

              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(Number(event.target.value) as typeof pageSize)
                }
                className="h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} / trang
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredItems.length ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-cyan-100">
                <table className="w-full min-w-[980px] border-collapse bg-white/80 text-sm">
                  <thead className="bg-cyan-50/70 text-left">
                    <tr className="border-b border-cyan-100">
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Bài làm
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Học viên
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Kỹ năng
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Band
                      </th>
                      <th className="px-4 py-3 font-semibold text-slate-950">
                        Thời gian
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-950">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedItems.map((item) => {
                      const Icon = getSkillIcon(item.skill);
                      const submittedAt =
                        item.submittedAt ||
                        item.submitted_at ||
                        item.createdAt ||
                        item.created_at ||
                        null;

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-cyan-100 last:border-b-0"
                        >
                          <td className="px-4 py-4 align-top">
                            <p className="font-semibold text-slate-950">
                              {getTestTitle(item)}
                            </p>
                            {getAttemptId(item) ? (
                              <p className="mt-1 text-xs text-slate-500">
                                Attempt: {getAttemptId(item)}
                              </p>
                            ) : null}
                          </td>

                          <td className="px-4 py-4 align-top text-slate-950">
                            {getStudentName(item)}
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/70 px-3 py-1 text-xs font-semibold text-cyan-700">
                              <Icon className="h-3.5 w-3.5" />
                              {getSkillText(item.skill)}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <SubmissionStatusBadge status={item.status} />
                          </td>

                          <td className="px-4 py-4 align-top font-semibold text-slate-950">
                            {getOverallBand(item)}
                          </td>

                          <td className="px-4 py-4 align-top text-slate-500">
                            {formatDate(submittedAt)}
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex justify-end">
                              <Link href={`/admin/submissions/${item.id}`}>
                                <Button size="sm">
                                  <Eye className="h-4 w-4" />
                                  Xem bài làm
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-[26px] border border-cyan-100 bg-white/80 px-4 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  Hiển thị{" "}
                  <strong className="text-slate-950">
                    {(safePage - 1) * pageSize + 1}
                  </strong>
                  –
                  <strong className="text-slate-950">
                    {Math.min(filteredItems.length, safePage * pageSize)}
                  </strong>{" "}
                  trong{" "}
                  <strong className="text-slate-950">
                    {filteredItems.length}
                  </strong>{" "}
                  bài làm
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>

                  <span className="rounded-2xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-black text-cyan-700">
                    {safePage}/{totalPages}
                  </span>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage >= totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="Chưa có bài làm phù hợp"
              description="Không tìm thấy bài làm nào theo bộ lọc hiện tại."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
