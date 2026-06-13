import { Card } from "@/components/common/Card";
export function CreateImportJobForm({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="font-bold">CreateImportJobForm</p>
      {children}
    </Card>
  );
}
