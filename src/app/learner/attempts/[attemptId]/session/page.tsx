"use client";

import { AttemptSessionPage } from "@/features/attempts/AttemptSessionPage";

export default function Page({
  params,
}: {
  params: {
    attemptId: string;
  };
}) {
  return <AttemptSessionPage attemptId={params.attemptId} />;
}
