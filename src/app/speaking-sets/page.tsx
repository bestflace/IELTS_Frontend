"use client";

import { PublicCatalogPage } from "@/features/screens/PublicCatalogPage";
import { getPublicSpeakingList } from "@/lib/api/speaking.api";

export default function SpeakingSetsPage() {
  return (
    <PublicCatalogPage
      kind="speaking"
      title="Thư viện luyện Speaking"
      description="Luyện nói theo chủ đề với bộ câu hỏi Speaking Part 1–3, giúp cải thiện độ trôi chảy, khả năng phát triển ý và sự tự tin."
      query={() => getPublicSpeakingList()}
      basePath="/speaking-sets"
    />
  );
}
