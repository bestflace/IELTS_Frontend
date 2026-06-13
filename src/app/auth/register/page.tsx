import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Tạo tài khoản"
      subtitle="Bắt đầu luyện đủ 4 kỹ năng, lưu tiến độ và nhận phân tích bài làm từ Gemini AI cùng giáo viên IELTSBF."
      visual="notebook"
      sideTitle="Khởi động hành trình IELTS của riêng bạn"
      sideDescription="Một tài khoản duy nhất để luyện đề, lưu lịch sử, xem kết quả và cải thiện từng tiêu chí theo lộ trình rõ ràng."
    >
      <RegisterForm />
    </AuthCard>
  );
}
