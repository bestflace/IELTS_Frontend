"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";

const cards = [
  {
    title: "Người dùng",
    description: "Quản lý học viên, giáo viên và quản trị viên.",
    href: "/admin/users",
    icon: UsersRound,
  },
  {
    title: "Đề thi",
    description: "Tạo, sửa, xuất bản và quản lý cấu trúc đề.",
    href: "/admin/tests",
    icon: FileText,
  },
  {
    title: "Ngân hàng nội dung",
    description: "Quản lý Reading, Listening, Writing và Speaking.",
    href: "/admin/content-bank",
    icon: FolderKanban,
  },
  {
    title: "Import dữ liệu",
    description: "Nhập dữ liệu từ file Excel và theo dõi trạng thái job.",
    href: "/admin/imports",
    icon: FileSpreadsheet,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="relative space-y-7">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <section className="relative overflow-hidden rounded-[40px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <div className="relative grid gap-0 lg:grid-cols-[1.15fr_.85fr]">
          <div className="bg-[linear-gradient(90deg,rgba(14,165,233,0.045)_1px,transparent_1px),linear-gradient(rgba(14,165,233,0.045)_1px,transparent_1px)] bg-[size:32px_32px] p-8 md:p-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Admin workspace
            </p>

            <h1 className="mt-5 max-w-3xl font-serif text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              Bảng điều khiển quản trị
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Điều phối người dùng, đề thi, ngân hàng nội dung, import và các
              hoạt động hệ thống trong một không gian quản trị đồng bộ.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/admin/tests/new">
                <Button>
                  Tạo đề mới
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/admin/reports">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4" />
                  Xem báo cáo
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 p-8 text-white md:p-10">
            <div
              aria-hidden="true"
              className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl"
            />

            <div className="relative">
              <ShieldCheck className="h-12 w-12 text-cyan-50" />

              <h2 className="mt-6 font-serif text-4xl font-black">
                Điều hành hệ thống
              </h2>

              <p className="mt-4 text-base leading-8 text-cyan-50/90">
                Ưu tiên kiểm tra đề mới, import lỗi, bài nộp cần xử lý và bình
                luận cần kiểm duyệt.
              </p>

              <div className="mt-8 rounded-[28px] border border-white/20 bg-white/15 p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-100">
                  Truy cập nhanh
                </p>
                <p className="mt-2 text-3xl font-black">IELTSBF Admin</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.href} href={card.href} className="group block">
              <Card className="relative h-full overflow-hidden rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl transition hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_30px_90px_rgba(14,165,233,0.18)]">
                <CardContent className="relative p-6">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-cyan-300/18 blur-3xl"
                  />

                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_16px_35px_rgba(14,165,233,0.25)]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 font-serif text-2xl font-black text-slate-950">
                    {card.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {card.description}
                  </p>

                  <p className="mt-5 inline-flex items-center gap-1 text-sm font-black text-cyan-700 transition group-hover:gap-2">
                    Mở trang
                    <ArrowRight className="h-4 w-4" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Kiểm duyệt
            </p>
            <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
              Bình luận và bài nộp
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Theo dõi bình luận của học viên, bài Writing/Speaking và trạng
              thái chấm bài để đảm bảo phản hồi đúng lúc.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/admin/comments">
                <Button variant="outline">
                  <MessageSquareText className="h-4 w-4" />
                  Bình luận
                </Button>
              </Link>
              <Link href="/admin/submissions">
                <Button variant="outline">
                  <FileText className="h-4 w-4" />
                  Bài nộp
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <CardContent className="p-6">
            <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              Dữ liệu
            </p>
            <h2 className="mt-2 font-serif text-3xl font-black text-slate-950">
              Import và báo cáo
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Kiểm tra lịch sử import, xử lý file lỗi và xem báo cáo tổng quan
              để đánh giá hoạt động của hệ thống.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/admin/imports">
                <Button variant="outline">
                  <FileSpreadsheet className="h-4 w-4" />
                  Import
                </Button>
              </Link>
              <Link href="/admin/reports">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4" />
                  Báo cáo
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
