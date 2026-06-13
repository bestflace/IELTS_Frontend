"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Clock3,
  Headphones,
  Mic,
  PenLine,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import type { TestSection, TestSectionType } from "@/types";

type Props = {
  section: TestSection;
  index: number;
  total: number;
  disabled?: boolean;
  onDelete: (section: TestSection) => void;
  onMoveUp: (section: TestSection) => void;
  onMoveDown: (section: TestSection) => void;
  onUpdateTimeLimit: (
    section: TestSection,
    timeLimitSec: number | null,
  ) => Promise<void>;
};

const sectionMeta: Record<
  TestSectionType,
  {
    label: string;
    icon: typeof BookOpen;
    tone: "sage" | "brown" | "warning" | "success" | "default";
  }
> = {
  LISTENING_SET: {
    label: "Listening",
    icon: Headphones,
    tone: "sage",
  },
  READING_SET: {
    label: "Reading",
    icon: BookOpen,
    tone: "brown",
  },
  WRITING_TASK: {
    label: "Writing",
    icon: PenLine,
    tone: "warning",
  },
  SPEAKING_SET: {
    label: "Speaking",
    icon: Mic,
    tone: "success",
  },
};

const formatMinutes = (seconds?: number | null) => {
  if (!seconds) return "Chưa đặt";
  return `${Math.round(seconds / 60)} phút`;
};

const getSourceId = (section: TestSection) => {
  if (section.readingSetId) return section.readingSetId;
  if (section.listeningSetId) return section.listeningSetId;
  if (section.writingTaskId) return section.writingTaskId;
  if (section.speakingSetId) return section.speakingSetId;
  return "Chưa chọn nguồn";
};

export function TestSectionCard({
  section,
  index,
  total,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdateTimeLimit,
  disabled = false,
}: Props) {
  const meta = sectionMeta[section.sectionType];
  const Icon = meta.icon;
  const [editingTime, setEditingTime] = useState(false);
  const [minutes, setMinutes] = useState(
    section.timeLimitSec ? String(Math.round(section.timeLimitSec / 60)) : "",
  );
  const [saving, setSaving] = useState(false);

  const handleSaveTime = async () => {
    setSaving(true);

    const parsed = minutes ? Number(minutes) : 0;
    const nextValue = parsed > 0 ? parsed * 60 : null;

    try {
      await onUpdateTimeLimit(section, nextValue);
      setEditingTime(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50/70">
            <Icon className="h-5 w-5 text-cyan-700" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={meta.tone}>{meta.label}</Badge>
              <span className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">
                Section {index + 1}
              </span>
            </div>

            <h3 className="mt-2 font-serif text-xl font-bold text-slate-950">
              {section.partLabel || meta.label}
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Source ID:{" "}
              <span className="font-mono">{getSourceId(section)}</span>
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Clock3 className="h-3.5 w-3.5" />
                {formatMinutes(section.timeLimitSec)}
              </span>
              <span>Sort order: {section.sortOrder}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {editingTime ? (
            <div className="flex items-center gap-2">
              <Input
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                className="h-9 w-24"
                placeholder="Phút"
                type="number"
                min={0}
              />
              <Button size="sm" onClick={handleSaveTime} disabled={saving}>
                Lưu
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setEditingTime(false)}
              >
                Hủy
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingTime(true)}
              disabled={disabled}
            >
              Sửa thời gian
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            disabled={disabled || index === 0}
            onClick={() => onMoveUp(section)}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled={disabled || index === total - 1}
            onClick={() => onMoveDown(section)}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(section)}
            disabled={disabled}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
