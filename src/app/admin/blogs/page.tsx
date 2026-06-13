"use client";

import Link from "next/link";
import { PenSquare } from "lucide-react";

import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { BlogList } from "@/components/blogs/BlogList";

export default function AdminBlogsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Admin / Blog"
        title="Quản lý bài viết"
        description="Quản lý nội dung blog, tin tức và chia sẻ kiến thức IELTS."
        actions={
          <Link href="/admin/blogs/new">
            <Button>
              <PenSquare className="h-4 w-4" />
              Tạo bài viết mới
            </Button>
          </Link>
        }
      />

      <BlogList />
    </div>
  );
}
