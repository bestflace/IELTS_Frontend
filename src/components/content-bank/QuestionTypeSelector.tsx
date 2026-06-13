import { Card } from "@/components/common/Card";
export function QuestionTypeSelector({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="font-bold">QuestionTypeSelector</p>
      {children}
    </Card>
  );
}
