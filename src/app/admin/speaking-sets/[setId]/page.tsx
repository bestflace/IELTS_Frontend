"use client";

import { useParams } from "next/navigation";
import { SpeakingSetDetail } from "@/components/content-bank/speaking/SpeakingSetDetail";

export default function AdminSpeakingSetDetailPage() {
  const params = useParams();
  const setId = String(params.setId);

  return <SpeakingSetDetail setId={setId} />;
}
