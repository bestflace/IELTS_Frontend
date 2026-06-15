"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bold,
  Calendar,
  Heading1,
  Heading2,
  ImagePlus,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Save,
  Send,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { ErrorState } from "@/components/common/States";
import { createBlog, updateBlog } from "@/lib/api/blogs.api";
import { getTags } from "@/lib/api/tags.api";
import { uploadToCloudinary } from "@/lib/api/uploads.api";
import { getErrorMessage } from "@/lib/api/client";
import type { Blog, PublishStatus, Tag } from "@/types";

type Props = {
  mode: "create" | "edit";
  initialData?: Blog;
  onSaved?: (blog: Blog) => void;
};

function slugPreview(title: string, currentSlug?: string) {
  if (currentSlug) return currentSlug;

  return (
    title
      .trim()
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "my-new-post-title"
  );
}

function insertMarkdown(
  content: string,
  setContent: (value: string) => void,
  before: string,
  after = "",
) {
  setContent(`${content}${content ? "\n" : ""}${before}${after}`);
}

export function BlogEditor({ mode, initialData, onSaved }: Props) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [contentMarkdown, setContentMarkdown] = useState(
    initialData?.contentMarkdown || "",
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    initialData?.coverImageUrl || "",
  );
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    initialData?.tags?.map((tag) => tag.id) || [],
  );

  const [tags, setTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const previewSlug = useMemo(
    () => slugPreview(title, initialData?.slug ?? undefined),
    [title, initialData?.slug],
  );

  useEffect(() => {
    let mounted = true;

    getTags()
      .then((data) => {
        if (mounted) setTags(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (mounted) setTags([]);
      })
      .finally(() => {
        if (mounted) setLoadingTags(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  };

  const validate = () => {
    if (!title.trim()) return "Vui lòng nhập tiêu đề bài viết.";
    if (!contentMarkdown.trim()) return "Vui lòng nhập nội dung bài viết.";
    if (coverImageUrl.trim()) {
      try {
        new URL(coverImageUrl.trim());
      } catch {
        return "Featured image URL không hợp lệ.";
      }
    }

    return "";
  };
  const focusEditor = () => {
    requestAnimationFrame(() => {
      contentRef.current?.focus();
    });
  };

  const replaceSelectedText = (
    formatter: (selectedText: string) => string,
    fallbackText: string,
  ) => {
    const editor = contentRef.current;

    if (!editor) {
      setContentMarkdown(
        (current) =>
          `${current}${current ? "\n" : ""}${formatter(fallbackText)}`,
      );
      return;
    }

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = contentMarkdown.slice(start, end) || fallbackText;
    const replacement = formatter(selectedText);

    const nextValue =
      contentMarkdown.slice(0, start) +
      replacement +
      contentMarkdown.slice(end);

    setContentMarkdown(nextValue);

    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start, start + replacement.length);
    });
  };

  const insertBlock = (text: string) => {
    const editor = contentRef.current;

    if (!editor) {
      setContentMarkdown(
        (current) => `${current}${current ? "\n" : ""}${text}`,
      );
      return;
    }

    const start = editor.selectionStart;
    const nextValue =
      contentMarkdown.slice(0, start) +
      `${contentMarkdown.slice(0, start).endsWith("\n") || start === 0 ? "" : "\n"}${text}` +
      contentMarkdown.slice(start);

    setContentMarkdown(nextValue);

    requestAnimationFrame(() => {
      editor.focus();
      const cursor = start + text.length + 1;
      editor.setSelectionRange(cursor, cursor);
    });
  };

  const prefixCurrentLine = (prefix: string) => {
    const editor = contentRef.current;

    if (!editor) {
      setContentMarkdown(
        (current) => `${current}${current ? "\n" : ""}${prefix}`,
      );
      return;
    }

    const cursor = editor.selectionStart;
    const lineStart = contentMarkdown.lastIndexOf("\n", cursor - 1) + 1;

    const nextValue =
      contentMarkdown.slice(0, lineStart) +
      prefix +
      contentMarkdown.slice(lineStart);

    setContentMarkdown(nextValue);

    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(cursor + prefix.length, cursor + prefix.length);
    });
  };

  const handleInlineImageUpload = async (file: File | null) => {
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const uploaded = await uploadToCloudinary({
        file,
        folder: "blogs",
      });

      const imageMarkdown = `![Ảnh minh họa](${uploaded.fileUrl})`;

      insertBlock(imageMarkdown);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingImage(false);

      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = "";
      }
    }
  };
  const buildPayload = (status?: PublishStatus) => ({
    title: title.trim(),
    excerpt: excerpt.trim() || null,
    contentMarkdown: contentMarkdown.trim(),
    coverImageUrl: coverImageUrl.trim() || null,
    tagIds: selectedTagIds,
    ...(status ? { status } : {}),
  });

  const saveBlog = async (status?: PublishStatus) => {
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return null;
    }

    setError("");

    const payload = buildPayload(status);

    if (mode === "create") {
      const created = await createBlog(payload);
      return created;
    }

    if (!initialData?.id) {
      throw new Error("Không tìm thấy bài viết để cập nhật.");
    }

    const updated = await updateBlog(initialData.id, payload);
    return updated;
  };

  const handleSaveDraft = async (event?: FormEvent) => {
    event?.preventDefault();

    setSaving(true);

    try {
      const saved = await saveBlog("DRAFT");
      if (!saved) return;

      if (mode === "create") {
        router.push(`/admin/blogs/${saved.id}`);
        return;
      }

      onSaved?.(saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);

    try {
      const saved = await saveBlog("PUBLISHED");
      if (!saved) return;

      if (mode === "create") {
        router.push(`/admin/blogs/${saved.id}`);
        return;
      }

      onSaved?.(saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const uploaded = await uploadToCloudinary({
        file,
        folder: "blogs",
      });

      setCoverImageUrl(uploaded.fileUrl);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <form
      onSubmit={handleSaveDraft}
      className="grid gap-5 xl:grid-cols-[1fr_360px]"
    >
      <main className="space-y-5">
        {error ? <ErrorState message={error} /> : null}

        <Card className="min-h-[720px]">
          <CardContent className="p-7">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className="h-auto border-0 bg-transparent px-0 font-serif text-5xl font-bold text-ink shadow-none outline-none placeholder:text-neutralText/40 focus:border-0 focus:ring-0"
            />

            <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-line pb-5 text-sm text-ink">
              <button
                type="button"
                title="In đậm"
                onClick={() =>
                  replaceSelectedText((text) => `**${text}**`, "chữ in đậm")
                }
                className="rounded-lg p-2 transition hover:bg-cream"
              >
                <Bold className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="In nghiêng"
                onClick={() =>
                  replaceSelectedText((text) => `*${text}*`, "chữ in nghiêng")
                }
                className="rounded-lg p-2 transition hover:bg-cream"
              >
                <Italic className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Heading 1"
                onClick={() => prefixCurrentLine("# ")}
                className="rounded-lg p-2 transition hover:bg-cream"
              >
                <Heading1 className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Heading 2"
                onClick={() => prefixCurrentLine("## ")}
                className="rounded-lg p-2 transition hover:bg-cream"
              >
                <Heading2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Trích dẫn"
                onClick={() => prefixCurrentLine("> ")}
                className="rounded-lg p-2 transition hover:bg-cream"
              >
                <Quote className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Danh sách"
                onClick={() => prefixCurrentLine("- ")}
                className="rounded-lg p-2 transition hover:bg-cream"
              >
                <List className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Danh sách số"
                onClick={() => prefixCurrentLine("1. ")}
                className="rounded-lg p-2 transition hover:bg-cream"
              >
                <ListOrdered className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Liên kết"
                onClick={() =>
                  replaceSelectedText(
                    (text) => `[${text}](https://example.com)`,
                    "nội dung liên kết",
                  )
                }
                className="rounded-lg p-2 transition hover:bg-cream"
              >
                <LinkIcon className="h-4 w-4" />
              </button>

              <button
                type="button"
                title="Upload ảnh vào nội dung"
                onClick={() => inlineImageInputRef.current?.click()}
                disabled={uploadingImage}
                className="rounded-lg p-2 transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImagePlus className="h-4 w-4" />
              </button>

              <input
                ref={inlineImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  handleInlineImageUpload(event.target.files?.[0] || null)
                }
              />

              {uploadingImage ? (
                <span className="text-xs text-neutralText">
                  Đang upload ảnh...
                </span>
              ) : null}
            </div>

            <textarea
              ref={contentRef}
              value={contentMarkdown}
              onChange={(event) => setContentMarkdown(event.target.value)}
              onFocus={focusEditor}
              placeholder="Bắt đầu viết nội dung tại đây..."
              className="mt-6 min-h-[520px] w-full resize-none border-0 bg-transparent px-0 text-lg leading-8 text-ink shadow-none outline-none placeholder:italic placeholder:text-neutralText/50 focus:border-0 focus:ring-0"
            />
          </CardContent>
        </Card>
      </main>

      <aside className="space-y-5">
        <Card>
          <CardHeader>
            <h2 className="font-serif text-2xl font-bold text-ink">
              Publishing
            </h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-sm text-ink">Status:</span>
              <Badge
                tone={
                  initialData?.status === "PUBLISHED" ? "success" : "warning"
                }
              >
                {initialData?.status || "DRAFT"}
              </Badge>
            </div>

            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-sm text-ink">Visibility:</span>
              <span className="text-sm font-semibold text-ink">Public</span>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-ink">
                Publish Date
              </p>
              <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-3 text-sm text-neutralText">
                <Calendar className="h-4 w-4" />
                Immediately
              </div>
              <p className="mt-2 text-xs leading-5 text-neutralText">
                Hiện chưa hỗ trợ lên lịch, chỉ hỗ trợ Draft và Published.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                variant="outline"
                disabled={saving || publishing}
              >
                <Save className="h-4 w-4" />
                {saving ? "Đang lưu..." : "Save Draft"}
              </Button>

              <Button
                type="button"
                onClick={handlePublish}
                disabled={saving || publishing}
              >
                <Send className="h-4 w-4" />
                {publishing ? "Đang publish..." : "Publish"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-serif text-2xl font-bold text-ink">Metadata</h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <label className="space-y-2 block">
              <span className="text-xs font-bold uppercase tracking-[.18em] text-neutralText">
                URL Slug
              </span>
              <Input value={previewSlug} readOnly />
              <p className="text-xs text-neutralText">
                ieltsbf.com/blog/{previewSlug}
              </p>
            </label>

            <label className="space-y-2 block">
              <span className="text-xs font-bold uppercase tracking-[.18em] text-neutralText">
                Excerpt
              </span>
              <Textarea
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                className="min-h-28"
                placeholder="A brief summary of the article..."
              />
            </label>

            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-[.18em] text-neutralText">
                Tags
              </span>

              {loadingTags ? (
                <div className="rounded-xl border border-dashed border-line bg-paper p-4 text-sm text-neutralText">
                  Đang tải tags...
                </div>
              ) : tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const active = selectedTagIds.includes(tag.id);

                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => toggleTag(tag.id)}
                        className={
                          active
                            ? "rounded-full border border-moss bg-primarySoft px-3 py-1.5 text-xs font-semibold text-moss"
                            : "rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-neutralText transition hover:border-sage hover:text-ink"
                        }
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-line bg-paper p-4 text-sm text-neutralText">
                  Chưa có tag.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-serif text-2xl font-bold text-ink">
              Featured Image
            </h2>
          </CardHeader>

          <CardContent className="space-y-4">
            {coverImageUrl ? (
              <div className="overflow-hidden rounded-2xl border border-line bg-paper">
                <img
                  src={coverImageUrl}
                  alt={title || "Featured image"}
                  className="max-h-[240px] w-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-paper p-8 text-center">
                <ImagePlus className="mx-auto h-8 w-8 text-neutralText" />
                <p className="mt-3 font-semibold text-ink">
                  Click to upload image
                </p>
                <p className="mt-1 text-xs text-neutralText">
                  PNG, JPG up to 5MB
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleImageUpload(event.target.files?.[0] || null)
              }
              className="block w-full rounded-xl border border-line bg-paper px-3 py-2 text-sm text-ink file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />

            <Input
              value={coverImageUrl}
              onChange={(event) => setCoverImageUrl(event.target.value)}
              placeholder="Hoặc dán image URL..."
            />

            {uploadingImage ? (
              <div className="flex items-center gap-2 text-sm text-neutralText">
                <UploadCloud className="h-4 w-4" />
                Đang upload ảnh...
              </div>
            ) : null}
          </CardContent>
        </Card>

        {initialData?.slug && initialData.status === "PUBLISHED" ? (
          <Link href={`/blogs/${initialData.slug}`}>
            <Button variant="outline" className="w-full">
              Xem bài public
            </Button>
          </Link>
        ) : null}
      </aside>
    </form>
  );
}
