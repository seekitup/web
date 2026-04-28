import { memo } from "react";
import clsx from "clsx";

interface HighlightedTextProps {
  text: string;
  highlight?: string | undefined;
  className?: string | undefined;
  /** Tailwind clamp class — e.g. "line-clamp-1" / "line-clamp-2". */
  clamp?: string | undefined;
  /** Inline style override for unusual clamps. */
  style?: React.CSSProperties | undefined;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Renders text with substrings matching `highlight` rendered bold in the
 * primary color. Falls back to plain text when no highlight is provided.
 */
export const HighlightedText = memo<HighlightedTextProps>(function HighlightedText({
  text,
  highlight,
  className,
  clamp,
  style,
}) {
  const trimmed = highlight?.trim();
  if (!trimmed || !text) {
    return (
      <span className={clsx(clamp, className)} style={style}>
        {text}
      </span>
    );
  }

  const regex = new RegExp(`(${escapeRegex(trimmed)})`, "gi");
  const parts = text.split(regex);
  const matchTester = new RegExp(`^${escapeRegex(trimmed)}$`, "i");

  return (
    <span className={clsx(clamp, className)} style={style}>
      {parts.map((part, i) =>
        part && matchTester.test(part) ? (
          <span key={i} className="font-bold text-primary">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
});
