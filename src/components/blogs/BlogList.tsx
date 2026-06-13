"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  MoreVertical,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ConfirmDialog } from "@/components/common/Modal";
import { Input } from "@/components/common/Input";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { BlogStatusBadge } from "@/components/blogs/BlogStatusBadge";
import {
  deleteBlog,
  getAdminBlogs,
  publishBlog,
  unpublishBlog,
} from "@/lib/api/blogs.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Blog, PublishStatus } from "@/types";

const statusTabs: Array<{ label: string; value: "" | PublishStatus }> = [
  { label: "Tất cả", value: "" },
  { label: "Đã xuất bản", value: "PUBLISHED" },
  { label: "Bản nháp", value: "DRAFT" },
  { label: "Lưu trữ", value: "ARCHIVED" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getAuthorName(blog: Blog) {
  const author = (blog as any).author || (blog as any).createdBy || null;
  return author?.fullName || author?.name || author?.email || "Admin";
}

export function BlogList() {
  const [items, setItems] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState("");
  const [activeStatus, setActiveStatus] = useState<"" | PublishStatus>("");
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getAdminBlogs({
        search: keyword.trim() || undefined,
        status: activeStatus || undefined,
        limit: 50,
      });

      setItems(res.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [keyword, activeStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const counts = useMemo(() => {
    return {
      all: items.length,
      published: items.filter((item) => item.status === "PUBLISHED").length,
      draft: items.filter((item) => item.status === "DRAFT").length,
      archived: items.filter((item) => item.status === "ARCHIVED").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return items.filter((item) => {
      const matchStatus = activeStatus ? item.status === activeStatus : true;
      const matchKeyword = normalizedKeyword
        ? `${item.title} ${item.excerpt || ""} ${item.contentMarkdown || ""}`
            .toLowerCase()
            .includes(normalizedKeyword)
        : true;

      return matchStatus && matchKeyword;
    });
  }, [items, activeStatus, keyword]);

  const handlePublish = async (blog: Blog) => {
    setActionLoading(true);
    setError("");

    try {
      if (blog.status === "PUBLISHED") {
        await unpublishBlog(blog.id);
      } else {
        await publishBlog(blog.id);
      }

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setActionLoading(true);
    setError("");

    try {
      await deleteBlog(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingState label="Đang tải danh sách bài viết..." />;
  }

  if (error && !items.length) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-5">
      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-sage">
                Blog manager
              </p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-ink">
                Danh sách bài viết
              </h2>
              <p className="mt-1 text-sm text-neutralText">
                Lọc, chỉnh sửa, xuất bản hoặc xóa bài viết tại đây.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={loadData}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-5 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2 rounded-2xl border border-line bg-paper p-2">
              {statusTabs.map((tab) => {
                const active = activeStatus === tab.value;

                const count =
                  tab.value === ""
                    ? counts.all
                    : tab.value === "PUBLISHED"
                      ? counts.published
                      : tab.value === "DRAFT"
                        ? counts.draft
                        : counts.archived;

                return (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveStatus(tab.value)}
                    className={
                      active
                        ? "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
                        : "rounded-xl px-4 py-2 text-sm font-medium text-ink transition hover:bg-cream"
                    }
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative max-w-xl">
              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-neutralText" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="pl-9"
                placeholder="Tìm kiếm tiêu đề, mô tả, nội dung..."
              />
            </div>
          </div>

          {filteredItems.length ? (
            <div className="overflow-hidden rounded-2xl border border-line">
              <table className="w-full min-w-[1000px] border-collapse bg-surface text-sm">
                <thead className="bg-cream/70 text-left">
                  <tr className="border-b border-line">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-line"
                      />
                    </th>
                    <th className="px-4 py-3 font-semibold text-ink">
                      Tiêu đề bài viết
                    </th>
                    <th className="px-4 py-3 font-semibold text-ink">
                      Tác giả
                    </th>
                    <th className="px-4 py-3 font-semibold text-ink">
                      Chuyên mục / Thẻ
                    </th>
                    <th className="px-4 py-3 font-semibold text-ink">
                      Ngày xuất bản
                    </th>
                    <th className="px-4 py-3 font-semibold text-ink">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-ink">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((blog) => (
                    <tr
                      key={blog.id}
                      className="border-b border-line last:border-b-0"
                    >
                      <td className="px-4 py-4 align-top">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-line"
                        />
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="max-w-xs truncate font-semibold text-ink">
                          {blog.title}
                        </p>
                        {blog.excerpt ? (
                          <p className="mt-1 line-clamp-2 max-w-md text-xs leading-5 text-neutralText">
                            {blog.excerpt}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-primarySoft text-xs font-bold text-moss">
                            {getAuthorName(blog).slice(0, 1).toUpperCase()}
                          </div>
                          <span className="text-sm text-ink">
                            {getAuthorName(blog)}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        {blog.tags?.length ? (
                          <div className="flex max-w-[260px] flex-wrap gap-1.5">
                            {blog.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag.id} tone="sage">
                                {tag.name}
                              </Badge>
                            ))}
                            {blog.tags.length > 3 ? (
                              <span className="text-xs text-neutralText">
                                +{blog.tags.length - 3}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs text-neutralText">
                            Chưa có thẻ
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 align-top text-sm text-ink">
                        {blog.status === "PUBLISHED"
                          ? formatDate(
                              blog.publishedAt ||
                                blog.updatedAt ||
                                blog.createdAt,
                            )
                          : "—"}
                      </td>

                      <td className="px-4 py-4 align-top">
                        <BlogStatusBadge status={blog.status} />
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/blogs/${blog.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit3 className="h-4 w-4" />
                              Sửa
                            </Button>
                          </Link>

                          {blog.slug && blog.status === "PUBLISHED" ? (
                            <Link href={`/blogs/${blog.slug}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          ) : null}

                          <Button
                            size="sm"
                            variant={
                              blog.status === "PUBLISHED"
                                ? "secondary"
                                : "outline"
                            }
                            onClick={() => handlePublish(blog)}
                            disabled={actionLoading}
                          >
                            <Send className="h-4 w-4" />
                            {blog.status === "PUBLISHED" ? "Gỡ" : "Publish"}
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setDeleteTarget(blog)}
                            disabled={
                              actionLoading || blog.status === "PUBLISHED"
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <Button size="sm" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Chưa có bài viết"
              description="Tạo bài viết đầu tiên để bắt đầu xây dựng nội dung blog IELTS."
              action={
                <Link href="/admin/blogs/new">
                  <Button>Tạo bài viết mới</Button>
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xóa bài viết?"
        description="Bài viết này sẽ bị xóa khỏi hệ thống. Nếu chỉ muốn ẩn khỏi public, hãy gỡ xuất bản thay vì xóa."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
