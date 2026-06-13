import { Card } from "@/components/common/Card";
export function PublishActions({ children }: { children?: React.ReactNode }) {
  return (
    <Card className="p-4">
      <p className="font-bold">PublishActions</p>
      {children}
    </Card>
  );
}
