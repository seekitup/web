import { memo } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export type GhostAddCardVariant = "row" | "grid" | "complete";
export type GhostAddCardType = "link" | "collection";

interface GhostAddCardProps {
  variant: GhostAddCardVariant;
  type: GhostAddCardType;
  label: string;
  caption?: string | undefined;
  onClick: () => void;
  className?: string | undefined;
}

const BASE = [
  "group relative w-full text-left cursor-pointer",
  "border border-dashed border-neutral-700/80 bg-white/[0.02]",
  "text-text-dim transition-all duration-200",
  "hover:border-primary/60 hover:bg-primary/5 hover:text-primary",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
].join(" ");

/**
 * Dashed-border "+" card that opens the create flow. Adapts to the active
 * results view density (row / grid tile / complete card) and to the entity
 * type (link or collection — only changes the icon and the default caption).
 */
export const GhostAddCard = memo<GhostAddCardProps>(function GhostAddCard({
  variant,
  type,
  label,
  caption,
  onClick,
  className,
}) {
  if (variant === "row") {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          BASE,
          "flex items-center gap-3 rounded-xl px-3 py-3",
          "hover:scale-[1.005]",
          className,
        )}
      >
        <span
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            "bg-primary/10 text-primary transition-colors",
            "group-hover:bg-primary/20",
          )}
        >
          <PlusIcon />
        </span>
        <span className="flex flex-col min-w-0">
          <span className="text-[14px] font-semibold leading-snug text-text group-hover:text-primary transition-colors">
            {label}
          </span>
          {caption ? (
            <span className="text-[12px] leading-snug text-text-dim/80 group-hover:text-primary/80 transition-colors line-clamp-1">
              {caption}
            </span>
          ) : null}
        </span>
        <span className="ml-auto text-text-dim/60 group-hover:text-primary transition-colors">
          <ArrowIcon />
        </span>
      </motion.button>
    );
  }

  if (variant === "grid") {
    const height = type === "collection" ? "h-[110px]" : "h-[90px]";
    return (
      <motion.button
        type="button"
        onClick={onClick}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          BASE,
          "flex flex-col items-center justify-center gap-1.5 rounded-xl",
          height,
          "hover:scale-[1.01]",
          className,
        )}
      >
        <span
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-full",
            "bg-primary/10 text-primary transition-colors",
            "group-hover:bg-primary/20",
          )}
        >
          <PlusIcon />
        </span>
        <span className="text-[13px] font-semibold text-text group-hover:text-primary transition-colors">
          {label}
        </span>
      </motion.button>
    );
  }

  // complete
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={clsx(
        BASE,
        "flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl p-8",
        "hover:scale-[1.005]",
        className,
      )}
    >
      <span
        className={clsx(
          "flex h-14 w-14 items-center justify-center rounded-full",
          "bg-primary/10 text-primary transition-colors",
          "group-hover:bg-primary/20",
        )}
      >
        <PlusIcon size={26} />
      </span>
      <span className="text-[16px] font-semibold text-text group-hover:text-primary transition-colors">
        {label}
      </span>
      {caption ? (
        <span className="max-w-md text-center text-[13px] leading-snug text-text-dim/80 group-hover:text-primary/80 transition-colors">
          {caption}
        </span>
      ) : null}
    </motion.button>
  );
});

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
