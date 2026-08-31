import { useEffect, useRef, type ReactNode } from "react";

interface ConfirmDialogProps {
  readonly title: string;
  readonly children: ReactNode;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = `dialog-${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      returnFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id={titleId}>{title}</h2>
      {children}
      <div className="dialog-actions">
        <button onClick={onCancel}>{cancelLabel}</button>
        <button className="primary-button" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </dialog>
  );
}
