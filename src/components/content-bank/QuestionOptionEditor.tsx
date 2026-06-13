import { Card } from "@/components/common/Card";
export function QuestionOptionEditor({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="font-bold">QuestionOptionEditor</p>
      {children}
    </Card>
  );
}
