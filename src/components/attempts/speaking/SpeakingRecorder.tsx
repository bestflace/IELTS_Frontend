"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, Mic, Radio, Save, Square } from "lucide-react";
import { toast } from "sonner";

import { AudioPreview } from "@/components/attempts/speaking/AudioPreview";
import { Button } from "@/components/common/Button";
import { updateOneSpeakingResponse } from "@/lib/api/attempts.api";
import { uploadToCloudinary } from "@/lib/api/uploads.api";

type BackendSpeakingPart = "PART_1" | "PART_2" | "PART_3";

type Props = {
  attemptId: string;
  speakingPart: BackendSpeakingPart;
  speakingPartLabel?: string;
  disabled?: boolean;
  initialAudioUrl?: string | null;
  onSaved?: () => void;
};

function getExtensionFromMimeType(mimeType: string) {
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

function normalizeUploadedResponse(uploadedRaw: unknown) {
  const uploaded: any = (uploadedRaw as any)?.data || uploadedRaw || {};

  const audioUrl =
    uploaded.fileUrl ||
    uploaded.file_url ||
    uploaded.url ||
    uploaded.secureUrl ||
    uploaded.secure_url ||
    uploaded.cloudinaryUrl ||
    uploaded.cloudinary_url ||
    "";

  let audioFileKey =
    uploaded.fileKey ||
    uploaded.file_key ||
    uploaded.key ||
    uploaded.publicId ||
    uploaded.public_id ||
    "";

  // Không lấy assetId/asset_id làm fileKey.
  // assetId không nằm trong folder speaking-audio nên backend sẽ reject.
  if (audioFileKey.startsWith("ieltsbf/speaking-audio/")) {
    audioFileKey = audioFileKey.replace(/^ieltsbf\//, "");
  }

  if (audioFileKey && !audioFileKey.startsWith("speaking-audio/")) {
    audioFileKey = `speaking-audio/${audioFileKey}`;
  }

  return {
    audioUrl,
    audioFileKey,
  };
}

export function SpeakingRecorder({
  attemptId,
  speakingPart,
  speakingPartLabel,
  disabled = false,
  initialAudioUrl = null,
  onSaved,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(initialAudioUrl));

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const objectUrlRef = useRef<string | null>(null);

  const displayLabel = speakingPartLabel || speakingPart.replace("_", " ");

  useEffect(() => {
    recorderRef.current?.stop?.();
    streamRef.current?.getTracks().forEach((track) => track.stop());

    recorderRef.current = null;
    streamRef.current = null;
    chunksRef.current = [];

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setRecording(false);
    setAudioBlob(null);
    setAudioUrl(initialAudioUrl || null);
    setSaved(Boolean(initialAudioUrl));

    return () => {
      recorderRef.current?.stop?.();
      streamRef.current?.getTracks().forEach((track) => track.stop());

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [speakingPart, initialAudioUrl]);

  async function startRecording() {
    if (disabled || saving) return;

    try {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        const localUrl = URL.createObjectURL(blob);
        objectUrlRef.current = localUrl;

        setAudioBlob(blob);
        setAudioUrl(localUrl);
        setSaved(false);

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
      };

      recorder.start();
      setRecording(true);
    } catch {
      toast.error(
        "Không thể truy cập micro. Hãy kiểm tra quyền ghi âm của trình duyệt.",
      );
    }
  }

  function stopRecording() {
    if (!recorderRef.current) return;

    recorderRef.current.stop();
    setRecording(false);
  }

  function resetRecording() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setAudioUrl(initialAudioUrl || null);
    setAudioBlob(null);
    setSaved(Boolean(initialAudioUrl));
    chunksRef.current = [];
  }

  async function saveRecording() {
    if (!audioBlob) {
      toast.error("Bạn chưa có bản ghi âm mới để lưu.");
      return;
    }

    setSaving(true);

    try {
      const mimeType = audioBlob.type || "audio/webm";
      const extension = getExtensionFromMimeType(mimeType);

      const file = new File(
        [audioBlob],
        `${attemptId}-${speakingPart.toLowerCase()}-${Date.now()}.${extension}`,
        { type: mimeType },
      );

      const uploadedRaw = await uploadToCloudinary({
        folder: "speaking-audio",
        file,
      });

      const { audioUrl: uploadedAudioUrl, audioFileKey } =
        normalizeUploadedResponse(uploadedRaw);

      if (!uploadedAudioUrl) {
        throw new Error(
          "Upload audio thành công nhưng không nhận được link audio.",
        );
      }

      if (!audioFileKey) {
        throw new Error(
          "Upload audio thành công nhưng không nhận được mã file audio.",
        );
      }

      await updateOneSpeakingResponse(attemptId, speakingPart, {
        audioUrl: uploadedAudioUrl,
        audioFileKey,
        audioMimeType: mimeType,
        audioSizeBytes: file.size,
      });

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }

      setAudioUrl(uploadedAudioUrl);
      setAudioBlob(null);
      setSaved(true);

      toast.success(`Đã lưu câu trả lời ${displayLabel}.`);
      onSaved?.();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Không thể lưu bản ghi Speaking.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_24px_80px_rgba(14,165,233,0.12)] backdrop-blur-2xl">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-sm">
          <Mic className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="font-serif text-2xl font-bold text-slate-950">
            Ghi âm câu trả lời
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            Ghi âm cho {displayLabel}. Sau khi dừng, hãy nghe lại và bấm lưu.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {!recording ? (
              <Button
                type="button"
                onClick={startRecording}
                disabled={disabled || saving}
              >
                <Radio className="h-4 w-4" />
                {saved && audioUrl ? "Ghi lại câu trả lời" : "Bắt đầu ghi"}
              </Button>
            ) : (
              <Button type="button" onClick={stopRecording} variant="secondary">
                <Square className="h-4 w-4" />
                Dừng ghi
              </Button>
            )}

            {audioUrl && !saved ? (
              <>
                <Button
                  type="button"
                  onClick={saveRecording}
                  disabled={disabled || saving}
                  variant="secondary"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? "Đang lưu..." : "Lưu câu trả lời"}
                </Button>

                <Button
                  type="button"
                  onClick={resetRecording}
                  disabled={saving}
                  variant="outline"
                >
                  Hủy bản ghi mới
                </Button>
              </>
            ) : null}
          </div>

          {audioUrl ? (
            <div className="mt-5 rounded-[26px] border border-cyan-100 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
              <p className="mb-3 text-sm font-semibold text-slate-950">
                {saved ? "Bản ghi đã lưu" : "Nghe lại bản ghi mới"}
              </p>
              <AudioPreview audioUrl={audioUrl} />
            </div>
          ) : null}

          {saved && audioUrl ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50/80 px-3 py-2 text-sm font-semibold text-cyan-700">
              <CheckCircle2 className="h-4 w-4" />
              Câu trả lời {displayLabel} đã được lưu. Bạn vẫn có thể ghi lại nếu
              muốn.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
