"use client";

import { PublicDetailPage } from "@/features/screens/PublicDetailPage";
import { getPublicReadingDetail } from "@/lib/api/reading.api";

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  return (
    <PublicDetailPage
      kind="reading"
      id={id}
      backHref="/reading-sets"
      query={() => getPublicReadingDetail(id)}
    />
  );
}
