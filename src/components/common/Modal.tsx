"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[30px] border border-white/70 bg-white/95 shadow-[0_30px_90px_rgba(14,165,233,0.18)] backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-cyan-100/80 px-5 py-4">
          <h3 className="font-serif text-xl font-black text-slate-950">
            {title}
          </h3>
          <button
            type="button"
            className="rounded-2xl p-2 text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title = "Xác nhận thao tác",
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm leading-7 text-slate-500">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Xác nhận
        </Button>
      </div>
    </Modal>
  );
}
