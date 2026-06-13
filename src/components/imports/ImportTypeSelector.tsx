"use client";

import { CheckCircle2, FileSpreadsheet } from "lucide-react";
import type { ImportType } from "@/lib/api/imports.api";

export const IMPORT_TYPE_OPTIONS: Array<{
  value: ImportType;
  label: string;
  subtitle: string;
}> = [
  {
    value: "READING_SET",
    label: "Reading Set",
    subtitle: 'Cần sheet "reading_set" và "questions".',
  },
  {
    value: "LISTENING_SET",
    label: "Listening Set",
    subtitle: 'Cần sheet "listening_set" và "questions".',
  },
  {
    value: "WRITING_TASK",
    label: "Writing Task",
    subtitle: 'Cần sheet "writing_task".',
  },
  {
    value: "SPEAKING_SET",
    label: "Speaking Set",
    subtitle: 'Cần sheet "speaking_set", "parts", "prompts", "items".',
  },
  {
    value: "TEST",
    label: "Test",
    subtitle: 'Cần sheet "test" và "sections".',
  },
];

type Props = {
  value: ImportType;
  disabled?: boolean;
  onChange: (value: ImportType) => void;
};

export function getImportTypeText(type?: string | null) {
  return (
    IMPORT_TYPE_OPTIONS.find((item) => item.value === type)?.label ||
    type ||
    "—"
  );
}

export function ImportTypeSelector({ value, disabled, onChange }: Props) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-950">
        Loại import
      </label>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {IMPORT_TYPE_OPTIONS.map((item) => {
          const active = item.value === value;

          return (
            <button
              key={item.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(item.value)}
              className={`rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? "border-cyan-300 bg-cyan-50 text-cyan-700"
                  : "border-cyan-100 bg-cyan-50/70 text-slate-950 hover:border-cyan-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    active
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white"
                      : "bg-white/80 text-cyan-700"
                  }`}
                >
                  {active ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <FileSpreadsheet className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
