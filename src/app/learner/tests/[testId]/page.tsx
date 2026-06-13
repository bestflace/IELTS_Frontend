import { LearnerTestDetailPage } from "@/features/screens/LearnerTestDetailPage";

export default function Page({
  params,
}: {
  params: {
    testId: string;
  };
}) {
  return <LearnerTestDetailPage testId={params.testId} />;
}
