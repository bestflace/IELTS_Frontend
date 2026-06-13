"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Highlighter, StickyNote, Trash2, X } from "lucide-react";

type Props = {
  storageKey: string;
  targetRef?: RefObject<HTMLElement | null>;
  title?: string;
};

type AnnotationColor = "yellow" | "green" | "pink";

type FloatingPosition = {
  top: number;
  left: number;
};

type Annotation = {
  id: string;
  start: number;
  end: number;
  selectedText: string;
  color?: AnnotationColor;
  note?: string;
  createdAt: string;
};

const COLOR_OPTIONS: Array<{
  label: string;
  key: AnnotationColor;
  className: string;
  cssColor: string;
}> = [
  {
    label: "Vàng",
    key: "yellow",
    className: "bg-[#fff2a8]",
    cssColor: "#fff2a8",
  },
  {
    label: "Xanh",
    key: "green",
    className: "bg-[#cfe8d5]",
    cssColor: "#cfe8d5",
  },
  {
    label: "Hồng",
    key: "pink",
    className: "bg-[#ffd7d7]",
    cssColor: "#ffd7d7",
  },
];

function getStorageKey(storageKey: string) {
  return `${storageKey}:annotations:v4`;
}

function getLegacyKeys(storageKey: string) {
  return [
    `${storageKey}:html`,
    `${storageKey}:notes`,
    `${storageKey}:annotations`,
    `${storageKey}:annotations:v2`,
    `${storageKey}:annotations:v3`,
  ];
}

function makeSafeName(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "-");
}

function getHighlightName(storageKey: string, color: AnnotationColor) {
  return `ieltsbf-${makeSafeName(storageKey)}-${color}`;
}

function getCssHighlights() {
  const cssApi = (globalThis as any).CSS;
  return cssApi?.highlights || null;
}

function getHighlightConstructor() {
  return (globalThis as any).Highlight || null;
}

function isCssHighlightSupported() {
  return Boolean(getCssHighlights() && getHighlightConstructor());
}

function loadAnnotations(storageKey: string): Annotation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(storageKey));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAnnotations(storageKey: string, annotations: Annotation[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    getStorageKey(storageKey),
    JSON.stringify(annotations),
  );
}

function removeLegacyBrokenStorage(storageKey: string) {
  if (typeof window === "undefined") return;

  getLegacyKeys(storageKey).forEach((key) => {
    window.localStorage.removeItem(key);
  });
}

function isTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE;
}

function collectTextNodes(target: HTMLElement) {
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const nodes: Array<{ node: Text; start: number; end: number }> = [];

  let current = walker.nextNode();
  let offset = 0;

  while (current) {
    if (isTextNode(current)) {
      const text = current.nodeValue || "";
      const length = text.length;

      nodes.push({
        node: current,
        start: offset,
        end: offset + length,
      });

      offset += length;
    }

    current = walker.nextNode();
  }

  return nodes;
}

function getTextLength(target: HTMLElement) {
  return target.textContent?.length || 0;
}

function createRangeFromOffsets(
  target: HTMLElement,
  startOffset: number,
  endOffset: number,
) {
  const totalLength = getTextLength(target);
  const start = Math.max(0, Math.min(startOffset, totalLength));
  const end = Math.max(start, Math.min(endOffset, totalLength));

  if (start >= end) return null;

  const textNodes = collectTextNodes(target);

  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let localStart = 0;
  let localEnd = 0;

  for (const item of textNodes) {
    if (!startNode && start >= item.start && start <= item.end) {
      startNode = item.node;
      localStart = start - item.start;
    }

    if (!endNode && end >= item.start && end <= item.end) {
      endNode = item.node;
      localEnd = end - item.start;
    }

    if (startNode && endNode) break;
  }

  if (!startNode || !endNode) return null;

  try {
    const range = document.createRange();
    range.setStart(startNode, localStart);
    range.setEnd(endNode, localEnd);
    return range;
  } catch {
    return null;
  }
}

function getSelectionInfo(target?: HTMLElement | null) {
  if (!target) return null;

  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return null;
  }

  const range = selection.getRangeAt(0);

  if (
    !target.contains(range.startContainer) ||
    !target.contains(range.endContainer)
  ) {
    return null;
  }

  const selectedTextRaw = selection.toString();

  if (!selectedTextRaw.trim()) return null;

  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(target);
  beforeRange.setEnd(range.startContainer, range.startOffset);

  const start = beforeRange.toString().length;
  const end = start + selectedTextRaw.length;

  beforeRange.detach?.();

  const rects = Array.from(range.getClientRects()).filter(
    (rect) => rect.width > 0 && rect.height > 0,
  );

  const rect = rects[0] || range.getBoundingClientRect();

  if (!rect || rect.width === 0 || rect.height === 0) return null;

  return {
    start,
    end,
    selectedText: selectedTextRaw.trim(),
    range: range.cloneRange(),
    position: {
      top: Math.max(12, rect.top - 58),
      left: Math.min(window.innerWidth - 300, Math.max(12, rect.left)),
    },
  };
}

