"use client";

import Link from "next/link";
import {
  BookOpen,
  FileText,
  Headphones,
  Mic,
  PenLine,
  Plus,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";

const banks = [
  {
    key: "reading",
    title: "Reading Bank",
    label: "Reading",
    description: "Quản lý passage, câu hỏi và đáp án cho phần Reading.",
    href: "/admin/reading-sets",
    createHref: "/admin/reading-sets/new",
    icon: BookOpen,
    tone: "brown" as const,
    items: ["Passage", "Questions", "Answer keys", "Tags"],
  },
  {
    key: "listening",
    title: "Listening Bank",
    label: "Listening",
    description:
      "Quản lý audio, transcript, câu hỏi và đáp án cho phần Listening.",
    href: "/admin/listening-sets",
    createHref: "/admin/listening-sets/new",
    icon: Headphones,
    tone: "sage" as const,
    items: ["Audio", "Transcript", "Questions", "Answer keys"],
  },
  {
    key: "writing",
    title: "Writing Bank",
    label: "Writing",
    description: "Quản lý Writing Task 1/2, prompt, hình ảnh hoặc biểu đồ.",
    href: "/admin/writing-tasks",
    createHref: "/admin/writing-tasks/new",
    icon: PenLine,
    tone: "warning" as const,
    items: ["Task 1", "Task 2", "Prompt", "Image/Chart"],
  },
  {
    key: "speaking",
    title: "Speaking Bank",
    label: "Speaking",
    description: "Quản lý topic, parts, prompts và cue card cho phần Speaking.",
    href: "/admin/speaking-sets",
    createHref: "/admin/speaking-sets/new",
    icon: Mic,
    tone: "success" as const,
    items: ["Part 1", "Part 2", "Part 3", "Prompts"],
  },
];

export default function AdminContentBankPage() {
  return (
    <div className="relative space-y-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
      />

      <PageHeader
        eyebrow="Admin / Content Bank"
        title="Ngân hàng đề"
        description="Quản lý toàn bộ nội dung luyện thi IELTS theo 4 kỹ năng: Reading, Listening, Writing và Speaking."
        actions={
          <Link href="/admin/tests/new">
            <Button variant="outline">
              <FileText className="h-4 w-4" />
              Tạo đề thi
            </Button>
          </Link>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {banks.map((bank) => {
          const Icon = bank.icon;

          return (
            <Card key={bank.key} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50/70">
                    <Icon className="h-5 w-5 text-cyan-700" />
                  </div>

                  <Badge tone={bank.tone}>{bank.label}</Badge>
                </div>

                <h2 className="mt-5 font-serif text-2xl font-black text-slate-950">
                  {bank.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {bank.description}
                </p>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  {bank.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-sm text-slate-500"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-2">
                  <Link href={bank.href}>
                    <Button className="w-full justify-start">
                      <Icon className="h-4 w-4" />
                      Vào ngân hàng
                    </Button>
                  </Link>

                  <Link href={bank.createHref}>
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="h-4 w-4" />
                      Tạo mới
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-5 p-5">
        <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
          Workflow
        </p>

        <h3 className="mt-2 font-serif text-xl font-bold text-slate-950">
          Luồng sử dụng ngân hàng đề
        </h3>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
            <p className="font-semibold text-slate-950">1. Tạo nội dung</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Tạo Reading, Listening, Writing hoặc Speaking set.
            </p>
          </div>

          <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
            <p className="font-semibold text-slate-950">
              2. Hoàn thiện câu hỏi
            </p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Thêm câu hỏi, đáp án, prompt hoặc audio tương ứng.
            </p>
          </div>

          <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
            <p className="font-semibold text-slate-950">3. Xuất bản</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Chỉ nội dung đã xuất bản mới được chọn khi tạo đề.
            </p>
          </div>

          <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
            <p className="font-semibold text-slate-950">4. Tạo đề thi</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Dùng nội dung trong ngân hàng để tạo đề thủ công hoặc ngẫu nhiên.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
