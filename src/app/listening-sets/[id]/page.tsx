"use client";

import { PublicDetailPage } from "@/features/screens/PublicDetailPage";
import { getPublicListeningDetail } from "@/lib/api/listening.api";

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  return (
    <PublicDetailPage
      kind="listening"
      id={id}
      backHref="/listening-sets"
      query={() => getPublicListeningDetail(id)}
    />
  );
}
