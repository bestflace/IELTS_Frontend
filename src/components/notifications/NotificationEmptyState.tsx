import { BellOff } from "lucide-react";

export function NotificationEmptyState() {
  return (
    <div className="rounded-[30px] border border-dashed border-cyan-200 bg-cyan-50/60 p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-cyan-100 bg-white/80 text-cyan-700 shadow-sm">
        <BellOff className="h-7 w-7" />
      </div>

      <h3 className="mt-4 font-serif text-2xl font-black text-slate-950">
        Chưa có thông báo
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Khi có bài cần chấm, bình luận mới hoặc cập nhật hệ thống, thông báo sẽ
        xuất hiện tại đây.
      </p>
    </div>
  );
}
