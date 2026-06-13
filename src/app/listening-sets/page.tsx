"use client";

import { PublicCatalogPage } from "@/features/screens/PublicCatalogPage";
import { getPublicListeningList } from "@/lib/api/listening.api";

export default function ListeningSetsPage() {
  return (
    <PublicCatalogPage
      kind="listening"
      title="Thư viện luyện Listening"
      description="Luyện nghe với các bộ audio đã được xuất bản, kết hợp transcript và câu hỏi theo cấu trúc của bài thi IELTS Listening."
      query={() => getPublicListeningList()}
      basePath="/listening-sets"
    />
  );
}
