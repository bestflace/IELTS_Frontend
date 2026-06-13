import { Clock } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";

type Props = {
  onGoStatus?: () => void;
};

export function AttemptExpiredState({ onGoStatus }: Props) {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-5">
      <Card className="relative max-w-lg overflow-hidden rounded-[34px] border border-white/70 bg-white/80 p-7 text-center shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <Clock className="mx-auto h-12 w-12 text-rose-600" />

        <h1 className="mt-4 font-serif text-3xl font-black text-slate-950">
          Đã hết giờ làm bài
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          Thời gian làm bài đã kết thúc. Nếu hệ thống chưa chuyển trang, bạn có
          thể kiểm tra trạng thái bài làm.
        </p>

        {onGoStatus ? (
          <Button
            className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.28)]"
            onClick={onGoStatus}
          >
            Xem trạng thái
          </Button>
        ) : null}
      </Card>
    </div>
  );
}
