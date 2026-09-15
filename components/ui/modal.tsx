"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
    }
    if (!open && node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="w-[min(100%-2rem,32rem)] rounded-[var(--radius-lg)] border border-border bg-surface p-0 text-ink shadow-[var(--shadow-card)] backdrop:bg-navy/40"
      onClose={onClose}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="font-display text-xl text-navy">{title}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  );
}
