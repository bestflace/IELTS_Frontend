import { Card } from "@/components/common/Card";
export function TeacherGradingTable({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="font-medium">TeacherGradingTable</p>
      {children}
    </Card>
  );
}
