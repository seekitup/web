import type { ReactNode } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { Modal } from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** Body content. String or ReactNode (e.g. for chips, lists, etc.). */
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual tone of the confirm button. */
  tone?: "danger" | "primary";
  /** Disables both buttons and shows a busy state on the confirm. */
  isPending?: boolean;
}

/**
 * Generic destructive-action confirmation. Built on the existing responsive
 * Modal so it auto-renders as a draggable bottom sheet on mobile and a
 * centered dialog on desktop.
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  isPending = false,
}: ConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      stacked
      dismissOnBackdrop={!isPending}
      dismissOnEscape={!isPending}
    >
      <div className="px-5 pb-5 pt-1">
        <div className="text-sm text-text-dim leading-relaxed">{message}</div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2.5 rounded-full text-sm font-semibold text-text-dim hover:bg-white/[0.06] hover:text-text transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel ?? t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={clsx(
              "px-4 py-2.5 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer",
              tone === "danger" &&
                "bg-danger/15 text-danger hover:bg-danger/25 ring-1 ring-danger/30",
              tone === "primary" &&
                "bg-primary text-background hover:brightness-110",
            )}
          >
            {isPending
              ? t("common.loading")
              : (confirmLabel ?? t("common.confirm"))}
          </button>
        </div>
      </div>
    </Modal>
  );
}
