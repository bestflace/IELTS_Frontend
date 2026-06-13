"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw, Send } from "lucide-react";

import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/common/States";
import { BlogEditor } from "@/components/blogs/BlogEditor";
import { getAdminBlog, publishBlog, unpublishBlog } from "@/lib/api/blogs.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Blog } from "@/types";

type Props = {
  blogId: string;
};

export function BlogDetail({ blogId }: Props) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminBlog(blogId);
      setBlog(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTogglePublish = async () => {
    if (!blog) return;

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

  if (loading) {
    return <LoadingState label="Đang tải bài viết..." />;
  }

  if (error && !blog) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  if (!blog) {
    return (
      <EmptyState
        title="Không tìm thấy bài viết"
        description="Bài viết có thể đã bị xóa hoặc ID không hợp lệ."
        action={
          <Link href="/admin/blogs">
            <Button variant="outline">Quay lại danh sách bài viết</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Admin / Blog"
        title="Chỉnh sửa bài viết"
        description={blog.title}
        actions={
          <>
            <Link href="/admin/blogs">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={loadData}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>

            <Button
              onClick={handleTogglePublish}
              disabled={actionLoading}
              variant={blog.status === "PUBLISHED" ? "secondary" : "primary"}
            >
              <Send className="h-4 w-4" />
              {blog.status === "PUBLISHED" ? "Gỡ xuất bản" : "Xuất bản"}
            </Button>
          </>
        }
      />

      {error ? <ErrorState message={error} onRetry={loadData} /> : null}

      <BlogEditor mode="edit" initialData={blog} onSaved={setBlog} />
    </div>
  );
}
