"use client";

import { Mic } from "lucide-react";

import { SpeakingRecorder } from "@/components/attempts/speaking/SpeakingRecorder";
import { Badge } from "@/components/common/Badge";

type BackendSpeakingPart = "PART_1" | "PART_2" | "PART_3";

type SpeakingPrompt = {
  id?: string;
  promptText?: string | null;
  prompt_text?: string | null;
  cueCardText?: string | null;
  cue_card_text?: string | null;
  questionText?: string | null;
  question_text?: string | null;
  content?: string | null;
  text?: string | null;
  title?: string | null;
  body?: string | null;
  items?: Array<{
    id?: string;
    itemText?: string | null;
    item_text?: string | null;
    content?: string | null;
    text?: string | null;
  }>;
};

type SpeakingPart = {
  id?: string;
  partNo?: number | null;
  partNumber?: number | null;
  part_no?: number | null;
  part_type?: string | null;
  partType?: string | null;
  title?: string | null;
  instructionText?: string | null;
  instruction_text?: string | null;
  instructions?: string | null;
  prompts?: SpeakingPrompt[];
};

type SpeakingResponse = {
  speakingPart?: string | null;
  speaking_part?: string | null;
  audioUrl?: string | null;
  audio_url?: string | null;
};

type Props = {
  attemptId: string;
  title?: string | null;
  part: SpeakingPart;
  partIndex: number;
  readonly?: boolean;
  speakingResponses?: SpeakingResponse[];
  onSaved?: () => void;
};

function getPromptText(prompt: SpeakingPrompt) {
  return (
    prompt.promptText ||
    prompt.prompt_text ||
    prompt.questionText ||
    prompt.question_text ||
    prompt.cueCardText ||
    prompt.cue_card_text ||
    prompt.content ||
    prompt.text ||
    prompt.title ||
    prompt.body ||
    ""
  );
}

function getPromptItems(prompt: SpeakingPrompt) {
  if (!Array.isArray(prompt.items)) return [];

  return prompt.items
    .map(
      (item) =>
        item.itemText || item.item_text || item.content || item.text || "",
    )
    .filter(Boolean);
}

function normalizeSpeakingPartNo(part: SpeakingPart, partIndex: number) {
  const raw =
    part.partNo ||
    part.partNumber ||
    part.part_no ||
    part.partType ||
    part.part_type ||
    partIndex + 1;

  if (raw === "PART_2" || raw === "Part 2" || raw === 2 || raw === "2") {
    return 2;
  }

  if (raw === "PART_3" || raw === "Part 3" || raw === 3 || raw === "3") {
    return 3;
  }

  return 1;
}

function toBackendSpeakingPart(no: number): BackendSpeakingPart {
  if (no === 2) return "PART_2";
  if (no === 3) return "PART_3";
  return "PART_1";
}

function getResponseSpeakingPart(response: SpeakingResponse) {
  return response.speakingPart || response.speaking_part || "";
}

function getResponseAudioUrl(response?: SpeakingResponse | null) {
  return response?.audioUrl || response?.audio_url || null;
}

export function SpeakingPracticeView({
  attemptId,
  title,
  part,
  partIndex,
  readonly = false,
  speakingResponses = [],
  onSaved,
}: Props) {
  const partNo = normalizeSpeakingPartNo(part, partIndex);
  const backendSpeakingPart = toBackendSpeakingPart(partNo);
  const speakingPartLabel = `Part ${partNo}`;
  const prompts = part.prompts || [];

  const savedResponse =
    speakingResponses.find(
      (response) => getResponseSpeakingPart(response) === backendSpeakingPart,
    ) || null;

  const initialAudioUrl = getResponseAudioUrl(savedResponse);

  return (
    <main className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(460px,0.92fr)] bg-gradient-to-br from-cyan-50 via-white to-blue-50">
      <section className="min-h-0 border-r border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/70">
        <div className="h-full overflow-y-auto px-9 py-8">
          <div className="mx-auto max-w-4xl">
            <Badge tone="sage">IELTS Speaking</Badge>

            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight text-slate-950">
              {title || "Speaking Practice"}
            </h1>

            <div className="mt-8 rounded-3xl border border-cyan-100 bg-white/90 p-6 shadow-[0_14px_38px_rgba(14,165,233,0.08)]">
              <div className="mb-5 flex items-start gap-3">
                <Mic className="mt-1 h-6 w-6 shrink-0 text-cyan-700" />

                <div>
                  <p className="font-serif text-2xl font-bold text-slate-950">
                    Part {partNo}: {part.title || "Speaking Part"}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {part.instructions ||
                      part.instructionText ||
                      part.instruction_text ||
                      "Read the prompts and record your answer."}
                  </p>
                </div>
              </div>

              {prompts.length ? (
                <div className="space-y-3">
                  {prompts.map((prompt, index) => {
                    const items = getPromptItems(prompt);

                    return (
                      <div
                        key={prompt.id || index}
                        className="rounded-2xl border border-cyan-100 bg-white/75 p-4 text-base leading-8 text-slate-950"
                      >
                        <p>
                          {getPromptText(prompt) ||
                            "Chưa có nội dung câu hỏi. Kiểm tra lại file import Speaking."}
                        </p>

                        {items.length ? (
                          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-7 text-slate-500">
                            {items.map((item, itemIndex) => (
                              <li key={`${index}-${itemIndex}`}>{item}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-cyan-100 bg-white/75 p-5 text-sm leading-6 text-slate-500">
                  Chưa có prompt cho Speaking Part {partNo}. Kiểm tra lại sheet
                  prompts và part_key trong file import Speaking.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-0 bg-white/65 backdrop-blur-xl">
        <div className="h-full overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-3xl">
            <SpeakingRecorder
              key={`${attemptId}-${backendSpeakingPart}`}
              attemptId={attemptId}
              speakingPart={backendSpeakingPart}
              speakingPartLabel={speakingPartLabel}
              initialAudioUrl={initialAudioUrl}
              disabled={readonly}
              onSaved={onSaved}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
