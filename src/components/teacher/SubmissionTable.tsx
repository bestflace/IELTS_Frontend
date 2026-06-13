"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FilePenLine,
  Headphones,
  PenLine,
  RefreshCw,
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
import { getTeacherSubmissions } from "@/lib/api/teacher.api";
import type { TeacherSubmission } from "@/types";
import { SubmissionStatusBadge } from "@/components/teacher/SubmissionStatusBadge";

type SkillFilter = "" | "WRITING" | "SPEAKING";
type StatusFilter = "" | "PENDING" | "CLAIMED" | "REVIEWED";

type PersonSummary = {
  fullName?: string | null;
  full_name?: string | null;
  email?: string | null;
};

type SubmissionRow = TeacherSubmission & {
  studentName?: string;
  testTitle?: string;
  student?: PersonSummary | null;
};

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const;

function getPersonName(person?: PersonSummary | null) {
  return person?.fullName?.trim() || person?.full_name?.trim() || "-";
}

function getPersonSearchText(person?: PersonSummary | null) {
  return [person?.fullName, person?.full_name, person?.email]
    .filter(Boolean)
    .join(" ");
}
function getLearner(item: SubmissionRow): PersonSummary | null {
  return item.learner ?? item.student ?? null;
}
function getGrader(item: SubmissionRow): PersonSummary | null {
  if (item.status === "REVIEWED") {
    return item.review?.reviewedBy ?? item.claimedTeacher ?? null;
  }

  if (item.status === "CLAIMED") {
    return item.claimedTeacher ?? null;
  }

  return null;
}

function getTestTitle(item: SubmissionRow) {
  return item.testTitle || item.test?.title || "Bài làm IELTS";
}

function getSkillText(skill?: string) {
  if (skill === "WRITING") return "Writing";
  if (skill === "SPEAKING") return "Speaking";
  return "Bài làm";
}

