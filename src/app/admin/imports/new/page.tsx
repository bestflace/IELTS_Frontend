"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Headphones,
  HelpCircle,
  Layers3,
  LinkIcon,
  Mic,
  Play,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { ErrorState } from "@/components/common/States";
import { FileUploader } from "@/components/uploads/FileUploader";
import { getErrorMessage } from "@/lib/api/client";
import { createImportJob, type ImportType } from "@/lib/api/imports.api";

type ImportTypeConfig = {
  value: ImportType;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  fileName: string;
  subtitle: string;
  description: string;
  requiredSheets: string[];
  simpleRule: string;
  examples: string[];
};

type TemplateSheet = {
  name: string;
  rows: unknown[][];
};

type TemplateWorkbook = {
  fileName: string;
  sheets: TemplateSheet[];
};

const IMPORT_TYPES: ImportTypeConfig[] = [
  {
    value: "READING_SET",
    label: "Reading Set",
    shortLabel: "Reading",
    icon: BookOpen,
    fileName: "reading-set-template.xlsx",
    subtitle: "Thêm bài Reading vào ngân hàng đề.",
    description:
      "Dùng khi bạn muốn thêm một bài Reading gồm đoạn văn và câu hỏi. File mẫu đã chia sẵn Passage 1, Passage 2, Passage 3 để màn làm bài hiển thị đúng.",
    requiredSheets: ["reading_set", "questions"],
    simpleRule:
      "Mỗi bài Reading nên có đủ 3 passage. Câu 1–13 thuộc Passage 1, câu 14–26 thuộc Passage 2, câu 27–40 thuộc Passage 3.",
    examples: [
      "Điền nội dung Passage 1 vào cột passage_1_text.",
      "Nếu dùng ảnh passage, upload ảnh trước rồi dán link vào passage_1_image_url.",
      "Mỗi dòng trong sheet questions là một câu hỏi.",
    ],
  },
  {
    value: "LISTENING_SET",
    label: "Listening Set",
    shortLabel: "Listening",
    icon: Headphones,
    fileName: "listening-set-template.xlsx",
    subtitle: "Thêm bài Listening có audio và câu hỏi.",
    description:
      "Dùng khi bạn muốn thêm một bài Listening. Audio nên được upload trong Thư viện media trước, sau đó dán link audio vào file Excel.",
    requiredSheets: ["listening_set", "questions"],
    simpleRule:
      "Màn làm bài tự chia Listening thành Part 1, Part 2, Part 3, Part 4 theo số câu.",
    examples: [
      "Câu 1–10 thuộc Listening Part 1.",
      "Câu 11–20 thuộc Listening Part 2.",
      'Câu chọn nhiều đáp án có thể nhập đáp án đúng dạng ["A", "C"].',
    ],
  },
  {
    value: "WRITING_TASK",
    label: "Writing Task",
    shortLabel: "Writing",
    icon: FileText,
    fileName: "writing-task-template.xlsx",
    subtitle: "Thêm đề Writing Task 1 hoặc Task 2.",
    description:
      "Dùng khi bạn muốn thêm đề Writing. Task 1 và Task 2 phải là hai dòng riêng để màn làm bài tách đúng từng task.",
    requiredSheets: ["writing_task"],
    simpleRule:
      "Không gộp Task 1 và Task 2 vào cùng một dòng. Mỗi dòng trong Excel là một đề Writing riêng.",
    examples: [
      "Dòng Task 1: task_no = 1, có thể có chart_url hoặc image_url.",
      "Dòng Task 2: task_no = 2, không cần ảnh biểu đồ.",
      "Nếu Task 1 có chart, upload ảnh trước rồi dán link vào chart_url.",
    ],
  },
  {
    value: "SPEAKING_SET",
    label: "Speaking Set",
    shortLabel: "Speaking",
    icon: Mic,
    fileName: "speaking-set-template.xlsx",
    subtitle: "Thêm đề Speaking Part 1, Part 2, Part 3.",
    description:
      "Dùng khi bạn muốn thêm bộ câu hỏi Speaking. File mẫu đã chia sẵn Part 1, Part 2, Part 3 để learner ghi âm đúng từng phần.",
    requiredSheets: ["speaking_set", "parts", "prompts", "items"],
    simpleRule:
      "Câu hỏi Speaking phải được gắn đúng part. Ví dụ câu của Part 1 gắn với p1, câu của Part 2 gắn với p2.",
    examples: [
      "Sheet parts dùng để khai báo Part 1, Part 2, Part 3.",
      "Sheet prompts dùng để nhập câu hỏi hoặc cue card.",
      "Sheet items dùng cho các gạch đầu dòng trong cue card nếu có.",
    ],
  },
  {
    value: "TEST",
    label: "Test",
    shortLabel: "Test",
    icon: Layers3,
    fileName: "test-template.xlsx",
    subtitle: "Ghép các đề trong ngân hàng thành một bài test.",
    description:
      "Dùng sau khi bạn đã import Reading, Listening, Writing, Speaking vào ngân hàng. File Test chỉ dùng để liên kết các nội dung đã có.",
    requiredSheets: ["test", "sections"],
    simpleRule:
      "Không nhập lại toàn bộ nội dung đề trong file Test. File Test chỉ chọn nguồn đề đã import trước đó.",
    examples: [
      "Listening section trỏ tới id của Listening Set.",
      "Reading section trỏ tới id của Reading Set.",
      "Writing full test nên có 2 dòng riêng: Writing Task 1 và Writing Task 2.",
    ],
  },
];

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function getSelectedImportType(type: ImportType) {
  return IMPORT_TYPES.find((item) => item.value === type) || IMPORT_TYPES[0];
}

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-cyan-100 bg-white/80 px-3 py-1 text-xs font-semibold text-cyan-700 shadow-sm">
      {children}
    </span>
  );
}

