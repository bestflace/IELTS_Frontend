import { TestPreview } from "@/components/tests/TestPreview";

export default function Page({ params }: { params: { testId: string } }) {
  return <TestPreview testId={params.testId} />;
}
