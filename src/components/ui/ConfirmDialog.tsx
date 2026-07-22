"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  danger = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      onClose={onCancel}
      className="m-auto w-[90vw] max-w-sm rounded-2xl border border-border bg-bg p-5 backdrop:bg-black/30"
    >
      <p className="text-base font-medium text-text">{title}</p>
      {description && <p className="mt-1.5 text-sm text-text-muted">{description}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-full px-4 text-sm font-medium text-text-muted"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={clsx(
            "h-10 rounded-full px-4 text-sm font-medium text-white",
            danger ? "bg-danger" : "bg-accent"
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
