"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Layers,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";

export default function Page() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Teacher / Classes"
        title="Quản lý lớp học"
        description="Không gian theo dõi lớp phụ trách, danh sách học viên và tiến độ học tập của từng lớp."
      />

      <Card className="relative overflow-hidden rounded-[40px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-300/18 blur-3xl"
        />

        <CardContent className="relative p-8 md:p-12">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-[28px] border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-[0_18px_45px_rgba(14,165,233,0.14)]">
              <GraduationCap className="h-9 w-9" />
            </div>

            <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50/80 px-4 py-2 text-xs font-black uppercase tracking-[.22em] text-cyan-700">
              <Sparkles className="h-3.5 w-3.5" />
              Coming soon
            </p>

            <h2 className="mt-4 font-serif text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              Sẽ phát triển thêm
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-500">
              Tính năng quản lý lớp sẽ hiển thị các lớp giáo viên phụ trách,
              danh sách học viên, tiến độ lớp và các hoạt động cần theo dõi.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
            {[
              {
                title: "Danh sách lớp",
                description: "Xem các lớp đang phụ trách và thông tin cơ bản.",
                icon: Layers,
              },
              {
                title: "Học viên",
                description:
                  "Theo dõi học viên trong từng lớp và trạng thái học.",
                icon: UsersRound,
              },
              {
                title: "Tiến độ lớp",
                description: "Tổng hợp bài làm, band và mức độ hoàn thành.",
                icon: BookOpenCheck,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[30px] border border-cyan-100 bg-white/75 p-5 text-left shadow-sm backdrop-blur-xl"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 font-serif text-xl font-black text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="/teacher/submissions">
              <Button>
                Tiếp tục chấm bài
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
