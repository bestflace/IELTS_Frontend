import { DashboardShell } from "@/components/layout/DashboardShell";
import { TeacherSidebar } from "@/components/layout/TeacherSidebar";
import { RoleGuard } from "@/components/layout/RoleGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowed={["TEACHER"]}>
      <DashboardShell title="Không gian giáo viên" nav={<TeacherSidebar />}>
        {children}
      </DashboardShell>
    </RoleGuard>
  );
}
