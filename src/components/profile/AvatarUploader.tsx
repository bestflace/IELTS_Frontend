"use client";

import { useRef } from "react";
import { Camera, UploadCloud } from "lucide-react";

import { Button } from "@/components/common/Button";
import { uploadToCloudinary } from "@/lib/api/uploads.api";

type Props = {
  value?: string;
  disabled?: boolean;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  setUploading?: (value: boolean) => void;
};

export function AvatarUploader({
  value,
  disabled = false,
  onChange,
  onError,
  setUploading,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      onError("Vui lòng chọn file hình ảnh.");
      return;
    }

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      onError("Ảnh đại diện không được vượt quá 5MB.");
      return;
    }

    setUploading?.(true);

    try {
      const uploaded = await uploadToCloudinary({
        file,
        folder: "avatars",
      });

      onChange(uploaded.fileUrl);
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "Upload ảnh đại diện thất bại.",
      );
    } finally {
      setUploading?.(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="rounded-[26px] border border-cyan-100 bg-white/75 p-4 shadow-sm backdrop-blur-xl">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
        onChange={(event) => handleUpload(event.target.files?.[0] || null)}
      />

      <div className="flex items-center gap-4">
        {value ? (
          <img
            src={value}
            alt="Avatar preview"
            className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-[0_12px_30px_rgba(14,165,233,0.16)]"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-cyan-50 text-cyan-700 shadow-sm">
            <Camera className="h-6 w-6 text-cyan-700" />
          </div>
        )}

        <div className="flex-1">
          <p className="text-sm font-bold text-slate-950">Ảnh đại diện</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Chọn ảnh từ máy để upload lên Cloudinary.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud className="h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  );
}
