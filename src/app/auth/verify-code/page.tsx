import { AuthCard } from "@/components/auth/AuthCard";
import { VerifyCodeForm } from "@/components/auth/VerifyCodeForm";

export default function Page() {
  return (
    <AuthCard
      title="Xác minh mã OTP"
      subtitle="Nhập mã xác minh đã được gửi đến email của bạn để tiếp tục đặt lại mật khẩu."
      visual="notebook"
      sideTitle="Một lớp bảo vệ cho hành trình học tập"
      sideDescription="Xác minh email giúp bảo đảm chỉ bạn mới có thể thay đổi mật khẩu và truy cập dữ liệu học tập cá nhân."
      quote="Không chia sẻ mã xác minh với bất kỳ ai, kể cả người tự nhận là nhân viên hỗ trợ."
    >
      <VerifyCodeForm />
    </AuthCard>
  );
}
