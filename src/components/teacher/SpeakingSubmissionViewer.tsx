"use client";

import {
  FileAudio,
  Headphones,
  MessageSquareText,
  Mic,
  UserRound,
} from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/common/Card";

type Props = {
  submission: any;
};

type SpeakingPartView = {
  partNo: number;
  title: string;
  instructions: string;
  prompts: string[];
};

type SpeakingResponseView = {
  id?: string;
  speakingPart?: string;
  audioUrl?: string;
  transcript?: string;
  durationSec?: number;
};

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStudentName(submission: any) {
  return (
    submission?.learner?.fullName ||
    submission?.learner?.full_name ||
    submission?.learner?.email ||
    submission?.student?.fullName ||
    submission?.student?.full_name ||
    submission?.student?.email ||
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

function getTopic(submission: any) {
  return (
    submission?.speakingSet?.topic ||
    submission?.speaking_set?.topic ||
    submission?.set?.topic ||
    submission?.topic ||
    getTestTitle(submission)
  );
}

function getPromptText(prompt: any) {
  if (typeof prompt === "string") return prompt;

  return (
    prompt?.promptText ||
    prompt?.prompt_text ||
    prompt?.questionText ||
    prompt?.question_text ||
    prompt?.cueCardText ||
    prompt?.cue_card_text ||
    prompt?.content ||
    prompt?.text ||
    ""
  );
}

function normalizePartNo(value: any, fallback: number) {
  const raw =
    value?.partNo ||
    value?.part_no ||
    value?.partNumber ||
    value?.part_number ||
    value?.speakingPart ||
    value?.speaking_part ||
    value?.part_type ||
    value?.partType;

  if (raw === "PART_2" || raw === "Part 2" || raw === 2 || raw === "2") {
    return 2;
  }

  if (raw === "PART_3" || raw === "Part 3" || raw === 3 || raw === "3") {
    return 3;
  }

  return fallback || 1;
}

function getSpeakingResponses(submission: any): SpeakingResponseView[] {
  const responses =
    submission?.speakingResponses ||
    submission?.speaking_responses ||
    submission?.attempt?.speakingResponses ||
    submission?.attempt?.attempt_speaking_responses ||
    submission?.attempt_speaking_responses ||
    [];

  if (!Array.isArray(responses)) return [];

  return responses.map((item: any) => ({
    id: item.id,
    speakingPart: item.speakingPart || item.speaking_part,
    audioUrl:
      item.audioUrl ||
      item.audio_url ||
      item.recordingUrl ||
      item.recording_url ||
      "",
    transcript:
      item.transcript || item.transcriptText || item.transcript_text || "",
    durationSec:
      typeof item.durationSec === "number"
        ? item.durationSec
        : typeof item.duration_sec === "number"
          ? item.duration_sec
          : undefined,
  }));
}

function collectSpeakingPartsFromSnapshot(snapshot: any): SpeakingPartView[] {
  const result: SpeakingPartView[] = [];
  const seen = new Set<number>();

  function pushPart(raw: any, fallbackNo: number) {
    if (!isObject(raw)) return;

    const partNo = normalizePartNo(raw, fallbackNo);
    if (seen.has(partNo)) return;

    const prompts = Array.isArray(raw.prompts)
      ? raw.prompts.map(getPromptText).filter(Boolean)
      : Array.isArray(raw.items)
        ? raw.items.map(getPromptText).filter(Boolean)
        : [];

    seen.add(partNo);

    result.push({
      partNo,
      title: raw.title || raw.name || `Speaking Part ${partNo}`,
      instructions:
        raw.instructions || raw.instructionText || raw.instruction_text || "",
      prompts,
    });
  }

  function walk(value: any) {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (!isObject(value)) return;

    const speakingSet = value.speakingSet || value.speaking_set;

    if (isObject(speakingSet)) {
      const parts =
        speakingSet.parts ||
        speakingSet.speakingParts ||
        speakingSet.speaking_parts;

      if (Array.isArray(parts)) {
        parts.forEach((part, index) => pushPart(part, index + 1));
      }
    }

    if (Array.isArray(value.parts)) {
      value.parts.forEach((part: any, index: number) =>
        pushPart(part, index + 1),
      );
    }

    Object.values(value).forEach(walk);
  }

  walk(snapshot);

  return result.sort((a, b) => a.partNo - b.partNo);
}

function getSpeakingParts(submission: any): SpeakingPartView[] {
  const directParts =
    submission?.speakingSet?.parts ||
    submission?.speaking_set?.parts ||
    submission?.parts ||
    [];

  if (Array.isArray(directParts) && directParts.length) {
    return directParts
      .map((part: any, index: number) => ({
        partNo: normalizePartNo(part, index + 1),
        title: part.title || `Speaking Part ${index + 1}`,
        instructions:
          part.instructions ||
          part.instructionText ||
          part.instruction_text ||
          "",
        prompts: Array.isArray(part.prompts)
          ? part.prompts.map(getPromptText).filter(Boolean)
          : [],
      }))
      .sort((a, b) => a.partNo - b.partNo);
  }

  const snapshotParts = collectSpeakingPartsFromSnapshot(
    submission?.snapshot ||
      submission?.attemptSnapshot ||
      submission?.attempt_snapshot ||
      submission?.attempt?.snapshot,
  );

  if (snapshotParts.length) return snapshotParts;

  return [
    {
      partNo: 1,
      title: "Speaking Part 1",
      instructions: "Answer short questions about familiar topics.",
      prompts: [],
    },
    {
      partNo: 2,
      title: "Speaking Part 2",
      instructions: "Speak about the topic on the cue card.",
      prompts: [],
    },
    {
      partNo: 3,
      title: "Speaking Part 3",
      instructions: "Answer discussion questions related to the topic.",
      prompts: [],
    },
  ];
}

function backendPart(partNo: number) {
  if (partNo === 2) return "PART_2";
  if (partNo === 3) return "PART_3";
  return "PART_1";
}

function findResponseForPart(
  partNo: number,
  responses: SpeakingResponseView[],
) {
  const expected = backendPart(partNo);

  return (
    responses.find((item) => item.speakingPart === expected) ||
    responses.find((item) => item.speakingPart === `Part ${partNo}`) ||
    responses.find((item) => normalizePartNo(item, 1) === partNo) ||
    null
  );
}

export function SpeakingSubmissionViewer({ submission }: Props) {
  const parts = getSpeakingParts(submission);
  const responses = getSpeakingResponses(submission);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Mic className="h-7 w-7" />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
                  Speaking submission
                </p>
                <h2 className="mt-1 font-serif text-3xl font-bold text-slate-950">
                  Bài nói của học viên
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {getStudentName(submission)} · {getTestTitle(submission)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm text-slate-500">
              Số file ghi âm:{" "}
              <span className="font-bold text-slate-950">
                {responses.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50">
              <Headphones className="h-5 w-5 text-cyan-700" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
                Chủ đề
              </p>
              <h3 className="mt-1 font-serif text-2xl font-bold text-slate-950">
                {getTopic(submission)}
              </h3>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-5">
        {parts.map((part) => {
          const response = findResponseForPart(part.partNo, responses);
          const prompts = part.prompts ?? [];
          const audioUrl = response?.audioUrl || "";
          const transcript = response?.transcript || "";

          return (
            <Card
              key={part.partNo}
              className="rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_80px_rgba(14,165,233,0.10)] backdrop-blur-2xl"
            >
              <CardHeader>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-700">
                      Speaking Part {part.partNo}
                    </p>

                    <h3 className="mt-1 font-serif text-2xl font-bold text-slate-950">
                      {part.title}
                    </h3>

                    {part.instructions ? (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {part.instructions}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={[
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      audioUrl
                        ? "bg-cyan-50 text-cyan-700"
                        : "bg-cyan-50 text-slate-500",
                    ].join(" ")}
                  >
                    {audioUrl ? "Đã có audio" : "Chưa có audio"}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5 text-cyan-700" />
                    <h4 className="font-semibold text-slate-950">
                      Prompt / câu hỏi
                    </h4>
                  </div>

                  {prompts.length ? (
                    <div className="space-y-2">
                      {prompts.map((prompt, index) => (
                        <div
                          key={`${part.partNo}-${index}`}
                          className="rounded-2xl border border-cyan-100 bg-white/90 px-3 py-2 text-sm leading-6 text-slate-950"
                        >
                          {prompt}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm leading-6 text-slate-500">
                      Không tìm thấy prompt trong dữ liệu bài làm. Giáo viên vẫn
                      có thể nghe audio để chấm.
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                    <div className="mb-4 flex items-center gap-2">
                      <FileAudio className="h-5 w-5 text-cyan-700" />
                      <h4 className="font-semibold text-slate-950">
                        File ghi âm
                      </h4>
                    </div>

                    {audioUrl ? (
                      <audio controls src={audioUrl} className="w-full">
                        Trình duyệt không hỗ trợ phát audio.
                      </audio>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-cyan-100 bg-white/80 p-6 text-center text-sm text-slate-500">
                        Chưa có file ghi âm cho Part {part.partNo}.
                      </div>
                    )}
                  </div>

                  <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-5 shadow-sm backdrop-blur-xl">
                    <div className="mb-3 flex items-center gap-2">
                      <MessageSquareText className="h-5 w-5 text-cyan-700" />
                      <h4 className="font-semibold text-slate-950">
                        Transcript
                      </h4>
                    </div>

                    {transcript ? (
                      <p className="whitespace-pre-wrap text-base leading-8 text-slate-950">
                        {transcript}
                      </p>
                    ) : (
                      <p className="text-sm leading-6 text-slate-500">
                        Chưa có transcript. Giáo viên có thể nghe file ghi âm và
                        chấm trực tiếp.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-cyan-100 bg-white/80 p-4 text-sm text-slate-500">
        <UserRound className="h-4 w-4 text-cyan-700" />
        Hãy nghe toàn bộ bài nói trước khi nhập điểm từng tiêu chí.
      </div>
    </div>
  );
}
