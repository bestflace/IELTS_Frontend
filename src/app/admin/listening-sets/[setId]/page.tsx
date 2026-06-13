"use client";

import { useParams } from "next/navigation";
import { ListeningSetDetail } from "@/components/content-bank/listening/ListeningSetDetail";

export default function AdminListeningSetDetailPage() {
  const params = useParams();
  const setId = String(params.setId);

  return <ListeningSetDetail setId={setId} />;
}