function getSkillIcon(skill?: string) {
  if (skill === "SPEAKING") return Headphones;
  return PenLine;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getReviewHref(item: SubmissionRow) {
  if (item.skill === "SPEAKING") {
    return `/teacher/submissions/${item.id}/speaking-review`;
  }

  return `/teacher/submissions/${item.id}/writing-review`;
}

const selectClassName =
  "h-11 w-full rounded-2xl border border-cyan-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none shadow-sm transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100/80";

export function SubmissionTable() {
  const [items, setItems] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [skill, setSkill] = useState<SkillFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(10);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getTeacherSubmissions({
        skill: skill || undefined,
        status: status || undefined,
        search: keyword.trim() || undefined,
        limit: 100,
      });

      setItems((response.data || []) as SubmissionRow[]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [keyword, skill, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [keyword, skill, status, pageSize]);

  const filteredItems = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();

    return items.filter((item) => {
      const learner = getLearner(item);
      const grader = getGrader(item);

      const searchableText = [
        getPersonSearchText(learner),
        getPersonSearchText(grader),
        getTestTitle(item),
        item.skill || "",
        item.status || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesKeyword = normalized
        ? searchableText.includes(normalized)
        : true;

      const matchesSkill = skill ? item.skill === skill : true;

      const matchesStatus = status ? item.status === status : true;

      return matchesKeyword && matchesSkill && matchesStatus;
    });
  }, [items, keyword, skill, status]);

  const counts = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status === "PENDING").length,
      claimed: items.filter((item) => item.status === "CLAIMED").length,
      reviewed: items.filter((item) => item.status === "REVIEWED").length,
    };
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedItems = filteredItems.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
  }

  if (loading) {
    return <LoadingState label="Đang tải danh sách bài cần chấm..." />;
  }

  if (error && !items.length) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-5">
      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Tổng bài làm", value: counts.total },
          { label: "Chờ chấm", value: counts.pending },
          { label: "Đang giữ", value: counts.claimed },
          { label: "Đã chấm", value: counts.reviewed },
        ].map((card) => (
          <Card
            key={card.label}
            className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/80 shadow-[0_18px_60px_rgba(14,165,233,0.10)] backdrop-blur-2xl"
          >
            <CardContent className="p-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl"
              />
              <p className="relative text-xs font-black uppercase tracking-[.18em] text-slate-400">
                {card.label}
              </p>
              <p className="relative mt-2 font-serif text-4xl font-black text-slate-950">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <CardHeader className="bg-gradient-to-r from-white/80 via-cyan-50/60 to-blue-50/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Danh sách chấm bài
              </p>
              <h2 className="mt-1 font-serif text-3xl font-black text-slate-950">
                Danh sách bài làm
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Chọn bài Writing hoặc Speaking để xem nội dung, nhập điểm và gửi
                nhận xét cho học viên.
              </p>
            </div>

            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px_220px_150px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-cyan-600" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="pl-9"
                placeholder="Tìm theo học viên hoặc tên bài..."
              />
            </div>

            <select
              value={skill}
              onChange={(event) => setSkill(event.target.value as SkillFilter)}
              className={selectClassName}
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
              className={selectClassName}
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
              className={selectClassName}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / trang
                </option>
              ))}
            </select>
          </div>

          {filteredItems.length ? (
            <>
              <div className="overflow-x-auto rounded-[28px] border border-cyan-100 bg-white/75 shadow-sm backdrop-blur-xl">
                <table className="w-full min-w-[1080px] border-collapse text-sm">
                  <thead className="bg-cyan-50/80 text-left">
                    <tr className="border-b border-cyan-100">
                      {[
                        "Bài làm",
                        "Học viên",
                        "Kỹ năng",
                        "Trạng thái",
                        "Người chấm",
                        "Thời gian chấm",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-4 text-xs font-black uppercase tracking-[0.14em] text-slate-500"
                        >
                          {header}
                        </th>
                      ))}

                      <th className="px-4 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-cyan-100">
                    {paginatedItems.map((item) => {
                      const SkillIcon = getSkillIcon(item.skill);
                      const learner = getLearner(item);
                      const grader = getGrader(item);

                      const reviewTime = item.reviewedAt
                        ? formatDate(item.reviewedAt)
                        : item.status === "REVIEWED"
                          ? "-"
                          : "Chưa chấm";

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-cyan-50/55"
                        >
                          <td className="px-4 py-4 align-top">
                            <p className="font-black text-slate-950">
                              {getTestTitle(item)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              Bài làm cần giáo viên nhận xét
                            </p>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className="font-semibold text-slate-950">
                              {getPersonName(learner)}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                              <SkillIcon className="h-3.5 w-3.5" />
                              {getSkillText(item.skill)}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top">
                            <SubmissionStatusBadge status={item.status} />
                          </td>

                          <td className="px-4 py-4 align-top">
                            <span
                              className={
                                grader
                                  ? "font-semibold text-slate-950"
                                  : "text-slate-500"
                              }
                            >
                              {grader ? getPersonName(grader) : "-"}
                            </span>
                          </td>

                          <td className="px-4 py-4 align-top text-slate-500">
                            {reviewTime}
                          </td>

                          <td className="px-4 py-4 align-top">
                            <div className="flex justify-center gap-2">
                              <Link href={`/teacher/submissions/${item.id}`}>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-4 w-4" />
                                  Chi tiết
                                </Button>
                              </Link>

                              <Link href={getReviewHref(item)}>
                                <Button
                                  size="sm"
                                  variant={
                                    item.status === "REVIEWED"
                                      ? "outline"
                                      : "primary"
                                  }
                                >
                                  <FilePenLine className="h-4 w-4" />
                                  {item.status === "REVIEWED"
                                    ? "Xem chấm"
                                    : "Chấm bài"}
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
                  bài
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
              description="Thử đổi bộ lọc hoặc làm mới danh sách để kiểm tra bài mới."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
