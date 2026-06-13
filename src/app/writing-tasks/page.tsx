"use client";

import { PublicCatalogPage } from "@/features/screens/PublicCatalogPage";
import { getPublicWritingList } from "@/lib/api/writing.api";

export default function WritingTasksPage() {
  return (
    <PublicCatalogPage
      kind="writing"
      title="Thư viện luyện Writing"
      description="Chọn đề Writing Task 1 hoặc Task 2 phù hợp để luyện cách triển khai ý tưởng, từ vựng và cấu trúc bài viết theo tiêu chí IELTS."
      query={() => getPublicWritingList()}
      basePath="/writing-tasks"
    />
  );
}
