"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Info,
  Table2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import type { ImportType } from "@/lib/api/imports.api";

type ColumnSpec = {
  name: string;
  required?: boolean;
  note: string;
  example?: string;
};

type SheetSpec = {
  name: string;
  required: boolean;
  description: string;
  columns: ColumnSpec[];
  sampleRows?: Record<string, string>[];
};

type TemplateSpec = {
  title: string;
  summary: string;
  sheets: SheetSpec[];
  commonErrors: string[];
};

const QUESTION_COLUMNS: ColumnSpec[] = [
  {
    name: "q_no",
    required: true,
    note: "Số thứ tự câu hỏi.",
    example: "1",
  },
  {
    name: "question_type",
    required: true,
    note: "Loại câu hỏi. Phải đúng enum backend đang hỗ trợ.",
    example: "SHORT_ANSWER",
  },
  {
    name: "prompt_text",
    note: "Nội dung câu hỏi.",
    example: "What is the main idea of the passage?",
  },
  {
    name: "section_label",
    note: "Nhãn nhóm câu hỏi nếu có.",
    example: "Questions 1-5",
  },
  {
    name: "instruction_text",
    note: "Hướng dẫn làm nhóm câu hỏi.",
    example: "Answer the questions below.",
  },
  {
    name: "options_json",
    note: "Danh sách lựa chọn dạng JSON. Dùng cho multiple choice/matching.",
    example: '["A. True", "B. False", "C. Not Given"]',
  },
  {
    name: "correct_answer_json",
    note: "Đáp án dạng JSON. Nếu 1 đáp án text thì vẫn cần đặt trong dấu ngoặc kép.",
    example: '"Answer"',
  },
  {
    name: "explanation",
    note: "Giải thích đáp án.",
    example: "The answer is found in paragraph 2.",
  },
  {
    name: "points",
    note: "Điểm của câu. Nếu trống thường mặc định 1.",
    example: "1",
  },
  {
    name: "sort_order",
    note: "Thứ tự hiển thị câu hỏi.",
    example: "1",
  },
];

