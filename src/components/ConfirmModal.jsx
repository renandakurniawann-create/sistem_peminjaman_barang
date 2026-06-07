import { X } from "lucide-react";
import Button from "./Button.jsx";

export default function ConfirmModal({
  cancelText = "Batal",
  children,
  confirmText = "Ya, lanjutkan",
  danger = false,
  loading = false,
  onClose,
  onConfirm,
  open,
  title,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-md rounded-lg bg-white shadow-soft">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">{title}</h2>
            {children ? (
              <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
            ) : null}
          </div>
          <button
            aria-label="Tutup modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex justify-end gap-3 px-5 py-4">
          <Button onClick={onClose} variant="secondary">
            {cancelText}
          </Button>
          <Button
            loading={loading}
            onClick={onConfirm}
            variant={danger ? "danger" : "primary"}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
