import { Card } from "@/components/common/Card";
export function TestTable({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="font-bold">TestTable</p>
      {children}
    </Card>
  );
}
