import { Card } from "@/components/common/Card";
export function TestCard({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="font-bold">TestCard</p>
      {children}
    </Card>
  );
}
