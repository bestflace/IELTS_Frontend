import { FileUploader, type FileUploaderProps } from "./FileUploader";

export function ImageUploader(
  props: Omit<FileUploaderProps, "accept" | "buttonLabel">,
) {
  return (
    <FileUploader
      accept="image/*,.png,.jpg,.jpeg,.webp,.gif"
      buttonLabel="Chọn ảnh"
      {...props}
    />
  );
}
