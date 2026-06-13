"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/common/Button";
import { BlogEditor } from "@/components/blogs/BlogEditor";

export default function AdminNewBlogPage() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <Link href="/admin/blogs">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <BlogEditor mode="create" />
    </div>
  );
}
