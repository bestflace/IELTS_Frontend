"use client";

import { PublicCatalogPage } from "@/features/screens/PublicCatalogPage";
import { getPublicReadingList } from "@/lib/api/reading.api";

export default function ReadingSetsPage() {
  return (
    <PublicCatalogPage
      kind="reading"
      title="Thư viện luyện Reading"
      description="Khám phá các bài đọc học thuật đã được xuất bản, luyện kỹ năng đọc hiểu và làm quen với nhiều dạng câu hỏi IELTS Reading."
      query={() => getPublicReadingList()}
      basePath="/reading-sets"
    />
  );
}
