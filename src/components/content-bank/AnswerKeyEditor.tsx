import { Card } from "@/components/common/Card";
export function AnswerKeyEditor({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="font-bold">AnswerKeyEditor</p>
      {children}
    </Card>
  );
}
