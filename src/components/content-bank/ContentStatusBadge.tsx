import { Card } from "@/components/common/Card";
export function ContentStatusBadge({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="font-bold">ContentStatusBadge</p>
      {children}
    </Card>
  );
}
