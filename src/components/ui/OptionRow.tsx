import type { ReactNode, MouseEventHandler } from "react";
import clsx from "clsx";

interface OptionRowProps {
  icon: ReactNode;
  label: string;
  description?: string | undefined;
  onClick: MouseEventHandler<HTMLButtonElement>;
  loading?: boolean;
  disabled?: boolean;
  /** Visual tone. `danger` paints the icon + label red. */
  tone?: "default" | "danger";
}

/**
 * One row in an options modal — flush-edge button with a leading icon, label,
 * and optional description. Mirrors the dense, calm aesthetic of the existing
 * Modal surfaces (no hard borders, hover overlay).
 */
export function OptionRow({
  icon,
  label,
  description,
  onClick,
  loading = false,
  disabled = false,
  tone = "default",
}: OptionRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "group w-full flex items-center gap-3.5 px-5 py-3.5 text-left",
        "transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        "hover:bg-white/[0.04] focus-visible:bg-white/[0.06] focus-visible:outline-none",
        tone === "danger" ? "text-danger" : "text-text",
      )}
    >
      <span
        className={clsx(
          "shrink-0 flex h-9 w-9 items-center justify-center rounded-full",
          tone === "danger"
            ? "bg-danger/10 text-danger"
            : "bg-white/[0.05] text-text-dim group-hover:text-text",
        )}
        aria-hidden
      >
        {loading ? (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          icon
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-tight">
          {label}
        </span>
        {description ? (
          <span
            className={clsx(
              "block text-[12px] leading-tight mt-0.5",
              tone === "danger" ? "text-danger/70" : "text-text-dim",
            )}
          >
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