function createGuideSheet(type: ImportType): TemplateSheet {
  const selected = getSelectedImportType(type);

  return {
    name: "huong_dan",
    rows: [
      ["HƯỚNG DẪN SỬ DỤNG FILE MẪU"],
      [""],
      ["Loại file", selected.label],
      ["Mục đích", selected.subtitle],
      ["Lưu ý chính", selected.simpleRule],
      [""],
      ["Các sheet cần giữ nguyên tên"],
      ...selected.requiredSheets.map((sheet) => [sheet]),
      [""],
      ["Ví dụ / lưu ý khi điền"],
      ...selected.examples.map((item, index) => [`${index + 1}. ${item}`]),
      [""],
      ["Lưu ý quan trọng"],
      [
        "Bạn có thể thay nội dung mẫu, nhưng không nên đổi tên sheet hoặc tên cột.",
      ],
      ["Những ô không có dữ liệu có thể để trống."],
      [
        "Các link ảnh/audio nên được upload ở Thư viện media trước rồi dán vào file.",
      ],
    ],
  };
}

function getTemplateWorkbook(type: ImportType): TemplateWorkbook {
  if (type === "READING_SET") {
    return {
      fileName: "reading-set-template.xlsx",
      sheets: [
        createGuideSheet(type),
        {
          name: "reading_set",
          rows: [
            [
              "id",
              "title",
              "passage_1_title",
              "passage_1_text",
              "passage_1_html",
              "passage_1_image_url",
              "passage_2_title",
              "passage_2_text",
              "passage_2_html",
              "passage_2_image_url",
              "passage_3_title",
              "passage_3_text",
              "passage_3_html",
              "passage_3_image_url",
              "passage_html",
              "passage_text",
              "level",
              "status",
              "tag_slugs",
            ],
            [
              "reading-test-01",
              "IELTS Reading Test 01",
              "Urban Farming",
              "Paste Passage 1 text here. Leave passage_1_html empty if you use plain text.",
              "",
              "",
              "Stadiums",
              "Paste Passage 2 text here.",
              "",
              "",
              "To Catch a King",
              "Paste Passage 3 text here.",
              "",
              "",
              "",
              "",
              6.5,
              "DRAFT",
              "reading,academic",
            ],
          ],
        },
        {
          name: "questions",
          rows: [
            [
              "section_label",
              "q_no",
              "question_type",
              "prompt_text",
              "instruction_text",
              "options_json",
              "correct_answer_json",
              "explanation",
              "points",
              "sort_order",
            ],
            [
              "Questions 1-3",
              1,
              "MULTIPLE_CHOICE",
              "What was the initial attitude of urban planners towards empty city rooftops?",
              "Choose the correct letter, A, B, C or D.",
              JSON.stringify([
                {
                  label: "A",
                  text: "They saw them as potential agricultural spaces.",
                },
                {
                  label: "B",
                  text: "They discouraged people from using them.",
                },
                {
                  label: "C",
                  text: "They considered them useless structural byproducts.",
                },
                {
                  label: "D",
                  text: "They planned to convert them into public parks.",
                },
              ]),
              JSON.stringify("C"),
              "Explanation here.",
              1,
              1,
            ],
            [
              "Questions 4-6",
              4,
              "SENTENCE_COMPLETION",
              "Urban farms can reduce the city's ____.",
              "Choose NO MORE THAN TWO WORDS from the passage.",
              "",
              JSON.stringify("carbon footprint"),
              "",
              1,
              4,
            ],
            [
              "Questions 7-13",
              7,
              "TRUE_FALSE_NOT_GIVEN",
              "Urban farming always requires very low setup costs.",
              "Write TRUE, FALSE or NOT GIVEN.",
              "",
              JSON.stringify("FALSE"),
              "",
              1,
              7,
            ],
          ],
        },
      ],
    };
  }

  if (type === "LISTENING_SET") {
    return {
      fileName: "listening-set-template.xlsx",
      sheets: [
        createGuideSheet(type),
        {
          name: "listening_set",
          rows: [
            [
              "id",
              "title",
              "audio_url",
              "transcript_text",
              "level",
              "status",
              "tag_slugs",
            ],
            [
              "listening-test-01",
              "IELTS Listening Test 01",
              "https://example.com/audio/listening-test-01.mp3",
              "Paste transcript here if available.",
              6.5,
              "DRAFT",
              "listening,academic",
            ],
          ],
        },
        {
          name: "questions",
          rows: [
            [
              "section_label",
              "q_no",
              "question_type",
              "prompt_text",
              "instruction_text",
              "options_json",
              "correct_answer_json",
              "explanation",
              "points",
              "sort_order",
            ],
            [
              "Questions 1-10",
              1,
              "FORM_COMPLETION",
              "Name: ____",
              "Write ONE WORD ONLY.",
              "",
              JSON.stringify("John"),
              "",
              1,
              1,
            ],
            [
              "Questions 11-20",
              11,
              "MULTIPLE_CHOICE",
              "What does the speaker recommend?",
              "Choose the correct letter, A, B or C.",
              JSON.stringify([
                { label: "A", text: "Booking early" },
                { label: "B", text: "Calling again tomorrow" },
                { label: "C", text: "Changing the date" },
              ]),
              JSON.stringify("A"),
              "",
              1,
              11,
            ],
            [
              "Questions 21-26",
              21,
              "MULTIPLE_CHOICE",
              "Which TWO facilities are mentioned?",
              "Choose TWO letters, A-E.",
              JSON.stringify({
                multiple: true,
                maxSelections: 2,
                options: [
                  { label: "A", text: "Library" },
                  { label: "B", text: "Gym" },
                  { label: "C", text: "Café" },
                  { label: "D", text: "Car park" },
                  { label: "E", text: "Study room" },
                ],
              }),
              JSON.stringify(["B", "E"]),
              "",
              1,
              21,
            ],
          ],
        },
      ],
    };
  }

  if (type === "WRITING_TASK") {
    return {
      fileName: "writing-task-template.xlsx",
      sheets: [
        createGuideSheet(type),
        {
          name: "writing_task",
          rows: [
            [
              "id",
              "task_no",
              "title",
              "prompt_text",
              "chart_url",
              "image_url",
              "level",
              "status",
              "tag_slugs",
            ],
            [
              "writing-2025-02-08-task-1",
              1,
              "Writing Task 1 - UK visitors to Spain",
              "The charts below give information about the age of visitors from the UK to Spain in 1983 and in 2003.",
              "https://example.com/images/writing-task-1-chart.png",
              "",
              6.5,
              "DRAFT",
              "writing,task-1",
            ],
            [
              "writing-2025-02-08-task-2",
              2,
              "Writing Task 2 - Packaging responsibility",
              "Some people feel that manufacturers and supermarkets have the responsibility to reduce the amount of packaging of goods. Others argue that customers should avoid buying goods with a lot of packaging. Discuss both views and give your opinion.",
              "",
              "",
              6.5,
              "DRAFT",
              "writing,task-2",
            ],
          ],
        },
      ],
    };
  }

  if (type === "SPEAKING_SET") {
    return {
      fileName: "speaking-set-template.xlsx",
      sheets: [
        createGuideSheet(type),
        {
          name: "speaking_set",
          rows: [
            ["id", "topic", "level", "status", "tag_slugs"],
            [
              "speaking-set-01",
              "Hometown, accommodation and a memorable place",
              6.5,
              "DRAFT",
              "speaking",
            ],
          ],
        },
        {
          name: "parts",
          rows: [
            [
              "part_key",
              "part_no",
              "part_type",
              "title",
              "instructions",
              "recommended_sec",
              "sort_order",
            ],
            [
              "p1",
              1,
              "PART_1",
              "Introduction and Interview",
              "Answer short questions about familiar topics.",
              300,
              1,
            ],
            [
              "p2",
              2,
              "PART_2",
              "Long Turn",
              "Speak about the topic on the cue card.",
              120,
              2,
            ],
            [
              "p3",
              3,
              "PART_3",
              "Discussion",
              "Answer more abstract questions related to the topic.",
              300,
              3,
            ],
          ],
        },
        {
          name: "prompts",
          rows: [
            [
              "prompt_key",
              "part_key",
              "prompt_type",
              "content",
              "notes",
              "time_suggest_sec",
              "sort_order",
            ],
            ["p1_q1", "p1", "QUESTION", "Where is your hometown?", "", 30, 1],
            ["p1_q2", "p1", "QUESTION", "Do you like living there?", "", 30, 2],
            [
              "p2_card",
              "p2",
              "CUE_CARD",
              "Describe a memorable place you have visited.",
              "You should say where it is, when you visited it, what you did there, and explain why it was memorable.",
              120,
              1,
            ],
            [
              "p3_q1",
              "p3",
              "FOLLOW_UP",
              "Why do people like visiting new places?",
              "",
              45,
              1,
            ],
          ],
        },
        {
          name: "items",
          rows: [
            ["prompt_key", "item_text", "sort_order"],
            ["p2_card", "where it is", 1],
            ["p2_card", "when you visited it", 2],
            ["p2_card", "what you did there", 3],
            ["p2_card", "why it was memorable", 4],
          ],
        },
      ],
    };
  }

  return {
    fileName: "test-template.xlsx",
    sheets: [
      createGuideSheet(type),
      {
        name: "test",
        rows: [
          [
            "id",
            "type",
            "title",
            "level",
            "description",
            "status",
            "tag_slugs",
          ],
          [
            "test-01",
            "FULL",
            "IELTSBF - Test 01",
            6.5,
            "Full IELTS practice test.",
            "DRAFT",
            "full-test",
          ],
        ],
      },
      {
        name: "sections",
        rows: [
          [
            "section_type",
            "reading_set_id",
            "listening_set_id",
            "writing_task_id",
            "speaking_set_id",
            "part_label",
            "sort_order",
            "time_limit_sec",
          ],
          [
            "LISTENING_SET",
            "",
            "listening-test-01",
            "",
            "",
            "Listening",
            1,
            1800,
          ],
          ["READING_SET", "reading-test-01", "", "", "", "Reading", 2, 3600],
          [
            "WRITING_TASK",
            "",
            "",
            "writing-2025-02-08-task-1",
            "",
            "Writing Task 1",
            3,
            1200,
          ],
          [
            "WRITING_TASK",
            "",
            "",
            "writing-2025-02-08-task-2",
            "",
            "Writing Task 2",
            4,
            2400,
          ],
          ["SPEAKING_SET", "", "", "", "speaking-set-01", "Speaking", 5, 900],
        ],
      },
    ],
  };
}

