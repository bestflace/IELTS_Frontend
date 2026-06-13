"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Headphones,
  PenLine,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { SubmissionStatusBadge } from "@/components/teacher/SubmissionStatusBadge";

type Props = {
  submission: any;
  title?: string;
  description?: string;
};

function getStudentName(submission: any) {
  return (
    submission?.learner?.fullName ||
    submission?.learner?.full_name ||
    submission?.student?.fullName ||
    submission?.student?.full_name ||
    submission?.studentName ||
    "Học viên"
  );
}

function getTestTitle(submission: any) {
  return (
    submission?.test?.title ||
    submission?.testTitle ||
    submission?.title ||
    "Bài làm IELTS"
  );
}

function getSkillText(skill?: string) {
  if (skill === "WRITING") return "Writing";
  if (skill === "SPEAKING") return "Speaking";
  return "Bài làm";
}

function getSkillIcon(skill?: string) {
  if (skill === "SPEAKING") return Headphones;
  if (skill === "WRITING") return PenLine;
  return FileText;
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function SubmissionDetailHeader({
  submission,
  title = "Chấm bài học viên",
  description = "Xem bài làm, nhập điểm theo tiêu chí và gửi nhận xét cho học viên.",
}: Props) {
  const SkillIcon = getSkillIcon(submission?.skill);
  const submittedAt =
    submission?.submittedAt ||
    submission?.submitted_at ||
    submission?.createdAt ||
    submission?.created_at;

  return (
    <Card className="relative overflow-hidden rounded-[36px] border border-white/70 bg-white/80 shadow-[0_30px_90px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <CardContent className="p-0">
        <div className="border-b border-cyan-100/80 bg-cyan-50/60 px-7 py-5">
          <Link href="/teacher/submissions">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>

        <div className="relative p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_18px_45px_rgba(14,165,233,0.24)]">
                <SkillIcon className="h-8 w-8" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-700">
                  {getSkillText(submission?.skill)}
                </p>

                <h1 className="mt-3 font-serif text-4xl font-black leading-tight text-slate-950">
                  {title}
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-8 text-slate-500">
                  {description}
                </p>
              </div>
            </div>

            <div className="w-full rounded-[28px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl lg:w-[360px]">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-cyan-700" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">
                    Học viên
                  </p>
                  <p className="mt-1 font-black text-slate-950">
                    {getStudentName(submission)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-cyan-700" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">
                    Thời gian nộp
                  </p>
                  <p className="mt-1 font-black text-slate-950">
                    {formatDate(submittedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <SubmissionStatusBadge status={submission?.status} />
              </div>
            </div>
          </div>

          <div className="relative mt-6 flex items-start gap-3 rounded-[26px] border border-cyan-100 bg-cyan-50/70 p-4">
            <FileText className="mt-0.5 h-5 w-5 text-cyan-700" />
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">
                Bài thi
              </p>
              <p className="mt-1 font-black text-slate-950">
                {getTestTitle(submission)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
