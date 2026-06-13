"use client";

import Link from "next/link";
import { KeyRound, Sparkles, UserRound } from "lucide-react";

import { Button } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { EditProfileForm } from "@/components/profile/EditProfileForm";

export default function TeacherProfilePage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Teacher / Settings"
        title="Cài đặt hồ sơ"
        description="Cập nhật thông tin cá nhân, ảnh đại diện và thông tin hiển thị trong không gian giáo viên."
        actions={
          <Link href="/teacher/change-password">
            <Button>
              <KeyRound className="h-4 w-4" />
              Đổi mật khẩu
            </Button>
          </Link>
        }
      />

      <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
        />

        <div className="relative grid gap-6 p-7 lg:grid-cols-[1fr_340px] lg:p-9">
          <div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-sm">
              <UserRound className="h-7 w-7" />
            </div>

            <h2 className="mt-5 font-serif text-3xl font-black text-slate-950">
              Hồ sơ giáo viên
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Thông tin hồ sơ được dùng để hiển thị trong khu vực chấm bài, bình
              luận và các phản hồi gửi cho học viên. Email đăng nhập không thể
              chỉnh sửa tại đây.
            </p>
          </div>

          <div className="rounded-[28px] border border-cyan-100 bg-cyan-50/70 p-5 shadow-sm backdrop-blur-xl">
            <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" />
              Lưu ý
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Sau khi đổi ảnh hoặc tên hiển thị, tải lại trang nếu thanh điều
              hướng vẫn còn thông tin cũ.
            </p>

            <Link href="/teacher/change-password">
              <Button variant="outline" className="mt-5 w-full">
                <KeyRound className="h-4 w-4" />
                Cập nhật mật khẩu
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EditProfileForm />
    </div>
  );
}
