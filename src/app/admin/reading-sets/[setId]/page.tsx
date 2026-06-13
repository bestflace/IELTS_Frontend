"use client";

import { useParams } from "next/navigation";
import { ReadingSetDetail } from "@/components/content-bank/reading/ReadingSetDetail";

export default function AdminReadingSetDetailPage() {
  const params = useParams();
  const setId = String(params.setId);

  return <ReadingSetDetail setId={setId} />;
}
