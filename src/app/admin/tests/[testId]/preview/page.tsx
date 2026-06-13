import { AdminLearnerPreview } from "@/components/tests/AdminLearnerPreview";

type PageProps = {
  params: {
    testId: string;
  };
};

export default function AdminTestPreviewPage({ params }: PageProps) {
  return <AdminLearnerPreview testId={params.testId} />;
}
