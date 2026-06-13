import { DashboardShell } from "@/components/layout/DashboardShell";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { RoleGuard } from "@/components/layout/RoleGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowed={["ADMIN"]}>
      <DashboardShell title="Quản trị IELTSBF" nav={<AdminSidebar />}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
