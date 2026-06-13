import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthCard
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục luyện tập, theo dõi tiến độ và nhận phản hồi cá nhân hóa trên IELTSBF."
      visual="desk"
      sideTitle="Mỗi buổi luyện tập là một bước gần hơn tới band điểm mục tiêu"
      sideDescription="Tiếp tục hành trình Reading, Listening, Writing và Speaking trong không gian học tập hiện đại, tập trung và đầy cảm hứng."
    >
      <LoginForm />
    </AuthCard>
  );
}
