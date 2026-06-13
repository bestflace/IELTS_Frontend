"use client";

import { BookOpen, Clock3, Headphones, Mic, PenLine } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import type { TestType } from "@/types";

type Props = {
  type: TestType;
};

type PlannedSection = {
  key: string;
  label: string;
  description: string;
  time: string;
  icon: typeof BookOpen;
  tone: "sage" | "brown" | "warning" | "success";
};

const ALL_SECTIONS: PlannedSection[] = [
  {
    key: "LISTENING",
    label: "Listening",
    description: "Chọn 1 Listening Set đã xuất bản từ ngân hàng đề.",
    time: "30 phút",
    icon: Headphones,
    tone: "sage",
  },
  {
    key: "READING",
    label: "Reading",
    description: "Chọn 1 Reading Set đã xuất bản từ ngân hàng đề.",
    time: "60 phút",
    icon: BookOpen,
    tone: "brown",
  },
  {
    key: "WRITING",
    label: "Writing",
    description: "Chọn 1 Writing Task đã xuất bản từ ngân hàng đề.",
    time: "60 phút",
    icon: PenLine,
    tone: "warning",
  },
  {
    key: "SPEAKING",
    label: "Speaking",
    description: "Chọn 1 Speaking Set đã xuất bản từ ngân hàng đề.",
    time: "15 phút",
    icon: Mic,
    tone: "success",
  },
];

function getPlannedSections(type: TestType) {
  if (type === "FULL") return ALL_SECTIONS;
  return ALL_SECTIONS.filter((section) => section.key === type);
}

export function RandomBuildPreview({ type }: Props) {
  const sections = getPlannedSections(type);

  return (
    <Card className="p-5">
      <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
        Cấu trúc sẽ tạo
      </p>

      <h3 className="mt-2 font-serif text-xl font-bold text-slate-950">
        {type === "FULL" ? "Full IELTS Test" : `${type} Practice Test`}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Sau khi tạo, hệ thống sẽ sinh một đề ở trạng thái bản nháp. Bạn có thể
        kiểm tra, reroll từng phần và xuất bản sau.
      </p>

      <div className="mt-5 space-y-3">
        {sections.map((section, index) => {
          const Icon = section.icon;

          return (
            <div
              key={section.key}
              className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50">
                  <Icon className="h-4 w-4 text-cyan-700" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={section.tone}>{section.label}</Badge>
                    <span className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">
                      Section {index + 1}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {section.description}
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    {section.time}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
