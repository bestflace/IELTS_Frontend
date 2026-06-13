"use client";

import { useParams } from "next/navigation";
import { TestSectionManager } from "@/components/tests/TestSectionManager";

export default function AdminTestSectionsPage() {
  const params = useParams();
  const testId = String(params.testId);

  return <TestSectionManager testId={testId} />;
}
