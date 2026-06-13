import { Card } from "@/components/common/Card";
export function TestFilterBar({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="font-bold">TestFilterBar</p>
      {children}
    </Card>
  );
}
