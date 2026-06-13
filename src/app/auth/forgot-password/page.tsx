import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function Page() {
  return (
    <AuthCard
      title="Khôi phục mật khẩu"
      subtitle="Nhập email liên kết với tài khoản IELTSBF. Chúng tôi sẽ gửi mã xác minh để bạn tiếp tục."
      visual="paper"
      sideTitle="Bạn luôn có thể bắt đầu lại"
      sideDescription="Khôi phục quyền truy cập chỉ trong vài bước an toàn, sau đó tiếp tục lộ trình luyện IELTS đang dang dở."
      quote="Mã xác minh chỉ có hiệu lực trong thời gian giới hạn để bảo vệ tài khoản của bạn."
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
