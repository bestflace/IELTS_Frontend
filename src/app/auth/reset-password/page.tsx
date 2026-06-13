import { AuthCard } from "@/components/auth/AuthCard";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function Page() {
  return (
    <AuthCard
      title="Tạo mật khẩu mới"
      subtitle="Chọn mật khẩu đủ mạnh và khác với mật khẩu cũ để bảo vệ tài khoản IELTSBF."
      visual="typewriter"
      sideTitle="Sẵn sàng quay lại đường đua IELTS"
      sideDescription="Hoàn tất bước cuối cùng để tiếp tục luyện tập, xem tiến độ và nhận phản hồi từ Gemini AI cùng giáo viên."
      quote="Mật khẩu mạnh nên có chữ hoa, chữ thường, chữ số và ký tự đặc biệt."
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