function autoFitColumns(rows: unknown[][]) {
  const firstRow = rows[0] || [];
  return firstRow.map((_, columnIndex) => {
    const maxLength = rows.reduce((max, row) => {
      const value = row[columnIndex];
      const text = value === null || value === undefined ? "" : String(value);
      return Math.max(max, text.length);
    }, 10);

    return {
      wch: Math.min(Math.max(maxLength + 2, 14), 48),
    };
  });
}

async function downloadTemplate(type: ImportType) {
  const XLSX = await import("xlsx");
  const template = getTemplateWorkbook(type);

  const workbook = XLSX.utils.book_new();

  template.sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.aoa_to_sheet(sheet.rows);
    worksheet["!cols"] = autoFitColumns(sheet.rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = template.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}

export default function NewImportJobPage() {
  const router = useRouter();

  const [type, setType] = useState<ImportType>("READING_SET");
  const [fileUrl, setFileUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [error, setError] = useState("");

  const selected = useMemo(() => getSelectedImportType(type), [type]);
  const SelectedIcon = selected.icon;

  async function handleDownloadTemplate(targetType = type) {
    setDownloadingTemplate(true);
    setError("");

    try {
      await downloadTemplate(targetType);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tạo file mẫu. Vui lòng thử lại.",
      );
    } finally {
      setDownloadingTemplate(false);
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const normalizedUrl = fileUrl.trim();

    if (!normalizedUrl) {
      setError("Vui lòng upload file hoặc dán link file import.");
      return;
    }

    if (!isValidUrl(normalizedUrl)) {
      setError("Link file chưa hợp lệ. Link cần bắt đầu bằng http hoặc https.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const job = await createImportJob({
        type,
        fileUrl: normalizedUrl,
      });

      router.push(`/admin/imports/${job.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[36px] border border-cyan-100 bg-white/80 shadow-sm">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-cyan-50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-50/70 blur-2xl" />

        <div className="relative grid gap-6 p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:p-9">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-100 bg-cyan-50/70 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                Quản trị / Import đề
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                <Sparkles className="h-3.5 w-3.5" />
                Thêm dữ liệu bằng Excel
              </span>
            </div>

            <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-slate-950 lg:text-5xl">
              Tạo import mới cho ngân hàng đề IELTS
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-500">
              Chọn loại đề, tải file mẫu, điền nội dung vào Excel, upload lại
              file đã điền và hệ thống sẽ tự đưa dữ liệu vào ngân hàng đề.
            </p>
          </div>

          <div className="flex items-start justify-end">
            <Link href="/admin/imports">
              <Button variant="outline" className="bg-cyan-50/70">
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {error ? <ErrorState message={error} /> : null}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="overflow-hidden rounded-[34px] border border-cyan-100 bg-white/80 shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-cyan-100 bg-cyan-50/60 p-6">
                <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                  Bước 1
                </p>
                <h2 className="mt-1 font-serif text-3xl font-black text-slate-950">
                  Chọn loại dữ liệu muốn import
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Chọn đúng loại đề bạn muốn thêm vào hệ thống.
                </p>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-2">
                {IMPORT_TYPES.map((item) => {
                  const active = item.value === type;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        setType(item.value);
                        setError("");
                      }}
                      className={[
                        "group relative overflow-hidden rounded-[26px] border p-5 text-left transition",
                        active
                          ? "border-cyan-300 bg-cyan-50 shadow-sm ring-2 ring-cyan-100/80"
                          : "border-cyan-100 bg-cyan-50/70 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-white/80 hover:shadow-sm",
                      ].join(" ")}
                    >
                      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/80 opacity-60 transition group-hover:scale-125" />

                      <div className="relative flex items-start gap-4">
                        <div
                          className={[
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition",
                            active
                              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                              : "bg-white/80 text-cyan-700 group-hover:bg-cyan-50",
                          ].join(" ")}
                        >
                          {active ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Icon className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-serif text-xl font-bold text-slate-950">
                              {item.label}
                            </p>

                            {active ? (
                              <span className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[.12em] text-white">
                                Đang chọn
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-500">
                            {item.subtitle}
                          </p>

                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setType(item.value);
                              void handleDownloadTemplate(item.value);
                            }}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-100 bg-white/80 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Tải file mẫu
                          </button>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[34px] border border-cyan-100 bg-white/80 shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-cyan-100 bg-cyan-50/60 p-6">
                <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                  Bước 2
                </p>

                <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-3xl font-black text-slate-950">
                      Tải file mẫu và điền dữ liệu
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      File mẫu sẽ được tạo tự động theo loại đề đang chọn. Bạn
                      không cần upload gì trước khi tải template.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="bg-cyan-50/70"
                    disabled={downloadingTemplate}
                    onClick={() => void handleDownloadTemplate(type)}
                  >
                    <Download className="h-4 w-4" />
                    {downloadingTemplate ? "Đang tạo file..." : "Tải file mẫu"}
                  </Button>
                </div>
              </div>

              <div className="grid gap-5 p-6 lg:grid-cols-3">
                <div className="rounded-[24px] border border-cyan-100 bg-cyan-50/70 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                    <SelectedIcon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 font-serif text-2xl font-black text-slate-950">
                    {selected.label}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {selected.description}
                  </p>
                </div>

                <div className="rounded-[24px] border border-cyan-100 bg-cyan-50/70 p-5">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                    Trang Excel cần có
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.requiredSheets.map((sheet) => (
                      <Pill key={sheet}>{sheet}</Pill>
                    ))}
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    File mẫu đã tạo sẵn các trang này. Không nên đổi tên trang.
                  </p>
                </div>

                <div className="rounded-[24px] border border-cyan-100 bg-cyan-50/70 p-5">
                  <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                    Quy tắc chính
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-950">
                    {selected.simpleRule}
                  </p>
                </div>
              </div>

              <div className="border-t border-cyan-100 p-6">
                <p className="text-sm font-semibold text-slate-950">
                  Ví dụ cách điền
                </p>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {selected.examples.map((example) => (
                    <div
                      key={example}
                      className="flex gap-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-3 py-3 text-sm leading-6 text-slate-500"
                    >
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-700" />
                      <span>{example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[34px] border border-cyan-100 bg-white/80 shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-cyan-100 bg-cyan-50/60 p-6">
                <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                  Bước 3
                </p>
                <h2 className="mt-1 font-serif text-3xl font-black text-slate-950">
                  Upload file đã điền
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Sau khi điền nội dung vào file mẫu, quay lại đây để upload.
                </p>
              </div>

              <div className="space-y-6 p-6">
                <FileUploader
                  folder="imports"
                  accept=".xlsx,.xls,.csv"
                  label="Upload file Excel/CSV"
                  description="Chọn file bạn đã điền nội dung từ máy tính."
                  buttonLabel="Chọn file import"
                  disabled={saving}
                  onUploaded={(uploaded: {
                    fileUrl?: string;
                    file_url?: string;
                    url?: string;
                  }) => {
                    const uploadedUrl =
                      uploaded.fileUrl ||
                      uploaded.file_url ||
                      uploaded.url ||
                      "";

                    setFileUrl(uploadedUrl);
                    setError("");
                  }}
                  onError={setError}
                />

                <div>
                  <label className="text-sm font-semibold text-slate-950">
                    Link file import
                  </label>

                  <div className="relative mt-2">
                    <LinkIcon className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      value={fileUrl}
                      onChange={(event) => setFileUrl(event.target.value)}
                      className="pl-9"
                      placeholder="Link file sẽ tự điền sau khi upload"
                    />
                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Nếu file đã có link sẵn, bạn cũng có thể dán trực tiếp vào ô
                    này.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-cyan-100 pt-5 md:flex-row md:justify-end">
                  <Link href="/admin/imports">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-cyan-50/70 md:w-auto"
                    >
                      Hủy
                    </Button>
                  </Link>

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full md:w-auto"
                  >
                    {saving ? (
                      <UploadCloud className="h-4 w-4 animate-pulse" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {saving ? "Đang tạo import..." : "Tạo import"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        <aside className="space-y-5">
          <Card className="sticky top-24 overflow-hidden rounded-[34px] border border-cyan-100 bg-white/80 shadow-sm">
            <CardContent className="p-0">
              <div className="bg-cyan-50 p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                  <UploadCloud className="h-7 w-7" />
                </div>

                <h2 className="mt-5 font-serif text-3xl font-black text-slate-950">
                  Quy trình import
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Làm theo thứ tự này để tránh lỗi file hoặc dữ liệu bị đưa sai
                  chỗ.
                </p>
              </div>

              <div className="space-y-4 p-6">
                {[
                  "Chọn loại đề muốn import.",
                  "Tải file mẫu tương ứng.",
                  "Điền dữ liệu vào file mẫu.",
                  "Upload file đã điền.",
                  "Bấm tạo import.",
                  "Kiểm tra kết quả trong danh sách import.",
                ].map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50/70 text-xs font-bold text-cyan-700">
                      {index + 1}
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-sm leading-6 text-slate-500">
                      <span>{item}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-cyan-700" />
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <div>
                      <p className="font-semibold text-amber-900">
                        Không tự đổi cấu trúc file mẫu
                      </p>
                      <p className="mt-1 text-sm leading-6 text-amber-800">
                        Bạn có thể thay nội dung trong file, nhưng không nên đổi
                        tên trang Excel hoặc tên cột có sẵn.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-cyan-700" />
                    <p className="text-xs font-black uppercase tracking-[.18em] text-cyan-700">
                      Ghi nhớ
                    </p>
                  </div>

                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
                    <li>
                      <strong className="text-slate-950">Reading:</strong> nên
                      chia đủ Passage 1, 2, 3.
                    </li>
                    <li>
                      <strong className="text-slate-950">Writing:</strong> Task
                      1 và Task 2 phải là hai dòng riêng.
                    </li>
                    <li>
                      <strong className="text-slate-950">Speaking:</strong> câu
                      hỏi cần gắn đúng Part 1, 2, 3.
                    </li>
                    <li>
                      <strong className="text-slate-950">Test:</strong> chỉ dùng
                      để ghép các đề đã có trong ngân hàng.
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                    File được chấp nhận
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[".xlsx", ".xls", ".csv"].map((item) => (
                      <Pill key={item}>{item}</Pill>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}
