import { FileUploader, type FileUploaderProps } from "./FileUploader";

export function AudioUploader(
  props: Omit<FileUploaderProps, "accept" | "buttonLabel">,
) {
  return (
    <FileUploader
      accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg"
      buttonLabel="Chọn audio"
      {...props}
    />
  );
}
