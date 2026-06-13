import { Card } from "@/components/common/Card";
export function TagSelector({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="font-bold">TagSelector</p>
      {children}
    </Card>
  );
}
