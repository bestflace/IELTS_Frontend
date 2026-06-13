import { Card } from "@/components/common/Card";
export function RerollSectionButton({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <p className="font-bold">RerollSectionButton</p>
      {children}
    </Card>
  );
}