function clearRenderedHighlights(storageKey: string) {
  const highlights = getCssHighlights();
  if (!highlights) return;

  COLOR_OPTIONS.forEach((color) => {
    highlights.delete(getHighlightName(storageKey, color.key));
  });
}

function injectStylesForStorageKey(storageKey: string) {
  if (typeof document === "undefined") return;

  const styleId = `ieltsbf-highlight-style-${makeSafeName(storageKey)}`;
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;

  style.innerHTML = COLOR_OPTIONS.map((color) => {
    const name = getHighlightName(storageKey, color.key);

    return `
      ::highlight(${name}) {
        background-color: ${color.cssColor};
        color: inherit;
      }
    `;
  }).join("\n");

  document.head.appendChild(style);
}

function renderHighlights(
  storageKey: string,
  target: HTMLElement | null | undefined,
  annotations: Annotation[],
  liveRanges: Record<string, Range>,
) {
  if (!target) return;

  const highlights = getCssHighlights();
  const HighlightConstructor = getHighlightConstructor();

  if (!highlights || !HighlightConstructor) return;

  clearRenderedHighlights(storageKey);

  COLOR_OPTIONS.forEach((color) => {
    const ranges = annotations
      .filter((item) => item.color === color.key)
      .map((item) => {
        if (liveRanges[item.id]) {
          return liveRanges[item.id];
        }

        return createRangeFromOffsets(target, item.start, item.end);
      })
      .filter(Boolean);

    if (!ranges.length) return;

    const highlight = new HighlightConstructor(...ranges);
    highlights.set(getHighlightName(storageKey, color.key), highlight);
  });
}

function getNotes(annotations: Annotation[]) {
  return annotations.filter((item) => item.note?.trim());
}

