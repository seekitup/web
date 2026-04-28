import clsx from "clsx";
import { useTranslation } from "react-i18next";

type Visibility = "public" | "private" | (string & {});

interface VisibilityChipProps {
  visibility: Visibility;
  /** When true, treats the collection as "shared" (you are not the owner). */
  isShared?: boolean;
  className?: string;
}

/**
 * Compact visibility indicator. Three states: Public (globe), Shared
 * (people), Private (lock). The Shared state takes precedence visually since
 * it tells the viewer something more meaningful than "Public".
 */
export function VisibilityChip({
  visibility,
  isShared = false,
  className,
}: VisibilityChipProps) {
  const { t } = useTranslation();
  const isPrivate = visibility === "private";

  const tone = isPrivate
    ? "text-amber-300 bg-amber-500/10 ring-amber-500/20"
    : isShared
      ? "text-primary bg-primary/10 ring-primary/20"
      : "text-text-dim bg-white/[0.04] ring-white/[0.06]";

  const label = isPrivate
    ? t("visibility.private")
    : isShared
      ? t("visibility.shared")
      : t("visibility.public");

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        tone,
        className,
      )}
    >
      <Icon kind={isPrivate ? "private" : isShared ? "shared" : "public"} />
      {label}
    </span>
  );
}

function Icon({ kind }: { kind: "private" | "shared" | "public" }) {
  const props = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (kind === "private") {
    return (
      <svg {...props}>
        <rect x="4" y="11" width="16" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }
  if (kind === "shared") {
    return (
      <svg {...props}>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 19c.6-3 3.4-5 6.5-5s5.9 2 6.5 5" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M21.5 17c-.5-2-2.2-3.5-4.5-3.5" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
