import { Card } from "@/components/common/Card";
export function ReplaceSectionsDialog({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="font-bold">ReplaceSectionsDialog</p>
      {children}
    </Card>
  );
}