const TEMPLATE_SPECS: Record<ImportType, TemplateSpec> = {
  READING_SET: {
    title: "Template Reading Set",
    summary:
      'File Reading bắt buộc có sheet "reading_set" và "questions". Worker sẽ không đọc Sheet1 mặc định.',
    sheets: [
      {
        name: "reading_set",
        required: true,
        description:
          "Sheet chính của bài đọc. Worker lấy dòng dữ liệu đầu tiên để tạo Reading Set.",
        columns: [
          {
            name: "id",
            required: true,
            note: "Mã Reading Set duy nhất.",
            example: "READ_DEMO_001",
          },
          {
            name: "title",
            required: true,
            note: "Tên bài đọc.",
            example: "Demo Reading Set",
          },
          {
            name: "passage_html",
            note: "Nội dung bài đọc dạng HTML nếu có.",
            example: "<p>Sample passage</p>",
          },
          {
            name: "passage_text",
            note: "Nội dung bài đọc dạng text.",
            example: "Sample passage",
          },
          {
            name: "level",
            note: "Band mục tiêu.",
            example: "6.5",
          },
          {
            name: "status",
            note: "Trạng thái xuất bản.",
            example: "DRAFT",
          },
          {
            name: "tag_slugs",
            note: "Danh sách tag slug, cách nhau bằng dấu phẩy.",
            example: "reading,academic",
          },
        ],
        sampleRows: [
          {
            id: "READ_DEMO_001",
            title: "Demo Reading Set",
            passage_text: "Sample passage",
            level: "6.5",
            status: "DRAFT",
            tag_slugs: "reading,academic",
          },
        ],
      },
      {
        name: "questions",
        required: true,
        description:
          "Danh sách câu hỏi của Reading Set. Mỗi dòng là một câu hỏi.",
        columns: QUESTION_COLUMNS,
        sampleRows: [
          {
            q_no: "1",
            question_type: "SHORT_ANSWER",
            prompt_text: "What is the main idea?",
            correct_answer_json: '"Answer"',
            points: "1",
            sort_order: "1",
          },
        ],
      },
    ],
    commonErrors: [
      'Sai tên sheet: phải là "reading_set", không phải "Reading", "Sheet1" hoặc "reading".',
      'Sheet "reading_set" có header nhưng không có dòng dữ liệu.',
      "Thiếu cột bắt buộc id hoặc title.",
      'correct_answer_json không đúng JSON. Ví dụ text phải là "Answer", nhiều đáp án là ["A", "B"].',
    ],
  },

  LISTENING_SET: {
    title: "Template Listening Set",
    summary:
      'File Listening bắt buộc có sheet "listening_set" và "questions". Audio có thể để dạng URL.',
    sheets: [
      {
        name: "listening_set",
        required: true,
        description:
          "Sheet chính của bài nghe. Worker lấy dòng đầu tiên để tạo Listening Set.",
        columns: [
          {
            name: "id",
            required: true,
            note: "Mã Listening Set duy nhất.",
            example: "LIS_DEMO_001",
          },
          {
            name: "title",
            required: true,
            note: "Tên bài nghe.",
            example: "Demo Listening Set",
          },
          {
            name: "transcript_text",
            note: "Transcript bài nghe.",
            example: "Speaker 1: Hello...",
          },
          {
            name: "audio_url",
            note: "Link audio đã upload.",
            example: "https://example.com/audio.mp3",
          },
          {
            name: "audio_source",
            note: "Nguồn audio.",
            example: "URL",
          },
          {
            name: "level",
            note: "Band mục tiêu.",
            example: "6.5",
          },
          {
            name: "status",
            note: "Trạng thái xuất bản.",
            example: "DRAFT",
          },
          {
            name: "tag_slugs",
            note: "Danh sách tag slug, cách nhau bằng dấu phẩy.",
            example: "listening,section-1",
          },
        ],
        sampleRows: [
          {
            id: "LIS_DEMO_001",
            title: "Demo Listening Set",
            audio_url: "https://example.com/audio.mp3",
            audio_source: "URL",
            level: "6.5",
            status: "DRAFT",
          },
        ],
      },
      {
        name: "questions",
        required: true,
        description:
          "Danh sách câu hỏi của Listening Set. Format giống sheet questions của Reading.",
        columns: QUESTION_COLUMNS,
        sampleRows: [
          {
            q_no: "1",
            question_type: "SHORT_ANSWER",
            prompt_text: "Write one word only.",
            correct_answer_json: '"library"',
            points: "1",
            sort_order: "1",
          },
        ],
      },
    ],
    commonErrors: [
      'Sai tên sheet: phải là "listening_set".',
      "Thiếu id hoặc title ở sheet listening_set.",
      "audio_url không bắt buộc, nhưng nếu có thì nên là URL hợp lệ.",
      "correct_answer_json phải là JSON hợp lệ.",
    ],
  },

  WRITING_TASK: {
    title: "Template Writing Task",
    summary:
      'File Writing bắt buộc có sheet "writing_task". Worker lấy dòng đầu tiên để tạo Writing Task.',
    sheets: [
      {
        name: "writing_task",
        required: true,
        description:
          "Sheet chính của đề Writing. Mỗi file nên import một task chính.",
        columns: [
          {
            name: "id",
            required: true,
            note: "Mã Writing Task duy nhất.",
            example: "WRI_DEMO_001",
          },
          {
            name: "title",
            required: true,
            note: "Tên đề Writing.",
            example: "Writing Task 2 - Education",
          },
          {
            name: "prompt_text",
            required: true,
            note: "Nội dung đề bài.",
            example:
              "Some people believe that university education should be free...",
          },
          {
            name: "task_no",
            note: "Task 1 hoặc Task 2.",
            example: "2",
          },
          {
            name: "chart_url",
            note: "Link biểu đồ nếu là Task 1.",
            example: "https://example.com/chart.png",
          },
          {
            name: "image_url",
            note: "Link ảnh minh họa nếu có.",
            example: "https://example.com/image.png",
          },
          {
            name: "level",
            note: "Band mục tiêu.",
            example: "6.5",
          },
          {
            name: "status",
            note: "Trạng thái xuất bản.",
            example: "DRAFT",
          },
          {
            name: "tag_slugs",
            note: "Danh sách tag slug, cách nhau bằng dấu phẩy.",
            example: "writing,task-2,education",
          },
        ],
        sampleRows: [
          {
            id: "WRI_DEMO_001",
            title: "Writing Task 2 - Education",
            prompt_text:
              "Some people believe that university education should be free...",
            task_no: "2",
            level: "6.5",
            status: "DRAFT",
          },
        ],
      },
    ],
    commonErrors: [
      'Sai tên sheet: phải là "writing_task".',
      "Thiếu một trong các cột bắt buộc: id, title, prompt_text.",
      "task_no nên là 1 hoặc 2.",
      "chart_url/image_url nên là URL hợp lệ nếu có.",
    ],
  },

  SPEAKING_SET: {
    title: "Template Speaking Set",
    summary:
      'File Speaking bắt buộc có các sheet "speaking_set", "parts", "prompts", "items".',
    sheets: [
      {
        name: "speaking_set",
        required: true,
        description:
          "Sheet chính của bộ Speaking. Worker lấy dòng đầu tiên để tạo Speaking Set.",
        columns: [
          {
            name: "id",
            required: true,
            note: "Mã Speaking Set duy nhất.",
            example: "SPK_DEMO_001",
          },
          {
            name: "topic",
            note: "Chủ đề Speaking.",
            example: "Travel",
          },
          {
            name: "level",
            note: "Band mục tiêu.",
            example: "6.5",
          },
          {
            name: "status",
            note: "Trạng thái xuất bản.",
            example: "DRAFT",
          },
          {
            name: "tag_slugs",
            note: "Danh sách tag slug, cách nhau bằng dấu phẩy.",
            example: "speaking,travel",
          },
        ],
        sampleRows: [
          {
            id: "SPK_DEMO_001",
            topic: "Travel",
            level: "6.5",
            status: "DRAFT",
          },
        ],
      },
      {
        name: "parts",
        required: true,
        description:
          "Khai báo các part trong bài Speaking. part_key dùng để sheet prompts tham chiếu.",
        columns: [
          {
            name: "part_key",
            note: "Khóa tạm trong file Excel, ví dụ p1, p2, p3.",
            example: "p1",
          },
          {
            name: "part_type",
            required: true,
            note: "Loại part.",
            example: "PART_1",
          },
          {
            name: "title",
            note: "Tên part.",
            example: "Introduction and Interview",
          },
          {
            name: "instructions",
            note: "Hướng dẫn.",
            example: "Answer the questions.",
          },
          {
            name: "recommended_sec",
            note: "Thời lượng gợi ý tính bằng giây.",
            example: "300",
          },
          {
            name: "sort_order",
            note: "Thứ tự part.",
            example: "1",
          },
        ],
        sampleRows: [
          {
            part_key: "p1",
            part_type: "PART_1",
            title: "Introduction and Interview",
            recommended_sec: "300",
            sort_order: "1",
          },
        ],
      },
      {
        name: "prompts",
        required: true,
        description: "Danh sách prompt. part_key phải khớp với sheet parts.",
        columns: [
          {
            name: "prompt_key",
            note: "Khóa tạm để sheet items tham chiếu.",
            example: "p1_q1",
          },
          {
            name: "part_key",
            required: true,
            note: "Phải khớp part_key trong sheet parts.",
            example: "p1",
          },
          {
            name: "prompt_type",
            required: true,
            note: "Loại prompt.",
            example: "QUESTION",
          },
          {
            name: "content",
            note: "Nội dung prompt.",
            example: "Do you like travelling?",
          },
          {
            name: "notes",
            note: "Ghi chú nếu có.",
            example: "Warm-up question",
          },
          {
            name: "time_suggest_sec",
            note: "Thời gian gợi ý.",
            example: "30",
          },
          {
            name: "sort_order",
            note: "Thứ tự prompt.",
            example: "1",
          },
        ],
        sampleRows: [
          {
            prompt_key: "p1_q1",
            part_key: "p1",
            prompt_type: "QUESTION",
            content: "Do you like travelling?",
            time_suggest_sec: "30",
            sort_order: "1",
          },
        ],
      },
      {
        name: "items",
        required: true,
        description:
          "Câu hỏi phụ thuộc prompt. prompt_key phải khớp với sheet prompts.",
        columns: [
          {
            name: "prompt_key",
            required: true,
            note: "Phải khớp prompt_key trong sheet prompts.",
            example: "p1_q1",
          },
          {
            name: "item_text",
            note: "Nội dung câu hỏi phụ.",
            example: "Where do you usually travel?",
          },
          {
            name: "sort_order",
            note: "Thứ tự item.",
            example: "1",
          },
        ],
        sampleRows: [
          {
            prompt_key: "p1_q1",
            item_text: "Where do you usually travel?",
            sort_order: "1",
          },
        ],
      },
    ],
    commonErrors: [
      'Sai tên sheet: phải có đủ "speaking_set", "parts", "prompts", "items".',
      "part_key trong prompts không khớp với part_key trong parts.",
      "prompt_key trong items không khớp với prompt_key trong prompts.",
      "part_type nên là PART_1, PART_2 hoặc PART_3.",
    ],
  },

  TEST: {
    title: "Template Test",
    summary:
      'File Test bắt buộc có sheet "test" và "sections". Các section phải tham chiếu ID ngân hàng đề đã tồn tại.',
    sheets: [
      {
        name: "test",
        required: true,
        description:
          "Sheet chính của đề thi. Worker lấy dòng đầu tiên để tạo test.",
        columns: [
          {
            name: "id",
            required: true,
            note: "Mã Test duy nhất.",
            example: "TEST_DEMO_001",
          },
          {
            name: "title",
            required: true,
            note: "Tên đề thi.",
            example: "Cambridge Style Full Test 01",
          },
          {
            name: "type",
            required: true,
            note: "Loại đề.",
            example: "FULL",
          },
          {
            name: "level",
            note: "Band mục tiêu.",
            example: "6.5",
          },
          {
            name: "description",
            note: "Mô tả đề thi.",
            example: "Full IELTS practice test.",
          },
          {
            name: "status",
            note: "Trạng thái xuất bản.",
            example: "DRAFT",
          },
          {
            name: "tag_slugs",
            note: "Danh sách tag slug, cách nhau bằng dấu phẩy.",
            example: "full-test,cambridge",
          },
        ],
        sampleRows: [
          {
            id: "TEST_DEMO_001",
            title: "Cambridge Style Full Test 01",
            type: "FULL",
            level: "6.5",
            status: "DRAFT",
          },
        ],
      },
      {
        name: "sections",
        required: true,
        description:
          "Danh sách section trong đề. Mỗi dòng tham chiếu một set/task đã tồn tại trong ngân hàng đề.",
        columns: [
          {
            name: "section_type",
            required: true,
            note: "Loại section.",
            example: "READING_SET",
          },
          {
            name: "reading_set_id",
            note: "ID Reading Set nếu section_type là READING_SET.",
            example: "READ_DEMO_001",
          },
          {
            name: "listening_set_id",
            note: "ID Listening Set nếu section_type là LISTENING_SET.",
            example: "LIS_DEMO_001",
          },
          {
            name: "writing_task_id",
            note: "ID Writing Task nếu section_type là WRITING_TASK.",
            example: "WRI_DEMO_001",
          },
          {
            name: "speaking_set_id",
            note: "ID Speaking Set nếu section_type là SPEAKING_SET.",
            example: "SPK_DEMO_001",
          },
          {
            name: "part_label",
            note: "Nhãn section.",
            example: "Reading Passage 1",
          },
          {
            name: "sort_order",
            note: "Thứ tự section.",
            example: "1",
          },
          {
            name: "time_limit_sec",
            note: "Thời gian làm bài tính bằng giây.",
            example: "3600",
          },
        ],
        sampleRows: [
          {
            section_type: "READING_SET",
            reading_set_id: "READ_DEMO_001",
            part_label: "Reading",
            sort_order: "1",
            time_limit_sec: "3600",
          },
        ],
      },
    ],
    commonErrors: [
      'Sai tên sheet: phải có "test" và "sections".',
      "section_type phải khớp loại ID đi kèm.",
      "Các ID reading_set_id/listening_set_id/writing_task_id/speaking_set_id phải tồn tại trước trong ngân hàng đề.",
      "type nên là READING, LISTENING, WRITING, SPEAKING hoặc FULL.",
    ],
  },
};
function downloadTemplate(type: ImportType) {
  const spec = TEMPLATE_SPECS[type];
  const workbook = XLSX.utils.book_new();

  spec.sheets.forEach((sheet) => {
    const headers = sheet.columns.map((column) => column.name);

    const sampleRow =
      sheet.sampleRows?.[0] ||
      Object.fromEntries(headers.map((header) => [header, ""]));

    const data = [headers, headers.map((header) => sampleRow[header] || "")];

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    worksheet["!cols"] = headers.map((header) => ({
      wch: Math.max(header.length + 4, 18),
    }));

    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  const fileName = `${type.toLowerCase()}_template.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
function ColumnTable({ sheet }: { sheet: SheetSpec }) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-cyan-100 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="border-b border-cyan-100 bg-cyan-50/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-serif text-xl font-bold text-slate-950">
            Sheet: {sheet.name}
          </span>
          {sheet.required ? (
            <span className="rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              Bắt buộc
            </span>
          ) : (
            <span className="rounded-full border border-cyan-100 bg-cyan-50/70 px-3 py-1 text-xs font-semibold text-slate-500">
              Tùy chọn
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {sheet.description}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead className="bg-cyan-50/70 text-left">
            <tr className="border-b border-cyan-100">
              <th className="px-4 py-3 font-semibold text-slate-950">Cột</th>
              <th className="px-4 py-3 font-semibold text-slate-950">
                Bắt buộc
              </th>
              <th className="px-4 py-3 font-semibold text-slate-950">
                Ý nghĩa
              </th>
              <th className="px-4 py-3 font-semibold text-slate-950">Ví dụ</th>
            </tr>
          </thead>

          <tbody>
            {sheet.columns.map((column) => (
              <tr
                key={column.name}
                className="border-b border-cyan-100 last:border-b-0"
              >
                <td className="px-4 py-3 align-top">
                  <code className="rounded-lg bg-cyan-50/70 px-2 py-1 text-xs font-semibold text-cyan-700">
                    {column.name}
                  </code>
                </td>
                <td className="px-4 py-3 align-top">
                  {column.required ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Có
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">
                      Không
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 align-top text-slate-500">
                  {column.note}
                </td>
                <td className="px-4 py-3 align-top">
                  <code className="block max-w-[260px] truncate rounded-lg bg-cyan-50/70 px-2 py-1 text-xs text-slate-950">
                    {column.example || "—"}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sheet.sampleRows?.length ? (
        <div className="border-t border-cyan-100 bg-cyan-50/70 p-4">
          <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
            Dòng mẫu
          </p>
          <pre className="mt-2 max-h-[160px] overflow-auto rounded-xl border border-cyan-100 bg-white/80 p-3 text-xs leading-6 text-slate-950">
            {JSON.stringify(sheet.sampleRows[0], null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  );
}

export function ImportTemplateGuide({ type }: { type: ImportType }) {
  const spec = TEMPLATE_SPECS[type];

  return (
    <Card className="rounded-[34px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-50">
              <FileSpreadsheet className="h-6 w-6 text-cyan-700" />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-700">
                Mẫu file import
              </p>

              <h2 className="mt-1 font-serif text-2xl font-black text-slate-950">
                {spec.title}
              </h2>

              <p className="mt-2 text-sm leading-7 text-slate-500">
                {spec.summary}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => downloadTemplate(type)}
            className="shrink-0"
          >
            <Download className="h-4 w-4" />
            Tải file mẫu Excel
          </Button>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <p className="font-semibold text-amber-900">Quy tắc quan trọng</p>
              <p className="mt-1 text-sm leading-7 text-amber-800">
                Tên sheet và tên cột phải viết đúng như bên dưới. Worker không
                tự hiểu các tên như Sheet1, Reading, Question List hoặc tiếng
                Việt.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {spec.sheets.map((sheet) => (
            <ColumnTable key={sheet.name} sheet={sheet} />
          ))}
        </div>

        <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Table2 className="h-5 w-5 text-cyan-700" />
            <h3 className="font-serif text-xl font-bold text-slate-950">
              Sheet bắt buộc
            </h3>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {spec.sheets
              .filter((sheet) => sheet.required)
              .map((sheet) => (
                <span
                  key={sheet.name}
                  className="rounded-full border border-cyan-100 bg-white/80 px-3 py-1 text-xs font-semibold text-cyan-700"
                >
                  {sheet.name}
                </span>
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-700" />
            <div>
              <h3 className="font-serif text-xl font-bold text-red-800">
                Lỗi thường gặp
              </h3>

              <div className="mt-3 space-y-2">
                {spec.commonErrors.map((item) => (
                  <div
                    key={item}
                    className="flex gap-2 text-sm leading-6 text-red-800"
                  >
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
