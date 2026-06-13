import { Card } from "@/components/common/Card";
export function PublishTestActions({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="font-bold">PublishTestActions</p>
      {children}
    </Card>
  );
}
