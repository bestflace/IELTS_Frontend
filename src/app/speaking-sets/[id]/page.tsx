"use client";

import { PublicDetailPage } from "@/features/screens/PublicDetailPage";
import { getPublicSpeakingDetail } from "@/lib/api/speaking.api";

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  return (
    <PublicDetailPage
      kind="speaking"
      id={id}
      backHref="/speaking-sets"
      query={() => getPublicSpeakingDetail(id)}
    />
  );
}
