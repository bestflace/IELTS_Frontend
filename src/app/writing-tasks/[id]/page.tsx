"use client";

import { PublicDetailPage } from "@/features/screens/PublicDetailPage";
import { getPublicWritingDetail } from "@/lib/api/writing.api";

export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;

  return (
    <PublicDetailPage
      kind="writing"
      id={id}
      backHref="/writing-tasks"
      query={() => getPublicWritingDetail(id)}
    />
  );
}