export function AnnotationToolbar({
  storageKey,
  targetRef,
  title = "Ghi chú của bạn",
}: Props) {
  const supported = useMemo(() => isCssHighlightSupported(), []);

  const liveRangesRef = useRef<Record<string, Range>>({});
  const selectedRangeRef = useRef<Range | null>(null);
  const suppressUntilRef = useRef(0);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [position, setPosition] = useState<FloatingPosition | null>(null);
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
    selectedText: string;
  } | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const notes = getNotes(annotations);

  function closeToolbar(clearSelection = true) {
    suppressUntilRef.current = Date.now() + 250;

    setPosition(null);
    setSelection(null);
    setNoteOpen(false);

    selectedRangeRef.current = null;

    if (clearSelection) {
      window.getSelection()?.removeAllRanges();
    }
  }

  useEffect(() => {
    injectStylesForStorageKey(storageKey);
    removeLegacyBrokenStorage(storageKey);

    const saved = loadAnnotations(storageKey);
    setAnnotations(saved);

    const frame = window.requestAnimationFrame(() => {
      renderHighlights(
        storageKey,
        targetRef?.current,
        saved,
        liveRangesRef.current,
      );
    });

    return () => {
      window.cancelAnimationFrame(frame);
      clearRenderedHighlights(storageKey);
      liveRangesRef.current = {};
      selectedRangeRef.current = null;
    };
  }, [storageKey, targetRef]);

  useEffect(() => {
    function showToolbar() {
      window.setTimeout(() => {
        if (Date.now() < suppressUntilRef.current) return;

        const info = getSelectionInfo(targetRef?.current);

        if (!info) {
          setPosition(null);
          setSelection(null);
          selectedRangeRef.current = null;
          setNoteOpen(false);
          return;
        }

        selectedRangeRef.current = info.range;

        setPosition(info.position);
        setSelection({
          start: info.start,
          end: info.end,
          selectedText: info.selectedText,
        });
      }, 30);
    }

    function hideWhenClickOutside(event: MouseEvent) {
      const element = event.target as HTMLElement | null;

      if (element?.closest("[data-annotation-toolbar='true']")) {
        return;
      }

      const info = getSelectionInfo(targetRef?.current);

      if (!info) {
        closeToolbar(false);
      }
    }

    document.addEventListener("mouseup", showToolbar);
    document.addEventListener("keyup", showToolbar);
    document.addEventListener("mousedown", hideWhenClickOutside);

    return () => {
      document.removeEventListener("mouseup", showToolbar);
      document.removeEventListener("keyup", showToolbar);
      document.removeEventListener("mousedown", hideWhenClickOutside);
    };
  }, [targetRef]);

  function updateAnnotations(next: Annotation[]) {
    setAnnotations(next);
    saveAnnotations(storageKey, next);
    renderHighlights(
      storageKey,
      targetRef?.current,
      next,
      liveRangesRef.current,
    );
  }

  function applyColor(color: AnnotationColor) {
    if (!selection) return;

    if (!supported) {
      setNoteOpen(true);
      return;
    }

    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const liveRange = selectedRangeRef.current?.cloneRange();

    if (liveRange) {
      liveRangesRef.current[id] = liveRange;
    }

    const next: Annotation[] = [
      ...annotations,
      {
        id,
        start: selection.start,
        end: selection.end,
        selectedText: selection.selectedText,
        color,
        createdAt: new Date().toISOString(),
      },
    ];

    updateAnnotations(next);
    closeToolbar(true);
  }

  function saveNote() {
    if (!selection) return;

    const note = noteDraft.trim();
    if (!note) return;

    const next: Annotation[] = [
      ...annotations,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        start: selection.start,
        end: selection.end,
        selectedText: selection.selectedText,
        note,
        createdAt: new Date().toISOString(),
      },
    ];

    updateAnnotations(next);

    setNoteDraft("");
    closeToolbar(true);
  }

  function clearAll() {
    clearRenderedHighlights(storageKey);
    liveRangesRef.current = {};

    saveAnnotations(storageKey, []);
    setAnnotations([]);

    setNoteDraft("");
    closeToolbar(true);
  }

  return (
    <>
      {position && selection ? (
        <div
          data-annotation-toolbar="true"
          className="fixed z-[90] w-[300px] rounded-[26px] border border-white/70 bg-white/95 p-3 shadow-[0_24px_80px_rgba(14,165,233,0.18)] ring-1 ring-cyan-100/70 backdrop-blur-2xl"
          style={{
            top: position.top,
            left: position.left,
          }}
          onMouseDown={(event) => event.preventDefault()}
        >
          <div className="flex items-center justify-between gap-2 border-b border-cyan-100/80 pb-2">
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-[.14em] text-cyan-700">
              <Highlighter className="h-3.5 w-3.5" />
              Highlight / Note
            </div>

            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                closeToolbar(true);
              }}
              className="rounded-xl p-1.5 text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
              aria-label="Đóng"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-2 line-clamp-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-xs italic leading-5 text-slate-500">
            “{selection.selectedText}”
          </p>

          {supported ? (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    applyColor(item.key);
                  }}
                  className={[
                    "rounded-2xl border border-cyan-100 px-2 py-2 text-xs font-black text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300",
                    item.className,
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs leading-5 text-amber-800">
              Trình duyệt này chưa hỗ trợ highlight ổn định. Bạn vẫn có thể dùng
              note.
            </div>
          )}

          <button
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setNoteOpen((value) => !value);
            }}
            className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-2xl border border-cyan-100 bg-white/80 px-2 py-2 text-xs font-black text-cyan-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
          >
            <StickyNote className="h-3.5 w-3.5" />
            Thêm note
          </button>

          {noteOpen ? (
            <div className="mt-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-2">
              <textarea
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                placeholder="Ghi chú cho đoạn đã bôi..."
                className="min-h-20 w-full resize-none rounded-2xl border border-cyan-100 bg-white/90 px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100/70"
              />

              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  saveNote();
                }}
                disabled={!noteDraft.trim()}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-2 text-sm font-black text-white shadow-[0_14px_30px_rgba(14,165,233,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(37,99,235,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Lưu note
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {notes.length ? (
        <div className="mt-5 rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_55px_rgba(14,165,233,0.10)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-700">
              <StickyNote className="h-4 w-4" />
              {title}
            </p>

            <button
              type="button"
              onClick={clearAll}
              className="inline-flex items-center gap-1 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 transition hover:border-rose-300 hover:bg-rose-100/70"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-cyan-100 bg-cyan-50/70 px-3 py-2"
              >
                <p className="line-clamp-2 text-xs italic leading-5 text-slate-500">
                  “{note.selectedText}”
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-950">
                  {note.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
